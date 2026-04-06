# 21 — DEPENDENCY TRUTH MATRIX

**Audit date**: 2026-04-02  
**Repository**: KallokTherok1994/TITANE_INFINITY  
**Auditor**: TITANE∞ Copilot Kernel (governed session)

---

## Gate

| Gate | State |
|------|-------|
| G_DEPENDENCY_GRAPH_COMPLETENESS_CLASSIFIED | PARTIAL |

---

## Dependency Truth Rule (applied)

> Manifest-only dependency visibility is not full dependency truth.  
> If build-resolved dependencies are not represented through lockfiles or dependency submission: classify as PARTIAL.

---

## 1. npm / pnpm Ecosystem

| Item | State | Notes |
|------|-------|-------|
| `package.json` manifest | PRESENT | Root-level, defines 70+ direct dependencies |
| `pnpm-lock.yaml` | PRESENT | Build-resolved, tracks exact versions |
| Lockfile committed to repo | YES | `pnpm-lock.yaml` at repo root |
| `pnpm install --frozen-lockfile` in CI | YES | `ci-unified.yml`, `release-unified.yml`, `release-deployment.yml` |
| Dependabot npm config | PRESENT | Monthly, minor+patch on main; major on dev |
| Dependabot update groups | PRESENT | `pnpm-minor-patch` and `pnpm-major-only` groups |
| Major version updates | BLOCKED on main | Major goes to `dev` branch only |
| Dependency submission workflow | ABSENT | No `actions/dependency-submission` action used |
| Dependency review on PRs | ABSENT | No `actions/dependency-review-action` |

**npm Truth Level**: PARTIAL  
- Lockfile is present and CI enforces `--frozen-lockfile` — build-resolved truth is captured.  
- No dependency submission to GitHub's dependency graph API — GitHub's native graph relies on Dependabot's own parsing, which may lag.  
- No PR-level dependency review gate.

---

## 2. Rust / Cargo Ecosystem

| Item | State | Notes |
|------|-------|-------|
| `src-tauri/Cargo.toml` manifest | PRESENT | Defines Tauri + Rust dependencies |
| `src-tauri/Cargo.lock` | PRESENT | Build-resolved, committed to repo |
| `cargo build --frozen` in CI | NOT CONFIRMED | `ci-unified.yml` runs `cargo build --verbose` without `--frozen` or `--locked` |
| Dependabot Cargo config | ABSENT | `dependabot.yml` has no `package-ecosystem: cargo` entry |
| Cargo dependency submission | ABSENT | No submission workflow |
| Dependency review on PRs (Cargo) | ABSENT | No action |
| Rust advisory DB check | ABSENT | No `cargo audit` or `rustsec` step in active workflows |

**Cargo Truth Level**: PARTIAL  
- `Cargo.lock` is present and committed — this is the minimum acceptable floor.  
- `cargo build` in CI does not pass `--locked`, meaning CI could silently diverge from the committed lockfile if crates are yanked/updated.  
- No Dependabot coverage means Rust advisories will not surface automatically.  
- No `cargo audit` step means known CVEs in Rust dependencies will not block CI.

---

## 3. Python Ecosystem

| Item | State | Notes |
|------|-------|-------|
| `python-package-conda.yml` workflow | PRESENT | Runs conda/pip install |
| `requirements.txt` / `pyproject.toml` | NOT FOUND | No Python dependency manifest in root |
| Dependabot Python config | ABSENT | No `pip` or `conda` entry in `dependabot.yml` |

**Python Truth Level**: UNKNOWN  
- Workflow exists but no manifest found. If Python deps are transient/CI-only, risk is lower.

---

## 4. Dependency Review Gap Analysis

### Missing: `actions/dependency-review-action`

This action, run on pull requests, would:
- Block PRs introducing dependencies with known CVEs.
- Flag license changes.
- Compare lockfile diff against the GitHub Advisory Database.

**Risk without it**: A PR can introduce a `pnpm-lock.yaml` or `Cargo.lock` change with a newly vulnerable package, and no CI gate will detect it before merge.

### Missing: Cargo Dependabot

`dependabot.yml` addition needed:
```yaml
- package-ecosystem: cargo
  directory: '/src-tauri'
  schedule:
    interval: weekly
```

### Missing: `cargo audit` in CI

No step in active workflows runs `cargo audit` or `cargo deny`. The Rust advisory database (RustSec) contains known CVEs in Cargo packages; without this check, Rust supply-chain vulnerabilities are invisible to CI.

---

## 5. Lockfile Integrity Assessment

| Lockfile | Present | CI enforced | SHA-verified | Submission |
|----------|---------|-------------|--------------|------------|
| `pnpm-lock.yaml` | YES | YES (`--frozen-lockfile`) | NO (no explicit hash check step) | NO |
| `src-tauri/Cargo.lock` | YES | PARTIAL (`--verbose`, no `--locked`) | NO | NO |

---

## 6. Overall Dependency Truth Classification

**Classification**: PARTIAL

**Rationale**:
- Both lockfiles are present and committed — meets the minimum floor.
- npm lockfile is CI-enforced frozen; Cargo lockfile is not enforced with `--locked`.
- No dependency submission to GitHub's dependency graph.
- Dependency review action on PRs added 2026-04-02 (`dependency-review.yml`).
- Rust ecosystem added to Dependabot 2026-04-02 (`dependabot.yml` cargo entry).

**Stop-the-line items (remaining)**:
1. Add `cargo audit` (or `cargo deny`) step to `ci-unified.yml` and `release-unified.yml`.
2. Add `--locked` flag to `cargo build` in CI to enforce lockfile integrity.
3. Add dependency submission workflow to push resolved graph to GitHub's API.
