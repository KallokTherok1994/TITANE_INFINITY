# 08_ROLLBACK_MASTER.md

Statut: READY

Rollback documentaire (ce run AutoHeal):
- `git restore -- docs/_evidence/program_autoheal_ah_20260226_215033 docs/_evidence/pA_20260226_215033 docs/_evidence/pB_20260226_215033 docs/_evidence/pC_20260226_215033 docs/_evidence/pD_20260226_215033 docs/_evidence/pE_20260226_215033 docs/_evidence/pF_20260226_215033 docs/_evidence/pG_20260226_215033 docs/_evidence/pH_20260226_215033`

Rollback publication (si besoin):
- `git revert <commit_sha>`
