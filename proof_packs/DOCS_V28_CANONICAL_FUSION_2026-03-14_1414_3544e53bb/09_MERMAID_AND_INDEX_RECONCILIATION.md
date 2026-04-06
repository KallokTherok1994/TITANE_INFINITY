A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (`docs/diagrams/**`, `docs/INDEX*.md`, `docs/ui/INDEX_UI.md` en lecture)
C) RISK: P1
D) PLAN: 1) verifier references mermaid 2) verifier presence index clefs 3) classifier statut reconciliation.
E) PROOFS: obtenues = `_phase_mermaid_refs_check.log`, `_phase_index_presence.log`.
F) ROLLBACK: suppression du proof pack uniquement.

# 09 MERMAID AND INDEX RECONCILIATION

## Mermaid

- References critiques de `docs/diagrams/README.md`: `PASS` (toutes presentes) -> `LOCALLY_VERIFIED`
- Classes:
  - `docs/diagrams/sources`: `PROVEN_BY_REPO`
  - `docs/diagrams/rendered`: `PROVEN_BY_REPO`
  - `docs/diagrams/CANON_INDEX.md`: `PROVEN_BY_REPO`

## Index/navigation

- Presence `docs/INDEX.md`, `docs/INDEX_REPO_STRUCTURE.md`, `docs/ui/INDEX_UI.md`: `LOCALLY_VERIFIED`
- Reconciliation globale nav: `PARTIAL` (pas de rewrite applique, nombreuses surfaces legacy detectees).

Statut phase:
- `PARTIAL`
