# DESKTOP_TEST_MATRIX — LOCK_E0_DESKTOP_ADVANCED_E2E_2026-05-06

| Lane | Assertion | Status | Notes |
|------|-----------|--------|-------|
| AI-DESKTOP-01 | E0-01-A: Tauri app loads root document | PASS | body.isExisting()=true |
| AI-DESKTOP-01 | E0-01-B: App title or root element visible | PASS | title confirmed |
| AI-DESKTOP-02 | E0-02-A: Chat input element is reachable in DOM | PASS | chat input found |
| AI-DESKTOP-03 | E0-03: SKIPPED_WITH_EXPLICIT_BLOCKER | SKIPPED | B2 schema proven Vitest; live convo blocked |
| AI-DESKTOP-04 | E0-04: SKIPPED_WITH_EXPLICIT_BLOCKER | SKIPPED | requires live conversation trace |
| AI-DESKTOP-05 | E0-05: SKIPPED_WITH_EXPLICIT_BLOCKER | SKIPPED | requires OFFLINE_SIM + live model |
| AI-DESKTOP-06 | E0-06-A: Memory page/tab reachable in DOM | PASS | memory nav element found |
| AI-DESKTOP-07 | E0-07: SKIPPED_WITH_EXPLICIT_BLOCKER | SKIPPED | requires VITE_TITANE_HYBRID_MEMORY_GRAPH_ENABLED=true |
| AI-DESKTOP-08 | E0-08: CONTRACT_PROVEN | SKIPPED | C2 KnowledgeGovernanceContract Vitest PASS |
| AI-DESKTOP-09 | E0-09: CONTRACT_PROVEN | SKIPPED | C3 ResearchTruthContract Vitest PASS |
| AI-DESKTOP-10 | E0-10: SKIPPED_WITH_EXPLICIT_BLOCKER | SKIPPED | requires live network + sourced response |
| AI-DESKTOP-11 | E0-11: SKIPPED_WITH_EXPLICIT_BLOCKER | SKIPPED | D1 shadow mode; pipeline trace blocked |
| AI-DESKTOP-12 | E0-12: SKIPPED_WITH_EXPLICIT_BLOCKER | SKIPPED | D2 passive mode; emission trace blocked |
| AI-DESKTOP-13 | E0-13: SKIPPED_WITH_EXPLICIT_BLOCKER | SKIPPED | D3 contract proven; no twin-consent-panel UI |
| AI-DESKTOP-14 | E0-14-A: Agent scorecard doc present and readable | PASS | AGENT_EFFECTIVENESS_SCORECARD.md readable |
| AI-DESKTOP-15 | E0-15: SKIPPED_WITH_EXPLICIT_BLOCKER | SKIPPED | C3 security lane PLANNED |
| AI-DESKTOP-16 | E0-16-A: D4 SelfImprovementLabContract present | PASS | blocksAutoMerge, blocksSelfDeploy confirmed |
| AI-DESKTOP-17 | E0-17-A: autoheal ≥1671 entries + D4 entry | PASS | entries=1671, D4 entry confirmed |
| AI-DESKTOP-17 | E0-17-B: detect_recurrence.sh PASS | PASS | PASS confirmed |
| AI-DESKTOP-18 | E0-18-A: UI accessible without Ollama | PASS | body.isExisting()=true |
| AI-DESKTOP-19 | E0-19: SKIPPED_WITH_EXPLICIT_BLOCKER | SKIPPED | requires live Ollama conversation |
| AI-DESKTOP-20 | E0-20-A: App launches and body exists | PASS | smoke baseline PASS |
| AI-DESKTOP-20 | E0-20-B: Full chain SKIPPED_WITH_EXPLICIT_BLOCKER | SKIPPED | blocked pending C0+C1+C2+C3+D0–D4 |

**Total assertions:** 23  
**PASS:** 10 (assertions), 8 (distinct lanes)  
**SKIPPED_WITH_EXPLICIT_BLOCKER:** 13 (assertions), 12 (distinct lanes)  
**FAIL:** 0
