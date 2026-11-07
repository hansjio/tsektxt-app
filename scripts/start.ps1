# TsekTxt one-click start (Windows). Normally run by double-clicking start.bat in the app folder.
# First run: finds or installs Python 3.12 and Node.js, creates .venv, installs the backend packages and the
# frontend npm packages, downloads the 3 models (about 1.5 to 2.5 GB, a few minutes). Later runs just start.
# Then starts the backend and the frontend in two windows, waits until the models are loaded, opens the browser.
#   -Warmup   also runs one analysis so the first live click is fast (demo day)
#   -NoBrowser  do not open the browser
param([int]$BackendPort = 8000, [int]$FrontendPort = 3000, [int]$WaitMinutes = 15, [switch]$Warmup, [switch]$NoBrowser)
$ErrorActionPreference = "Continue"   # native tools (pip, npm, py) write warnings to stderr; failures are checked via exit codes
$ProgressPreference = "SilentlyContinue"
$App      = Split-Path -Parent $PSScriptRoot
$Backend  = Join-Path $App "backend"
$Frontend = Join-Path $App "frontend"
$VenvPy   = Join-Path $App ".venv\Scripts\python.exe"
$Models   = @("hansjio/tsektxt-roberta-tagalog", "hansjio/tsektxt-mbert", "hansjio/tsektxt-xlmr")
$OkPython = @("3.12", "3.11", "3.13")   # 3.12 is the tested one; torch/pyyaml wheels exist for all three

function Fail($msg) { Write-Host "`nSTOP: $msg" -ForegroundColor Red; exit 1 }
function Step($msg) { Write-Host "`n== $msg" -ForegroundColor Cyan }
function Note($msg) { Write-Host $msg -ForegroundColor Yellow }
function Ask($q) { $a = Read-Host "$q [Y/n]"; return ($a -eq "" -or $a -match "^[Yy]") }
function Refresh-Path { $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User") }
function Hash($f) { if (Test-Path $f) { (Get-FileHash $f -Algorithm SHA256).Hash } else { "none" } }
function Listening($port) { [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) }
function Healthy { try { $h = Invoke-RestMethod -Uri "http://localhost:$BackendPort/api/health" -TimeoutSec 5; if ($h.ok -and $h.models_loaded.Count -eq 3) { return $h } } catch { }; return $null }

Write-Host "TsekTxt local demo  ($App)" -ForegroundColor Green

# ---------------------------------------------------------------- folder sanity
if ($App -like "$env:TEMP*" -or $App -match "\\Temp\\") { Fail "This looks like it is running from inside the ZIP. Right-click the ZIP > Extract All..., open the extracted folder, then double-click start.bat." }
if (-not (Test-Path (Join-Path $Backend "vendor\src\interpret.py"))) { Fail "backend\vendor is missing. The download is incomplete: download the app ZIP again and extract all of it." }
if ($App.Length -gt 90) { Note "Note: the folder path is long ($($App.Length) characters). If the Python install fails with 'No such file or directory', move the folder to e.g. C:\tsektxt-app and run start.bat again." }

# ---------------------------------------------------------------- 1. Python
Step "1/5 Python"
function Find-Python {
  foreach ($v in $OkPython) {
    if (Get-Command py -ErrorAction SilentlyContinue) { & py "-$v" -c "import sys" 2>$null; if ($LASTEXITCODE -eq 0) { return @("py", "-$v") } }
    $p = Join-Path $env:LOCALAPPDATA ("Programs\Python\Python" + $v.Replace(".", "") + "\python.exe")
    if (Test-Path $p) { return @($p) }
  }
  $cmd = Get-Command python -ErrorAction SilentlyContinue
  if ($cmd -and $cmd.Source -notmatch "WindowsApps") {
    $v = & $cmd.Source -c "import sys; print('%d.%d' % sys.version_info[:2])"
    if ($OkPython -contains $v) { return @($cmd.Source) }
  }
  return $null
}
$venvOk = $false
if (Test-Path $VenvPy) {
  $vv = & $VenvPy -c "import sys; print('%d.%d' % sys.version_info[:2])" 2>$null
  if ($OkPython -contains $vv) { $venvOk = $true; Write-Host "OK: .venv exists (Python $vv)" }
  else { Note "The existing .venv uses Python '$vv' (need 3.12). Recreating it."; Remove-Item -Recurse -Force (Join-Path $App ".venv") }
}
if (-not $venvOk) {
  $py = Find-Python
  if (-not $py) {
    Note "Python 3.12 was not found (Python 3.14/3.15 do not work: some packages have no wheels yet)."
    if ((Get-Command winget -ErrorAction SilentlyContinue) -and (Ask "Install Python 3.12 now with winget (about 30 MB, no admin needed)?")) {
      winget install -e --id Python.Python.3.12 --scope user --accept-package-agreements --accept-source-agreements
      Refresh-Path; $py = Find-Python
    }
    if (-not $py) { Fail "Install Python 3.12 from https://www.python.org/downloads/release/python-3129/ (Windows installer 64-bit; tick 'Add python.exe to PATH'), then double-click start.bat again." }
  }
  Write-Host "Creating .venv with $($py -join ' ')"
  $exe = $py[0]; $pyArgs = @($py | Select-Object -Skip 1) + @("-m", "venv", (Join-Path $App ".venv"))
  & $exe @pyArgs
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $VenvPy)) { Fail "Could not create .venv." }
}
$req = Join-Path $Backend "requirements.txt"; $reqStamp = Join-Path $App ".venv\tsektxt-requirements.sha256"
if ((Hash $req) -ne (Get-Content $reqStamp -ErrorAction SilentlyContinue)) {
  Write-Host "Installing the backend packages (torch, transformers, captum, ...). First time: about 1 GB, 5 to 10 minutes."
  & $VenvPy -m pip install --disable-pip-version-check --upgrade pip | Out-Null
  & $VenvPy -m pip install --disable-pip-version-check -r $req
  if ($LASTEXITCODE -ne 0) { Fail "pip install failed (see the messages above). Check the internet connection and run start.bat again." }
  Hash $req | Set-Content $reqStamp
}
& $VenvPy -c "import fastapi, uvicorn, torch, transformers, captum, yaml" 2>$null
if ($LASTEXITCODE -ne 0) { Remove-Item $reqStamp -ErrorAction SilentlyContinue; Fail "Backend packages are broken. Run start.bat again (it reinstalls them)." }
Write-Host "OK: backend packages"

# ---------------------------------------------------------------- 2. Node.js
Step "2/5 Node.js and the web page packages"
function Node-Major { try { [int]((node -v) -replace "^v(\d+).*", '$1') } catch { 0 } }
if (-not (Get-Command node -ErrorAction SilentlyContinue) -or (Node-Major) -lt 20) {
  Note "Node.js 20 or newer was not found."
  if ((Get-Command winget -ErrorAction SilentlyContinue) -and (Ask "Install Node.js LTS now with winget (about 30 MB; Windows may ask for permission)?")) {
    winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    Refresh-Path
  }
  if (-not (Get-Command node -ErrorAction SilentlyContinue) -or (Node-Major) -lt 20) { Fail "Install Node.js LTS from https://nodejs.org (Windows Installer .msi), then double-click start.bat again." }
}
$lock = Join-Path $Frontend "package-lock.json"; $npmStamp = Join-Path $Frontend "node_modules\.tsektxt-lock.sha256"
if (-not (Test-Path (Join-Path $Frontend "node_modules")) -or (Hash $lock) -ne (Get-Content $npmStamp -ErrorAction SilentlyContinue)) {
  Write-Host "Installing the web page packages (npm, 1 to 3 minutes)..."
  Push-Location $Frontend
  try { npm install --no-audit --no-fund; $code = $LASTEXITCODE } finally { Pop-Location }
  if ($code -ne 0) { Fail "npm install failed (see the messages above). Check the internet connection and run start.bat again." }
  Hash $lock | Set-Content $npmStamp
}
$envLocal = Join-Path $Frontend ".env.local"
if (-not (Test-Path $envLocal)) { "NEXT_PUBLIC_API_BASE_URL=http://localhost:$BackendPort" | Set-Content $envLocal -Encoding ascii }
Write-Host "OK: node $(node -v), web page packages"

# ---------------------------------------------------------------- 3. models
Step "3/5 The 3 models (Hugging Face)"
$hub = if ($env:HF_HUB_CACHE) { $env:HF_HUB_CACHE } elseif ($env:HF_HOME) { Join-Path $env:HF_HOME "hub" } else { Join-Path $env:USERPROFILE ".cache\huggingface\hub" }
$missing = @($Models | Where-Object { -not (Test-Path (Join-Path $hub ("models--" + $_.Replace("/", "--") + "\snapshots"))) })
if ($missing.Count -gt 0) {
  Write-Host "First run: downloading $($missing.Count) model(s), about 0.5 to 1 GB each. This takes a few minutes; it happens only once."
  $dl = "from huggingface_hub import snapshot_download`nimport sys`nfor r in sys.argv[1:]:`n    print('  ', r, '->', snapshot_download(r), flush=True)"
  & $VenvPy -c $dl @missing
  if ($LASTEXITCODE -ne 0) { Fail "Model download failed. Check the internet connection and run start.bat again." }
}
Write-Host "OK: models are in $hub"

# ---------------------------------------------------------------- 4. start
Step "4/5 Starting the model server and the web page (two new windows; leave them open)"
if (Listening $BackendPort) {
  if (Healthy) { Write-Host "The model server is already running on port $BackendPort." }
  else { Note "Port $BackendPort is busy. If an old 'TsekTxt backend' window is open, wait for it or close it. Otherwise another program uses the port." }
} else {
  $cmd = "`$Host.UI.RawUI.WindowTitle='TsekTxt backend (close to stop)'; & '$VenvPy' -m uvicorn server:app --port $BackendPort"
  Start-Process powershell -WorkingDirectory $Backend -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $cmd
}
if (Listening $FrontendPort) { Write-Host "Something is already running on port $FrontendPort (assuming it is the TsekTxt web page)." }
else {
  $cmd = "`$Host.UI.RawUI.WindowTitle='TsekTxt web page (close to stop)'; npm run dev -- --port $FrontendPort"
  Start-Process powershell -WorkingDirectory $Frontend -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $cmd
}

Step "5/5 Waiting for the models to load (about 1 minute; up to $WaitMinutes)"
$deadline = (Get-Date).AddMinutes($WaitMinutes); $h = $null
while ((Get-Date) -lt $deadline) { $h = Healthy; if ($h) { break }; Write-Host "." -NoNewline; Start-Sleep -Seconds 3 }
Write-Host ""
if (-not $h) { Fail "The model server did not become ready within $WaitMinutes minutes. Read the 'TsekTxt backend' window for the error." }
Write-Host "OK: 3 models loaded on $($h.device)$(if (-not $h.calibrated) { ' (percentages are raw: no calibration.json yet)' })"

$page = "http://localhost:$FrontendPort/checker"
try { Invoke-WebRequest -Uri $page -UseBasicParsing -TimeoutSec 180 | Out-Null } catch { Note "The web page is still compiling; if the browser shows an error, wait a few seconds and refresh." }
if ($Warmup) {
  Write-Host "Warm-up analysis (one short post, all 3 models + Integrated Gradients; the result is discarded)..."
  $body = @{ text = "Comelec eyes debate skipping as basis for candidate disqualification #Halalan2022" } | ConvertTo-Json
  $t = Get-Date
  try { $r = Invoke-RestMethod -Uri "http://localhost:$BackendPort/api/analyze" -Method Post -ContentType "application/json; charset=utf-8" -Body $body -TimeoutSec 600 }
  catch { Fail "Warm-up analysis failed: $($_.Exception.Message)" }
  Write-Host ("OK: warm-up took {0:N0} s for {1} models" -f ((Get-Date) - $t).TotalSeconds, $r.models.Count)
}
if (-not $NoBrowser) { Start-Process $page }
Write-Host "`nREADY  ->  $page" -ForegroundColor Green
Write-Host "Keep the two 'TsekTxt' windows open while you use the demo. To stop: close them."
