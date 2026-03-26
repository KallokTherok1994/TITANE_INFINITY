# Fichiers modifiés

- `src/services/conversationEngine.ts`
  - classification des rappels personnels comme requêtes mémoire explicites
  - évitement du préfetch mémoire frontend sur ces prompts
- `src/services/conversationEngine.test.ts`
  - test de non-régression sur le prompt `code fantôme`
- `src-tauri/src/conversation_engine/commands.rs`
  - extension de `is_memory_recall_query`
  - test canonique backend pour rappel personnel sans mot-clé mémoire
- `proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/10_LOG_EXCERPTS.md`
  - ajout des reruns finaux mémoire desktop
- `proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/11_TEST_RESULTS.md`
  - ajout des reruns finaux et du bruit WDIO classé
- `proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/12_GATES_REPORT.md`
  - gates mémoire finales alignées
- `proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/15_VERDICT.md`
  - verdict final mémoire/stabilité aligné

## Diff stat
```text
src-tauri/src/conversation_engine/commands.rs | 176 +++++++++++++++++++++++++-
src/services/conversationEngine.test.ts       |  99 +++++++++++++++
src/services/conversationEngine.ts            |  83 +++++++++---
3 files changed, 340 insertions(+), 18 deletions(-)
```
