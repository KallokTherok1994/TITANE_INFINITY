# 04 — CERTIFICATION DE LA SURFACE VISIBLE

## Zone : Titre de page
- **Contenu** : "Production V25 Week 1"
- **Classification** : LEGACY
- **Motif** : Hardcodé. "V25" désigne la période de déploiement, "V26" désigne le système de télémétrie. Mismatch non résolu, jamais mis à jour dynamiquement.

## Zone : Badge de statut
- **Contenu** : "❓ Inconnu"
- **Classification** : EMPTY_MISLEADING
- **Motif** : L'état UNKNOWN est retourné par le backend quand le CSV est absent. Le badge affiche "Inconnu" mais l'utilisateur ne sait pas POURQUOI (pas de CSV ? IPC mort ? Parser cassé ?).

## Zone : Bloc métriques — RSS Initial
- **Contenu** : 0 MB
- **Classification** : DEFAULT_FAKE
- **Motif** : Zéro fabriqué par le backend quand CSV absent (`initial_rss_mb: 0.0`).

## Zone : Bloc métriques — RSS Actuel
- **Contenu** : 0 MB
- **Classification** : DEFAULT_FAKE
- **Motif** : Idem.

## Zone : Bloc métriques — Croissance
- **Contenu** : +0 MB (0.0%)
- **Classification** : DEFAULT_FAKE
- **Motif** : Calculé sur des zéros → toujours 0.

## Zone : Bloc métriques — Event Loop Lag / Provider Timeouts / Erreurs
- **Contenu** : Non affiché (undefined → caché par condition `!== undefined`)
- **Classification** : EMPTY_HONEST
- **Motif** : Correctement caché quand non disponible. Seul comportement honnête de la page.

## Zone : Timestamps / Fenêtre
- **Contenu** : Dates UTC du moment de l'appel IPC (`chrono::Utc::now()` x2)
- **Classification** : DEFAULT_FAKE
- **Motif** : Le backend injecte `Utc::now()` pour `window_start` et `window_end` quand CSV absent. Ces dates sont fabricées et n'ont aucune signification.

## Zone : Échantillons
- **Contenu** : 0
- **Classification** : DEFAULT_FAKE
- **Motif** : `samples_collected: 0` injecté par le backend quand CSV absent.

## Zone : Source footer
- **Contenu** : "Source: CSV local (Tauri IPC) · V26 Telemetry"
- **Classification** : STALE
- **Motif** : Le footer déclare "V26 Telemetry" tandis que le titre dit "V25". Mismatch de version non résolu. De plus, le footer dit "CSV local" mais le CSV n'existe pas — information incorrecte dans l'état actuel.

## Zone : Bouton Refresh
- **Contenu** : "🔄 Actualiser"
- **Classification** : REAL
- **Motif** : Le bouton appelle bien `refresh()` → `loadData()` → IPC. Mais le résultat reste le même (CSV absent).

## Zone : Bandeau jaune / Notes
- **Contenu** : "Waiting for observation data..."
- **Classification** : EMPTY_MISLEADING
- **Motif** : Le texte est injecté dans `data.notes` par le backend et rendu dans `ph-notes`. L'utilisateur voit un bandeau mais ne sait pas si c'est un état normal d'attente ou une erreur de configuration.

---

## Synthèse

| Zone | Classification |
|---|---|
| Titre | LEGACY |
| Badge | EMPTY_MISLEADING |
| RSS Initial | DEFAULT_FAKE |
| RSS Actuel | DEFAULT_FAKE |
| Croissance | DEFAULT_FAKE |
| Event Loop Lag / Timeouts / Erreurs | EMPTY_HONEST |
| Timestamps/Fenêtre | DEFAULT_FAKE |
| Échantillons | DEFAULT_FAKE |
| Source footer | STALE |
| Refresh | REAL |
| Notes/Bandeau | EMPTY_MISLEADING |

**Conclusion** : La surface visible est massivement composée de données fabriquées (DEFAULT_FAKE) et d'états trompeurs (EMPTY_MISLEADING). Elle ne peut pas passer pour une surface réelle.
