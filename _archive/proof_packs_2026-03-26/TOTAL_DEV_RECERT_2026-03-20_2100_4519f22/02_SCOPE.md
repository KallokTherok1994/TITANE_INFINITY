# 02_SCOPE

Recertify TOTAL_DEV v28.1.0 against 14 CLAIMS + constitution invariants.

Commits under review:
- 7e2464e5c: feat(total-dev)
- 58b21b592: chore(autoheal)
- 2182d0226: fix(security) plaintext comment

Files:
- src-tauri/src/commands/total_dev_commands.rs (393 lines)
- src/pages/TotalDevPage.tsx (1030 lines)
- src/pages/TotalDevPage.css (885 lines)
- src/App.tsx (route + nav)
- src-tauri/src/main.rs (6 handlers)
- e2e/total-dev-smoke.spec.ts (170 lines, not run)

Toolchain: node v24, pnpm 10.30.2, cargo 1.94.0, rustc 1.94.0
