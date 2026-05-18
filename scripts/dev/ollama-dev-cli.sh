#!/usr/bin/env bash
# Ollama Dev CLI — Unified console entry point for TITANE∞ Ollama Dev
# Usage:
#   bash scripts/dev/ollama-dev-cli.sh [command]
#
# Commands:
#   status         Check if Ollama Dev server is running and qwen3.5:9b is available
#   chat           Interactive chat with qwen3.5:9b
#   run <prompt>   One-shot prompt to qwen3.5:9b
#   pull           Pull or update qwen3.5:9b model
#   logs           Recent Ollama Dev server logs
#   help           Show this help

set -euo pipefail

OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
OLLAMA_DEV_MODEL="${OLLAMA_DEV_MODEL:-qwen3.5:9b}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_ollama() {
  if ! command -v ollama &> /dev/null; then
    echo -e "${RED}❌ Ollama CLI not found. Install ollama first.${NC}"
    return 1
  fi
}

check_server() {
  if curl -sf "$OLLAMA_HOST/api/tags" > /dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

cmd_status() {
  echo -e "${BLUE}════════════════════════════════════════${NC}"
  echo -e "${BLUE}  Ollama Dev — Status Report${NC}"
  echo -e "${BLUE}════════════════════════════════════════${NC}"
  echo ""

  # Check ollama CLI
  echo -n "Ollama CLI: "
  if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✅ $(ollama --version 2>&1 | head -1)${NC}"
  else
    echo -e "${RED}❌ Not found${NC}"
  fi

  # Check server
  echo -n "Ollama Server ($OLLAMA_HOST): "
  if check_server; then
    echo -e "${GREEN}✅ Running${NC}"
    # Show qwen3.5 availability
    if curl -sf "$OLLAMA_HOST/api/tags" | jq -e '.models[] | select(.name | startswith("qwen3.5"))' > /dev/null 2>&1; then
      echo -e "  Model ${OLLAMA_DEV_MODEL}: ${GREEN}✅ Available${NC}"
    else
      echo -e "  Model ${OLLAMA_DEV_MODEL}: ${YELLOW}⚠️  Not pulled yet${NC}"
      echo -e "  Run: ${BLUE}bash $0 pull${NC}"
    fi
  else
    echo -e "${RED}❌ DOWN${NC}"
    echo -e "  Start with: ${BLUE}ollama serve${NC}"
  fi

  echo ""

  # Router check
  echo "Router connectivity:"
  # VSCode/Copilot MCP
  if [ -f "$PROJECT_ROOT/.vscode/mcp.json" ]; then
    echo -e "  VSCode/Copilot MCP: ${GREEN}✅ Configured${NC} (ollama-dev -> $OLLAMA_DEV_MODEL)"
  else
    echo -e "  VSCode/Copilot MCP: ${YELLOW}⚠️  No config found${NC}"
  fi

  # Cline
  if [ -f "$PROJECT_ROOT/.clinerules/50-ollama-dev.md" ]; then
    echo -e "  Cline: ${GREEN}✅ Configured${NC} (rules active)"
  else
    echo -e "  Cline: ${YELLOW}⚠️  No config found${NC}"
  fi

  # Total Dev
  if [ -f "$PROJECT_ROOT/src-tauri/src/commands/total_dev_commands.rs" ]; then
    echo -e "  Total Dev: ${GREEN}✅ Backend present${NC}"
  else
    echo -e "  Total Dev: ${YELLOW}⚠️  No backend found${NC}"
  fi

  # Console (this script)
  echo -e "  Console CLI: ${GREEN}✅ Active${NC} ($0)"

  echo ""
  echo -e "Host: $OLLAMA_HOST"
  echo -e "Model: $OLLAMA_DEV_MODEL"
}

cmd_chat() {
  check_ollama
  if ! check_server; then
    echo -e "${RED}❌ Ollama server is not running at $OLLAMA_HOST${NC}"
    echo -e "Start with: ${BLUE}ollama serve${NC}"
    exit 1
  fi
  echo -e "${GREEN}Starting chat with $OLLAMA_DEV_MODEL...${NC}"
  echo -e "${YELLOW}(Press Ctrl+D or type /exit to quit)${NC}"
  echo ""
  ollama run "$OLLAMA_DEV_MODEL"
}

cmd_run() {
  check_ollama
  if ! check_server; then
    echo -e "${RED}❌ Ollama server is not running at $OLLAMA_HOST${NC}"
    exit 1
  fi
  prompt="$*"
  if [ -z "$prompt" ]; then
    echo -e "${YELLOW}Usage: bash $0 run \"your prompt here\"${NC}"
    exit 1
  fi
  echo -e "${BLUE}Prompt:${NC} $prompt"
  echo -e "${BLUE}Model:${NC} $OLLAMA_DEV_MODEL"
  echo -e "${BLUE}─────${NC}"
  ollama run "$OLLAMA_DEV_MODEL" "$prompt"
}

cmd_pull() {
  check_ollama
  echo -e "${BLUE}Pulling/updating $OLLAMA_DEV_MODEL...${NC}"
  ollama pull "$OLLAMA_DEV_MODEL"
  echo -e "${GREEN}Done.${NC}"
}

cmd_logs() {
  if [ -f "$PROJECT_ROOT/.clinerules/logs/ollama-dev.log" ]; then
    tail -30 "$PROJECT_ROOT/.clinerules/logs/ollama-dev.log"
  else
    echo -e "${YELLOW}No Ollama Dev logs found yet.${NC}"
  fi
}

cmd_help() {
  echo "Ollama Dev CLI — TITANE∞"
  echo ""
  echo "Usage: bash $0 [command]"
  echo ""
  echo "Commands:"
  echo "  status         Check Ollama Dev server and model status"
  echo "  chat           Interactive chat with qwen3.5:9b"
  echo "  run <prompt>   One-shot prompt to qwen3.5:9b"
  echo "  pull           Pull/update qwen3.5:9b model"
  echo "  logs           Show recent Ollama Dev Cline logs"
  echo "  help           Show this help"
  echo ""
  echo "Environment:"
  echo "  OLLAMA_HOST      (default: http://127.0.0.1:11434)"
  echo "  OLLAMA_DEV_MODEL (default: qwen3.5:9b)"
}

# Main dispatch
case "${1:-help}" in
  status)   cmd_status ;;
  chat)     cmd_chat ;;
  run)      shift; cmd_run "$@" ;;
  pull)     cmd_pull ;;
  logs)     cmd_logs ;;
  help|--help|-h) cmd_help ;;
  *)
    echo -e "${RED}Unknown command: $1${NC}"
    cmd_help
    exit 1
    ;;
esac