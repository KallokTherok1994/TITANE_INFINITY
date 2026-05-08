# Cognitive Authority Map

> **Version**: v33.1.0 — CognitiveRuntimeTrace  
> **Date**: 2026-05-08  
> **Status**: LIVE — authority map aligned with runtime

---

## Runtime authorities

| Surface | File | Role |
|---|---|---|
| **CanonicalDiscernmentKernel** | `src/services/ai/canonicalDiscernmentKernel.ts` | Single decision point per chat turn. Decides mode, profile, memory, provider, inference state, truth status, confidence, complexity. Returns `CanonicalDecision`. All 8 decisions in one pass. |
| **ChatEngine OMEGA** | `src/services/ai/chatEngine.ts` | Pipeline orchestrator. Consumes `CanonicalDecision`, calls all guards, generates via IPC, builds final response with `omegaMetadata`. Now includes `cognitiveTrace` per turn. |

---

## Supporting signals

| Surface | File | Role |
|---|---|---|
| **ResponsePolicy** | `src/services/ai/responsePolicy.ts` | Profile definitions (DIRECT→OMEGA), intent classification, complexity estimation, inference state evaluation. Pure utility, consumed by kernel. |
| **OmegaModeClassifier** | `src/services/ai/omegaModeClassifier.ts` | Pure function (<1ms), maps message signals to CanonicalMode, BackendConversationMode, effortLevel. Consumed by kernel. |
| **MemoryIntegration** | `src/services/ai/memoryIntegration.ts` | Bridge to Memory Core (STM/LTM/hybrid). Loads context, saves preferences. Kernel's `memoryInjection` is the authority. |
| **WebResearchService** | `src/services/webResearchService.ts` | One Door compliant web search. Tauri mode: IPC→Rust→SearXNG. Browser mode: Vite proxy fallback. |

---

## Post-generation guards

| Surface | File | Role |
|---|---|---|
| **ReflectiveVerifier** | `src/services/ai/reflectiveVerifier.ts` | Self-RAG pattern. Detects factual claims, does optional web verification, returns `ReflectiveCritique` (confidence, verified, webSources, corrections). Non-blocking 4s timeout. |
| **QualityVerifier** | `src/services/ai/qualityVerifier.ts` | Heuristic-only (no LLM call, <5ms). Evaluates alignment, completeness, depth match. Returns `QualityCritique` (scores 0–1, shouldEnhance, enhancementHint). |

---

## Observability surfaces

| Surface | File | Role |
|---|---|---|
| **CognitiveRuntimeTrace v1** | `src/services/ai/cognitiveRuntimeTrace.ts` | **NEW (v33.1.0)**. Pure, serializable truth object per chat turn. Collects canonical, memory, generation, web, reflection, quality signals. Resolves PASS/QUALIFIED/UNCERTAIN/BLOCKED/FAIL verdict. Exposed via `omegaMetadata.cognitiveTrace`. |
| **ThinkingPanel** | `src/features/chat/ThinkingPanel.tsx` | UI component. Already receives `qualityScore`, `responseQualityScore`, `reasoningSummary`, `modelUsed`, `actionsPerformed`. Can be extended to render `cognitiveTrace.final.verdict` when available. |

---

## Experimental / duplicate-risk surfaces

| Surface | File | Risk |
|---|---|---|
| **BehavioralRouter** | `src/services/ai/behavioralRouter.ts` | Runs inside kernel — not an independent authority. Risk of drift if called outside kernel. |
| **CognitiveKernel** | `src/services/ai/cognitiveKernel.ts` | Parallel enrichment path. Risk of contradicting CanonicalDiscernmentKernel if used as decision authority. |

---

## Dead or unwired surfaces

| Surface | File | Status |
|---|---|---|
| **MetaCognitionEngine** | `src-tauri/src/meta/meta_cognition.rs` | DEAD_OR_UNWIRED for TS pipeline. Produces `MetaCognitiveReport` (coherenceScore, anomalyDetected, etc.) in Rust but has no IPC command wired to TypeScript. `cognitiveRuntimeTrace.metaCognition.evaluated` will remain `false` until a safe IPC path is created. `attachMetaCognitiveReport()` helper is ready for future wiring. |

---

## Current chat-turn pipeline

```
UI message
  → chatEngine.generate()
    → [0] cache check (early return if hit)
    → [1.1] input validation  ← cogTrace = createInitialTrace()
    → [1.1.2] preference extraction
    → [1.1.5] constitutional checks (saturation → early return)
    → [1.2] parallel context loading (memory + cognitive)
    → [1.2.4] canonicalDiscernmentKernel.discern()
              ← attachCanonicalDecision(cogTrace, canonicalDecision)
              ← attachMemoryDecision(cogTrace, canonicalDecision.memoryInjection, context.sources.length)
    → early returns: memory-first, clarification-required, blocked-by-missing-fact
    → [1.2.5] working memory compression
    → [1.3] prompt building
    → [1.4] aiOrchestrator.generate()  ← _cogTraceGenStart = Date.now()
              ← attachGenerationResult(cogTrace, { provider, model, fallback, latency })
    → [1.4.5] truth check (Law #10)
    → [1.5] Nexus/Sentinel validation
    → [1.5.1] consistency check
    → [1.5.2] reflective verification (Self-RAG)
              ← attachReflectiveCritique(cogTrace, critique)
              ← attachWebResearchResult(cogTrace, derived from critique)
    → [1.6] post-processing
    → [1.7] memory saving
    → [1.7.8] kernel truth verification
    → [1.8] reasoning summary building
    → quality verifier
              ← attachQualityCritique(cogTrace, qualityCritique)
              ← resolveFinalVerdict(cogTrace)
    → finalResponse with omegaMetadata.cognitiveTrace = cogTrace
```

---

## Recommended minimal patch

**DONE (v33.1.0)**:
1. `src/services/ai/cognitiveRuntimeTrace.ts` — pure trace module (created)
2. `src/services/ai/__tests__/cognitiveRuntimeTrace.test.ts` — 10 unit tests (created)
3. `src/services/ai/chatEngine.ts` — 7 additive patches: import, type, init, attach×5, resolve, expose in omegaMetadata

**Deferred (safe next steps)**:
- ThinkingPanel: add `cognitiveTrace?: CognitiveRuntimeTrace` prop to render final verdict + web limitations + reflection confidence in expert view mode.
- MetaCognition IPC: create a safe `get_meta_cognitive_report` IPC command and call `attachMetaCognitiveReport()` after receiving it (new IPC — out of scope for this mission).

---

## Explicit non-goals

- No new IPC command in this mission.
- No AGI/consciousness engine.
- No raw chain-of-thought exposure (forbidden fields: `hiddenThoughts`, `chainOfThought`, `internalReasoningSteps`, `rawReasoning`, `privateReasoning`).
- No refactor of providers, memory service, Rust runtime, or prompt doctrine.
- No broad UX copy changes.

---

## Proof plan

```
pnpm exec vitest run src/services/ai/__tests__/cognitiveRuntimeTrace.test.ts
pnpm run check
```

Expected: 10/10 tests PASS, `pnpm run check` clean or unrelated pre-existing failures only.

---

## [2026-05-08] Mission 9 — Tauri IPC direct lane status

- Browser live non-mock cognitive trace lane: proven (PASS).
- Direct Tauri IPC lane (`conversation_generate` invoke in WDIO desktop): executed.
- Current direct-lane outcome: non-mock content returned, but Expert selector `reasoning-cognitive-trace` not visible for tested turn.
- Classification: direct Tauri cognitive trace propagation is unproven/failing in this certification lane and must not be reported as PASS.
- Safety: no raw CoT exposure introduced; no broad refactor performed.

---

## 2026-05-08 — Desktop split-lane certification truth (repair mission)

- `conversation_generate` direct Tauri IPC lane is now validated independently in `e2e/desktop/tauri-ipc-cognitive-trace.wdio.test.js` and proves transport/content truth (non-mock).
- UI cognitive propagation remains validated only through composer runtime lane `e2e/desktop/tauri-ui-cognitive-trace.wdio.test.js`.
- Current governed truth: IPC response authority = PASS, UI cognitive trace visibility authority (desktop composer path) = FAIL until `reasoning-cognitive-trace` is rendered from assistant metadata in Tauri runtime.

---

## 2026-05-08 — Desktop Cognitive Trace Repair Final Seal (authority qualification)

- Builder authority: `src/services/ai/buildCognitiveTraceFromResponse.ts` is active and unit-proven (19/19).
- Hook authority: `src/hooks/useConversationEngine.ts` consumes builder output and exposes `cognitiveTraceBuildError` as safe diagnostics.
- UI bridge authority: `src/components/sections/ConversationSection.tsx` forwards `cognitiveTrace` and `cognitiveTraceBuildError` to `ThinkingPanel`.
- Browser visual authority: proven by Playwright mock/live lanes.
- Desktop authority in this seal: construction/storage proof is PASS via `e2e/desktop/chat-cognitive-trace-runtime.wdio.test.js`, but Expert visual rendering remains partially unproven in the same governed lane.
- Mission classification: `QUALIFIED` (`CONSTRUCTION_PROVEN`, `STORAGE_PROVEN`, `EXPERT_RENDER_PARTIAL`).

---

## 2026-05-08 — Final End-to-End desktop Expert seal (authority status)

- New dedicated lane: `e2e/desktop/desktop-expert-cognitive-trace-seal.wdio.test.js`.
- Hook authority strengthened: native `cognitive_trace` is now sanitized through `sanitizeTraceForUi()` in `src/hooks/useConversationEngine.ts` before metadata projection.
- Browser authority: PASS (`e2e/critical/live-cognitive-trace.spec.ts`, non-mock).
- Desktop storage authority: PASS (`e2e/desktop/chat-cognitive-trace-runtime.wdio.test.js`).
- Desktop direct IPC authority: PASS (`e2e/desktop/tauri-ipc-cognitive-trace.wdio.test.js`).
- Desktop Expert visual authority: FAIL (`reasoning-cognitive-trace` absent in the dedicated desktop Expert lane).
- Final authority classification: `DESKTOP_EXPERT_VISUAL_UNPROVEN` (must not be reported as PASS).
