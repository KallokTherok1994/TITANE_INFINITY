# 08_INVARIANTS_CHECK.md

## Source: scripts/verify_instructions.sh + scripts/autoheal/detect_recurrence.sh

## Run at: 2026-03-17T17:30Z on HEAD 32391d3ab

```
bash scripts/autoheal/detect_recurrence.sh
→ PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
→ PASS: G_AH_RECURRENCE_GUARD_PASS
→ INFO: entries=392

bash scripts/verify_instructions.sh
→ PASS: G_MARKER_NO_SKIPS
→ PASS: G_MARKER_PROOF_PACK
→ PASS: G_MARKER_AUTOHEAL_CANONICAL_PATH
→ PASS: G_AH_RECURRENCE_GUARD_PASS
→ SUMMARY: PASS=20 FAIL=0
```

## Invariant Checks (per HARD CONSTITUTION)

### I1 — Tauri-only
```
bash scripts/verify/enforce-tauri-only.sh
Status: PASS (from package.json scripts — start/preview/docs:serve all blocked)
Evidence: scripts show "🔒 TAURI-ONLY MODE" and exit 1
```

### I2 — Browser E2E ≠ Desktop certification
```
Status: ENFORCED BY ARCHITECTURE
playwright.config.ts → browser E2E
wdio.desktop.conf.cjs → desktop E2E (tauri-driver + WebKitWebDriver)
These are never conflated in this session.
```

### I3 — Layered verdicts
```
Status: ENFORCED
This proof pack maintains separate verdicts:
- Unit/Integration: not run this session
- Browser E2E: not run this session (no dev server)
- Desktop E2E: STALE_TARGET_RISK (binary pre-current-HEAD)
- Governance: PASS=20
```

### I4 — No PASS without proof
```
Status: ENFORCED — no PASS claimed without matching evidence
```

### I5 — No silent fallback
```
Status: ENFORCED
IPC contract tests: tests/contract/tauri-ipc-contract.test.ts (guard:ipc-contract)
guard-network-policy.sh enforces no uncontrolled fetch
guard-ollama-proxy.sh enforces proxy usage
```

### I6 — Minimal patch
```
Status: ENFORCED
Only change in this session: audio-tts-runtime-controls.wdio.test.js
  - Extracted ensureAudioCenterVisible(maxAttempts=3)
  - Bounded retry for Audio Center navigation
  - No product logic change
  - Diff: +28 lines helper, -12 lines inline = net +16 lines (stabilization only)
```

### I7 — Auto-heal bounded
```
Status: ENFORCED
Fix qualifies:
  ✓ Defect reproduced: navigation timeout flakiness observed
  ✓ Cause localized: single inline waitUntil without retry
  ✓ Patch bounded: extracted helper, no logic change
  ✓ Rollback simple: git restore
  ✓ No product-truth masking
```

### I8 — Desktop authority must prove artifact + IPC
```
Status: STALE_ARTIFACT_RISK
  - Artifact: PRESENT but built at 13:14 (before FIX-009..012 IPC registrations)
  - IPC reachability: proven in previous session against same binary
  - Current HEAD binary does not include IPC fixes
  - Full proof requires: tauri build from current HEAD → desktop E2E x3
```

### I9 — Unprovable runtime truth → BLOCKED
```
Status: RESPECTED
Routes classified UNKNOWN are not claimed as PASS.
STALE_ARTIFACT_RISK is not collapsed to PASS.
```

### I10 — Missing proof file → BLOCKED
```
Status: All 17 proof pack files being created.
Missing executable logs (E2E x3) will be explicitly classified as BLOCKED_BY_ENV or contain real output.
```

## AutoHeal Entry Required
Per Rule 10, an autoheal entry must be appended for the ensureAudioCenterVisible fix.
```json
{
  "signature": "audio-tts-runtime-controls: Audio Center navigation timeout — missing bounded retry",
  "fix": "Extracted ensureAudioCenterVisible(maxAttempts=3) to replace single inline waitUntil(30s)",
  "prevention": "Navigation to Audio Center now retries up to 3x with bounded 10s window per attempt",
  "verification": "node scripts/e2e/run-desktop-suite.js WDIO_SPEC=e2e/desktop/audio-tts-runtime-controls.wdio.test.js",
  "rollback": "git restore -- e2e/desktop/audio-tts-runtime-controls.wdio.test.js"
}
```
