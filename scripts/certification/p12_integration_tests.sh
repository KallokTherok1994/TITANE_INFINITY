#!/bin/bash
# P12: INTEGRATION TESTS — Ollama, LLM Backend, Conversation Chains

set -e

REPO_ROOT="/home/titane-os/Documents/GitHub/TITANE_INFINITY"
PACK_DIR="${1:-.}"

cd "$REPO_ROOT"

P12_LOG="$PACK_DIR/P12_INTEGRATION_TESTS.txt"
exec 1> >(tee "$P12_LOG")
exec 2>&1

echo "════════════════════════════════════════════════════════════"
echo "P12: INTEGRATION TEST SUITE"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Timestamp: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
echo "Pack: $PACK_DIR"
echo ""

# ===== TEST 1: Ollama Connectivity =====
echo "=== Test 1: Ollama Endpoint Availability ==="
if timeout 3 curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
  echo "✅ Ollama endpoint reachable at localhost:11434"
  
  echo ""
  echo "Fetching available models..."
  curl -s http://127.0.0.1:11434/api/tags | jq '.models[].name' | head -5 || echo "  (parsing):error"
else
  echo "❌ Ollama endpoint NOT reachable"
  echo "  Attempting to start Ollama..."
  
  if command -v ollama &> /dev/null; then
    ollama serve > /tmp/ollama.log 2>&1 &
    OLLAMA_PID=$!
    echo "  Started Ollama (PID: $OLLAMA_PID)"
    sleep 5
    
    if timeout 3 curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
      echo "✅ Ollama now available after auto-start"
    else
      echo "❌ Ollama still not responding"
    fi
  else
    echo "❌ Ollama not installed"
  fi
fi

# ===== TEST 2: Model Inference =====
echo ""
echo "=== Test 2: Model Inference Test ==="
echo "Testing LLM response generation..."

RESPONSE=$(timeout 10 curl -s -X POST http://127.0.0.1:11434/api/generate \
  -d '{
    "model": "gemma2:2b",
    "prompt": "Hello, what is 2+2?",
    "stream": false
  }' 2>/dev/null | jq '.response' | head -1)

if [ -n "$RESPONSE" ]; then
  echo "✅ Model inference successful"
  echo "  Response preview: ${RESPONSE:0:50}..."
else
  echo "❌ Model inference failed"
fi

# ===== TEST 3: Conversation Memory =====
echo ""
echo "=== Test 3: Conversation Memory Persistence ==="
echo "Checking memory database..."

MEMORY_DIR="/tmp/titane-infinity/memory"
if [ -d "$MEMORY_DIR" ]; then
  echo "✅ Memory directory exists: $MEMORY_DIR"
  
  DB_FILE=$(find "$MEMORY_DIR" -name "*.db" -o -name "*.sqlite" | head -1)
  if [ -f "$DB_FILE" ]; then
    echo "✅ Database found: $DB_FILE"
    echo "  Size: $(du -h "$DB_FILE" | cut -f1)"
  else
    echo "⚠️ No database file found"
  fi
else
  echo "⚠️ Memory directory not found (expected after first run)"
fi

# ===== TEST 4: IPC Bridge Health =====
echo ""
echo "=== Test 4: IPC Bridge Configuration ==="

if grep -q "TITANE_E2E" src-tauri/src/main.rs 2>/dev/null; then
  echo "✅ IPC guard configured"
else
  echo "⚠️ IPC guard not found in main.rs"
fi

# ===== TEST 5: Backend Ready Check =====
echo ""
echo "=== Test 5: Backend Service Health ==="
echo "Checking for backend initialization errors..."

if [ -f "reports/e2e-desktop/tauri_driver.log" ]; then
  ERRORS=$(grep -i "ERROR" "reports/e2e-desktop/tauri_driver.log" 2>/dev/null | wc -l)
  echo "  Found $ERRORS error lines in tauri_driver.log"
  
  if echo "$ERRORS" | grep -q "^[0-3]$"; then
    echo "✅ Error count acceptable"
  else
    echo "⚠️ Investigate error spikes"
  fi
else
  echo "⚠️ No tauri driver log found yet"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ P12 Integration Tests Complete"
echo "════════════════════════════════════════════════════════════"

