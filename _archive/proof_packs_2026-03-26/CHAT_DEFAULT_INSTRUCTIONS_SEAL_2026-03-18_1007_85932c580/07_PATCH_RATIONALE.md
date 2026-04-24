# PATCH RATIONALE

## Single Real Lock

`SYSTEM_PROMPTS.default` in `src/config/chatModes.config.ts`

## What was broken

The 4-line generic default was the ONLY content the main chat AI received for its identity and behavioral directives. The rich `CORE_SYSTEM_PROMPT` (profiles.ts) was never wired to the `conversationEngine.ts` path.

## What was changed

`SYSTEM_PROMPTS.default` replaced with canonical policy containing:

- TITANE identity as OS cognitif
- OMEGA 10-step pipeline (declared explicitly)
- Response mode selection (FAST/BALANCED/DEEP/ARCHITECT)
- Memory policy (STM/MTM/LTM — honest)
- Provider policy (LOCAL/BALANCED/DEEP)
- LOI DE VÉRITÉ truth status labels
- ANTI-MENSONGE directives

## What was NOT changed

- `conversationEngine.ts` — no change needed (it already reads SYSTEM_PROMPTS.default via getSystemPrompt())
- `chatEngine.ts` — secondary path unchanged
- `profiles.ts` — CORE_SYSTEM_PROMPT remains for chatEngine.ts path
- No new imports, no new files in production code

## Why not import CORE_SYSTEM_PROMPT into chatModes.config.ts?

- FULL_CONSTITUTIONAL_PROMPT is ~20KB — bloats every IPC call
- conversationEngine.ts already adds persona/memory/progression context dynamically
- Canonical policy at 800 chars is more appropriate for token-efficient base layer
- Avoids potential circular dependency risks
