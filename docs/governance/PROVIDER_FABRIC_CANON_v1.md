# PROVIDER_FABRIC_CANON_v1

Status: QUALIFIED
Date: 2026-03-27
Scope: Phase 1 safe bounded subset - provider fabric contract freeze

## Goal

Freeze the canonical provider fabric contract and current provider mapping without mutating
provider runtime code.

## Canonical Contract Sources

Primary target contract:

- `src/services/ai/types.ts` -> `AIProviderAdapter`

Current runtime compatibility contract:

- `src/services/ai/types.ts` -> `AIProvider`
- `src/services/ai/types.ts` -> `AIResponse`
- `src/services/ai/types.ts` -> `AiOk` / `AiErr`

Truth companion metadata:

- `src/types/providerMeta.ts`
- `src/types/providerDecisionMeta.ts`

## Target Unified Adapter Surface

The canonical provider fabric target for promoted providers is:

- `id`
- `name`
- `description`
- `capabilities`
- `isAvailable()`
- `testConnection()`
- `getStatus()`
- `listModels()`
- `getDefaultModel()`
- `generate()`
- optional `stream()`
- optional `getStats()`
- optional `resetErrors()`

## Current Runtime Reality

Most providers are still implemented against `AIProvider`, not yet a single proven
`AIProviderAdapter` surface end-to-end.

That means Phase 1 is not complete. This lock freezes the contract and mapping truthfully.

## Provider Mapping

| Surface | Source file | Role in fabric | Current contract status | Proof in this lock |
| --- | --- | --- | --- | --- |
| `titane-local` | `src/services/ai/providers/titaneLocal.ts` | guaranteed local survival fallback | `AIProvider` runtime, adapter migration pending | memory-reuse provider test |
| `ollama` | `src/services/ai/providers/ollama.ts` | local model provider | `AIProvider` runtime, adapter migration pending | memory-reuse provider test |
| `gemini` | `src/services/ai/providers/gemini.ts` | remote provider | `AIProvider` runtime, adapter migration pending | memory-reuse provider test |
| `openai` | `src/services/ai/providers/openai.ts` | remote provider | `AIProvider` runtime with `testConnection()` | provider unit test |
| `claude` | `src/services/ai/providers/claude.ts` | remote provider | `AIProvider` runtime with `testConnection()` | provider unit test |
| `copilot` | `src/services/ai/providers/copilot.ts` | remote provider | file present, not proven in this lock | DOCUMENTED_ONLY |
| `tauriChat` | `src/services/ai/providers/tauriChat.ts` | bridge / backend path | legacy bridge surface | not targeted here |
| `fallback` | `src/services/ai/providers/fallback.ts` | compatibility helper | legacy fallback surface | not targeted here |
| `glm46v` | `src/services/ai/providers/glm46v.ts` | specialized local vision surface | non-promoted specialty provider | not targeted here |

## Phase 1 Freeze

Promoted provider set for the unified fabric:

- `titane-local`
- `ollama`
- `gemini`
- `openai`
- `claude`
- `copilot`

Non-promoted bridge or legacy surfaces remain outside the canonical promoted set until
they are either adapted or retired.

## Anti-Lie Notes

- Do not claim all promoted providers are already on `AIProviderAdapter`.
- Do not claim provider fabric completion while `getStatus()`, `listModels()`, and
  `getDefaultModel()` are not proven across the promoted set.
- Do not claim provider unification from type declarations alone.

## Acceptance For The Next Runtime Lock

1. Add bounded adapters or shims for each promoted provider.
2. Map all promoted providers to one contract surface.
3. Keep deprecated aliases out of the promoted set.
4. Add provider-fabric conformance tests for the promoted set.
