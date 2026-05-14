# Lock C0 — Next Lock Authorization

**Next Lock: C1 — MemoryGraph v2 Shadow Mode**
**Status:** AUTHORIZED
**Prerequisites:** C0 VERDICT=DRIFT_FOUND_FIXED ✓

## C1 Scope (T3 flag required, persistence risk)
- MemoryGraph v2 in shadow/dual-write mode (reads from v1, writes to both v1+v2)
- Zero direct activation — T3 feature flag required: `TITANE_C1_MEMORYGRAPH_V2_SHADOW=true`
- No backward-incompatible schema changes
- Reference: memory architecture, dual-write shadow pattern
