# Patches Applied This Session

## Commit d15e2a692 (fix(preprod-gate): v28.6.0 doc sync + native freshness dist-input fix)
1. scripts/e2e/native-binary-policy.cjs: removed dist_index + dist_assets_newest from buildInputs; added v28.5.0 + v28.6.0 AppImage candidates
2. README.md: updated to v28.6.0 authority
3. CHANGELOG.md: added [28.6.0] entry
4. titane-infinity.desktop: committed v28.5.0→v28.6.0 AppImage path bump
5. scripts/autoheal/autoheal_rules.jsonl: AH-2026-03-21-NATIVE-FRESHNESS-DIST-INPUT

## Commit 2f9461f90 (fix(rust-test): version assertion uses CARGO_PKG_VERSION)
1. src-tauri/src/control_panel_commands/tests.rs: env!("CARGO_PKG_VERSION") replaces "28.5.0"
2. scripts/autoheal/autoheal_rules.jsonl: AH-2026-03-21-RUST-VERSION-HARDCODED

## Rollback
git revert 2f9461f90 d15e2a692 --no-edit
