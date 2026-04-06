# 25 — SLSA AND SSDF MAPPING

**Audit date**: 2026-04-02  
**Repository**: KallokTherok1994/TITANE_INFINITY  
**Auditor**: TITANE∞ Copilot Kernel (governed session)

---

## Gate Index

| Gate | State |
|------|-------|
| G_SLSA_SOURCE_LEVEL_CLASSIFIED | PARTIAL (L1) |
| G_SLSA_BUILD_LEVEL_CLASSIFIED | PARTIAL (L1) |
| G_SSDF_MAPPING_PRESENT | PARTIAL |

---

## Source / Build Maturity Rule (applied)

> Map observed repository controls to SLSA Source track, SLSA Build track, and SSDF-compatible practices.  
> Do not overclaim a level. If evidence is incomplete, downgrade.

---

## 1. SLSA Source Track

### 1.1 SLSA Source Level Requirements

| Level | Requirement | State |
|-------|-------------|-------|
| Source L1 | Version controlled | PASS — Git + GitHub |
| Source L1 | Retained for 18 months | UNKNOWN — cannot verify retention policy via API |
| Source L2 | Verified history (signed commits or similar) | FAIL — no commit signing enforced |
| Source L2 | Two-person review (branch protection + PR required) | DECLARED_ONLY — branch protection not confirmed active |
| Source L2 | Retained, tamper-evident | UNKNOWN |
| Source L3 | Continuous enforcement of L2 | FAIL — branch protection unconfirmed; merge conflicts in CI |

### 1.2 Source Level Assessment

**Claimed Level**: L1 (conservative)  
**Evidence for L1**:
- Repository uses Git for version control on GitHub.
- All changes are tracked in git history.

**Evidence against L2**:
- No commit signing enforced (no `require_signed_commits` confirmed in branch protection).
- No CODEOWNERS file — two-person review not structurally enforced via ownership rules.
- Branch protection rules: DECLARED_ONLY (not confirmed active).
- Merge conflicts in `ci-unified.yml` and `release-unified.yml` indicate broken governance.
- Required status check context names do not match actual CI job names (see file 23).

**SLSA Source Level**: L1 (verified) / L2 (unachievable until branch protection confirmed and commit signing enforced)

---

## 2. SLSA Build Track

### 2.1 SLSA Build Level Requirements

| Level | Requirement | State |
|-------|-------------|-------|
| Build L1 | Build process documented | PASS — CI workflows present |
| Build L1 | Provenance available (any format) | PARTIAL — CycloneDX SBOM exists, no build provenance |
| Build L2 | Hosted build platform (GitHub Actions) | PASS — GitHub-hosted runners |
| Build L2 | Provenance authenticated | FAIL — no sigstore/in-toto provenance; PGP sig on SBOM only |
| Build L2 | Provenance includes top-level inputs | FAIL — no provenance document listing inputs |
| Build L3 | Builds run in hardened environment | UNKNOWN — standard GitHub-hosted runners, no self-hosted hardened |
| Build L3 | Provenance non-falsifiable | FAIL — no `slsa-github-generator` or `actions/attest-build-provenance` |
| Build L3 | Dependencies fully declared | PARTIAL — npm lockfile yes, Cargo lockfile yes, but `--locked` not enforced in CI |

### 2.2 Build Level Assessment

**Claimed Level**: L1 (conservative)  
**Evidence for L1**:
- CI/CD pipeline defined in `.github/workflows/`.
- GitHub-hosted runners used (managed environment).
- Build outputs are `AppImage`, `.deb`, `.msi`, `.dmg` (Tauri releases).

**Evidence against L2**:
- No SLSA provenance document generated for any build artifact.
- No `actions/attest-build-provenance` in `release-unified.yml`.
- No `slsa-github-generator` workflow.
- CycloneDX SBOM exists but is manually generated and stale — not a provenance document.
- Two active build workflows (`ci-unified.yml`, `release-unified.yml`) have unresolved merge conflicts — build pipeline is broken.
- `actions/checkout@v6.0.1` is a suspicious non-standard version that should be verified (see file 24).
- 0/251 actions are SHA-pinned — build environment is not hermetic.

**SLSA Build Level**: L1 (functional L1 blocked by merge conflicts; L2 requires significant work)

---

## 3. NIST SSDF Coverage Mapping

Reference: NIST SP 800-218 Secure Software Development Framework (SSDF) v1.1

### 3.1 PO — Prepare the Organization

| Practice | Sub-practice | State | Evidence |
|----------|-------------|-------|----------|
| PO.1 — Define security requirements | PO.1.1 | PARTIAL | `docs/SECURITY.md`, security principles defined |
| PO.1 — Define security requirements | PO.1.2 | PARTIAL | Tauri allowlist / surface lock documented |
| PO.2 — Implement roles and responsibilities | PO.2.1 | FAIL | No CODEOWNERS, no ownership matrix |
| PO.3 — Implement toolchains | PO.3.1 | PARTIAL | CI/CD pipeline defined but broken (merge conflicts) |
| PO.3 — Implement toolchains | PO.3.2 | PARTIAL | pnpm lockfile enforced; Cargo `--locked` absent |
| PO.4 — Define and use security criteria | PO.4.1 | PARTIAL | P0–P6 gate system defined |
| PO.4 — Define criteria for code acceptance | PO.4.2 | PARTIAL | Gates exist but branch protection unconfirmed |
| PO.5 — Implement and maintain a secure environment | PO.5.1 | PARTIAL | GitHub-hosted runners; no SHA-pinned actions |

### 3.2 PS — Protect the Software

| Practice | Sub-practice | State | Evidence |
|----------|-------------|-------|----------|
| PS.1 — Protect code from unauthorized access | PS.1.1 | DECLARED_ONLY | Branch protection script only; not confirmed active |
| PS.2 — Provide a mechanism to verify code integrity | PS.2.1 | PARTIAL | PGP sig on SBOM; no commit signing; no release artifact signing via sigstore |
| PS.3 — Archive and protect each code release | PS.3.1 | PARTIAL | GitHub Releases used; no attestation |
| PS.3 — Archive and protect each code release | PS.3.2 | PARTIAL | Release artifacts produced; no sigstore attestation |

### 3.3 PW — Produce Well-Secured Software

| Practice | Sub-practice | State | Evidence |
|----------|-------------|-------|----------|
| PW.1 — Design software to meet security requirements | PW.1.1 | PARTIAL | 4-Ring architecture; One Door IPC; Tauri allowlist |
| PW.2 — Review code for security | PW.2.1 | PARTIAL | CodeQL configured; no SAST for Rust |
| PW.2 — Review code for security | PW.2.2 | PARTIAL | P0–P6 gates; gitleaks; GitGuardian (conditional) |
| PW.4 — Reuse existing, well-secured software | PW.4.1 | PARTIAL | npm lockfile; Cargo.lock; no `cargo audit` |
| PW.4 — Reuse existing, well-secured software | PW.4.2 | PARTIAL | Dependabot for npm; not for Cargo |
| PW.5 — Create source code by adhering to secure coding practices | PW.5.1 | PARTIAL | ESLint, TypeScript strict; Rust not audited |
| PW.6 — Configure software tools for security | PW.6.1 | PARTIAL | CI configured; merge conflicts break it |
| PW.6 — Test executable code to identify vulnerabilities | PW.6.2 | PARTIAL | Gate system; no penetration testing evidence |
| PW.7 — Review and/or analyze code to identify vulnerabilities | PW.7.1 | PARTIAL | CodeQL on JS/TS; no Rust SAST |
| PW.8 — Test compiled binaries for vulnerabilities | PW.8.1 | UNKNOWN | No binary scanning workflow found |
| PW.9 — Perform SBOM generation | PW.9.1 | PARTIAL | CycloneDX SBOM present but stale and not automated |

### 3.4 RV — Respond to Vulnerabilities

| Practice | Sub-practice | State | Evidence |
|----------|-------------|-------|----------|
| RV.1 — Identify and confirm vulnerabilities | RV.1.1 | PARTIAL | Dependabot (npm only); no Cargo |
| RV.1 — Identify and confirm vulnerabilities | RV.1.2 | PARTIAL | CodeQL; gitleaks; no `cargo audit` |
| RV.2 — Assess, prioritize, and remediate vulnerabilities | RV.2.1 | PARTIAL | `SECURITY_AUDIT_DEPENDENCIES_v27.0.0.md` evidence |
| RV.2 — Assess, prioritize, and remediate vulnerabilities | RV.2.2 | PARTIAL | AutoHeal capture system for CI fixes |
| RV.3 — Analyze vulnerabilities to identify root causes | RV.3.1 | PARTIAL | Proof pack system; no formal CVE disclosure process |

---

## 4. Overall Maturity Summary

| Framework | Track | Assessed Level | Ceiling |
|-----------|-------|---------------|---------|
| SLSA | Source | L1 | L2 (blocked by branch protection, commit signing) |
| SLSA | Build | L1 | L2 (blocked by provenance, SHA pinning, merge conflicts) |
| NIST SSDF | PO | PARTIAL | — |
| NIST SSDF | PS | PARTIAL | — |
| NIST SSDF | PW | PARTIAL | — |
| NIST SSDF | RV | PARTIAL | — |

---

## 5. Priority Upgrade Path — Updated 2026-04-02 (Batch 2)

### To reach SLSA Source L2
1. Confirm and document branch protection on MAIN.
2. Enable commit signing enforcement (or signed tag requirement for releases).
3. Fix required status check context names to match actual CI jobs.

### To reach SLSA Build L2
1. ~~SHA-pin all third-party actions~~ ✅ Done 2026-04-02.
2. ~~Add `actions/attest-build-provenance`~~ ✅ Done 2026-04-02 (release-unified.yml).
3. ~~Enforce `cargo build --locked`~~ ✅ Done 2026-04-02 (`cargo test --locked`).
4. ~~Resolve merge conflicts~~ ✅ Done 2026-04-02.

### To reach SLSA Build L3 (future)
1. Use `slsa-github-generator` for hermetic, non-falsifiable provenance.
2. Verify `actions/checkout@v6.0.1` SHA resolves to expected commit ✅ (sha: `8e8c483d`).
3. Pin remaining first-party `actions/` namespace actions to SHAs.

### SSDF Gap Closures
1. ~~Create CODEOWNERS~~ ✅ Done 2026-04-02 (PO.2, PS.1).
2. ~~Add `cargo audit` to CI~~ ✅ Already present in `ci-unified.yml` security-audit job.
3. ~~Add `cargo test --locked`~~ ✅ Done 2026-04-02 (PW.4, RV.1).
4. ~~Add Cargo Dependabot~~ ✅ Done 2026-04-02 (RV.1).
5. Automate SBOM generation in CI and add SPDX format (PW.9).
6. Confirm GitHub native secret scanning and push protection state (PS.2).
