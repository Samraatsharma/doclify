#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "=== Doclify Setup (Linux / macOS) ==="

# Check Python
if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
else
    PYTHON_BIN="python"
fi

# Create venv
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    $PYTHON_BIN -m venv .venv
fi

source .venv/bin/activate

echo "Installing Python package..."
pip install --upgrade pip >/dev/null 2>&1 || true
pip install -e .

# Frontend
if [ -d "frontend" ] && command -v npm >/dev/null 2>&1; then
    echo "Building frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

# Env
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
fi

echo "Setup complete! Run ./start.sh to launch the application."
