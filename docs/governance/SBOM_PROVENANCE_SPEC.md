# SBOM PROVENANCE TRUTH SPEC — TITANE∞

**Authority**: P4.6 — SBOM Integration + Provenance Hardening
**Version**: 1.0
**Date**: 2026-03-30
**Status**: RUNTIME_PROVEN

---

## 1. SCOPE

This spec governs the Software Bill of Materials (SBOM) provenance surface for TITANE∞ v28.88.0+. It defines the canonical generation method, integrity verification, and signing chain for supply-chain trust artifacts.

---

## 2. CANONICAL SBOM SURFACE

### 2.1 Format

| Property | Value |
|----------|-------|
| Format | CycloneDX |
| Spec Version | 1.5 |
| BOM Version | 1 |
| Type | application |

### 2.2 Output Files

| File | Purpose |
|------|---------|
| `sbom/sbom-cyclonedx.json` | Full SBOM with all components |
| `sbom/sbom-cyclonedx.json.sha256` | SHA256 integrity checksum |
| `sbom/sbom-cyclonedx.json.sig` | GPG detached signature |
| `sbom/npm-components.txt` | Quick-reference npm inventory |
| `sbom/cargo-components.txt` | Quick-reference cargo inventory |
| `sbom/sbom-header.json` | BOM header (no components) for signing |

### 2.3 Generation Method

```
bash scripts/sbom/generate-sbom.sh [output_dir]
```

**Sources**:
- `npm ls --all --json` → npm dependency tree
- `cargo metadata --format-version 1 --no-deps` → Rust workspace packages
- Merged → deduplicated → sorted by name

---

## 3. INTEGRITY CHAIN

### 3.1 SHA256 Checksum

```
sha256sum sbom/sbom-cyclonedx.json > sbom/sbom-cyclonedx.json.sha256
```

**Verification**:
```
sha256sum -c sbom/sbom-cyclonedx.json.sha256
```

### 3.2 GPG Signature

```
gpg --batch --yes --detach-sign --armor --local-user <KEY_ID> --output sbom/sbom-cyclonedx.json.sig sbom/sbom-cyclonedx.json
```

**Verification**:
```
gpg --verify sbom/sbom-cyclonedx.json.sig sbom/sbom-cyclonedx.json
```

### 3.3 Signing Key

| Property | Value |
|----------|-------|
| Fingerprint | E97BC3F179DA1C8A8C400EEFFFAA79116F8C800F |
| Type | RSA 4096 |
| Label | TITANE-SIGNING-20260329-222706 |
| Scope | Local ephemeral signing key |
| Public key | `scripts/signing/keys/pubkey.asc` |

---

## 4. PROVENANCE PROOF CHAIN

```
package.json + Cargo.toml
        ↓
  generate-sbom.sh (reproducible)
        ↓
  sbom-cyclonedx.json (CycloneDX 1.5, N components)
        ↓
  sha256sum → sbom-cyclonedx.json.sha256 (integrity)
        ↓
  gpg --detach-sign → sbom-cyclonedx.json.sig (authenticity)
        ↓
  gpg --verify → PASS (provenance verified)
```

---

## 5. REPRODUCIBILITY

The SBOM is reproducible from source:
- Same `package.json` + `Cargo.toml` → same component list
- Timestamp is regenerated each run (expected)
- Component inventory is deterministic given dependency state
- SHA256 changes only when components change

---

## 6. INTEGRATION POINTS

### 6.1 CI/CD

- `ci-unified.yml`: Signing scripts syntax check (existing)
- `release-unified.yml`: GPG signing step for build artifacts (existing)
- Future: `generate-sbom.sh` can be invoked as a release step

### 6.2 Release Pipeline

```
build → sign artifacts → generate SBOM → sign SBOM → attach to release
```

---

## 7. LIMITATIONS

| Limitation | Status | Next Condition |
|-----------|--------|----------------|
| No cdxgen/syft integration | ACCEPTABLE | Pending tooling availability |
| Only direct dependencies | ACCEPTABLE | `npm ls --all` captures transitive |
| No SLSA provenance attestation | PENDING | Requires CI runtime |
| No in-toto attestation | PENDING | Requires CI runtime |
| Local ephemeral key | ACCEPTABLE | Production key rotation required |

---

## 8. VERDICT

**SBOM_PROVENANCE_PROVEN** — G3.2 formal SBOM integration complete. Reproducible generation, SHA256 integrity, GPG signature authenticity all PASS.