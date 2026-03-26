# 08 MAP F - INTERACTIONS / ACTIONS

## Chat pipeline chain
```
ConversationSection
  └─ useChat (src/hooks/useChat.ts)
       └─ chatService.sendMessageLegacy (src/services/api/chat.ts)
            └─ invokeWithRetry
                 └─ secureInvoke (src/api/tauriClient.ts)
                      └─ invoke('chat_message', {...}) → Tauri IPC
```

## Key properties
- OMEGA failsafe timeout: 30s
- Adaptive timeout: getAdaptiveUITimeout(providerType, messageLength)
- IPC contract: { ok, content, error } — enforced via validateIpcPayload
- Whitelist validation: present in tauriClient.ts

## WebResearch chain
- webResearchService.ts → tauri<ResearchReport>('web_research')
- P1 stub: WEB_LIVE mode returns BLOCKED (by design)

## Interactions observed in WDIO
- chat-input detected: YES (data-testid="chat-input")
- message send: PASS (WDIO interaction test passing)
- response wait: PASS

## Status: PASS
