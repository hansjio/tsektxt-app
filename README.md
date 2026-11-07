# TsekTxt local demo

Paste one Taglish election post and see three verdicts side by side (RoBERTa-Tagalog, mBERT, XLM-RoBERTa), each with probabilities and word highlights from Integrated Gradients (Captum). Runs on your own computer.

**Research demo, not a fact-checker.** Labels follow the source (fact-checkers / news outlets). The models were each trained once (single seed). The page does not rank the models; RoBERTa-Tagalog vs XLM-R was not significant (McNemar p = 0.55). Highlights show what a model relied on, not proof of misinformation.

## What is in this folder

- `backend/`: small Python server (FastAPI). Loads the 3 models `hansjio/tsektxt-roberta-tagalog`, `hansjio/tsektxt-mbert`, `hansjio/tsektxt-xlmr` from Hugging Face and runs `explain()` from `backend\vendor\src\interpret.py`. Max length 128. Labels come from `model.config.id2label` (1 = credible, 0 = not credible). No mock mode, no Groq/LLM verdicts.
- `frontend/`: the web app (Next.js), the group's taglish-credibility-checker UI wired to the real models:
  - Landing page, checker (editor with inline highlights, result side panel / drawer), dashboard, history, saved, methods, privacy, settings.
  - Results: one card with all three verdicts, highlighted text (switch model with the tabs), key words per model, full three-model comparison, verify-next-steps, feedback notes.
  - History, saved checks and feedback are stored only in your browser (delete in Settings).
  - Removed because they were fake or not part of the thesis: mock results and mock history, Groq/LLaMA explanations, image OCR, .docx "parsing", sign-in (Supabase), the single combined "suspicion score", and the "XLM-R is the primary model" claim.

**Self-contained.** `backend\vendor\` holds exact copies of `interpret.py` and `calibrate.py` (Integrated Gradients only) and `configs\config.yaml` from `tsektxt-model-training`, so the app needs no second repo. It also holds `results\calibration.json` (three fitted temperatures, no weights), so the page shows temperature-scaled percentages with the raw ones next to them. Fallback: if that file is missing, the page shows raw softmax percentages and says "(raw, not calibrated)". Optional: set `TSEKTXT_TRAINING_DIR` to a training repo folder to use its code and results instead.

## New machine: 3 steps (Windows)

1. **Download.** On the GitHub page of this repo click **Code > Download ZIP** (or `git clone`). Right-click the ZIP > **Extract All...** into a short folder such as `C:\tsektxt-app` (long paths deep inside Downloads can break the Python install).
2. **Double-click `start.bat`** in the extracted folder. If Windows says "Windows protected your PC", click **More info > Run anyway**.
   - First run (15 to 25 minutes, needs internet): it finds Python 3.12 or offers to install it, plus Node.js (via winget, or tells you where to download it), creates `.venv`, installs the backend packages (about 1 GB) and the web page packages, then downloads the 3 models (about 1.5 to 2.5 GB, a few minutes).
   - Later runs: about 1 minute (models load from the cache).
3. **Use it.** Two windows open ("TsekTxt backend" and "TsekTxt web page"); leave them open. The browser opens http://localhost:3000/checker when the models are loaded. To stop, close the two windows.

Demo day: `scripts\warmup.ps1` does the same as `start.bat` plus one warm-up analysis (see `DEMO_DAY.md`).

## Setting it up on a new laptop (checklist)

**Before anyone downloads**
- [ ] The latest app code is **pushed** to GitHub (`git push` in `tsektxt-app`). The ZIP only contains what is pushed. Check that the ZIP has `start.bat` and `backend\vendor\` in it.
- [x] The calibration step is done: `backend\vendor\results\calibration.json` is committed (see "Calibrated percentages" below). Fallback: without it the demo still works and shows raw percentages.

**On each laptop (about 20 to 30 minutes the first time, with internet)**
- [ ] 8 GB RAM or more, about 5 GB free disk, charger plugged in.
- [ ] Download the ZIP, then **Extract All** to `C:\tsektxt-app`. Do not run it from inside the ZIP, and avoid a long folder path.
- [ ] Double-click `start.bat`. If it asks "Install Python 3.12 now with winget?" or "Install Node.js LTS now?", press Enter (yes). Windows may ask for permission for Node.js.
- [ ] If it says `STOP: ...`, do what the message says (usually install Python 3.12 or Node.js from the link it shows), then double-click `start.bat` again. It continues where it stopped.
- [ ] Wait for **READY**. The browser opens the checker. Click an **Example** and run one check (10 seconds to a minute).
- [ ] Close everything and double-click `start.bat` again. It should take about 1 minute now. From here on it also works **offline** (models are cached).

**What `start.bat` does, step by step** (the window shows `== 1/5` to `== 5/5`)
1. Python: uses `.venv` if it exists. Otherwise it finds Python 3.12 (or 3.11/3.13), or offers to install it, then creates `.venv` and installs `backend\requirements.txt`. It only reinstalls when that file changes.
2. Node.js 20 or newer (offers to install the LTS version), then `npm install` in `frontend\` (only when `package-lock.json` changes). It creates `frontend\.env.local` if it is missing.
3. Models: downloads `hansjio/tsektxt-roberta-tagalog`, `-mbert` and `-xlmr` into `%USERPROFILE%\.cache\huggingface\hub` if they are not there yet.
4. Opens two windows: "TsekTxt backend" (port 8000) and "TsekTxt web page" (port 3000). If one is already running, it reuses it.
5. Waits for `/api/health` to report 3 models loaded, then opens http://localhost:3000/checker.

**What was tested (2026-11-07, Jio's laptop)**
- The backend ran from a fresh copy of the app with no training repo next to it: `/api/health` reported 3 models from the vendor copy, and one analysis took about 10 seconds on CPU.
- `start.bat` on an existing setup went through steps 1 to 5 to READY, and the checker page loaded.
- **Not tested yet:** a first run on a laptop with no Python and no Node.js. That is the main thing to confirm tomorrow.

**Known messages you can ignore**
- "Windows protected your PC" on the first double-click: **More info > Run anyway**.
- A warning about an "incorrect regex pattern" when the XLM-R tokenizer loads. It comes from the transformers library and the app still works.
- "(raw, not calibrated)" next to the percentages: fallback only, meaning `backend\vendor\results\calibration.json` is missing (restore it with `py -3.12 scripts\sync_vendor.py`; see below).

## How we can demo the models

| Option | Needs | Use it for |
|---|---|---|
| This app (`start.bat`) | A Windows laptop set up as above; works offline after the first run | The main live demo: paste a post and see the 3 verdicts with IG highlights |
| Colab notebook `tsektxt-model-training/notebooks/colab_present.ipynb` | A browser, a Google account, internet (T4 GPU) | Backup: results, figures and a live prediction when the app cannot run |
| Screen recording of one full run | Nothing | Last resort when there is no internet and the laptop fails |

A Hugging Face Space (the demo at a public URL, free CPU) was considered and is **not needed**. Colab already covers the "nothing installed" case. A Space would also make the demo public (that needs the group's OK) and would be slower on a free CPU.

## Calibrated percentages (done; steps kept for refitting)

The file is already committed, so no action is needed. Only repeat these steps if the temperatures are refitted.

1. Run `tsektxt-model-training/notebooks/colab_extra.ipynb` in Colab. It writes `results/calibration.json` (one temperature per model, fitted on the internal validation split; the predicted labels do not change).
2. Put that file in `tsektxt-model-training/results/`, then in this app folder run `py -3.12 scripts\sync_vendor.py`. It copies the file to `backend\vendor\results\`.
3. Commit and push the app. From then on every laptop shows calibrated percentages (the raw ones stay visible next to them).

## Requirements

- Windows 10 or 11, 8 GB RAM or more, about 5 GB free disk.
- Python **3.12** (3.14/3.15 do not work: some packages have no wheels yet). `start.bat` installs it if missing.
- Node.js 20 or newer. `start.bat` installs the LTS version if missing.
- Internet on the first run only.

## Run it by hand (PowerShell)

```powershell
cd C:\tsektxt-app
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
cd frontend; npm install; copy .env.example .env.local; cd ..
# window 1
cd backend; ..\.venv\Scripts\python.exe -m uvicorn server:app --port 8000
# window 2
cd frontend; npm run dev
```

Wait for `Demo ready.` in window 1, then open http://localhost:3000/checker, click **Load sample**, then **Check with all three models**. One check takes a few seconds to a minute on a laptop CPU. Integrated Gradients starts at 100 steps and doubles them, up to 800, until the completeness error is 5% or less.

## Keeping the vendored code in sync (maintainers)

After changing `interpret.py`, `calibrate.py` or `config.yaml` in `tsektxt-model-training`, or after `results\calibration.json` is created there:

```powershell
py -3.12 scripts\sync_vendor.py           # copy into backend\vendor, then commit
py -3.12 scripts\sync_vendor.py --check   # exits 1 if backend\vendor differs from the training repo
```

## Troubleshooting

- "Cannot reach the model server": the backend window is not running or has not printed `Demo ready.` yet.
- `start.bat` stops at Python or Node: install the version it names, then double-click `start.bat` again.
- `pip` fails on pyyaml: the `.venv` is not Python 3.12. Delete `.venv` and run `start.bat` again.
- Port 8000 or 3000 busy: close the old TsekTxt windows. To use other ports run `scripts\start.ps1 -BackendPort 8001 -FrontendPort 3001` and set `NEXT_PUBLIC_API_BASE_URL` in `frontend\.env.local` to match.
- Check the server quickly: http://localhost:8000/api/health

## Sources

Frontend derived from https://github.com/Clarkkentooo/taglish-credibility-checker (newest, `main`) and the older copy https://github.com/hansjio/tsektxt-app (branch `groq-API`). Originals were not edited.
