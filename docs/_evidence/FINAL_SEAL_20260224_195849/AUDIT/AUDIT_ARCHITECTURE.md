# AUDIT_ARCHITECTURE

## WebResearch Pipeline (P7→P13)

```
Query
  → PolicyService (allowed domains, budget caps, OFFLINE guard)
  → RobotsService (robots.txt check via fetch_service.rs)
  → RateLimiter (per-domain rate limiting)
  → CacheService (disk cache, data/research/cache/)
  → FetchService (SINGLE HTTP GATE — reqwest only here)
  → ExtractorService (HTML → text, no network)
  → IndexService (BM25 TF-IDF, data/research/index/)
  → DiscoveryService (URL expansion, sitemap/RSS parse — P12)
  → SeedPackService (versioned seed URL packs — P12)
  → VectorIndex (BLOCKED — P11.1 not implemented)
  → RagService (extractive rerank + locator_text — P13)
    └── LocalLlmProvider hook (BLOCKED — P10, NullLlmProvider)
  → Citations (≤25 words, locator_text: "p=N, c≈M" — P13)
  → ResearchResult { answer, citations, trace, limitations }
```

## IPC Surface
- `web_research` Tauri command → `WebResearchInput` → `WebResearchOutput`
- Contract version: `RESEARCH_CONTRACT_VERSION = "P13.0"`

## Ring Classification
- Ring 1: `src/types/research.ts`, `src-tauri/src/types/research.rs`
- Ring 2: engines (BM25, TF-IDF, scorer)
- Ring 3: services/* (fetch, robots, rag, seed_pack, discovery)
- Ring 4: ResearchPage.tsx (UI — no network)

## TypeScript/Rust Parity
| Rust field        | TS field          | Status |
|-------------------|-------------------|--------|
| answer            | answer            | ✅     |
| citations         | citations         | ✅     |
| locator_text      | locator_text?     | ✅ P13 |
| trace             | trace             | ✅     |
| limitations       | limitations       | ✅     |
