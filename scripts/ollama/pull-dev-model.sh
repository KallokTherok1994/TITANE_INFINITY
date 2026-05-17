#!/usr/bin/env bash
set -euo pipefail

MODEL="${TITANE_OLLAMA_DEV_MODEL:-qwen3.5:9b}"
ollama pull "$MODEL"
