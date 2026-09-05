# Troubleshooting
- **429 Rate Limit**: The pipeline automatically backs off and retries up to 2 times for temporary limits. If TPD (Tokens Per Day) is exhausted, it halts but preserves the cache.
- **413 Payload Too Large**: Code chunks are truncated to 4000 characters and retried.
- **Missing config**: Run `doclify init` if `doclify.yaml` is not found.
