#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# VALIDATOR 4: memory_get/set/list_all sans mock silencieux
# Règle : memory_get ne doit pas retourner Ok(None) sans log du
#         cas "not found". memory_get/set/list_all doivent être
#         enregistrées dans generate_handler!
# Source: src-tauri/src/commands/memory_commands.rs × main.rs
# Rollback: aucun — validator read-only
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MEMORY_CMDS="${REPO_ROOT}/src-tauri/src/commands/memory_commands.rs"
MAIN_RS="${REPO_ROOT}/src-tauri/src/main.rs"

FAIL=0
REASONS=()

# CHECK 1: memory_commands.rs existe
if [[ ! -f "${MEMORY_CMDS}" ]]; then
  FAIL=1; REASONS+=("memory_commands.rs introuvable: ${MEMORY_CMDS}")
fi

# CHECK 2: memory_get retourne Ok(None) sans log "not found"
if [[ -f "${MEMORY_CMDS}" ]]; then
  mem_get_block="$(awk '/pub async fn memory_get/,/^}/' "${MEMORY_CMDS}" | head -60)"
  if echo "${mem_get_block}" | grep -qE 'Ok\(None\)'; then
    if ! echo "${mem_get_block}" | grep -qiE '(log::.*(not.found|none|absent)|"not found"|"key not found")'; then
      FAIL=1
      REASONS+=("memory_get retourne Ok(None) sans log explicite 'not found'")
      REASONS+=("  → Retour silencieux: UI reçoit None sans trace dans les logs Rust")
      REASONS+=("  FIX: Ajouter log::warn!(\"[memory_get] key not found\") avant Ok(None)")
    fi
  fi
fi

# CHECK 3: memory_get/set/list_all présentes dans generate_handler! de main.rs
if [[ -f "${MAIN_RS}" ]]; then
  for cmd in "memory_get" "memory_set" "memory_list_all"; do
    if ! grep -qE "\b${cmd}\b" "${MAIN_RS}"; then
      FAIL=1
      REASONS+=("${cmd} absente du generate_handler! — IPC ghost côté Rust")
    fi
  done
fi

if [[ ${FAIL} -eq 0 ]]; then
  echo "PASS: memory_get/set/list_all sans mock silencieux, toutes enregistrées"
  exit 0
else
  echo "FAIL: Mocks silencieux ou commandes manquantes dans IPC mémoire"
  for r in "${REASONS[@]}"; do echo "  DETAIL: ${r}"; done
  exit 1
fi
