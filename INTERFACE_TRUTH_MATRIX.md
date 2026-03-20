# INTERFACE_TRUTH_MATRIX

| surface | route | action | expected backend | persistence | runtime truth | desktop truth | verdict |
|---|---|---|---|---|---|---|---|
| ConversationSection chat input | /titane | type message + send | `conversation_generate` IPC | conversation history DB (`conversation_os_v1.db`) | PROVEN (assistant row rendered, provider attrs set) | PROVEN (WDIO x3 PASS) | PASS |
| Runtime panel (`chat-runtime-state`) | /titane | inspect provider/network/reason | metadata projection from backend result | N/A | PROVEN (panel provider/network/reason aligned with assistant row) | PROVEN (logs `UI_PANEL_ALIGNMENT`) | PASS |
| Backend alignment marker | /titane | compare DOM attrs vs backend meta | response `meta/metadata/decision` | N/A | PARTIAL (backend fields empty in probe; DOM/panel alignment present) | PROVEN (fallback alignment gate passes) | BLOCKED |
| Persistent memory status marker | /titane | process message with memory context | `persistentMemoryGetContext` + prompt assembly | local persistent memory | PROVEN_STATIC (status marker injected in prompt path) | UNPROVEN_RUNTIME (no direct UI assertion yet) | BLOCKED |
| Memory save->recall scenario | /titane | save fact then recall later | memory save/load + ranking + injection | persistent store across turns/sessions | UNPROVEN (no full save/recall evidence in current WDIO scenario) | UNPROVEN | BLOCKED |
| Error state honesty | /titane | provider/memory unavailable | no silent fallback; explicit status/error | N/A | PROVEN_STATIC (no silent catch in frontend memory path) | UNPROVEN_E2E (legacy Playwright suite failing) | BLOCKED |
