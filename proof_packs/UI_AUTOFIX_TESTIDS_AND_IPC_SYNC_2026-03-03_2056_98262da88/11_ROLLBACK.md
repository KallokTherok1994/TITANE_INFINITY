# ROLLBACK (non destructif)

## Revenir à l'état Git précédent (modifs locales de cette mission)
- Inspecter:
  - `git status --porcelain=v1`
- Revert des fichiers de mission uniquement:
  - `git restore -- src/components/layout/TopNav.tsx src/pages/TitanePage.tsx src/components/sections/ConversationSection.tsx src/features/chat/ChatProviderSelector.tsx src/features/admin/AdminPage.tsx src/components/config/ConfigFieldEditable.tsx src/pages/ConfigurationHub.tsx src/features/audio-center/AudioCenterPage.tsx src/pages/DevPage.tsx src/pages/TimePage.tsx src/pages/Stats.tsx scripts/verify/verify-command-whitelist-sync.sh scripts/verify/allowlist-exceptions.txt e2e/desktop/ui-connectivity-critical.wdio.test.js scripts/e2e/run-desktop-suite.js scripts/run_e2e_tauri.sh package.json`

## Revert des artefacts de preuve de cette mission
- `rm -rf proof_packs/UI_AUTOFIX_TESTIDS_AND_IPC_SYNC_*`

## Vérification post-rollback
- `pnpm run -s lint`
- `pnpm run -s check`
- `pnpm run -s test:architecture`
