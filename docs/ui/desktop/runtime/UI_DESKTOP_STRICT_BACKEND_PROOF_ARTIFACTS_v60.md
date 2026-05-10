# UI Desktop Strict Backend Proof — Artifacts v60

**Date**: 2026-05-10

## Primary Artifact

| File | Records | Schema |
|---|---|---|
| `artifacts/backend-proof-depth/v60-strict-backend-proof.jsonl` | 53 | v60 |

## Verification Command

```bash
TITANE_PROOF_ARTIFACT=artifacts/backend-proof-depth/v60-strict-backend-proof.jsonl \
  pnpm run verify:backend-proof-depth:strict
# PASS: 6 | WARN: 282 | FAIL: 0 → ✅ VERDICT: PASS
```

## Schema Fields (all required in v60 strict)

```json
{
  "schemaVersion": "v60",
  "capturedAt": "ISO-8601",
  "command": "ipc-command|null",
  "module": "MODULE_ID",
  "moduleId": "MODULE_ID",
  "sourceSpec": "ui-desktop-strict-backend-proof-<name>.wdio.test.js",
  "route": "/route",
  "tier": 1,
  "proofLevel": "UI_REFLECTS_BACKEND_RESULT|...",
  "redactionApplied": false,
  "secretScanPassed": true,
  "uiEvidence": {
    "selector": "[data-testid=\"...\"]",
    "found": true,
    "redactedTextPreview": "...",
    "textHash": "sha256-16chars",
    "evidenceKind": "STATUS_BADGE|HEALTH_CARD|RESULT_PANEL|...",
    "tagName": "div"
  }
}
```

## Legacy Artifacts (not v60 strict)

| File | Records | WARN in strict | Classified |
|---|---|---|---|
| `v58-backend-proof-depth.jsonl` | 254 | 254 (MISSING_SOURCE_SPEC) | LEGACY_V58_ARTIFACT |
| `v59-ipc-response-reflection.jsonl` | 118 | 28 (MISSING_SOURCE_SPEC) | LEGACY_V59_ACCEPTED |

> WARNs for legacy artifacts are EXPECTED and not treated as FAIL in strict mode.
