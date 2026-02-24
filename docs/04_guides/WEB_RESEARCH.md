# TITANE∞ — WebResearch Engine Guide

**Status:** STABLE · P7.0 · Runtime Certified P9  
**Updated:** 2026-02-24  
**Pipeline:** P1→P9 gates verified · Proof packs: `docs/_evidence/RELEASE_P8_*/` + `docs/_evidence/RELEASE_P9_*/`

---

## Overview

The TITANE∞ WebResearch Engine is a fully local, evidence-bound research system that:

- Fetches and extracts web pages via a **single governed network gate** (`fetch_service.rs`)
- Indexes extracted text in a **local Tantivy/BM25 lexical index**
- Answers questions using **extractive RAG** — citations only, no hallucination, no provider calls
- Supports **governed multi-URL discovery** (seeded, depth=1, budget-capped)
- Optionally reranks passages with **local TF-IDF vector similarity** (no embeddings API)
- Provides **citation locators** (`paragraph_index`, `char_start`) for each extracted passage
- Works **100% offline** when the local index is pre-filled

---

## Modes

| Mode | Description | Network |
|------|-------------|---------|
| `OFFLINE` | Query local index only; hard-stop if network event detected | ❌ None |
| `LOCAL_INDEX` | Query local index, answer from indexed documents | ❌ None |
| `WEB_LIVE` | Governed fetch → extract → index → RAG | ✅ Governed only |

---

## Pipeline (WEB_LIVE — Full P7)

```
POLICY_APPLIED
→ DISCOVERY_START (if seed_urls set)
→ DISCOVERY_SEED_OK
→ ROBOTS → RATE_LIMIT → CACHE → FETCH
→ EXTRACT → INDEX
→ DISCOVERY on raw HTML (depth=1, domain-locked, budget-capped)
→ RAG_START → retrieve top-20 BM25 passages
→ VECTOR_DISABLED | VECTOR_RERANK_OK (if ENABLE_VECTOR_SEARCH=true)
→ RAG_OK → CITATIONS_BUILD_OK
→ VERDICT_PASS
```

---

## Configuration

### ResearchOptions (TypeScript)

```typescript
import { webResearch } from '@/services/webResearchService';
import type { ResearchOptions, ResearchQuery } from '@/types/research';

const options: ResearchOptions = {
  mode: 'WEB_LIVE',
  target_url: 'https://example.com/article',
  seed_urls: ['https://example.com'],   // P7: governed discovery
  max_depth: 1,                          // P7: depth-1 only
  max_pages: 5,                          // budget: max 5 URLs total
  max_bytes_total: 10_485_760,           // 10 MB global cap
  respect_robots: true,
  cache_enabled: true,
  sandbox_root: 'data/research',
};

const result = await webResearch({ question: 'What is TITANE?' }, options);
```

### Environment Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `ENABLE_VECTOR_SEARCH` | `false` | Enable local TF-IDF cosine reranking (EXPERIMENTAL) |

---

## Discovery (P7)

When `seed_urls` is provided, the pipeline:

1. Fetches each seed URL (governed: robots + rate-limit + policy)
2. Runs `DiscoveryService::discover(seed, html_bytes, max_pages)` on the raw HTML
3. Returns same-domain links, filtered (non-HTML extensions excluded), deduplicated
4. Budget-enforced: never exceeds `max_pages` (hard cap: 20 per session)
5. Domain-locked: only URLs on the same host as the seed are followed

**Invariants:**
- `max_depth = 1` in P7 (breadth-only)
- No cross-domain crawl
- Immediate stop when budget exceeded

---

## Vector Reranking (EXPERIMENTAL)

When `ENABLE_VECTOR_SEARCH=true`:

- Retrieves top-20 BM25 passages from index
- Computes TF-IDF vectors (bag-of-words, local, no crate dependencies)
- Ranks by cosine similarity against the query
- Returns top-k for RAG context

**Invariants:**
- Zero network calls — pure computation
- No Ollama, no OpenAI, no external embedding API
- Disabled by default (must opt in)

---

## Citations (P7 — Precise Locators)

Each citation includes:

```typescript
interface Citation {
  url: string;
  excerpt: string;          // ≤ 25 words
  locator?: string;         // "passage #N"
  paragraph_index?: number; // paragraph position in source document
  char_start?: number;      // approximate byte offset in document
  accessed_at: string;
}
```

---

## Sandbox Paths

All research data is confined to `data/research/` (configurable via `sandbox_root`):

```
data/research/
  cache/          — SQLite cache (HTML blobs + metadata)
  index/          — Tantivy lexical index
  evidence/       — audit reports + no_frontend_network_report.txt
```

---

## How to Run Gates

### G_SINGLE_NETWORK_GATE
```bash
rg -n "reqwest" src-tauri/src/services/ --include="*.rs"
# Expected: only fetch_service.rs and robots_service.rs
```

### G_UI_NO_NETWORK
```bash
bash scripts/audit_no_frontend_network.sh
# Check: ResearchPage.tsx and webResearchService.ts have zero fetch()/axios calls
```

### G_DISCOVERY_BUDGET_ENFORCED / G_DISCOVERY_DOMAIN_LOCK
```bash
cargo test --lib -- services::discovery_service::tests
```

### G_VECTOR_OFFLINE_ONLY
```bash
cargo test --lib -- services::vector_service::tests
```

### G_CITATION_LOCATOR_VALID
```bash
cargo test --lib -- commands::web_research::tests::g_citation_locator_valid
```

---

## How to Reproduce Proof Pack

```bash
# 1. Static analysis
rg -n "reqwest" src-tauri/src/services/ src-tauri/src/commands/web_research.rs
bash scripts/audit_no_frontend_network.sh

# 2. Type checks
cd src-tauri && cargo check --lib
cd .. && npx tsc --noEmit

# 3. Unit tests (requires glib-2.0/gobject-2.0 system libs)
cd src-tauri && cargo test --lib

# 4. Gate summary
# All gate results → docs/_evidence/RELEASE_P8_*/
```

---

## Security Summary

| Property | Status |
|----------|--------|
| Network surface | Single gate: `fetch_service.rs` (WebResearch) |
| Sandbox isolation | All data in `data/research/*` |
| Robots.txt respected | ✅ (by default) |
| Rate limiting | ✅ Token bucket per domain |
| No JS execution | ✅ HTML-to-text extraction only |
| No provider calls | ✅ Extractive RAG, no LLM |
| OFFLINE hard-stop | ✅ Network events in OFFLINE mode → BLOCKED verdict |
| Citations ≤ 25 words | ✅ `make_excerpt(MAX_EXCERPT_WORDS=25)` |
| UI read-only | ✅ `webResearch()` IPC only, no direct fetch |
| Discovery domain-locked | ✅ Same host only, depth=1 |
| Vector rerank: no network | ✅ Pure TF-IDF computation |

---

## Rollback

P7 changes are in 3 isolated modules:

```bash
git revert HEAD  # reverts commit 9eb6d78
# Removes: discovery_service.rs, vector_service.rs, ResearchPage.tsx
# Restores: Citation/RetrievedPassage (no new fields), ResearchOptions (no seed_urls/max_depth)
```

---

## Status

**P7.0 — STABLE** · Runtime Certified (P9, 4387/4394 tests pass)
