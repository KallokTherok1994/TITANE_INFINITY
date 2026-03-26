# Matrice des 4 phases

| Phase | Claim doc | Realite code | Realite tests | Realite runtime | Statut | Main gap |
| --- | --- | --- | --- | --- | --- | --- |
| A - I18N | Presence revendiquee via commentaires/roadmap et surface Settings | Loader i18n lazy, locales `fr/en`, `LanguageSwitcher`, `Settings` | Test reel Settings: traductions, switch, fallback, persistence | Surface Settings prouvee localement seulement | `PARTIAL` | Le reste de l'app reste largement non localise |
| B - Interactive Docs | Claims historiques sur docs riches et phases futures | Gros corpus `docs/` + aide clavier, mais aucune route `/docs` ou explorer in-app prouve | Aucun test de docs interactives | Aucune surface de docs runtime-aware trouvee | `DOC_ONLY` | Pas de surface in-app liee aux modules/preuves |
| C - Auto-Sync | Cloud sync multi-device documente | Push/Pull manuels reels; mode `auto` existait sans boucle runtime | Test reel de verite CloudSync | Auto bloque et etiquete; aucun scheduler runtime trouve | `PARTIAL` | Aucun moteur auto-sync prouve |
| D - Advanced Features | Beaucoup de centres/fonctions revendiques | Routes et composants reels: knowledge, research, orchestration, singularity, twins | Test cible sur `/knowledge` seulement | `/knowledge` route vraie mais entree fichier manuelle; le reste est large et peu prouve | `PARTIAL` | Inventaire vaste, peu de preuves runtime profondes |
