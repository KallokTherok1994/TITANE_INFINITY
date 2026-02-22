# Network Surface Online First

Diagramme canon généré automatiquement depuis la source Mermaid.
Il sert à documenter les invariants validés sans impact runtime.
La source reste l'unique vérité et ce rendu doit rester synchronisé.
En cas d'écart, exécuter render sync puis verify Mermaid.
Le contenu du bloc Mermaid ci-dessous reprend exactement la source .mmd.

- Standards: [../../standards/MERMAID_STANDARDS.md](../../standards/MERMAID_STANDARDS.md)
- Index canon: [../CANON_INDEX.md](../CANON_INDEX.md)

```mermaid
flowchart LR
    UI[UI] -->|INTERNAL| API[/api/* (Backend API)/]
    API -->|EXTERNAL| P1[Provider 1 (AUTH/TOKEN + timeout/retry/fallback)]
    API -->|EXTERNAL| P2[Provider 2 (AUTH/TOKEN + timeout/retry/fallback)]
    API -->|INTERNAL| POL[Network Policy / Guards]
    POL --> API
```
