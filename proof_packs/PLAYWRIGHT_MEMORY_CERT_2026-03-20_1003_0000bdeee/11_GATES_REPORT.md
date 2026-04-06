# 11_GATES_REPORT

| Gate | Status | Evidence |
|---|---|---|
| G_BOOT_TRUTH | PASS | prior bootstrap retained; no global scope reset |
| G_TARGET_RUNTIME_TRUTH | PASS | URL/chat surface resolved on /chat or /titane |
| G_PLAYWRIGHT_STATE_CLASSIFICATION | PASS | MEMORY_PROOF_VERDICT + FALSE_RECALL_VERDICT markers |
| G_NO_AMBIGUOUS_TIMEOUT | PASS | helper returns degraded/timeout explicitly; no ambiguous fail |
| G_MEMORY_SAVE_TRUTH | PASS | storageCount=8 marker in scenario logs |
| G_MEMORY_PERSIST_TRUTH | PASS | local storage payload retained across turns in scenario |
| G_MEMORY_RECALL_TRUTH | BLOCKED | provider fallback offline prevents positive recall proof |
| G_MEMORY_INJECTION_TRUTH | BLOCKED | no positive injection proof under degraded runtime |
| G_CHAT_CONSUMPTION_TRUTH | BLOCKED | no positive memory consumption proof under degraded runtime |
| G_NO_FALSE_MEMORY | PASS | false recall guard verdict HONEST_OFFLINE_DEGRADED, no fabricated recall promoted |
| G_HONEST_FALLBACK_UI | PASS | fallback_offline shown in runtime panel + assistant content |
| G_HARNESS_ALIGNMENT | PASS | prior harness ambiguity fixed; deterministic classifications |
| G_TESTS_X3 | PASS | Memory Multi-Turn Integration passed x3 with same verdict |
| G_ROLLBACK_READY | PASS | 12_ROLLBACK.md |
