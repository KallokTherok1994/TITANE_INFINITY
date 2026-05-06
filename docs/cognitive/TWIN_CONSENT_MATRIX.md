# Twin Consent Matrix

Lock: B1
Date: 2026-05-06
Type: T0/T1

| subsystem | files inspected | claimed capability | actual observed implementation | classification | proof signal | risk | next lock dependency | scorecard dependency | Desktop test dependency |
|---|---|---|---|---|---|---|---|---|---|
| Twin Consent Ledger | src/services/twin_consent/TwinConsentLedgerContract.ts | Prevent identity-sensitive activation without explicit validation | Ledger states/actions and expiry are modeled; activation intentionally blocked in scaffold mode | PARTIAL | D3 contract and prior tests | Identity drift risk if boundary bypassed outside contract path | D3 | TWIN_CONSENT_SCORECARD, KEVIN_AXIS_SCORECARD | AI-DESKTOP-13 |
| GDPR export/purge paths | src/services/twin_consent/TwinConsentLedgerContract.ts | Export and purge consent traces safely | Export/purge functions are modeled and flag-gated | HEURISTIC | Contract schema and literals | Compliance gap if not wired to all runtime surfaces | D3, F0 | KNOWLEDGE_GOVERNANCE_SCORECARD | AI-DESKTOP-13, AI-DESKTOP-20 |
