# Interview Guide
**Q: Why a two-stage pipeline?**
A: To prevent context window overflow and reduce costs. Summarizing individual files creates dense representations. Synthesizing these summaries produces the final README without sending the entire raw codebase to the LLM at once.

**Q: How does caching work?**
A: `.doclify/cache.json` stores summaries per file path. If a file hasn't changed (or if a summary exists), the API call is skipped, saving tokens.
