# CHAT_RUNTIME_SOURCE_OF_TRUTH

| composant | source canonique | legacy path ? | contradiction ? | verdict |
|-----------|-----------------|---------------|-----------------|---------|
| Default system prompt (main chat) | SYSTEM_PROMPTS.default in chatModes.config.ts | NO — this IS the canonical authority | YES — CORE_SYSTEM_PROMPT in profiles.ts is richer but never reaches this path | CONTRADICTION → fix = enrich SYSTEM_PROMPTS.default |
| Built-in mode prompts (coach/dev/admin/etc.) | SYSTEM_PROMPTS.{mode} in chatModes.config.ts | NO | NO | PASS |
| Custom mode prompts | _customModeRegistry in chatModes.config.ts | NO | NO | PASS (fixed prior session) |
| Context enrichment (envelope/persona/memory) | conversationEngine.ts assembly | NO | NO | PASS |
| Response mode selection (FAST/BALANCED/DEEP) | NOT used by conversationEngine.ts | chatEngine.ts only | YES — conversationEngine.ts ignores responsePolicy.ts | SECONDARY_AUTHORITY |
| Full constitutional identity | CORE_SYSTEM_PROMPT + FULL_CONSTITUTIONAL_PROMPT | NO (profiles.ts) | YES — duplicate/competing identity | CONTRADICTION |
| IPC transport | tauriClient.secureInvoke | NO | NO | PASS |

## CANONICAL ANSWER
The SINGLE source of truth for default chat behavior in the main UI runtime is:
`SYSTEM_PROMPTS.default` in `src/config/chatModes.config.ts`

It is read at line 387 of `src/services/conversationEngine.ts` via `getSystemPrompt('default')`.
It is the ONLY content that determines the AI's base identity and behavioral directives by default.

Current value: 4-line generic prompt (NOT canonical TITANE policy)
Required value: Canonical TITANE identity with OMEGA pipeline awareness, response modes, memory policy, anti-lie directives, truth status labels
