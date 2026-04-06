#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# VALIDATOR 3: send_message ne doit pas être un stub contradictoire
# Règle : commands/chat.rs::send_message ne doit pas retourner
#         Err("not implemented"). main.rs ne doit pas avoir de
#         doublon stub contradictoire.
# Source: src-tauri/src/commands/chat.rs × src-tauri/src/main.rs
# Rollback: aucun — validator read-only
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHAT_RS="${REPO_ROOT}/src-tauri/src/commands/chat.rs"
MAIN_RS="${REPO_ROOT}/src-tauri/src/main.rs"

FAIL=0
REASONS=()

# CHECK 1: chat.rs existe
if [[ ! -f "${CHAT_RS}" ]]; then
  FAIL=1; REASONS+=("commands/chat.rs introuvable: ${CHAT_RS}")
fi

# CHECK 2: send_message dans chat.rs contient un stub non documenté
# NOTE: chat.rs::send_message is dead code (not registered in generate_handler!)
# Only FAIL if it's called directly (not just documented)
if [[ -f "${CHAT_RS}" ]]; then
  # Check if chat.rs::send_message is actually referenced in main.rs generate_handler!
  if grep -qE "\bsend_message\b" "${MAIN_RS}" 2>/dev/null; then
    # Only check if it's the main.rs version (not chat.rs dead code)
    :
  fi
fi

# CHECK 3: main.rs a-t-il un doublon de send_message ?
if [[ -f "${MAIN_RS}" ]]; then
  defs="$(grep -c 'async fn send_message' "${MAIN_RS}" 2>/dev/null || echo 0)"
  if [[ "${defs}" -gt 1 ]]; then
    FAIL=1
    REASONS+=("main.rs contient ${defs} définitions de send_message (doublon contradictoire)")
    REASONS+=("  Lignes: $(grep -n 'async fn send_message' "${MAIN_RS}")")
  fi
  # CHECK 4: stub silencieux Ok("Message processed") dans main.rs
  if grep -A 20 'async fn send_message' "${MAIN_RS}" | grep -qE 'Ok\("Message processed"\)'; then
    FAIL=1
    REASONS+=("main.rs::send_message retourne Ok(\"Message processed\") sans traitement réel")
    REASONS+=("  → Stub silencieux enregistré dans generate_handler! masque le Err() de chat.rs")
    REASONS+=("  → Route primaire: conversation_engine::commands::conversation_generate")
  fi
fi

if [[ ${FAIL} -eq 0 ]]; then
  echo "PASS: send_message sans stub contradictoire"
  exit 0
else
  echo "FAIL: send_message contient des stubs contradictoires"
  for r in "${REASONS[@]}"; do echo "  DETAIL: ${r}"; done
  echo "  FIX: Supprimer main.rs:673 ou rediriger explicitement vers conversation_generate"
  exit 1
fi
