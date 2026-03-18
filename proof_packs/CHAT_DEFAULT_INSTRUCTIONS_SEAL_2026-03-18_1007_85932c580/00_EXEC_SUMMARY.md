# CHAT_DEFAULT_INSTRUCTIONS_SEAL — EXEC SUMMARY

## A) EXEC_MODE: LOCAL / BACKGROUND
## B) SCOPE_RING: R4 (src/config/chatModes.config.ts) + R3 (src/services/conversationEngine.ts)
## C) RISK: P1
## D) MODE: REPAIR
## E) PLAN:
1. Bootstrap: git HEAD=85932c580 confirmed
2. Discovery: trace SYSTEM_PROMPTS.default → conversationEngine.ts authority chain
3. Authority map: SYSTEM_PROMPTS.default = CANONICAL_AUTHORITY (thin 4 lines)
4. Contradiction: CORE_SYSTEM_PROMPT in profiles.ts is SECONDARY_AUTHORITY (only used by chatEngine.ts)
5. Minimal patch: enrich SYSTEM_PROMPTS.default with canonical TITANE policy
6. Tests x3 + governance gates
7. Verdict

## REAL_STATE
- SYSTEM_PROMPTS.default in chatModes.config.ts = 4-line generic thin prompt
- CORE_SYSTEM_PROMPT in src/core/prompts/profiles.ts = rich canonical identity (only used by chatEngine.ts secondary path)
- conversationEngine.ts (main ConversationSection path) uses getSystemPrompt() → SYSTEM_PROMPTS.default (thin)
- chatEngine.ts (secondary path, not used by ConversationSection) uses buildSystemPrompt() → CORE_SYSTEM_PROMPT + FULL_CONSTITUTIONAL_PROMPT

## TARGET_DELTA
- SYSTEM_PROMPTS.default enriched with: TITANE identity, OMEGA pipeline, response modes, memory policy, provider policy, anti-lie directives, truth status labels
- No duplication of 20KB FULL_CONSTITUTIONAL_PROMPT in every IPC call

## MAIN_LOCK
SYSTEM_PROMPTS.default in chatModes.config.ts is the single canonical authority for the main chat runtime default. It must be upgraded to express the canonical TITANE policy.

## NEXT_ACTION
Apply patch to SYSTEM_PROMPTS.default in chatModes.config.ts (<30 min)
