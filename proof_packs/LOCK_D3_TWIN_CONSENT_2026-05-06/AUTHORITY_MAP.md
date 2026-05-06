# D3 Authority Map

| Layer | Owner | Gate |
|-------|-------|------|
| L1 Kernel | .github/copilot-instructions.md | Rule 1–18 |
| L3 AGENTS.md | AGENTS.md | D3 dock |
| D3 Contract | TwinConsentLedgerContract.ts | Zod schema + policy helpers |
| D3 Tests | TwinConsentLedgerContract.test.ts | vitest 84/84 |
| D3 Validator | verify_twin_consent_ledger.sh | PASS=25 FAIL=0 |
| Anti-regression | detect_recurrence.sh | 1670 entries, PASS |
| Instructions | verify_instructions.sh | PASS=51 FAIL=0 |
| AutoHeal | autoheal_rules.jsonl | LOCK_D3_TWIN_CONSENT_LEDGER_2026_05_06 |

## Runtime Authority
- Feature flags: `VITE_TITANE_D3_TWIN_CONSENT_LEDGER=false`, `VITE_TITANE_D3_IDENTITY_OBSERVATION_ACTIVE=false`
- No Rust wiring — TypeScript contract layer only
- Twin remains mirror, not authority
