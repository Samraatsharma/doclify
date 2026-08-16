# Doclify Project Audit

## 1. Executive Summary
Doclify is a Python-based Command Line Interface (CLI) application designed to automate project documentation. It scans a local codebase (respecting `.gitignore`), extracts file contents, and employs a two-stage LLM generation pipeline using the Groq API to produce a comprehensive, production-ready `README.md`. It utilizes local caching to minimize API costs and redundant processing.

## 2. Complete Architecture
The system is built as a modular Python package with the following architectural layers:
*   **CLI Layer (Click):** Handles command routing and argument parsing.
*   **Component Layer:** Encapsulates the core business logic for each command (`init`, `run`, `update`, etc.).
*   **Utility Layer:** Handles low-level operations like file scanning, content extraction, caching, and LLM communication.
*   **Configuration & Prompts:** YAML-based project configuration (`doclify.yaml`) and plain-text prompt templates.

## 3. Repository/File Responsibility Map
*   **Entry Points:**
    *   `main.py`: Simple entry script invoking the CLI.
    *   `pyproject.toml`: Defines project metadata, dependencies, and CLI script registration (`doclify = doclify.pipelines.supervisor:cli`).
*   **CLI & Pipelines:**
    *   `doclify/pipelines/supervisor.py`: The Click CLI definition, defining groups and commands (`init`, `set`, `run`, `update`, `models`).
*   **Components (Business Logic):**
    *   `doclify/components/init.py`: Scans the repo, updates `.gitignore`, and generates `doclify.yaml`.
    *   `doclify/components/run.py`: Orchestrates the full generation pipeline (extract -> summarize -> cache -> README).
    *   `doclify/components/update.py`: Updates documentation for a single file or regenerates the README from the cache (`.`).
    *   `doclify/components/models.py`: Fetches and displays available models from the Groq API.
    *   `doclify/components/config.py`: Updates the `doclify.yaml` configuration (e.g., setting the default model).
*   **Utilities:**
    *   `doclify/utils/extract.py`: Reads files, chunks content > 40k chars, and parses Jupyter notebooks (`.ipynb`).
    *   `doclify/utils/file_utils.py`: Manages the local JSON cache (`.doclify/cache.json`).
    *   `doclify/utils/llm.py`: Interfaces with the Groq API for text generation.
    *   `doclify/utils/readme.py`: Synthesizes the final README and creates backups.
    *   `doclify/utils/scanner.py`: Uses `pathspec` to discover files while respecting `.gitignore`.
    *   `doclify/utils/logger.py`: Provides unified logging.
*   **Data & Configuration:**
    *   `doclify/schema/schema.py`: Pydantic models for configuration and expected outputs.
    *   `doclify/config/constants.py`: Constants like the default model.
    *   `doclify/prompts/batch_summary.txt`: Instructions for stage 1 (file-level summaries).
    *   `doclify/prompts/final_summary.txt`: Instructions for stage 2 (final README synthesis).

## 4. Complete Execution Flow
When a user executes `doclify run`:
1.  **CLI Invocation:** `supervisor.py` catches the `run` command and calls `run.py::run_docs()`.
2.  **Configuration Load:** Reads `doclify.yaml` to get the target file structure and LLM config.
3.  **Cache Init:** Loads `.doclify/cache.json` via `file_utils.py` and cleans stale entries.
4.  **File Discovery & Extraction:** Loops through target files, using `extract.py` to read contents and split large files into chunks (~40k chars).
5.  **Stage 1: Batch Summarization (LLM):** Iterates over chunks, calling `llm.py::generate_doc(prompt_type="batch_summary")` for each.
6.  **Caching:** Saves the generated file summaries into `cache.json`.
7.  **Stage 2: Final Synthesis (LLM):** `readme.py::generate_readme_file()` aggregates all cached summaries and calls `llm.py::generate_doc(prompt_type="final_summary")`.
8.  **Output:** Backs up any existing `README.md` and writes the newly generated content.

## 5. CLI Command Architecture
*   `doclify init`: Initializes a project, scans for files, and creates `doclify.yaml`.
*   `doclify set default <model>`: Updates the default Groq model in `doclify.yaml`.
*   `doclify run [--model] [--provider]`: Executes the full extraction and generation pipeline.
*   `doclify update <path> [--model] [--provider]`: Selectively updates the summary for a specific file or all files (if `.`), then optionally regenerates the README.
*   `doclify models`: Queries the Groq API and prints a formatted table of available models.

## 6. AI/LLM Architecture
*   **Client:** Uses the official `groq` Python SDK.
*   **Model Selection:** Defaults to a configured model (e.g., `qwen/qwen3-32b`), allowing overrides via `doclify.yaml` or CLI arguments.
*   **Pipeline:** Employs a map-reduce style approach (summarize individual files -> synthesize global document) to handle large context sizes and maintain focus.
*   **Post-processing:** Uses regex to strip reasoning tags (e.g., `<think>`) and markdown wrappers from LLM responses.

## 7. Context Engineering Architecture
*   **File Filtering:** Excludes files > 1MB automatically.
*   **Chunking:** Files exceeding ~40,000 characters are chunked. Summaries for chunks are concatenated.
*   **Jupyter Notebooks:** Code cells in `.ipynb` files are explicitly extracted and converted to plain text before processing.
*   **Context Compaction:** The final LLM call does not see the raw source code. It only sees the aggregated Stage-1 paragraph summaries for each file.

## 8. Prompt Architecture
*   **Stage 1 (`batch_summary.txt`):** Instructs the model to act as a senior technical documentation engineer. Demands exactly 3-4 sentences in plain markdown, describing file purpose, pipeline placement, and public interfaces. Forbids speculation or repetition.
*   **Stage 2 (`final_summary.txt`):** Extensive instructions for a "Senior Open-Source Maintainer." Defines tone (no fluff) and heavily structures the output into specific sections (Quick Start, Tech Stack, API Documentation, etc.). Enforces strict formatting rules (no emojis, no placeholders).

## 9. Cache Architecture
*   **Storage:** A local JSON file at `.doclify/cache.json`.
*   **Structure:** `{ "files": { "path/to/file.py": "summary text..." } }`.
*   **Invalidation:** Currently rudimentary. The `run` command cleans keys that are no longer in `doclify.yaml`. It does *not* utilize file hashing; re-running `doclify run` processes all files again unless bypassed via `doclify update .`.
*   **Artifacts:** Keeps historical generated READMEs in `.doclify/generated_artifacts/`.

## 10. Data Flow
`Repository Source Files` -> `Scanner` -> `Extractor (Text/JSON)` -> `Chunks` -> `Groq API (Batch Prompt)` -> `Summary Strings` -> `Cache JSON` -> `Aggregator` -> `Groq API (Final Prompt)` -> `README.md`.

## 11. Configuration & Environment
*   **Environment:** Relies on a `.env` file (loaded via `python-dotenv`) containing `GROQ_API_KEY`.
*   **Project Config:** `doclify.yaml` dictates project name, LLM settings, and the definitive list of files to include (`structure`).

## 12. Dependency Map
*   `click`: CLI interface construction.
*   `rich`: Terminal formatting and UI (spinners, tables).
*   `pathspec`: `.gitignore` pattern matching.
*   `pyyaml`: Configuration parsing and writing.
*   `python-dotenv`: Environment variable management.
*   `groq`: API client for LLM interaction.

## 13. Current Limitations
*   **Cache Invalidation:** Lacks hash-based or timestamp-based change detection. Users must manually specify `update <file>` to avoid redundant processing, or a full `run` rewrites everything.
*   **Provider Lock-in:** Despite CLI flags for `--provider`, the implementation in `llm.py` is hardcoded to instantiate a `Groq()` client.
*   **Chunking Strategy:** Chunking is done via basic string slicing by character count, which could break code syntax halfway through a function.
*   **Concurrency:** API calls are made synchronously in a loop. For large codebases, this is slow.

## 14. Security/Reliability Concerns
*   **Data Exfiltration:** Sends raw source code to external Groq endpoints.
*   **Rate Limiting:** Sequential processing of a large repository could hit Groq rate limits, and there is no explicit retry/backoff logic in `llm.py`.
*   **Path Traversal:** File paths are read from YAML. While normalized, robust checks against accessing files outside the repository root are minimal.

## 15. Safe Extension Points
*   **`doclify.utils.extract`:** Introduce smarter AST-based chunking.
*   **`doclify.utils.file_utils`:** Add MD5 file hashing to the cache dictionary to enable automatic incremental updates during `doclify run`.
*   **`doclify.utils.llm`:** Abstract the `Groq` client behind a provider interface (e.g., using `litellm` as hinted by `LiteLLMConfig` in constants).

## 16. Components That MUST NOT Be Broken (Original Doclify Contract)
*   **CLI Commands:** `doclify init`, `doclify set default`, `doclify run`, `doclify update`, and `doclify models` must remain fully functional with their existing argument signatures.
*   **AI Behavior:** The two-stage summarization process (map-reduce) must remain intact.
*   **Context Engineering:** `.gitignore` parsing, 1MB size filtering, and Notebook code extraction must be preserved.
*   **Cache Behavior:** The structure and location of `.doclify/cache.json` and artifact generation must remain stable.

## 17. Recommended Architecture for a Modern Web Product
To evolve Doclify into a web platform (SaaS/Desktop) while preserving the core engine:
*   **Frontend:** A modern web application (e.g., Next.js, React, Tailwind CSS) providing visual dashboards, repository onboarding, and interactive documentation viewing.
*   **Backend API:** A lightweight async API (e.g., FastAPI, Node.js/Express) that acts as the orchestration layer between the web frontend and the underlying Doclify engine.
*   **Core Engine (Existing):** The current Python package, either invoked as an imported library or a subprocess, remains the source of truth for AI analysis.

## 18. Recommended Frontend ↔ Backend ↔ Existing Engine Relationship
1.  **Frontend (UI):** User links a GitHub repo or uploads a local folder. Requests an analysis.
2.  **Backend (API):** Receives the request. Clones/mounts the repository locally on the server.
3.  **Bridge:** The Backend programmatically calls the Doclify Engine (e.g., `import doclify.components.run` or via CLI `subprocess.run(['doclify', 'run'])`).
4.  **Data Extraction:** Instead of only writing to `README.md`, the Backend reads `.doclify/cache.json` and the generated artifacts to populate a database.
5.  **Frontend (Display):** Fetches the structured data from the API to show file summaries, project insights, and the rendered README.

## 19. Recommended API Boundaries
*   **`POST /api/projects/import`**: Triggers repo clone and `doclify init`.
*   **`GET /api/projects/{id}/status`**: Returns analysis progress.
*   **`POST /api/projects/{id}/analyze`**: Triggers `doclify run`.
*   **`GET /api/projects/{id}/readme`**: Returns the generated README content.
*   **`GET /api/projects/{id}/files`**: Returns the parsed file tree and individual AI summaries from the Doclify cache.
*   **`POST /api/projects/{id}/update`**: Triggers `doclify update <path>` for webhook-based continuous documentation.

## 20. Recommended Product Architecture
*   **Individual/Local Developers:** Continue using the CLI as is.
*   **Web Platform (SaaS):**
    *   **Database:** PostgreSQL (to store users, projects, and webhook configs) + Redis (for task queues/websockets).
    *   **Worker Nodes:** Background workers (Celery/BullMQ) that execute the heavy Doclify AI pipeline asynchronously to prevent API timeouts.
    *   **Integration:** GitHub App integration for automated `doclify update` runs on pull requests, posting doc changes as PR comments.

## 21. Migration/Implementation Plan
1.  **Phase 1: Engine Refactoring (Safe):**
    *   Refactor `doclify/components/*.py` to return data (e.g., the generated markdown string or cache dict) rather than *only* printing to `rich.console`. This makes the engine programmatically consumable without breaking CLI behavior.
2.  **Phase 2: API Development:**
    *   Initialize a new backend service (FastAPI) inside the repo (e.g., `/api` or `/server`).
    *   Expose endpoints that wrap the Doclify python functions.
3.  **Phase 3: Frontend Development:**
    *   Initialize a Next.js/Vite frontend (e.g., `/web` or `/client`).
    *   Build the repository import flow and dashboard UI.
4.  **Phase 4: Webhook & Automation:**
    *   Implement GitHub webhooks in the backend to trigger file-specific `update_docs(path)` when commits are pushed, ensuring living documentation.
