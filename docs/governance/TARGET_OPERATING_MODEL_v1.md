# TARGET_OPERATING_MODEL_v1

Status: QUALIFIED
Date: 2026-03-27
Scope: Phase 0 authority freeze

## Goal

Freeze one source of truth for the TITANE AI operating model without mutating runtime behavior.

## Authority Freeze

1. Kernel and governing instructions
   - `.github/copilot-instructions.md`
   - `.github/instructions/titane.instructions.md`
   - `AGENTS.md`
2. Canonical contracts and invariants
   - `docs/PROVIDER_ORCHESTRATION_CONTRACT.md`
   - `docs/PROVIDER_CAPABILITY_MATRIX.md`
3. Runtime code reality
   - `src/**`
   - `src-tauri/**`
4. Validators, tests, logs, proof packs
5. Narrative docs

Runtime truth beats docs. Local repo guidance beats task-local narrative when they conflict.

## Active Doctrine

- Production runtime: Tauri-only
- Network doctrine: online-first governed with mandatory local fallback
- Network path: UI -> IPC -> services -> gateway -> external
- Truth contract: no silent fallback, no fake PASS, no unsupported auto claims
- Patch discipline: one real lock, minimal patch, rollback-ready

## Explicit Contradiction

The task-local target "local-first by default" is not adopted in this v1 freeze.

Current higher-authority repo truth remains online-first governed with mandatory local fallback.
Any doctrine change from online-first to local-first requires a dedicated authority-change lock
that updates kernel text, scoped instructions, validators, and downstream docs together.

## Provider Vocabulary

- Provider ids: `titane-local`, `ollama`, `gemini`, `openai`, `claude`, `copilot`
- Provider classes: `local`, `remote`, `hybrid`
- Selection modes: `LOCAL`, `REMOTE`, `OFFLINE`, `CACHED`, `ERROR`

## Capability Vocabulary

- `text_generation`
- `streaming`
- `vision`
- `function_calling`
- `code_generation`
- `embeddings`
- `long_context`
- `audio_transcription`
- `audio_generation`

## Policy Vocabulary

- `online_first_governed`
- `mandatory_local_fallback`
- `one_door_network`
- `tauri_only`
- `no_silent_fallback`
- `proof_first`

## Proof Vocabulary

- `PROVEN`
- `DOCUMENTED_ONLY`
- `WIRED_BUT_UNPROVEN`
- `STUB_ONLY`
- `LEGACY`
- `CONTRADICTORY`
- `MISSING`

## Promotion Vocabulary

- `EXPERIMENTAL`
- `QUALIFIED`
- `STABLE`
- `SEALED`

## Anti-Lie Rules

- Do not claim local-first while validators and kernel remain online-first.
- Do not claim provider selection truth unless it comes from backend meta.
- Do not claim memory consumption effect from storage-size tests alone.
- Do not claim canonical tool-use from frontend stubs alone.
- Do not promote a phase when required artifacts or proofs are missing.

## Operating Loop

`DISCOVERY -> DESIGN -> EXEC -> PROOF -> NEXT LOCK`

Auto-governed continuation is allowed only for bounded docs/contracts/proof work while
authority is coherent and rollback is exact.
