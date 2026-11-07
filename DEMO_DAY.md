# Demo day kit (TsekTxt local app)

Research demo: three models, Integrated Gradients, labels follow the source. Never say a model "detects misinformation" and never rank RoBERTa-Tagalog above XLM-R (McNemar p = 0.55).

## New machine (presentation PC or a groupmate's laptop), at least a day before
1. On GitHub: **Code > Download ZIP**. Right-click the ZIP > **Extract All...** into a short folder, e.g. `C:\tsektxt-app`. No second repo is needed (the IG code is in `backend\vendor`).
2. Double-click **`start.bat`** (if Windows shows "Windows protected your PC": **More info > Run anyway**). The first run needs internet and takes 15 to 25 minutes: it installs Python 3.12 and Node.js if they are missing (it asks first), the packages (about 1 GB), and downloads the 3 models (about 1.5 to 2.5 GB, a few minutes).
3. When the browser opens the checker, run one Example. From then on `start.bat` takes about 1 minute and works offline.

## Night before
1. Plug in the charger. Set Windows power mode to "Best performance" and turn off sleep while plugged in.
2. With internet: `powershell -ExecutionPolicy Bypass -File <app folder>\scripts\warmup.ps1` (same as `start.bat` plus one warm-up analysis; `start.bat` alone also works). Wait for **READY**. This caches the 3 models (about 1.5 to 2.5 GB) so the day itself needs no download.
3. Check the percentages: each verdict should show a temperature-scaled percentage with the raw one next to it. If it says "(raw, not calibrated)", `backend\vendor\results\calibration.json` is missing (run `py -3.12 scripts\sync_vendor.py`). Calibration never changes a verdict.
4. In the checker, click each **Example** button and run one check so you know how long it takes. Click **Source link** once to confirm it opens.
5. Fallback media: a 32-second recording and 19 screenshots are already in `demo-assets\` (`recordings\demo-flow.gif`, `screenshots\`; see its README). Copy that folder to the desktop and a USB stick. Optionally record your own 2 to 3 minute run too.
6. Open the Colab presentation notebook once (`tsektxt-model-training/notebooks/colab_present.ipynb`), run it top to bottom, leave the tab open.
7. Copy the recording to the desktop and to a USB stick. Close other heavy programs. Restart the laptop.

## Morning (30 minutes before)
1. Charger in. Close Chrome tabs you do not need, quit chat and sync apps.
2. Run `warmup.ps1` again. It reuses the cache, so about 1 to 2 minutes. Wait for **READY**.
3. Open http://localhost:3000/checker. Set browser zoom with Ctrl and + until the text is readable from the back (125 to 150 percent). Press F11 for full screen if the room is bright.
4. Run one example end to end (first run after a restart is the slow one). Then press **Clear**.
5. Keep the two PowerShell windows open and visible by Alt+Tab (backend shows errors there).

## What to say while Integrated Gradients runs
On CPU one post takes about 20 seconds for short text and up to about a minute for a long one, because IG runs the model many times (100 steps, doubled until the completeness error is 5 percent or less). Talk through it:
- "Integrated Gradients compares the post with a blank version and adds up how much each word pushes the model toward not credible."
- "Highlights show what the model relied on. They are not proof that a sentence is false."
- "Each model was fine-tuned once (one fixed configuration, one seed), and the three are not ranked: RoBERTa-Tagalog vs XLM-R was not significantly different."
- "The models were trained on long news articles, so short posts are outside what they know. Confidence can be high and still wrong."
- For the Example posts: "This is a real public post with its link. We do not claim a label for it; Taglish labels are still being finished."
- Expect all three models to say "not credible" on most Example posts (checked: all five, 92 to 99.9 percent not credible), even though they come from news outlets and COMELEC. Say it before the panel does: "The models were trained on long articles; short posts are outside what they know, so this is the domain-shift limit, not a claim that these posts are false."

## Fallback plan
| Problem | Do this |
|---|---|
| Analysis is too slow or hangs | Switch model tab while it runs, keep talking; if over 2 minutes, stop and play the screen recording. |
| Backend window shows an error | Close both windows, run `warmup.ps1` again (1 to 2 minutes). Meanwhile show the Colab notebook. |
| App will not start at all | Play the screen recording, then open `colab_present.ipynb` (results, figures, live prediction on a T4). |
| No internet in the room | The app still works (models are cached). Colab does not, so use the recording. Use your phone hotspot if needed. |
| Panel asks for their own post | Paste it in the checker. If the app is down, use the text box cell in the Colab notebook. |

## Offline notes
- Cached models live in `%USERPROFILE%\.cache\huggingface\hub` (three `models--hansjio--tsektxt-*` folders). If you set `HF_HUB_OFFLINE=1` in the backend window before starting, it never tries the network.
- The app, the backend and the page all run on `localhost`. Nothing is sent to the internet when you check a post.
- Example links open the original posts online; without internet just do not click them.

## Checklist to carry
Charger, USB stick with the recording, phone hotspot, HDMI/USB-C adapter, this file printed.
