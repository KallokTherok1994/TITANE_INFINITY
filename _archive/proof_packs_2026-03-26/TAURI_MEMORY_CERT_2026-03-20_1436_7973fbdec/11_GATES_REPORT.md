# 11_GATES_REPORT

| Gate | Status | Evidence |
|---|---|---|
| G_TARGET_RUNTIME_TRUTH | PASS | lane desktop Tauri résolue, ipcReadyState=READY, provider OLLAMA |
| G_PROVIDER_REAL | PASS | providerReason=OK, networkUsed=false, providerUsed=OLLAMA |
| G_MEMORY_SAVE_TRUTH | PASS | storageCount=8 dans run1 et run2_compact |
| G_MEMORY_PERSIST_TRUTH | PASS | conversation history restaurée sur les tours non adjacents |
| G_MEMORY_RECALL_TRUTH | PASS | réponse compacte contient code=ORION-482-LICHEN, nom=Alice, couleur=bleu azur |
| G_MEMORY_INJECTION_TRUTH | PASS | LTM context restauré côté backend avant le tour de rappel |
| G_CHAT_CONSUMPTION_TRUTH | PASS | tour final consomme le contexte persistant et restitue les trois éléments |
| G_NO_FALSE_MEMORY | PASS | FALSE_RECALL_VERDICT=NO_FALSE_MEMORY_BUT_UNPROVEN, réponse INCONNU |
| G_HARNESS_TIMEOUT_BUDGET | PASS | budget aligné sur assistantTimeoutMs; faux HARNESS_BLOCKED supprimé |
| G_WEBVIEW_STABILITY | PASS | prompts compactés; x3 final sans crash/hang |
| G_TESTS_X3 | PASS | 11_E2E_MEMORY_X3_COMPACT.log -> PASS 3/3 |
| G_ROLLBACK_READY | PASS | 12_ROLLBACK.md |
