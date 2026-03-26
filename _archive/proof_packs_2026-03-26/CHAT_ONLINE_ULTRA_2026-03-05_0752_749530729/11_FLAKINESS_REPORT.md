# FLAKINESS REPORT

- generated_at_utc: 2026-03-05T13:03:00Z

## Observed

- Unit run infrastructure had one interrupted attempt in shared terminal; a clean rerun (`unit_chat_online_pack_final`) produced stable PASS x3.
- Healthcheck is consistently failing for deterministic configuration reasons (missing keys), not intermittent runtime instability.

## Intermittence

- Unit x3 final ID: 3/3 PASS
- Health x3: 3/3 FAIL (same root cause)
- Online E2E smoke/full: not executed due blocked prerequisite (`ONLINE_READY`)

## Suspected Causes

- External provider credentials not configured in current runtime.
- Existing dirty worktree causes strict autoheal-registry checker to fail correlation gate.

## Mitigation

1. Configure one external provider key and rerun health x3.
2. Launch online E2E smoke/full x3 only after health PASS.
3. Re-run registry checker after reconciling dirty tree scope.

## Update 2026-03-05T14:27:26Z

- Online smoke was executed and stable: `e2e_online_smoke` 3/3 PASS.
- Online full is currently unstable/failing: `e2e_online_full` run1 FAIL and `e2e_online_full_retry` run1 FAIL.
- Common marker in failing full runs: WebDriver `invalid session id` during interaction/screenshot phase.

## Current Assessment

- Smoke path: stable.
- Full path: reproducible failure under current runtime/driver state; requires dedicated fix before seal.
