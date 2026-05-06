# MemoryGraph Shadow Comparison Report

Lock: C1
Date: 2026-05-06
Status: SCAFFOLD (no live sessions yet — shadow not activated by default)

## Purpose

This report will track divergence between v1 (UnifiedMemory) and v2 (MemoryGraph shadow)
write results once `VITE_TITANE_C1_MEMORYGRAPH_V2_SHADOW=true` is activated in a test
environment. Current status: flag=false (default), v2 never called.

## Schema Comparison

| Field | v1 (UnifiedMemory) | v2 (MemoryGraph shadow) |
|-------|--------------------|------------------------|
| id | yes | yes (UUID) |
| schema_version | implicit v1 | explicit literal 2 |
| kind | yes | yes |
| type | no | NEW: MemoryNodeType enum (13 values) |
| content | yes | yes |
| content_hash | no | NEW: SHA-256 dedup/integrity |
| embedding_id | yes (via VectorStore) | yes (nullable) |
| embeddings_status | no | NEW: 5-state enum |
| validation_status | no | NEW: 6-state enum with identity safety |
| source | no | NEW: origin signal |
| confidence | no | NEW: 0..1 float |
| expires_at | no | NEW: optional TTL |
| links | partial (knowledgeGraphIndex) | NEW: UUID[] forward links |
| contradictions | no | NEW: UUID[] contradiction links |
| session_id | yes | yes |
| created_at | yes | yes |
| updated_at | yes | yes |
| tags | yes | yes |
| source_v1_id | no | NEW: migration bridge field |

## Identity Safety Rules

v1 has no identity-safe gate. v2 enforces:
- Identity-sensitive types (`identity_fact`, `symbolic_axis`, `financial_pressure`,
  `constraint`, `instruction_truth`) require `validation_status=confirmed` before
  influencing model behavior.
- `isBlockedByIdentitySafety()` function — tested in C1-UNIT-03.

## Shadow Write Results (Baseline)

| Date | Sessions | v1 writes | v2 shadow writes | divergence | errors |
|------|----------|-----------|-----------------|-----------|--------|
| 2026-05-06 | 0 | 0 | 0 (flag=off) | n/a | n/a |

_Table to be filled once shadow mode is activated in a test environment._

## Feasibility Gate Progress

| Gate | Target | Status |
|------|--------|--------|
| Shadow writes ≥30 days | not started | PLANNED (C2) |
| Zero data corruption | not applicable | PLANNED (C2) |
| Embedding coverage ≥80% | not applicable | PLANNED (C2) |
| Identity-safe gate 100% | test only | PASS (unit) |
| Shadow write latency p95 < 200ms | not applicable | PLANNED (C2) |
| Rollback verified | documented | PASS |
