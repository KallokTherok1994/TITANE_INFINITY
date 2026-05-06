# Twin Consent Ledger — Policy

**Lock:** D3  
**Version:** v13 Identity Observation Sidecar  
**Status:** ACTIVE (policy document; no runtime activation by default)

---

## Core Doctrine

> **Intelligence prouvée avant intelligence proclamée.**  
> **Twin remains a mirror, not an authority.**  
> **Confidence is not consent.**

---

## Fundamental Rules

### Rule 1 — Confidence is not consent
`confidence` score alone (0.0–1.0) never grants activation for identity-sensitive observations.  
A high-confidence auto-detected `identity_fact` still requires `validation_status=confirmed` before it can affect behavior, memory, or identity modeling.

### Rule 2 — Auto-detected identity-sensitive observations require validation
When `auto_detected=true` AND the observation type is identity-sensitive (`identity_fact`, `symbolic_axis`, `behavioral_instruction`, `emotional_pattern`, `value`), the system MUST normalize the entry:
- `requires_validation=true`
- `validation_status=requires_kevin_validation`
- `can_affect_identity=false`
- `can_affect_behavior=false`

### Rule 3 — Rejected/expired/blocked observations are inert
`validation_status` of `rejected`, `expired`, or `blocked` permanently prevents any behavioral, memory, or identity effect, regardless of other fields.

### Rule 4 — Symbolic axes are hypotheses unless confirmed
`observation_type=symbolic_axis` is always interpretive. It cannot affect identity modeling unless `validation_status=confirmed`.

### Rule 5 — Behavioral instructions require explicit confirmation
`observation_type=behavioral_instruction` cannot alter future response style unless `validation_status=confirmed`.

### Rule 6 — system_observed supports logging only
`validation_status=system_observed` may be logged and displayed but cannot activate identity behaviors.

### Rule 7 — Kevin validation required for deep identity observations
The following types always trigger `requiresKevinValidation=true`:
- `identity_fact`
- `symbolic_axis`
- `behavioral_instruction`
- `emotional_pattern`
- `value`
- any entry with `risk_level=identity_sensitive` or `risk_level=restricted`

### Rule 8 — Restricted risk level blocks identity activation
`risk_level=restricted` prevents `canAffectIdentity()` from returning `true` even for confirmed entries.

---

## Activation Gates (canAffect* policy)

### canAffectBehavior
Returns `true` only when:
- `validation_status=confirmed`
- not rejected/expired/blocked
- not expired timestamp
- not `requires_kevin_validation`

### canAffectMemory
Returns `true` only when:
- `validation_status=confirmed`
- not rejected/expired/blocked

### canAffectIdentity
Returns `true` only when:
- `validation_status=confirmed`
- not rejected/expired/blocked
- `risk_level` is not `restricted`
- no expiry date violation

---

## Feature Flags

| Flag | Default | Purpose |
|------|---------|---------|
| `VITE_TITANE_D3_TWIN_CONSENT_LEDGER` | `false` | T4 scaffold — GDPR consent lifecycle |
| `VITE_TITANE_D3_IDENTITY_OBSERVATION_ACTIVE` | `false` | Identity observation emission (v13 sidecar) |

Both flags are **PROD SAFE by default (off)**.

---

## Known Limits (D3)

1. `no-active-observation-by-default` — no emission until flag explicitly activated
2. `no-rust-identity-wiring` — Rust backend not instrumented
3. `symbolic-axis-always-hypothesis-unless-confirmed` — interpretive by default
4. `confidence-not-consent-enforced` — policy helper enforces this at contract level
5. `emotional-pattern-blocked-until-kevin-validation` — requires explicit Kevin confirmation

---

## Rollback
```bash
git restore src/services/twin_consent/TwinConsentLedgerContract.ts
# Set VITE_TITANE_D3_IDENTITY_OBSERVATION_ACTIVE=false (already default)
```

---

## Next Lock (D4)
D4 may activate identity observation with explicit Rust integration and E2E consent lane (AI-DESKTOP-13 → ACTIVE).
