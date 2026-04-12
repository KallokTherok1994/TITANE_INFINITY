#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ — E2E Backend Validation Script
#   Validates: RAG embeddings backend + Web search backend
#   Requires: running Ollama instance + optional SearXNG
#   Usage: bash scripts/e2e/validate-new-backends.sh [--ollama-url URL] [--search-url URL]
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────────
OLLAMA_URL="${TITANE_OLLAMA_URL:-http://127.0.0.1:11434}"
SEARCH_URL="${TITANE_SEARCH_API_URL:-http://127.0.0.1:8888}"
EMBED_MODEL="${TITANE_EMBED_MODEL:-nomic-embed-text}"

# ── Argument parsing ──────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --ollama-url) OLLAMA_URL="$2"; shift 2 ;;
    --search-url) SEARCH_URL="$2"; shift 2 ;;
    --embed-model) EMBED_MODEL="$2"; shift 2 ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

# ── Result tracking ───────────────────────────────────────────────
PASS=0
FAIL=0
SKIP=0

pass() { echo "  ✅ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL + 1)); }
skip() { echo "  ⏭  $1"; SKIP=$((SKIP + 1)); }

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  TITANE∞ — E2E Backend Validation"
echo "  Ollama URL : $OLLAMA_URL"
echo "  Search URL : $SEARCH_URL"
echo "  Embed model: $EMBED_MODEL"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ─────────────────────────────────────────────────────────────────
# 1. Validate Ollama embeddings endpoint
# ─────────────────────────────────────────────────────────────────
echo "── Check 1: Ollama Embeddings Endpoint ──────────────────────────"
EMBED_RESPONSE=$(curl -s --max-time 10 -X POST "$OLLAMA_URL/api/embeddings" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"$EMBED_MODEL\",\"prompt\":\"test\"}" 2>/dev/null || echo "CURL_FAILED")

if [[ "$EMBED_RESPONSE" == "CURL_FAILED" ]]; then
  fail "EMBEDDING_BACKEND_FAIL — could not reach Ollama at $OLLAMA_URL"
else
  EMBED_LEN=$(echo "$EMBED_RESPONSE" | jq '.embedding | length' 2>/dev/null || echo "0")
  if [[ "$EMBED_LEN" =~ ^[0-9]+$ ]] && [[ "$EMBED_LEN" -gt 0 ]]; then
    pass "EMBEDDING_BACKEND_OK — embedding length=$EMBED_LEN"
  else
    fail "EMBEDDING_BACKEND_FAIL — response did not contain a valid embedding array (len=$EMBED_LEN)"
    echo "     Response: $(echo "$EMBED_RESPONSE" | head -c 200)"
  fi
fi
echo ""

# ─────────────────────────────────────────────────────────────────
# 2. Validate web search endpoint (optional — skip if unavailable)
# ─────────────────────────────────────────────────────────────────
echo "── Check 2: Web Search Endpoint (SearXNG) ───────────────────────"
SEARCH_RESPONSE=$(curl -s --max-time 5 "$SEARCH_URL/search?q=test&format=json" 2>/dev/null || echo "CURL_FAILED")

if [[ "$SEARCH_RESPONSE" == "CURL_FAILED" ]]; then
  skip "WEB_SEARCH_SKIPPED (no SearXNG at $SEARCH_URL)"
else
  RESULT_COUNT=$(echo "$SEARCH_RESPONSE" | jq '.results | length' 2>/dev/null || echo "-1")
  if [[ "$RESULT_COUNT" =~ ^[0-9]+$ ]]; then
    if [[ "$RESULT_COUNT" -gt 0 ]]; then
      pass "WEB_SEARCH_OK — $RESULT_COUNT results returned"
    else
      skip "WEB_SEARCH_SKIPPED — SearXNG reachable but returned 0 results (may need to configure engines)"
    fi
  else
    skip "WEB_SEARCH_SKIPPED (no SearXNG at $SEARCH_URL)"
  fi
fi
echo ""

# ─────────────────────────────────────────────────────────────────
# 3. Validate IPC contract compliance (static file check)
# ─────────────────────────────────────────────────────────────────
echo "── Check 3: IPC Contract Compliance ─────────────────────────────"

RAG_CMD="src-tauri/src/commands/rag_commands.rs"
if [[ ! -f "$RAG_CMD" ]]; then
  fail "IPC_CONTRACT_FAIL — $RAG_CMD not found"
elif grep -qE 'pub ok: bool' "$RAG_CMD" && \
     grep -qE 'pub content' "$RAG_CMD" && \
     grep -qE 'pub error' "$RAG_CMD"; then
  pass "IPC_CONTRACT_OK — $RAG_CMD follows { ok, content, error } pattern"
else
  fail "IPC_CONTRACT_FAIL — $RAG_CMD does not follow canonical IPC contract"
fi

WEB_CMD="src-tauri/src/commands/web_search_commands.rs"
if [[ ! -f "$WEB_CMD" ]]; then
  fail "IPC_CONTRACT_FAIL — $WEB_CMD not found"
elif grep -qE 'pub ok: bool' "$WEB_CMD" && \
     grep -qE 'pub content' "$WEB_CMD" && \
     grep -qE 'pub error' "$WEB_CMD"; then
  pass "IPC_CONTRACT_OK — $WEB_CMD follows { ok, content, error } pattern"
else
  fail "IPC_CONTRACT_FAIL — $WEB_CMD does not follow canonical IPC contract"
fi
echo ""

# ─────────────────────────────────────────────────────────────────
# 4. Validate chunking service
# ─────────────────────────────────────────────────────────────────
echo "── Check 4: Chunking Service ────────────────────────────────────"

CHUNK_SVC="src/services/chunkingService.ts"
if [[ ! -f "$CHUNK_SVC" ]]; then
  fail "CHUNKING_SERVICE_FAIL — $CHUNK_SVC not found"
elif grep -q "export.*function chunkMarkdown\|export.*chunkMarkdown" "$CHUNK_SVC" && \
     grep -q "export.*function chunkCode\|export.*chunkCode" "$CHUNK_SVC"; then
  pass "CHUNKING_SERVICE_OK — $CHUNK_SVC exports chunkMarkdown and chunkCode"
else
  fail "CHUNKING_SERVICE_FAIL — $CHUNK_SVC missing required exports (chunkMarkdown, chunkCode)"
fi
echo ""

# ─────────────────────────────────────────────────────────────────
# 5. Summary
# ─────────────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════════"
echo "  SUMMARY"
echo "  PASS=$PASS  FAIL=$FAIL  SKIP=$SKIP"
echo "═══════════════════════════════════════════════════════════════"

if [[ $FAIL -gt 0 ]]; then
  echo "  STATUS: FAIL — $FAIL required check(s) failed"
  exit 1
else
  echo "  STATUS: PASS — all required checks passed (${SKIP} skipped)"
  exit 0
fi
