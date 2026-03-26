# Matrice des gaps

| Couche | Avant | Après | Preuve |
|---|---|---|---|
| Sélecteur provider UI | CONFIGURED | CONFIGURED | lecture/écriture localStorage |
| Consommation du provider choisi | BLOCKED | RUNTIME_PROVEN | test payload `provider: ollama` |
| Recovery honnête | FAIL | PASS | suppression reset auto + message explicite |
| Reachability Ollama | PARTIAL | RUNTIME_PROVEN | `api/version` joignable + preuves desktop embedded |
| Réponse desktop réelle via Ollama | unknown | RUNTIME_PROVEN | WDIO desktop embedded + tags runtime `Ollama/LOCAL/OK` |
| Mémoire multi-tour réelle | unknown | RUNTIME_PROVEN | `PASS_MEMORY_REAL` |
| Garde faux-souvenir | unknown | RUNTIME_PROVEN | `FALSE_RECALL_VERDICT=NO_FALSE_MEMORY_BUT_UNPROVEN` + réponse `INCONNU` |

## Gap dominant réparé
- `PROVIDER_SELECTION_UI_ONLY`

## Gaps restants
- unknown
