# Desktop E2E Blocker Matrix — F0

**Date:** 2026-05-06  
**Lock:** F0 — Registry / README / CHANGELOG / Release Sync  
**Source:** E0 proof pack DESKTOP_RUNTIME_BLOCKERS.md + WDIO run (23 assertions, 11.7s)

---

## Lane Status Summary

| Lane | Assertion | E0 Status | Blocker Type | Blocker Detail | Next Lock |
|------|-----------|-----------|-------------|----------------|-----------|
| AI-DESKTOP-01 | Launch + root document | PASS | — | — | — |
| AI-DESKTOP-01 | App title visible | PASS | — | — | — |
| AI-DESKTOP-02 | Chat input reachable | PASS | — | — | — |
| AI-DESKTOP-03 | IntelligenceDecisionEnvelope emitted | SKIPPED_WITH_EXPLICIT_BLOCKER | LIVE_CONVERSATION | Live Ollama required; envelope emitted only during conversation | F1 |
| AI-DESKTOP-04 | Provider routing logged | SKIPPED_WITH_EXPLICIT_BLOCKER | LIVE_CONVERSATION | Requires live provider routing trace | F1 |
| AI-DESKTOP-05 | Offline fallback | SKIPPED_WITH_EXPLICIT_BLOCKER | OFFLINE_SIM_MISSING | OFFLINE_SIM=1 not wired in WDIO session | F1 |
| AI-DESKTOP-06 | Memory page reachable | PASS | — | — | — |
| AI-DESKTOP-07 | MemoryGraph shadow write | SKIPPED_WITH_EXPLICIT_BLOCKER | FEATURE_FLAG | VITE_TITANE_HYBRID_MEMORY_GRAPH_ENABLED=false | Activation gate T4 |
| AI-DESKTOP-08 | Knowledge governance used | SKIPPED_WITH_EXPLICIT_BLOCKER | CONTRACT_PROVEN | Vitest 77 PASS; runtime DB state required for WDIO | F1 |
| AI-DESKTOP-09 | Research unavailable honesty | SKIPPED_WITH_EXPLICIT_BLOCKER | CONTRACT_PROVEN | Vitest 77 PASS; UI surface navigation required | F1 |
| AI-DESKTOP-10 | Research sourced state | SKIPPED_WITH_EXPLICIT_BLOCKER | LIVE_NETWORK | Live network + sourced content required | F1 |
| AI-DESKTOP-11 | OMEGA real handler trace | SKIPPED_WITH_EXPLICIT_BLOCKER | PIPELINE_MODE | D1 shadow only; injection blocked until D2 activation | D2 activation |
| AI-DESKTOP-12 | Singularity measured/UNMEASURED | SKIPPED_WITH_EXPLICIT_BLOCKER | PIPELINE_MODE | D2 passive; B2 emission inactive until D3+B2 | D3 activation |
| AI-DESKTOP-13 | Twin consent boundary | SKIPPED_WITH_EXPLICIT_BLOCKER | UI_SURFACE_MISSING | No twin-consent-panel UI exists | D5 UI build |
| AI-DESKTOP-14 | Scorecard accessible | PASS | — | — | — |
| AI-DESKTOP-15 | Injection blocking | SKIPPED_WITH_EXPLICIT_BLOCKER | C3_SECURITY_PLANNED | Security lane not implemented | C3 security lock |
| AI-DESKTOP-16 | Self-improvement requires approval | PASS | — | D4 constants proven | — |
| AI-DESKTOP-17A | AutoHeal entries present | PASS | — | — | — |
| AI-DESKTOP-17B | detect_recurrence PASS | PASS | — | — | — |
| AI-DESKTOP-18 | UI accessible without Ollama | PASS | — | — | — |
| AI-DESKTOP-19 | Online-first trace | SKIPPED_WITH_EXPLICIT_BLOCKER | LIVE_OLLAMA | Live Ollama conversation required | F1 |
| AI-DESKTOP-20A | Smoke baseline | PASS | — | — | — |
| AI-DESKTOP-20B | Full chain | SKIPPED_WITH_EXPLICIT_BLOCKER | MULTI_DEPENDENCY | All locks active + live Ollama | F1 + activations |

---

## Blocker Type Distribution

| Blocker Type | Count |
|-------------|-------|
| LIVE_CONVERSATION / LIVE_OLLAMA | 4 |
| CONTRACT_PROVEN (Vitest sufficient) | 2 |
| OFFLINE_SIM_MISSING | 1 |
| FEATURE_FLAG | 1 |
| LIVE_NETWORK | 1 |
| PIPELINE_MODE (activation gate) | 2 |
| UI_SURFACE_MISSING | 1 |
| C3_SECURITY_PLANNED | 1 |
| MULTI_DEPENDENCY | 1 |

---

## Binary Policy Blocker

| Blocker | Resolution Applied |
|---------|-------------------|
| STALE_RELEASE_BINARY | `TITANE_ENFORCE_BINARY_FRESHNESS=0` for E0 run |

---

## Resolution Path

- **F1 lock** resolves: AI-DESKTOP-03, 04, 05, 08, 09, 10, 19, 20B (live conversation + OFFLINE_SIM)
- **Activation gate (T4)** resolves: AI-DESKTOP-07, 11, 12, 13
- **C3 security lock** resolves: AI-DESKTOP-15
- **No resolution path**: none — all blockers have documented next actions
