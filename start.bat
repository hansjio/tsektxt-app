@echo off
rem TsekTxt local demo: double-click to set up (first run) and start. See README.md.
title TsekTxt start
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start.ps1" %*
echo.
pause
