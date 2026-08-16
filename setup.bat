@echo off
REM ==============================================================================
REM Doclify Windows Setup Script
REM Double-click this file to setup Doclify on Windows.
REM ==============================================================================

echo =====================================================================
echo   DOCLIFY - AI Developer Platform Setup (Windows)
echo   Your codebase. Understood.
echo =====================================================================
echo.

cd /d "%~dp0"

REM 1. Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not added to PATH.
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)

REM 2. Create Virtual Environment
if not exist ".venv" (
    echo Creating virtual environment in .venv...
    python -m venv .venv
)

call .venv\Scripts\activate.bat

echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -e .

REM 3. Check and build frontend
if exist "frontend" (
    npm --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo Building frontend assets...
        cd frontend
        call npm install
        call npm run build
        cd ..
    ) else (
        echo Warning: npm is not installed. If frontend is not built, install Node.js.
    )
)

REM 4. Copy .env.example if .env missing
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo Created .env from .env.example
    )
)

echo.
echo =====================================================================
echo   Setup Complete! Starting Doclify...
echo =====================================================================
echo.

python -m doclify.pipelines.supervisor server --open-browser
pause
