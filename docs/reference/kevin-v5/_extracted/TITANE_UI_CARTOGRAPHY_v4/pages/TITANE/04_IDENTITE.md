# TITANE — Identité

## Statut
- Pill **Identité** visible dans TITANE.
- Pas de capture du contenu interne.

## Rôle produit (cible)
Définit “qui est TITANE” et “qui est l’utilisateur” (profils + règles) :
- profil utilisateur (nom, préférences, style, langue),
- profil assistant/TITANE (ton, limites, lois),
- modes (Normal/Analyse/etc.) et comportements,
- identités multiples si multi‑conversations.

## UI attendue
- Sections : **Utilisateur**, **TITANE**, **Modes**, **Sécurité**.
- Éditeur de règles (JSON/Markdown) + validation.
- Historique des changements + rollback.

## Risques & blocs potentiels
- Identité non chargée → réponses incohérentes.
- Régressions de schéma → valeurs `undefined` provoquant erreurs JS.

## Tests
- Changement de profil à chaud (sans reload).
- Persistance (Local-first) + import/export.
## UI attendue
- Cartes : **Utilisateur**, **Assistant**, **Règles**, **Styles**.
- Contrôles : toggles (garde‑fous), sélecteur de mode, import/export.
- Logs : “dernier changement”, “source” (UI / prompt / migration).

## Problèmes potentiels
- Null/undefined sur champs identité → erreurs runtime.
- Conflit de mode (UI vs backend) → divergence de comportement.

## Tests
- Changement de style à chaud : pas de re‑mount destructif.
- Persistance locale : reload app => mêmes paramètres.
- Changement de style à chaud : pas de rechargement complet.
- Persistance : redémarrage = identité intacte.
- Conflit : si backend refuse, UI doit afficher une erreur (zéro silence).
