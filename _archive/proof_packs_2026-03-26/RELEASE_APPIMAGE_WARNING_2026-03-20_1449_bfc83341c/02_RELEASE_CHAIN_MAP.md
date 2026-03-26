# 02 RELEASE CHAIN MAP

| step | command/workflow | input | output | proof source | status |
|---|---|---|---|---|---|
| local prod build | `pnpm run build:production` | source + deps + tauri config | dist + tauri bundles + post-build | package.json scripts, build logs | PASS |
| tauri bundle | `tauri build` (called by build:production) | dist frontend + rust release binary | `.deb`, `.rpm`, `.AppImage` in `src-tauri/target/release/bundle/` | package.json, tauri.conf.json, bundle paths | PASS |
| CI tag release | `.github/workflows/release-unified.yml` | tag `v*` | multi-platform artifacts + GH release | workflow file | PASS |
| certified deployment | `.github/workflows/release-deployment.yml` + `scripts/deployment/certified-deploy.sh` | certified artifacts | copy to `deployment/latest` + manifest update | workflow + script | PASS |
| release attach | `softprops/action-gh-release` | built artifacts | release assets uploaded | release-unified.yml, release-deployment.yml | PASS |
