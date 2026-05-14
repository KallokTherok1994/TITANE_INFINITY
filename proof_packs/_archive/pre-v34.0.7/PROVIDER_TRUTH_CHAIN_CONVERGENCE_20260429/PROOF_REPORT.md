# PROVIDER_TRUTH_CHAIN — Proof Pack

**Date**: 2026-04-29
**Scope**: `src/services/ai/orchestrator.ts`, `src/services/ai/chatEngine.ts`
**Verdict**: PASS

## Provider Truth Chain (requested → selected → executed → shown)

```
User request
  └─► chatEngine.generate() / chatEngine.stream()
        └─► canonicalDiscernmentKernel.discern()       ← SOLE authority
              └─► canonicalDecision.provider.name      ← e.g. "ollama"
                    └─► orchestratorConfig.preferredProvider
                          └─► orchestrator.generate()
                                └─► selectFinalProvider()
                                      ├─ if preferredProvider !== 'auto' → return preferredProvider (FINAL)
                                      ├─ cognitiveKernel = SIGNAL ONLY (never override)
                                      └─ scoring system fallback
```

## Fixes Applied

### 1. `orchestrator.generate()` — Guard already correct (no change needed)
- `selectFinalProvider()` at line ~1156: `if (preferredProvider && preferredProvider !== 'auto') return preferredProvider;`
- cognitiveKernel result logged as advisory only
- Comment added: `// vPROVIDER_TRUTH: canonicalDiscernmentKernel is the SOLE authority`

### 2. `chatEngine.stream()` — Gap FIXED (passthrough added)
- `streamCanonicalDecision` at line 2735: kernel runs in stream path
- `streamProviderPreference` at line 2816: kernel decision passed to `aiOrchestrator.stream()`
- `aiOrchestrator.stream(validatedMessage, enrichedHistory, streamProviderPreference)` at line 2822

### 3. Duplicate exports in `desktopPerception.ts` — FIXED
- Removed 5 duplicate function exports (pauseDesktopSession, resumeDesktopSession, handoffDesktopSession, killDesktopSession, getDesktopControlStatus)

### 4. KB count drift J2 — FIXED
- 249 files total, -4 Kevin-excluded = 245
- `DEFAULT_KB_CANONICAL_ENTRY_COUNT`: dynamically computed (245)
- Test updated: 243 → 245

### 5. TypeScript errors — FIXED
- `canonicalDiscernmentKernel.ts:312`: `const inferenceState` → `let inferenceState`
- `jobOperator.ts:31`: fallback `{ job_id: '' }` → `{ job: null }` (matches `JobCreateResult` interface)

### 6. Floating point fix — FIXED
- `synestheticEmotionEngine.test.ts:228`: `>= wonder.cognitive.focus - 1e-6` (epsilon tolerance)

## Test Evidence

| Test | Status |
|------|--------|
| chatEngineCanonicalIntegration.test.ts | 17/17 PASS |
| behavioralRouterIntegration.test.ts | 3/3 PASS |
| desktopPerception.test.ts | 7/7 PASS |
| omega-singularity-unified-sync.test.ts | PASS (J2=245) |
| synestheticEmotionEngine.test.ts | 21/21 PASS |

### New test added
- `PROVIDER_TRUTH_CHAIN: orchestrator.generate() with explicit preferredProvider is never overridden by cognitiveKernel`

## TypeScript Gate
- `pnpm run check` → 0 errors PASS

## Rollback Plan
```bash
git revert HEAD  # Single commit scope-limited to PROVIDER_TRUTH_CHAIN
```
