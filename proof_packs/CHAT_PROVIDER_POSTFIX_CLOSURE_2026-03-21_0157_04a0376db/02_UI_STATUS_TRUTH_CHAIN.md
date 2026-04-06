# UI_STATUS_TRUTH_CHAIN

## PATH A — Main Chat UI (Response-Driven, LIVE)

| Hop | File | Function | Data Shape | Freshness | Stale Risk | Owner | Reflects |
|-----|------|----------|-----------|-----------|------------|-------|---------|
| 1 | src/ui/pages/Chat.tsx | useChat() | ChatHookResult | Immediate | NONE | Hook | N/A |
| 2 | src/hooks/useChat.ts:2080 | setLastProviderUsed() | AIProviderName | On every response | NONE | Response meta | ACTUAL invoked provider |
| 3 | src/hooks/useChat.ts:1702-1725 | setDebugEntries() | ChatDebugEntry[] | On every request | NONE | Response meta | selectedProvider: chatServiceResponse?.provider |
| 4 | src/ui/pages/Chat.tsx:686 | providerStatus useMemo | ProviderStatus | Derived from debugEntries | NONE | Derived | lastEntry.response.provider OR lastProvider |
| 5 | src/ui/pages/Chat.tsx:690-731 | resolvedProviderRaw | string | Derived from debugEntries[0] | NONE | Derived | selectedProvider from actual response |
| 6 | src/ui/pages/Chat.tsx:696-710 | status ternary | 'online'/'error'/'connecting' | On every render | NONE | Error state | isLoading / error / debugEntry.status |
| 7 | src/ui/pages/Chat.tsx:1415 | runtimeThinking.provider prop | string | Derived | NONE | Derived | ACTUAL invoked provider |

**FRESHNESS MECHANISM (PATH A): event-driven** — every `sendMessage()` call triggers:
1. `chatEngineCommands.generateResponse()` → IPC → backend → response with `provider` field
2. `chatServiceResponse.provider` flows directly into `setLastProviderUsed()` + `debugEntries`
3. `providerStatus` is a `useMemo` derived from `debugEntries[0]` — no cache, no poll

**ANSWER A**: UI learns of recovery via the next successful request's response.provider field. No delay.
**ANSWER B**: PATH A uses last request response meta — NOT polling, NOT stale cache.
**ANSWER C**: UI displays actual invoked provider (from response.provider in IPC meta).
**ANSWER D**: Zero — status updates immediately on response receipt.
**ANSWER E**: Acceptable and honest.
**ANSWER F**: NO — if Ollama responds successfully, response.provider = "ollama", UI shows "ollama" immediately.
**ANSWER G**: No mechanism needed — response.provider IS the live truth.

---

## PATH B — ProviderStatusPanel (Poll-Driven, DECORATIVE)

| Hop | File | Function | Data Shape | Freshness | Stale Risk | Owner | Reflects |
|-----|------|----------|-----------|-----------|------------|-------|---------|
| 1 | src/features/chat/ProviderStatusPanel.tsx | useState (hardcoded) | ProviderStatus[] | Init only | HIGH (for routing) | N/A — not connected to routing | Hardcoded initial: Ollama='offline' |
| 2 | src/features/chat/ProviderStatusPanel.tsx:useEffect | updateStats() | cache stats only | 2s if env-enabled | LOW | apiResponseCache | Cache hit rate ONLY — not provider availability |
| 3 | src/hooks/useProviderStatus.ts | refresh() | ProviderStatus[] | 30s autoRefresh if enabled | MED (30s window) | tauriClient | chat_get_providers_status (static list) |
| 4 | src-tauri/src/overdrive/chat_orchestrator.rs:1479 | chat_get_providers_status | Vec<ProviderStatus> | Static initialized list | N/A | provider_status RwLock | NOT provider_failure_count |

**KEY FINDING**: ProviderStatusPanel is a DECORATIVE widget. It:
- Does NOT gate chat routing
- Does NOT affect which provider is selected for requests  
- Shows hardcoded initial status (Ollama=offline) — visual only
- Cache stats polling (2s) updates only `cacheHitRate`, not availability
- `useProviderStatus` polling (30s) when `autoRefresh=true` — but only used in diagnostic panels

**NOTE**: `chat_get_providers_status` reads `state.provider_status` (initialized at boot, updated by `chat_check_providers`). This is SEPARATE from `provider_failure_count` (the routing authority). The two state maps serve different roles.

**FRESHNESS MECHANISM (PATH B)**: poll-based (30s) or demand (`checkAll()`). Bounded, not unbounded.
**STALE WINDOW**: max 30s for polling-enabled panels; indefinite for hardcoded initial state in ProviderStatusPanel.
**VERDICT**: DELAYED_BUT_HONEST for polling path. Hardcoded initial = documentation debt, not routing lie.
