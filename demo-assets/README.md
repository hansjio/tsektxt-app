# TsekTxt demo assets

Screenshots and one screen recording of the local demo app, for group READMEs and the defense slides. **Not for the paper.**

> **Caption to use:** Research demo, not a fact-checker: labels follow the source, short posts lean "not credible", confidence is calibrated on news articles. Illustrative, not evidence of detecting misinformation.

All images use only the app's built-in "Real example posts" (public posts by news outlets and COMELEC, each with a source link in the app). Nothing was typed by hand. All five examples are under 100 words, so every result carries the app's "Low reliability" note and all three models say "not credible". That is the behaviour the caveat describes, not a finding.

## screenshots/ (PNG, 1440 px wide, viewport capture)
| File | Shows / use for |
|---|---|
| `landing.png` | Landing page hero. Title slide, README header. |
| `how-it-works.png` | Landing "Paste, analyze, understand" section. How-it-works slide. |
| `methodology.png` | Methodology page (full page, tall). Methods slide, limits. |
| `privacy.png` | Privacy page (everything runs locally). |
| `dashboard.png` | Dashboard overview, empty (fresh browser, no history). |
| `checker-empty.png` | Checker before any input. |
| `checker-example-10-word.png` | ABS-CBN News, 10 words: three-model result + Low reliability note. Best for the "short posts lean not credible" slide. |
| `checker-example-filipino-16-word.png` | dzBB, Filipino, 16 words. |
| `checker-example-official-notice-23-word.png` | COMELEC notice, 23 words. |
| `checker-example-taglish-46-word.png` | ABS-CBN News, Taglish, 46 words. Main demo shot. |
| `checker-example-list-48-word.png` | GMA News, list-style, 48 words. |
| `low-reliability-warning.png` | 10-word post with the Low reliability panel at the top of the results. |
| `model-tab-roberta-tagalog.png`, `model-tab-mbert.png`, `model-tab-xlm-roberta.png` | Same 46-word post, Integrated Gradients highlights per model. Models are not ranked (McNemar p = 0.55); show all three. |
| `ig-before.png` / `ig-after.png` | Highlights off ("Before", plain text) vs on ("After"). |
| `demo_long_post.jpg`, `demo_short_post.jpg` | Earlier screenshots copied from `tsektxt-model-training/results/figures/` (800 px, lower resolution). |

## recordings/
| File | Shows / use for |
|---|---|
| `demo-flow.gif` | About 32 s, 960x600 GIF: open checker, load the Taglish example, run three models, switch the three model tabs, toggle Before/After. Works in a README (GitHub renders it) and in PowerPoint (Insert > Pictures). Dev-mode "wait" frames were merged, so it is a flip-book at ~0.6 s per frame, not a smooth video. |

## How it was captured
`capture.py` drives the running local app with Playwright through the installed Microsoft Edge (no browser download). The screen recording is screenshots every ~0.6 s stitched into a GIF with Pillow, because Playwright's video recorder needs a separate ffmpeg download that was not installed. Next.js dev badge and toasts are hidden by injected CSS; the app source is untouched.

## Regenerate
1. Start the app from `tsektxt-app` (models load from the local Hugging Face cache): `start.bat`, or `scripts\start.ps1 -NoBrowser`. Wait until http://localhost:8000/api/health lists 3 models.
2. Install once: `.venv\Scripts\python.exe -m pip install playwright pillow`
3. Run (about 3 to 4 minutes on CPU):
```
.venv\Scripts\python.exe demo-assets\capture.py          # everything
.venv\Scripts\python.exe demo-assets\capture.py shots    # screenshots only
.venv\Scripts\python.exe demo-assets\capture.py video    # GIF only
```
4. Close the two server windows when done. Percentages and highlights can shift slightly if the models, calibration file or app version change.
