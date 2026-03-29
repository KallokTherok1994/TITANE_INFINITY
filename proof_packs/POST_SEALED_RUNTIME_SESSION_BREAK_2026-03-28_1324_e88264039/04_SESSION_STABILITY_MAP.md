# SESSION STABILITY MAP

A. TARGET_BOOT
- Evidence: app source detected (embedded) in all runs.
- Status: PROVEN.

B. DRIVER_ATTACH
- Evidence: WebDriver session created (session id present).
- Status: PROVEN.

C. SESSION_CREATE
- Evidence: initial navigation to tauri://localhost succeeds.
- Status: PROVEN.

D. SESSION_PERSIST_STEP
- Evidence: multiple executeScript calls succeed before crash.
- Status: PARTIAL (fails mid-run in run1/run3).

E. SESSION_PERSIST_RUN
- Evidence: run2 completed; run1/run3 crashed with invalid session id.
- Status: BROKEN (non-deterministic session loss).

F. SESSION_PERSIST_X3
- Evidence: 1/3 completed, 2/3 crashed.
- Status: BROKEN.

G. MEMORY_CANARY_COMPLETION
- Evidence: PASS_MEMORY_REAL in run2 only.
- Status: PARTIAL.
