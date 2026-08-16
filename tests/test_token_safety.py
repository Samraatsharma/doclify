import json
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
from doclify.config.constants import TokenBudgetConfig
from doclify.utils.extract import (
    extract_file_content, 
    extract_lockfile_summary, 
    extract_large_json_summary, 
    is_minified,
    chunk_text_by_lines
)
from doclify.utils.llm import generate_doc

def test_token_budget_constants():
    assert TokenBudgetConfig.MAX_CHUNK_CHARS <= 15000
    assert TokenBudgetConfig.RETRY_CHUNK_CHARS <= 5000
    assert TokenBudgetConfig.MAX_FILE_SIZE == 1_000_000

def test_package_lock_extraction(tmp_path):
    # Create sample large package-lock.json
    lock_data = {
        "name": "enterprise-app",
        "version": "2.0.0",
        "lockfileVersion": 3,
        "packages": {
            "": {
                "dependencies": {
                    "react": "^18.2.0",
                    "express": "^4.19.2",
                    "groq-sdk": "^0.3.0"
                },
                "devDependencies": {
                    "vite": "^5.0.0",
                    "tailwindcss": "^3.4.0"
                }
            }
        }
    }
    lock_file = tmp_path / "package-lock.json"
    lock_file.write_text(json.dumps(lock_data), encoding="utf-8")
    
    chunks = extract_file_content("package-lock.json", base_dir=tmp_path)
    assert len(chunks) == 1
    content = chunks[0]
    
    # Should be compact, highly structured, and contain direct dependencies
    assert "react: ^18.2.0" in content
    assert "express: ^4.19.2" in content
    assert "vite: ^5.0.0" in content
    assert len(content) < 3000  # Well below token limit!

def test_large_source_file_chunking(tmp_path):
    # Create a >25,000 character python file
    lines = [f"def function_{i}():\n    return 'result_{i}' * 25\n" for i in range(500)]
    py_content = "".join(lines)
    assert len(py_content) > 20000
    
    py_file = tmp_path / "large_module.py"
    py_file.write_text(py_content, encoding="utf-8")
    
    chunks = extract_file_content("large_module.py", base_dir=tmp_path)
    # Must be partitioned into chunks <= MAX_CHUNK_CHARS
    assert len(chunks) >= 2
    for chunk in chunks:
        assert len(chunk) <= TokenBudgetConfig.MAX_CHUNK_CHARS + 500

def test_minified_file_detection(tmp_path):
    # Single-line 5,000 char minified code
    minified_code = "var a=1,b=2,c=3;" + "function x(){return a+b+c;}" * 100
    min_file = tmp_path / "bundle.min.js"
    min_file.write_text(minified_code, encoding="utf-8")
    
    assert is_minified(minified_code)
    chunks = extract_file_content("bundle.min.js", base_dir=tmp_path)
    assert len(chunks) == 1
    assert "Minified/Compiled Asset" in chunks[0]

def test_large_json_schema_extraction(tmp_path):
    # >20,000 character JSON
    data = {f"key_{i}": {"id": i, "value": f"value_{i}" * 10, "nested": [1, 2, 3, 4, 5]} for i in range(400)}
    json_str = json.dumps(data)
    assert len(json_str) > 20000
    
    json_file = tmp_path / "large_data.json"
    json_file.write_text(json_str, encoding="utf-8")
    
    chunks = extract_file_content("large_data.json", base_dir=tmp_path)
    assert len(chunks) == 1
    assert "Structured JSON File" in chunks[0]
    assert len(chunks[0]) < TokenBudgetConfig.MAX_CHUNK_CHARS

@patch("doclify.utils.llm._call_groq_api")
def test_llm_413_retry_with_reduced_context(mock_call):
    # Mock first call raising 413, second call succeeding
    mock_call.side_effect = [
        Exception("413 Request too large for model llama-3.3-70b-versatile. TPM limit: 12000"),
        "This file provides authentication and user session handling."
    ]
    
    with patch.dict("os.environ", {"GROQ_API_KEY": "gsk_test_key"}):
        result = generate_doc(
            code_content="const auth = true;\n" * 500,
            prompt_type="batch_summary"
        )
        
    assert "authentication and user session" in result
    assert mock_call.call_count == 2

@patch("doclify.utils.llm._call_groq_api")
def test_tpd_daily_quota_exhaustion_aborts_immediately(mock_call):
    from doclify.utils.llm import DailyQuotaExhaustedError
    # Mock TPD quota exhaustion error from Groq
    mock_call.side_effect = Exception("Rate limit reached for model llama-3.3-70b-versatile on tokens per day (tpd): limit 100000, used 100000")
    
    with patch.dict("os.environ", {"GROQ_API_KEY": "gsk_test_key"}):
        with pytest.raises(DailyQuotaExhaustedError) as exc_info:
            generate_doc(code_content="const x = 1;", prompt_type="batch_summary")
            
    assert "daily token limit reached" in str(exc_info.value).lower()
    # Must NOT retry multiple times for daily quota exhaustion!
    assert mock_call.call_count == 1

@patch("doclify.utils.llm._call_groq_api")
def test_temporary_rate_limit_backoff_retry(mock_call):
    # Mock temporary burst rate limit (429 without TPD) followed by success
    mock_call.side_effect = [
        Exception("429 Too Many Requests: Rate limit reached. Please try again in 1s."),
        "Summary generated successfully."
    ]
    
    with patch.dict("os.environ", {"GROQ_API_KEY": "gsk_test_key"}), patch("time.sleep"):
        result = generate_doc(code_content="const y = 2;", prompt_type="batch_summary")
        
    assert "Summary generated successfully" in result
    assert mock_call.call_count == 2

