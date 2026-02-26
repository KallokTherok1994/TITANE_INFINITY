# 02_SCOPE_MASTER_FREEZE.md

Statut: FROZEN_BLOCKED

Surfaces autorisées (autoheal gouverné):
- Redémarrage sous-systèmes borné.
- Purge caches transients conformes TTL.
- Bascule flags gouvernés.
- Transition Safe Mode.
- Export support/proof pack redacted.

Surfaces interdites:
- Modification de code production.
- Élargissement capabilities/scopes/permissions.
- Écriture hors sandbox.
- Persistance de secrets.

Drift limits:
- >30 fichiers touchés dans une phase => BLOCKED sans justification.
- Nouvelle dépendance => BLOCKED jusqu’à justification + rollback.

Règle de vérification:
- Toute remédiation doit passer une suite post-check; sinon rollback + safe mode.

État courant:
- Exécution fonctionnelle gelée avant Phase A (stop-the-line précheck).
