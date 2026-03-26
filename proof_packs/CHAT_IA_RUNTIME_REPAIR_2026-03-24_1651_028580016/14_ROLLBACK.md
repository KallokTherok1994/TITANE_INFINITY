# Rollback

## Exact
Revenir uniquement sur:
- `src/services/conversationEngine.ts`
- `src/services/conversationEngine.test.ts`
- `src-tauri/src/conversation_engine/commands.rs`
- `proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/08_COMMANDS_USED.md`
- `proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/10_LOG_EXCERPTS.md`
- `proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/11_TEST_RESULTS.md`
- `proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/12_GATES_REPORT.md`
- `proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/13_DIFF_FILES.md`
- `proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/15_VERDICT.md`

## Minimal
```text
git diff -- src/services/conversationEngine.ts src/services/conversationEngine.test.ts src-tauri/src/conversation_engine/commands.rs proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016
```

## Non destructif
- ne pas toucher aux autres changements déjà présents dans le worktree
- ne pas faire de reset global
