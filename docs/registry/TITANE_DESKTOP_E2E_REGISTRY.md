# TITANE Desktop E2E Registry

Lock: E0 (updated post-E0 run)
Date: 2026-05-06
Status model: PASS | SKIPPED_WITH_EXPLICIT_BLOCKER | BLOCKED_DESKTOP_E2E | PLANNED
E0 run: WDIO 23 assertions passing (11.7s), Vitest 21/21 PASS, validator PASS=25 FAIL=0

| id | name | lock_dependency | expected_artifact | status | blocker |
|---|---|---|---|---|---|
| AI-DESKTOP-01 | Launch + boot intelligence services | T0/E0 | DESKTOP_E2E.log | PASS | — |
| AI-DESKTOP-02 | Chat input reachable in DOM | B2/E0 | DESKTOP_E2E.log | PASS | — |
| AI-DESKTOP-03 | IntelligenceDecisionEnvelope visible/logged | B2/E0 | DESKTOP_E2E.log | SKIPPED_WITH_EXPLICIT_BLOCKER | Requires live Ollama conversation; B2 schema contract proven Vitest 26 PASS; next: F1 conversation surface lock |
| AI-DESKTOP-04 | Provider routing decision logged | C0/E0 | DESKTOP_E2E.log | SKIPPED_WITH_EXPLICIT_BLOCKER | Requires live provider routing trace; next: F1 |
| AI-DESKTOP-05 | Provider fallback explicit | C0/E0 | DESKTOP_E2E.log | SKIPPED_WITH_EXPLICIT_BLOCKER | OFFLINE_SIM=1 not wired in WDIO session; next: F1 |
| AI-DESKTOP-06 | Memory page/tab reachable | C1/E0 | DESKTOP_E2E.log | PASS | Memory nav element found in DOM |
| AI-DESKTOP-07 | MemoryGraph shadow write | C1/E0 | DESKTOP_E2E.log | SKIPPED_WITH_EXPLICIT_BLOCKER | VITE_TITANE_HYBRID_MEMORY_GRAPH_ENABLED=false; next: activation gate T4 |
| AI-DESKTOP-08 | Knowledge governance contract proven | C2/E0 | DESKTOP_E2E.log | SKIPPED_WITH_EXPLICIT_BLOCKER | C2 contract proven Vitest 77 PASS; runtime DB state required for WDIO E2E; next: F1 |
| AI-DESKTOP-09 | Research unavailable honesty contract proven | C3/E0 | DESKTOP_E2E.log | SKIPPED_WITH_EXPLICIT_BLOCKER | C3 contract proven Vitest 77 PASS; UI surface navigation required; next: F1 |
| AI-DESKTOP-10 | Research sourced state when network available | C3/E0 | DESKTOP_E2E.log | SKIPPED_WITH_EXPLICIT_BLOCKER | Requires live network + sourced content; next: F1 |
| AI-DESKTOP-11 | OMEGA first real handler trace | D1/E0 | DESKTOP_E2E.log | SKIPPED_WITH_EXPLICIT_BLOCKER | D1 shadow mode; pipeline injection blocked until D2 activation gate |
| AI-DESKTOP-12 | Singularity measured/UNMEASURED | D2/E0 | DESKTOP_E2E.log | SKIPPED_WITH_EXPLICIT_BLOCKER | D2 passive mode; B2 emission not active until D3+B2 integration |
| AI-DESKTOP-13 | Twin consent boundary enforced | D3/E0 | DESKTOP_E2E.log | SKIPPED_WITH_EXPLICIT_BLOCKER | No twin-consent-panel UI exists; blocked until D5 UI build |
| AI-DESKTOP-14 | Agent effectiveness scorecard accessible | D0/E0 | DESKTOP_E2E.log | PASS | AGENT_EFFECTIVENESS_SCORECARD.md present and readable |
| AI-DESKTOP-15 | Injection blocking evidence | C3/E0 | DESKTOP_E2E.log | SKIPPED_WITH_EXPLICIT_BLOCKER | C3 security lane not implemented; next: C3 security lock |
| AI-DESKTOP-16 | Self-improvement requires approval | D4/E0 | DESKTOP_E2E.log | PASS | D4 SelfImprovementLabContract blocksAutoMerge + blocksSelfDeploy constants confirmed |
| AI-DESKTOP-17A | AutoHeal recurrence entries present | E0 | DESKTOP_E2E.log | PASS | autoheal ≥1671 entries + D4 entry confirmed |
| AI-DESKTOP-17B | detect_recurrence PASS | E0 | DESKTOP_E2E.log | PASS | detect_recurrence.sh exit 0 |
| AI-DESKTOP-18 | Offline local fallback behavior | E0 | DESKTOP_E2E.log | PASS | UI accessible without Ollama (body.isExisting=true) |
| AI-DESKTOP-19 | Online-first governed behavior | E0 | DESKTOP_E2E.log | SKIPPED_WITH_EXPLICIT_BLOCKER | Requires live Ollama conversation; next: F1 |
| AI-DESKTOP-20A | Full smoke chain — app launches | E0 | DESKTOP_E2E.log | PASS | body.isExisting=true — smoke baseline PASS |
| AI-DESKTOP-20B | Full ask→response chain | E0 | DESKTOP_E2E.log | SKIPPED_WITH_EXPLICIT_BLOCKER | Blocked pending C0+C1+C2+C3+D0-D4 activation + live Ollama; next: F1 + activation gates |
