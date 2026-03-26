# CHAT_INSTRUCTION_CHAIN_MATRIX

| étape | source | injectée quand | peut écraser quoi | preuve | statut |
|-------|--------|---------------|-------------------|--------|--------|
| 1. Base prompt | SYSTEM_PROMPTS.default in chatModes.config.ts | Every processMessage() call | Nothing (base layer) | conversationEngine.ts:387 `getSystemPrompt(mode)` | CANONICAL_AUTHORITY — THIN |
| 2. Context envelope | formatContextEnvelopeForSystemPrompt() conversationEngine.ts | When contextualPrompt available | Appended after base | conversationEngine.ts:452-460 | PASS |
| 3. Persona context | readPersonaContext() → localStorage[titane_persona_profile] | When persona profile exists | Appended after context | conversationEngine.ts:299-320 | PARTIAL (persona modulates expression only) |
| 4. Persistent memory | persistentMemoryContext var | When memory enabled | Appended after persona | conversationEngine.ts:462 | PARTIAL_CHAIN |
| 5. Progression context | progressionContext var | When XP/progression data | Appended after memory | conversationEngine.ts:464 | PARTIAL_CHAIN |
| 6. Cognitive context | cognitiveContext var | When cognitive state available | Appended after progression | conversationEngine.ts:466 | PARTIAL_CHAIN |
| 7. Final systemPrompt | [1]+[2]+[3]+[4]+[5]+[6] joined | Sent via tauriClient.secureInvoke | Sent as IPC payload field | conversationEngine.ts:468-480 | PASS |
| 8. Rust backend | src-tauri/src/commands/ | Receives systemPrompt field | Passes to AI provider | IPC contract {ok, content, error} | WIRED_BUT_UNPROVEN (backend not traced) |

## CONTRADICTION
- Step 1 uses `SYSTEM_PROMPTS.default` (4 lines, generic)
- `CORE_SYSTEM_PROMPT` in profiles.ts (rich, 200+ lines) is NEVER injected into this chain
- chatEngine.ts uses a PARALLEL chain: buildSystemPrompt() → CORE_SYSTEM_PROMPT — for a DIFFERENT path
- Result: ConversationSection messages use thin generic identity; chatEngine.ts messages (if called) use rich identity
- STATUS: CONTRADICTION — two identity definitions for the same AI

## ROOT CAUSE
SYSTEM_PROMPTS.default was never updated to the canonical TITANE policy. The rich canonical prompt was added to profiles.ts and wired to chatEngine.ts, but conversationEngine.ts (the real runtime for the main chat UI) was never updated.
