# Certification Gates

Diagramme canon généré automatiquement depuis la source Mermaid.
Il sert à documenter les invariants validés sans impact runtime.
La source reste l'unique vérité et ce rendu doit rester synchronisé.
En cas d'écart, exécuter render sync puis verify Mermaid.
Le contenu du bloc Mermaid ci-dessous reprend exactement la source .mmd.

- Standards: [../../standards/MERMAID_STANDARDS.md](../../standards/MERMAID_STANDARDS.md)
- Index canon: [../CANON_INDEX.md](../CANON_INDEX.md)

```mermaid
flowchart TD
    Orch[Orchestrator]
    Verify[Verify Gates]
    E2E[E2E Suite]
    Build[Build Checks]
    Proof[Proof Pack]
    Verdict[Final Verdict]

    Orch --> Verify
    Verify --> E2E
    E2E --> Build
    Build --> Proof
    Proof --> Verdict
    Verify -. stop-the-line on FAIL .-> Verdict
```
