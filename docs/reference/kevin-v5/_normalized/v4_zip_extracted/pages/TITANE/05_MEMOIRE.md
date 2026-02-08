# TITANE — Mémoire

## Statut
- Pill **Mémoire** visible dans TITANE.
- Dans STATS : “Memory Engine” apparaît avec indicateurs parfois `UNKNOWN`/`NaN` → risque de modèle de données incomplet ou de métriques non initialisées.

## Rôle produit (cible)
Interface de **gestion de mémoire locale** :
- STM (court terme), MTM, LTM (long terme)
- sources : conversations, fichiers, notes
- tags/collections, recherche, export/import

## UI attendue
- Recherche + filtres (période, conversation, type, tag)
- Liste d’items (résumé, provenance, confiance)
- Vue détail (contenu, liens, embeddings, métadonnées)
- Actions : pin, archiver, fusionner, supprimer, reconstruire index

## Risques & blocages
- Schéma partiel (undefined) → crashes type `t.meta.metrics.level`.
- Indexation longue → UI gel ; prévoir progress + cancel.
- Conflit multi‑conversations : collisions d’IDs si conversation_id instable.

## Tests
- Mémoire vide / pleine ; cold start ; migration version.
- Export/import : round‑trip sans perte.
- Recherche : requêtes rapides + grosses charges.

## UI attendue
- Recherche globale + filtres (scope, date, conversation, type, tag).
- Liste d’items (cards) avec : titre, extrait, source, date, score.
- Détail : contenu complet, liens, actions (pin, merge, delete, redact).
- Outils : “compact”, “reindex”, “health check”, “export JSONL”.

## Warnings / blocages potentiels
- Schéma non versionné → migrations cassantes → `undefined` à l’exécution.
- Indexation async sans watchdog → UI qui charge sans fin.
- Opérations destructrices sans confirmation/rollback.

## Tests
- Démarrage : mémoire vide vs mémoire volumineuse.
- Reindex : pas de freeze UI; progression visible.
- Export : integrity (hash) + conformité append-only si registry.
- Indexation async sans watchdog UI → impression de freeze.
- Effacement non confirmé → perte de données.

## Tests recommandés
- Remplissage (10k items) : recherche, pagination, perf.
- Corruption (item manquant champs) : fallback + affichage erreur.
- Redémarrage : cohérence STM/MTM/LTM.
