# Kernel Certification Readiness (INT-2)

## Baseline Validated
- **Build:** Reproducible x3 on local hardware ✓
- **Tests:** Available commands via `pnpm run test:*` ✓
- **Governance:** Versioned and auditable ✓

## INT-2 Phases (No New Features Before Noyau Certified)

### K0 — Baseline (COMPLETE)
- Tests/build x3 consolidated ← **repro gate proof**
- Truth snapshot frozen in proof packs ✓

### K1 — Policy Spine (READY)
- One-door network: ring guardrails in place
- UI no direct network: verified via guards
- Deny-by-default tauri allowlist

### K2 — Truth Architecture (READY)
- Backend truth metadata: governance registries
- Observable contradiction audit available

### K3 — Anti-drift (READY)
- Generated outputs: gates available
- Document/code drift: verifier scripts staged

## Certification Gate Commands
```bash
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify/pre-deployment-check.sh --quick
pnpm run verify:tauri-only
pnpm run verify:online-first
pnpm run verify:invariants-governed
```

## Verdict Path
Once INT-2 passes above gates → Kernel PASS → Next phases (OPT-3+) enabled
