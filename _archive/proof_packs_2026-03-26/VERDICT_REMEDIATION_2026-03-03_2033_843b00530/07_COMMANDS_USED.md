# COMMANDS USED

- `git status --porcelain=v1`
- `git rev-parse --short HEAD`
- `git log -20 --oneline`
- `git branch --all | grep -F 'copilot/audit-repository-contents' || true`
- `git cat-file -t 7eb4096f`
- `pnpm prettier --check "src/pages/ConfigurationHub.tsx"`
- `pnpm prettier --write "src/pages/ConfigurationHub.tsx"`
- `pnpm prettier --check "."`
- `scripts/e2e/run_e2e_tauri.sh 1 <proof_pack_dir>`
- `scripts/e2e/run_e2e_tauri.sh 3 <proof_pack_dir>`
- `git show --name-only --oneline --no-color -1`
- `git diff -- src/pages/ConfigurationHub.tsx`
