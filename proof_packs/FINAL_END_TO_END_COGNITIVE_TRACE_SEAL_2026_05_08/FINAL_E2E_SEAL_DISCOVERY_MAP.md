# FINAL_E2E_SEAL_DISCOVERY_MAP

## 1. builder path
- `src/services/ai/buildCognitiveTraceFromResponse.ts`

## 2. hook trace construction
- builder invocation and fallback path in `src/hooks/useConversationEngine.ts`

## 3. message metadata projection
- `cognitiveTrace` + `cognitiveTraceBuildError` added to assistant metadata in `src/hooks/useConversationEngine.ts`

## 4. ConversationSection extraction
- `latestAssistantRuntime.cognitiveTrace` and `.cognitiveTraceBuildError` extracted and passed down in `src/components/sections/ConversationSection.tsx`

## 5. ThinkingPanel expert selectors
- expert selectors present in `src/features/chat/ThinkingPanel.tsx`:
  - `reasoning-cognitive-trace`
  - `reasoning-cognitive-verdict`
  - `reasoning-cognitive-web-policy`
  - `reasoning-cognitive-quality-action`
  - `reasoning-cognitive-meta-guard`
  - `reasoning-cognitive-meta-enforcement`

## 6. current desktop proof status
- construction: PROVEN
- storage: PROVEN (`e2e/desktop/chat-cognitive-trace-runtime.wdio.test.js`)
- direct IPC non-mock content: PROVEN (`e2e/desktop/tauri-ipc-cognitive-trace.wdio.test.js`)
- dedicated desktop Expert visual: FAIL (`e2e/desktop/desktop-expert-cognitive-trace-seal.wdio.test.js`)

## 7. exact missing visual assertion in runtime
- `reasoning-cognitive-trace` is not visible in the dedicated desktop Expert lane after composer flow.

## 8. safe repair route applied
- Added dedicated lane `e2e/desktop/desktop-expert-cognitive-trace-seal.wdio.test.js`
- Hardened native trace sanitization in `src/hooks/useConversationEngine.ts`
- Re-ran full matrix and documented stop-the-line truth

## 9. unsafe routes rejected
- claiming visual PASS from localStorage-only proof
- forcing mocked markers for desktop visual certification
- bypassing missing selector assertions

## 10. final mission status
- Desktop Expert visual seal remains unproven in runtime Tauri and must remain classified as FAIL.
