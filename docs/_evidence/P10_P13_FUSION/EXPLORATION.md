# EXPLORATION.md — P10–P13 POST-STABLE FUSION
# Generated: 2026-02-24T19:06:00Z
# Based on: P9 STABLE commit 324898f

---

## 2.1 LLM Local / reqwest / FetchService

### LLM modules discovered
- `src-tauri/src/ai/ollama.rs` — uses `reqwest` directly (8 occurrences), builds own client
- `src-tauri/src/ai/gemini.rs` — uses `reqwest` directly (3 occurrences)
- `src-tauri/src/ai/providers/{claude,openai,local}.rs` — use `reqwest::Client` directly
- `src-tauri/src/overdrive/chat_orchestrator.rs` — uses `reqwest` (8 occurrences, Ollama calls)
- `src-tauri/src/commands/ai_chat.rs` — uses `reqwest` (Google connectivity check)

### reqwest outside fetch_service.rs (AI-only scope, predates WebResearch)
These are in the AI chat pipeline, NOT the WebResearch pipeline. The "single network gate" invariant
applies to the WebResearch pipeline only (web_research.rs → fetch_service.rs).

### FetchService usage in WebResearch pipeline
Only `src-tauri/src/commands/web_research.rs` and `src-tauri/src/services/` (web_research context).
✅ Gate INTACT: WebResearch pipeline uses FetchService only.

---

## 2.2 Vector / Embeddings / HNSW

### Existing (P7):
- `src-tauri/src/services/vector_service.rs` — TF-IDF cosine rerank (pure Rust, no network)
- `src-tauri/src/engines/unified_memory/vector_store.rs` — generic vector store (AI memory context)
- `src-tauri/src/memory_os/vector_hnsw.rs` — HNSW impl in memory_os module
- `src-tauri/src/memory_os/vector_store.rs` — vector store for OS memory
- `src-tauri/src/neural_memory/vector.rs` — neural memory vectors

### Embeddings: NO external embedding service. All vectors are either TF-IDF (P7) or AI memory internal.
### P11 Decision: P11.0 = TF-IDF already functional (P7). P11.1 (real embeddings) = BLOCKED.

---

## 2.3 Discovery Extensions

### Current state (P7):
- `src-tauri/src/services/discovery_service.rs` (420 lines) — HTML link extraction, domain-lock, budget
- No sitemap, no RSS, no seed packs

### P12 additions:
- `seed_pack_service.rs` — versioned JSON seed packs
- Extend `discovery_service.rs` — sitemap XML + RSS/Atom parsing (pure Rust, minimal)

---

## 2.4 UI / Research Page

### Current state (P7):
- `src/pages/ResearchPage.tsx` (396 lines) — Question form, mode selector, answer, citations, limitations, trace
- `src/services/webResearchService.ts` (29 lines) — Tauri invoke only
- `src/types/research.ts` (248 lines) — full type definitions
- `Citation`: has `paragraph_index?: number|null`, `char_start?: number|null`
- NO `locator_text` field (to add in P13)
- Trace is in ResearchReport but no collapsible viewer in UI yet

### P13 additions:
- Backend: add `locator_text` to `Citation` struct
- Frontend: collapsible sources viewer + passage viewer + trace viewer

---

## 2.5 Security Scans (Invariants Baseline)

### reqwest in WebResearch path
PASS: Only `src-tauri/src/services/fetch_service.rs`

### fetch()/axios in frontend  
PASS: `src/pages/ResearchPage.tsx` uses only `webResearch()` IPC
PASS: `src/services/webResearchService.ts` uses `invoke()` only

### UI network scan
PASS: No fetch/axios/http/https in ResearchPage.tsx or webResearchService.ts

---

## P10 DECISION: C (hook + BLOCKED)

### Why not P10.A:
- No proven native LLM bindings in repo (no gguf/llama.cpp bindings)
- Inventing bindings out of scope

### Why not P10.B:
- Refactoring ollama.rs + all AI providers to route through FetchService is massive,
  risky (affects chat features), and not "minimal"
- The "single network gate" applies specifically to the WebResearch pipeline

### P10.C — chosen:
- Implement `local_llm_service.rs` with trait + NONE implementation
- Wire hook in `rag_service.rs` (disabled by default via `ENABLE_LOCAL_LLM=false`)
- All WebResearch gates remain PASS (EXTRACTIVE_FALLBACK unchanged)
- LLM generation = BLOCKED (infrastructure not present, strategy = NONE)

---

## Summary of Modules to Touch

### P10 (BLOCKED for actual LLM):
- NEW: `src-tauri/src/services/local_llm_service.rs`
- MOD: `src-tauri/src/services/mod.rs` — add module
- MOD: `src-tauri/src/services/rag_service.rs` — add LLM hook (disabled)

### P11 (P11.0 already PASS via P7):
- DOC only: proof pack confirming TF-IDF gates still pass
- P11.1 BLOCKED (no local embeddings)

### P12 (QUALIFIED target):
- NEW: `src-tauri/src/services/seed_pack_service.rs`
- MOD: `src-tauri/src/services/discovery_service.rs` — add sitemap + RSS parsers
- MOD: `src-tauri/src/services/mod.rs` — add seed_pack_service

### P13 (QUALIFIED target):
- MOD: `src-tauri/src/types/research.rs` — add `locator_text` to Citation
- MOD: `src-tauri/src/services/rag_service.rs` — populate `locator_text`
- MOD: `src/types/research.ts` — add `locator_text` to Citation TS
- MOD: `src/pages/ResearchPage.tsx` — collapsible sources + trace viewer
