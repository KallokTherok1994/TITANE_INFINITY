#!/usr/bin/env bash
# V6 — Restore no-duplication guard
# Vérifie:
#   1. useChat.ts contient une déduplication dans le backend-restore useEffect
#   2. load_conversation_history est enregistré dans main.rs generate_handler!
#   3. list_restorable_conversations est enregistré dans main.rs generate_handler!
#   4. Le useEffect backend-restore contient un guard messages.length > 0
# Audit TITANE∞ — ULTIMATE — 2026-03-16

set -euo pipefail
PASS=0; FAIL=0
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Check 1: dedup guard in useChat.ts
if grep -q "existingKeys\|dedup\|filter.*timestamp.*role\|filter.*role.*timestamp\|content\.slice" \
    "$REPO_ROOT/src/hooks/useChat.ts"; then
  echo "  CHECK [PASS] Duplication guard found in useChat.ts"; PASS=$((PASS+1))
else
  echo "  CHECK [FAIL] No deduplication guard in useChat.ts backend-restore useEffect"; FAIL=$((FAIL+1))
fi

# Check 2: load_conversation_history registered
if grep -q "load_conversation_history" "$REPO_ROOT/src-tauri/src/main.rs"; then
  echo "  CHECK [PASS] load_conversation_history registered in main.rs"; PASS=$((PASS+1))
else
  echo "  CHECK [FAIL] load_conversation_history NOT found in main.rs"; FAIL=$((FAIL+1))
fi

# Check 3: list_restorable_conversations registered
if grep -q "list_restorable_conversations" "$REPO_ROOT/src-tauri/src/main.rs"; then
  echo "  CHECK [PASS] list_restorable_conversations registered in main.rs"; PASS=$((PASS+1))
else
  echo "  CHECK [FAIL] list_restorable_conversations NOT found in main.rs"; FAIL=$((FAIL+1))
fi

# Check 4: messages.length guard present in backend-restore
if grep -q "messages\.length > 0.*return\|Already have messages" "$REPO_ROOT/src/hooks/useChat.ts"; then
  echo "  CHECK [PASS] messages.length guard found in backend-restore"; PASS=$((PASS+1))
else
  echo "  CHECK [FAIL] No messages.length guard — risk of silent overwrite"; FAIL=$((FAIL+1))
fi

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "▶ V6 Restore no-duplication guard     [PASS]"
  exit 0
else
  echo "▶ V6 Restore no-duplication guard     [FAIL] PASS=$PASS FAIL=$FAIL"
  exit 1
fi
