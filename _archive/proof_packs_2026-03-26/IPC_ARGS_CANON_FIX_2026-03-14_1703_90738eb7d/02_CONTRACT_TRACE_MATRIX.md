# CONTRACT TRACE MATRIX

Trace (active path):
1. `ConversationSection` -> send user message
2. `processMessage()` in `src/services/conversationEngine.ts`
3. `tauriClient.conversationGenerate(payload)`
4. `secureInvoke('conversation_generate', payload)`
5. Rust command expects named `args: ConversationGenerateArgs`

Contract requirement:
- Frontend payload contract: `{ args: { message, conversationId, ... } }`
- Rust command signature requires top-level `args`

Pre-fix mismatch:
- Wrapper forwarded flat payload without top-level `args`.

Post-fix behavior:
- Wrapper normalizes to `{ args: payload }` when needed.
- Already wrapped payload is preserved (no double-wrap).

Status: PASS
