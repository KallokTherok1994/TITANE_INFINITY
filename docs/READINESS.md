# READINESS OMEGA

## But
Éliminer "Pipeline not initialized" en usage normal.

## Implémentation
- Commande `get_readiness_status` : Vérifie si providers initialisés.
- UI : ReadinessBanner appelle readiness au boot, affiche bannière si pas prêt.
- Logs structurés avec correlationId.

## Test
Smoke test : Appeler get_readiness_status, vérifier ready=true après init.