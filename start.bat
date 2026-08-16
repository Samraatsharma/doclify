@echo off
REM ==============================================================================
REM Doclify Windows Launch Script
REM ==============================================================================

cd /d "%~dp0"

if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
)

echo Starting Doclify Web Platform...
python -m doclify.pipelines.supervisor server --open-browser
pause
