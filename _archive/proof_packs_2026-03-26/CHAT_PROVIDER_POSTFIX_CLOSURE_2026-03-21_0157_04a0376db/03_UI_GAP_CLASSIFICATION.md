# UI GAP CLASSIFICATION

## Classification: UI_STATUS_TRUTH_DELAYED_BUT_HONEST

### Justification

The G_UI_STATUS_TRUTH = PARTIAL verdict from the prior session was CONSERVATIVE (correctly so, as
proof was not yet established). Now with full chain inspection:

**Main chat UI (Chat.tsx)**:
- Provider label = `chatServiceResponse.provider` from actual IPC response meta
- Set in `setLastProviderUsed()` and `debugEntries` after every request
- NEVER stale — event-driven, not poll-driven
- Verdict: **PASS**

**ProviderStatusPanel**:
- Decorative widget — does not affect routing or request flow
- Polling is bounded (30s, opt-in only via env flag or localStorage)
- Hardcoded Ollama='offline' initial — NOT a routing lie, just visual initialization
- No user can be misled about chat health because this panel is independent of the send path
- Verdict: **UI_STATUS_TRUTH_DELAYED_BUT_HONEST** (bounded poll, not misleading)

### Answers to Mandatory Questions

| Q | Answer | Evidence |
|---|--------|----------|
| A: How does UI learn of probe-success reset? | Via next successful request response.provider | useChat.ts:2080 |
| B: UI relies on: | PATH A: response meta (live). PATH B: poll (30s) | useChat.ts + useProviderStatus.ts |
| C: UI displays: | Actual invoked provider (from response.provider IPC meta) | Chat.tsx:690 |
| D: Max stale window | 0ms for main label; 30s for status panel poll | useProviderStatus.ts:refreshInterval |
| E: Stale window acceptable? | YES — main label is live; panel is decorative | Architecture analysis |
| F: Ollama success while UI says degraded? | NO — response.provider='ollama' → UI updates immediately | useChat.ts:2080 |
| G: Mechanism incomplete/miswired? | NO — response.provider chain is correct and live | chatEngine.ts:632, 1077 |

### Required Follow-On Action
NONE. No patch needed. The G_UI_STATUS_TRUTH gap was a documentation/proof gap, not a code defect.

### Final Classification
**UI_STATUS_TRUTH_DELAYED_BUT_HONEST**

The 30s polling window of the status panel is explicit (via refreshInterval config), bounded, and does not 
affect the main chat send path. The main chat UI reflects actual request outcomes immediately.
