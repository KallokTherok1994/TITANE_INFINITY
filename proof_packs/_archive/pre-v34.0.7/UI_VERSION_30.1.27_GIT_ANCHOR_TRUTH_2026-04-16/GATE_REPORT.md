# GATE REPORT — UI VERSION 30.1.27 GIT ANCHOR TRUTH

- STATUS: BLOCKED
- REQUIRED CHECKS:
  - PASS: `git log --oneline --all -- RELEASE_v30.1.27.md`
  - PASS: `git log --oneline --all -- RELEASE_ARTIFACTS_CHECKSUMS_30.1.27.txt`
  - PASS: `git show --stat --summary --oneline ec1fe5210 -- package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json runtime/stable/manifest.json RELEASE_v30.1.27.md RELEASE_ARTIFACTS_CHECKSUMS_30.1.27.txt`
  - PASS: version-surface readback from `ec1fe5210` proves `30.1.29`, not `30.1.27`
