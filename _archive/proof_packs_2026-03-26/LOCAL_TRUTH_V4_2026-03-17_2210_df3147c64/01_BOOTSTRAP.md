# 01 — BOOTSTRAP

## A. REPO_TRUTH
- Branch: MAIN
- HEAD: df3147c64
- Clean: 1 modified file (scripts/autoheal/autoheal_rules.jsonl — the fix)
- Last commit: `df3147c64 proof(V10): seal AUDIO_VOICE_PROFILE_SYNC_V10 — desktop E2E online+offline PASS`
- log -5: V10 AUDIO seal, PR #182 docs canon merge, FIX-016b CPU/secure, FIX-016 REAL classification, SEAL-MASTER

## B. TOOLCHAIN_TRUTH
- node: v24.0.0
- pnpm: 10.30.2
- rustc: 1.94.0 (4a4ef493e 2026-03-02)
- cargo: 1.94.0 (85eff7c80 2026-01-15)

## C. STRUCTURE_TRUTH
```
PRESENT: .github/copilot-instructions.md
PRESENT: .github/instructions (5 instruction files)
PRESENT: .github/prompts
ABSENT:  AGENTS.md (root) — local AGENTS.md exist in src/, src-tauri/, e2e/, docs/, scripts/
ABSENT:  CLAUDE.md
PRESENT: src/
PRESENT: src-tauri/
PRESENT: tests/
PRESENT: e2e/
PRESENT: docs/
PRESENT: registry/
PRESENT: proof_packs/
PRESENT: scripts/
PRESENT: memory/
PRESENT: runtime/
PRESENT: logs/
PRESENT: config/
ABSENT:  validators/ (no top-level validators dir — scripts/verify/ covers this)
```

## D. VERSION TRUTH
- package.json: titane-infinity 28.0.0
- src-tauri/tauri.conf.json: 28.0.0
- README.md: v28.0.0 (aligned)
- CHANGELOG.md: [28.0.0] - 2026-03-14 (aligned)
- STATUS: VERSION_CONSISTENT ✓
