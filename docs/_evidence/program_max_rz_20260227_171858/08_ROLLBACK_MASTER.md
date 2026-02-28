# 08_ROLLBACK_MASTER.md

Statut: APPLICABLE

## Rollback sûr (non destructif)
```bash
git restore -- docs/_evidence/program_max_rz_20260227_171858
git restore -- docs/_evidence/pR_20260227_171858 docs/_evidence/pS_20260227_171858 docs/_evidence/pY_20260227_171858 docs/_evidence/pT_20260227_171858 docs/_evidence/pV_20260227_171858 docs/_evidence/pU_20260227_171858 docs/_evidence/pW_20260227_171858 docs/_evidence/pZ_20260227_171858 docs/_evidence/pX_20260227_171858
```

## Remise en exécution
1. Corriger la gate invariants d’entrée.
2. Rejouer le précheck maître.
3. Reprendre strictement à la phase R.

