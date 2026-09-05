# Doclify Project Overview
Doclify is an AI-powered documentation generator for Python projects (and other codebases) that creates comprehensive living documentation using a two-stage map-reduce approach to LLM summarization. It targets developers wanting zero context loss documentation.

## Core Features
- Local caching (`.doclify/cache.json`) for zero API waste on untouched files.
- Two-stage Map-Reduce: Stage 1 creates file summaries, Stage 2 synthesizes the README.
- CLI and Web Dashboard (Verdant styled) support.
- Groq AI integration for fast inference.
