# 06 — MEMORY RISK MATRIX

| ID | Risk | Classification | Severity | Status |
|----|------|----------------|----------|--------|
| R1 | STM is RAM-only; crash loses all STM | STM_NOT_PERSISTED | MEDIUM | KNOWN / ACCEPTED (session design) |
| R2 | MTM is RAM-only; crash loses all MTM | STM_NOT_PERSISTED (MTM variant) | MEDIUM | KNOWN / ACCEPTED |
| R3 | LTM disk write was TODO comment — never written | LTM_NOT_RETRIEVABLE | HIGH | FIXED ✅ |
| R4 | LTM not loaded on startup — index empty every boot | LTM_NOT_RETRIEVABLE | HIGH | FIXED ✅ |
| R5 | recall() returns "[LTM:N]" placeholder, not full content | MEMORY_RETRIEVAL_UNPROVEN | MEDIUM | OPEN — not patched |
| R6 | recall() never called before building chat prompt | MEMORY_INJECTION_UNPROVEN | HIGH | OPEN — MEMORY_INJECTION_UNPROVEN |
| R7 | No memory IDs in response metadata | MEMORY_CONSUMPTION_UNPROVEN | HIGH | OPEN — MEMORY_CONSUMPTION_UNPROVEN |
| R8 | 3 separate memory systems, 2 unused by chat | MEMORY_AUTHORITY_SPLIT | MEDIUM | DOCUMENTED — no refactor |
| R9 | TS backup reads localStorage, not Rust LTM files | MEMORY_RESTORE_UNPROVEN | MEDIUM | OPEN |
| R10 | LTM index not persisted to disk (rebuilt from scan) | SCHEMA_DRIFT_RISK | LOW | MITIGATED by restore scan |
| R11 | No encryption on .mem files | UNKNOWN | LOW | DOCUMENTED (future work) |
| R12 | provider_failure_count and provider_status separate (known) | — | CLOSED | Previously fixed |
