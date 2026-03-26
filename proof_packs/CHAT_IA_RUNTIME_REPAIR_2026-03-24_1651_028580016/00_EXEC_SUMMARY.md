EXEC_MODE: BACKGROUND
SCOPE_RING: R4 -> R3 -> R2 -> R1
RISK: moyen
MODE: CERTIFY
PLAN:
1. Exécuter le bootstrap vérité
2. Cartographier la chaîne réelle d'envoi chat
3. Cartographier les sources de vérité provider/UI
4. Cartographier fallback/recovery et lane Ollama
5. Reproduire le verrou causal principal
6. Corriger minimalement le verrou prouvé
7. Relancer les preuves ciblées
PROOFS: obtenues=bootstrap/code-path/tests/curl localhost/WDIO desktop embedded réel/rebuild e2e/recertification mémoire finale ; attendues=none ; missing=unknown
ROLLBACK: revert ciblé de `src/services/conversationEngine.ts` `src/services/conversationEngine.test.ts` `src-tauri/src/conversation_engine/commands.rs` et des fichiers du proof pack mis à jour

1. REAL_STATE
- La chaîne provider/UI a été réparée puis certifiée.
- Le verrou mémoire final venait d'un rappel personnel non classé comme requête mémoire explicite.
- Après rebuild e2e frais, la lane desktop embedded réelle passe avec `PASS_MEMORY_REAL`.
- Le garde-fou faux-souvenir répond `INCONNU` sur la vraie lane desktop, avec `provider=Ollama (OMEGA+Singularity)`, `mode=LOCAL`, `reason=OK`, `network=false`.

2. TARGET_DELTA
- Clore la mission avec une vérité provider + mémoire + faux-souvenir cohérente sur le vrai runtime desktop embedded.

3. MAIN_LOCK
- `PASS`

4. DEFECT_CLASSIFICATION
- H3 PROVIDER_SELECTION_UI_ONLY: PROVEN puis réparé
- H4 ROUTER_BROKEN: PROVEN puis réparé
- H6 FALLBACK_MASKING_FAILURE: PROVEN puis réparé
- H9 MEMORY_OK_PROVIDER_KO: PROVEN puis réparé

5. PATHS_TOUCHED
- `src/services/conversationEngine.ts`
- `src/services/conversationEngine.test.ts`
- `src-tauri/src/conversation_engine/commands.rs`
- `proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/`

6. COMMANDS_EXECUTED
- Voir `08_COMMANDS_USED.md`

7. TESTS_EXECUTED
- `pnpm exec vitest run src/services/conversationEngine.test.ts`
- `pnpm run build:tauri:e2e`
- `TITANE_MEMORY_PROOF=1 pnpm run e2e:desktop:proof:online-chat`

8. GATES_STATUS
- Voir `12_GATES_REPORT.md`

9. PROOF_PACK_PATH
- `proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/`

10. FINAL_UNIQUE_VERDICT
- `PASS`
