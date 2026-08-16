from __future__ import annotations
import json
import os
import re
import time
from typing import Optional, Any, Union, Dict, List
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

from doclify.utils.utils import get_prompt
from doclify.utils.logger import get_logger
from doclify.schema.schema import LLMConfig
from doclify.config.constants import LiteLLMConfig, TokenBudgetConfig

logger = get_logger(__name__)


class DailyQuotaExhaustedError(Exception):
    """Raised when Groq daily token allowance (TPD) is exhausted."""
    pass


def get_chat_model(llm_config: Optional[LLMConfig] = None) -> str:
    """
    Returns the target model name. Defaulting to LiteLLMConfig.DEFAULT_MODEL if none specified.
    """
    raw_model = llm_config.model if llm_config else LiteLLMConfig.DEFAULT_MODEL
    if not raw_model or not raw_model.strip():
        raw_model = LiteLLMConfig.DEFAULT_MODEL
        
    logger.info(f"Targeting Groq model: {raw_model}")
    return raw_model


def _call_groq_api(client: Groq, model_name: str, content: str) -> str:
    """Sends a single streaming chat completion request to Groq and accumulates text."""
    kwargs = {
        "model": model_name,
        "messages": [{"role": "user", "content": content}],
        "stream": True,
        "temperature": 0
    }
    response = client.chat.completions.create(**kwargs)
    message_content = ""
    for chunk in response:
        if getattr(chunk.choices[0].delta, "content", None) is not None:
            message_content += chunk.choices[0].delta.content
            
    # Strip deepseek / reasoner thinking tokens
    return re.sub(r'<think>.*?</think>', '', message_content, flags=re.DOTALL).strip()


def generate_doc(
    code_content: str, 
    prompt_type: str, 
    llm_config: Optional[LLMConfig] = None,
    metadata: Optional[dict] = None
) -> str:    
    """
    Generates documentation content using Groq API with strict token budgeting,
    rate limit category separation, and intelligent error handling.
    """
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        raise ValueError("Missing GROQ_API_KEY. Please configure your environment variables in .env first.")

    model_name = get_chat_model(llm_config)
    prompt_text = get_prompt(prompt_type)
    
    if prompt_type == "final_summary":
        project_name = metadata.get("project_name", os.path.basename(os.getcwd())) if metadata else os.path.basename(os.getcwd())
        try:
            prompt_text = prompt_text.format(project_name=project_name)
        except (KeyError, ValueError):
            prompt_text = prompt_text.replace("{project_name}", project_name)
    
    # Safe truncation of payload to guarantee token budget headroom
    max_safe_content_len = TokenBudgetConfig.MAX_CHUNK_CHARS + 2000
    if len(code_content) > max_safe_content_len:
        logger.warning(f"Payload length {len(code_content)} exceeds safe limit. Truncating to {max_safe_content_len} chars.")
        code_content = code_content[:max_safe_content_len] + "\n... [Remaining content summarized for token safety]"

    content = f"{prompt_text}\n\n[FILE CONTENT START]\n{code_content}\n[FILE CONTENT END]"
    client = Groq(api_key=api_key)
    
    retries = 0
    current_content = content
    
    while retries <= TokenBudgetConfig.MAX_RETRIES:
        try:
            logger.info(f"Sending request to Groq API with model {model_name} (Payload size: {len(current_content)} chars, Attempt: {retries + 1})")
            result = _call_groq_api(client, model_name, current_content)
            return result

        except Exception as e:
            err_str = str(e).lower()
            logger.warning(f"Groq API call encountered error (Attempt {retries + 1}/{TokenBudgetConfig.MAX_RETRIES + 1}): {err_str}")
            
            # CATEGORY 1: Daily Token Allowance (TPD) Exhaustion
            # Immediately abort retries; immediate retries cannot resolve daily quota exhaustion.
            is_tpd = ("tokens per day" in err_str or "tpd" in err_str or "tokens per day (tpd)" in err_str)
            if is_tpd:
                logger.error("Groq Tokens-Per-Day (TPD) quota exhausted. Aborting immediate retries to preserve state.")
                raise DailyQuotaExhaustedError(
                    "Groq daily token limit reached. Completed summaries have been preserved in cache. Resume the analysis after the quota resets or switch models in Settings."
                )

            # CATEGORY 2: 413 (Payload Too Large) or TPM Limit Exceeded
            elif "413" in err_str or "too large" in err_str or "tpm limit" in err_str:
                retries += 1
                if retries <= TokenBudgetConfig.MAX_RETRIES:
                    logger.info(f"413 Request size exceeded. Reducing context size to {TokenBudgetConfig.RETRY_CHUNK_CHARS} chars and retrying...")
                    compacted_code = code_content[:TokenBudgetConfig.RETRY_CHUNK_CHARS] + "\n... [Truncated for token limit]"
                    current_content = f"{prompt_text}\n\n[FILE CONTENT START]\n{compacted_code}\n[FILE CONTENT END]"
                    time.sleep(1.0)
                    continue
                else:
                    logger.error(f"Failed to summarize file after reducing context: {e}")
                    return "This file contains large configuration, dependency tree, or data records essential to the project build and runtime environment."

            # CATEGORY 3: Temporary Rate Limit (Burst / Short-term 429)
            elif "429" in err_str or "rate limit" in err_str:
                retries += 1
                if retries <= TokenBudgetConfig.MAX_RETRIES:
                    backoff_time = 2.0 * retries
                    logger.info(f"Temporary rate limit (429). Backing off for {backoff_time}s and retrying...")
                    time.sleep(backoff_time)
                    continue
                else:
                    logger.error(f"Rate limit exceeded after retries: {e}")
                    return "This file contributes to the project structure and dependencies."

            # CATEGORY 4: Unrecoverable / Other API Error
            else:
                logger.error(f"Unrecoverable error from Groq: {err_str}", exc_info=True)
                raise ValueError(f"Failed to generate documentation: {err_str}")
                
    return "This file defines project components and dependencies."
