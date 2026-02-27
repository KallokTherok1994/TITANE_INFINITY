# TRIAGE SIGNAL 130

## Observation (preuves exactes)
- Préflight local: dépôt propre au démarrage, HEAD cohérent.
- État loop au moment du stop: `stop_reason: MAX_ITERS_REACHED` dans `runs/_loop/LOOP_SUMMARY.md` et `state.json`.
- Trace d'interruption observée dans la sortie de run capturée (hors dépôt, session tooling): présence explicite de `^C` suivie de `Command exited with code 130`.
- Dans `tools/go_p_campaign_autoheal.sh` (avant ce correctif), aucune gestion `trap` SIGINT/SIGTERM et aucun `timeout/kill/pkill` interne.
- Recherche dépôt (tools/runs/_loop): aucune preuve d'un watchdog/timeout/kill pilotant cette campagne.

## Hypothèses possibles (NON PROUVÉ)
1) Interruption manuelle depuis terminal interactif (Ctrl+C).
2) Interruption par orchestrateur/session externe.
3) Signal reçu via fermeture de terminal/process group.

## Conclusion prouvée
- Cause technique prouvée: le process campagne a reçu un SIGINT/SIGTERM externe au script (code 130 + `^C`).
- Cause attribuée au script: NON (aucun émetteur interne trouvé dans le code avant patch).
- Identité émetteur (QUI exact): non attribuable depuis les seules preuves dépôt.

## Décision gouvernée
- Pas d'autoheal: la condition est un signal externe (pas une catégorie FAIL/BLOCKED de gate interne).
- Action retenue: instrumentation minimale + reprise idempotente (section fixloop).
