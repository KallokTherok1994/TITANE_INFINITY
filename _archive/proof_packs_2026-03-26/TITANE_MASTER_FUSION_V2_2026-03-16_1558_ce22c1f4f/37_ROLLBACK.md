# 37 - Rollback

Aucun patch applicatif a rollback.

## Rollback de cette session
- Supprimer le proof pack cree:
  - rm -rf "proof_packs/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f"

## Rollback securite (si besoin)
- git restore -- proof_packs/
