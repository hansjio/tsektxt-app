# TsekTxt demo-day warm-up (Windows PowerShell). Same as start.bat plus one discarded analysis so the first live click is fast.
#   powershell -ExecutionPolicy Bypass -File <app folder>\scripts\warmup.ps1
param([int]$BackendPort = 8000, [int]$FrontendPort = 3000, [int]$WaitMinutes = 15)
& (Join-Path $PSScriptRoot "start.ps1") -BackendPort $BackendPort -FrontendPort $FrontendPort -WaitMinutes $WaitMinutes -Warmup
exit $LASTEXITCODE
