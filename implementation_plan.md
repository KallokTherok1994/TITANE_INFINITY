# Implementation Plan: PROVIDER_TRUTH_CHAIN — Converge Dual Kernel Authority

[Overview]
Converge the TITANE chat provider selection onto a single canonical authority by ensuring the orchestrator honors the canonicalDiscernmentKernel's provider decision without override from its own internal cognitiveKernel.

The chat authority chain is already converged on `canonicalDiscernmentKernel` as the sole authority for profile, mode, memory injection, and inference state (proven in CHAT_AUTHORITY_CONVERGENCE proof pack, PASS). However, the orchestrator (`src/services/ai/orchestrator.ts`) maintains its own `cognitiveKernel.executeCognitiveProcess()` that independently selects a provider. When the canonical kernel's provider preference is passed to the orchestrator via `orchestratorConfig.provider`, the orchestrator's logic can override it if `cognitiveDecision.confidence > 70`. This creates a dual-kernel authority on provider selection — the single most causal current lock.

[Types]
No new types required. The existing types are sufficient:

- `CanonicalDecision.provider` (from `canonicalDiscernmentKernel.ts`): `{ name, model, fallback[], temperature, maxTokens, reasoningEffort }`
- `AIConfig.preferredProvider` (from `./types`): `ProviderChoice`
- `NeuralSelection` (internal to orchestrator): `{ selectedProvider, reason, confidence, alternates }`

[Files]

- **Modified**: `src/services/ai/orchestrator.ts` — In the `generate()` method, modify the `finalProvider` decision logic to honor `preferredProvider` when it is explicitly set by the canonical kernel (not 'auto'). The cognitiveKernel's provider decision should be used only as a signal for health/latency updates, not as an override authority.
- **Modified**: `src/services/ai/chatEngine.ts` — Ensure the canonical kernel's provider preference is always passed as `preferredProvider` in the orchestrator config, and that the kernel's fallback chain is used as the cascade order.
- **New proof pack**: `proof_packs/PROVIDER_TRUTH_CHAIN_CONVERGENCE_<timestamp>/` — Contains evidence of the convergence.

[Functions]

- `orchestrator.generate()` (src/services/ai/orchestrator.ts, line ~350): Modify the `finalProvider` selection logic. Current logic:

  ```typescript
  const finalProvider = IS_VITEST
    ? selection.selectedProvider
    : preferredProvider && preferredProvider !== 'auto'
      ? preferredProvider
      : cognitiveDecision.confidence > 70
        ? cognitiveDecision.provider
        : selection.selectedProvider;
  ```

  This already honors `preferredProvider` when set. The issue is that `chatEngine.ts` passes the kernel's provider as `orchestratorConfig.provider`, which becomes `config?.preferredProvider` in the orchestrator. The current logic IS correct for explicit preferredProvider. The real gap is that the orchestrator's `cognitiveKernel` still runs and its results are logged as if authoritative, creating confusion and potential future regression.

  **Actual fix needed**: Add a guard comment + assertion that when `preferredProvider !== 'auto'`, the cognitiveKernel's provider decision is logged as advisory only, never used as the final provider. Also ensure the `selection.alternates` used for fallback cascade come from the canonical kernel's `fallbackChain` when available.

- `chatEngine.generate()` (src/services/ai/chatEngine.ts, line ~390): Verify that `canonicalDecision.provider.name` is always passed as `orchestratorConfig.provider` and `canonicalDecision.fallbackChain` as `orchestratorConfig.fallbackProviders`. Current code already does this — no change needed.

- `chatEngine.stream()` (src/services/ai/chatEngine.ts): Currently, stream() applies the kernel's provider preference to `this.providerPreference` but does NOT pass it to `aiOrchestrator.stream()`. The orchestrator's stream method calls `selectOptimalProvider` without any preferredProvider, meaning the kernel's provider decision is IGNORED during streaming. **This is a real gap.** Fix: pass the kernel's provider preference to the stream path.

[Classes]

- `AIOrchestrator` (src/services/ai/orchestrator.ts): No class-level changes. The fix is scoped to the `generate()` method's provider selection logic and the `stream()` method's provider passthrough.

[Dependencies]
No new dependencies. No version changes.

[Testing]

- Existing test: `src/__tests__/services/ai/chatEngineCanonicalIntegration.test.ts` — Verify this test still passes after the change.
- Existing test: `src/__tests__/services/ai/behavioralRouterIntegration.test.ts` — Verify no regression.
- New test: Add a test case in the orchestrator tests that verifies when `preferredProvider` is explicitly set (not 'auto'), the cognitiveKernel's provider decision is NOT used as the final provider, regardless of confidence.
- Validation: Run `pnpm run check` to verify TypeScript compilation.
- Proof: Document the provider truth chain (requested → selected → executed → shown) in the proof pack.

[Implementation Order]

1. **Step 1**: Fix `orchestrator.generate()` — Add guard to ensure `preferredProvider` (when explicitly set by canonical kernel) is never overridden by cognitiveKernel's decision. Add clarifying comments documenting the authority hierarchy.
2. **Step 2**: Fix `orchestrator.stream()` — Pass kernel's provider preference through the stream path so streaming also respects the canonical kernel's provider authority.
3. **Step 3**: Run `pnpm run check` to verify TypeScript compilation.
4. **Step 4**: Run existing integration tests to verify no regression.
5. **Step 5**: Create proof pack with provider truth chain evidence.
