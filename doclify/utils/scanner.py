import pathspec
from pathlib import Path

def scan_repo(include: list = None, exclude: list = None, base_dir: Path = None):
    patterns = []
    root = Path(base_dir) if base_dir else Path(".")
    
    # Custom Excludes from config
    if exclude:
        patterns.extend(exclude)

    # Built-in Python gitignore
    try:
        from importlib.resources import files
        builtin_ignore = files("doclify.resources").joinpath("Python.gitignore")
        if builtin_ignore.is_file():
            patterns.extend(builtin_ignore.read_text(encoding="utf-8").splitlines())
    except Exception:
        pass

    # User project .gitignore
    project_gitignore = root / ".gitignore"
    if project_gitignore.exists():
        patterns.extend(project_gitignore.read_text(encoding="utf-8", errors="ignore").splitlines())

    # Ensure .doclify, .git, and doclify.yaml are ignored by default
    patterns.extend([".doclify/", ".git/", "doclify.yaml", "node_modules/", "venv/", ".venv/"])

    spec = pathspec.PathSpec.from_lines("gitignore", patterns)
    
    # Custom includes
    include_patterns = set(include) if include else None

    files = []
    # Common source extensions
    allowed_suffixes = {
        ".py", ".md", ".txt", ".ipynb", 
        ".js", ".jsx", ".ts", ".tsx", 
        ".json", ".yaml", ".yml", ".toml",
        ".html", ".css", ".go", ".rs", ".java", ".c", ".cpp", ".h", ".sh"
    }

    for p in root.rglob("*"):
        if p.is_file():
            try:
                rel_path = p.relative_to(root)
                rel_str = str(rel_path).replace("\\", "/")
                
                if not spec.match_file(rel_str) and p.stat().st_size > 0:
                    if p.suffix in allowed_suffixes:
                        if not include_patterns or any(rel_str == inc or rel_str.startswith(inc) for inc in include_patterns):
                            files.append(rel_str)
            except Exception:
                continue

    return {
        "project": root.resolve().name if base_dir else Path.cwd().name,
        "structure": files
    }