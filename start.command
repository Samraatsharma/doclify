#!/bin/bash
# ==============================================================================
# Doclify Launch Script for macOS
# Double-click this file from Finder to start Doclify.
# ==============================================================================

cd "$(dirname "$0")"

echo "=================================================="
echo "          Starting Doclify Web Platform           "
echo "=================================================="

# Use virtual environment python if available
if [ -f ".venv/bin/python" ]; then
    PYTHON_BIN=".venv/bin/python"
elif [ -f ".venv/bin/activate" ]; then
    source ".venv/bin/activate"
    PYTHON_BIN="python3"
else
    PYTHON_BIN="python3"
fi

# Check if port 8000 is already in use
EXISTING_PID=$(lsof -ti:8000 2>/dev/null)
if [ -n "$EXISTING_PID" ]; then
    echo "Notice: Port 8000 is currently in use (PID: $EXISTING_PID)."
    echo "Freeing port 8000 for a fresh Doclify session..."
    kill -9 $EXISTING_PID 2>/dev/null
    sleep 1
fi

echo "Launching Doclify server at http://127.0.0.1:8000..."
echo "Opening your default browser..."

# Open the browser after 1.5 seconds in background
(sleep 1.5 && open "http://127.0.0.1:8000") &

# Start the uvicorn server in foreground
$PYTHON_BIN -m doclify.pipelines.supervisor server --no-open-browser

# If server stops, prevent window from closing instantly so user can see output
echo ""
read -p "Doclify stopped. Press [Enter] to close this window..."
