# SCOPE — FINAL CLEAN SEAL

## Objectifs
1. Nettoyage final — zéro P0 non résolu
2. Alignement docs — zéro promesse non prouvée
3. Normalisation terminologique
4. Tests x3 PASS
5. Proof pack scellé (LOCK + registry append + rollback drill)

## Interdits (STOP-THE-LINE)
- Refactor gratuit, reformat global, renommage massif
- Modification non append-only des registries
- Suppression d'archives sans procédure
- Bypass token/policy
- "ça devrait marcher"
- Build PROD sans token `GO_FOR_PROD_BUILD__TITANE_INFINITY`
- Feature OS-level (WiFi connect)

## Chemins autorisés à changer
- `docs/_evidence/final_clean_seal/**` — proof pack (nouveau)
- `docs/TERMINOLOGY_ALIGNMENT_FINAL.md` — nouveau
- `registry/ui-events.jsonl` — append-only (1 ligne FINAL_SEAL_APPLIED)
- `README.md` — section "Truth & Proof" si absente (ajout minimal)
- Runtime: uniquement si P0 identifié et non corrigé

## Stop conditions
- P0 runtime sans plan minimal
- Test skip ou flaky
- Preuve manquante pour une claim

## Définition DONE
- Zéro P0 non résolu
- Tests PASS x3
- Proof pack complet + SHA256 + LOCK
- Registry append FINAL_SEAL_APPLIED
- Rollback drill documenté
