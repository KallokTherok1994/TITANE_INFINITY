# TITANE∞ v30.1.4 — Release Notes

## Version
- **Version:** 30.1.4
- **Date:** 2026-04-12
- **Build type:** Production stable
- **Status:** SEALED

## Artifacts

| Platform | Artifact | Size | SHA256 |
|----------|----------|------|--------|
| Linux (AppImage) | `Titan-Stable_30.1.4_amd64.AppImage` | 89M | `131af88c6975b9e6dea521841b14137ba8e80a383251ece020ec197ea2ddc162` |
| Linux (DEB) | `Titan-Stable_30.1.4_amd64.deb` | 20M | `76b1e31a1961b60664cb1c146187c8267045953e0eab3c9236ef0cf9a8b72db5` |
| Linux (binary) | `titane-infinity` | 44M | `d023481925e5b06638a8b969de50ccbbce14f2cd663d64882f78d67405f5fab7` |
| Android (APK) | `app-universal-release-unsigned.apk` | 67M | `7ab60661e2c0bcf03f5b873a0aee3826bec490fb7d82babbf434118cc8eeaf96` |
| Android (AAB) | `app-universal-release.aab` | 41M | `4694b9f76d9f0a8ca503eee2b6b804fcac054165db49c1274b798e69c48e7f71` |
| Windows | — | — | SKIPPED (no Windows cross-compile on Linux) |

## Changes depuis v30.1.3

### Correctifs TypeScript (0 erreurs, 14 corrigées)
- **ErrorBoundary.tsx**: Correction expression JSX `&&` avec `error: unknown` (TS2322) — `{error && (` → `{error != null && (`
- **responsePolicy.ts**: Ajout du champ optionnel `secondaryIntent` dans l'interface `IntentClassification` (TS2339)
- **CognitiveObservabilityEngine.ts**: Cast explicite `(decision.type as string)` pour comparaisons de type union (TS2367)
- **GovernanceConnector.ts**: Protection `noUncheckedIndexedAccess` sur `scored[0]` (TS2532)
- **selfHealingAnalyzer.ts**: Gardes nullabilité sur `primary`/`secondary` matchedRules (TS18048)

### Infrastructure
- Version bump: 30.1.3 → 30.1.4 (package.json, Cargo.toml, toutes configs tauri)
- DEB system install: `titan-stable 30.1.4` (`Status: install ok installed`)
- Desktop launchers mis à jour via `scripts/update-desktop-icon.sh`
- AutoHeal: règle `AH-2026-04-12-TYPESCRIPT-REGRESSIONS-157` enregistrée

## Gates

| Check | Status |
|-------|--------|
| `tsc --noEmit` (TypeScript) | ✅ 0 erreurs |
| `detect_recurrence.sh` | ✅ PASS |
| `verify_instructions.sh` | ✅ 23/23 PASS, FAIL=0 |
| Desktop build (cargo) | ✅ EXIT:0 |
| Android build (gradle) | ✅ EXIT:0 |
| DEB system install | ✅ `install ok installed` |
| AppImage artifact | ✅ 89M |
| Windows cross-build | ⏭️ SKIPPED |

## Rollback
```bash
# Desktop
sudo dpkg -r titan-stable
sudo dpkg -i deployment/latest/TITANE-Infinity_28.90.0_amd64.deb  # previous

# Android
# Re-signer et installer l'APK v30.0.0 depuis deployment/android/
```

## AutoHeal entry
`AH-2026-04-12-TYPESCRIPT-REGRESSIONS-157` — TypeScript strict mode regressions in 5 source files, fixed with minimal guards and interface extension.
