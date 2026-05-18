#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Gate: IPC Whitelist Completeness — Lane 8.6
# Vérifie que les commandes déclarées dans tauriCommands.ts sont dans
# ALLOWED_COMMANDS de security.ts.
#
# Comportement :
#   - FAIL  si le nombre de commandes manquantes DÉPASSE le seuil connu
#           (= nouvelle régression ajoutée sans mise à jour whitelist)
#   - WARN  si le nombre est ≤ seuil (dette technique pré-existante connue)
#   - PASS  si toutes les commandes sont dans la whitelist
#
# Seuil WARN_THRESHOLD : 99 commandes manquantes connues au 2026-05-18.
# Pour réduire la dette : ajouter les commandes dans security.ts ALLOWED_COMMANDS
# et diminuer le seuil ici (vers 0 à terme).
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

TAURI_COMMANDS_FILE="src/lib/tauriCommands.ts"
SECURITY_FILE="src/lib/security.ts"
# Seuil de dette technique connue — ne pas augmenter sans justification
WARN_THRESHOLD=99

# Vérification fichiers présents
if [[ ! -f "$TAURI_COMMANDS_FILE" ]]; then
  echo "BLOCKED: $TAURI_COMMANDS_FILE not found"
  exit 1
fi
if [[ ! -f "$SECURITY_FILE" ]]; then
  echo "BLOCKED: $SECURITY_FILE not found"
  exit 1
fi

# Extraire les valeurs de commandes depuis tauriCommands.ts
# Format: KEY: 'command_name',  (snake_case, min 3 chars)
mapfile -t TAURI_CMDS < <(
  grep -oP "(?<=:\s')[a-z][a-z_0-9]{2,}(?=')" "$TAURI_COMMANDS_FILE" \
    | sort -u
)

TOTAL=${#TAURI_CMDS[@]}
MISSING=()

# Vérifier chaque commande dans ALLOWED_COMMANDS de security.ts
for cmd in "${TAURI_CMDS[@]}"; do
  if ! grep -qF "'${cmd}'" "$SECURITY_FILE"; then
    MISSING+=("$cmd")
  fi
done

MISSING_COUNT=${#MISSING[@]}

# Rapport
if [[ $MISSING_COUNT -eq 0 ]]; then
  echo "PASS: IPC_WHITELIST_COMPLETENESS — ${TOTAL} tauriCommands entries, all whitelisted"
  exit 0
elif [[ $MISSING_COUNT -le $WARN_THRESHOLD ]]; then
  echo "WARN: IPC_WHITELIST_COMPLETENESS — ${MISSING_COUNT}/${TOTAL} commands not in whitelist (known debt ≤${WARN_THRESHOLD})"
  echo "      Run: bash scripts/verify/gate-ipc-whitelist-completeness.sh 2>&1 | grep '✗' to list them"
  echo "      Fix: add missing commands to ALLOWED_COMMANDS in $SECURITY_FILE"
  # Sortie 0 = certifier compte comme WARN, pas FAIL
  exit 0
else
  echo "FAIL: IPC_WHITELIST_COMPLETENESS — ${MISSING_COUNT} commands missing (exceeds threshold ${WARN_THRESHOLD})"
  echo "      New commands were added to tauriCommands.ts without updating the security whitelist."
  echo "      Missing commands:"
  for m in "${MISSING[@]}"; do
    echo "  ✗ $m"
  done
  echo ""
  echo "Fix: add each command to ALLOWED_COMMANDS in $SECURITY_FILE"
  echo "     Then decrease WARN_THRESHOLD in this script."
  exit 1
fi
