# 08 SUPPLY CHAIN MAP

## Updater plugin

tauri.conf.json plugins: ["http", "shell"] — NO updater plugin
G_UPDATER_READY=FAIL (pre-existing gap)

## Signing

No signing config in tauri.conf.json or workflow.
G_SIGNING_READY=FAIL (pre-existing gap)

## Workflow support

release-unified.yml: runs `pnpm exec tauri build` — no signing, no attestation step.
G_PROVENANCE_READY=UNVERIFIED

## SBOM

No CycloneDX/SPDX generation configured.
G_SBOM_READY=FAIL (pre-existing gap)

## Assessment

SUPPLY_CHAIN_UNPROVEN — all gaps are pre-existing, not introduced this session.
Artifacts are produced and checksummed but not signed or attested.
This is acceptable for local distribution; blocks formal release chain.
