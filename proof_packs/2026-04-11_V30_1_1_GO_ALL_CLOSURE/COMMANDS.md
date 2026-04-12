# COMMANDS

Executed for closure proof:

```bash
git rev-parse --abbrev-ref HEAD && git rev-parse HEAD && git rev-parse origin/MAIN
git status --short
pnpm run check
cargo test --manifest-path src-tauri/Cargo.toml --lib
pnpm run test:100
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
rm -f runtime/stable/Titan-Stable_30.0.0_amd64.AppImage runtime/stable/Titan-Stable_30.0.0_amd64.deb runtime/stable/TITANE-Infinity_30.0.0_amd64.deb
sha256sum runtime/stable/Titan-Stable_30.1.1_amd64.AppImage runtime/stable/Titan-Stable_30.1.1_amd64.deb
stat -c '%n %s bytes' runtime/stable/Titan-Stable_30.1.1_amd64.AppImage runtime/stable/Titan-Stable_30.1.1_amd64.deb
```
