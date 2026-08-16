import os
import json
import subprocess
from pathlib import Path
from doclify.utils.logger import get_logger

# Initialize the logger
logger = get_logger(__name__)

def get_cache_paths(base_dir: Path = None):
    root = Path(base_dir) if base_dir else Path(".")
    cache_dir = root / ".doclify"
    cache_file = cache_dir / "cache.json"
    return cache_dir, cache_file

def load_cache(base_dir: Path = None):
    try:
        cache_dir, cache_file = get_cache_paths(base_dir)
        logger.info(f"Loading cache from {cache_file}")
        if cache_file.exists():
            logger.info("Cache found")
            return json.loads(cache_file.read_text(encoding="utf-8"))
        
        logger.info("Cache not found, returning empty cache")
        return {"files": {}}
    except Exception:
        logger.error("Error loading cache", exc_info=True)
        return {"files": {}}

def clean_cache(cache, valid_files):
    """
    Removes entries from cache["files"] that are not in the valid_files list.
    Normalizes all paths before comparison.
    """
    if "files" not in cache:
        return cache
    
    valid_paths = {os.path.normpath(f) for f in valid_files}
    logger.info(f"Cleaning cache. Valid files count: {len(valid_paths)}")
    
    cleaned_files = {}
    for k, v in cache["files"].items():
        if os.path.normpath(k) in valid_paths:
            cleaned_files[k] = v
        else:
            logger.info(f"Removing stale key from cache: {k}")
            
    cache["files"] = cleaned_files
    return cache

def save_cache(cache, base_dir: Path = None):
    cache_dir, cache_file = get_cache_paths(base_dir)
    target_dir = cache_dir
    
    if os.name == "nt":
        # Windows: hidden folder
        target_dir.mkdir(parents=True, exist_ok=True)
        try:
            subprocess.run(["attrib", "+H", str(target_dir)], check=False)
        except Exception:
            pass
    else:
        # Linux / macOS: ensure dot-prefixed folder
        target_dir.mkdir(parents=True, exist_ok=True)
    
    logger.info(f"Saving cache to {cache_file}")
    cache_file.write_text(json.dumps(cache, indent=2), encoding="utf-8")

