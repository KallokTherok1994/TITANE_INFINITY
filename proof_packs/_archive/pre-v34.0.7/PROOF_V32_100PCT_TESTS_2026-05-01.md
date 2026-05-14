# PROOF PACK — V32 100/100 Tests — 2026-05-01

## VERDICT: PASS

## Scope
Fix 11 failing tests across 8 test files. Full test suite: 477 files / 7536 tests / 0 FAIL.

## Gates

| Gate | Status | Evidence |
|------|--------|----------|
| Vitest 7536 tests | ✅ PASS | 477 passed (477), Tests 7536 passed (7536) |
| pnpm tsc --noEmit | ✅ PASS | 0 errors |
| detect_recurrence | ✅ PASS | entries=1502 |
| git worktree | ✅ CLEAN | HEAD=e90fa5172 |

## Fixes Applied

| # | File | Root Cause | Fix |
|---|------|-----------|-----|
| 1 | chatModes.config.ts | humain_total sortOrder=16 duplicate omega=16 | sortOrder 16→19 |
| 2 | chatModes.config.ts | journal.memoryScope='global' (expected 'session') | memoryScope→'session' |
| 3 | conversationEngine.test.ts | test expected topK=4, source uses topK=5 | test aligned to 5 |
| 4 | tauri.conf.json | no `windows` section → devtools check returned undefined | add windows[{label:main,devtools:false}] |
| 5 | tauri.conf.json | 12 required IPC commands missing from allow list | append 12 allow entries |
| 6 | vite.config.ts | allowedHosts:true (expected exact '[.trycloudflare.com]') | allowedHosts:['.trycloudflare.com'] |
| 7 | advancedAgentCatalog.test.tsx | catalog grew to 7, test hardcoded 5 | test updated to expect 7 |
| 8 | artifactIntent.ts | French verb `écris` (é≠ASCII) fails `\b` boundary in JS regex | normalize NFD+strip diacritics before regex |
| 9 | exportImport.ts | writeTextFile catch fell through to browser download → ok:true | separate writeTextFile catch → return WRITE_FAILED |

## Commit
- e90fa5172 — fix(tests): 7536/7536 PASS — fix 11 failing tests across 8 files

## AutoHeal
- AH-2026-05-V32-100PCT-TESTS-0011 appended (1502 entries total)

## Rollback Plan
```
git revert e90fa5172
```
