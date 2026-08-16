#!/bin/bash
cd "$(dirname "$0")"

if [ -f ".venv/bin/python" ]; then
    PYTHON_BIN=".venv/bin/python"
elif [ -f ".venv/bin/activate" ]; then
    source ".venv/bin/activate"
    PYTHON_BIN="python3"
else
    PYTHON_BIN="python3"
fi

EXISTING_PID=$(lsof -ti:8000 2>/dev/null)
if [ -n "$EXISTING_PID" ]; then
    echo "Freeing port 8000 (PID $EXISTING_PID)..."
    kill -9 $EXISTING_PID 2>/dev/null
    sleep 1
fi

(sleep 1.5 && (open "http://127.0.0.1:8000" 2>/dev/null || xdg-open "http://127.0.0.1:8000" 2>/dev/null)) &

$PYTHON_BIN -m doclify.pipelines.supervisor server --no-open-browser
