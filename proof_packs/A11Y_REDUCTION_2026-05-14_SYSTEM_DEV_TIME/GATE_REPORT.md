# GATE REPORT

VERDICT: PASS

## Product proof

`runTests` targeted slice:

`<summary passed=36 failed=0 />`

Targeted Axe diagnostic:

`ROUTE admin-system blocking=0`
`ROUTE dev-overview blocking=0`
`ROUTE time blocking=0`

`pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --reporter=line`:

`[a11y:titane-conversation] blocking=0 (c=0 s=0 m=0 mn=0)`
`[a11y:admin-system] blocking=0 (c=0 s=0 m=0 mn=0)`
`[a11y:dev-overview] blocking=0 (c=0 s=0 m=0 mn=0)`
`[a11y:time] blocking=0 (c=0 s=0 m=0 mn=0)`
`[a11y:monitoring] blocking=0 (c=0 s=0 m=0 mn=0)`
`[a11y:dashboard] blocking=0 (c=0 s=0 m=0 mn=0)`
`[a11y:memory] blocking=2 (c=1 s=1 m=0 mn=0)`
`[a11y:governance-center] blocking=1 (c=0 s=1 m=0 mn=0)`
`[a11y:orchestration-center] blocking=0 (c=0 s=0 m=0 mn=0)`
`[a11y:research] blocking=0 (c=0 s=0 m=0 mn=0)`
`[a11y:aggregate] blocking=3 baseline=30`
`12 passed (54.0s)`

## Governance gates

`pnpm verify:registry`:

`Changed files: 21`
`No watched files changed - registry sync not required`
`registry-integrity: PASS`
`registry-quality: PASS`

`bash scripts/autoheal/detect_recurrence.sh`:

`PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`
`PASS: G_AH_RECURRENCE_GUARD_PASS`
`INFO: entries=1969`

`bash scripts/verify_instructions.sh`:

`SUMMARY: PASS=52 FAIL=0`