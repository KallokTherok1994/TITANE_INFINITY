# ANALYSE DES 290 COMMANDES NON-ENREGISTRÉES — CLASSIFICATION FINALE
## FRONTEND_BACKEND_FUSION_CONTINUE_2026-03-06_1439

---

## Méthodologie

```bash
# Recalcul post-premier audit (7 cp_* enregistrés)
frontend_commands.txt: 469 entrées
registered_final.txt: 386 entrées (post-fix #1)
frontend_not_registered.txt: 290 entrées
```

---

## Classification P1 vs P2

### Critère P1 (à corriger)
- Commande appelée directement depuis un service/composant en production
- Implémentée dans le backend avec `#[tauri::command]`
- Absente du `generate_handler!`

### Critère P2 (dette tolérée)
- Déclarée dans `tauriCommands.ts` mais non utilisée activement
- Ou : feature stub/expérimentale non implémentée
- Dans le budget du test contract (≤520 orphaned)

---

## P1 IDENTIFIÉS ET CORRIGÉS

### Groupe 1 : selfheal executor (14 commands)
| Commande | Fichier source | Usage frontend |
|----------|---------------|----------------|
| `selfheal_clear_cache` | `commands_v21::self_healing_commands` | `selfHealingExecutor.ts` |
| `selfheal_isolate_module` | `commands_v21::self_healing_commands` | `selfHealingExecutor.ts` |
| `selfheal_mini_audit` | `commands_v21::self_healing_commands` | `selfHealingExecutor.ts` |
| `selfheal_rebuild_memory` | `commands_v21::self_healing_commands` | `selfHealingExecutor.ts` |
| `selfheal_regenerate_config` | `commands_v21::self_healing_commands` | `selfHealingExecutor.ts` |
| `selfheal_repair_json` | `commands_v21::self_healing_commands` | `selfHealingExecutor.ts` |
| `selfheal_reset_state` | `commands_v21::self_healing_commands` | `selfHealingExecutor.ts` |
| `selfheal_restart_module` | `commands_v21::self_healing_commands` | `selfHealingExecutor.ts` |
| `selfheal_restart_process` | `commands_v21::self_healing_commands` | `selfHealingExecutor.ts` |
| `selfheal_restart_worker` | `commands_v21::self_healing_commands` | `selfHealingExecutor.ts` |
| `selfheal_save_profile` | `commands_v21::self_healing_commands` | `selfHealingSyncLayer.ts` |
| `selfheal_switch_provider` | `commands_v21::self_healing_commands` | `selfHealingExecutor.ts` |
| `selfheal_sync_state` | `commands_v21::self_healing_commands` | `selfHealingExecutor.ts` |
| `selfheal_sync_with_singularity` | `commands_v21::self_healing_commands` | `selfHealingSyncLayer.ts` |

### Groupe 2 : identity engine (4 commands)
| Commande | Fichier source | Usage frontend | État managé requis |
|----------|---------------|----------------|-------------------|
| `identity_get_matrix` | `identity::commands` | `defaultIdentityMatrix.ts` | `IdentityEngineState` |
| `identity_list_voice_profiles` | `identity::commands` | `IdentityCenter.tsx` | `IdentityEngineState` |
| `identity_set_active_voice_profile` | `identity::commands` | `IdentityCenter.tsx` | `IdentityEngineState` |
| `identity_set_mode` | `identity::commands` | `IdentityCenter.tsx` | `IdentityEngineState` |

**Note** : Les commandes `identity_get_current_mode`, `identity_get_current_tone`, `identity_get_available_modes`,
`identity_get_active_rules`, `identity_get_coherence_score`, `identity_get_personality_snapshot`,
`identity_disable_rule`, `identity_enable_rule` sont présentes dans `tauriClient.ts` et utilisées dans
`IdentityCenter.tsx` mais **n'ont pas d'implémentation backend** (UNKNOWN/P2 — stubs attendus).

### Groupe 3 : audio recording + speak (4 commands)
| Commande | Fichier source | Usage frontend |
|----------|---------------|----------------|
| `speak` | `audio::commands` | `tauriBridge.ts`, `tauri/commands.ts` |
| `start_recording` | `audio::commands` | `voiceE2ETests.ts` |
| `stop_recording` | `audio::commands` | `voiceE2ETests.ts` |
| `cancel_recording` | `audio::commands` | `audioSelfHeal.ts`, `voice.ts` |

### Groupe 4 : security (1 command)
| Commande | Fichier source | Allowlist |
|----------|---------------|-----------|
| `validate_chat_message` | `secure_commands` | `chat_ai.json` |

---

## P2 DOCUMENTÉ (271 commandes restantes)

### Catégories principales

| Catégorie | Nb | Exemples | Raison |
|-----------|-----|---------|--------|
| Cloud Sync | 14 | `cloud_init`, `cloud_sync_push` | Feature non implémentée |
| Evolution | 8 | `evolution_run_cycle`, `hyper_*` | Module expérimental |
| DevMode Engines | 12 | `engines_devmode_*` | Stub allowlisté, non enregistré |
| Autonomy | 5 | `autonomy_ping`, `autonomy_log_report` | Allowlisté mais non enregistré |
| Memory advanced | 15 | `memory_cluster`, `memory_grow` | API interne non exposée |
| SC Hypervision | 7 | `sc_hypervision_*` | Fonctionnalité non active |
| QA extra | 9 | `qa_create_monitor`, `qa_health_check` | Subset non exposé |
| Reality Renderer | 6 | `reality_*` | Feature expérimentale |
| Identity stubs | 8 | `identity_get_current_mode` | Pas d'implémentation backend |
| Persistent memory extra | 8 | `persistent_memory_create_bundle` | Subset non exposé |
| Misc (legacy, unused) | ~179 | Voir liste complète | Déclarés mais jamais appelés |

### Budget test contract

Le test `should not have orphaned Rust commands` tolère ≤520 commandes orphelines.
Avec les corrections P1 (21 commandes enregistrées), on reste dans le budget.

---

## STALE ALLOWLIST ENTRIES — P2

### chat_ai.json
- `chat_generate` : alias non enregistré → P2 (utiliser `chat_generate_gemini/openai/claude`)
- `ai_query` : implémenté dans `ai_chat.rs` mais nécessite `AIChatState` non managé → BLOCKED_AIChatState

### self_heal.json
- `autonomy_ping`, `autonomy_log_report`, `autonomy_fix_tts_sync`, `autonomy_resync_singularity_state`, `autonomy_clean_memory` : allowlistés, non enregistrés → P2

---

## PROGRESSION

- STEP 2/7 — Classification terminée
- STATUS: PASS — P1 corrigés (21 nouvelles commandes enregistrées)
