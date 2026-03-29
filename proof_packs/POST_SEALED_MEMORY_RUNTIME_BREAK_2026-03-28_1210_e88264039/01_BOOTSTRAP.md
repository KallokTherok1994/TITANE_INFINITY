# Bootstrap

- HEAD: e88264039
- Branch: MAIN
- Version: 28.88.0 (package.json + src-tauri/Cargo.toml)
- Product drift: none under src/, src-tauri/, package.json, Cargo.toml, tauri.conf.json
- Direct seal surfaces stable
- MEMORY_SEAL_SPEC present: docs/governance/MEMORY_SEAL_SPEC.md

Commands executed (abbrev):
- git status --porcelain=v1
- git rev-parse --short HEAD
- git branch --show-current
- git log -20 --oneline
- git diff --stat
- git diff --name-only
- git diff -- src src-tauri package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json
- grep "version" package.json
- grep ^version src-tauri/Cargo.toml
- find memory seal artifacts
- rg memory chain keywords
