# Commandes utilisees

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
```

```bash
rg -n "i18n|i18next|react-i18next|useTranslation|Intl\.|locale|locales|language|lang" src src-tauri docs package.json --glob '!docs/99_ARCHIVE/**' --glob '!docs/backup_*/**'
find src/i18n -maxdepth 2 -type f | sort
sed -n '1,260p' src/i18n/i18nLazyLoader.ts
sed -n '1,240p' src/apps/Settings/Settings.tsx
sed -n '1,220p' src/components/LanguageSwitcher.tsx
sed -n '1,240p' src/__tests__/apps/Settings/Settings.test.tsx
```

```bash
rg -n "Route .*docs|path=\"/docs|path=\"/help|Documentation|Docs|Help" src/App.tsx src/pages src/components src/apps --glob '!**/*.snap'
rg -n "proof_packs|STATIC_DOC|RUNTIME_BACKED|OUTDATED|PARTIAL|BLOCKED|interactive docs|documentation" src docs registry --glob '!docs/99_ARCHIVE/**' --glob '!docs/backup_*/**'
sed -n '1,260p' src/components/a11y/KeyboardShortcuts.tsx
sed -n '1,260p' src/pages/ResearchPage.tsx
```

```bash
sed -n '1,260p' src/pages/CloudCenter/index.tsx
sed -n '1,430p' src/pages/CloudCenter/SyncConfig.tsx
sed -n '1,520p' src/pages/CloudCenter/VaultStatus.tsx
sed -n '1,340p' src-tauri/src/cloud/commands.rs
sed -n '1,700p' src-tauri/src/cloud/cloud_sync_engine.rs
```

```bash
sed -n '1,220p' src/ui/pages/KnowledgeFusionPage.tsx
rg -n "KnowledgeFusionPage|Fusion des Connaissances|detectFileFormat|parseDocument" src/__tests__ src/tests
date '+%Y-%m-%d %H%M'
```

```bash
pnpm exec vitest run src/__tests__/apps/Settings/Settings.test.tsx
pnpm exec vitest run src/__tests__/pages/CloudSyncTruth.test.tsx
pnpm exec vitest run src/__tests__/pages/KnowledgeFusionTruth.test.tsx
pnpm run check
cargo check --manifest-path src-tauri/Cargo.toml
```
