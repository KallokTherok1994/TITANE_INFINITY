# Bootstrap

## Commands executed
- git status --porcelain=v1
- git rev-parse --short HEAD
- git branch --show-current
- git log -20 --oneline
- git diff --stat
- git diff --name-only
- git diff -- src/App.tsx src/main.tsx src/routes src/providers package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json
- grep "version" package.json
- grep ^version src-tauri/Cargo.toml
- find . -maxdepth 5 -name 'AUTHORITY_MATRIX.md' -o -name 'SHELL_MINCE_DECISION.md'
- rg -n "App.tsx|shell mince|shell thin|shell real|point d’entrée clair|provider affiché|provider utilisé|mode affiché|mode réellement" docs proof_packs src .clinerules

## Key outputs
- HEAD: e88264039
- Branch: MAIN
- Version authority: 28.88.0 (package.json, Cargo.toml)
- Product diff: none under App.tsx/main.tsx/routes/providers or seal surfaces
- SHELL_MINCE_DECISION: created at docs/governance/SHELL_MINCE_DECISION.md
- Worktree dirtiness: governance/scripts/proof only (no product scope)
