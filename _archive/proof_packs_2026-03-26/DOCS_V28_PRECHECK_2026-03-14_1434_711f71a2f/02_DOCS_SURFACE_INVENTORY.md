A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (inventaire borné des surfaces canoniques docs)
C) RISK: P1
D) PLAN: 1) lister README bornés 2) vérifier racines canoniques 3) relever mentions version bornées.
E) PROOFS: obtenues = `_A2_docs_inventory.log`; attendues = justification d’utilité/faisabilité d’exécution.
F) ROLLBACK: suppression du pack précheck.

# 02 DOCS SURFACE INVENTORY

## Surfaces canoniques présentes

- `README.md` (`PROVEN_BY_REPO`)
- `docs/README.md` (`PROVEN_BY_REPO`)
- `docs/diagrams/README.md` (`PROVEN_BY_REPO`)
- `docs/INDEX.md`, `docs/INDEX_REPO_STRUCTURE.md`, `docs/ui/INDEX_UI.md` (`LOCALLY_VERIFIED`)

## Constat borné

- Multiples README historiques/legacy sont visibles (`LEGACY`/`ARCHIVE`).
- Les surfaces canoniques existent mais les mentions version y sont hétérogènes (`PARTIAL`).

## Risque documentaire

- `README.md` mélange `v27.2.0` et `v27.0.5 stable`, ce qui crée une autorité ambiguë (`CONTRADICTORY`).
