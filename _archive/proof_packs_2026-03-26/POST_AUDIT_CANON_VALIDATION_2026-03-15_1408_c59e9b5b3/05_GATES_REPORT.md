# 05_GATES_REPORT.md — POST_AUDIT_CANON_VALIDATION
# See also: docs/canon/POST_AUDIT_GATES_REPORT.md (full detail)
# Date: 2026-03-15T14:08:00Z | SHA: c59e9b5b3

| Gate | Status | Proof |
|------|--------|-------|
| G_CANON_ARTIFACTS_EXIST | PASS | ls docs/canon/ = 17 files |
| G_CANON_ARTIFACTS_TRACEABLE | PASS | SHA + date in all docs |
| G_CLAIMS_CLASSIFIED | PASS | CANON_DOCS_VALIDATION_MATRIX.md |
| G_NO_OVERCLAIM | PASS | grep -r "378" docs/canon/ → 0 uncorrected |
| G_COMMANDS_TOTAL_REPROVEN | PASS | Python parse: 401@SHA/408 current |
| G_REGISTRY_APPEND_ONLY_TRUTH | PASS | 261 valid JSON lines |
| G_PROOFPACK_CONTENT_MATCH | PASS* | MASTER pack complete. *AUDIO pack empty = BLOCKED |
| G_ROLLBACK_TRUTH | PASS | rollback in 10_ROLLBACK.md + POST_AUDIT_VERDICT.md |
| G_DOCS_TRUST_MATRIX | PASS | CANON_DOCS_VALIDATION_MATRIX.md: all MEDIUM trust |
| G_VERIFY_INSTRUCTIONS | PASS | bash scripts/verify_instructions.sh → PASS=20 FAIL=0 |
| G_AH_RECURRENCE_GUARD_PASS | PASS | bash scripts/autoheal/detect_recurrence.sh → PASS |
