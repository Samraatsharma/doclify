# Backend Architecture
FastAPI application (`server.py`).

## Responsibilities
- REST API and Server-Sent Events (SSE) for progress streaming.
- File system isolation in `.doclify_workspace` or Vercel `/tmp`.
- Git clone operations and Zip extraction (with ZipSlip protection).
- Orchestrating the `doclify.components.run` AI pipeline.
