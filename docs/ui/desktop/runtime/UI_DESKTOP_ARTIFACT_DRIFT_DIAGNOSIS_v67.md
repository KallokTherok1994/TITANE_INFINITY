# TITANE UI_DESKTOP_DETERMINISTIC_ARTIFACTS_CI_CLEAN_BASELINE_v67
## Artifact Drift Diagnosis — Section D

**Date:** 2026-05-10
**Investigation Focus:** Why v64 artifact grew 24→32→40 records

---

## Problem Statement

The canonical v64 artifact should be **immutable after seal**, but it continues to grow on every smoke run:
- **v65:** 24 records (documented at seal)
- **v66:** 32 records (grew by 8 after post-seal smoke)
- **v67 startup:** 40 records (grew by 8 more, detected on first check)

**Expected:** Fixed artifact at 24 records after v65 seal.
**Actual:** Artifact continues to accumulate records on every invocation.

---

## Code Inspection Results

### 1. Spec File: `e2e/desktop/ui-desktop-main-menu-capture-reconciliation.wdio.test.js`

**Key Code Segment:**
```javascript
const ARTIFACT_FILE = path.resolve(process.cwd(), 'artifacts/ui-desktop/v64-main-menu-capture-reconciliation.jsonl');

function persistRecord(record) {
  try {
    const dir = path.dirname(ARTIFACT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const entry = JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      capturedAt: new Date().toISOString(),
      sourceSpec: SOURCE_SPEC,
      ...record,
    });
    fs.appendFileSync(ARTIFACT_FILE, entry + '\n', 'utf8');
  } catch (e) {
    console.warn(`[v64:capture] Could not persist record: ${e.message}`);
  }
}
```

**Findings:**
- ✗ Hardcoded artifact path (no env var override)
- ✗ Uses `fs.appendFileSync()` (always appends, never truncates)
- ✗ No `TITANE_ARTIFACT_APPEND` or similar control
- ✗ No `truncate-before-run` logic
- ✓ Proper JSONL format per line

**Test Flow:**
```javascript
for (const surface of SURFACES) {  // 8 surfaces: TITANE, TIME, ADMIN, DEV, FUSION, TWINS, OPTIMIZATION, TOTAL_DEV
  describe(`[v64:capture] ${surface.capturedSurface}...`, () => {
    // ...test cases...
    after(async () => {
      persistRecord({...});  // ← Appends one record per surface
    });
  });
}
```

**Calculation:**
- 8 surfaces per run = 8 records appended per run
- v65 runs (24 records): 24 ÷ 8 = 3 smoke runs
- v66 runs (32 records): 32 ÷ 8 = 4 smoke runs (+1 new run)
- v67 runs (40 records): 40 ÷ 8 = 5 smoke runs (+1 new run)

**Conclusion:** ✗ **ROOT CAUSE CONFIRMED** — Spec appends on every run without option to redirect or truncate.

---

### 2. Verifier: `scripts/verify/verify-ui-desktop-main-menu-reconciliation.mjs`

**Key Code Segment:**
```javascript
const ARTIFACT_PATH = path.resolve(
  ROOT,
  'artifacts/ui-desktop/v64-main-menu-capture-reconciliation.jsonl'
);

// ...

const raw = fs.readFileSync(ARTIFACT_PATH, 'utf8');
const lines = raw
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean);

pass(`artifact exists with ${lines.length} records`);
```

**Findings:**
- ✗ Hardcoded artifact path (no env override)
- ✗ Counts all lines as records (no truncation on verifier side)
- ✗ No `--artifact` argument support
- ✗ No sealed vs. current mode distinction
- ✓ Validates each record's schema/fields

**Implications:**
- Verifier grows its validation pass count as records accumulate (PASS=22 in v66, PASS=25 in v67)
- Each 8-record batch adds 6 new PASS records + 2 WARN records for DEV/FUSION
- Verifier remains PASS but line count drifts

**Conclusion:** ✗ **SECONDARY ISSUE** — Verifier should support sealed vs. current modes to avoid confusing proof-pack line counts.

---

### 3. Runner: `scripts/e2e/run-desktop-suite.js`

**Key Code Segment:**
```javascript
const WDIO_SPEC = process.env.WDIO_SPEC || '';
// ...
if (WDIO_SPEC) {
  const specList = WDIO_SPEC.split(',')
    .map(item => item.trim())
    .filter(Boolean);
  if (specList.length > 0) {
    for (const specItem of specList) {
      wdioArgs.push('--spec', specItem);
    }
  }
}
```

**Findings:**
- ✗ No artifact handling for ui-desktop-main-menu artifact
- ✗ No `TITANE_UI_DESKTOP_ARTIFACT` env support
- ✓ Supports `WDIO_SPEC` for multi-spec runs
- ✓ Sets up `REPORTS` directory but only for WDIO reports

**Implications:**
- Runner does not have authority over artifact path
- Spec always uses hardcoded path, runner cannot redirect it
- Artifact grows regardless of how many times runner is invoked

**Conclusion:** ✓ **NO PRIMARY ISSUE** — Runner design is correct (specs own artifact output); spec must be fixed to support env overrides.

---

### 4. Package Scripts: `package.json`

**Current Scripts:**
```json
"verify:ui-desktop-main-menu-reconciliation": "node scripts/verify/verify-ui-desktop-main-menu-reconciliation.mjs"
```

**Findings:**
- ✗ Single hardcoded verification script (no sealed/current variants)
- ✓ Integrates into general test pipeline

**Conclusion:** ✗ **TERTIARY ISSUE** — Need `:sealed` and `:current` variants to distinguish artifact modes.

---

## Root Cause Analysis

### Primary Issue: **No Artifact Path Override in Spec**

**Severity:** 🔴 **CRITICAL** — Blocks deterministic baseline

**Root Cause:**
The spec file hardcodes the v64 canonical artifact path and uses append-only mode with no environment variable to:
1. Redirect to a different artifact file
2. Enable truncate-before-run mode
3. Disable appending (e.g., `TITANE_ARTIFACT_APPEND=0`)

**Impact:**
- Every smoke run appends 8 records to the canonical v64 artifact
- v64 artifact is NOT immutable post-seal
- Proof-pack counts must be manually updated after each smoke run
- Verifier line counts drift, confusing sealed vs. current state

**Fix Strategy:**
1. Add env var `TITANE_UI_DESKTOP_ARTIFACT` (default: `current-main-menu-capture-reconciliation.jsonl`)
2. Add env var `TITANE_ARTIFACT_APPEND` (default: `1` for backward compat, set `0` to truncate)
3. Patch spec to:
   - Read `process.env.TITANE_UI_DESKTOP_ARTIFACT || <default>`
   - Check if artifact exists and `TITANE_ARTIFACT_APPEND !== '1'` → truncate before run
   - If appending, inject `runId` field for tracing

---

### Secondary Issue: **No Sealed vs. Current Mode in Verifier**

**Severity:** 🟡 **HIGH** — Confuses artifact state tracking

**Root Cause:**
Verifier hardcodes artifact path and counts all lines, with no way to distinguish between:
1. Sealed v64 artifact (read-only after v65 seal)
2. Current runtime artifact (mutable, updated by smoke runs)

**Impact:**
- Proof-pack docs state "24 records" (sealed) but verifier shows 25 PASS (current)
- Users cannot validate sealed artifact independently
- Governance audit difficult to reproduce

**Fix Strategy:**
1. Add `--artifact <path>` argument to verifier (with sensible default)
2. Add env var `TITANE_UI_DESKTOP_ARTIFACT` support (consistent with spec)
3. Create package script variants:
   - `:sealed` → explicitly verify v64-sealed artifact (if exists)
   - `:current` → explicitly verify current/mutable artifact

---

### Tertiary Issue: **No Sealed Artifact Immutability Enforcement**

**Severity:** 🟡 **MEDIUM** — Design issue, no runtime protection

**Root Cause:**
The system treats all artifacts as mutable. There is no enforcement that v64 canonical should be sealed after v65.

**Impact:**
- No technical guard against accidentally appending to v64
- Manual discipline required to not re-run specs into v64

**Fix Strategy:**
1. Create `artifacts/ui-desktop/v64-sealed.jsonl` as reference copy after v65 seal
2. Verify v64-main-menu artifact checksum against v64-sealed on startup
3. Add gate: `scripts/verify/verify-ui-desktop-artifact-immutability.mjs`

---

## Artifact Lifecycle Evolution

| Phase | Artifact | Records | Status | Writable? | Root Cause |
|-------|----------|---------|--------|-----------|-----------|
| v64 creation | v64-main-menu | 8 | Created | ✓ | First test run |
| v65 seal | v64-main-menu | 24 | Sealed | ✗ (should be) | Spec appends 3 more runs (v65 repeats) |
| v66 post-seal | v64-main-menu | 32 | **Still writable** | ✓ (bad!) | No immutability enforcement |
| v67 startup | v64-main-menu | 40 | **Drifting** | ✓ (bad!) | Spec still appending |

---

## Recommendations for Section E (Artifact Lifecycle Policy)

1. **Define sealed vs. current:**
   - Sealed: v64-main-menu (reference, should be immutable)
   - Current: current-main-menu (mutable, for runtime smoke)
   - Versioned: v67-main-menu, v68-main-menu (per-mission)

2. **Implement env vars:**
   - `TITANE_UI_DESKTOP_ARTIFACT` → redirect spec output
   - `TITANE_ARTIFACT_APPEND` → control append vs. truncate

3. **Immutability enforcement:**
   - Checksum v64 artifact at seal (store in proof pack)
   - Verify checksum on startup (gate in CI)
   - Prevent accidental mutations

4. **Proof pack clarity:**
   - Document sealed count separately from current
   - Include both checksums in certification

---

## Next Steps

**Section F Implementation:**
- Patch spec to support `TITANE_UI_DESKTOP_ARTIFACT` env
- Patch verifier to support `TITANE_UI_DESKTOP_ARTIFACT` env + `--artifact` arg
- Add package script variants (`:sealed`, `:current`)
- Test clean-run (Section G)

**Expected Outcome:**
- v64 artifact remains immutable at 40 records (or reset to original if lifecycle is reset)
- v67 smoke writes to separate current/v67 artifact
- Verifier can validate both independently
- Proof packs are deterministic

---

## Verdict (Drift Diagnosis Phase)

**Status:** ✓ ROOT CAUSE IDENTIFIED
- Spec appends without env override → **PRIMARY BLOCKER**
- Verifier lacks sealed/current mode → **SECONDARY ISSUE**
- No immutability enforcement → **TERTIARY ISSUE**

**Classification:** UI_DESKTOP_ARTIFACT_DRIFT_ROOT_CAUSE_SPEC_APPEND_NO_ENV_OVERRIDE

**Blocking:** ✗ Not blocking — can be fixed in Section F
**Critical:** ✓ Yes — must be fixed for deterministic baseline

---

## Execution Timeline
- **Startup Audit (C):** ✓ COMPLETE
- **Drift Diagnosis (D):** ✓ COMPLETE (current doc)
- **Artifact Lifecycle Policy (E):** → TODO
- **Deterministic Handling (F):** → TODO (will implement fixes)
- **Reproducibility Test (G):** → TODO
- **Worktree Audit (H):** → TODO
- **CI Hardening (I):** → TODO
- **Final Gates (J):** → TODO
- **AutoHeal (K):** → TODO
- **Certification (L):** → TODO
