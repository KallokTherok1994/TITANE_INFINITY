# Bootstrap — v28.7.0 Governance + Stability

## State at session start

- HEAD: ac0b7ffc3 (MAIN, clean — SEALED_SENTINEL_CLEAR from v28.6.0)
- node: v20.20.0
- pnpm: 10.30.2
- package.json version: 28.6.0 (pre-bump)
- Cargo.toml version: 28.6.0 (pre-bump)
- tauri.conf.json version: 28.6.0 (pre-bump)
- vitest: PASS (3399/3399) — confirmed from prior session
- cargo test --lib: PASS (4463/4463) — confirmed from prior session

## Next-cycle debt items loaded

From `proof_packs/POST_SEALED_FREEZE_GUARD_2026-03-21_1527_2081cc719/03_FINAL_RESIDUAL_CLASSIFICATION.md`:

| Item | Classification |
|------|---------------|
| DesignCenter.truth-chain.test.tsx:88 flaky | SHOULD_FIX_NEXT_CYCLE |
| deployment/latest/ missing v28.6.0 AppImage | SHOULD_FIX_NEXT_CYCLE |
| docs/90_release/ missing PRODUCTION_RELEASE_v28.6.0.md | SHOULD_FIX_NEXT_CYCLE |
