from __future__ import annotations
import json
import os
from pathlib import Path
from doclify.utils.logger import get_logger
from doclify.config.constants import TokenBudgetConfig

# Initialize logger
logger = get_logger(__name__)

LOCKFILE_NAMES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "poetry.lock", "cargo.lock", "composer.lock",
    "pipfile.lock", "uv.lock", "gemfile.lock"
}


def is_minified(content: str) -> bool:
    """Detects if content is minified or single-line bundle."""
    if len(content) < 2000:
        return False
    lines = content.splitlines()
    if not lines:
        return False
    avg_len = len(content) / len(lines)
    max_line = max(len(l) for l in lines[:20])
    return avg_len > 400 or max_line > 800


def extract_lockfile_summary(path: Path, file_path: str) -> str:
    """
    Extracts a high-density, token-efficient semantic summary of dependency lockfiles.
    Avoids sending 50k+ characters of raw repetitive dependency trees.
    """
    filename = path.name.lower()
    try:
        if filename == "package-lock.json":
            data = json.loads(path.read_text(encoding="utf-8"))
            name = data.get("name", "Unknown")
            version = data.get("version", "Unknown")
            lockfile_ver = data.get("lockfileVersion", 1)
            
            # Extract root direct packages
            packages = data.get("packages", {})
            root_pkg = packages.get("", {})
            direct_deps = root_pkg.get("dependencies", data.get("dependencies", {}))
            dev_deps = root_pkg.get("devDependencies", {})
            
            # Format top runtime dependencies
            dep_lines = []
            for dep, ver in list(direct_deps.items())[:TokenBudgetConfig.MAX_LOCKFILE_ENTRIES]:
                if isinstance(ver, dict):
                    ver_str = ver.get("version", "resolved")
                else:
                    ver_str = str(ver)
                dep_lines.append(f"  • {dep}: {ver_str}")
                
            dev_lines = []
            for dep, ver in list(dev_deps.items())[:TokenBudgetConfig.MAX_LOCKFILE_ENTRIES]:
                if isinstance(ver, dict):
                    ver_str = ver.get("version", "resolved")
                else:
                    ver_str = str(ver)
                dev_lines.append(f"  • {dep}: {ver_str}")

            total_pkgs = len(packages) if packages else len(data.get("dependencies", {}))
            
            summary = [
                f"Dependency Lockfile Specification: {file_path}",
                f"Ecosystem: npm / Node.js (Lockfile Format: v{lockfile_ver})",
                f"Root Project: {name} (v{version})",
                f"Total Resolved Packages in Tree: {total_pkgs}",
                "\nDirect Runtime Dependencies:"
            ]
            summary.extend(dep_lines if dep_lines else ["  (None specified)"])
            
            if dev_lines:
                summary.append("\nDirect Development Dependencies:")
                summary.extend(dev_lines)
                
            return "\n".join(summary)
            
        elif filename in {"yarn.lock", "pnpm-lock.yaml", "cargo.lock", "poetry.lock", "uv.lock"}:
            raw_text = path.read_text(encoding="utf-8", errors="ignore")
            lines = [l.strip() for l in raw_text.splitlines() if l.strip() and not l.startswith("#")]
            # Extract distinct package names from lockfile
            sample_lines = lines[:120]
            return (
                f"Dependency Lockfile Specification: {file_path}\n"
                f"Lockfile Type: {filename}\n"
                f"Total Lines: {len(lines)}\n\n"
                f"Primary Package Declarations (Sample):\n" + "\n".join(sample_lines)
            )
            
    except Exception as e:
        logger.warning(f"Error parsing lockfile {file_path}: {e}")
        
    # Fallback for lockfiles
    try:
        raw_text = path.read_text(encoding="utf-8", errors="ignore")
        return f"Dependency Lockfile: {file_path}\n" + raw_text[:TokenBudgetConfig.RETRY_CHUNK_CHARS]
    except Exception:
        return f"Dependency Lockfile: {file_path}"


def extract_large_json_summary(path: Path, file_path: str, content: str) -> str:
    """Extracts a structured schema summary of large JSON files."""
    try:
        data = json.loads(content)
        if isinstance(data, dict):
            keys = list(data.keys())
            sample_dict = {k: type(data[k]).__name__ for k in keys[:30]}
            return (
                f"Structured JSON File: {file_path}\n"
                f"Root Object with {len(keys)} Keys: {', '.join(keys[:20])}\n"
                f"Key Data Types:\n{json.dumps(sample_dict, indent=2)}"
            )
        elif isinstance(data, list):
            return (
                f"Structured JSON Array: {file_path}\n"
                f"Array with {len(data)} items.\n"
                f"Sample Item Schema:\n{json.dumps(data[0] if data else {}, indent=2)[:2000]}"
            )
    except Exception:
        pass
    return content[:TokenBudgetConfig.MAX_CHUNK_CHARS]


def chunk_text_by_lines(content: str, max_chars: int) -> list[str]:
    """Splits text into chunks respecting line breaks."""
    if len(content) <= max_chars:
        return [content]
        
    chunks = []
    lines = content.splitlines(keepends=True)
    current_chunk = []
    current_len = 0
    
    for line in lines:
        if current_len + len(line) > max_chars and current_chunk:
            chunks.append("".join(current_chunk))
            current_chunk = [line]
            current_len = len(line)
        else:
            current_chunk.append(line)
            current_len += len(line)
            
    if current_chunk:
        chunks.append("".join(current_chunk))
        
    return chunks


def extract_file_content(file_path: str, base_dir: Path = None) -> list[str]:
    """
    Reads and returns the content of the file partitioned into token-safe chunks for LLM consumption.
    Implements intelligent lockfile parsing, minification detection, and conservative chunking.
    """
    path = Path(base_dir) / file_path if base_dir else Path(file_path)
    if not path.exists():
        logger.warning(f"File not found: {file_path}")
        return [f"File not found: {file_path}"]
    
    # 1. Size check
    try:
        file_size = path.stat().st_size
        if file_size > TokenBudgetConfig.MAX_FILE_SIZE:
            logger.warning(f"Skipping large file: {file_path} ({file_size} bytes)")
            return [f"File too large to process: {file_path} ({file_size} bytes)"]
    except Exception as e:
        logger.error(f"Error checking size of {file_path}: {e}")
        return [f"Error checking file size: {file_path}"]

    # 2. Lockfile handling
    filename_lower = path.name.lower()
    if filename_lower in LOCKFILE_NAMES or filename_lower.endswith(".lock"):
        logger.info(f"Using structured dependency summarization for lockfile: {file_path}")
        lock_summary = extract_lockfile_summary(path, file_path)
        return [f"File: {file_path}\n```yaml\n{lock_summary}\n```"]

    try:
        ext = path.suffix.lstrip(".") or "txt"
        
        # 3. Jupyter Notebook handling
        if path.suffix == ".ipynb":
            with open(path, "r", encoding="utf-8") as f:
                nb_content = json.load(f)
            
            code_lines = []
            for cell in nb_content.get("cells", []):
                if cell.get("cell_type") == "code":
                    source = cell.get("source", [])
                    if isinstance(source, list):
                        code_lines.extend(source)
                        code_lines.append("\n\n")
                    else:
                        code_lines.append(source)
                        code_lines.append("\n\n")
            
            content = "".join(code_lines).strip()
            display_ext = "python"
        else:
            content = path.read_text(encoding="utf-8", errors="ignore")
            display_ext = ext
            
        # 4. Large JSON handling (>15KB)
        if ext == "json" and len(content) > 15_000:
            logger.info(f"Using structured schema extraction for large JSON: {file_path}")
            structured_content = extract_large_json_summary(path, file_path, content)
            return [f"File: {file_path}\n```json\n{structured_content}\n```"]

        # 5. Minified file handling
        if is_minified(content):
            logger.info(f"Detected minified/bundled code in {file_path}, compressing context.")
            return [
                f"File: {file_path} (Minified/Compiled Asset)\n"
                f"Format: {display_ext}\n"
                f"Size: {len(content)} characters.\n"
                f"Description: Bundled or minified runtime distribution asset."
            ]

        logger.info(f"Extraction successful for {file_path} ({len(content)} chars)")
        
        # 6. Safe Chunking
        max_chunk = TokenBudgetConfig.MAX_CHUNK_CHARS
        if len(content) > max_chunk:
            chunks = chunk_text_by_lines(content, max_chunk)
            return [
                f"File: {file_path} (Part {i+1}/{len(chunks)})\n```{display_ext}\n{chunk}\n```" 
                for i, chunk in enumerate(chunks)
            ]
        
        return [f"File: {file_path}\n```{display_ext}\n{content}\n```"]
        
    except Exception as e:
        logger.error(f"Error reading file {file_path}: {e}", exc_info=True)
        return [f"Error reading file {file_path}: {e}"]