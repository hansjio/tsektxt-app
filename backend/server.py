"""Local demo server for the three TsekTxt models. No mock mode, no LLM verdicts.

Run from E:\\repos\\tsektxt-app\\backend:   python -m uvicorn server:app --port 8000

It reuses explain() from tsektxt-model-training/src/interpret.py (Integrated Gradients via Captum only),
so predictions and highlights are exactly what the thesis scripts produce. Models come from
hansjio/tsektxt-* on Hugging Face (or models/<name>/ in the training repo, if present).
Labels are read from model.config.id2label (1 = credible, 0 = not credible).
Probabilities are temperature-scaled with tsektxt-model-training/results/calibration.json (src/calibrate.py, fitted on
the internal validation split) when that file exists; the raw softmax values are returned too. Temperature scaling never
changes the label. Without the file the raw softmax values are shown and the response says so ("calibrated": false).
"""
import os
import re
import sys
import threading
from contextlib import asynccontextmanager
from pathlib import Path

HERE = Path(__file__).resolve().parent
TRAINING = Path(os.environ.get("TSEKTXT_TRAINING_DIR", HERE.parents[1] / "tsektxt-model-training")).resolve()
if not (TRAINING / "src" / "interpret.py").exists():
    raise SystemExit(f"Cannot find {TRAINING / 'src' / 'interpret.py'}. Set TSEKTXT_TRAINING_DIR to the training repo folder.")
sys.path.insert(0, str(TRAINING / "src"))

import interpret  # noqa: E402  (tsektxt-model-training/src/interpret.py)
from calibrate import calibrate_p_credible, load_temperature  # noqa: E402  (tsektxt-model-training/src/calibrate.py)
from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from pydantic import BaseModel, Field  # noqa: E402

DISPLAY = {"roberta-tagalog": "RoBERTa-Tagalog", "mbert": "mBERT", "xlmr": "XLM-RoBERTa"}
MODELS: dict = {}
LOCK = threading.Lock()  # one analysis at a time keeps CPU/RAM predictable


@asynccontextmanager
async def lifespan(_: FastAPI):
    for name in interpret.NAMES:
        MODELS[name] = interpret.load(name)
    print("All models loaded. Demo ready.", file=sys.stderr)
    yield


app = FastAPI(title="TsekTxt local demo", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
                   allow_methods=["*"], allow_headers=["*"])


class Req(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    n_steps: int = Field(default=interpret.DEFAULT_STEPS, ge=10, le=interpret.MAX_STEPS)  # starting steps; explain() doubles until error <= 5%


def aligned_words(text: str, words: list[dict]) -> list[dict]:
    """Every whitespace word of the post, in order, with its IG score (None if cut off by max_length)."""
    out, p = [], 0
    for m in re.finditer(r"\S+", text):
        w = {"word": m.group(), "start": m.start(), "end": m.end(), "attr": None}
        if p < len(words) and words[p]["word"] == m.group():
            w["attr"] = words[p]["attr"]; p += 1
        out.append(w)
    return out


@app.get("/api/health")
def health():
    return {"ok": True, "models_loaded": list(MODELS), "max_length": interpret.MAXLEN, "device": interpret.DEV}


@app.post("/api/analyze")
def analyze(req: Req):
    text = req.text.strip()
    if not text:
        raise HTTPException(400, "Empty text")
    results = []
    with LOCK:
        for name, (tok, model, path) in MODELS.items():
            r = interpret.explain(tok, model, text, n_steps=req.n_steps)  # IG attributions are not affected by T
            T, calibrated = load_temperature(name)
            p_cr = calibrate_p_credible(r["prob_credible"], T) if calibrated else r["prob_credible"]
            results.append({
                "key": name,
                "name": DISPLAY.get(name, name),
                "source": path,
                "label": r["pred_name"],  # credible | not_credible (from id2label)
                "prob_credible": p_cr,
                "prob_not_credible": 1 - p_cr,
                "prob_credible_raw": r["prob_credible"],
                "prob_not_credible_raw": r["prob_not_credible"],
                "calibrated": calibrated,
                "temperature": T,
                "truncated": r["truncated"],
                "words": aligned_words(text, r["words"]),
                "completeness_rel_error": r["completeness"]["rel_error"],
                "ig_steps": r["completeness"]["n_steps"],
                "id2label": {str(k): v for k, v in (model.config.id2label or {}).items()},
            })
    return {"text": text, "max_length": interpret.MAXLEN, "n_steps": req.n_steps, "notes": interpret.NOTES, "models": results}
