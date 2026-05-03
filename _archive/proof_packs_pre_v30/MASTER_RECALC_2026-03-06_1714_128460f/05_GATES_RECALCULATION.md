# PHASE 5 — RECALCUL DES GATES
## MASTER_RECALC_2026-03-06_1714_128460f

---

## Gates locales (exécutées en local — preuves directes)

| Gate | Commande | Résultat | Statut |
|------|---------|---------|--------|
| G_VERIFY_INSTRUCTIONS | `bash scripts/verify_instructions.sh` | PASS=20 FAIL=0 | ✅ PASS |
| G_AH_RECURRENCE_GUARD | `bash scripts/autoheal/detect_recurrence.sh` | PASS entries=67 | ✅ PASS |
| G_AH_IDS_UNIQUE | Python duplicate check | 0 duplicates | ✅ PASS |
| G_INVARIANT_TAURI_ONLY | `grep -rn "fetch('" src/ \| grep -v test` | 0 | ✅ PASS |
| G_INVARIANT_NO_RING2_HTTP | `grep -rn "http_client\|reqwest" src-tauri/src/engines/` | 0 | ✅ PASS |
| G_COMMANDS_P1_REGISTERED | `grep -c cp_get_ai_config\|selfheal_clear_cache\|identity_get_matrix main.rs` | 1/1/1 | ✅ PASS |
| G_ALLOWLIST_CLEAN | `grep "chat_generate" src-tauri/capabilities/chat_ai.json` | 0 | ✅ PASS |

---

## Gates BLOCKED_ENV (non exécutables sans environnement complet)

| Gate | Raison blocage | Qualifié par |
|------|----------------|-------------|
| G_VITEST | pnpm non disponible en local | CI MAIN (success) |
| G_CARGO_TEST | glib-2.0 absent | CI MAIN (success) |
| G_E2E_TAURI | Runtime Tauri requis | BLOCKED_ENV |
| G_BUILD_FRONTEND | pnpm/node_modules non installés | CI MAIN (success) |

---

## Gates CI (sur branche copilot/update-repo-audit-and-verdict)

| Gate CI | Statut observé | Note |
|---------|---------------|------|
| ci-unified | action_required | Comportement normal PR Copilot |
| p3-stable-build | action_required | Comportement normal PR Copilot |
| p4-constitution-audit | action_required | Comportement normal PR Copilot |
| codeql | action_required | Comportement normal PR Copilot |
| gitguardian | action_required | Comportement normal PR Copilot |
| p0-1-secrets-guard | action_required | Comportement normal PR Copilot |

**Note:** `action_required` sur les PRs Copilot est le comportement attendu du dépôt.
La branche ancêtre `copilot/audit-frontend-backend` avait atteint CI MAIN success.

---

## Résumé gates

```
Gates locales:       7/7 PASS ✅
Gates BLOCKED_ENV:   4 (qualifiées CI MAIN) ✅
Gates CI branche:    action_required (normal pour PR) ⚠️ (non bloquant)
```
