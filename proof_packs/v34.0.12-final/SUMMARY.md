=== BUILD ALL v34.0.12 SUMMARY ===
- Version: 34.0.12 (bump 34.0.11 → 34.0.12 Rule 13)
- Date: 2026-05-13
- Mode: DURABLE
- Audit: TSC 0, ESLint 0, Prettier ALL CLEAN, Vitest 9247/9247, Rust 806/806, Clippy 13 warnings (Rule 1 preserved)
- Artifacts: 3 bundles (deb/rpm/AppImage) + raw binary in deployment/latest/
- AppImage smoke: PID 1965856 ALIVE 20s, BOOT:READY, audio SUCCESS, 0 fatal
- System install: BLOCKED_APPROVAL (sudo cache expired, user offline)
- Rollback: sudo dpkg -i deployment/archive/v34.0.11/*.deb; git revert <commit>
