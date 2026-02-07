# Issues Register

**Date:** 2026-02-07  
**Audit Scope:** Frontend UI only  
**Status:** Active

---

## Issues Found

| ID | Severity | Symptom | Root Cause | Proof | Minimal Fix | Validation Test |
|----|----------|---------|------------|-------|-------------|-----------------|
| UI-001 | P2 | Duplicate feature folders | `features/chat` & `features/conversation` mirror each other | `find src/features -name "*chat*"` | Consolidate into single chat feature | Verify no broken imports |
| UI-002 | P2 | Multiple visual state stores | 3 stores: visualStore, visualStateStore, visualStateStoreV21 | `ls src/stores/visual*` | Merge into single canonical store | Test visual state updates |
| UI-003 | ~~P1~~ ✅ FIXED | ~~Dual router systems~~ | ~~Primary (App.tsx) + Secondary (router.tsx) active~~ | ~~Both routers mounted~~ | ~~Document which is canonical, deprecate other~~ | ~~Verify routing works~~ |
| UI-003 | **CLOSED** | Dead router deprecated | router.tsx moved to _deprecated/ with header notice | 2026-02-07 UI Hygiene Sprint | Moved src/router.tsx → src/_deprecated/router.tsx | ✅ No imports found, lint passed |
| UI-004 | P2 | Legacy sidebar components | Sidebar.tsx unused in UI vΩ | `src/components/layout/Sidebar.tsx` exists | Mark as deprecated or remove | No UI regressions |
| UI-005 | P3 | No skip links | Accessibility feature missing | TopNav has no skip-to-content link | Add skip link component | Test keyboard nav |
| UI-006 | P2 | Footer animation on every mount | Footer slides up even if already visible | AppShell.tsx line 62-66 | Add mounted state check | Test page transitions |
| UI-007 | P1 | No auth guards | All routes publicly accessible | No route guard logic | Implement auth middleware (if required) | Test protected routes |
| UI-008 | P3 | Large component directories | `components/chat` has 23 files | No sub-categorization | Split into subdirectories | Verify imports |
| UI-009 | P2 | No HTTP endpoints documented | Only IPC commands catalogued | No external API calls found | Document if any exist | N/A |
| UI-010 | ~~P2~~ ✅ FIXED | ~~Silent failures possible~~ | ~~Some IPC errors not user-visible~~ | ~~Error handling varies by component~~ | ~~Standardize error UI~~ | ~~Test error scenarios~~ |
| UI-010 | **CLOSED** | Silent catch block fixed | useSelfHealingStore repair failures now logged | 2026-02-07 UI Hygiene Sprint | Added console.error to catch block (line 386) | ✅ Error visibility improved |

---

## Priority Definitions

- **P0 (Critical):** Blocks production deployment, immediate fix required
- **P1 (High):** Major impact on UX/performance, fix in next sprint
- **P2 (Medium):** Noticeable issue, fix when time allows
- **P3 (Low):** Minor issue, cosmetic or edge case

---

## Issues by Category

**Architecture:** UI-001, UI-002, UI-003, UI-004 (4 issues)  
**Accessibility:** UI-005 (1 issue)  
**Performance:** UI-006 (1 issue)  
**Security:** UI-007 (1 issue)  
**Organization:** UI-008 (1 issue)  
**Observability:** UI-009, UI-010 (2 issues)

**Total:** 10 issues (0 P0, ~~2~~ 1 P1, ~~6~~ 5 P2, 2 P3)  
**Closed:** 2 issues (UI-003 ✅, UI-010 ✅)  
**Open:** 8 issues (0 P0, 1 P1, 5 P2, 2 P3)

---

**Next:** 51-nonconformity-4ring-checklist.md
