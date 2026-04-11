# MAP_MERMAID_OVERVIEW

**Version:** 30.0.0  
**Date:** 2026-04-11  
**Source canonique:** `docs/canon/ARCHITECTURE_TRUTH.md`

---

## 1) Vue 4-Ring

```mermaid
flowchart LR
  R1["Ring 1\nsrc/types/\nType contracts\n(no I/O)"]
  R2["Ring 2\nsrc/engines/\nPure logic"]
  R3["Ring 3\nsrc/services/\nGoverned I/O"]
  R4["Ring 4\nsrc/ UI\nsrc-tauri/\nOS/IPC"]
  R1 --> R2 --> R3 --> R4
  style R1 fill:#1a3a5c,color:#fff
  style R2 fill:#1a5c3a,color:#fff
  style R3 fill:#5c3a1a,color:#fff
  style R4 fill:#5c1a3a,color:#fff
```

## 2) One Door Network

```mermaid
flowchart LR
  UI["React UI\n(no network)"] -->|IPC invoke| IPC["Tauri IPC\nOne Door"]
  IPC --> SVC["Rust Backend\nRing 2"]
  SVC --> GW["Network Gateway"]
  GW -->|HTTPS| EXT["External\n(Gemini / OpenAI\n/ Claude / Copilot)"]
  GW -->|localhost| OLL["Ollama\n(local LLM)"]
  UI -. "FORBIDDEN" .-> EXT
  style UI fill:#1a1a2e,color:#fff
  style IPC fill:#16213e,color:#fff
  style SVC fill:#0f3460,color:#fff
  style GW fill:#533483,color:#fff
```

## 3) IPC Canonical Contract Flow

```mermaid
sequenceDiagram
  participant UI as React UI
  participant W as safeInvokeCanonical<br/>(src/utils/invoke.ts)
  participant T as Tauri IPC
  participant R as Rust Backend
  participant N as External Network

  UI->>W: command(payload)
  W->>T: secureInvoke(cmd, payload, timeout=10s)
  T->>R: invoke_handler dispatch
  R->>N: HTTP request (if needed)
  N-->>R: provider response
  R-->>T: {ok, content, error}
  T-->>W: CanonicalIpcResult<T>
  W-->>UI: normalized {ok, content, error}
  Note over UI,W: UI timeout=30s → error + Retry button
```

## 4) Pipeline gouverné

```mermaid
flowchart LR
  D[diagnose] --> P[plan]
  P --> A[apply]
  A --> V[verify]
  V --> R[report]
  R --> S[seal]
```

## 5) Gates & Proof Pack

```mermaid
flowchart LR
  TX3[tests x3] --> G[Gates]
  BX3[build/smoke x3] --> G
  G --> RP[reports/proof pack]
  RP --> VD[verdict unique]
```

## 6) Structure TitanePage — Onglets v30.0.0

```mermaid
flowchart TD
  TP["/titane — TitanePage"] --> T1["💬 Chat\ntab=conversation"]
  TP --> T2["📊 Vue\ntab=overview"]
  TP --> T3["📷 Vision\ntab=vision"]
  TP --> T4["🧬 Identité\ntab=identity"]
  TP --> T5["💾 Mémoire\ntab=memory-map"]
  TP --> T6["⚡ XP\ntab=progression"]
  TP --> T7["🌱 Transform & Évo\ntab=transformation"]
  TP --> T8["🔀 Symbiose\ntab=symbiose"]
  T7 --> MEV["MemoryEvolutionCenter\nEvolutionTimeline\n(fusionnés v30)"]
```

## 7) Fusion v30 — Évolution → Transform

```mermaid
flowchart LR
  OLD1["/memory-evolution"] -- "Navigate v30" --> TRANS["/titane?tab=transformation"]
  OLD2["/memory-evo"] -- "Navigate v30" --> TRANS
  SEC["MemoryEvolutionSection\n(standalone tab supprimé)"] -- "fusionné dans" --> TRANS
```

## 8) Provider Routing (Chat Orchestrator v21+R04)

```mermaid
flowchart TD
  REQ["Chat Request\n(from UI)"] --> ORCH["Chat Orchestrator\nsrc-tauri/src/overdrive/\nchat_orchestrator.rs"]
  ORCH --> GEMINI["chat_generate_gemini\n(Gemini API)"]
  ORCH --> OPENAI["chat_generate_openai\n(OpenAI API)"]
  ORCH --> CLAUDE["chat_generate_claude\n(Anthropic API)"]
  ORCH --> COPILOT["copilot_commands\n(GitHub Copilot)"]
  ORCH --> OLLAMA["ai::ollama\n(local Ollama)"]
  GEMINI & OPENAI & CLAUDE & COPILOT & OLLAMA --> RES["{ok, content, error}"]
```

## 9) AutoHeal / Gouvernance

```mermaid
flowchart LR
  FIX["Code Fix"] --> AH["AutoHeal entry\nscripts/autoheal/\nautoheal_rules.jsonl"]
  AH --> DR["detect_recurrence.sh"]
  DR --> VI["verify_instructions.sh"]
  VI -->|PASS=23 FAIL=0| SEAL["Session SEALED"]
  VI -->|FAIL| STL["STOP-THE-LINE"]
```
