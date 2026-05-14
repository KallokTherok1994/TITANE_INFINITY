# NEXT_LOCK — After LOCK_E0_DESKTOP_ADVANCED_E2E_2026-05-06

## F0 — Feature Consolidation Lock (Conversation Surface E2E)

**Scope:** Prove conversation round-trip lanes (AI-DESKTOP-03, 04, 05, 10, 11, 19, 20-full) in desktop E2E.

**Prerequisites:**
- Live Ollama model active (gemma2:2b)
- OFFLINE_SIM=1 wired in WDIO session for fallback lane (AI-DESKTOP-05)
- C0 (Conversation Contract Lock) proven

**Required deliverables:**
- WDIO spec `e2e/conversation-surface/conversation-surface.desktop.wdio.spec.js`
- AI-DESKTOP-03: IntelligenceDecisionEnvelope emitted and captured from WDIO console
- AI-DESKTOP-04: Provider routing logged (parse from wdio log)
- AI-DESKTOP-05: Offline fallback with OFFLINE_SIM=1
- AI-DESKTOP-10: Research sourced state (requires sourced response)
- AI-DESKTOP-19/20-full: full chain proven

**Approval gate:** T4 approval required for D5 (Intelligence Seal)

## D5 — Intelligence Seal

**Scope:** Full twin intelligence activation, D0–D4 fully activated, E0+F0 proven.  
**Gate:** T4 approval required. Never activate without explicit governance sign-off.

---

E0 is the E-series entry lock. F0 is the execution/conversation proof lock. Both are prerequisites for D5.
