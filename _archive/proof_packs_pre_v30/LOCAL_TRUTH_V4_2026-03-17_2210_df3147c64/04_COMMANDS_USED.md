# 04 — COMMANDS USED

```bash
git status --short
git rev-parse --short HEAD
git branch --show-current
git log -20 --oneline
node -v
pnpm -v
rustc --version
cargo --version
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify/enforce-tauri-only.sh
bash scripts/verify/network-one-door.sh
bash scripts/verify/verify_instruction_layers.sh
bash scripts/verify/verify_no_doctrine_duplication.sh
bash scripts/verify/verify_status_vocabulary.sh
bash scripts/verify/verify_kernel_budget.sh
bash scripts/verify/verify_local_markers_consistency.sh
pnpm run check
pnpm run lint
pnpm run test --run
cargo check --manifest-path src-tauri/Cargo.toml
git commit -m "fix(governance): repair duplicate autoheal id ..."
```

## Notes
- `pnpm run test --run`: 221 files, 3242 tests PASS
- `cargo test`: terminal exit code observed = 0 in session context; not re-run for this documentation addendum
- No destructive git command executed
