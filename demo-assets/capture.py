r"""Regenerate demo-assets/screenshots and recordings from the running local app.

Prereq: backend on :8000 and frontend on :3000 (see ../README.md), models loaded.
Run (from tsektxt-app):  .venv\Scripts\python.exe demo-assets\capture.py
Needs: pip install playwright pillow   (uses installed Microsoft Edge, no browser download)
Only the app's built-in example posts are used. Nothing is typed by hand.
"""
import re, pathlib, shutil, sys, tempfile
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = pathlib.Path(__file__).parent
SHOTS = OUT / "screenshots"
RECS = OUT / "recordings"
W, H = 1440, 900
EX = ["10 words", "Filipino, 16 words", "official account notice, 23 words", "Taglish, 46 words", "list, 48 words"]
EXFILE = ["10-word", "filipino-16-word", "official-notice-23-word", "taglish-46-word", "list-48-word"]
MODELS = ["RoBERTa-Tagalog", "mBERT", "XLM-RoBERTa"]
MFILE = ["roberta-tagalog", "mbert", "xlm-roberta"]


def launch(p):
    return p.chromium.launch(channel="msedge", headless=True)


HIDE = "nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button] {display:none !important}"


def shot(page, name, full=False):
    page.add_style_tag(content=HIDE)
    page.wait_for_timeout(600)
    page.screenshot(path=str(SHOTS / name), full_page=full, type="png")
    print("saved", name)


def run_check(page, i):
    page.goto(f"{BASE}/checker")
    page.get_by_role("button", name=f"Example: news report, {EX[i]}" if i != 2 else f"Example: {EX[i]}").click()
    page.get_by_role("button", name="Check with all three models").click()
    page.get_by_role("tab", name="mBERT").first.wait_for(timeout=180000)
    for t in page.get_by_role("button", name=re.compile("close|dismiss", re.I)).all():
        try: t.click(timeout=500)
        except Exception: pass
    page.mouse.wheel(0, -3000)
    page.wait_for_timeout(1200)


def screenshots(p):
    b = launch(p)
    page = b.new_context(viewport={"width": W, "height": 1300}).new_page()
    for path, name, full in [("/", "landing.png", False), ("/methodology", "methodology.png", True),
                             ("/privacy", "privacy.png", True), ("/dashboard", "dashboard.png", False),
                             ("/checker", "checker-empty.png", False)]:
        page.goto(BASE + path); shot(page, name, full)
    page.goto(BASE + "/#how-it-works")
    page.locator("#how-it-works").scroll_into_view_if_needed(); shot(page, "how-it-works.png")
    b.close()
    # one fresh browser per heavy step: the dev server page can crash on long runs
    for i in range(5):
        b = launch(p); page = b.new_context(viewport={"width": W, "height": 1300}).new_page()
        run_check(page, i)
        shot(page, f"checker-example-{EXFILE[i]}.png")
        if i == 0:
            shot(page, "low-reliability-warning.png")
        if i == 3:
            for m, f in zip(MODELS, MFILE):
                page.get_by_role("tab", name=m).first.click(); shot(page, f"model-tab-{f}.png")
            page.get_by_role("tab", name=MODELS[0]).first.click()
            page.get_by_role("tab", name="Before").first.click(); shot(page, "ig-before.png")
            page.get_by_role("tab", name="After").first.click(); shot(page, "ig-after.png")
        b.close()


def recording(p):
    """Playwright's video recorder needs a downloaded ffmpeg, so frames are screenshots stitched into a GIF."""
    from PIL import Image
    import io
    frames, step = [], 600

    def hold(page, ms):
        for _ in range(max(1, ms // step)):
            page.add_style_tag(content=HIDE)
            frames.append(Image.open(io.BytesIO(page.screenshot())).convert("RGB").resize((960, 600), Image.LANCZOS))
            page.wait_for_timeout(step - 150)

    b = launch(p)
    page = b.new_context(viewport={"width": 1280, "height": 800}).new_page()
    page.goto(f"{BASE}/checker"); hold(page, 3000)
    page.get_by_role("button", name="Example: news report, Taglish, 46 words").click(); hold(page, 3000)
    page.get_by_role("button", name="Check with all three models").click(); hold(page, 1800)
    page.get_by_role("tab", name="mBERT").first.wait_for(timeout=180000); hold(page, 4800)
    for m in ["mBERT", "XLM-RoBERTa", "RoBERTa-Tagalog"]:
        page.get_by_role("tab", name=m).first.click(); hold(page, 3600)
    page.get_by_role("tab", name="Before").first.click(); hold(page, 4200)
    page.get_by_role("tab", name="After").first.click(); hold(page, 4200)
    b.close()
    pal = [f.quantize(colors=96, method=Image.MEDIANCUT, dither=Image.NONE) for f in frames]
    pal[0].save(RECS / "demo-flow.gif", save_all=True, append_images=pal[1:], duration=step, loop=0, optimize=True)
    print("saved demo-flow.gif", len(frames), "frames,", round(len(frames) * step / 1000), "s")


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "all"
    with sync_playwright() as p:
        if what in ("all", "shots"): screenshots(p)
        if what in ("all", "video"): recording(p)
