# CUSTOM MODE TRUTH SIGNALS

## Where active mode is stored
- `useConversationEngine` local state `currentMode` (useState<ConversationMode>)
- Display: `currentModeLabel` computed from `conversationModes` lookup

## Where active mode is read by chat runtime
- `conversationEngine.ts:processMessage()` → `options?.mode` → `getSystemPrompt(options.mode)`
- Also passed as `mode` field in IPC payload to backend

## Where generated mode is normalized
- `ModeBuilder.handleSave()` → `CustomMode { id: 'custom-<Date.now()>', name, icon, description, systemPrompt, temperature, tags, examples }`
- Saved to `localStorage['titane_custom_modes']`

## How failures are surfaced
- Generate button: `alert()` on error + fallback template systemPrompt (honest degraded path)
- Save: no explicit error shown if localStorage fails (silent, low risk)

## How fallback is labeled
- **BEFORE FIX**: UI showed custom mode name while runtime used SYSTEM_PROMPTS.default — silent fallback, FAKE state
- **AFTER FIX**: UI mode name matches runtime systemPrompt (registerCustomMode ensures resolution)

## How mode changes survive reload/reopen
- `titane_custom_modes` in localStorage persists across reloads
- `ConversationSection` useEffect loads them on mount AND now calls `registerCustomMode` for each
- Registry is in-memory; populated before any chat send on mount ✅

## Anti-lie violations fixed

| Violation | Rupture Point | Classification | Fix Applied |
|-----------|---------------|----------------|-------------|
| UI says custom mode active, runtime uses default | `getSystemPrompt()` line 387 conversationEngine.ts | CHAT_PIPELINE + FALLBACK | `registerCustomMode()` in registry |
| Mode appears in dropdown but systemPrompt not in pipeline | chatModes.config.ts `CHAT_MODES` static map | PERSISTENCE + CHAT_PIPELINE | `_customModeRegistry` added |
| Active mode resets after reload (registry empty) | ConversationSection useEffect missing registry call | STORE | `modes.forEach(m => registerCustomMode(...))` on load |
