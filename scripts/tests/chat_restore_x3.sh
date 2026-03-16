#!/usr/bin/env bash
# CHAT_SEND_RESTORE_X3 — Test cycle create/save/restore x3 sur SQLite direct
# Scénario: INSERT events → SELECT → vérifier count + contenu
# Classe NOT_RUN si sqlite3 absent ou DB non trouvée (runtime Tauri requis pour la créer)
# Audit TITANE∞ — ULTIMATE — 2026-03-16

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DB_PATH="${TITANE_CONVOS_DB_PATH:-$HOME/.local/share/TITANE_INFINITY/runtime/memory/conversation_os_v1.db}"
PASS=0; FAIL=0; NOT_RUN=0
TIMESTAMP=$(date +%s)
TEST_CONV_BASE="test-restore-x3-${TIMESTAMP}"

# Cleanup on exit
cleanup() {
  if command -v sqlite3 &>/dev/null && [ -f "$DB_PATH" ]; then
    sqlite3 "$DB_PATH" "DELETE FROM events WHERE conversation_id LIKE 'test-restore-x3-%';" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# Guard: sqlite3 available
if ! command -v sqlite3 &>/dev/null; then
  echo "NOT_RUN: sqlite3 not available in PATH"
  NOT_RUN=3
  echo "CHAT_SEND_RESTORE_X3: PASS=$PASS FAIL=$FAIL NOT_RUN=$NOT_RUN"
  exit 0
fi

# Guard: DB exists (only created by Tauri runtime)
if [ ! -f "$DB_PATH" ]; then
  echo "NOT_RUN: DB not found at $DB_PATH — start Tauri app once to create it"
  NOT_RUN=3
  echo "CHAT_SEND_RESTORE_X3: PASS=$PASS FAIL=$FAIL NOT_RUN=$NOT_RUN"
  exit 0
fi

echo "DB found at $DB_PATH — running x3 write/read/verify cycles"
echo ""

for i in 1 2 3; do
  CONV_ID="${TEST_CONV_BASE}-run${i}"
  TS_USER=$(( TIMESTAMP + i * 10 ))
  TS_ASST=$(( TIMESTAMP + i * 10 + 1 ))

  # Write user + assistant events
  sqlite3 "$DB_PATH" \
    "INSERT OR IGNORE INTO events(id,ts,conversation_id,kind,payload) \
     VALUES('evt-u-${TIMESTAMP}-${i}',${TS_USER},'${CONV_ID}','user_message',\
     '{\"message\":\"hello run ${i}\",\"request_id\":\"r${i}\",\"trace\":null}');"
  sqlite3 "$DB_PATH" \
    "INSERT OR IGNORE INTO events(id,ts,conversation_id,kind,payload) \
     VALUES('evt-a-${TIMESTAMP}-${i}',${TS_ASST},'${CONV_ID}','assistant_message',\
     '{\"message\":\"hi back run ${i}\",\"request_id\":\"r${i}\",\"trace\":null}');"

  # Verify count
  COUNT=$(sqlite3 "$DB_PATH" \
    "SELECT COUNT(*) FROM events WHERE conversation_id='${CONV_ID}' AND kind IN ('user_message','assistant_message');")

  # Verify content
  MSG=$(sqlite3 "$DB_PATH" \
    "SELECT json_extract(payload,'$.message') FROM events \
     WHERE conversation_id='${CONV_ID}' AND kind='user_message' LIMIT 1;")

  # Verify ordering (user before assistant)
  FIRST_KIND=$(sqlite3 "$DB_PATH" \
    "SELECT kind FROM events WHERE conversation_id='${CONV_ID}' ORDER BY ts ASC LIMIT 1;")

  if [ "$COUNT" -eq 2 ] && [ "$MSG" = "hello run ${i}" ] && [ "$FIRST_KIND" = "user_message" ]; then
    echo "  RUN $i [PASS] write/read/verify OK (count=$COUNT, msg='$MSG', order=$FIRST_KIND)"
    PASS=$((PASS+1))
  else
    echo "  RUN $i [FAIL] count=$COUNT msg='$MSG' first_kind='$FIRST_KIND'"
    FAIL=$((FAIL+1))
  fi
done

echo ""
echo "CHAT_SEND_RESTORE_X3: PASS=$PASS FAIL=$FAIL NOT_RUN=$NOT_RUN"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
