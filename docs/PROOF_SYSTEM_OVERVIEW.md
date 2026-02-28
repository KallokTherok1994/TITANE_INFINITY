# Proof System Overview
<!-- Status: STABLE | Ring: 4 -->

## Purpose

The TITANE_INFINITY proof system ensures every change is:
- **Traceable** — all evidence stored in `proof_packs/`
- **Reproducible** — gates run x3 for confirmation
- **Stop-the-line** — any FAIL halts progression
- **Append-only** — no evidence can be deleted or overwritten

## Architecture

```
scripts/          ← Entry points (run_all, run_x3, proofpack_init/verify)
checks/           ← Gate implementations (G0–G13, sh + ps1)
templates/        ← Proof pack templates (copied per session)
proof_packs/      ← Runtime evidence (gitignored by default)
docs/             ← System documentation
```

## Gate Map

| Gate | Name | Invariant | Blocker |
|------|------|-----------|---------|
| G0 | PROOF_PACK_COMPLETE | I8 | FAIL if templates missing |
| G1 | BUILD_TAURI_X3 | I5 | BLOCKED_RUNNER in CI prep |
| G2 | TESTS_X3 | I6 | BLOCKED_RUNNER in CI prep |
| G3 | UI_NO_NETWORK_DIRECT | I2 | FAIL if direct fetch found |
| G4 | ONE_DOOR_NETWORK_BACKEND | I2 | WARN if ungoverned calls |
| G5 | ALLOWLIST_DENY_BY_DEFAULT | I4 | FAIL if allowAll=true |
| G6 | TRUTH_CONSISTENCY | I5 | FAIL if versions mismatch |
| G7 | ROUTER_BOUNDED | I6 | WARN if unbounded patterns |
| G8 | MEMORY_ISOLATION | I6 | BLOCKED_RUNNER if no E2E |
| G9 | TOOLS_POLICY_ENFORCED | I3 | WARN for review |
| G10 | REDTEAM_X3 | I6 | BLOCKED_INSTRUMENTATION |
| G11 | EVALS_REGRESSION_NONE | I6 | BLOCKED_INSTRUMENTATION |
| G12 | SUPPLY_CHAIN_SIGNED | I4 | BLOCKED_INSTRUMENTATION |
| G13 | SUPPORT_BUNDLE_EXPORTABLE | I7 | FAIL if script missing |

## BLOCKED vs FAIL

- `BLOCKED_RUNNER` — environment cannot execute the check; gate is deferred not skipped.
- `BLOCKED_INSTRUMENTATION` — measurement tooling not available; manual action required.
- `FAIL` — stop-the-line; must be fixed before progression.

## Execution

```bash
# Run all gates once
bash scripts/run_all.sh

# Run x3 for reproducibility
bash scripts/run_x3.sh

# Initialize proof pack for a session
SESSION_ID=my_session bash scripts/proofpack_init.sh

# Verify proof pack
bash scripts/proofpack_verify.sh
```

## JSONL Schema

Every gate writes to `proof_packs/<GATE>/run.jsonl`:

```json
{"ts":"2026-02-28T20:00:00Z","gate":"G0_PROOF_PACK_COMPLETE","status":"PASS","message":"All templates present"}
```

Status values: `PASS`, `FAIL`, `WARN`, `INFO`, `BLOCKED_RUNNER`, `BLOCKED_INSTRUMENTATION`, `VIOLATION`
