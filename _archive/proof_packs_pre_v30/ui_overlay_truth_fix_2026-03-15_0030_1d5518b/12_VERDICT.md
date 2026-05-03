---EXEC_DECISION---
MODE: BACKGROUND
WHY: Continue full UI certification by eliminating residual mock ambiguity on Vision overlay.
RISK: P1 -> mitigated by minimal one-file patch and full validation suite.
PROOFS: tests/check/lint/format/gates all PASS; AutoHeal and UI registry entries appended.
ROLLBACK: file-level rollback documented in 11_ROLLBACK.md.
VERDICT: PASS
---------------

The UI control now remains honest: no decorative mock detections, no fake count, and explicit no-detection state.
