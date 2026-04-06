# 03_REPO_TRUTH_MAP

- Branch authority: MAIN
- Version authority: 28.5.0 from package.json + Cargo.toml + tauri.conf.json
- Native harness authority:
  - wdio.desktop.conf.cjs
  - scripts/e2e/run-desktop-suite.js
  - scripts/e2e/tauri-wrapper.sh
  - scripts/e2e/native-binary-policy.cjs
- Validator authority:
  - scripts/verify/verify-native-binary-freshness.sh
  - scripts/autoheal/detect_recurrence.sh
  - scripts/verify_instructions.sh
- Proof authority:
  - reports/e2e-desktop/preprod-final-audit/run-1..3
  - proof_packs/PREPROD_FINAL_AUDIT_2026-03-21_0308_a3212d6fb

Current dirty truth:

- staged + unstaged files exist from ongoing sessions; no unrelated revert done.
- preprod decision based on executable proof, not clean-tree cosmetic state.
