# 20 — GITHUB NATIVE SECURITY MATRIX

**Audit date**: 2026-04-02  
**Repository**: KallokTherok1994/TITANE_INFINITY  
**Auditor**: TITANE∞ Copilot Kernel (governed session)

---

## Gate Index

| Gate | State |
|------|-------|
| G_CODE_SCANNING_CONFIGURED | PARTIAL |
| G_SECRET_SCANNING_CONFIGURED | PARTIAL |
| G_PUSH_PROTECTION_STATE_CLASSIFIED | UNKNOWN |
| G_DEPENDENCY_GRAPH_COMPLETENESS_CLASSIFIED | PARTIAL |
| G_DEPENDENCY_REVIEW_ACTIVE | NOT_APPLICABLE |
| G_DEPENDABOT_ALERTS_VISIBILITY_CLASSIFIED | PARTIAL |
| G_SBOM_EXPORTABLE | PARTIAL |
| G_ATTESTATION_EXISTS | ENABLED_UNVERIFIED |
| G_ATTESTATION_VERIFIED | FAIL |
| G_RULESETS_PRESENT | DECLARED_ONLY |
| G_CODEOWNERS_FOR_CRITICAL_PATHS | NOT_APPLICABLE |

---

## 1. Code Scanning / CodeQL / SARIF Ingestion

**Classification**: PARTIAL

### Evidence

- `.github/workflows/codeql.yml` present and well-formed.
- Triggers: `push` (MAIN/main/dev), `pull_request` (MAIN/main), `schedule` (weekly Monday).
- Languages: `javascript`, `typescript`.
- Query packs: `security-extended`, `security-and-quality` — appropriate depth.
- Workflow-level permissions: `actions: read`, `contents: read`, `security-events: write` (correct).
- Job-level permissions mirror workflow level (correctly scoped).
- `ci-unified.yml` also declares `security-events: write` at job level (redundant but not harmful).
- **SARIF upload**: CodeQL `analyze` action uploads SARIF automatically to GitHub via `security-events: write` — no explicit `upload-sarif` step needed; this is implicit in `github/codeql-action/analyze@v4`.
- **API access**: The integration token used for this audit received HTTP 403 on `/code-scanning/alerts` — alerts exist in the GitHub Security tab but are not API-accessible from this session. Therefore alert triage state is **UNKNOWN**.
- Rust code is **not** covered (CodeQL does not support Rust; no alternative SAST for Rust present).
- Actions are pinned to mutable version tags (`@v4`), not SHA — see file 24.

### Gaps

- Rust / Cargo code path has no static analysis coverage.
- Alert triage state cannot be verified from this integration.
- Actions version tag pinning (not SHA) weakens supply-chain integrity of the scan itself.

---

## 2. Secret Scanning and Push Protection

**Classification**: PARTIAL (workflow-level) / UNKNOWN (GitHub native)

### Evidence

**GitHub Native Secret Scanning**:
- API call to `/secret-scanning/alerts` returned HTTP 403 — native secret scanning state cannot be confirmed from this session.
- GitHub native secret scanning requires a public repo or GitHub Advanced Security (GHAS) license on a private repo.
- Classified UNKNOWN because enablement cannot be confirmed.

**Workflow-level secret scanning (compensating controls)**:
- `.github/workflows/secret-scan-gitleaks.yml`: runs `gitleaks/gitleaks-action@v2` on push to MAIN/main and PRs.
  - `fetch-depth: 0` — full history scan. Correct.
  - `fail: true` — blocks on finding.
  - Gitleaks config `.gitleaks.toml` present with `[extend] useDefault = true`.
  - **Gap**: `gitleaks/gitleaks-action@v2` is pinned to mutable tag `@v2` (not SHA).
- `.github/workflows/gitguardian.yml`: runs `GitGuardian/ggshield-action@v1.33.0`.
  - **Conditional execution**: `if: ${{ env.GITGUARDIAN_API_KEY != '' }}` — scan is silently skipped when `GITGUARDIAN_API_KEY` secret is not configured.
  - Summary step explicitly states: "Scan skipped: repository secret GITGUARDIAN_API_KEY is not configured."
  - **This is a workflow-level push protection gap**: if the secret is absent, no GitGuardian scan runs.
- `.github/workflows/p0-1-secrets-guard.yml`: custom internal scanner at `scripts/security/secret-scan.sh`. Runs on MAIN/dev/stable-runtime push and MAIN PRs.

**Push protection state**: Cannot confirm whether GitHub native push protection is enabled. Classified UNKNOWN.

### Gaps

- GitHub native secret scanning enablement unconfirmed.
- GitGuardian scan silently no-ops when `GITGUARDIAN_API_KEY` is absent — not a hard fail.
- No SHA pinning on gitleaks or ggshield actions.

---

## 3. Dependency Graph Completeness

**Classification**: PARTIAL

### Evidence

- `pnpm-lock.yaml` present at repo root — npm/pnpm dependency tree is lockfile-resolved.
- `src-tauri/Cargo.lock` present — Rust/Cargo dependency tree is lockfile-resolved.
- `dependabot.yml` configured for `package-ecosystem: npm` (directory `/`) — Dependabot reads npm graph.
- **No `package-ecosystem: cargo`** entry in `dependabot.yml` — Rust dependencies not covered by Dependabot updates.
- No dependency submission workflow (`actions/dependency-submission`) found for either npm or Cargo.
- GitHub dependency graph populated from `package.json`/`pnpm-lock.yaml` via Dependabot; Cargo graph completeness depends on GitHub's native Cargo detection (requires repo to be enabled for the dependency graph feature).
- API access for dependency graph state not available from this integration token.

### Gaps

- Rust Dependabot updates not configured.
- No explicit dependency-graph submission workflow to ensure completeness.
- Dependency graph completeness cannot be verified via API.

---

## 4. Dependency Review on Pull Requests

**Classification**: NOT_APPLICABLE (workflow absent)

### Evidence

- No `actions/dependency-review-action` found in any active workflow.
- `.github/workflows/dependabot-auto-review.yml` exists but only requests reviews on Dependabot PRs — it does not run dependency review checks.
- GitHub native dependency review requires GHAS or a public repo with the feature enabled.
- Without the action or native enforcement, no license or vulnerability check runs on dependency changes in PRs.

### Gaps

- `actions/dependency-review-action` should be added to the PR pipeline to gate on new vulnerable dependencies.

---

## 5. Dependabot Alerts Visibility and Triage

**Classification**: PARTIAL

### Evidence

- `dependabot.yml` configured:
  - npm (main branch): monthly, non-major only, grouped, limit 2 PRs.
  - npm (dev branch): monthly, major only, limit 1 PR.
  - Rust: **not configured**.
- Alert triage state: cannot confirm via API (403).
- `dependabot-auto-review.yml` automates requesting review on Dependabot PRs — positive governance signal.
- `SECURITY_AUDIT_DEPENDENCIES_v27.0.0.md` in `docs/` — evidence of manual dependency triage as of v27.

### Gaps

- Rust dependencies not covered by Dependabot.
- Alert triage state unverifiable from this session.
- Monthly cadence may be too slow for critical CVEs; no high-severity override schedule.

---

## 6. Summary Table

| Control Plane | Classification | Confidence |
|--------------|---------------|------------|
| CodeQL / SARIF ingestion | PARTIAL | HIGH (workflow verified; triage state unknown) |
| GitHub native secret scanning | UNKNOWN | — |
| Workflow secret scanning (gitleaks + ggshield + p0) | PARTIAL | HIGH (conditional ggshield gap) |
| Push protection (native) | UNKNOWN | — |
| Dependency graph — npm | PARTIAL | HIGH (lockfile present, no submission workflow) |
| Dependency graph — Cargo | PARTIAL | MEDIUM (Cargo.lock present, no Dependabot entry) |
| Dependency review on PRs | NOT_APPLICABLE | HIGH (action absent) |
| Dependabot alerts | PARTIAL | HIGH (npm only, no Cargo) |

---

## Verdict

**Overall**: PARTIAL  
**Stop-the-line items**:
1. GitGuardian scan silently skips when `GITGUARDIAN_API_KEY` absent — must fail loudly or fall back to gitleaks only.
2. Rust dependencies have no Dependabot coverage.
3. No dependency review action on PRs.
4. No SHA-pinned actions for security scanning workflows.

**Gates**:  
- `G_CODE_SCANNING_CONFIGURED`: PARTIAL  
- `G_SECRET_SCANNING_CONFIGURED`: PARTIAL  
- `G_PUSH_PROTECTION_STATE_CLASSIFIED`: UNKNOWN  
- `G_DEPENDENCY_GRAPH_COMPLETENESS_CLASSIFIED`: PARTIAL  
- `G_DEPENDENCY_REVIEW_ACTIVE`: NOT_APPLICABLE  
- `G_DEPENDABOT_ALERTS_VISIBILITY_CLASSIFIED`: PARTIAL
