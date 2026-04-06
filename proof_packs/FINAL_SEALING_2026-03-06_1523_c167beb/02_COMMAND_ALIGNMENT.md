# 02 — COMMAND ALIGNMENT
## FINAL_SEALING_2026-03-06_1523_c167beb

---

## Sources

- **Backend (canonical):** `src-tauri/src/main.rs` → `generate_handler!`
- **Frontend (canonical):** `src/lib/tauriCommands.ts`

## Métriques

| Métrique | Valeur |
|---------|--------|
| Commandes enregistrées dans generate_handler! | 416 |
| Commandes déclarées en frontend | 469 |
| Delta (non enregistrées) | 268 |
| Budget toléré (test:contract) | ≤520 |
| Budget respecté | ✅ OUI |

## Corrections de la branche (PASS)

| Commande | Vérification |
|----------|-------------|
| `cp_get_ai_config` | `grep -c cp_get_ai_config main.rs` → 1 ✅ |
| `cp_set_ai_config` | présente ✅ |
| `cp_get_design_config` | présente ✅ |
| `cp_set_design_config` | présente ✅ |
| `cp_get_modules_status` | présente ✅ |
| `cp_toggle_module` | présente ✅ |
| `cp_check_for_updates` | présente ✅ |
| `selfheal_clear_cache` | `grep -c selfheal_clear_cache main.rs` → 1 ✅ |
| `selfheal_sync_with_singularity` | présente ✅ |
| `identity_get_matrix` | `grep -c identity_get_matrix main.rs` → 1 ✅ |
| `identity_set_mode` | présente ✅ |
| `audio::commands::speak` | `grep -c "audio::commands::speak" main.rs` → 1 ✅ |
| `audio::commands::cancel_recording` | présente ✅ |
| `validate_chat_message` | `grep -c validate_chat_message main.rs` → 2 (registration + comment) ✅ |
| `IdentityEngineState` | managé ✅ |

## Ghost commands

- `chat_generate` : retiré de `chat_ai.json` → `grep chat_generate capabilities/chat_ai.json | wc -l` → 0 ✅

## Commandes non-enregistrées (P2 — dans budget)

268 commandes déclarées dans `tauriCommands.ts` mais non enregistrées.
Categories: cloud_sync (14), engines_devmode_* (12), evolution/hyper (8+), identity stubs (8),
autonomy_* (5), AIChatState legacy (6), misc stubs (~210).

## GATE G_COMMAND_ALIGNMENT: ✅ PASS

Root cause des drifts P1 = corrigé en sessions 1-3.
P2 dans budget toléré.
