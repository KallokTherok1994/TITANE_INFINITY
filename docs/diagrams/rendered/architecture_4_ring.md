# Architecture 4 Ring

Diagramme canon généré automatiquement depuis la source Mermaid.
Il sert à documenter les invariants validés sans impact runtime.
La source reste l'unique vérité et ce rendu doit rester synchronisé.
En cas d'écart, exécuter render sync puis verify Mermaid.
Le contenu du bloc Mermaid ci-dessous reprend exactement la source .mmd.

- Standards: [../../standards/MERMAID_STANDARDS.md](../../standards/MERMAID_STANDARDS.md)
- Index canon: [../CANON_INDEX.md](../CANON_INDEX.md)

```mermaid
flowchart TD
    R1[Ring 1: Types]
    R2[Ring 2: Engines]
    R3[Ring 3: Services]
    R4[Ring 4: Modules/UI]

    R1 --> R2
    R2 --> R3
    R3 --> R4

    R1 -. No I/O .- R1
    R2 -. Pure logic .- R2
    R3 -. Controlled I/O .- R3
    R4 -. Visible errors .- R4
```
