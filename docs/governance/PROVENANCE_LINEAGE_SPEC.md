# PROVENANCE LINEAGE SPEC — TITANE∞

**Authority**: G3.3 — Provenance Source Discovery + Lineage Map
**Version**: 1.0
**Date**: 2026-03-30
**Status**: SBOM_PROVENANCE_PROVEN

---

## 1. SCOPE

This spec governs the provenance lineage surface for TITANE∞ v28.88.0+. It maps the complete supply-chain trust chain from source to release and classifies each hop's truth level.

---

## 2. PROVENANCE LINEAGE CHAIN

```
package.json + Cargo.toml (v28.88.0)
        ↓
  build scripts (scripts/build/*.sh)
        ↓
  ci-unified.yml (build-verification job)
        ↓
  generate-release-checksums.sh
        ↓
  RELEASE_ARTIFACTS_CHECKSUMS.txt + SHA256SUMS.txt
        ↓
  sign-artifacts.sh (GPG RSA 4096)
        ↓
  .sig files + SHA256SUMS.sig
        ↓
  generate-sbom.sh (CycloneDX 1.5)
        ↓
  sbom-cyclonedx.json + .sha256 + .sig
        ↓
  release-unified.yml (GPG signing step)
        ↓
  GitHub Release with .sig files
```

---

## 3. HOP CLASSIFICATION

| Hop | Source | Sink | Status | Classification |
|-----|--------|------|--------|---------------|
| BUILD | package.json + Cargo.toml | build scripts + ci-unified.yml | PROVEN | Scripts exist, CI integrated |
| CHECKSUM | generate-release-checksums.sh | SHA256SUMS.txt + SHA256SUMS.sig | PROVEN | Artifacts present, CI integrated |
| SIGN | sign-artifacts.sh | .sig files | PROVEN | GPG end-to-end PASS, CI integrated |
| SBOM | generate-sbom.sh | sbom-cyclonedx.json + .sha256 + .sig | PROVEN | Reproducible, SHA256 PASS, GPG PASS |
| RELEASE | release-unified.yml | GitHub Release | PARTIAL | CI integrated, runtime unproven |

---

## 4. SOURCE INVENTORY

### 4.1 Build Surface
| Asset | Path | Status |
|-------|------|--------|
| package.json | ./package.json | PRESENT (v28.88.0) |
| Cargo.toml | src-tauri/Cargo.toml | PRESENT (v28.88.0) |
| ci-unified.yml | .github/workflows/ci-unified.yml | PRESENT |
| build scripts | scripts/build/*.sh | PRESENT |

### 4.2 Checksum Surface
| Asset | Path | Status |
|-------|------|--------|
| generate-release-checksums.sh | scripts/generate-release-checksums.sh | PRESENT |
| RELEASE_ARTIFACTS_CHECKSUMS.txt | ./RELEASE_ARTIFACTS_CHECKSUMS.txt | PRESENT |
| SHA256SUMS.txt | (generated at release time) | PRESENT |

### 4.3 Signing Surface
| Asset | Path | Status |
|-------|------|--------|
| generate-signing-keys.sh | scripts/signing/generate-signing-keys.sh | PRESENT |
| sign-artifacts.sh | scripts/signing/sign-artifacts.sh | PRESENT |
| verify-signatures.sh | scripts/signing/verify-signatures.sh | PRESENT |
| GPG private key | scripts/signing/keys/privkey.asc | PRESENT |
| GPG public key | scripts/signing/keys/pubkey.asc | PRESENT |
| GPG fingerprint | scripts/signing/keys/fingerprint.txt | PRESENT (E97BC3F1...) |
| ci-unified.yml signing check | .github/workflows/ci-unified.yml | PRESENT |
| release-unified.yml signing step | .github/workflows/release-unified.yml | PRESENT |

### 4.4 SBOM Surface
| Asset | Path | Status |
|-------|------|--------|
| generate-sbom.sh | scripts/sbom/generate-sbom.sh | PRESENT |
| sbom-cyclonedx.json | sbom/sbom-cyclonedx.json | PRESENT (103 components) |
| sbom-cyclonedx.json.sha256 | sbom/sbom-cyclonedx.json.sha256 | PRESENT (PASS) |
| sbom-cyclonedx.json.sig | sbom/sbom-cyclonedx.json.sig | PRESENT (GPG PASS) |
| SBOM_PROVENANCE_SPEC.md | docs/governance/SBOM_PROVENANCE_SPEC.md | PRESENT |

### 4.5 Release Surface
| Asset | Path | Status |
|-------|------|--------|
| release-unified.yml | .github/workflows/release-unified.yml | PRESENT |
| RELEASE_v28.88.0_SEALED.txt | ./RELEASE_v28.88.0_SEALED.txt | PRESENT |
| deployment/ | ./deployment/ | PRESENT |

---

## 5. VERIFICATION COMMANDS

### 5.1 Verify SBOM integrity
```bash
sha256sum -c sbom/sbom-cyclonedx.json.sha256
```

### 5.2 Verify SBOM signature
```bash
GNUPGHOME=scripts/signing/keys/.gnupg gpg --verify sbom/sbom-cyclonedx.json.sig sbom/sbom-cyclonedx.json
```

### 5.3 Verify SBOM reproducibility
```bash
bash scripts/sbom/generate-sbom.sh /tmp/sbom-verify
diff sbom/sbom-cyclonedx.json /tmp/sbom-verify/sbom-cyclonedx.json | head -5
```

---

## 6. LIMITATIONS

| Limitation | Status | Next Condition |
|-----------|--------|----------------|
| No cdxgen/syft integration | ACCEPTABLE | Pending tooling availability |
| Local ephemeral signing key | ACCEPTABLE | Production key rotation required |
| No SLSA provenance attestation | PENDING | Requires CI runtime |
| No in-toto attestation | PENDING | Requires CI runtime |
| Release CI runtime unproven | HOLD_EXTERNAL | Requires hosted GitHub Actions |

---

## 7. NEXT CONDITIONS

For G3.4 (Artifact Hash / Lineage Alignment):
1. Verify filename/hash/signature/SBOM alignment across artifacts
2. Confirm no contradiction between generated trust artifacts and release surfaces

For G3.5 (Supply-Chain Trust Verdict / Family Seal):
1. Summarize exact supply-chain trust level
2. Classify: FOUNDATION_ONLY / PARTIAL_RUNTIME / SBOM_PROVENANCE_PROVEN / G3_SEALED / BLOCKED

---

## 8. VERDICT

**SBOM_PROVENANCE_PROVEN** — G3.3 provenance source discovery complete. All 5 hops inventoried and classified. 4/5 PROVEN locally, 1/5 PARTIAL (release CI runtime requires hosted GitHub Actions).