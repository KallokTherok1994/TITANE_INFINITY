# 03_INVARIANTS_CHECK

## STOPLINE — Invariants

| Invariant | Statut | Evidence | Note |
|---|---|---|---|
| Tauri-only | PASS | `01_BOOTSTRAP.md` scans + architecture tests | Aucun serveur web interne ajouté |
| UI no direct web | PASS (qualifié) | `01_BOOTSTRAP.md` scan `rg fetch/axios/http` | Occurrences majoritairement tests/snapshots/constantes; pas d’ajout de surface directe dans ce patch |
| 4-Ring strict | PASS | `05_TESTS_X3.log` (`pnpm test:architecture` x3) | Aucun import ring inversé introduit |
| IPC canonique `{ok,content,error}` | PASS | unchanged surfaces + `07_GATES_REPORT.md` | Aucun nouvel invoke brut introduit |
| deny-by-default capabilities | PASS | aucune modif `tauri*.json` | inchangé |
| no unbounded retries/tasks | PASS | `src-tauri/src/chat_engine/memory.rs` | coalescing avec handle unique/cancel, borné |
| no free refactor | PASS | `08_DIFF_FILES.md` | patch minimal ciblé |
| no test skips | PASS | `05_TESTS_X3.log` | exécutions x3 complètes |

## Décision stopline

- Aucun déclencheur stop-the-line bloquant détecté sur la portée modifiée.

