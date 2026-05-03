# 07 ERRORS WARNINGS BLOCKERS

Errors
| ID | Level | Item | Detail |
|---|---|---|---|
| E-01 | CRITICAL | Chat réel non prouvé | les tests E2E complets exécutés utilisent le mock chat; pas de roundtrip provider réel/fallback réel/retry réel sur chemin canonique |
| E-02 | CRITICAL | Propagation admin canonique non prouvée | ConfigurationHub charge, mais aucun write -> effet runtime n'a été prouvé dans cette session |

Warnings
| ID | Level | Item | Detail |
|---|---|---|---|
| W-01 | MAJOR | Format gate rouge | prettier --check échoue sur 21 fichiers |
| W-02 | MAJOR | Memory expert controls partiels | zoom/filter/tree-node interaction absents ou non stables dans les tests tolérants |
| W-03 | MAJOR | Ollama local config | serveur et modèle OK, mais .env.local + variables OLLAMA_BASE_URL/TITANE_OLLAMA_MODEL absentes selon test-ollama-connection.sh |
| W-04 | MAJOR | E2E global par défaut trompeur pour certification | plusieurs specs passent en gate disabled proof si TITANE_E2E_FULL n'est pas activé |

Blockers
| ID | Level | Item | Why blocker |
|---|---|---|---|
| B-01 | CRITICAL | G_GO_FOR_PROD_BUILD_READY | critère chat runtime réel non satisfait honnêtement |
| B-02 | CRITICAL | G_GO_FOR_PROD_DEPLOY_READY | aucune preuve de déploiement prod/Tauri runtime final dans cette session |
