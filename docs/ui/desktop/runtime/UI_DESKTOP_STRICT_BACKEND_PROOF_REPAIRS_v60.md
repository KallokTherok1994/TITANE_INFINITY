# UI Desktop Strict Backend Proof — Repairs v60

**Date**: 2026-05-10

## Repairs Applied in v60

### Repair 1 — Helper auto-inject v60 schema fields

**Problem**: v58/v59 helper did not emit `schemaVersion`, `capturedAt`, `sourceSpec`, `tier`, `redactionApplied`, `secretScanPassed` — causing 219 MISSING_SOURCE_SPEC warnings.

**Fix**: `persistProofLine()` now auto-injects `schemaVersion: "v60"` and `capturedAt` before persisting. All probe functions accept `opts.sourceSpec`, `opts.tier`, `opts.moduleId`.

**File**: `e2e/desktop/helpers/uiDesktopBackendProofDepth.js`

---

### Repair 2 — probeInvokeAndReflect structured uiEvidence

**Problem**: UI reflection only recorded flat fields (`uiReflected: bool`). Strict mode requires structured `uiEvidence: { selector, found, textHash, evidenceKind, tagName }`.

**Fix**: `probeInvokeAndReflect()` now calls `browser.execute()` returning `{ found, text, tagName }`, computes `textHash` via `crypto.createHash('sha256')`, and emits a full `uiEvidence` object.

**File**: `e2e/desktop/helpers/uiDesktopBackendProofDepth.js`

---

### Repair 3 — probeSandboxedMutation structured sandboxEvidence

**Problem**: Sandbox mutations emitted flat `tempPath/cleanupStatus/nonProductionMarker` fields. Strict mode requires `sandboxEvidence: { tempPathRedacted, cleanupStatus, nonProductionMarker, description }`.

**Fix**: All sandbox records now use nested `sandboxEvidence` object with `nonProductionMarker: true`.

**File**: `e2e/desktop/helpers/uiDesktopBackendProofDepth.js`

---

### Repair 4 — Strict verifier FAIL vs WARN for v60 artifacts

**Problem**: Verifier treated all missing fields as WARN regardless of artifact version.

**Fix**: Added `isV60Artifact()`, `strictFail()`, `STRICT_MODE` flag. In strict mode, v60 artifacts get FAIL for: missing `sourceSpec`, `route`, `uiEvidence` (if UI_REFLECTS), `sandboxEvidence.nonProductionMarker` (if SANDBOXED), `redactionApplied`, `secretScanPassed`, `schemaVersion !== "v60"`, missing `capturedAt`. Non-v60 artifacts stay WARN.

**File**: `scripts/verify/verify-backend-proof-depth.mjs`
