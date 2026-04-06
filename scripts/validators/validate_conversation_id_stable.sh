#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# VALIDATOR 5: conversation_id stable entre les mounts
# Règle : useChat.ts doit charger le conversation_id depuis
#         conversationStorage (pas de génération UUID à chaque mount
#         sans vérification storage préalable).
# Source: src/hooks/useChat.ts × src/services/conversation/conversationStorage.ts
# Rollback: aucun — validator read-only
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
USE_CHAT="${REPO_ROOT}/src/hooks/useChat.ts"
CONV_STORAGE="${REPO_ROOT}/src/services/conversation/conversationStorage.ts"

FAIL=0
REASONS=()

# CHECK 1: useChat.ts existe
if [[ ! -f "${USE_CHAT}" ]]; then
  FAIL=1; REASONS+=("useChat.ts introuvable: ${USE_CHAT}")
fi

if [[ -f "${USE_CHAT}" ]]; then
  # CHECK 2: chargement depuis storage stable
  if ! grep -qE "(conversationStorage\.getActiveConversationId|localStorage\.getItem.*conversation)" "${USE_CHAT}"; then
    FAIL=1
    REASONS+=("useChat.ts ne charge pas conversation_id depuis storage stable")
  fi

  # CHECK 3: présence du fallback UUID — doit être conditionnel
  if grep -qE 'conv-\$\{Date\.now' "${USE_CHAT}"; then
    context_around="$(grep -n -B15 -A2 'conv-\${Date\.now' "${USE_CHAT}" | head -40 || true)"
    if echo "${context_around}" | grep -qE "(if.*activeId|activeId.*\?|const activeId|getActiveConversationId)"; then
      REASONS+=("INFO: Fallback conv-\${Date.now()} présent mais conditionnel sur activeId — acceptable")
    else
      FAIL=1
      REASONS+=("useChat.ts génère conv-\${Date.now()} sans condition storage préalable")
      REASONS+=("  → Chaque mount froid crée un ID orphelin non persisté")
    fi
  fi

  # CHECK 4: conversationStorage.initialize() existe
  if [[ ! -f "${CONV_STORAGE}" ]]; then
    FAIL=1
    REASONS+=("conversationStorage.ts introuvable: ${CONV_STORAGE}")
  else
    if ! grep -qE "(createConversation|default|initialize)" "${CONV_STORAGE}"; then
      FAIL=1
      REASONS+=("conversationStorage.ts::initialize() ne crée pas de conversation par défaut")
      REASONS+=("  → useChat.ts tombera dans le fallback UUID à chaque mount froid")
    fi
  fi
fi

if [[ ${FAIL} -eq 0 ]]; then
  echo "PASS: conversation_id chargé depuis storage stable, fallback conditionnel acceptable"
  exit 0
else
  echo "FAIL: conversation_id instable ou génération systématique à chaque mount"
  for r in "${REASONS[@]}"; do echo "  DETAIL: ${r}"; done
  echo "  FIX: Appeler conversationStorage.initialize() AVANT le premier mount de useChat"
  exit 1
fi
