# 18 NEXT ACTIONS

## Immediate — PROD BUILD GATE

Provide token: GO_FOR_PROD_BUILD\_\_TITANE_INFINITY
All technical gates are now satisfied.

## Short-term — SUPPLY CHAIN

1. Add @tauri-apps/plugin-updater to tauri.conf.json
2. Configure release signing (sigstore or keyring)
3. Add SBOM generation: cargo install cargo-cyclonedx
4. Add provenance attestation to .github/workflows/release-unified.yml

## Node version governance

Node 22 must be used for all builds.
Add `.nvmrc` with `22` to enforce:
echo "22" > .nvmrc

## Build environment documentation

Update README.md / docs/CONTRIBUTING.md:
"Requires Node >=22 (nvm use 22) for building"

## Stale artifact cleanup (optional)

rm dist-28.0.0.tar.gz
rm src-tauri/target/release/bundle/deb/TITANE-Infinity_28.0.0_amd64.deb
(Not blocking — just housekeeping)
