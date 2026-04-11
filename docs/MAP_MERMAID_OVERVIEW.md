# MAP_MERMAID_OVERVIEW

## 1) Vue 4-Ring

```mermaid
flowchart LR
  T[Types Ring 1] --> E[Engines Ring 2]
  E --> S[Services Ring 3]
  S --> U[UI/Modules Ring 4]
```

## 2) One Door Network

```mermaid
flowchart LR
  UI[UI] --> IPC[IPC]
  IPC --> SVC[Services]
  SVC --> GW[Network Gateway]
  GW --> EXT[External]
  UI -. Interdit .-> EXT
```

## 3) Pipeline gouverné

```mermaid
flowchart LR
  D[diagnose] --> P[plan]
  P --> A[apply]
  A --> V[verify]
  V --> R[report]
  R --> S[seal]
```

## 4) Gates & Proof Pack

```mermaid
flowchart LR
  TX3[tests x3] --> G[Gates]
  BX3[build/smoke x3] --> G
  G --> RP[reports/proof pack]
  RP --> VD[verdict unique]
```

## 5) Structure TitanePage — Onglets v30.0.0

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

## 6) Fusion v30 — Évolution → Transform

```mermaid
flowchart LR
  OLD1["/memory-evolution"] -- "Navigate v30" --> TRANS["/titane?tab=transformation"]
  OLD2["/memory-evo"] -- "Navigate v30" --> TRANS
  SEC["MemoryEvolutionSection\n(standalone tab supprimé)"] -- "fusionné dans" --> TRANS
```
