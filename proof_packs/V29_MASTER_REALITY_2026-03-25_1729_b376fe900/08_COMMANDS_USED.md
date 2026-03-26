# 08_COMMANDS_USED

## Bootstrap

```bash
pwd
whoami
uname -a
git status --short --branch
git rev-parse --short HEAD
git log -20 --oneline
git branch --show-current
git tag --sort=-creatordate | head -20 || true
node -v || true
pnpm -v || true
rustc -V || true
cargo -V || true
cargo tauri -V || pnpm tauri -V || true
git lfs version || true
```

## Audit version / claims

```bash
sed -n '1,60p' package.json
sed -n '1,80p' src-tauri/Cargo.toml
sed -n '1,80p' src-tauri/tauri.conf.json
sed -n '1,80p' runtime/stable/tauri.conf.json
rg -n '"version"|v29\.0|v29\.' package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json runtime/stable/tauri.conf.json README.md CHANGELOG.md src/pages/DevPage.tsx src/features/evolution/EvolutionTimeline.tsx src/features/transformation/TransformationRoadmap.tsx RELEASE_v28.88.0_SEALED.txt
find proof_packs/MOCK_AUDIT_FINAL_2026-03-25_1140 -maxdepth 2 -type f | sort
sed -n '1,220p' proof_packs/MOCK_AUDIT_FINAL_2026-03-25_1140/00_EXEC_SUMMARY.md
sed -n '1,240p' orchestration/roadmap.yaml
sed -n '1,240p' orchestration/roadmap-data.yaml
```

## Audit lock `http_request`

```bash
rg -n "http_commands|mod http_commands|pub mod http_commands" src-tauri/src/commands src-tauri/src/main.rs
sed -n '1,220p' src-tauri/src/commands/mod.rs
sed -n '1,220p' src-tauri/src/commands/http_commands.rs
sed -n '260,380p' src-tauri/src/main.rs
rg -n "http_request" src-tauri/src/main.rs src-tauri/src/commands/security.rs src-tauri/src/commands/http_commands.rs src-tauri/src/commands/total_dev_commands.rs
git diff -- src-tauri/src/main.rs src-tauri/tauri.conf.json runtime/stable/tauri.conf.json
```

## Re-certification

```bash
pnpm run verify:instructions
bash scripts/verify/verify_instruction_layers.sh
bash scripts/verify/verify_no_doctrine_duplication.sh
pnpm run check
pnpm run verify:tauri-configs
pnpm run verify:command-whitelist-sync
cargo check --manifest-path src-tauri/Cargo.toml
sed -n '800,830p' src/pages/DevPage.tsx
sed -n '610,635p' CHANGELOG.md
sed -n '680,705p' README.md
sed -n '832,922p' README.md
rg -n 'Phase actuelle|Current Phase|TITANE∞ v28\.88\.0' README.md src/pages/DevPage.tsx package.json src-tauri/Cargo.toml
pnpm run check
cargo check --manifest-path src-tauri/Cargo.toml
sed -n '1,260p' proof_packs/MOCK_AUDIT_FINAL_2026-03-25_1140/00_EXEC_SUMMARY.md
sed -n '1,220p' .github/workflows/release-unified.yml
sed -n '220,380p' .github/workflows/release-unified.yml
sed -n '1,240p' .github/workflows/ci-unified.yml
sed -n '240,420p' .github/workflows/ci-unified.yml
pnpm exec prettier --check .github/workflows/release-unified.yml
```
