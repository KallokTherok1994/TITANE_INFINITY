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
- find . -maxdepth 5 -name 'AUTHORITY_MATRIX.md' -o -name 'SHELL_MINCE_DECISION.md' -o -name 'CORE_LABS_OPS*.md'
- rg -n "Core|Labs|Ops|historical|legacy|diagnostic|experimental|proof|governance|shell mince|authority" docs proof_packs src .clinerules scripts

## Key outputs
- HEAD: e88264039
- Branch: MAIN
- Version authority: 28.88.0 (package.json, Cargo.toml)
- Product diff: none under src/, src-tauri/ or seal surfaces
- Boundary doc: created at docs/governance/CORE_LABS_OPS_BOUNDARY.md
- Worktree dirtiness: governance/scripts/proof only (no product scope)
