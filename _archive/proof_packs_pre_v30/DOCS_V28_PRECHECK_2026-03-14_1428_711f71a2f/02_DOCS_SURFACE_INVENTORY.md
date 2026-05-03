A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (inventaire borné: `README.md`, `docs/README.md`, `docs/diagrams/README.md`, `docs/INDEX*.md`, `docs/ui/INDEX_UI.md`)
C) RISK: P1
D) PLAN: 1) lister README bornés 2) confirmer surfaces canoniques 3) relever mentions version bornées.
E) PROOFS: obtenues = `_A2_docs_inventory.log`; attendues = décision de pertinence rewrite.
F) ROLLBACK: suppression du pack precheck.

# 02 DOCS SURFACE INVENTORY

## Surfaces canoniques minimales

- `README.md` -> `PROVEN_BY_REPO`
- `docs/README.md` -> `PROVEN_BY_REPO`
- `docs/diagrams/README.md` -> `PROVEN_BY_REPO`
- `docs/INDEX.md`, `docs/INDEX_REPO_STRUCTURE.md`, `docs/ui/INDEX_UI.md` -> `LOCALLY_VERIFIED`

## Constat borné

- Multiples README legacy/archive existent (`LEGACY` / `ARCHIVE`).
- Les surfaces canoniques existent, mais les claims version sont hétérogènes (`PARTIAL`).

## Zones à risque documentaire

- Mélange de claims `v27.2.0`, `v27.0.5 stable`, et références historiques visibles dans `README.md`.
