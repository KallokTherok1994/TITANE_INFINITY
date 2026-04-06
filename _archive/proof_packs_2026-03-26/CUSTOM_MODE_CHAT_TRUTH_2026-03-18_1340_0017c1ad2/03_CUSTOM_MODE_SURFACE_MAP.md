# CUSTOM MODE SURFACE MAP

| Surface | Path | Component | Trigger | Visible State | Expected SoT | Actual SoT (pre-fix) | Status |
|---------|------|-----------|---------|---------------|--------------|----------------------|--------|
| Modal open | ConversationSection.tsx:1651 | ModeBuilder | button click | modal overlay | N/A | N/A | PROVEN_RUNTIME |
| Text input (concept) | ModeBuilder.tsx:concept state | textarea | onChange | concept string | component state | component state | PROVEN_RUNTIME |
| Template cards | ModeBuilder.tsx:modeTemplates | button grid | onClick | selected template | component state | component state | PROVEN_RUNTIME |
| Generate button | ModeBuilder.tsx:generateSystemPrompt | button | onClick | isGenerating/step | Tauri IPC / fallback | Tauri IPC / fallback | PARTIAL_CHAIN |
| Save/create action | ModeBuilder.tsx:handleSave | button | onClick | modal close | localStorage titane_custom_modes | localStorage titane_custom_modes | PROVEN_RUNTIME |
| Mode list (dropdown) | ConversationSection.tsx:1577 | select | onChange | currentModeLabel | customModes state | customModes state | PROVEN_RUNTIME |
| Active mode label | ConversationSection.tsx:1775 | strong | display | currentModeLabel | currentMode from useConversationEngine | currentMode from useConversationEngine | PROVEN_VISIBLE_ONLY (pre-fix) |
| Chat header mode indicator | ConversationSection.tsx:1775 | text | display | mode name | conversationModes lookup | conversationModes lookup | PROVEN_VISIBLE_ONLY (pre-fix) |
| Prompt/policy builder | conversationEngine.ts:387 | getSystemPrompt() | on send | N/A | CHAT_MODES + custom registry | CHAT_MODES only | CHAT_CONSUMPTION_MISSING (pre-fix) → FIXED |
| Provider/router bridge | conversationEngine.ts:payload | processMessage | on send | N/A | systemPrompt in payload | systemPrompt from default | FALLBACK_MASKING (pre-fix) → FIXED |
| Chat request payload | conversationEngine.ts:468 | payload.systemPrompt | on send | N/A | custom systemPrompt | SYSTEM_PROMPTS.default | FALLBACK_MASKING (pre-fix) → FIXED |
| Persistence/reload | ConversationSection.tsx:1237 | useEffect | on mount | N/A | localStorage titane_custom_modes | localStorage titane_custom_modes | PROVEN_RUNTIME (but registerCustomMode missing pre-fix) |
