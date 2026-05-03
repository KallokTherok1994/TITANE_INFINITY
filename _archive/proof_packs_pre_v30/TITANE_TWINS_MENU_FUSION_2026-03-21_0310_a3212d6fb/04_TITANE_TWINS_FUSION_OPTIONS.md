# 04_TITANE_TWINS_FUSION_OPTIONS

## Option A — TITANE > TWINS submenu (separate route, nav child)
- UX clarity: Medium — TopNavItem has no children/parent hierarchy support; would require component changes
- Routing cost: Medium — new route structure (/titane/twins or nav metadata change)
- Code risk: Medium — requires TopNav.tsx modification or new nav layer
- Chat truth impact: None (route change doesn't break localStorage pipeline)
- Desktop test impact: Moderate
- Rollback ease: Medium
- **REJECTED** — requires more files, TopNav doesn't support children

## Option B — TITANE > Symbiose tab (absorb into TitanePage) ✅ CHOSEN
- UX clarity: HIGH — one TITANE page, 9 tabs, Symbiose clearly part of TITANE
- Routing cost: Minimal — just redirect /twins → /titane
- Code risk: LOW — 2 files, additive change (new tab), no IPC/service change
- Chat truth impact: None — localStorage → envelope chain unchanged
- Desktop test impact: Minimal — tab is reachable in same page
- Rollback ease: HIGH — `git restore -- src/pages/TitanePage.tsx src/App.tsx`
- **RECOMMENDED + CHOSEN**

## Option C — TITANE cockpit fusion (split TWINS features across TITANE surfaces)
- UX clarity: Low — fragments Twin ontology into multiple sections
- Routing cost: High — identity→identity section, progression→progression, etc.
- Code risk: HIGH — breaks TwinEvolutionPanel cohesion
- Chat truth impact: Risk of partial state write
- Desktop test impact: High
- Rollback ease: LOW
- **REJECTED** — violates I4 (no broad refactor), fragments truth

## Decision Rule Applied
Smallest architecture that:
- ✅ reduces navigation fragmentation (TWINS out of overflow)
- ✅ keeps runtime truth intact (TwinEvolutionPanel unchanged)
- ✅ preserves chat integration proofs (localStorage chain unchanged)
- ✅ minimizes route breakage (/twins → /titane redirect)
- ✅ easiest to certify and rollback (2-file patch)

**→ OPTION B selected.**
