# 06_SUPPLY_CHAIN_TRUTH

## Verdict: SUPPLY_CHAIN_PARTIAL

### Checksums
- Linux: sha256sum deb/*.deb appimage/*.AppImage > SHA256SUMS.txt || true
  → Generated in CI for Linux bundles. NON-BLOCKING (|| true).
- Windows: Get-FileHash *.msi > SHA256SUMS.txt (continue-on-error: true)
  → NON-BLOCKING — can silently omit.
- macOS: shasum -a 256 *.dmg > SHA256SUMS.txt || true
  → NON-BLOCKING.
- Local: No automatic checksum generation in local build scripts.

### Signatures
- Tauri updater signing: TAURI_SIGNING_PRIVATE_KEY / TAURI_SIGNING_PRIVATE_KEY_PASSWORD
  → Passed via GitHub secrets in CI. NOT available in local build.
  → Updater active: true in tauri.conf.json → release binary without signing key = updater disabled or fallback.
  → Signing key secrets existence in GitHub repo: UNKNOWN (not verifiable locally).
- No codesigning for Linux (not standard).
- macOS: APPLE_CERTIFICATE / APPLE_SIGNING_IDENTITY passed in CI → standard notarization path.
- Windows: TAURI_SIGNING_PRIVATE_KEY only (no Windows codesign cert secrets found).

### SBOM
NONE — no cargo-sbom, no syft, no cyclonedx, no SPDX step anywhere in any workflow.

### Provenance
NONE — no SLSA, no sigstore, no GitHub artifact attestations.

### Updater manifest
- tauri.conf.json: updater.active = true (via plugins.updater at runtime)
  → pubkey not found in tauri.conf.json (may be in separate config or env).
  → Updater endpoints: not visible in tauri.conf.json (may be runtime config).

### Supply chain classification breakdown
| Item | Status |
|------|--------|
| Linux checksums | PARTIAL (non-blocking in CI) |
| Windows checksums | PARTIAL (continue-on-error) |
| macOS checksums | PARTIAL (|| true) |
| Tauri updater signing | PARTIAL (requires CI secrets; local = unsigned) |
| SBOM | ABSENT |
| Provenance/SLSA | ABSENT |
| macOS notarization | PRESENT IN CI (secrets required) |

## Final classification: SUPPLY_CHAIN_PARTIAL
Reason: checksums present but non-blocking; no SBOM; no provenance; signing requires CI secrets unavailable locally.
