from dataclasses import dataclass

@dataclass
class LiteLLMConfig:
    DEFAULT_MODEL: str = "llama-3.3-70b-versatile"

@dataclass
class TokenBudgetConfig:
    # Safe character limits (1 token is roughly 3.5 - 4 characters of code/JSON)
    MAX_CHUNK_CHARS: int = 12000          # ~3,000 tokens (well below 12,000 TPM limit)
    RETRY_CHUNK_CHARS: int = 4000         # ~1,000 tokens on 413 fallback retry
    SAFE_PROMPT_HEADROOM: int = 2000      # Reserve headroom for prompt instructions & system rules
    MAX_FILE_SIZE: int = 1_000_000        # 1MB file size ceiling
    MAX_LOCKFILE_ENTRIES: int = 60        # Max dependencies to extract from lockfiles
    REQUEST_PACING_DELAY: float = 0.35    # Delay in seconds between API calls to prevent TPM burst
    MAX_RETRIES: int = 2                  # Number of retries on 413/429 errors