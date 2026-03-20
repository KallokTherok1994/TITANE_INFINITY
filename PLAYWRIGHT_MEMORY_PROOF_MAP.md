# PLAYWRIGHT_MEMORY_PROOF_MAP

| step | selector / helper | expected state | alternative degraded state | current behavior | ambiguity risk | needed fix |
|---|---|---|---|---|---|---|
| Open chat target | page.goto('/chat') + URL check in helper | Active chat surface reachable on /chat or /titane | Route redirect to /titane still valid | Stable redirect to /titane observed | Low | Keep route check explicit in verdict logic |
| Resolve input/send nodes | getChatLocators | Input and send button visible | UI shell visible but provider degraded | Selectors stable across legacy/current variants | Medium | Keep multi-selector strategy; avoid single legacy selector |
| Send user turn | sendMessageAndWaitAssistant | Assistant increments with new message | Runtime panel shows ERROR/OFFLINE/FALLBACK | Helper now returns assistant/degraded/timeout outcome | Low | Keep runtime-aware loop instead of pure assistant wait |
| Runtime extraction | readRuntimeSnapshot in helper | provider/mode/reason/memory-state + ipc-ready available | Missing panel but assistant attrs available | Uses panel, assistant attrs, and hidden ipc-ready marker | Medium | Preserve dual-source runtime snapshot and capture ipc-ready for target classification |
| Multi-turn memory scenario | Test 2 Memory Multi-Turn Integration | Recall includes non-adjacent facts + persistence evidence | Fallback offline with honest explanation or browser target mismatch | Current verdict becomes TARGET_MISMATCH when browser mode exposes ipc-ready=fallback | Low | Keep explicit verdict classifier and distinguish structural mismatch from provider outage |
| False recall guard | Test 6 False Recall Guard | Unknown fact rejected explicitly | Degraded runtime and honest fallback message | Current verdict: HONEST_OFFLINE_DEGRADED | Low | Classify degraded via runtime attrs even with assistant response |
| Error/fallback path | Test 4 Error Handling Ollama Down | Error or assistant without crash | Loading visible but fallback surfaced | Test no longer fails by route mismatch; warns on prolonged loading | Medium | Keep outcome poll and explicit warning markers |
| Verdict emission | console markers MEMORY_PROOF_VERDICT / FALSE_RECALL_VERDICT | PASS_MEMORY_REAL or NO_FALSE_MEMORY_BUT_UNPROVEN | HONEST_OFFLINE_DEGRADED | Deterministic state emitted each run | Low | Keep marker emission mandatory in scenario tests |
