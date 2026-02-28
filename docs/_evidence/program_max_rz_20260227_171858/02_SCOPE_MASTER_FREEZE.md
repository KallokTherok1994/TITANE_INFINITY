# 02_SCOPE_MASTER_FREEZE.md

Statut: APPLIQUÉ
Ring impacté: transversal (1→4), exécution actuelle limitée à la documentation de preuve
Qualification: QUALIFIED

## Changements autorisés
- Ajouter frameworks de spec/test et tests property-based pour le comportement chat.
- Unifier les interfaces vers un moteur de politique unique.
- Étendre schéma télémétrie + redaction-by-design + export support pack.
- Câbler updater signé/rings/gates/rollback si capacité déjà présente et prouvable.
- Ajouter lab de régression sécurité + gates CI stopline.
- Ajouter gouvernance des packs connaissance + ledger provenance/droits.
- Ajouter cockpit UX en couches + actions one-click sûres.

## Changements interdits
- Auto-modification du code prod.
- Élargissement automatique capabilities/scopes/permissions.
- Persistance long-terme des résultats provider soumis à contrainte transient.

## Limites de dérive
- >45 fichiers touchés par phase => `BLOCKED` sauf justification explicite tracée.
- Nouvelle dépendance => `BLOCKED` sans justification + tests + rollback.

## Flags
- Tout nouveau comportement derrière flags, défaut `OFF` jusqu’à qualification.

## État d’application
Scope gelé avant exécution des phases. Aucune phase technique démarrée à cause du blocage précheck.

