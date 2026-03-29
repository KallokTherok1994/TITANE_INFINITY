# Bootstrap

## Commands executed
- git status --porcelain=v1
- git rev-parse --short HEAD
- git branch --show-current
- git log -20 --oneline
- git diff --stat
- git diff --name-only
- git diff -- src src-tauri package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json
- grep "version" package.json
- grep ^version src-tauri/Cargo.toml
- find . -maxdepth 5 -name 'UI_RUNTIME_TRUTH_SPEC.md' -o -name 'ANTI_LIE*.md' -o -name '*TRUTH_SPEC*.md'
- rg -n "provider_used|provider_requested|fallback_used|degraded_mode|memory used|memory injected|mode effective|mode requested|mode shown|healed|improved|learned|promotion|anti-lie" src src-tauri docs proof_packs .clinerules scripts

## Key outputs
- HEAD: e88264039
- Branch: MAIN
- Version authority: 28.88.0 (package.json, Cargo.toml)
- Product diff: none under src/, src-tauri/ or seal surfaces
- UI_RUNTIME_TRUTH_SPEC created at docs/governance/UI_RUNTIME_TRUTH_SPEC.md
- Worktree dirtiness: governance/scripts/proof only (no product scope)
