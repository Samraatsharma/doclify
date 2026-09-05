# Security Analysis
## API Keys
- `GROQ_API_KEY`: Read from `.env`. Never exposed to frontend. Used by `llm.py` to authenticate with Groq.

## Vulnerabilities & Protections
- **ZipSlip**: `server.py` validates paths during ZIP extraction.
- **Path Traversal**: Resolves project paths and ensures file operations stay within the project root.
- **Missing**: Rate limiting on the FastAPI routes themselves (DDoS vulnerability).
