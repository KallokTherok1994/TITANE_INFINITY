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
- find . -maxdepth 5 -name 'MEMORY_SEAL_SPEC.md' -o -name '*MEMORY*PROOF*.md' -o -name '*memory*seal*'
- rg -n "write|persist|recall|inject|consume|memory used|memory consumed|memory injected|conversation memory|retrieval|unified_memory" src src-tauri docs proof_packs .clinerules scripts

## Key outputs
- HEAD: e88264039
- Branch: MAIN
- Version authority: 28.88.0 (package.json, Cargo.toml)
- Product diff: none under src/, src-tauri/ or seal surfaces
- MEMORY_SEAL_SPEC created at docs/governance/MEMORY_SEAL_SPEC.md
- Worktree dirtiness: governance/scripts/proof only (no product scope)
