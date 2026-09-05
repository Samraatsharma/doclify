import os

docs_dir = 'docs'
os.makedirs(docs_dir, exist_ok=True)

docs = {
    "PROJECT_OVERVIEW.md": """# Doclify Project Overview
Doclify is an AI-powered documentation generator for Python projects (and other codebases) that creates comprehensive living documentation using a two-stage map-reduce approach to LLM summarization. It targets developers wanting zero context loss documentation.

## Core Features
- Local caching (`.doclify/cache.json`) for zero API waste on untouched files.
- Two-stage Map-Reduce: Stage 1 creates file summaries, Stage 2 synthesizes the README.
- CLI and Web Dashboard (Verdant styled) support.
- Groq AI integration for fast inference.
""",
    "ARCHITECTURE.md": """# Architecture
Doclify follows a modern decoupled architecture.

- **Frontend**: React 18, Vite, Tailwind CSS. Communicates via REST and SSE.
- **Backend**: FastAPI (Python), handling routing, git cloning, and file system management.
- **AI Pipeline**: Groq client processes chunks of text (max 12000 chars per chunk) using `llama-3.3-70b-versatile` by default.
- **Cache**: Local JSON-based caching (`.doclify_workspace` or `.doclify/cache.json`) prevents reprocessing of unchanged files.
""",
    "AI_PIPELINE.md": """# AI Pipeline
The AI pipeline utilizes Groq's fast inference capabilities.

1. **Extraction**: `extract_file_content` reads code, skipping lockfiles or binaries.
2. **Chunking**: Code is chunked if it exceeds 12000 characters to prevent 413 or TPM limits.
3. **Stage 1 (Batch Summary)**: Each file/chunk is summarized using the `batch_summary` prompt. Summaries are cached.
4. **Stage 2 (Final Synthesis)**: The accumulated summaries are passed to `generate_readme_file` with the `final_summary` prompt to create `README.md`.
""",
    "API_REFERENCE.md": """# API Reference
- `GET /api/health`: Health check.
- `GET /api/models`: List available Groq models.
- `POST /api/config/default-model`: Set default AI model.
- `GET /api/projects`: List projects.
- `POST /api/projects/create/local`: Init local project.
- `POST /api/projects/create/upload`: Upload ZIP and init.
- `POST /api/projects/create/github`: Clone repo and init.
- `GET /api/projects/{project_id}`: Get project details.
- `POST /api/projects/{project_id}/analyze`: Run pipeline (streams SSE progress).
- `POST /api/projects/{project_id}/update-file`: Update a specific file.
- `DELETE /api/projects/{project_id}`: Delete a project.
""",
    "FRONTEND.md": """# Frontend Architecture
Built with React, Vite, and TailwindCSS.

## Key Components
- `App.jsx`: Main entry, routing between landing, dashboard, and workspace.
- `Dashboard.jsx`: Project selection and creation.
- `ProjectWorkspace.jsx`: View project stats and run analysis.
- `HeroCanvas.jsx`: Visual animation on landing.
""",
    "BACKEND.md": """# Backend Architecture
FastAPI application (`server.py`).

## Responsibilities
- REST API and Server-Sent Events (SSE) for progress streaming.
- File system isolation in `.doclify_workspace` or Vercel `/tmp`.
- Git clone operations and Zip extraction (with ZipSlip protection).
- Orchestrating the `doclify.components.run` AI pipeline.
""",
    "DEPLOYMENT.md": """# Deployment
Doclify can be deployed locally or via serverless environments.

- **Vercel**: `vercel.json` configures deployment. Due to read-only filesystem, workspace uses `/tmp`.
- **Local**: Run via `doclify server` or `uvicorn`.
""",
    "SECURITY.md": """# Security Analysis
## API Keys
- `GROQ_API_KEY`: Read from `.env`. Never exposed to frontend. Used by `llm.py` to authenticate with Groq.

## Vulnerabilities & Protections
- **ZipSlip**: `server.py` validates paths during ZIP extraction.
- **Path Traversal**: Resolves project paths and ensures file operations stay within the project root.
- **Missing**: Rate limiting on the FastAPI routes themselves (DDoS vulnerability).
""",
    "LOCAL_SETUP.md": """# Local Setup
1. Clone repo: `git clone <url>`
2. Install Python >= 3.9
3. Install uv or pip. `pip install -e .`
4. Set `.env` with `GROQ_API_KEY=your_key`
5. `cd frontend && npm install && npm run build`
6. `doclify server`
""",
    "CLI_GUIDE.md": """# CLI Guide
- `doclify init`: Initialize `doclify.yaml` configuration.
- `doclify run`: Run analysis pipeline in the current directory.
- `doclify update <file>`: Re-analyze a specific file and regenerate README.
- `doclify server`: Start the FastAPI web server.
""",
    "TROUBLESHOOTING.md": """# Troubleshooting
- **429 Rate Limit**: The pipeline automatically backs off and retries up to 2 times for temporary limits. If TPD (Tokens Per Day) is exhausted, it halts but preserves the cache.
- **413 Payload Too Large**: Code chunks are truncated to 4000 characters and retried.
- **Missing config**: Run `doclify init` if `doclify.yaml` is not found.
""",
    "INTERVIEW_GUIDE.md": """# Interview Guide
**Q: Why a two-stage pipeline?**
A: To prevent context window overflow and reduce costs. Summarizing individual files creates dense representations. Synthesizing these summaries produces the final README without sending the entire raw codebase to the LLM at once.

**Q: How does caching work?**
A: `.doclify/cache.json` stores summaries per file path. If a file hasn't changed (or if a summary exists), the API call is skipped, saving tokens.
"""
}

for filename, content in docs.items():
    with open(os.path.join(docs_dir, filename), "w") as f:
        f.write(content)

print("Created 12 docs.")
