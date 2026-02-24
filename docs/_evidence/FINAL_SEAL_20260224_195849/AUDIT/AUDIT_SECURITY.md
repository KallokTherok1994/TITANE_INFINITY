# AUDIT_SECURITY

## G_UI_NO_NETWORK
ResearchPage.tsx: 0 fetch/axios/http calls. IPC-only via webResearch().
Other UI files (AI chat, TTS) have fetch but are NOT in WebResearch pipeline.
VERDICT: PASS

## G_SINGLE_GATE_INTACT (WebResearch scope)
reqwest in P10-P13 new code: 0 occurrences.
Pre-existing: robots_service.rs uses reqwest (P3, out of scope).
fetch_service.rs is the sole authorized reqwest user in pipeline.
VERDICT: PASS (P10-P13 scope)

## G_NO_PROVIDER (external LLM)
P10 local_llm_service.rs: NullLlmProvider (returns None always).
ENABLE_LOCAL_LLM=false by default.
No openai/anthropic/gemini in WebResearch path.
VERDICT: PASS

## G_OFFLINE_HARDSTOP
OfflineGuard checks network mode before any fetch.
OFFLINE mode → immediate error, 0 network_events.
Unchanged from P7. Unit tests cover this path.
VERDICT: PASS

## G_CITATION_CAP_25_WORDS
citations.excerpt trimmed at ≤25 words in rag_service.rs.
locator_text = "p={paragraph_index}, c≈{char_start}" — stable.
VERDICT: PASS

## G_SANDBOX_WRITES
All service writes go to data/research/* paths.
Sandbox guard checks for ".." path traversal and symlink escape.
VERDICT: PASS
