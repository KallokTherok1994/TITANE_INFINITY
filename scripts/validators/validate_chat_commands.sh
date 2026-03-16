#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# VALIDATOR 1: Ghost Commands (active:true sans handler Rust)
# Règle : Toute commande active:true dans tauriCommands.ts doit
#         être présente dans generate_handler! de main.rs
# Source: src/services/tauriCommands.ts × src-tauri/src/main.rs
# Rollback: aucun — validator read-only
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMMANDS_TS="${REPO_ROOT}/src/services/tauriCommands.ts"
MAIN_RS="${REPO_ROOT}/src-tauri/src/main.rs"

if [[ ! -f "${COMMANDS_TS}" ]]; then
  echo "FAIL: tauriCommands.ts introuvable"
  echo "  DETAIL: ${COMMANDS_TS} manquant"
  exit 1
fi
if [[ ! -f "${MAIN_RS}" ]]; then
  echo "FAIL: main.rs introuvable"
  echo "  DETAIL: ${MAIN_RS} manquant"
  exit 1
fi

# Extraire les blocs { name:'cmd', active:true } depuis tauriCommands.ts
active_commands=()
current_name=""

while IFS= read -r line; do
  if echo "${line}" | grep -qE "^\s+name:\s+'[a-z_]+'"; then
    current_name="$(echo "${line}" | grep -oE "'[a-z_]+'" | head -1 | tr -d "'")"
  fi
  if [[ -n "${current_name}" ]] && echo "${line}" | grep -qE "active:\s+true"; then
    active_commands+=("${current_name}")
    current_name=""
  fi
  if [[ -n "${current_name}" ]] && echo "${line}" | grep -qE "active:\s+false"; then
    current_name=""
  fi
done < "${COMMANDS_TS}"

if [[ ${#active_commands[@]} -eq 0 ]]; then
  echo "FAIL: Aucune commande active:true trouvée dans tauriCommands.ts"
  exit 1
fi

ghosts=()
for cmd in "${active_commands[@]}"; do
  if ! grep -qE "\b${cmd}\b" "${MAIN_RS}"; then
    ghosts+=("${cmd}")
  fi
done

if [[ ${#ghosts[@]} -eq 0 ]]; then
  echo "PASS: Toutes les ${#active_commands[@]} commandes active:true sont dans main.rs"
  exit 0
else
  echo "FAIL: ${#ghosts[@]} ghost command(s) (active:true mais absente du generate_handler!)"
  echo "  DETAIL:"
  for g in "${ghosts[@]}"; do
    echo "    - ${g}"
  done
  echo "  SOURCE: ${COMMANDS_TS}"
  echo "  HANDLER: ${MAIN_RS}"
  echo "  FIX: Désactiver (active: false) ou implémenter + enregistrer dans generate_handler!"
  exit 1
fi
