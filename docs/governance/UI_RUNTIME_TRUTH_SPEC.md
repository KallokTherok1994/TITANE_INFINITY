# UI RUNTIME TRUTH SPEC

## 1. Purpose and scope
Define the canonical anti-lie truth boundary between runtime truth and UI-visible claims. This is a governance convergence artifact, not a release seal.

## 2. Anti-lie principles
- Runtime truth outranks UI or docs.
- Requested state is not the same as effective state.
- Memory stored or recalled is not the same as memory consumed.
- Fallback and degraded states must be visible when they happen.
- Promotion/improvement claims require explicit promotion proof.

## 3. Truth chain domains
| Domain | Canonical owner | Supporting surfaces | Shown surfaces | Status |
| --- | --- | --- | --- | --- |
| Provider truth | Backend ProviderDecisionMeta (provider_used, mode, network_used, fallback_used) | conversationEngine.ts, useChat.ts | MessageBubble provider badge | CANONICAL |
| Memory truth | Backend memory_os + unified_memory_v2; frontend UnifiedMemory | chatMemorySingleDoor, chatMemoryCompactor | Memory UI panels | PARTIAL |
| Mode truth | Backend ProviderDecisionMeta.mode | conversationEngine.ts, useChat.ts | UI mode indicators (if any) | PARTIAL |
| Improvement/promotion | Backend memory promotion state | tests/configs, memory configs | UI claims (if any) | UNKNOWN |

## 4. Canonical owners per domain
- Provider truth: `ProviderDecisionMeta` from backend; UI must show provider_used, not requested.
- Memory truth: canonical backend memory OS + frontend UnifiedMemory; consumption must be explicit before claiming "memory used".
- Mode truth: backend mode from ProviderDecisionMeta; requested mode is not effective mode.
- Improvement/promotion: only when backend promotion state is persisted.

## 5. What UI is allowed to show
- provider_used and derived mode from canonical backend meta.
- fallback/degraded state when explicitly set in meta.
- memory availability or recall counts if sourced from canonical memory interfaces.

## 6. What UI/docs must never imply
- provider requested as provider used.
- memory used if only stored/recalled without consumption proof.
- effective mode if only requested.
- healed/improved/learned/promoted unless promotion state is persisted.

## 7. Conflict register summary
- Memory consumed vs memory shown: NEEDS_ALIGNMENT (no explicit consumption signal).
- Improvement/promotion claims: UNKNOWN (no canonical promotion UI signal).
- Provider/mode truth: CANONICAL (contract sealed) but must remain tied to backend meta.

## 8. Minimal correction rules
- Only adjust labels or docs when truth is overstated.
- No backend/provider/memory engine changes in this lane.
- Rollback must be trivial.

## 9. Reopen rule
- Any correction requiring backend/provider/memory changes triggers reopen triage.

## 10. Rollback rule
- Revert this doc with: `git restore -- docs/governance/UI_RUNTIME_TRUTH_SPEC.md`
- Supersession only via a new bounded anti-lie cycle or deeper runtime proof lane.
