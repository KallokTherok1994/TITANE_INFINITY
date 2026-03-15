# 06_DIFF_FILES.md — POST_AUDIT_CANON_VALIDATION
# Date: 2026-03-15T14:08:00Z | SHA: c59e9b5b3

## Files Modified (patches applied this session)

### docs/canon/ — "378" corrected to 401/408 in all 9 docs

| File | Change |
|------|--------|
| REPO_TRUTH_REPORT.md | "378" → 401@SHA/408 current (command count header) |
| COMMANDS_SOURCE_OF_TRUTH.md | "378" → 401@SHA (3 locations) |
| TRUTH_MATRIX.md | "378 cmds PASS" → 401/408 + RETRACTED note (2 locations) |
| TITANE_BRAIN_CANON.md | "378 commandes IPC" → 401/408 (2 locations) |
| CAPABILITY_REGISTRY_CANON.md | "378 commandes" → 401/408 (2 locations) |
| GATES_REPORT_CANON.md | "378 cmds PASS/registered" → 401 (2 locations) |
| ARCHITECTURE_TRUTH.md | "378 cmds" in diagram → 401@SHA/408 |
| MEMORY_TRIAGE_INDEX.md | "378 commandes IPC" → 401@SHA + integer → string (2 locations) |
| HISTORICAL_SUPERSESSION_LOG.md | "378 cmds" → 401@SHA/408 |
| CONTRADICTION_MATRIX.md | C003: P1 shadowing → INFO/P3 dead code + table row |
| TRUTH_MATRIX.md | C003 PARTIAL text updated |

### scripts/autoheal/autoheal_rules.jsonl

- Line 261: AH-CANON-001 appended (id, date, scope, symptom, root_cause, fix, verification, prevention, prevention_test, commands, files_changed, rollback)

### proof_packs/MASTER_AUDIT_CANON_2026-03-15_1332_c59e9b5b3/

- 11_VERDICT.md: CREATED (was missing)
- 03_INVARIANTS_CHECK.md: C003 description updated (P1→INFO/P3)

### registry/canon-events.jsonl

- Was: invalid JSON placeholder `{"ts":"2026-03-15T13:32:00Z",...}` (literal)
- Now: valid JSON with command_count_claimed:378, command_count_actual:401, correction_note

## Files Created (new this session)

```
docs/canon/CANON_DOCS_VALIDATION_MATRIX.md
docs/canon/COMMANDS_VALIDATION_DELTA.md
docs/canon/MEMORY_GOVERNANCE_VALIDATION.md
docs/canon/POST_AUDIT_GATES_REPORT.md
docs/canon/POST_AUDIT_VERDICT.md
proof_packs/POST_AUDIT_CANON_VALIDATION_2026-03-15_1408_c59e9b5b3/ (8 files)
```
