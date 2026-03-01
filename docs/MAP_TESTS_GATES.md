# MAP_TESTS_GATES

## Gates Mapping V3

- `G_MAP_INDEX_PRESENT`
- `G_MAP_ARCHITECTURE_PRESENT`
- `G_MAP_SURFACES_PRESENT`
- `G_MAP_IPC_COMMANDS_PRESENT`
- `G_MAP_TESTS_GATES_PRESENT`
- `G_MERMAID_PRESENT`
- `G_MAP_PROOF_LOG_PRESENT`
- `G_MAP_NO_UNKNOWN_CRITICAL`
- `G_MAP_ANTI_DRIFT_RULE_PRESENT`

## Entrée de mapping

- **Objet**: Gates mapping
- **Ring**: Cross-ring
- **Responsabilité**: Empêcher scellement sans preuves
- **Interfaces**: docs, script refresh, reports
- **I/O**: Documentation
- **Preuve**: `bash scripts/map_refresh.sh`
- **Statut**: STABLE

## Règle de scellement

Toute gate mapping non PASS interdit `SCELLÉ`.
