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
- head -10 README.md
- head -10 docs/README.md
- grep -m3 '^## [' CHANGELOG.md
- find . -maxdepth 5 -name 'RELEASE_*_SEALED.txt'
- find . -maxdepth 5 -name 'RELEASE_ARTIFACTS_CHECKSUMS_*'
- find . -maxdepth 5 -name 'AUTHORITY_MATRIX.md' -o -name 'AUTHORITY_MATRIX*.md'
- rg -n "authority|source of truth|canon|canonical|single source|anti-lie|provider_used|memory used|mode affiché|mode réellement" docs proof_packs .clinerules scripts README.md docs/README.md

## Key outputs
- HEAD: e88264039
- Branch: MAIN
- Version authority: 28.88.0 (package.json, Cargo.toml)
- Product diff: none under src/, src-tauri/, package.json, Cargo.toml, tauri.conf.json
- README/docs status: v28.88.0 surfaces present
- Release seal present: RELEASE_v28.88.0_SEALED.txt
- AUTHORITY_MATRIX present: docs/governance/AUTHORITY_MATRIX.md
- Worktree dirtiness: governance/scripts/proof only (no product scope)

## Notable modified tracked files (non-product)
- .clinerules/05-truth-surface.md
- docs/AUDIT_CHAT_IA_ORCHESTRATEUR_2026-03-26.md
- scripts/* (autoheal, benchmark, e2e, install, publish, setup, test-all)

## Notable untracked (non-product)
- docs/governance/AUTHORITY_MATRIX.md
- proof_packs/* (multiple)
- docs/governance/* additional canon docs
