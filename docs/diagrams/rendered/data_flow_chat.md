# Data Flow Chat

Diagramme canon généré automatiquement depuis la source Mermaid.
Il sert à documenter les invariants validés sans impact runtime.
La source reste l'unique vérité et ce rendu doit rester synchronisé.
En cas d'écart, exécuter render sync puis verify Mermaid.
Le contenu du bloc Mermaid ci-dessous reprend exactement la source .mmd.

- Standards: [../../standards/MERMAID_STANDARDS.md](../../standards/MERMAID_STANDARDS.md)
- Index canon: [../CANON_INDEX.md](../CANON_INDEX.md)

```mermaid
sequenceDiagram
    participant UI as Modules/UI (Ring 4)
    participant Bridge as TS-Tauri Bridge
    participant IPC as IPC Commands (UNKNOWN exact command set)
    participant Pipe as Chat Pipeline (UNKNOWN exact module name)
    participant Mem as Memory Service

    UI->>Bridge: User prompt
    Bridge->>IPC: invoke request
    IPC->>Pipe: route prompt
    Pipe->>Mem: read/write context
    Mem-->>Pipe: memory context
    Pipe-->>IPC: response payload
    IPC-->>Bridge: {ok, content, error}
    Bridge-->>UI: render response or visible error
```
