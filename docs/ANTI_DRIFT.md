# Anti-Drift Policy
<!-- Status: STABLE | Ring: 4 -->

## Definition

**Drift** = any unintended deviation from the governed architecture, policy, or proof system.

## Drift Detection

| Signal | Detector | Gate |
|--------|----------|------|
| UI making direct HTTP calls | `check_G3_UI_NO_NETWORK_DIRECT` | G3 |
| Version mismatch across files | `check_G6_TRUTH_CONSISTENCY` | G6 |
| Unbounded retries in router | `check_G7_ROUTER_BOUNDED` | G7 |
| Raw `invoke()` in UI | `check_G9_TOOLS_POLICY_ENFORCED` | G9 |
| allowlist.all = true | `check_G5_ALLOWLIST_DENY_BY_DEFAULT` | G5 |
| Missing proof pack templates | `check_G0_PROOF_PACK_COMPLETE` | G0 |
| E2E without memory isolation | `check_G8_MEMORY_ISOLATION` | G8 |

## Drift Prevention Rules

1. **Scope bound**: Every change must declare its Ring and scope.
2. **No gratuitous refactor**: Only touch files required for the stated goal.
3. **No new network surface**: `fetch()`, `WebSocket`, `XMLHttpRequest` in UI = STOP.
4. **No capability creep**: New Tauri capabilities require gate + test + approval.
5. **No skipped tests**: A skipped test = a hidden drift = FAIL.
6. **Proof before claim**: No "PASS" without JSONL evidence.

## Drift Response Protocol

1. Detect (gate FAIL or WARN)
2. Diagnose (ROOT_CAUSE.md)
3. Plan (NEXT_ACTION.md — 1 corrective iteration max)
4. Fix (minimal patch)
5. Re-verify (re-run gate)
6. If still FAIL after 1 iteration: rollback + STOP

## Multi-Agent Drift Prevention

- EXACT: one executing AI agent at a time.
- Multiple executing agents = drift risk = stop-the-line.
- E2E runner: one authority at a time (WebdriverIO **or** Playwright, never both active).
