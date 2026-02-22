# Omega Pipeline V2

Diagramme canon généré automatiquement depuis la source Mermaid.
Il sert à documenter les invariants validés sans impact runtime.
La source reste l'unique vérité et ce rendu doit rester synchronisé.
En cas d'écart, exécuter render sync puis verify Mermaid.
Le contenu du bloc Mermaid ci-dessous reprend exactement la source .mmd.

- Standards: [../../standards/MERMAID_STANDARDS.md](../../standards/MERMAID_STANDARDS.md)
- Index canon: [../CANON_INDEX.md](../CANON_INDEX.md)

```mermaid
flowchart TD
    IN[Conversation Input]
    Router[Router]
    Executor[Executor]
    Merger[Merger]
    Guardrails[Guardrails]
    OUT[Conversation Output]

    IN --> Router
    Router --> Executor
    Executor --> Merger
    Merger --> Guardrails
    Guardrails --> OUT
    Guardrails -. policy checks .-> Router
```
