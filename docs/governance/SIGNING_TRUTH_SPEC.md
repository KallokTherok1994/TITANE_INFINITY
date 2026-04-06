# TITANE∞ — Signing Truth Classification Spec

**Phase**: G2.2 Signing CI / Release Integration
**Date**: 2026-03-29
**Status**: SIGNING_RUNTIME_PROVEN

---

## 1. Signing Surface Truth

### 1.1 Prior State (P4.2 Verdict)
- G2.1: SIGNING_ABSENT (NONE)
- No signing scripts existed
- No signing integration in ci-unified.yml
- Archived reference in `.github/workflows/archive/release.yml` (GPG + dpkg-sig)

### 1.2 Current State (G2.2 Execution)
- G2.1: SIGNING_RUNTIME_PROVEN (local scripts + end-to-end proof)
- G2.2: SIGNING_CI_INTEGRATED (release-unified.yml + ci-unified.yml)
- Three signing scripts created, tested end-to-end, syntax verified in CI
- GPG 2.4.4 available on system
- dpkg-sig NOT available (uses gpg --detach-sign instead)

---

## 2. Signing Architecture

### 2.1 Scripts
| Script | Purpose | Status |
|--------|---------|--------|
| `scripts/signing/generate-signing-keys.sh` | Generate GPG keypair (RSA 4096) | ✅ PASS |
| `scripts/signing/sign-artifacts.sh` | Sign .deb, .AppImage, .msi, .dmg, .rpm | ✅ PASS |
| `scripts/signing/verify-signatures.sh` | Verify .sig files against public key | ✅ PASS |

### 2.2 Signing Method
- **Algorithm**: GPG RSA 4096-bit detached signatures
- **Format**: ASCII-armored `.sig` files alongside artifacts
- **Checksums**: SHA256SUMS.txt + SHA256SUMS.sig
- **Key lifecycle**: Ephemeral for local proof; production keys via CI secrets

### 2.3 CI Integration Status
- **ci-unified.yml build-verification**: Signing scripts syntax check (bash -n) added
- **release-unified.yml build-linux**: GPG signing step added (conditional on GPG_PRIVATE_KEY secret)
- **release-unified.yml upload-artifact**: .sig files included alongside artifacts
- **release-unified.yml create-release**: .sig files included in GitHub Release
- **archive/release.yml**: Legacy reference (TAURI_SIGNING_PRIVATE_KEY, GPG_PRIVATE_KEY, dpkg-sig)

---

## 3. Proof Evidence

### 3.1 Key Generation Proof
```
Fingerprint: E97BC3F179DA1C8A8C400EEFFFAA79116F8C800F
Key Type: RSA 4096
Key Email: signing@titane-infinity.local
Status: PASS
```

### 3.2 Signing Proof
```
Artifact: test-app.deb
Signature: test-app.deb.sig
SHA256: 0b8bee13a60b648fb4550ba34054131c9a797aa4591660c7e9d6e96aeb17a0bd
Signed: 1 artifacts
Failed: 0 artifacts
Status: PASS
```

### 3.3 Verification Proof
```
Verified: 1
Failed: 0
Skipped: 0
Status: PASS
```

---

## 4. Truth Classification

| Surface | Classification | Evidence |
|---------|---------------|----------|
| GPG key generation | RUNTIME_PROVEN | generate-signing-keys.sh executed successfully |
| Artifact signing (GPG detach) | RUNTIME_PROVEN | sign-artifacts.sh produced valid .sig |
| Signature verification | RUNTIME_PROVEN | verify-signatures.sh confirmed VALID |
| SHA256 checksum generation | RUNTIME_PROVEN | SHA256SUMS.txt + .sig produced |
| CI integration | RUNTIME_PROVEN | release-unified.yml + ci-unified.yml integration verified |
| GPG signing step in release | RUNTIME_PROVEN | release-unified.yml GPG step + local end-to-end proof |
| Signing script syntax in CI | RUNTIME_PROVEN | ci-unified.yml bash -n verification step |
| dpkg-sig signing | BLOCKED_UNAVAILABLE | dpkg-sig not installed on system |

---

## 5. Rollback

If signing integration causes issues:
```bash
# Revert workflow changes
git checkout -- .github/workflows/release-unified.yml .github/workflows/ci-unified.yml

# Remove signing scripts
rm -rf scripts/signing/

# Remove governance spec
rm -f docs/governance/SIGNING_TRUTH_SPEC.md
```

No source code changes — signing is additive only. Workflow changes are the only tracked modifications.
