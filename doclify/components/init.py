import yaml
import os
from pathlib import Path
from rich.console import Console
from doclify.utils.scanner import scan_repo
from doclify.utils.logger import get_logger
from doclify.config.constants import LiteLLMConfig

logger = get_logger(__name__)
console = Console()

def init_project(base_dir: Path = None):
    """
    Initializing or Re-Initializing the Doclify Project    
    """
    root = Path(base_dir) if base_dir else Path.cwd()
    logger.info(f"Init sequence started. Directory: {root}")
    config_path = root / "doclify.yaml"
    is_reinit = config_path.exists()

    try:        
        with console.status("[bold cyan]Analyzing[/bold cyan] Repository Structure", spinner="dots"):
            repo_structure = scan_repo(base_dir=root)
        
        logger.info(f"Scan complete. Found {len(repo_structure.get('structure', []))} File Nodes.")

        # 3. Handling .gitignore
        gitignore_path = root / ".gitignore"
        doclify_ignores = [".doclify/", "doclify.yaml"]
        
        try:
            lines = []
            if gitignore_path.exists():
                content = gitignore_path.read_text(encoding="utf-8")
                lines = [line.strip() for line in content.splitlines() if line.strip()]
            
            added_any = False
            for entry in doclify_ignores:
                if entry not in lines:
                    lines.append(entry)
                    added_any = True
                    logger.info(f"Adding {entry} to .gitignore")

            if added_any or not gitignore_path.exists():
                with open(gitignore_path, "w", encoding="utf-8") as f:
                    f.write("\n".join(lines) + "\n")
                logger.info(".gitignore updated successfully")

        except Exception as git_err:
            logger.warning(f"Could not update .gitignore: {git_err}")

        # 4. Customizing the Yaml File
        existing_config = {}
        if is_reinit:
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    existing_config = yaml.safe_load(f) or {}
            except Exception as e:
                logger.warning(f"Could not read existing config: {e}")

        llm_defaults = {
            "model": LiteLLMConfig.DEFAULT_MODEL
        }
        
        llm_config = {**llm_defaults, **existing_config.get("llm", {})}
        
        final_config = {
            "project": existing_config.get("project") or repo_structure.get("project", root.resolve().name),
            "structure": repo_structure.get("structure", []),
            "llm": llm_config
        }

        # 5. Writing the Yaml Configuration
        try:
            with open(config_path, "w", encoding="utf-8") as f:
                yaml.dump(final_config, f, default_flow_style=False, sort_keys=False)
            logger.info(f"Configuration written to {config_path}")
        
        except Exception as write_err:
            logger.error(f"Failed to write configuration: {write_err}")
            raise

    except Exception as e:
        logger.error(f"Doclify Initialization Failed: {str(e)}", exc_info=True)
        console.print(f"\n[bold red]✖ Error:[/bold red] Failed to Initialize Doclify. {str(e)}")
        return None

    # 6. Displaying Success Message
    action = "Reinitialized" if is_reinit else "Initialized"
    console.print(f"[bold green]✔ {action}[/bold green] [blue]{config_path}[/blue]")
    console.print(f"\n[bold cyan]Next steps[/bold cyan]")
    console.print(f"  • Review [blue]{config_path}[/blue] to customize included files")
    console.print(f"  • Run [bold green]doclify run[/bold green] to generate documentation")
    
    logger.info(f"Init process completed successfully.")
    return final_config

