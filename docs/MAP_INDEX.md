# MAP_INDEX — Cartographie canonique TITANE∞

## Objet

Index de navigation unique Search/Tracking/Vision.

## Artefacts obligatoires

1. `docs/MAP_ARCHITECTURE_4RING.md`
2. `docs/MAP_SURFACES_NETWORK.md`
3. `docs/MAP_IPC_COMMANDS.md`
4. `docs/MAP_TESTS_GATES.md`
5. `docs/MAP_MERMAID_OVERVIEW.md`
6. `reports/MAP_PROOFS.log`

## Cartographie consolidée (executive)

- `docs/CARTOGRAPHY_TITANE_INFINITY.md` — cartographie ultra-complète MAIN (4-Ring + IPC One Door + contrat canonique + commandes Rust + services/moteurs + gates)

## Convention de mapping

Chaque entrée contient :

- **Objet**
- **Ring**
- **Responsabilité**
- **Interfaces**
- **I/O**
- **Preuve**
- **Statut** (`STABLE` | `QUALIFIED` | `EXPERIMENTAL` | `UNKNOWN`)

Règle : sans preuve `rg`/`ls`/`cat`, statut `UNKNOWN`.

## Procédure anti-drift

1. `bash scripts/map_refresh.sh`
2. Vérifier `reports/MAP_PROOFS.log`
3. Mettre à jour les cartes impactées
4. Re-valider les gates mapping

## Gates mapping

- `G_MAP_INDEX_PRESENT`
- `G_MAP_ARCHITECTURE_PRESENT`
- `G_MAP_SURFACES_PRESENT`
- `G_MAP_IPC_COMMANDS_PRESENT`
- `G_MAP_TESTS_GATES_PRESENT`
- `G_MERMAID_PRESENT`
- `G_MAP_PROOF_LOG_PRESENT`
- `G_MAP_NO_UNKNOWN_CRITICAL`
- `G_MAP_ANTI_DRIFT_RULE_PRESENT`
