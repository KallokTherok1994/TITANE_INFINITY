#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# RUNNER: Lance les 6 validators chat/memory et produit un rapport
# Exit 0 = tous PASS | Exit 1 = au moins un FAIL ou BLOCKED
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP="$(date '+%Y-%m-%dT%H:%M:%S')"

echo "══════════════════════════════════════════════════════════════"
echo "  TITANE∞ — VALIDATORS CHAT/MEMORY REPORT"
echo "  Timestamp : ${TIMESTAMP}"
echo "  Directory : ${SCRIPT_DIR}"
echo "══════════════════════════════════════════════════════════════"
echo ""

VALIDATORS=(
  "validate_chat_commands.sh:V1 Ghost Commands (active:true sans handler Rust)"
  "validate_memory_persistence.sh:V2 Persistance mémoire active (compactor + flush)"
  "validate_no_send_message_stub.sh:V3 send_message stub contradictoire"
  "validate_ipc_no_silent_mock.sh:V4 IPC mocks silencieux (memory_get/set/list)"
  "validate_conversation_id_stable.sh:V5 conversation_id stable (pas de regen mount)"
  "validate_restore_no_duplication.sh:V6 Restore no-duplication guard (list_restorable + dedup)"
)

PASS_COUNT=0
FAIL_COUNT=0
BLOCKED_COUNT=0
RESULTS=()

for entry in "${VALIDATORS[@]}"; do
  script="${entry%%:*}"
  description="${entry#*:}"
  script_path="${SCRIPT_DIR}/${script}"

  printf "▶ %-54s " "${description}"

  if [[ ! -f "${script_path}" ]]; then
    printf "[BLOCKED]\n"
    RESULTS+=("BLOCKED | ${description} | script manquant: ${script}")
    BLOCKED_COUNT=$((BLOCKED_COUNT + 1))
    continue
  fi

  [[ -x "${script_path}" ]] || chmod +x "${script_path}"

  set +e
  output="$(bash "${script_path}" 2>&1)"
  exit_code=$?
  set -e

  if [[ ${exit_code} -eq 0 ]]; then
    printf "[PASS]\n"
    RESULTS+=("PASS    | ${description}")
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    printf "[FAIL]\n"
    RESULTS+=("FAIL    | ${description}")
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "${output}" | sed 's/^/         /'
  fi
  echo ""
done

echo "══════════════════════════════════════════════════════════════"
echo "  RAPPORT CONSOLIDÉ"
echo "══════════════════════════════════════════════════════════════"
for r in "${RESULTS[@]}"; do echo "  ${r}"; done
echo ""
echo "  Résultat : PASS=${PASS_COUNT}  FAIL=${FAIL_COUNT}  BLOCKED=${BLOCKED_COUNT}"
echo "══════════════════════════════════════════════════════════════"

if [[ ${FAIL_COUNT} -gt 0 ]] || [[ ${BLOCKED_COUNT} -gt 0 ]]; then
  echo "  GLOBAL: FAIL (${FAIL_COUNT} validator(s) échoué(s), ${BLOCKED_COUNT} bloqué(s))"
  exit 1
else
  echo "  GLOBAL: PASS (tous les ${PASS_COUNT} validators réussis)"
  exit 0
fi
