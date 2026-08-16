#!/bin/bash
# ==============================================================================
# Doclify One-Click Setup & Launch Script for macOS
# Double-click this file from Finder to setup and start Doclify.
# ==============================================================================

set -e

# Change to the repository directory
cd "$(dirname "$0")"
PROJECT_DIR="$(pwd)"

echo "====================================================================="
echo "  DOCLIFY — AI-Powered Developer Platform Setup"
echo "  Your codebase. Understood."
echo "====================================================================="
echo "Project Directory: $PROJECT_DIR"
echo ""

# 1. Check Python installation
echo "→ Checking Python 3..."
if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
else
    echo "✖ Error: Python 3 is not installed."
    echo "  Please install Python 3.10+ from https://www.python.org/ or via Homebrew: brew install python"
    read -p "Press Enter to exit..."
    exit 1
fi

PY_VERSION=$($PYTHON_BIN -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "✔ Found Python $PY_VERSION ($PYTHON_BIN)"

# 2. Check Node.js and npm for frontend build
echo "→ Checking Node.js and npm..."
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo "✔ Found npm $NPM_VERSION"
else
    echo "⚠ Warning: npm is not installed. If frontend is not yet built, please install Node.js from https://nodejs.org/"
fi

# 3. Create Python Virtual Environment
VENV_DIR="$PROJECT_DIR/.venv"
if [ ! -d "$VENV_DIR" ]; then
    echo "→ Creating Python virtual environment in .venv..."
    $PYTHON_BIN -m venv "$VENV_DIR"
    echo "✔ Virtual environment created."
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"

# 4. Upgrade pip and install Python dependencies
echo "→ Installing Python backend dependencies..."
pip install --upgrade pip >/dev/null 2>&1 || true
pip install -e .

# 5. Build Frontend Assets if needed
if [ -d "$PROJECT_DIR/frontend" ] && command -v npm >/dev/null 2>&1; then
    if [ ! -d "$PROJECT_DIR/frontend/dist" ] || [ ! -d "$PROJECT_DIR/frontend/node_modules" ]; then
        echo "→ Installing frontend dependencies & building UI..."
        cd "$PROJECT_DIR/frontend"
        npm install
        npm run build
        cd "$PROJECT_DIR"
        echo "✔ Frontend assets built successfully."
    fi
fi

# 6. Check .env configuration
if [ ! -f "$PROJECT_DIR/.env" ]; then
    if [ -f "$PROJECT_DIR/.env.example" ]; then
        echo "→ Creating .env from .env.example..."
        cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
        echo "✔ .env file created."
    fi
fi

echo ""
echo "====================================================================="
echo "  Setup Complete! Launching Doclify Web Platform..."
echo "====================================================================="
echo "• If you haven't added your GROQ_API_KEY yet, edit the .env file."
echo "• The web application will open in your default browser."
echo "• To restart in the future, simply double-click start.command"
echo "====================================================================="
echo ""

# Launch Doclify Server
python -m doclify.server
