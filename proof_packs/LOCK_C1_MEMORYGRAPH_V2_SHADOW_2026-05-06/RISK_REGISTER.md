# Lock C1 — Risk Register

Lock: C1 — MemoryGraph v2 Shadow Mode
Date: 2026-05-06

| id | description | severity | mitigation | status |
|----|-------------|----------|-----------|--------|
| R-C1-01 | Identity-safe bypass: unconfirmed identity-sensitive node affects behavior | HIGH | isBlockedByIdentitySafety() gate; tested in C1-UNIT-03; shadow-only (no production reads) | MITIGATED |
| R-C1-02 | Schema drift: v2 schema changes break v1 migration path | MEDIUM | Schema is additive only; source_v1_id migration bridge; content_hash for integrity | MITIGATED |
| R-C1-03 | v2 shadow write latency impacts caller | LOW | Shadow writes are async, fire-and-forget; v2 failure never propagates; tested in C1-UNIT-04 | MITIGATED |
| R-C1-04 | Feature flag contamination: VITE env leaks into production | MEDIUM | Flag default=false; read-only at module load; no runtime mutation | MITIGATED |
| R-C1-05 | UnifiedMemory regression | HIGH | UnifiedMemory files never touched; verified via git diff | CONFIRMED_ABSENT |
| R-C1-06 | memory_core_state.json or stm.json staged in commit | MEDIUM | Explicitly excluded from staged files; memory/* not staged | CONFIRMED_ABSENT |
| R-C1-07 | Ollama model boundary contamination | MEDIUM | C1 is TS-only, no Rust IPC, no model resolution code | CONFIRMED_ABSENT |
| R-C1-08 | C1→C2 premature cutover (activating v2 reads) | HIGH | C2 gate requires 30-day shadow data, ≥80% embedding coverage, 100% identity-safe pass | PLANNED_GATE |
