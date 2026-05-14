# Rollback

If this governed v31.2.7 build-release-network lot must be reverted:

1. Restore tracked surfaces:

   `git restore -- src/components/sections/ConversationSection.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl RELEASE_SURFACE_INVENTORY.md deployment/latest/MANIFEST.json deployment/latest/SHA256SUMS.txt deployment/latest/SIZES.txt reports/TITANE_BUILD_RELEASE_NETWORK_31.2.7_2026-04-27.md proof_packs/TITANE_BUILD_RELEASE_NETWORK_31.2.7_2026-04-27/GATE_REPORT.md proof_packs/TITANE_BUILD_RELEASE_NETWORK_31.2.7_2026-04-27/VERDICT.md proof_packs/TITANE_BUILD_RELEASE_NETWORK_31.2.7_2026-04-27/ROLLBACK.md`

2. Remove the published local artifacts if they should no longer represent `deployment/latest`:

   `rm -f deployment/latest/Titan-Stable_31.2.7_amd64.AppImage deployment/latest/Titan-Stable_31.2.7_amd64.deb deployment/latest/titane-infinity`

3. Rebuild and republish the intended canonical version before claiming any newer release truth.