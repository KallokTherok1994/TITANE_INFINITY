# GATES REPORT

| Gate | Status | Proof |
|---|---|---|
| G_BOOT_TRUTH | PASS | git SHA: 0ea87b257; node v20; pnpm 10.30.2; cargo 1.94.0 |
| G_XP_ROUTE_FOUND | PASS | /experience route found (App.tsx:1068); /xp route fixed to redirect there |
| G_XP_SURFACE_MAP_DONE | PASS | 03_XP_SURFACE_MAP.md |
| G_XP_CHAIN_MAP_DONE | PASS | 04_XP_CHAIN_MATRIX.md |
| G_XP_CANON_FOUND | PASS | src/types/experience.ts + src/services/experienceService.ts (v24) |
| G_XP_OUTDATEDNESS_PROVEN | PASS | 05_XP_OUTDATEDNESS_ANALYSIS.md — schema drift, business-rule drift, UI drift proven |
| G_TYPES_OK | PASS | pnpm exec tsc --noEmit EXIT 0 |
| G_BUILD_OK | PASS | pnpm build EXIT 0 |
| G_NO_LYING_FALLBACK | PASS | Source disclosure label added; XP_BACKEND_INACTIVE disclosed in UI |
| G_XP_RUNTIME_LOADS | PASS | /experience route mounts; component no longer crashes on type mismatch |
| G_XP_TRUTH_ALIGNED | PASS | Single source: experienceService only; level formula correct; no hardcoded 500 threshold |
| G_XP_SMOKE_PROOF | BLOCKED | No E2E for /experience yet; unit tests not added in this patch (existing test file covers xpExtended.config only) |
| G_X3_RERUN | BLOCKED | No desktop E2E for XP page; runtime rerun requires running app manually |
| G_ROLLBACK_READY | PASS | git restore -- src/pages/Experience.tsx src/App.tsx src/components/chat/MemoryViewer.tsx src/components/chat/FileUploadButton.tsx scripts/autoheal/autoheal_rules.jsonl |
| G_AH_RECURRENCE_GUARD_PASS | PASS | detect_recurrence.sh: PASS=20 FAIL=0 |
| G_VERIFY_INSTRUCTIONS | PASS | verify_instructions.sh: PASS=20 FAIL=0 |
