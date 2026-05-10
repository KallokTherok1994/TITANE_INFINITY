# TITANE UI_DESKTOP_DETERMINISTIC_ARTIFACTS_CI_CLEAN_BASELINE_v67
## Artifact Lifecycle Policy — Section E

**Date:** 2026-05-10
**Purpose:** Define sealed vs. current vs. versioned artifact strategy

---

## Policy Statement

The TITANE v67 mission establishes a **three-tier artifact lifecycle** to achieve deterministic, verifiable, and reproducible E2E proof artifacts.

### Principle 1: Sealed Artifacts Are Immutable

After a mission is sealed (e.g., v65), its canonical proof artifact becomes **read-only** and must not be appended to by subsequent smoke runs or tests.

**Enforcement:**
- Sealed artifacts are stored in `artifacts/ui-desktop/` with version prefix (e.g., `v64-main-menu-capture-reconciliation.jsonl`)
- Sealed artifacts are protected by checksum verification
- Tests and runners must not append to sealed artifacts

**Violation Consequence:**
- Proof pack counts become unreliable
- Verifier results depend on artifact history (non-deterministic)
- Sealed certification becomes invalid
- Gate: `BLOCKED_BY_ARTIFACT_DRIFT`

---

### Principle 2: Runtime Smoke Artifacts Are Mutable

Smoke runs during development must write to **separate, mutable artifacts** to avoid polluting sealed proofs.

**Artifact Paths:**
- **Current smoke:** `artifacts/ui-desktop/current-main-menu-capture-reconciliation.jsonl`
- **Versioned smoke (per mission):** `artifacts/ui-desktop/v67-main-menu-smoke.jsonl`, etc.
- **Per-run versioned (optional):** `artifacts/ui-desktop/v67-main-menu-smoke-run-1.jsonl`, etc.

**Behavior:**
- Runtime smoke artifacts are truncated on each run (no append carry-over)
- Multiple runs within a mission may append within the same v67 artifact
- Cleanup: smoke artifacts can be safely deleted before commit

**Fallback:**
- If `TITANE_UI_DESKTOP_ARTIFACT` is not set, default to `current-main-menu-capture-reconciliation.jsonl`
- Spec must NOT default to v64-sealed artifact

---

### Principle 3: Verifier Supports Sealed and Current Modes

The verifier script must support both artifact types and prevent accidental misclassification.

**Modes:**
- **Sealed mode** (`--sealed` or env `TITANE_UI_DESKTOP_ARTIFACT_MODE=sealed`):
  - Verifies the immutable v64 artifact
  - Line count must match sealed certification (24 for v65, etc.)
  - Used for governance/proof audits
  - Used in CI for release validation
  
- **Current mode** (`--current` or env `TITANE_UI_DESKTOP_ARTIFACT_MODE=current`):
  - Verifies the mutable current/v67 artifact
  - Line count expected to grow with multiple runs
  - Used for development smoke validation
  - Used in pre-commit checks

**Default (no explicit mode):**
- If sealed artifact exists and is explicitly requested: sealed mode
- If current artifact is being used for runtime validation: current mode
- **Ambiguity rejection:** If both exist and mode is not explicit, fail with message:
  ```
  FAIL: Verifier ambiguity — both sealed and current artifacts exist.
  Specify --sealed or --current or env TITANE_UI_DESKTOP_ARTIFACT_MODE
  ```

---

### Principle 4: Proof Pack Documentation Clarity

Proof pack documents must explicitly distinguish sealed vs. current artifact state at documentation time.

**Documentation Pattern:**

```markdown
## Sealed Artifact (v65 Final)

- **Path:** artifacts/ui-desktop/v64-main-menu-capture-reconciliation.jsonl
- **Records:** 24
- **Line count:** 24
- **Status:** Sealed (immutable after v65)
- **Checksum:** [SHA256]
- **Verified:** PASS=22 WARN=2 FAIL=0

---

## Current Artifact (v67 Runtime)

- **Path:** artifacts/ui-desktop/current-main-menu-capture-reconciliation.jsonl
- **Records:** 8 (from this run)
- **Accumulation note:** May grow with multiple smoke runs in v67
- **Status:** Mutable (ephemeral)
- **Verified:** PASS=6 WARN=0 FAIL=0 (latest run only)

---

## Version Markers

- **v64 sealed:** Immutable reference, used for v65 proof pack, locked.
- **v67 runtime:** Mutable, used for v67 development/smoke, safe to delete.
```

**Key Distinctions:**
- ✓ Sealed artifact line count is **static** (never changes after seal)
- ✓ Current artifact line count is **dynamic** (changes per run)
- ✓ Proof pack captures both at documentation time
- ✓ Verifier modes prevent mixing sealed/current validation

---

## Implementation Checklist

### Spec File Changes (`e2e/desktop/ui-desktop-main-menu-capture-reconciliation.wdio.test.js`)

**Changes Required:**
1. ✗ Remove hardcoded `ARTIFACT_FILE` path
2. ✓ Read `process.env.TITANE_UI_DESKTOP_ARTIFACT`
3. ✓ Default to `artifacts/ui-desktop/current-main-menu-capture-reconciliation.jsonl`
4. ✓ Check if artifact exists and `TITANE_ARTIFACT_APPEND !== '1'`
5. ✓ If so, truncate artifact before run (write empty file or truncate via `fs.truncateSync()`)
6. ✓ If appending is explicit (`TITANE_ARTIFACT_APPEND=1`), inject `runId` field
7. ✓ Persist `runId` if available in environment

**Env Vars:**
- `TITANE_UI_DESKTOP_ARTIFACT=<path>` → artifact file path
- `TITANE_ARTIFACT_APPEND=1` → preserve append mode (default)
- `TITANE_ARTIFACT_APPEND=0` → truncate before run (for sealed artifact isolation)
- `TITANE_ARTIFACT_RUN_ID=<id>` → optional, for tracking (default: empty)

**Code Pattern:**
```javascript
const DEFAULT_ARTIFACT = 'artifacts/ui-desktop/current-main-menu-capture-reconciliation.jsonl';
const ARTIFACT_FILE = path.resolve(process.cwd(), process.env.TITANE_UI_DESKTOP_ARTIFACT || DEFAULT_ARTIFACT);
const APPEND_MODE = process.env.TITANE_ARTIFACT_APPEND !== '0'; // default true
const RUN_ID = process.env.TITANE_ARTIFACT_RUN_ID || '';

if (fs.existsSync(ARTIFACT_FILE) && !APPEND_MODE) {
  // Truncate if not in append mode
  fs.truncateSync(ARTIFACT_FILE, 0);
}

function persistRecord(record) {
  // ...
  const entry = JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    capturedAt: new Date().toISOString(),
    sourceSpec: SOURCE_SPEC,
    ...(RUN_ID ? { runId: RUN_ID } : {}),
    ...record,
  });
  fs.appendFileSync(ARTIFACT_FILE, entry + '\n', 'utf8');
}
```

---

### Verifier Script Changes (`scripts/verify/verify-ui-desktop-main-menu-reconciliation.mjs`)

**Changes Required:**
1. ✓ Support `--artifact <path>` argument
2. ✓ Support env `TITANE_UI_DESKTOP_ARTIFACT`
3. ✓ Implement sealed vs. current mode logic
4. ✓ Detect mode ambiguity and fail with clear message
5. ✓ Print artifact path, line count, mode at start of output

**Env Vars:**
- `TITANE_UI_DESKTOP_ARTIFACT=<path>` → artifact file path
- `TITANE_UI_DESKTOP_ARTIFACT_MODE=sealed|current` → explicit mode

**CLI Args:**
- `--artifact <path>` → override artifact path
- `--sealed` → force sealed mode (fail if artifact not v64)
- `--current` → force current mode (accept any path)

**Code Pattern:**
```javascript
const DEFAULT_SEALED_ARTIFACT = 'artifacts/ui-desktop/v64-main-menu-capture-reconciliation.jsonl';
const DEFAULT_CURRENT_ARTIFACT = 'artifacts/ui-desktop/current-main-menu-capture-reconciliation.jsonl';

let artifactPath = process.env.TITANE_UI_DESKTOP_ARTIFACT || '';
let mode = process.env.TITANE_UI_DESKTOP_ARTIFACT_MODE || '';

// Parse CLI args
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '--artifact') artifactPath = process.argv[++i];
  if (process.argv[i] === '--sealed') mode = 'sealed';
  if (process.argv[i] === '--current') mode = 'current';
}

// Auto-detect mode if not explicit
if (!mode) {
  const sealedExists = fs.existsSync(DEFAULT_SEALED_ARTIFACT);
  const currentExists = fs.existsSync(DEFAULT_CURRENT_ARTIFACT);
  
  if (sealedExists && currentExists && !artifactPath) {
    console.error('FAIL: Verifier ambiguity — both sealed and current artifacts exist.');
    console.error('Specify --sealed, --current, or --artifact <path>');
    process.exit(1);
  }
  
  artifactPath = artifactPath || (sealedExists ? DEFAULT_SEALED_ARTIFACT : DEFAULT_CURRENT_ARTIFACT);
  mode = artifactPath.includes('v64') ? 'sealed' : 'current';
}

// Final artifact path
const ARTIFACT_PATH = path.resolve(ROOT, artifactPath);
console.log(`Artifact: ${ARTIFACT_PATH} (mode=${mode})`);
```

---

### Package Script Variants

**Current (single):**
```json
"verify:ui-desktop-main-menu-reconciliation": "node scripts/verify/verify-ui-desktop-main-menu-reconciliation.mjs"
```

**Updated (with variants):**
```json
"verify:ui-desktop-main-menu-reconciliation": "node scripts/verify/verify-ui-desktop-main-menu-reconciliation.mjs",
"verify:ui-desktop-main-menu-reconciliation:sealed": "node scripts/verify/verify-ui-desktop-main-menu-reconciliation.mjs --sealed",
"verify:ui-desktop-main-menu-reconciliation:current": "node scripts/verify/verify-ui-desktop-main-menu-reconciliation.mjs --current"
```

---

## Artifact Cleanup Policy

### Before Commit to MAIN

**Safe to Delete:**
- `artifacts/ui-desktop/current-main-menu-capture-reconciliation.jsonl` (mutable smoke)
- `artifacts/ui-desktop/v67-main-menu-smoke*.jsonl` (versioned smoke)
- Any per-run temporary artifact

**Protect from Deletion:**
- `artifacts/ui-desktop/v64-main-menu-capture-reconciliation.jsonl` (sealed reference)
- Any sealed v<N>-* artifacts

**Git Recommendation:**
```gitignore
# Transient smoke artifacts
artifacts/ui-desktop/current-*.jsonl
artifacts/ui-desktop/v*-*-smoke*.jsonl

# Keep sealed artifacts tracked
!artifacts/ui-desktop/v*-main-menu-capture-reconciliation.jsonl
```

---

## Sealed Artifact Reference Checksum

After v65 seal, compute and document the immutability checksum:

```bash
sha256sum artifacts/ui-desktop/v64-main-menu-capture-reconciliation.jsonl
```

**Store in Proof Pack:**
```yaml
sealed_artifact_checksums:
  v64_main_menu: "abc123def456..."
```

**Verify on Startup (v67 Gate):**
```bash
#!/bin/bash
SEALED_PATH="artifacts/ui-desktop/v64-main-menu-capture-reconciliation.jsonl"
EXPECTED_CHECKSUM="abc123def456..."

if [ -f "$SEALED_PATH" ]; then
  ACTUAL=$(sha256sum "$SEALED_PATH" | cut -d' ' -f1)
  if [ "$ACTUAL" != "$EXPECTED_CHECKSUM" ]; then
    echo "FAIL: v64 sealed artifact checksum mismatch"
    echo "  Expected: $EXPECTED_CHECKSUM"
    echo "  Actual: $ACTUAL"
    exit 1
  fi
fi
```

---

## Transition Plan (v67 Implementation)

**Phase 1 (Immediate):** Implement env var support in spec and verifier
**Phase 2 (G-H):** Run reproducibility test with current/v67 artifacts
**Phase 3 (I-J):** Add CI gates for sealed artifact immutability check
**Phase 4 (Future):** Create `scripts/verify/verify-ui-desktop-artifact-immutability.mjs` for CI

---

## Governance Impact

**Before v67:** 
- All artifacts mutable (governance concern)
- No sealed/current distinction (confusing)
- Verifier counts drift (unreliable)

**After v67:**
- Sealed artifacts immutable (governance ready)
- Clear sealed/current distinction (trustworthy)
- Verifier modes deterministic (repeatable)
- CI gates can validate sealed immutability (auditable)

---

## Next Steps

**Section F:** Implement env var support in spec and verifier
**Section G:** Test clean-run reproducibility with v67 artifact
**Section H-I:** Audit worktree and harden CI

---

## Verdict (Lifecycle Policy Phase)

**Status:** ✓ POLICY DEFINED
- Three-tier artifact lifecycle: sealed → current → versioned
- Env vars designed: `TITANE_UI_DESKTOP_ARTIFACT`, `TITANE_ARTIFACT_APPEND`, `TITANE_ARTIFACT_RUN_ID`
- Verifier modes: sealed / current
- Immutability enforcement: checksum-based
- Git cleanup policy: transient artifacts ignored, sealed protected

**Classification:** UI_DESKTOP_ARTIFACT_LIFECYCLE_POLICY_DEFINED_READY_FOR_IMPLEMENTATION

---

## Execution Timeline
- **Startup Audit (C):** ✓ COMPLETE
- **Drift Diagnosis (D):** ✓ COMPLETE
- **Artifact Lifecycle Policy (E):** ✓ COMPLETE (current doc)
- **Deterministic Handling (F):** → TODO (next: implement)
- **Reproducibility Test (G):** → TODO
- **Worktree Audit (H):** → TODO
- **CI Hardening (I):** → TODO
- **Final Gates (J):** → TODO
- **AutoHeal (K):** → TODO
- **Certification (L):** → TODO
