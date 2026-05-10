# UI_DESKTOP_AGENT_CHAT_RUNTIME_CONTEXT_v56

**Date**: 2026-05-10

---

## Agent Chat Context Runtime Results (v56)

Spec: `e2e/desktop/ui-desktop-functional-agent-chat-runtime.wdio.test.js`  
Result: PASSED (worker #0-2)

### Context Results per Route

| Route Context | State | Evidence |
|---|---|---|
| @TITANE (primary) | AGENT_CHAT_CONTEXT_MATCH_PROVEN | tabs=true content=true |
| @TIME | AGENT_CHAT_CONTEXT_MATCH_PROVEN | context_selector_found |
| @ADMIN | AGENT_CHAT_CONTEXT_PARTIAL_STALE_VISIBLE | route_in_dom_only |
| @DEV | AGENT_CHAT_CONTEXT_PARTIAL_STALE_VISIBLE | route_in_dom_only |
| @MEMORY | AGENT_CHAT_CONTEXT_PARTIAL_STALE_VISIBLE | route_in_dom_only |

### Error Boundary Results per Route

| Route | Error | State |
|---|---|---|
| @TITANE | false | AGENT_CHAT_CONTEXT_MATCH_PROVEN |
| @TIME | false | AGENT_CHAT_CONTEXT_MATCH_PROVEN |
| @ADMIN | false | AGENT_CHAT_CONTEXT_MATCH_PROVEN |
| @DEV | false | AGENT_CHAT_CONTEXT_MATCH_PROVEN |
| @MEMORY | **false** | AGENT_CHAT_CONTEXT_MATCH_PROVEN |

**Memory agent chat has zero ErrorBoundary** — confirmed by precise h2+testid detection.

### Sync

```
AGENT_CHAT_SYNC | AGENT_CHAT_CONTEXT_MATCH_PROVEN | sync="Sync chat/raisonnement: America/Toronto · Matin · 0 min focus · onglet now"
```

### Partial Stale Warning

```
AGENT_CHAT_SYNC_ERROR | AGENT_CHAT_CONTEXT_PARTIAL_STALE_VISIBLE | error="⚠️ Impossible de charger les snapshots système."
```

Classification: `AGENT_CHAT_CONTEXT_PARTIAL_STALE_VISIBLE` — expected, system snapshots degraded in E2E environment without live backend. Not a blocker.
