# WINDOW_ZOOM_FINITE_GUARD_2026-04-18

- Date: 2026-04-18
- Scope: `src-tauri/src/commands/window_controls_commands.rs`
- Symptom: `window_set_zoom` acceptait encore des niveaux de zoom non finis (`NaN`, `+/-Infinity`), ce qui pouvait stocker ou emettre une echelle CSS invalide.
- Root cause: la surface appliquait seulement `clamp(0.5, 5.0)` sans verifier que la valeur flottante etait finie avant stockage runtime.
- Fix: ajout de `sanitize_zoom_level` pour rabattre les valeurs non finies sur `1.0`, puis reutilisation du helper avant stockage et emission `zoom-change`.
- Proof commands:
  - `cargo test --manifest-path src-tauri/Cargo.toml commands::window_controls_commands::tests::test_sanitize_zoom_level_rejects_nan -- --exact`
  - `cargo test --manifest-path src-tauri/Cargo.toml commands::window_controls_commands::tests::test_sanitize_zoom_level_rejects_infinity -- --exact`
  - `bash scripts/autoheal/detect_recurrence.sh`
  - `bash scripts/verify_instructions.sh`
- Proof results:
  - `commands::window_controls_commands::tests::test_sanitize_zoom_level_rejects_nan`: PASS
  - `commands::window_controls_commands::tests::test_sanitize_zoom_level_rejects_infinity`: PASS
  - `bash scripts/autoheal/detect_recurrence.sh`: PASS
  - `bash scripts/verify_instructions.sh`: PASS
- Verdict: PASS