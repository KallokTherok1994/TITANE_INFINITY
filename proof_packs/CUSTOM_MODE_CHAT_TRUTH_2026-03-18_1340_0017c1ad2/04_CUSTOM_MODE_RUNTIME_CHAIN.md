# CUSTOM MODE RUNTIME CHAIN

## Chain (pre-fix → post-fix)

```
UI action: user clicks "✅ Sauvegarder" in ModeBuilder
  ↓
ModeBuilder.handleSave()
  → builds CustomMode { id: 'custom-<ts>', name, icon, description, systemPrompt, temperature }
  → saves to localStorage['titane_custom_modes']
  → calls onSave(customMode) → ConversationSection.handleSaveCustomMode()
  ↓
ConversationSection.handleSaveCustomMode(mode)
  → setCustomModes(prev => [...prev, mode])                    ✅ UI updated
  [PRE-FIX: MISSING] registerCustomMode(mode.id, mode.systemPrompt)
  [POST-FIX] registerCustomMode(mode.id, mode.systemPrompt)    ✅ FIXED: runtime registry updated
  ↓
User selects mode from dropdown
  → handleModeChange → setMode(modeId as ConversationMode)
  → useConversationEngine.setModeCallback → setCurrentMode(modeId)
  ↓
User sends chat message
  → handleSend → sendMessage(text) → useConversationEngine.sendMessage()
  → processMessage(content, { mode: currentMode })             ← currentMode = 'custom-xxx'
  ↓
conversationEngine.ts: processMessage()
  → baseSystemPrompt = getSystemPrompt('custom-xxx')
  [PRE-FIX] CHAT_MODES['custom-xxx'] → undefined → SYSTEM_PROMPTS.default  ❌ FALLBACK_MASKING
  [POST-FIX] _customModeRegistry['custom-xxx'] → user's systemPrompt        ✅ FIXED
  ↓
systemPrompt = [baseSystemPrompt, contextualPrompt, ...].filter(Boolean).join('\n\n')
  [POST-FIX] now includes the user's custom mode systemPrompt
  ↓
payload = { message, mode: 'custom-xxx', systemPrompt, ... }
  → sent to Tauri IPC backend
  → AI provider receives the custom systemPrompt
  → response uses custom mode behavior
  ↓
UI: response displayed
  Mode indicator: "Mode actuel: <custom mode name>"   ← matches runtime (HONEST)
```

## Persistence chain on reload

```
App mounts → ConversationSection useEffect (line 1237)
  → localStorage.getItem('titane_custom_modes')
  → setCustomModes(modes)
  [PRE-FIX: MISSING] registerCustomMode calls
  [POST-FIX] modes.forEach(m => registerCustomMode(m.id, m.systemPrompt))   ✅ FIXED
  → registry populated before any chat send
```
