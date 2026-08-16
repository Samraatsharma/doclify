import os
import sys
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT_DIR))

# Import FastAPI app from doclify.server
from doclify.server import app
