# Architecture
Doclify follows a modern decoupled architecture.

- **Frontend**: React 18, Vite, Tailwind CSS. Communicates via REST and SSE.
- **Backend**: FastAPI (Python), handling routing, git cloning, and file system management.
- **AI Pipeline**: Groq client processes chunks of text (max 12000 chars per chunk) using `llama-3.3-70b-versatile` by default.
- **Cache**: Local JSON-based caching (`.doclify_workspace` or `.doclify/cache.json`) prevents reprocessing of unchanged files.
