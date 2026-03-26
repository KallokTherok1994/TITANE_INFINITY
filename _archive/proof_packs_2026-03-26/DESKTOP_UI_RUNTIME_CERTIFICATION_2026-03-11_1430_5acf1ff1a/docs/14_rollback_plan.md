# 14 — ROLLBACK PLAN

## Aucun changement de code applique dans ce pack
- Seuls des fichiers de proof et une entree autoheal ont ete ajoutes
- Rollback: git revert du commit cert(v20) pour supprimer les preuves
- Source code: inchange (le fix TDZ etait deja en place avant V20)

## Si rebuild AppImage 27.x avait ete lance (hors scope)
- Rollback: restaurer deployment/latest/ avec previous AppImage 26.4.0
- Token requis: GO_FOR_PROD_BUILD__TITANE_INFINITY (non fourni dans cette session)
