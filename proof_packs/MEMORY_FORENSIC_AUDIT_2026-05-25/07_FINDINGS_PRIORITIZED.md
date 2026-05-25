# 07 - Findings Prioritized

## P0 - None
No memory data corruption, IPC contract failure, or targeted memory test failure was proven.

## P1 - Memory Isolation Gate Is Broken
- Evidence: `raw/06_gate_memory_isolation.out.txt`
- Exit: 127
- Cause: `scripts/checks/gate_memory_isolation.sh` calls `scripts/checks/check_memory_isolation.sh`, which is absent.
- Impact: isolation certification cannot be trusted until the wrapper points to a real check or the missing check is restored.

## P1 - Registry JSONL Contract Drift
- Evidence: `raw/02_jsonl_autoheal_registry_parse.out.txt`
- Cause: `registry/repo-events.jsonl` contains multi-line JSON/object fragments rather than one JSON object per line.
- Impact: append-only JSONL tooling cannot reliably parse the registry file.

## P2 - Memory Authority Sprawl
- Evidence: `raw/21_memory_surface_matrix.summary.txt`
- Counts: 437 surfaces, 132 legacy/risk, 128 unknown.
- Impact: high drift risk. Canonical docs exist, but enforcement coverage is incomplete.

## P2 - Behavior Change Remains Unproven End-To-End
- Evidence: `docs/MEMORY_CONSUMPTION_MAP.md` and `raw/18_docs_authority_memory_extracts.out.txt`
- Impact: persistence and injection are covered, but no live no-memory vs with-memory model response proof was produced.

## P3 - Legacy Memory Integrity Script Still Warns On Tooling
- Evidence: `raw/04_verify_memory_integrity_legacy.out.txt`
- Cause: legacy verifier still reports missing `jq` and duplicate memory files as warnings.
- Impact: not blocking, but can confuse certification unless consolidated with the dedicated validator.
