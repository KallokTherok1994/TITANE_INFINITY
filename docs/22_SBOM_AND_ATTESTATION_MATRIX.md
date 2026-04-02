# 22 — SBOM AND ATTESTATION MATRIX

**Audit date**: 2026-04-02  
**Repository**: KallokTherok1994/TITANE_INFINITY  
**Auditor**: TITANE∞ Copilot Kernel (governed session)

---

## Gate Index

| Gate | State |
|------|-------|
| G_SBOM_EXPORTABLE | PARTIAL |
| G_ATTESTATION_EXISTS | ENABLED_UNVERIFIED |
| G_ATTESTATION_VERIFIED | FAIL |

---

## Attestation Rule (applied)

> Attestation presence is not a security proof.  
> Verification evidence is required.  
> If attestation exists but no verification evidence is found:  
> state = ENABLED_UNVERIFIED, gate = FAIL.  
> Never PASS.

---

## 1. SBOM State

### 1.1 Format and Location

| Property | Value |
|----------|-------|
| Format | CycloneDX 1.5 |
| Location | `sbom/sbom-cyclonedx.json` |
| Component count | 103 |
| Metadata timestamp | 2026-03-30T04:14:32Z |
| Generator | `scripts/sbom/generate-sbom.sh` |
| SPDX format | **ABSENT** |

### 1.2 SPDX Exportability

**Classification**: NOT_APPLICABLE (CycloneDX only)

The problem statement mandates SBOM exportability in **SPDX format**. The repo currently produces CycloneDX 1.5 only. No SPDX JSON or SPDX tag-value file was found. CycloneDX and SPDX are distinct formats; CycloneDX does not satisfy an SPDX requirement.

**Requirement gap**: SPDX SBOM generation not implemented.

### 1.3 CycloneDX SBOM Assessment

| Item | State | Notes |
|------|-------|-------|
| SBOM file present | YES | `sbom/sbom-cyclonedx.json` |
| SBOM SHA-256 checksum | YES | `sbom/sbom-cyclonedx.json.sha256` |
| SBOM PGP signature | YES | `sbom/sbom-cyclonedx.json.sig` |
| Component count | 103 | Mix of npm and Cargo components |
| Generation script | YES | `scripts/sbom/generate-sbom.sh` |
| Automated generation in CI | NOT CONFIRMED | No workflow step found that calls generate-sbom.sh |
| Committed to repo | YES | `sbom/` directory at repo root |
| SBOM version matches package.json | PARTIAL | Header shows `28.88.0`, package.json currently `29.0.0` |

**SBOM freshness gap**: The committed SBOM was generated at `2026-03-30T04:14:32Z` with version `28.88.0`. Current `package.json` version is `29.0.0`. The SBOM is stale relative to the current codebase version — it does not reflect the current dependency set.

**Automated generation gap**: No CI workflow step invokes `scripts/sbom/generate-sbom.sh`. The SBOM is manually generated and committed. This is not reproducible/automated SBOM generation.

### 1.4 SBOM Coverage

The generation script (`generate-sbom.sh`) collects:
- npm components via `npm ls --all --json` (top-level only, not transitive — see `--no-deps` equivalent)
- Cargo components via `cargo metadata --format-version 1 --no-deps`

**Gap**: `--no-deps` on cargo metadata means **transitive Cargo dependencies are not in the SBOM**. Only direct Cargo crates are listed. This understates the Rust supply-chain surface.

---

## 2. Attestation State

### 2.1 Artifact Attestation

**Classification**: ENABLED_UNVERIFIED

| Item | State | Notes |
|------|-------|-------|
| PGP signature on SBOM | EXISTS | `sbom/sbom-cyclonedx.json.sig` |
| GitHub Artifact Attestation (sigstore) | NOT FOUND | No `actions/attest-build-provenance` in any active workflow |
| In-toto attestation | NOT FOUND | No `.intoto.jsonl` or attestation bundle found |
| SLSA provenance via `slsa-github-generator` | NOT FOUND | No SLSA provenance generator in any workflow |
| Cosign signatures | NOT FOUND | No `cosign sign` step found |

**PGP signature detail**:
- `sbom/sbom-cyclonedx.json.sig` contains a PGP signature block.
- PGP key identity: `iQIzBAABCgAdFiEEpSwi+hUbCT3Kk/IXwFZPUDMHKYI...`
- No public key published in the repository (no `docs/GPG_KEY.asc`, no keyserver URL).
- No verification instructions documented.
- No CI step that verifies this signature.

**Verification evidence**: ABSENT  
No evidence that any process (CI or manual) verifies the PGP signature against a trusted public key. The signature exists as a file artifact but has no verification proof chain.

### 2.2 GitHub Actions Artifact Attestation

GitHub's `actions/attest-build-provenance` (GA since 2024) generates sigstore-backed provenance attestations for workflow artifacts. This is **not used** in any active workflow in this repository.

Release artifacts (AppImage, .deb, .msi, .dmg) produced by `release-unified.yml` are not attested.

### 2.3 Attestation Verdict

Per attestation rule:
- Attestation (PGP) exists: YES
- Verification evidence: ABSENT
- **State**: ENABLED_UNVERIFIED
- **Gate G_ATTESTATION_VERIFIED**: FAIL

---

## 3. SBOM Classification Summary

| Aspect | Classification |
|--------|---------------|
| SBOM exists (CycloneDX) | PARTIAL (stale, no CI automation, transitive Cargo missing) |
| SBOM in SPDX format | NOT_APPLICABLE (absent) |
| SBOM SHA256 checksum | ENABLED_UNVERIFIED |
| PGP signature on SBOM | ENABLED_UNVERIFIED |
| Sigstore/in-toto attestation | NOT_APPLICABLE (absent) |
| GitHub Artifact Attestation | NOT_APPLICABLE (absent) |
| Attestation verification | FAIL |

---

## 4. Required Actions

1. **Add SPDX SBOM generation** — update `generate-sbom.sh` to also emit SPDX 2.3 JSON format, or use `@cyclonedx/cyclonedx-npm` which supports SPDX export.
2. **Automate SBOM generation in CI** — add a step in `release-unified.yml` that runs `generate-sbom.sh` and uploads the SBOM as an artifact.
3. **Fix transitive Cargo coverage** — remove `--no-deps` from `cargo metadata` call or use `cargo cyclonedx` which includes the full dependency tree.
4. **Publish PGP key** or migrate to sigstore/cosign for SBOM signing.
5. **Add `actions/attest-build-provenance`** to `release-unified.yml` for GitHub-native provenance attestation on release artifacts.
6. **Add verification step** — either verify the PGP sig in CI using a documented public key, or verify sigstore attestations with `cosign verify-attestation`.
7. **Keep SBOM in sync with package.json version** — the current SBOM is at `28.88.0` while the repo is at `29.0.0`.
