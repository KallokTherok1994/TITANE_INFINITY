# 23 — RULESETS AND OWNERSHIP MATRIX

**Audit date**: 2026-04-02  
**Repository**: KallokTherok1994/TITANE_INFINITY  
**Auditor**: TITANE∞ Copilot Kernel (governed session)

---

## Gate Index

| Gate | State | Remediation |
|------|-------|-------------|
| G_RULESETS_PRESENT | DECLARED_ONLY | — |
| G_CODEOWNERS_FOR_CRITICAL_PATHS | ENABLED_UNVERIFIED | .github/CODEOWNERS created 2026-04-02 |

---

## 1. Branch Protection / Rulesets

### 1.1 Evidence

| Item | State | Notes |
|------|-------|-------|
| GitHub Rulesets (API) | UNKNOWN | Cannot verify via API (403) |
| Branch protection rules (API) | UNKNOWN | Cannot verify via API (403) |
| `scripts/setup-branch-protection.sh` | EXISTS | Declarative helper only; see §1.2 |
| Branch protection applied | DECLARED_ONLY | Script exists but no evidence of execution |

### 1.2 `setup-branch-protection.sh` Contents

The script at `scripts/setup-branch-protection.sh` declares the following intended rules for the `MAIN` branch:

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build", "lint", "type-check", "test", "test-rust"]
  },
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "enforce_admins": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

**Classification**: DECLARED_ONLY  
This JSON describes desired state. Whether it was ever applied via `gh api` or GitHub UI cannot be confirmed from the repository. No audit log, no API response, no screenshot, no proof pack entry confirming the rules are active.

### 1.3 Required Status Checks Gap Analysis

The declared required contexts (`build`, `lint`, `type-check`, `test`, `test-rust`) do not match the actual job names in `ci-unified.yml`:

| Declared Context | Actual Job Name in ci-unified.yml |
|-----------------|----------------------------------|
| `build` | `build` (exists) |
| `lint` | `lint-and-typecheck` (name mismatch) |
| `type-check` | `lint-and-typecheck` (name mismatch) |
| `test` | `test` (exists) |
| `test-rust` | `build-and-test-rust` (name mismatch) |

If branch protection was applied using these declared context names, the actual CI jobs would not satisfy the required status checks, because GitHub matches on exact job names. This means branch protection, even if applied, may be misconfigured to be trivially bypassed.

### 1.4 Merge Conflict State

Two active workflow files contain unresolved git merge conflict markers:
- `.github/workflows/ci-unified.yml` (8 conflict markers)
- `.github/workflows/release-unified.yml` (8 conflict markers)

These files are syntactically invalid YAML when conflict markers are present. GitHub Actions ignores or errors on files with conflict markers. **This means both the primary CI pipeline and the release pipeline may be non-functional in their current state.**

### 1.5 Protected Branches Observed

From workflow `on.push.branches` and `on.pull_request.branches` declarations:
- `MAIN` — primary branch, referenced by most workflows
- `main` — aliases of MAIN referenced by some workflows
- `dev` — development branch
- `stable-runtime` — referenced by some workflows

No evidence of protection on `dev` or `stable-runtime`.

---

## 2. CODEOWNERS

### 2.1 Evidence — Updated 2026-04-02

`.github/CODEOWNERS` created with 15 critical path entries covering:
- `src-tauri/` (production runtime)
- `.github/workflows/` (CI/CD supply chain)
- `scripts/gates/`, `scripts/autoheal/`, `scripts/security/`, `scripts/verify/`
- `src/lib/tauriCommands.ts`, `src/lib/tauriClient.ts` (IPC contract)
- `sbom/`, `deployment/`, `docs/security matrices`
- Both tauri base config files

Owner: `@KallokTherok1994` (sole owner on solo repository).

**Classification**: ENABLED_UNVERIFIED  
CODEOWNERS file is present. GitHub will route PR reviews accordingly. Effect requires branch protection `require_code_owner_reviews: true` to be confirmed active (currently DECLARED_ONLY).

### 2.2 Critical Paths Without Owner Coverage

All critical paths now covered by `.github/CODEOWNERS`.

---

## 3. Required Deployments

| Item | State |
|------|-------|
| Required deployment environments | UNKNOWN (cannot confirm via API) |
| Deployment environment protection rules | UNKNOWN |
| `deploy-v27-production.yml` environment declaration | NOT FOUND in reviewed section |

---

## 4. Summary

| Control | Classification | Priority |
|---------|---------------|----------|
| Branch protection on MAIN | DECLARED_ONLY | CRITICAL |
| Branch protection on dev | UNKNOWN | HIGH |
| Required status checks (context names correct) | FAIL (name mismatch) | CRITICAL |
| CODEOWNERS | NOT_APPLICABLE (absent) | HIGH |
| Merge conflict in CI workflow | FAIL | CRITICAL |
| Merge conflict in release workflow | FAIL | CRITICAL |
| Required deployments | UNKNOWN | MEDIUM |

---

## 5. Required Actions — Updated 2026-04-02

**Completed**:
- Merge conflicts in `ci-unified.yml` and `release-unified.yml` resolved ✅
- `.github/CODEOWNERS` created ✅

**Remaining**:
1. Verify branch protection is active on `MAIN` via GitHub UI or API; document proof.
2. Fix required status check context names to match actual job names in CI.
3. Enable `require_code_owner_reviews: true` after confirming branch protection is active.
4. Extend branch protection to `dev` with at minimum required status checks.
