# PRODUCTION RELEASE v28.35.0

**Date:** 2026-03-21 | **Status:** SEALED

## Gates
| Gate | Result |
|------|--------|
| tsc --noEmit | PASS |
| vitest run | 3399/3399 PASS |
| cargo test --lib | 4463/4463 PASS |
| cargo tauri build | exit 0 — 3 bundles |
| verify-native-binary-freshness | PASS |
| verify_instructions | PASS=20 FAIL=0 |
| detect_recurrence | G_AH_RECURRENCE_GUARD_PASS entries=525 |

## Artifacts
| File | SHA256 |
|------|--------|
| TITANE-Infinity_28.35.0_amd64.AppImage | 0baa83c39435631b27adc1613d75a873ba747b5f694e4c16c75eb1c87735fe37 |
| TITANE-Infinity_28.35.0_amd64.deb | fa0b37216990712ee7527d5b7d8295c3745de9660b02b4ff7e71787821232219 |
| TITANE-Infinity-28.35.0-1.x86_64.rpm | 0dc4a7a0ca1d4918d2b8a89b26b08b52f1a065c9da02d561728cef36c38e638c |

## Verdict
**STABLE → SEALED**
