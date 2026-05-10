# UI_DESKTOP_FUNCTIONAL_NEXT_ACTIONS_v54

**Version**: TITANE_INFINITY v33.0.11  
**Date**: 2026-05-10  

---

## Immediate Next Actions

1. **Fix Memory E2E blocker** (BLOCKER_E2E_MEMORY_INIT_v54)
   - Add E2E setup fixture: `beforeAll` hook in memory spec that calls IPC to initialize memory store
   - Or: use `TITANE_E2E_MEMORY_INIT=1` env var to trigger DB init in binary startup
   - Target: Memory test moves from FUNCTIONAL_FAIL → FUNCTIONAL_READ_ONLY_PROVEN

2. **Fix oauth_facebook_initiate IPC capabilities** (PREEXISTING)
   - Add `oauth_facebook_initiate` to `src-tauri/tauri.conf.json` capabilities allow list
   - Or: update IPC contract test to list as PREEXISTING_KNOWN_GAP

3. **Add explicit agent context testid selectors**
   - `data-testid="agent-context-display"` in chat/agent components
   - Enables AGENT_CHAT_CONTEXT_MATCH_PROVEN for all routes instead of partial

4. **Add explicit simulated disclosure testid**
   - `data-testid="simulated-disclosure-banner"` in SimulatedDisclosureBanner component
   - Enables deterministic FUNCTIONAL_SIMULATED_CONFIRMED assertion

---

## v55 Target Scope

- Memory E2E init fixture → Memory FUNCTIONAL_READ_ONLY_PROVEN
- oauth_facebook_initiate capabilities fix → IPC contract full PASS (42/42)
- Agent context explicit selectors → AGENT_CHAT_CONTEXT_MATCH_PROVEN on all 5 routes
- HTF deep flow proof: htf-historique, htf-tabs navigation
- Total-Dev page: dev AI chat flow (EXTERNAL_NETWORK_SKIP_WITH_PROOF governed)
- Optimization page: page root + content proof
