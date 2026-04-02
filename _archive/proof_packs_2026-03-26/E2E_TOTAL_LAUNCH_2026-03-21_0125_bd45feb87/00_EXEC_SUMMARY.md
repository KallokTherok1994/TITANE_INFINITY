# E2E_TOTAL_LAUNCH — TITANE∞ v28.5.0

EXEC_MODE: BACKGROUND / PROOF-DRIVEN
SCOPE_RING: Ring 4 (tests/E2E harness)
RISK: MEDIUM — test chain certification
PLAN: discovery → vitest → cargo test → playwright browser → fix locks → rerun x3 → proof
PROOFS: 01_DISCOVERY, 02_VITEST, 03_CARGO, 04_PLAYWRIGHT, 05_FIXES, 06_GATES
ROLLBACK: git restore e2e/total-dev-smoke.spec.ts src/components/layout/AppShell.tsx src-tauri/src/control_panel_commands/tests.rs
