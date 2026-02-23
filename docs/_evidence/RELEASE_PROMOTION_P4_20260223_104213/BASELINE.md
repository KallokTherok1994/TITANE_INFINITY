# P4 RELEASE PROMOTION — BASELINE

**Date**: 2026-02-23  
**Folder**: docs/_evidence/RELEASE_PROMOTION_P4_20260223_104213  
**Starting Status**: P3 PASS CERTIFIÉ (commit a0a42d0a)

## Objectif P4

Transform "Certification" → "Production-Ready" by:
1. ✅ Pre-checks clean (repo, env, tokens)
2. ⏳ Auto-fix last risks (CI, allowlist, env, API policy)
3. ⏳ Build reproducible x3 (proof stable)
4. ⏳ Seal + promote release (governance)
5. ⏳ Gates P4: G5-G9 all PASS ×3
6. ⏳ Verdict: PASS (GO PROD)

## Pre-Check Results

### Repository State
```
Clean: ✅ (1 pending commit DONE)
Branch: MAIN ✅
Last 3 commits:
- a0a42d0a docs(p3): add completion report (just now)
- 92af4d3e chore(chat): P3 certification - PASS CERTIFIÉ
- a67a90c7 chore(chat): P2 qualification - legacy deprecation + gates + proof pack
```

### Environment
- pnpm 10.28.2 ✅
- node v24.0.0 ✅
- cargo 1.81.0 ✅

### Infrastructure
- Gate scripts: g1-g4 present ✅
- Evidence folders: P1-P3 complete ✅
- Sealing scripts: **TO INVENTORY** ⏳

## Critical Unknowns

1. **CI/CD Orchestration**
   - GitHub Actions workflow location?
   - Build/test/release pipeline?
   - Tokens configured?

2. **Release Governance**
   - Sealing script location (lib_cert.sh, run-master-*)
   - Registry append-only mechanism?
   - Promotion workflow (staging → release → prod)?

3. **Build Reproducibility**
   - Current build commands
   - Determinism sources (env vars, timestamps, versions)
   - Existing reproducibility testing?

4. **Allowlist/API Policy**
   - Tauri allowlist strictness level
   - Frontend API endpoint restrictions
   - Provider endpoint hardcoding?

## Next Steps (P4 Phases)

P4.1: Inventory CI + sealing scripts  
P4.2: Implement gates G5-G9 + run-all.sh  
P4.3: Auto-fix minors (allowlist, FORCE_LOCAL_PROVIDER)  
P4.4: Build reproducible x3 + hashes  
P4.5: Seal + registry append-only  
P4.6: Gates x3 execution  
P4.7: Verdict P4 (PASS/FAIL/BLOCKED)  

---

**Timeline**: ~60-90 min expected  
**Tokens**: Production GO token required when ready  
**Status**: STARTING P4
