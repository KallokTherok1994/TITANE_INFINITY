# 08 SUPPLY CHAIN MAP

## Updater config
tauri.conf.json plugins: only "http" + "shell" — NO "updater" plugin
G_UPDATER_READY=FAIL

## Signing path
No signing configuration found in tauri.conf.json
G_SIGNING_READY=FAIL

## Provenance/attestation
No .github/workflows/release.yml attestation step found
G_PROVENANCE_READY=UNVERIFIED

## SBOM
No CycloneDX/SPDX generation configured
G_SBOM_READY=FAIL

## Assessment
These gaps are PRE-EXISTING — not introduced by session fixes.
Do not fake readiness. Classify as SUPPLY_CHAIN_UNPROVEN.

## Safe next steps (out of scope for this session)
- Add @tauri-apps/plugin-updater to tauri.conf.json plugins
- Configure artifact signing (sigstore or keyring)
- Add cargo-cyclonedx to release workflow
- Add GitHub SLSA provenance action
