# 09_GAP_MATRIX

| Gap | Status | Evidence | Required next action |
|---|---|---|---|
| Explicit selection policy | PASS | native policy module added | none |
| Stale artifact detection | PASS | runner block class + exit 32 | none |
| Build-required signal | PASS | `WORKSPACE_AHEAD_OF_RUNTIME` surfaced | none |
| Fresh rebuild availability | BLOCKED | tauri build failed (`E0432`) | fix Rust import/export mismatch |
| Native x3 re-certification post-hardening | BLOCKED | no fresh binary available | rebuild then rerun x3 targeted |
| Product drift control | PASS | no feature code changed by this task | none |
