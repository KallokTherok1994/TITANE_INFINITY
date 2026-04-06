# PLAN ULTIME DE CORRECTION — DETTE P2 ET ROADMAP
## FRONTEND_BACKEND_FUSION_CONTINUE_2026-03-06_1439

---

## Résumé des corrections appliquées (ce PR)

### PR #1 (AUDIT_2026-03-06_1416)
- ✅ +7 commandes `cp_*` Control Panel

### PR #2 (CONTINUE_2026-03-06_1439)
- ✅ +14 commandes `selfheal_*` executor
- ✅ +4 commandes `identity_*` + IdentityEngineState managé
- ✅ +4 commandes audio (`speak`, `start_recording`, `stop_recording`, `cancel_recording`)
- ✅ +1 commande `validate_chat_message`
- **Total ce PR : +23 commandes + 1 état managé**

### Total cumulatif (deux PRs)
- **+30 commandes enregistrées** (7 + 23)
- **+1 état managé** (IdentityEngineState)
- **Commandes frontend non enregistrées restantes : ~267**

---

## Plan de correction P2 (roadmap future)

### Priorité 1 : Commandes allowlistées mais non enregistrées (risque UI silent fail)

#### autonomy_* dans self_heal.json
Ces commandes sont dans l'allowlist Tauri et peuvent être appelées depuis l'UI :
```
autonomy_ping, autonomy_log_report, autonomy_fix_tts_sync,
autonomy_resync_singularity_state, autonomy_clean_memory
```
**Action requise** : Soit implémenter dans le backend, soit retirer de l'allowlist.

#### chat_generate dans chat_ai.json
`chat_generate` est allowlisté mais non enregistré. Les commandes réelles sont
`chat_generate_gemini`, `chat_generate_openai`, `chat_generate_claude`.
**Action requise** : Retirer `chat_generate` de `chat_ai.json` (cleanup allowlist).

#### engines_devmode_* dans developer_mode.json
12 commandes allowlistées, aucune enregistrée.
**Action requise** : Implémenter ou supprimer la capability entière.

### Priorité 2 : Commandes utilisées via tauriClient mais sans backend

#### identity_get_current_mode, identity_get_active_rules, etc.
8 commandes sont présentes dans `tauriClient.ts` et `IdentityCenter.tsx` mais n'ont pas
d'implémentation backend. L'UI affiche des valeurs fallback silencieuses.
**Action requise** : Implémenter les stubs dans `identity/commands.rs` et les enregistrer.

### Priorité 3 : AIChatState (bloqué)

Plusieurs commandes utiles (`ai_query`, `create_conversation`, `list_conversations`,
`load_conversation`, `delete_conversation`, `clear_all_memory`) sont dans `commands/ai_chat.rs`
et nécessitent `AIChatState`. Cet état n'est **pas managé** dans `main.rs` car
`AIChatState::new()` requiert une initialisation complexe (SecretsEngine, AIRouter, etc.)
et il n'existe pas de `Default` impl.

**Classification** : BLOCKED_AIChatState
**Note** : Les conversations sont gérées via la piste OMEGA v2 (`conversation_generate` dans
`conversation_engine::commands`) qui est fonctionnelle. Les commandes ai_chat legacy
ne sont pas critiques si l'OMEGA v2 est l'API principale.

### Priorité 4 : Cloud Sync (non implémenté)

14 commandes `cloud_*` sont déclarées dans `tauriCommands.ts` mais n'ont pas
d'implémentation backend. L'UI peut avoir des boutons de sync cloud qui échoueront silencieusement.
**Action requise** : Masquer ou désactiver les UI cloud si la feature n'est pas disponible.

---

## Recommandations architecturales (non urgentes)

1. **Supprimer `handlers.rs`** (ou annoter `// DEAD CODE`) — ce fichier crée une illusion
   que les commandes `cp_*` sont enregistrées via `generate_titane_handlers!` alors que
   cette macro n'est jamais appelée.

2. **Consolidation `TAURI_COMMANDS.ts`** — Le fichier `src/core/commands/TAURI_COMMANDS.ts`
   duplique certains commandsnoms de `src/lib/tauriCommands.ts`. Consolider vers une seule source.

3. **Cleanup `chat_ai.json`** — Retirer `chat_generate` (alias mort) et
   `validate_chat_message` est maintenant enregistré.

4. **AIChatState migration** — Considérer ajouter `Default` impl à `AIChatState` pour
   permettre son enregistrement, ou migrer définitivement vers l'API OMEGA v2.

---

## PROGRESSION_STATUS

- STEP 3/7 — Plan documenté
- STATUS: PASS
