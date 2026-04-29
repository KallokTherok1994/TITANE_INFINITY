# Data Flow Chat

Diagramme canon généré automatiquement depuis la source Mermaid.
Il sert à documenter les invariants validés sans impact runtime.
La source reste l'unique vérité et ce rendu doit rester synchronisé.
En cas d'écart, exécuter render sync puis verify Mermaid.
Le contenu du bloc Mermaid ci-dessous reprend exactement la source .mmd.

- Standards: [../../standards/MERMAID_STANDARDS.md](../../standards/MERMAID_STANDARDS.md)
- Index canon: [../CANON_INDEX.md](../CANON_INDEX.md)

```mermaid
flowchart LR
    UI[UI (React/Tauri)] --> BR[Bridge / IPC]
    BR --> CMD[Tauri Commands]
    CMD --> OMEGA[OMEGA Pipeline]
    OMEGA --> MEM[Unified Memory (STM/MTM/LTM)]
    MEM --> OMEGA
    OMEGA --> OUT[Response -> UI]
```
