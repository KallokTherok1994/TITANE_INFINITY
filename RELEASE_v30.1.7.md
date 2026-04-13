# TITANE∞ v30.1.7 — Release Notes

## Version
- **Version:** 30.1.7
- **Date:** 2025-04-13
- **Build type:** Production stable
- **Status:** SEALED

## Artifacts

| Platform | Artifact | Size | SHA256 |
|----------|----------|------|--------|
| Linux (AppImage) | `TITANE-Infinity_30.1.7_amd64.AppImage` | 95M | `d9e10549fb1d6853cdbf60f846f57e10d33d55b5959a146a6166530057f6bc6a` |
| Linux (DEB) | `TITANE-Infinity_30.1.7_amd64.deb` | 26M | `6624179eb8fa0880ae0f74faf35b4d42cddd5683e73cb3fd6d5ef9d3b1d2d0d9` |
| Linux (RPM) | `TITANE-Infinity-30.1.7-1.x86_64.rpm` | 26M | `cbc4379317ff4ca871517c30839cf5a165320608ef6492fe62c6796b762dc2e8` |
| Android (APK) | TBD (build in progress) | TBD | TBD |
| Windows | — | — | SKIPPED |

## Changes depuis v30.1.6

### Correctifs TypeScript + Tests
- **chunkingService.ts**: splitLongText(), fallback hard-split, merge headings bloqué
- **chatEngineCanonicalIntegration.test.ts**: température 0.7 alignée
- **chatEngine.commands.test.ts**: clamp 8096 → 16384
- **tauriDevtoolsConfig.test.ts**: toBe(false) (politique prod)

### Infrastructure Rust
- **rag_commands.rs**: Isolation env var OLLAMA_BASE_URL après appel async (prevent contamination)
- Autoheal entries 930-940 : full schema rollback fields patched

### Version
- Bump: 30.1.6 → 30.1.7
- Fichiers sync: package.json, Cargo.toml, tauri.conf.json (x2), tauri.base.json (x2), manifest.json

## Gates
- test:100 EXIT:0 (307 fichiers, 4139 tests)
- cargo test: 4689/4689 PASS
- autoheal detect_recurrence: PASS
- verify_instructions: PASS 23/23

## Verdict
SEALED
