# AI Pipeline
The AI pipeline utilizes Groq's fast inference capabilities.

1. **Extraction**: `extract_file_content` reads code, skipping lockfiles or binaries.
2. **Chunking**: Code is chunked if it exceeds 12000 characters to prevent 413 or TPM limits.
3. **Stage 1 (Batch Summary)**: Each file/chunk is summarized using the `batch_summary` prompt. Summaries are cached.
4. **Stage 2 (Final Synthesis)**: The accumulated summaries are passed to `generate_readme_file` with the `final_summary` prompt to create `README.md`.
