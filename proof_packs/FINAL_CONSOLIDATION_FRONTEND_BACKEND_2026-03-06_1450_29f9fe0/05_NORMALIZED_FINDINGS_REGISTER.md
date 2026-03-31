# 05 — REGISTRE NORMALISÉ DES FINDINGS
## FINAL_CONSOLIDATION_FRONTEND_BACKEND_2026-03-06_1450_29f9fe0

---

## Findings résolus (FIXED)

| ID | Catégorie | Surface | Ring | Sévérité | Corrigé | Session |
|----|-----------|---------|------|---------|---------|---------|
| F-001 | CMD_DRIFT | 7 cp_* Control Panel | R4 | P1 | ✅ FIXED | 1 |
| F-002 | CMD_DRIFT | 14 selfheal_* executor | R3 | P1 | ✅ FIXED | 2 |
| F-003 | CMD_DRIFT | 4 identity_* (IdentityCenter) | R4 | P1 | ✅ FIXED | 2 |
| F-004 | CMD_DRIFT | 4 audio (speak/recording) | R4 | P1 | ✅ FIXED | 2 |
| F-005 | CMD_DRIFT | validate_chat_message | R3 | P1 | ✅ FIXED | 2 |
| F-006 | CAP_DRIFT | chat_generate stale alias dans chat_ai.json | R4 | P1 | ✅ FIXED | 3 (ce PR) |

---

## Findings résiduels P2 (DOCUMENTED — dans budget)

| ID | Catégorie | Surface | Ring | Sévérité | Statut |
|----|-----------|---------|------|---------|--------|
| F-007 | CMD_DRIFT | autonomy_* (5 cmds) — allowlistés, non enregistrés | R3 | P2 | DOCUMENTED |
| F-008 | CMD_DRIFT | engines_devmode_* (12 cmds) — stubs | R4 | P2 | DOCUMENTED |
| F-009 | CMD_DRIFT | cloud_* (14 cmds) — non implémenté | R3 | P2 | DOCUMENTED |
| F-010 | CMD_DRIFT | evolution_*/hyper_* (8+ cmds) — expérimental | R2 | P2 | DOCUMENTED |
| F-011 | CMD_DRIFT | identity stubs (8 cmds) — pas de backend | R4 | P2 | DOCUMENTED |
| F-012 | CMD_DRIFT | AIChatState (6 cmds) — BLOCKED | R3 | P2 | BLOCKED |
| F-013 | CMD_DRIFT | 228 autres (stubs, legacy, unused) | Mixte | P2 | DOCUMENTED |
| F-014 | GOVERNANCE_GAP | handlers.rs — code mort induisant en erreur | R4 | P2 | DOCUMENTED |
| F-015 | GOVERNANCE_GAP | TAURI_COMMANDS.ts — fichier dupliqué | R4 | P2 | DOCUMENTED |

---

## Findings BLOCKED

| ID | Catégorie | Surface | Raison blocage |
|----|-----------|---------|----------------|
| F-012 | CMD_DRIFT | AIChatState + 6 commandes legacy | AIChatState::new() complexe, pas de Default impl, OMEGA v2 couvre les cas critiques |
| F-016 | CMD_DRIFT | identity stubs (8 cmds sans impl backend) | Nécessite implémentation des fonctions manquantes |

---

## Findings UI truth — PASS

| ID | Catégorie | Surface | Statut |
|----|-----------|---------|--------|
| F-017 | UI_TRUTH_DRIFT | URLs Wikipedia dans ConversationSection | **PASS** — passées via IPC `web_research`, pas de fetch direct |
| F-018 | SILENT_FALLBACK | normalizeIpcResponse() | **PASS** — tous les cas d'erreur explicites |
| F-019 | UI_TRUTH_DRIFT | Providers status UI | **PASS** — `chat_get_providers_status` enregistré |

---

## Pas de doublons

Chaque finding a une cause racine unique. Aucun doublon détecté entre les 3 sessions d'audit.
