# Network Surface Online First

Diagramme canon généré automatiquement depuis la source Mermaid.
Il sert à documenter les invariants validés sans impact runtime.
La source reste l'unique vérité et ce rendu doit rester synchronisé.
En cas d'écart, exécuter render sync puis verify Mermaid.
Le contenu du bloc Mermaid ci-dessous reprend exactement la source .mmd.

- Standards: [../../standards/MERMAID_STANDARDS.md](../../standards/MERMAID_STANDARDS.md)
- Index canon: [../CANON_INDEX.md](../CANON_INDEX.md)

```mermaid
flowchart TD
    UI[UI Modules - INTERNAL]
    API[/api/* - INTERNAL]
    Backend[Backend API (UNKNOWN exact module name) - INTERNAL]
    Providers[Providers Gateway - INTERNAL]
    ExtA[External Provider A - EXTERNAL]
    ExtB[External Provider B - EXTERNAL]
    Policy[Policy/Guards - INTERNAL]
    Auth[Auth/Token Checks - INTERNAL]
    Resilience[Timeout/Retry/Fallback - INTERNAL]

    UI --> API
    API --> Backend
    Backend --> Providers
    Providers --> ExtA
    Providers --> ExtB
    Backend --> Policy
    Policy --> Auth
    Policy --> Resilience
```
