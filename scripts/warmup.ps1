# TsekTxt demo-day warm-up (Windows PowerShell). Run from anywhere:  powershell -ExecutionPolicy Bypass -File E:\repos\tsektxt-app\scripts\warmup.ps1
# Checks the setup, downloads the 3 models into the Hugging Face cache, starts backend + frontend in two windows,
# waits for /api/health, runs one analysis so the first live click is fast, then prints READY.
# Read-only for the repos: it writes nothing into them (no results are stored).
param([int]$BackendPort = 8000, [int]$FrontendPort = 3000, [int]$WaitMinutes = 10)
$ErrorActionPreference = "Stop"
$App      = Split-Path -Parent $PSScriptRoot
$Venv     = Join-Path $App ".venv\Scripts\python.exe"
$Backend  = Join-Path $App "backend"
$Frontend = Join-Path $App "frontend"
$Models   = @("hansjio/tsektxt-roberta-tagalog", "hansjio/tsektxt-mbert", "hansjio/tsektxt-xlmr")

function Fail($msg) { Write-Host "STOP: $msg" -ForegroundColor Red; exit 1 }
function Step($msg) { Write-Host "`n== $msg" -ForegroundColor Cyan }

Step "1/6 Checking Python 3.12 virtual environment"
if (-not (Test-Path $Venv)) { Fail "No .venv found. Run once:  cd $App ; py -3.12 -m venv .venv ; .\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt" }
$ver = & $Venv -c "import sys; print('%d.%d' % sys.version_info[:2])"
if ($ver -ne "3.12") { Fail "The .venv uses Python $ver, not 3.12. Delete .venv and recreate it with:  py -3.12 -m venv .venv" }
& $Venv -c "import fastapi, uvicorn, torch, transformers, captum, yaml" 2>$null
if ($LASTEXITCODE -ne 0) { Fail "Python packages are missing. Run:  $Venv -m pip install -r $Backend\requirements.txt" }
Write-Host "OK: Python $ver with the backend packages"

Step "2/6 Checking the training repo and node_modules"
$Training = if ($env:TSEKTXT_TRAINING_DIR) { $env:TSEKTXT_TRAINING_DIR } else { Join-Path (Split-Path -Parent $App) "tsektxt-model-training" }
if (-not (Test-Path (Join-Path $Training "src\interpret.py"))) { Fail "Cannot find $Training\src\interpret.py (set TSEKTXT_TRAINING_DIR if the repo is elsewhere)." }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Fail "Node.js is not installed (need Node 20 or newer)." }
if (-not (Test-Path (Join-Path $Frontend "node_modules"))) { Fail "node_modules missing. Run once:  cd $Frontend ; npm install" }
if (-not (Test-Path (Join-Path $Frontend ".env.local"))) { Copy-Item (Join-Path $Frontend ".env.example") (Join-Path $Frontend ".env.local"); Write-Host "Created frontend\.env.local from .env.example" }
Write-Host "OK: training repo, node $(node -v), node_modules"

Step "3/6 Downloading the 3 models into the Hugging Face cache (fast if already cached; needs internet the first time)"
$dl = "from huggingface_hub import snapshot_download`nimport sys`nfor r in sys.argv[1:]:`n    print('  ', r, '->', snapshot_download(r))"
& $Venv -c $dl @Models
if ($LASTEXITCODE -ne 0) { Fail "Model download failed. Check the internet connection (or run once online before demo day)." }

Step "4/6 Starting backend and frontend in two new windows"
foreach ($p in @($BackendPort, $FrontendPort)) {
  if (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue) { Write-Host "Port $p is already in use; assuming it is already running (close its window first if you want a fresh start)." -ForegroundColor Yellow }
}
if (-not (Get-NetTCPConnection -LocalPort $BackendPort -State Listen -ErrorAction SilentlyContinue)) {
  Start-Process powershell -WorkingDirectory $Backend -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle='TsekTxt backend'; & '$Venv' -m uvicorn server:app --port $BackendPort"
}
if (-not (Get-NetTCPConnection -LocalPort $FrontendPort -State Listen -ErrorAction SilentlyContinue)) {
  Start-Process powershell -WorkingDirectory $Frontend -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle='TsekTxt frontend'; npm run dev"
}

Step "5/6 Waiting for /api/health (the models load first; about a minute when cached)"
$health = "http://localhost:$BackendPort/api/health"
$deadline = (Get-Date).AddMinutes($WaitMinutes); $ok = $false
while ((Get-Date) -lt $deadline) {
  try { $h = Invoke-RestMethod -Uri $health -TimeoutSec 5; if ($h.ok -and $h.models_loaded.Count -eq 3) { $ok = $true; break } } catch { }
  Start-Sleep -Seconds 3
}
if (-not $ok) { Fail "Backend did not become healthy within $WaitMinutes minutes. Read the 'TsekTxt backend' window for the error." }
Write-Host "OK: models loaded on $($h.device)"

Step "6/6 Warm-up analysis (one short post, all 3 models + Integrated Gradients; the result is discarded)"
$body = @{ text = "Comelec eyes debate skipping as basis for candidate disqualification #Halalan2022" } | ConvertTo-Json
$t = Get-Date
try { $r = Invoke-RestMethod -Uri "http://localhost:$BackendPort/api/analyze" -Method Post -ContentType "application/json; charset=utf-8" -Body $body -TimeoutSec 600 }
catch { Fail "Warm-up analysis failed: $($_.Exception.Message)" }
Write-Host ("OK: warm-up took {0:N0} s for {1} models" -f ((Get-Date) - $t).TotalSeconds, $r.models.Count)
try { Invoke-WebRequest -Uri "http://localhost:$FrontendPort/checker" -UseBasicParsing -TimeoutSec 120 | Out-Null; Write-Host "OK: checker page compiled" } catch { Write-Host "Note: could not open the checker page yet ($($_.Exception.Message)); open it once in the browser to compile it." -ForegroundColor Yellow }

Write-Host "`nREADY  ->  http://localhost:$FrontendPort/checker" -ForegroundColor Green
Write-Host "Leave both new windows open. Plug in the charger. Set browser zoom (Ctrl +) before the audience arrives."
