# Truth Chain Map

| Domain | Canonical owner | Supporting surfaces | Shown surface | Contradiction | Severity | Status | Action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Provider truth | Backend ProviderDecisionMeta.provider_used/mode/network_used/fallback_used | conversationEngine.ts, useChat.ts | MessageBubble provider badge | None proven | LOW | CANONICAL | Keep UI tied to backend meta |
| Memory truth | memory_os + unified_memory_v2; UnifiedMemory | chatMemorySingleDoor, chatMemoryCompactor | Memory UI panels | Memory consumed not explicitly proven | MED | PARTIAL | Do not claim "memory used" without consumption signal |
| Mode truth | ProviderDecisionMeta.mode | conversationEngine.ts, useChat.ts | Mode indicators (if present) | Requested vs effective risk | MED | PARTIAL | Show effective mode only when from backend meta |
| Improvement/promotion | Backend promotion state | memory configs/tests | UI claims (if present) | Promotion claim without proof | MED | UNKNOWN | Require promotion state before UI claims |
