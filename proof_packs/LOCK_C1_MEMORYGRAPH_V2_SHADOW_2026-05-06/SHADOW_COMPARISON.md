# Lock C1 — Shadow Comparison Summary

Lock: C1 — MemoryGraph v2 Shadow Mode
Date: 2026-05-06

## Status: SCAFFOLD (shadow mode default=OFF)

No live shadow writes collected yet. v2 default flag=false.
Full comparison report: `reports/memorygraph_shadow_comparison.md`

## Schema Delta Summary

v2 adds 8 fields on top of v1:
1. `type` — semantic memory type (13-value enum)
2. `validation_status` — required for identity-safe gate (6-value enum)
3. `embeddings_status` — vector readiness (5-value enum, default=not_indexed)
4. `contradictions` — UUID[] list of contradicted nodes (default=[])
5. `links` — UUID[] forward links (default=[])
6. `confidence` — float 0..1 (default=0.5)
7. `source` — origin signal string|null (default=null)
8. `expires_at` — optional TTL datetime|null (default=null)

v1 production fields: all preserved identically.

## Safety Gate Summary

| Gate | Rule | Test |
|------|------|------|
| v1 always written first | shadowWriteCoordinator writes v1 before v2 | C1-UNIT-04 |
| v2 failure non-fatal | v2 error caught, logged as warn, result.error_v2 set | C1-UNIT-04 flag=true |
| v1 failure propagates | v1 exception re-thrown, v2 never called | shadowWriteCoordinator — flag=true v1 failure |
| identity-safe gate | isBlockedByIdentitySafety() blocks unconfirmed identity nodes | C1-UNIT-03 |
| v2 reads blocked | No read path in C1 — v2 writes only | architecture |

## C1→C2 Feasibility Gate (planned)

Real shadow comparison data will be collected after `VITE_TITANE_C1_MEMORYGRAPH_V2_SHADOW=true`
is activated in a controlled test environment. Gate data tracked in `reports/memorygraph_shadow_comparison.md`.
