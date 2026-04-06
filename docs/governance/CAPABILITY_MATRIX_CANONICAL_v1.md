# CAPABILITY_MATRIX_CANONICAL_v1

Status: QUALIFIED
Date: 2026-03-27
Scope: Canonical provider and capability freeze for Phase 0

## Canonical Provider Contract

Primary TypeScript contracts:

- `src/services/ai/types.ts` -> `AIProvider`, `AIProviderAdapter`
- `src/types/providerMeta.ts` -> provider decision meta
- `src/types/providerDecisionMeta.ts` -> truth guards

Required provider methods in current promoted contract:

- `name`
- `isAvailable()`
- `generate()`
- optional `stream()`
- optional `testConnection()`

## Promoted Provider Matrix

| Provider id | Class | Source of truth | Core capabilities | Availability basis | Phase 0 classification |
| --- | --- | --- | --- | --- | --- |
| `titane-local` | local | `src/services/ai/providers/titaneLocal.ts` | text_generation | always-on local fallback by design | WIRED_BUT_UNPROVEN |
| `ollama` | local | `src/services/ai/providers/ollama.ts` | text_generation, streaming, local memory context | loopback service health + model presence | WIRED_BUT_UNPROVEN |
| `gemini` | remote | `src/services/ai/providers/gemini.ts` | text_generation, streaming, vision, long_context | secure key status via backend | WIRED_BUT_UNPROVEN |
| `openai` | remote | `src/services/ai/providers/openai.ts` | text_generation, streaming, code_generation, vision | secure key status via backend | WIRED_BUT_UNPROVEN |
| `claude` | remote | `src/services/ai/providers/claude.ts` | text_generation, streaming, code_generation, vision | secure key status via backend | WIRED_BUT_UNPROVEN |
| `copilot` | remote | `src/services/ai/types.ts` + orchestrator imports | text_generation | present in type surface, runtime proof not mapped in this lock | DOCUMENTED_ONLY |

## Canonical Capability Vocabulary

| Capability | Meaning |
| --- | --- |
| `text_generation` | generate full text response |
| `streaming` | incremental token or chunk emission |
| `vision` | image or multimodal visual analysis |
| `function_calling` | structured tool/function invocation |
| `code_generation` | coding-specialized generation |
| `embeddings` | vector embedding generation |
| `long_context` | materially extended context window |
| `audio_transcription` | speech-to-text |
| `audio_generation` | text-to-speech or audio output |

## Legacy And Non-Canonical Names

The deprecated `AIProviderName` union still contains legacy aliases such as:

- `tauri-backend`
- `tauri-gemini`
- `tauri-ollama`
- `tauri-local`
- `tauri-chat`
- `glm46v`
- `fallback`
- `emergency-fallback`
- `ultimate-fallback`

These are not promoted provider ids for Phase 0 canon. They remain legacy compatibility
surface until a later provider-fabric lock retires or remaps them.

## Current Truth Notes

- Existing doc `docs/PROVIDER_CAPABILITY_MATRIX.md` is useful but incomplete for current
  runtime because it omits `titane-local` and does not freeze deprecated aliases.
- Current repo contains both strict provider names and legacy aliases. This matrix freezes
  promoted ids without claiming the legacy cleanup is complete.
