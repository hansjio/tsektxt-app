"""Keep backend/vendor/ identical to the training repo (tsektxt-model-training).

    python scripts\\sync_vendor.py           # copy the files below from the training repo into backend\\vendor
    python scripts\\sync_vendor.py --check   # exit 1 if any vendored copy differs from the training repo (drift test)

The training repo is ..\\tsektxt-model-training next to this app, or TSEKTXT_TRAINING_DIR, or --training PATH.
results/calibration.json is optional: copied when it exists (after notebooks/colab_extra.ipynb); until then the app shows
raw percentages. Standard library only, so any Python works.
"""
import argparse, os, shutil, sys
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
VENDOR = APP / "backend" / "vendor"
FILES = ["src/interpret.py", "src/calibrate.py", "configs/config.yaml"]
OPTIONAL = ["results/calibration.json"]


def _same(a, b):
    """Byte-equal after normalising line endings (git on Windows may check files out with CRLF)."""
    def norm(p):
        return p.read_bytes().replace(b"\r\n", b"\n")
    return b.exists() and norm(a) == norm(b)


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="only compare; exit 1 on drift")
    ap.add_argument("--training", default=os.environ.get("TSEKTXT_TRAINING_DIR", str(APP.parent / "tsektxt-model-training")))
    a = ap.parse_args(argv)
    src = Path(a.training).resolve()
    if not (src / FILES[0]).exists():
        sys.exit(f"Training repo not found at {src} (use --training PATH or TSEKTXT_TRAINING_DIR).")
    drift = []
    for rel in FILES + OPTIONAL:
        s, d = src / rel, VENDOR / rel
        if not s.exists():
            if rel in OPTIONAL:
                if d.exists():
                    drift.append(f"{rel}: in vendor but not in the training repo")
                else:
                    print(f"skip  {rel} (not in the training repo yet)")
                continue
            sys.exit(f"Missing in training repo: {s}")
        same = _same(s, d)
        if same:
            print(f"ok    {rel}")
        elif a.check:
            drift.append(f"{rel}: differs from {s}")
        else:
            d.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(s, d); print(f"copy  {rel}")
    if drift:
        print("DRIFT: backend/vendor is out of date. Run  python scripts\\sync_vendor.py  and commit.", file=sys.stderr)
        for x in drift:
            print("  " + x, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
