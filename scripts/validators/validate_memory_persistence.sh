#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# VALIDATOR 2: Persistance mémoire chat active
# Règle : l'historique chat actif doit être persisté via
#         chatMemoryCompactor (localStorage) et flushé explicitement
#         depuis useConversationEngine après saveMessage().
# Source: src/services/chatMemoryCompactor.ts × src/hooks/useConversationEngine.ts
# Rollback: aucun — validator read-only
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MEMORY_JSON="${REPO_ROOT}/memory/memory_core_state.json"
COMPACTOR_TS="${REPO_ROOT}/src/services/chatMemoryCompactor.ts"
CONV_ENGINE_TS="${REPO_ROOT}/src/hooks/useConversationEngine.ts"

FAIL=0
REASONS=()
INFO=()

# CHECK 1: chatMemoryCompactor.ts existe et contient la logique active attendue
if [[ ! -f "${COMPACTOR_TS}" ]]; then
  FAIL=1
  REASONS+=("chatMemoryCompactor.ts introuvable: ${COMPACTOR_TS}")
else
  if ! grep -qE "(loadForMode|saveForMode|flushPendingSaves)" "${COMPACTOR_TS}"; then
    FAIL=1
    REASONS+=("chatMemoryCompactor.ts sans API active complète (loadForMode/saveForMode/flushPendingSaves)")
  fi
  if ! grep -qE "localStorage\.getItem" "${COMPACTOR_TS}"; then
    FAIL=1
    REASONS+=("chatMemoryCompactor.ts ne lit pas localStorage (source de vérité chat active attendue)")
  fi
  if ! grep -qE "localStorage\.setItem" "${COMPACTOR_TS}"; then
    FAIL=1
    REASONS+=("chatMemoryCompactor.ts ne persiste pas vers localStorage")
  fi
fi

# CHECK 2: useConversationEngine doit flush explicitement après persistance
if [[ ! -f "${CONV_ENGINE_TS}" ]]; then
  FAIL=1
  REASONS+=("useConversationEngine.ts introuvable: ${CONV_ENGINE_TS}")
else
  if ! grep -qE "await saveMessage\(assistantAIMessage\)" "${CONV_ENGINE_TS}"; then
    FAIL=1
    REASONS+=("useConversationEngine.ts n'enregistre pas explicitement assistantAIMessage")
  fi
  if ! grep -qE "chatMemoryCompactor\.flushPendingSaves\(\)" "${CONV_ENGINE_TS}"; then
    FAIL=1
    REASONS+=("useConversationEngine.ts ne flush pas explicitement chatMemoryCompactor après persistance")
  fi
fi

# CHECK 3: memory_core_state.json est un artefact legacy toléré, pas la source active du chat
if [[ -f "${MEMORY_JSON}" ]]; then
  file_size="$(wc -c < "${MEMORY_JSON}" 2>/dev/null || echo 0)"
  if [[ "${file_size}" -gt 100 ]] && grep -qE '"chat_history":\s*\[\s*\]' "${MEMORY_JSON}"; then
    INFO+=("memory_core_state.json::chat_history vide (${file_size} octets) — toléré car non source active de l'historique chat frontend")
  fi
fi

if [[ ${FAIL} -eq 0 ]]; then
  echo "PASS: persistance chat active cohérente (chatMemoryCompactor/localStorage + flush useConversationEngine)"
  for info in "${INFO[@]}"; do echo "  INFO: ${info}"; done
  exit 0
else
  echo "FAIL: Problèmes de persistance mémoire"
  for r in "${REASONS[@]}"; do echo "  DETAIL: ${r}"; done
  for info in "${INFO[@]}"; do echo "  INFO: ${info}"; done
  exit 1
fi
