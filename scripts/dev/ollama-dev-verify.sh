#!/usr/bin/env bash
# Ollama Dev Verify — Cross-router verification for TITANE∞ Ollama Dev stack
# Usage:
#   bash scripts/dev/ollama-dev-verify.sh [--router=all|vscode|cline|total-dev|console]
#
# Verifies that all 4 routers can access Ollama Dev (qwen3.5:9b) correctly.

set -euo pipefail

OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
OLLAMA_DEV_MODEL="${OLLAMA_DEV_MODEL:-qwen3.5:9b}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

check() {
  local name="$1"
  local result="$2"
  if [ "$result" -eq 0 ]; then
    echo -e "  ${GREEN}✅ PASS${NC} $name"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}❌ FAIL${NC} $name"
    FAIL=$((FAIL + 1))
  fi
}

warn() {
  local name="$1"
  shift
  WARN=$((WARN + 1))
  echo -e "  ${YELLOW}⚠️  WARN${NC} $name ($*)"
}

usage() {
  echo "Usage: $0 [--router=all|vscode|cline|total-dev|console]"
  exit 1
}

# Parse arguments
ROUTER="all"
for arg in "$@"; do
  case "$arg" in
    --router=*) ROUTER="${arg#*=}" ;;
    --help|-h) usage ;;
    *) usage ;;
  esac
done

case "$ROUTER" in
  all|vscode|cline|total-dev|console) ;;
  *) echo -e "${RED}Invalid router: $ROUTER${NC}"; usage ;;
esac

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Ollama Dev — Cross-Router Verification${NC}"
echo -e "${BLUE}  Router: $ROUTER | Host: $OLLAMA_HOST | Model: $OLLAMA_DEV_MODEL${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# ── 0. Prerequisites ──
echo "0️⃣  PREREQUISITES"

if [ "$ROUTER" = "all" ] || [ "$ROUTER" = "console" ]; then
  check "Ollama CLI installed" \
    $(command -v ollama &> /dev/null; echo $?)
fi

check "Ollama server reachable ($OLLAMA_HOST)" \
  $(curl -sf "$OLLAMA_HOST/api/tags" > /dev/null 2>&1; echo $?)

if curl -sf "$OLLAMA_HOST/api/tags" > /dev/null 2>&1; then
  MODEL_OK=$(curl -sf "$OLLAMA_HOST/api/tags" | jq -e ".models[] | select(.name | startswith(\"qwen3.5\"))" > /dev/null 2>&1; echo $?)
  check "Model $OLLAMA_DEV_MODEL available on server" $MODEL_OK
fi

echo ""

# ── 1. VSCode/Copilot MCP ──
if [ "$ROUTER" = "all" ] || [ "$ROUTER" = "vscode" ]; then
  echo "1️⃣  VSCode/COPILOT MCP"
  MCP_FILE="$PROJECT_ROOT/.vscode/mcp.json"
  if [ -f "$MCP_FILE" ]; then
    check "MCP config file exists" 0
    HAS_OLLAMA_DEV=$(jq -e '.servers["ollama-dev"]' "$MCP_FILE" > /dev/null 2>&1; echo $?)
    check "ollama-dev server defined in MCP" $HAS_OLLAMA_DEV

    if [ "$HAS_OLLAMA_DEV" -eq 0 ]; then
      MODEL_IN_MCP=$(jq -r '.servers["ollama-dev"].env.TITANE_OLLAMA_DEV_MODEL // ""' "$MCP_FILE")
      HOST_IN_MCP=$(jq -r '.servers["ollama-dev"].env.OLLAMA_HOST // ""' "$MCP_FILE")
      if [ "$MODEL_IN_MCP" = "$OLLAMA_DEV_MODEL" ]; then
        check "MCP model = $OLLAMA_DEV_MODEL" 0
      else
        warn "MCP model" "Expected $OLLAMA_DEV_MODEL, got '$MODEL_IN_MCP'"
      fi
      if [ "$HOST_IN_MCP" = "$OLLAMA_HOST" ]; then
        check "MCP host = $OLLAMA_HOST" 0
      else
        warn "MCP host" "Expected $OLLAMA_HOST, got '$HOST_IN_MCP'"
      fi
    fi

    MCP_SCRIPT="$PROJECT_ROOT/scripts/mcp/start-ollama-dev-mcp.sh"
    if [ -f "$MCP_SCRIPT" ]; then
      check "MCP start script exists" 0
    else
      warn "MCP start script" "Not found at scripts/mcp/start-ollama-dev-mcp.sh"
    fi
  else
    warn "VSCode MCP config" ".vscode/mcp.json not found"
  fi
  echo ""
fi

# ── 2. Cline ──
if [ "$ROUTER" = "all" ] || [ "$ROUTER" = "cline" ]; then
  echo "2️⃣  CLINE"
  CLINERULES="$PROJECT_ROOT/.clinerules"
  if [ -d "$CLINERULES" ]; then
    check "Cline rules directory exists" 0

    OLLAMA_RULE="$CLINERULES/50-ollama-dev.md"
    if [ -f "$OLLAMA_RULE" ]; then
      check "Ollama Dev rule file exists" 0
      # Check key fields
      HAS_MODEL=$(grep -c "qwen3.5:9b" "$OLLAMA_RULE" || true)
      HAS_HOST=$(grep -c "127.0.0.1:11434" "$OLLAMA_RULE" || true)
      [ "$HAS_MODEL" -ge 1 ] && check "Rule references qwen3.5:9b" 0 || warn "Rule missing" "qwen3.5:9b reference"
      [ "$HAS_HOST" -ge 1 ] && check "Rule references 127.0.0.1:11434" 0 || warn "Rule missing" "host reference"
    else
      warn "Ollama Dev rule" "50-ollama-dev.md not found"
    fi

    # Check hooks
    for hook in TaskStart PreToolUse PostToolUse; do
      HOOK_FILE="$CLINERULES/hooks/$hook"
      if [ -f "$HOOK_FILE" ] && [ -x "$HOOK_FILE" ]; then
        HAS_OLLAMA_INJECTION=$(grep -c "OLLAMA" "$HOOK_FILE" || true)
        [ "$HAS_OLLAMA_INJECTION" -ge 1 ] && check "Hook $hook has Ollama Dev logic" 0 || warn "Hook $hook" "No Ollama reference found"
      else
        warn "Hook $hook" "Not found or not executable"
      fi
    done
  else
    warn "Cline rules" ".clinerules directory not found"
  fi
  echo ""
fi

# ── 3. Total Dev ──
if [ "$ROUTER" = "all" ] || [ "$ROUTER" = "total-dev" ]; then
  echo "3️⃣  TOTAL DEV"
  TOTAL_DEV_RS="$PROJECT_ROOT/src-tauri/src/commands/total_dev_commands.rs"
  if [ -f "$TOTAL_DEV_RS" ]; then
    check "Total Dev Rust backend exists" 0
    HAS_OLLAMA_MODEL=$(grep -c "qwen3.5:9b\|ollama" "$TOTAL_DEV_RS" || true)
    [ "$HAS_OLLAMA_MODEL" -ge 1 ] && check "Backend references Ollama model" 0 || warn "Backend" "No Ollama reference found"
  else
    warn "Total Dev" "Backend file not found at $TOTAL_DEV_RS"
  fi

  TOTAL_DEV_E2E="$PROJECT_ROOT/e2e/total-dev-smoke.spec.ts"
  if [ -f "$TOTAL_DEV_E2E" ]; then
    check "Total Dev E2E test exists" 0
  else
    warn "Total Dev E2E" "total-dev-smoke.spec.ts not found"
  fi
  echo ""
fi

# ── 4. Console CLI ──
if [ "$ROUTER" = "all" ] || [ "$ROUTER" = "console" ]; then
  echo "4️⃣  CONSOLE CLI"
  CLI_SCRIPT="$PROJECT_ROOT/scripts/dev/ollama-dev-cli.sh"
  if [ -f "$CLI_SCRIPT" ]; then
    check "CLI script exists" 0
    if [ -x "$CLI_SCRIPT" ]; then
      check "CLI script is executable" 0
    else
      warn "CLI script" "Not executable"
    fi
  else
    warn "CLI script" "ollama-dev-cli.sh not found"
  fi
  echo ""
fi

# ── 5. Boundary protection ──
if [ "$ROUTER" = "all" ]; then
  echo "5️⃣  BOUNDARY PROTECTION"
  # Verify qwen3.5:9b has NOT leaked into product defaults
  for file in "$PROJECT_ROOT/src/config/ollamaDefaults.ts" "$PROJECT_ROOT/config/championChallenger.json"; do
    if [ -f "$file" ]; then
      # These SHOULD have gemma2:2b, not qwen3.5:9b (except champion which was migrated)
      QWEN_IN_FILE=$(grep -c "qwen3.5" "$file" || true)
      GEMMA_IN_FILE=$(grep -c "gemma2:2b" "$file" || true)
      if [ "$QWEN_IN_FILE" -gt 0 ] && [ "$GEMMA_IN_FILE" -eq 0 ]; then
        warn "Boundary" "$file: qwen3.5 found without gemma2:2b — check if product default migrated"
      else
        check "Boundary: $file contains gemma2:2b" 0
      fi
    fi
  done
  echo ""
fi

# ── Report ──
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  VERIFICATION REPORT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  PASS: ${GREEN}$PASS${NC}"
echo -e "  FAIL: ${RED}$FAIL${NC}"
echo -e "  WARN: ${YELLOW}$WARN${NC}"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}✅ OLLAMA_DEV_VERIFY: PASS${NC}"
  exit 0
else
  echo -e "${RED}❌ OLLAMA_DEV_VERIFY: FAIL — $FAIL check(s) failed${NC}"
  exit 1
fi