import os
import io
import json
import time
import shutil
import zipfile
import subprocess
import urllib.request
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks, Query
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

from doclify import __version__
from doclify.config.constants import LiteLLMConfig
from doclify.components.init import init_project
from doclify.components.run import run_docs
from doclify.components.update import update_docs
from doclify.components.config import update_config
from doclify.utils.file_utils import load_cache, get_cache_paths
from doclify.utils.scanner import scan_repo
from doclify.utils.logger import get_logger

# Load environment variables
load_dotenv()

logger = get_logger("doclify.server")

app = FastAPI(
    title="Doclify API",
    description="AI Developer Platform API for Codebase Documentation & Intelligence",
    version=__version__
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WORKSPACE_ROOT = Path(".doclify_workspace").resolve()
WORKSPACE_PROJECTS_DIR = WORKSPACE_ROOT / "projects"
WORKSPACE_ROOT.mkdir(parents=True, exist_ok=True)
WORKSPACE_PROJECTS_DIR.mkdir(parents=True, exist_ok=True)
PROJECTS_REGISTRY_FILE = WORKSPACE_ROOT / "projects_registry.json"


def get_projects_registry() -> Dict[str, Any]:
    if PROJECTS_REGISTRY_FILE.exists():
        try:
            return json.loads(PROJECTS_REGISTRY_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def save_projects_registry(registry: Dict[str, Any]):
    PROJECTS_REGISTRY_FILE.write_text(json.dumps(registry, indent=2), encoding="utf-8")


def resolve_project_path(project_id: str) -> Optional[Path]:
    if project_id == "current" or project_id == "local-active":
        return Path.cwd().resolve()
    
    registry = get_projects_registry()
    if project_id in registry:
        path = Path(registry[project_id].get("path", "")).resolve()
        if path.exists():
            return path
            
    # Check workspace directory
    proj_dir = (WORKSPACE_PROJECTS_DIR / project_id).resolve()
    if proj_dir.exists():
        return proj_dir
        
    return None


def get_project_stats(project_path: Path) -> Dict[str, Any]:
    doclify_yaml = project_path / "doclify.yaml"
    readme_path = project_path / "README.md"
    cache_dir, cache_file = get_cache_paths(project_path)
    
    has_config = doclify_yaml.exists()
    has_readme = readme_path.exists()
    has_cache = cache_file.exists()
    
    cached_summaries_count = 0
    cache_data = {}
    if has_cache:
        cache_data = load_cache(base_dir=project_path)
        cached_summaries_count = len(cache_data.get("files", {}))

    # Scan structure
    scan_info = scan_repo(base_dir=project_path)
    files = scan_info.get("structure", [])
    
    # Calculate languages
    languages: Dict[str, int] = {}
    for f in files:
        ext = Path(f).suffix.lower() or "other"
        languages[ext] = languages.get(ext, 0) + 1
        
    # Read README preview if exists
    readme_snippet = ""
    readme_updated_at = None
    if has_readme:
        try:
            readme_text = readme_path.read_text(encoding="utf-8", errors="ignore")
            readme_snippet = readme_text[:500]
            readme_updated_at = readme_path.stat().st_mtime
        except Exception:
            pass

    # Read previous versions
    versions_dir = project_path / ".doclify" / "generated_artifacts"
    version_count = len(list(versions_dir.glob("*.md"))) if versions_dir.exists() else 0

    return {
        "files_count": len(files),
        "cached_summaries_count": cached_summaries_count,
        "has_config": has_config,
        "has_readme": has_readme,
        "has_cache": has_cache,
        "languages": languages,
        "readme_snippet": readme_snippet,
        "readme_updated_at": readme_updated_at,
        "version_count": version_count
    }


# Models
class CreateLocalProjectRequest(BaseModel):
    path: str
    name: Optional[str] = None


class CreateGitHubProjectRequest(BaseModel):
    url: str
    name: Optional[str] = None


class SetDefaultModelRequest(BaseModel):
    model: str
    project_id: Optional[str] = "current"


class UpdateFileRequest(BaseModel):
    file_path: str
    model: Optional[str] = None


@app.get("/api/health")
def get_health():
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    return {
        "status": "online",
        "version": __version__,
        "has_api_key": bool(api_key),
        "current_directory": str(Path.cwd().resolve()),
        "current_project_name": Path.cwd().name
    }


@app.get("/api/models")
def get_models():
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        # Fallback default models if API key is not yet set
        return {
            "models": [
                {"id": "llama-3.3-70b-versatile", "developer": "Meta", "context": "128k", "max_output": "8k"},
                {"id": "llama-3.1-8b-instant", "developer": "Meta", "context": "128k", "max_output": "8k"},
                {"id": "qwen/qwen3-32b", "developer": "Alibaba", "context": "32k", "max_output": "4k"},
                {"id": "mixtral-8x7b-32768", "developer": "Mistral", "context": "32k", "max_output": "4k"},
                {"id": "gemma2-9b-it", "developer": "Google", "context": "8k", "max_output": "4k"}
            ],
            "configured_default": LiteLLMConfig.DEFAULT_MODEL,
            "has_api_key": False
        }
    
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        models_response = client.models.list()
        models_sorted = sorted(
            models_response.data,
            key=lambda x: (str(getattr(x, 'owned_by', 'Unknown') or 'Unknown').lower(), str(getattr(x, 'id', '')).lower())
        )
        model_list = []
        for md in models_sorted:
            ctx = getattr(md, 'context_window', None)
            ctx_str = f"{ctx // 1024}k" if ctx and ctx >= 1024 else str(ctx or "N/A")
            out = getattr(md, 'max_completion_tokens', None)
            out_str = f"{out // 1024}k" if out and out >= 1024 else str(out or "N/A")
            model_list.append({
                "id": getattr(md, 'id', 'Unknown'),
                "developer": getattr(md, 'owned_by', 'Unknown'),
                "context": ctx_str,
                "max_output": out_str
            })
        return {
            "models": model_list,
            "configured_default": LiteLLMConfig.DEFAULT_MODEL,
            "has_api_key": True
        }
    except Exception as e:
        logger.error(f"Failed to fetch models from Groq: {e}")
        return {
            "models": [
                {"id": "llama-3.3-70b-versatile", "developer": "Meta", "context": "128k", "max_output": "8k"},
                {"id": "qwen/qwen3-32b", "developer": "Alibaba", "context": "32k", "max_output": "4k"}
            ],
            "configured_default": LiteLLMConfig.DEFAULT_MODEL,
            "error": str(e),
            "has_api_key": True
        }


@app.post("/api/config/default-model")
def set_default_model(req: SetDefaultModelRequest):
    project_path = resolve_project_path(req.project_id)
    if not project_path:
        raise HTTPException(status_code=404, detail="Project not found")
    
    success = update_config(model=req.model, base_dir=project_path)
    return {"status": "updated", "model": req.model, "success": bool(success)}


@app.get("/api/projects")
def list_projects():
    projects = []
    
    # 1. Current Active Project (root repo)
    current_path = Path.cwd().resolve()
    current_stats = get_project_stats(current_path)
    projects.append({
        "id": "current",
        "name": current_path.name,
        "path": str(current_path),
        "is_active_repo": True,
        "created_at": time.time(),
        "stats": current_stats
    })
    
    # 2. Registry Projects
    registry = get_projects_registry()
    for pid, pdata in registry.items():
        if pid == "current":
            continue
        path = Path(pdata.get("path", "")).resolve()
        if path.exists() and path != current_path:
            stats = get_project_stats(path)
            projects.append({
                "id": pid,
                "name": pdata.get("name", path.name),
                "path": str(path),
                "is_active_repo": False,
                "created_at": pdata.get("created_at", time.time()),
                "source_type": pdata.get("source_type", "local"),
                "stats": stats
            })
            
    return {"projects": projects}


@app.post("/api/projects/create/local")
def create_local_project(req: CreateLocalProjectRequest):
    target_path = Path(req.path).resolve()
    if not target_path.exists() or not target_path.is_dir():
        raise HTTPException(status_code=400, detail="Provided path is not a valid directory")
    
    # Prevent traversal outside allowed scope if configured
    project_name = req.name.strip() if req.name and req.name.strip() else target_path.name
    project_id = f"proj-{int(time.time())}-{abs(hash(str(target_path))) % 10000}"
    
    # Initialize doclify in target if not already initialized
    init_project(base_dir=target_path)
    
    registry = get_projects_registry()
    registry[project_id] = {
        "name": project_name,
        "path": str(target_path),
        "source_type": "local",
        "created_at": time.time()
    }
    save_projects_registry(registry)
    
    return {
        "id": project_id,
        "name": project_name,
        "path": str(target_path),
        "stats": get_project_stats(target_path)
    }


@app.post("/api/projects/create/upload")
async def create_upload_project(file: UploadFile = File(...), name: Optional[str] = Form(None)):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only ZIP files are supported")
    
    base_name = name.strip() if name and name.strip() else Path(file.filename).stem
    project_id = f"upload-{int(time.time())}-{abs(hash(file.filename)) % 10000}"
    dest_dir = WORKSPACE_PROJECTS_DIR / project_id
    dest_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        content = await file.read()
        with zipfile.ZipFile(io.BytesIO(content)) as zip_ref:
            # Prevent zip slip
            for member in zip_ref.namelist():
                member_path = (dest_dir / member).resolve()
                if not str(member_path).startswith(str(dest_dir.resolve())):
                    raise HTTPException(status_code=400, detail="Invalid ZIP archive structure (Zip Slip attempt)")
            zip_ref.extractall(dest_dir)
            
        # Check if single top-level directory was extracted
        entries = list(dest_dir.iterdir())
        if len(entries) == 1 and entries[0].is_dir():
            actual_root = entries[0]
        else:
            actual_root = dest_dir

        init_project(base_dir=actual_root)

        registry = get_projects_registry()
        registry[project_id] = {
            "name": base_name,
            "path": str(actual_root),
            "source_type": "zip_upload",
            "created_at": time.time()
        }
        save_projects_registry(registry)

        return {
            "id": project_id,
            "name": base_name,
            "path": str(actual_root),
            "stats": get_project_stats(actual_root)
        }
    except Exception as e:
        logger.error(f"Failed to process ZIP upload: {e}")
        shutil.rmtree(dest_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Failed to extract project: {str(e)}")


@app.post("/api/projects/create/github")
def create_github_project(req: CreateGitHubProjectRequest):
    url = req.url.strip()
    if not url.startswith("https://github.com/"):
        raise HTTPException(status_code=400, detail="Must be a valid GitHub URL (https://github.com/user/repo)")
    
    repo_name = url.rstrip("/").split("/")[-1].replace(".git", "")
    project_name = req.name.strip() if req.name and req.name.strip() else repo_name
    project_id = f"gh-{int(time.time())}-{abs(hash(url)) % 10000}"
    dest_dir = WORKSPACE_PROJECTS_DIR / project_id
    
    try:
        # Clone using git CLI if available, with depth 1
        res = subprocess.run(["git", "clone", "--depth", "1", url, str(dest_dir)], capture_output=True, text=True, timeout=60)
        if res.returncode != 0:
            raise ValueError(f"Git clone failed: {res.stderr}")
            
        init_project(base_dir=dest_dir)

        registry = get_projects_registry()
        registry[project_id] = {
            "name": project_name,
            "path": str(dest_dir),
            "source_type": "github",
            "created_at": time.time(),
            "url": url
        }
        save_projects_registry(registry)

        return {
            "id": project_id,
            "name": project_name,
            "path": str(dest_dir),
            "stats": get_project_stats(dest_dir)
        }
    except Exception as e:
        logger.error(f"GitHub import failed: {e}")
        shutil.rmtree(dest_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Failed to clone GitHub repository: {str(e)}")


@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    project_path = resolve_project_path(project_id)
    if not project_path:
        raise HTTPException(status_code=404, detail="Project not found")
    
    stats = get_project_stats(project_path)
    config_file = project_path / "doclify.yaml"
    config_data = {}
    if config_file.exists():
        try:
            import yaml
            config_data = yaml.safe_load(config_file.read_text(encoding="utf-8")) or {}
        except Exception:
            pass

    return {
        "id": project_id,
        "name": project_path.name,
        "path": str(project_path),
        "stats": stats,
        "config": config_data
    }


@app.get("/api/projects/{project_id}/files")
def get_project_files(project_id: str):
    project_path = resolve_project_path(project_id)
    if not project_path:
        raise HTTPException(status_code=404, detail="Project not found")
    
    scan_info = scan_repo(base_dir=project_path)
    structure = scan_info.get("structure", [])
    cache = load_cache(base_dir=project_path)
    files_cache = cache.get("files", {})
    
    result_files = []
    for f in structure:
        norm = os.path.normpath(f).replace("\\", "/")
        summary = files_cache.get(norm, files_cache.get(f, ""))
        file_full_path = project_path / f
        size_bytes = 0
        if file_full_path.exists():
            try:
                size_bytes = file_full_path.stat().st_size
            except Exception:
                pass
                
        result_files.append({
            "path": f,
            "name": Path(f).name,
            "extension": Path(f).suffix.lower(),
            "has_summary": bool(summary.strip()),
            "summary": summary,
            "size_bytes": size_bytes
        })
        
    return {
        "project_id": project_id,
        "total_files": len(result_files),
        "files": result_files
    }


@app.get("/api/projects/{project_id}/file-content")
def get_file_content(project_id: str, file_path: str = Query(...)):
    project_path = resolve_project_path(project_id)
    if not project_path:
        raise HTTPException(status_code=404, detail="Project not found")
    
    target = (project_path / file_path).resolve()
    # Security check: must reside inside project
    if not str(target).startswith(str(project_path.resolve())):
        raise HTTPException(status_code=403, detail="Access denied: outside project scope")
        
    if not target.exists():
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        content = target.read_text(encoding="utf-8", errors="ignore")
        return {"path": file_path, "content": content, "size": len(content)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {e}")


@app.get("/api/projects/{project_id}/readme")
def get_project_readme(project_id: str):
    project_path = resolve_project_path(project_id)
    if not project_path:
        raise HTTPException(status_code=404, detail="Project not found")
    
    readme_path = project_path / "README.md"
    if not readme_path.exists():
        return {
            "exists": False,
            "content": "",
            "history": []
        }
    
    content = readme_path.read_text(encoding="utf-8", errors="ignore")
    
    # Check history
    version_dir = project_path / ".doclify" / "generated_artifacts"
    history = []
    if version_dir.exists():
        for p in sorted(version_dir.glob("*.md"), key=lambda x: x.stat().st_mtime, reverse=True):
            history.append({
                "filename": p.name,
                "created_at": p.stat().st_mtime,
                "size_bytes": p.stat().st_size
            })
            
    return {
        "exists": True,
        "content": content,
        "last_updated": readme_path.stat().st_mtime,
        "history": history
    }


@app.post("/api/projects/{project_id}/analyze")
async def analyze_project(project_id: str, model: Optional[str] = None):
    """
    Executes the REAL Doclify analysis pipeline and streams live SSE progress events.
    """
    project_path = resolve_project_path(project_id)
    if not project_path:
        raise HTTPException(status_code=404, detail="Project not found")

    async def event_generator():
        import queue
        import threading
        
        event_queue = queue.Queue()

        def progress_listener(data: dict):
            event_queue.put(data)

        def worker():
            try:
                # Ensure initialized
                doclify_yaml = project_path / "doclify.yaml"
                if not doclify_yaml.exists():
                    event_queue.put({"phase": "init", "progress": 0.05, "message": "Initializing Doclify configuration..."})
                    init_project(base_dir=project_path)

                # Run docs
                success = run_docs(model=model, base_dir=project_path, progress_callback=progress_listener)
                if not success:
                    event_queue.put({"phase": "error", "progress": 1.0, "message": "Doclify pipeline encountered an error."})
            except Exception as e:
                logger.error(f"Analysis worker error: {e}", exc_info=True)
                event_queue.put({"phase": "error", "progress": 1.0, "message": str(e)})
            finally:
                event_queue.put(None)  # Sentinel

        thread = threading.Thread(target=worker, daemon=True)
        thread.start()

        while True:
            try:
                # Poll queue
                item = event_queue.get(timeout=0.5)
                if item is None:
                    break
                yield f"data: {json.dumps(item)}\n\n"
            except queue.Empty:
                if not thread.is_alive():
                    break
                # Keep-alive heartbeat
                yield f": heartbeat\n\n"
                
    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/api/projects/{project_id}/update-file")
def update_project_file(project_id: str, req: UpdateFileRequest):
    project_path = resolve_project_path(project_id)
    if not project_path:
        raise HTTPException(status_code=404, detail="Project not found")

    events = []
    def progress_listener(data: dict):
        events.append(data)

    success = update_docs(
        path=req.file_path,
        model=req.model,
        base_dir=project_path,
        progress_callback=progress_listener,
        auto_confirm_readme=True
    )

    readme_data = get_project_readme(project_id)
    return {
        "success": bool(success),
        "events": events,
        "readme": readme_data.get("content", "")
    }


@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str):
    if project_id == "current":
        raise HTTPException(status_code=400, detail="Cannot delete current active workspace project")
        
    registry = get_projects_registry()
    if project_id in registry:
        pdata = registry.pop(project_id)
        save_projects_registry(registry)
        
        # If in workspace directory, remove folder
        proj_dir = WORKSPACE_PROJECTS_DIR / project_id
        if proj_dir.exists():
            shutil.rmtree(proj_dir, ignore_errors=True)
            
        return {"status": "deleted", "id": project_id}
        
    raise HTTPException(status_code=404, detail="Project not found in registry")


# Mount static frontend build if it exists
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        target_file = frontend_dist / full_path
        if target_file.is_file():
            return FileResponse(str(target_file))
        return FileResponse(str(frontend_dist / "index.html"))


def start_server(host="127.0.0.1", port=8000, reload=False):
    import uvicorn
    logger.info(f"Starting Doclify API Server on http://{host}:{port}")
    uvicorn.run("doclify.server:app", host=host, port=port, reload=reload)


if __name__ == "__main__":
    start_server()
