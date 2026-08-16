import yaml
import time
import os
from typing import Optional
from pathlib import Path
from rich.console import Console
from doclify.utils.extract import extract_file_content
from doclify.utils.llm import generate_doc
from doclify.utils.file_utils import load_cache, save_cache, clean_cache
from doclify.config.constants import LiteLLMConfig, TokenBudgetConfig
from doclify.schema.schema import LLMConfig
from doclify.utils.readme import generate_readme_file
from doclify.utils.logger import get_logger

# Initialize production-level logger and clean console
logger = get_logger(__name__)
console = Console()

def run_docs(model=None, provider=None, base_dir: Path = None, progress_callback=None):
    """
    Generates documentation with a 200k token-based batching strategy.
    """
    root = Path(base_dir) if base_dir else Path.cwd()
    logger.info(f"Starting documentation generation pipeline. Directory: {root}, Overrides: model={model}")
    start_time = time.time()

    def report_progress(phase: str, progress: float, message: str, **kwargs):
        if progress_callback:
            try:
                progress_callback({
                    "phase": phase,
                    "progress": progress,
                    "message": message,
                    **kwargs
                })
            except Exception as cb_err:
                logger.warning(f"Progress callback error: {cb_err}")

    report_progress("init", 0.05, "Validating configuration...")

    # 1. Yaml Config Validation
    config_path = root / "doclify.yaml"
    if not config_path.exists():
        logger.warning(f"Configuration file {config_path} missing.")
        console.print("[bold red]✖ Error:[/bold red] [blue]doclify.yaml[/blue] not found. Run [bold green]doclify init[/bold green] first.")
        report_progress("error", 1.0, "doclify.yaml not found")
        return False

    try:
        config = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
        logger.info("doclify.yaml found and loaded successfully.")

        files = config.get("structure", [])
        llm_model = config.get("llm", {}).get("model", "")
        generate_readme = True

        if not llm_model or not llm_model.strip():
            llm_model = LiteLLMConfig.DEFAULT_MODEL
        
        llm_config_data = config.get("llm", {})
        llm_config = LLMConfig(**llm_config_data)

        if model:
            llm_config.model = model
        if provider:
            llm_config.provider = provider

        session_id = time.strftime("%Y-%m-%d_%H-%M:%S")
        project_name = config.get("project", root.resolve().name)
        llm_metadata = {"session_id": session_id, "project_name": project_name}

        if not files:
            logger.warning("No files found in doclify.yaml structure.")
            console.print("[bold yellow]⚠ Warning:[/bold yellow] No files found in [blue]doclify.yaml[/blue]")
            report_progress("error", 1.0, "No files configured in doclify.yaml")
            return False

        # 2.3 Cache Handling
        report_progress("cache_init", 0.15, "Loading cache...")
        cache = load_cache(base_dir=root)

        if "files" not in cache:
            cache["files"] = {}
        
        for f in files:
            if f not in cache["files"]:
                cache["files"][f] = ""
        
        cache = clean_cache(cache, files)
        save_cache(cache, base_dir=root)

        console.print(f"[bold cyan]Found[/bold cyan] [white]{len(files)} Files[/white] to Process")
        
        extracted_files = []
        
        # 3. File Reading Phase
        report_progress("extracting", 0.25, f"Extracting {len(files)} repository files...")
        with console.status("[bold cyan]Extracting[/bold cyan] Repository Files", spinner="dots"):
            for file_path in files:
                chunks = extract_file_content(file_path, base_dir=root)
                if not any(c.startswith("Error") or c.startswith("File not found") for c in chunks):
                    tokens = sum(len(c) for c in chunks) // 4
                    extracted_files.append({"path": file_path, "chunks": chunks, "tokens": tokens})
                else:
                    logger.warning(f"Skipping {file_path} due to extraction errors.")
            
        if not extracted_files:
            logger.error("No valid file content found to process.")
            console.print("[bold yellow]⚠ Warning:[/bold yellow] No valid file content found to process.")
            report_progress("error", 1.0, "No valid files could be extracted")
            return False

        # 4. Processing Each Extracted File and Generating Summaries
        def process_file(item, llm_config: Optional[LLMConfig] = None, metadata: Optional[dict] = None):
            file_path = item["path"]
            chunks = item["chunks"]
            summaries = []
            
            for chunk in chunks:
                try:
                    summary = generate_doc(
                        code_content=chunk, 
                        prompt_type="batch_summary", 
                        llm_config=llm_config,
                        metadata=metadata
                    )
                    if summary:
                        summaries.append(summary.strip())
                except Exception as e:
                    from doclify.utils.llm import DailyQuotaExhaustedError
                    if isinstance(e, DailyQuotaExhaustedError):
                        raise e
                    logger.error(f"Error processing chunk for {file_path}: {str(e)}", exc_info=True)
            
            return item, "\n\n".join(summaries) if summaries else ""

        total_files = len(extracted_files)
        processed_count = 0

        try:
            for item in extracted_files:
                current_path = item["path"]
                norm_path = os.path.normpath(current_path).replace("\\", "/")
                
                # Check if valid summary already exists in cache
                existing_summary = cache.get("files", {}).get(norm_path, "")
                
                pct = 0.30 + (0.50 * (processed_count / max(total_files, 1)))
                is_large = any(len(c) > 5000 for c in item.get("chunks", []))
                
                if is_large or Path(current_path).name.lower() in {"package-lock.json", "yarn.lock", "pnpm-lock.yaml"}:
                    msg = f"Optimizing large file ({processed_count + 1}/{total_files}): {current_path}"
                else:
                    msg = f"Analyzing ({processed_count + 1}/{total_files}): {current_path}"

                report_progress(
                    "summarizing", 
                    pct, 
                    msg,
                    current_file=current_path,
                    processed=processed_count,
                    total=total_files
                )

                if existing_summary and len(existing_summary.strip()) > 10:
                    logger.info(f"Reusing cached summary for {current_path}")
                else:
                    with console.status(f"[bold cyan]Summarizing[/bold cyan] ({processed_count + 1}/{total_files}): {current_path}...", spinner="dots"):
                        item_ret, summary = process_file(item, llm_config=llm_config, metadata=llm_metadata)
                    
                    if summary:
                        cache["files"][norm_path] = summary
                        # Save cache incrementally to preserve progress
                        save_cache(cache, base_dir=root)
                    
                    # Pacing delay to avoid Groq TPM burst limits
                    time.sleep(TokenBudgetConfig.REQUEST_PACING_DELAY)
                    
                processed_count += 1

        except Exception as file_loop_err:
            from doclify.utils.llm import DailyQuotaExhaustedError
            if isinstance(file_loop_err, DailyQuotaExhaustedError):
                save_cache(cache, base_dir=root)
                quota_msg = "Groq daily token limit reached. Completed summaries have been preserved in cache. Resume the analysis after the quota resets or switch models in Settings."
                console.print(f"\n[bold yellow]⚠ Quota Limit:[/bold yellow] {quota_msg}")
                report_progress("error", 0.95, quota_msg, is_tpd=True)
                return False
            raise file_loop_err
        
        save_cache(cache, base_dir=root)
        report_progress("cache_saved", 0.82, "Cache updated with file summaries.")

        # Final README generation
        final_readme = ""
        if generate_readme:
            report_progress("synthesizing", 0.88, "Synthesizing comprehensive README...")
            final_readme = generate_readme_file(cache, config, llm_config=llm_config, metadata=llm_metadata, base_dir=root)
        
        duration = time.time() - start_time
        console.print(f"[bold green]Generated[/bold green] README.md in [white]{duration:.1f} secs[/white]")
        logger.info(f"Pipeline completed successfully in {duration:.2f}s")
        
        report_progress(
            "complete", 
            1.0, 
            f"Documentation generated successfully in {duration:.1f}s",
            duration=duration,
            readme=final_readme
        )
        return True

    except Exception as e:
        logger.critical(f"Pipeline failed: {str(e)}", exc_info=True)
        console.print(f"[bold red]✖ Failed[/bold red] to generate Documentation: {e}")
        report_progress("error", 1.0, f"Pipeline failed: {str(e)}")
        return False

