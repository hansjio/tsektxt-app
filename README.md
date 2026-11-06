# TsekTxt local demo

Paste one Taglish election post and see three verdicts side by side (RoBERTa-Tagalog, mBERT, XLM-RoBERTa), each with probabilities and word highlights from Integrated Gradients (Captum). Runs on your own computer.

**Research demo, not a fact-checker.** Labels follow the source (fact-checkers / news outlets). The models were each trained once (single seed). The page does not rank the models; RoBERTa-Tagalog vs XLM-R was not significant (McNemar p = 0.55). Highlights show what a model relied on, not proof of misinformation.

## What is in this folder

- `backend/`: small Python server (FastAPI). Loads the 3 models `hansjio/tsektxt-roberta-tagalog`, `hansjio/tsektxt-mbert`, `hansjio/tsektxt-xlmr` from Hugging Face and reuses `explain()` from `..\tsektxt-model-training\src\interpret.py`. Max length 128. Labels come from `model.config.id2label` (1 = credible, 0 = not credible). No mock mode, no Groq/LLM verdicts.
- `frontend/`: the web app (Next.js), the group's taglish-credibility-checker UI wired to the real models:
  - Landing page, checker (editor with inline highlights, result side panel / drawer), dashboard, history, saved, methods, privacy, settings.
  - Results: one card with all three verdicts, highlighted text (switch model with the tabs), key words per model, full three-model comparison, verify-next-steps, feedback notes.
  - History, saved checks and feedback are stored only in your browser (delete in Settings).
  - Removed because they were fake or not part of the thesis: mock results and mock history, Groq/LLaMA explanations, image OCR, .docx "parsing", sign-in (Supabase), the single combined "suspicion score", and the "XLM-R is the primary model" claim.

The backend needs the folder `E:\repos\tsektxt-model-training` next to this one (it only reads `src\interpret.py` and `configs\config.yaml`). To use another location, set `TSEKTXT_TRAINING_DIR`.

## Requirements (one time)

- Python **3.12** (not 3.15; the default `py` may be 3.15). Check with `py -0`.
- Node.js 20 or newer (`node -v`).
- Internet on the first run (about 1.5 to 2.5 GB of model files are downloaded once and cached).

## Run it (Windows, PowerShell)

**1. Set up Python (one time)**

```powershell
cd E:\repos\tsektxt-app
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

**2. Set up the web page (one time)**

```powershell
cd E:\repos\tsektxt-app\frontend
npm install
copy .env.example .env.local
```

**3. Start the model server (window 1)**

```powershell
cd E:\repos\tsektxt-app\backend
..\.venv\Scripts\python.exe -m uvicorn server:app --port 8000
```

Wait until it prints `Demo ready.` (first time: downloads the models; later: about a minute). Leave this window open.

**4. Start the web page (window 2)**

```powershell
cd E:\repos\tsektxt-app\frontend
npm run dev
```

**5. Open http://localhost:3000/checker**, click **Load sample** (a dummy post written for testing), then **Check with all three models**. It takes a few seconds to a minute on a laptop CPU. Integrated Gradients starts at 100 steps and adds more until its completeness error is at most 5%.

To stop: press Ctrl+C in each window.

## Troubleshooting

- "Cannot reach the model server": window 1 is not running or has not printed `Demo ready.` yet.
- `pip` fails on pyyaml: you are not on Python 3.12. Recreate the venv with `py -3.12`.
- Port busy: change `--port 8000` and set `NEXT_PUBLIC_API_BASE_URL` in `frontend\.env.local` to match.
- Check the server quickly: http://localhost:8000/api/health

## Sources

Frontend derived from https://github.com/Clarkkentooo/taglish-credibility-checker (newest, `main`) and the older copy https://github.com/hansjio/tsektxt-app (branch `groq-API`). Originals were not edited.
