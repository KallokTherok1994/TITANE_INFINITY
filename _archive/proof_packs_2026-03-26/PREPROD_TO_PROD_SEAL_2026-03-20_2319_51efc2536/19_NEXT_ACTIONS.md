# 19 NEXT ACTIONS

## Immediate (≤30 min) — BUILD UNBLOCK:
1. Install Node >=22: `nvm install 22 && nvm use 22`
2. Run: `pnpm install && pnpm build`
3. Verify G_PNPM_BUILD=PASS
4. Update tauri.conf.json version to 28.5.0
5. Run: `pnpm exec tauri build --release`
6. Generate checksums: `sha256sum src-tauri/target/release/bundle/**/*`

## Near-term — SUPPLY CHAIN:
7. Add @tauri-apps/plugin-updater to tauri.conf.json
8. Configure release signing
9. Add SBOM generation to CI workflow
10. Add provenance attestation to release workflow

## Technical debt:
11. Clean 16 pre-existing dead capability entries from self_heal.json + singularity.json
    (dedicated cleanup session — not a blocker for current features)
12. Commit/classify unstaged App.tsx + TitanePage.tsx (other agent's work)

## Tokens required for prod:
- GO_FOR_PROD_BUILD__TITANE_INFINITY  (to authorize build)
- GO_FOR_PROD_DEPLOY__TITANE_INFINITY (to authorize deploy)
