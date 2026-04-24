# 05 — DEFAULTS SOURCE MAP

## Canonical Source: `src/services/ai/responsePolicy.ts`

Single source of truth for response profiles, inference policy, and token budgets.

| Setting                         | File/Source                                 | Layer        | Before      | After                | Canonical? | Drift Risk                           |
| ------------------------------- | ------------------------------------------- | ------------ | ----------- | -------------------- | ---------- | ------------------------------------ |
| Default profile                 | responsePolicy.ts MODE_PROFILE_MAP[default] | Service      | BALANCED    | BALANCED (unchanged) | YES        | Low                                  |
| BALANCED maxTokens              | responsePolicy.ts BALANCED.maxTokens        | Service      | 2048        | 2048 (unchanged)     | YES        | Low                                  |
| BALANCED clarificationThreshold | responsePolicy.ts                           | Service      | 0.6         | **0.72**             | YES        | Low                                  |
| BALANCED inferenceAggression    | responsePolicy.ts                           | Service      | 0.6         | **0.72**             | YES        | Low                                  |
| Short-msg-DIRECT threshold      | responsePolicy.ts Rule 7                    | Service      | msgLen < 30 | **msgLen <= 8**      | YES        | Low                                  |
| ollama maxTokens                | providers.ts providerOverrides              | Prompt layer | 500         | **1200**             | YES        | Was conflicting with BALANCED        |
| titane-local maxTokens          | providers.ts                                | Prompt layer | 400         | **800**              | YES        | Was conflicting                      |
| tauri maxTokens                 | providers.ts                                | Prompt layer | 600         | **1200**             | YES        | Was conflicting                      |
| openai maxTokens                | providers.ts                                | Prompt layer | 800         | **1800**             | YES        | Was conflicting                      |
| claude maxTokens                | providers.ts                                | Prompt layer | 900         | **1800**             | YES        | Was conflicting                      |
| gemini maxTokens                | providers.ts                                | Prompt layer | 750         | **1500**             | YES        | Was conflicting                      |
| chatEngine DEFAULTS.maxTokens   | chatEngine.commands.ts                      | IPC bridge   | 1200        | 1200 (no change)     | Partial    | Uses Tauri get_chat_request_defaults |
| CORE_SYSTEM_PROMPT              | profiles.ts                                 | Persona      | Unchanged   | Unchanged            | YES        | No change needed                     |

## Analysis

The BALANCED profile (2048 tokens) was correct but was undermined by:

1. **Rule 7**: messages < 30 chars → DIRECT (512 tokens) — affected most casual queries
2. **providerOverrides**: ollama/titane-local limits (500/400) capped responses
3. **Low clarificationThreshold** (0.6) caused unnecessary clarification requests

## NOT CHANGED (reasons)

- CORE_SYSTEM_PROMPT: personalized to Kevin's book — not a response-length control
- constitution.ts: governance laws — not touching
- chatEngine.commands.ts DEFAULTS.maxTokens: 1200 is within BALANCED range, leave as-is
