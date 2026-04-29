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
    DEV[Changes] --> VERIFY[Verify Scripts]
    VERIFY --> E2E[E2E Desktop]
    E2E --> BUILD[Build / Package]
    BUILD --> PROOF[Proof Pack (append-only)]
    PROOF --> VERDICT[PASS / FAIL / BLOCKED]
```
