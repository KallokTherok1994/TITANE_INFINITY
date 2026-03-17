# TITANE∞ — Tests, Proofs and Gates (EN)

**Version:** 28.0.0  
**Status:** QUALIFIED  
**Date:** 2026-03-17

> See also: `docs/TESTING_STRATEGY.md`, `docs/MAP_TESTS_GATES.md`, `docs/MAP_GATES.md`

---

## Test categories

| Category | Tool | Directory | Command | Status |
|---|---|---|---|---|
| Unit tests | Vitest | `tests/` | `pnpm run test` | PROVEN |
| Integration tests | Vitest | `tests/` | `pnpm run test` | PROVEN |
| Browser E2E | Playwright | `e2e/` | `pnpm run test:e2e:playwright` | PROVEN |
| Desktop E2E | WDIO (WebdriverIO) | `e2e/desktop/` | `pnpm run e2e:desktop` | QUALIFIED |
| Rust tests | cargo test | `src-tauri/` | `pnpm run test:rust` | PROVEN |
| Architecture tests | Vitest custom | `tests/` | `pnpm run test:architecture` | PROVEN |
| Compliance tests | Vitest custom | `tests/` | `pnpm run test:compliance` | QUALIFIED |
| OMEGA tests | Vitest custom | `tests/` | `pnpm run test:omega` | PARTIAL |

### Important notes

- **Full E2E disabled by default**: `FULL_E2E_ENABLED=false` in `e2e/chat-provider-decision-certification.spec.ts`
- E2E mock mode (`window.__TITANE_E2E_CHAT_MOCK__`) can be activated to bypass real providers in tests

---

## Governance gates

| Gate | Script | Success criterion | Audience |
|---|---|---|---|
| G1 — No offline without reason | `scripts/gates/g1-no-offline-without-reason.sh` | Exit 0 | CI |
| G2 — IPC conformance | `scripts/guard/guard-ipc-only-tests.sh` | Exit 0 | CI |
| G3 — Legacy divergence | `scripts/gates/g3-legacy-divergence.sh` | Exit 0 | CI |
| rc-network-surface | `scripts/gates/rc-network-surface-gate.sh` | Exit 0 | CI |
| verify_instructions | `scripts/verify_instructions.sh` | PASS=20, FAIL=0 | dev/CI |
| detect_recurrence | `scripts/autoheal/detect_recurrence.sh` | G_AH_RECURRENCE_GUARD_PASS | dev/CI |
| tauri-only | `scripts/verify/enforce-tauri-only.sh` | Exit 0 | CI |
| online-first | `scripts/verify/enforce-online-first.sh` | Exit 0 | CI |
| tauri-configs | `scripts/verify/validate-tauri-configs.sh` | Exit 0 | CI |
| prod-boot | `scripts/gates/vite-base-relative-gate.cjs` | Exit 0 | CI |

---

## Verdict meanings

| Verdict | Meaning |
|---|---|
| PASS | Gate passed, verification successful |
| FAIL | Gate failed — mandatory STOP-THE-LINE |
| BLOCKED | Cannot run gate — action required |
| QUALIFIED | Mostly verified — minor uncertainty |
| PARTIAL | Some aspects verified, others not |

---

## When proof packs are required

A proof pack is required for:
- Any P0 fix session (critical bug)
- Any IPC surface modification
- Any Tauri capability modification
- Any release or pre-release
- Any major governance operation

**Format:** `proof_packs/[SESSION_NAME]_[DATE]/` with `VERDICT.md` and `ROLLBACK.md`

---

## Mandatory gate execution

```bash
# After any code modification
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```

Expected output:
```
verify_instructions: PASS=20 FAIL=0
detect_recurrence: G_AH_RECURRENCE_GUARD_PASS
```

---

*French documentation: [docs/dev/fr/tests-preuves-et-gates.md](../fr/tests-preuves-et-gates.md)*
