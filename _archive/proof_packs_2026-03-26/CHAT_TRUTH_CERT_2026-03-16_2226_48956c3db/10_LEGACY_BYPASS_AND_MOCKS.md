# 10 — LEGACY BYPASS AND MOCKS

## MOCK_BYPASS_MATRIX

| Surface | Fichier | Type | Risque | Action requise | Statut |
|---------|---------|------|--------|----------------|--------|
| E2E Chat Mock | src/services/api/chat.ts | Mock — window.__TITANE_E2E_CHAT_MOCK__=true active path alternatif | Faible — flag window uniquement, non activé en prod | Aucune (bounded) | PASS |
| send_message stub | src-tauri/src/main.rs:699 | Legacy stub — retourne Err + warn | Faible — non exposé en capability | Documenter comme known stub | QUALIFIED |
| mock feature Rust | src-tauri/Cargo.toml features=["mock"] | Build feature — active mock_commands::* | Moyen — builds dev = mock, prod = full | Vérifier que release build utilise "full" | PARTIAL |
| chat_engine::commands::generate_response | src-tauri/src/main.rs | Conditionnel: mock build → mock_commands, full build → réel | Moyen — risque de build erroné | Vérifier feature dans CI | PARTIAL |
| overdrive::chat_orchestrator::chat_send_message | src-tauri/src/overdrive/chat_orchestrator.rs | DEPRECATED (ligne 493) | Faible — annotated deprecated, migrate documenté | Aucune urgence | QUALIFIED |
| qa_engine.rs:574 commentary | src-tauri/src/qa/qa_engine.rs | Doc-only placeholder (commentaire) | Nul | Aucune | PASS |
| live_selftest.rs:241 | src-tauri/src/qa/live_selftest.rs | Placeholder `simulated_success = true` | Moyen — test non réel | Accepté pour smoke test, non prod | QUALIFIED |

## Analyse feature build

```
[package.metadata] default features = ["custom-protocol", "mock", "audio-capture"]
```
- **Build par défaut** : `mock=true`, `full=false`
- **Conséquence** : `run_governed_search` retourne toujours Err (stub)
- **Conséquence** : `generate_response` utilise `mock_commands::generate_response`
- **Pour prod** : requires `--features full --no-default-features` ou config CI

⚠️ **RISQUE** : Si un build prod utilise les features par défaut, il embarque les mock commands.
**Action** : Vérifier que le pipeline release build spécifie `--no-default-features --features full` (ou équivalent).
