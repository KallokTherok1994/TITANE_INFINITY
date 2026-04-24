# 11 GATES REPORT

| Gate                         | Status     | Notes                                   |
| ---------------------------- | ---------- | --------------------------------------- |
| G_BOOTSTRAP_TRUTH            | PASS       | NVM Node 22 active                      |
| G_BASELINE_REVERIFY          | PASS       | All 5 chains intact                     |
| G_NODE_ENGINE_READY          | PASS       | v22.22.1 >= 20.0.0                      |
| G_PNPM_INSTALL_READY         | PASS       | 1.1s, EXIT 0                            |
| G_PNPM_BUILD                 | PASS       | 3483 modules, EXIT 0                    |
| G_VERSION_TRUTH              | PASS       | All 4 files at 28.5.0                   |
| G_CARGO_CHECK_X3             | PASS       | 3× EXIT 0                               |
| G_CAPABILITY_COVERAGE_GUARD  | PASS       | 0 new dead entries                      |
| G_COMMAND_WHITELIST_SYNC     | PASS       | 0 gaps                                  |
| G_VERIFY_INSTRUCTIONS        | PASS       | PASS=20 FAIL=0                          |
| G_DETECT_RECURRENCE          | PASS       | 489 entries, no new recurrence          |
| G_NATIVE_BUILD_AUTHORITY     | PASS       | 3 bundles, 9m04s, EXIT 0                |
| G_RELEASE_ARTIFACTS_READY    | PASS       | AppImage+deb+rpm at 28.5.0              |
| G_CHECKSUMS_READY            | PASS       | sha256sum -c 4/4 OK                     |
| G_UPDATER_READY              | FAIL       | No updater plugin (pre-existing)        |
| G_SIGNING_READY              | FAIL       | No signing config (pre-existing)        |
| G_SBOM_READY                 | FAIL       | No SBOM tooling (pre-existing)          |
| G_PROVENANCE_READY           | UNVERIFIED | No workflow attestation step            |
| G_RELEASE_VERIFICATION_READY | PASS       | Checksums + artifact filenames verified |
| G_ROLLBACK_READY             | PASS       | git restore documented                  |
| G_PROD_TOKEN_BUILD           | FAIL       | Token not provided in this session      |
| G_PROD_TOKEN_DEPLOY          | FAIL       | Token not provided in this session      |
