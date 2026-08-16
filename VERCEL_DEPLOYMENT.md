# Vercel Deployment & Production Architecture Audit

## 1. Executive Summary

Doclify is an AI developer platform combining a **React + Vite Frontend** and a **FastAPI / Python AI Backend Engine**. 

To deploy Doclify reliably in production, we analyzed the runtime characteristics of Vercel and the stateful/ephemeral requirements of the Doclify AI engine.

---

## 2. Architecture & Environment Audit

| Component | Local Behavior | Vercel Runtime Constraints | Adaptation Strategy |
| :--- | :--- | :--- | :--- |
| **Frontend SPA** | Vite dev proxy (`:3000` $\rightarrow$ `:8000`) | Edge / Static CDN Hosting with SPA Routing (`vercel.json`) | Native Vercel deployment. Configurable `VITE_API_BASE_URL` with zero hardcoded URLs. |
| **FastAPI Backend** | Long-running Uvicorn process | Serverless Python Functions (10–60s max execution timeout) | Expose FastAPI via `api/index.py` serverless handler or connect to persistent container (e.g. Render/Railway). |
| **Filesystem / Cache** | Local `.doclify_workspace` & `.doclify/cache.json` on disk | Read-only filesystem except `/tmp` (ephemeral across invocations) | Dynamically redirect workspace root to `/tmp/.doclify_workspace` in serverless environments. |
| **SSE Streaming** | Long-lived `text/event-stream` with Python background thread | Serverless functions close connections after timeout | Provide heartbeat keep-alives and bounded file execution. |
| **API Keys** | Loaded from `.env` via `load_dotenv()` | Injected via Vercel Environment Variables (`GROQ_API_KEY`) | Server-side only; never leaked into client bundles. |
| **CLI Engine** | Standalone Python CLI (`doclify`) | Not applicable on Vercel | Completely preserved for local terminal use. |

---

## 3. Deployment Architecture Decision

### Option A: Serverless Monorepo on Vercel
* Frontend and Python backend hosted in the same Vercel project.
* `api/index.py` delegates requests to `doclify.server:app`.
* Workspaces and caches use ephemeral `/tmp` storage.
* Suitable for fast repository inspections and single-file documentation.

### Option B: Decoupled Production Architecture (Recommended for Large Repos)
* **Frontend:** Hosted on Vercel with lightning-fast CDN caching and custom domain routing.
* **Backend:** Hosted on a persistent container platform (e.g. Render, Railway, or Docker VM) to support unlimited execution time for massive 100+ file codebases.
* **Communication:** Connected via `VITE_API_BASE_URL` with secure CORS policies.

---

## 4. Security & Compliance Checklist

- [x] **Zero Client-Side Secrets:** `GROQ_API_KEY` is strictly server-side.
- [x] **Sandboxing:** Path traversal protection enforced on all file preview and update endpoints.
- [x] **Zip Slip Defense:** Safe archive extraction with path verification.
- [x] **Configurable CORS:** Accepts production Vercel domains while preserving local dev (`localhost:3000`).
- [x] **Rate Limit Categorization:** Differentiates TPD (Daily token quota) from TPM (Request size) and temporary burst limits.
