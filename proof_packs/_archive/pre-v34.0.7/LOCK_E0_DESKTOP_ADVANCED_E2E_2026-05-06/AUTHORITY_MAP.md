# AUTHORITY_MAP — LOCK_E0_DESKTOP_ADVANCED_E2E_2026-05-06

## Lock Authority

| Authority | Source |
|-----------|--------|
| Governance kernel | `.github/copilot-instructions.md` (L1) |
| Agent spec | `AGENTS.md` (L3) |
| Lock command | Super Prompt v16.1 — E0 Advanced Desktop E2E Certification |
| Branch | MAIN (Durable Mode) |

## Dependency Chain

| Lock | Status | Prerequisite for E0 |
|------|--------|---------------------|
| D0 — Agent Effectiveness Scorecard | SEALED | AI-DESKTOP-14 (scorecard doc) |
| D1 — OMEGA Real Handler | SEALED | AI-DESKTOP-11 (D1 vitest proof) |
| D2 — Singularity Measured Layer | SEALED | AI-DESKTOP-12 (D2 vitest proof) |
| D3 — Twin Consent Ledger | SEALED | AI-DESKTOP-13 (D3 contract proof) |
| D4 — Self-Improvement Lab | SEALED (5844e7ea3) | AI-DESKTOP-16 (approval invariant) |
| E0 — Advanced Desktop E2E | THIS LOCK | — |

## Ring Boundaries

| Surface | Ring | E0 Touch |
|---------|------|----------|
| `e2e/advanced-intelligence/` | Ring 3 (QA) | ADDED spec |
| `tests/contract/e2e-desktop/` | Ring 3 (QA/Contract) | ADDED Vitest spec |
| `scripts/verify/` | Ring 4 (Scripts) | EXPANDED validator |
| `proof_packs/` | Documentation | CREATED proof pack |
| `reports/` | Documentation | CREATED matrix report |

No Ring 0/1/2 changes. No IPC changes. No Rust changes.
