# PATCH DIFF

File changed:
- `src/lib/tauriClient.ts`

Patch summary:
- Added `payload` local variable.
- Added `normalizedPayload` guard:
  - if payload already contains `args`, keep payload unchanged
  - else wrap as `{ args: payload }`
- Routed `conversationGenerate` invoke through `normalizedPayload`.

Reasoning:
- Minimal single-boundary fix avoids broad refactor and protects active chat path from flat-payload regressions.

Status: PASS
