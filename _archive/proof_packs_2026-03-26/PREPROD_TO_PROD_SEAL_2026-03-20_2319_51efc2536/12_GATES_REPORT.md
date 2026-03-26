# 12 GATES REPORT

| Gate                        | Status      | Notes |
|-----------------------------|-------------|-------|
| G_BOOTSTRAP_TRUTH           | PASS        | All tools found, DISPLAY:1 set |
| G_BASELINE_REVERIFY         | PASS        | All 5 prior chains intact |
| G_BUILD_ENV_READY           | FAIL        | Node v18 < required v20 |
| G_NODE_ENGINE_READY         | FAIL        | 18.19.1 < 20.0.0 |
| G_NATIVE_BUILD_AUTHORITY    | BLOCKED     | Depends on G_PNPM_BUILD |
| G_STALE_ARTIFACT_GUARD      | PASS        | dist-28.0.0.tar.gz classified stale |
| G_CAPABILITY_COVERAGE_GUARD | PASS        | 0 new dead entries; 16 known-dead baseline |
| G_CARGO_CHECK_X3            | PASS        | 3× EXIT 0 (session bb41032e4) |
| G_VERIFY_INSTRUCTIONS       | PASS        | PASS=20 FAIL=0 |
| G_DETECT_RECURRENCE         | PASS        | 488+ entries, no new recurrence |
| G_PNPM_BUILD                | FAIL        | crypto.hash not a function (Node v18) |
| G_TAURI_BUILD_RELEASE       | BLOCKED     | Depends on G_PNPM_BUILD |
| G_RELEASE_ARTIFACTS_READY   | BLOCKED     | No build artifacts |
| G_CHECKSUMS_READY           | BLOCKED     | No artifacts to checksum |
| G_UPDATER_READY             | FAIL        | No updater plugin in tauri.conf.json |
| G_SIGNING_READY             | FAIL        | No signing config |
| G_PROVENANCE_READY          | UNVERIFIED  | No workflow audit done |
| G_SBOM_READY                | FAIL        | No SBOM tooling configured |
| G_RELEASE_VERIFICATION_READY| BLOCKED     | No artifacts |
| G_ROLLBACK_READY            | PASS        | git restore commands documented |
| G_PROD_TOKEN_BUILD          | FAIL        | Token not provided |
| G_PROD_TOKEN_DEPLOY         | FAIL        | Token not provided |
