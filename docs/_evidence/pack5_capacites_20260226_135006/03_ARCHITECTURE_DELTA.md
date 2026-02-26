# 03_ARCHITECTURE_DELTA.md

Date (UTC): 2026-02-26

## Delta architecture appliqué

### 5A — Search explicite credentials
- **Ring impacté:** Ring 3/4 (service + commande orchestrateur)
- `commands.rs` intègre la recherche gouvernée réelle via `SearchGatewayService` (feature-gated).
- Échec credentials manquants -> `CREDENTIALS_MISSING` explicite dans `trace.failures`.
- Message utilisateur FR explicite ajouté (pas de faux succès).

### 5B — Sources/citations + 429 test-only
- **Ring impacté:** Ring 3
- `search_gateway.rs` ajoute simulation `RATE_LIMIT` test-only via:
	- `TITANE_TEST_MODE=1`
	- `TITANE_SEARCH_SIMULATE_429=1`
- Persistance `sources` contrôlée par `CONVOS_SOURCES_STORE`.

### 5C — Snapshots FR + recall IDs internes
- **Ring impacté:** Ring 3/4
- Persistance automatique `snapshots` depuis `trace.memory` (si `CONVOS_MEMORY_SNAPSHOTS=1`).
- `trace.memory.memory_used` inclut IDs internes (`evt_user_*`, `snap_*`, `ltm_session_*`).

### 5D — Debug panel real TraceFrame
- **Ring impacté:** Ring 4 (validation)
- Backend enrichi: `trace_id`, `session_id`, `net_state` dans `trace`.
- UI debug lit `entry.response.trace` et l’affiche via `TracePanel` (preuve wiring).

### 5E — Vector LTM optionnel
- **Ring impacté:** aucun delta runtime ajouté.
- `CONVOS_MEMORY_LTM` reste OFF par défaut (`false`).
- Statut: **BLOCKED/NOT_IMPLEMENTED** (optionnel, non prouvé end-to-end local embeddings).
