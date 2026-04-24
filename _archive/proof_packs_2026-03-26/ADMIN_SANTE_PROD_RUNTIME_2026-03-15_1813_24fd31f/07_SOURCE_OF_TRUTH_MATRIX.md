# 07 — MATRICE SOURCE DE VÉRITÉ

## Candidats identifiés

### 1. CSV `/tmp/titane_production_week1.csv`

- **Contenu** : Lignes TSV/CSV : timestamp, ?, rss_mb, vsz_mb, cpu_pct, session_count, crash_count, failover_count, event_loop_lag_ms, provider_timeouts_per_hour, error_count
- **Mode de fraîcheur** : Fichier externe, alimenté par un processus de collecte tiers (inconnu — non découvert dans ce codebase)
- **Niveau d'autorité** : PRIMAIRE — seule vraie source d'observation
- **Preuve** : `telemetry_api.rs` lit ce chemin
- **Faiblesses** : Fichier /tmp → volatil, disparaît au redémarrage. Processus de collecte non inclus dans ce repo.
- **Risque de dérive** : ÉLEVÉ — dépend d'un producteur externe non contrôlé

### 2. Backend Rust (in-memory aggregation dans `read_production_week1_csv`)

- **Contenu** : Agrégation à la demande du CSV
- **Mode de fraîcheur** : Snapshot à chaque appel IPC
- **Niveau d'autorité** : ADAPTATEUR — transforme le CSV en summary
- **Preuve** : `telemetry_api.rs::parse_and_summarize()`
- **Faiblesses** : Actuellement retourne un fake Ok quand CSV absent — **BRISÉ**
- **Risque de dérive** : ÉLEVÉ — fake fallback masque les erreurs

### 3. Tauri IPC command `read_production_week1_csv`

- **Contenu** : Enveloppe IPC → renvoie `ProductionHealthSummary`
- **Mode de fraîcheur** : Synchrone sur demande
- **Niveau d'autorité** : TRANSPORT — couche de communication
- **Preuve** : `src-tauri/src/main.rs:1341`, `tauriCommands.ts:62`
- **Faiblesses** : Pas de gestion d'erreur classifiée côté frontend
- **Risque de dérive** : MOYEN

### 4. Fixture / mock statique

- **Contenu** : Aucune fixture trouvée pour ProductionHealthPanel
- **Niveau d'autorité** : N/A — non utilisé

---

## Décision : source canonique par métrique

| Métrique          | Source canonique retenue                                               |
| ----------------- | ---------------------------------------------------------------------- |
| RSS Initial       | Première ligne CSV col[2] (via Rust aggregator)                        |
| RSS Actuel        | Dernière ligne CSV col[2] (via Rust aggregator)                        |
| Croissance        | Calculé par Rust aggregator à partir CSV                               |
| Event Loop Lag    | CSV col[8] opt                                                         |
| Provider Timeouts | CSV col[9] opt                                                         |
| Erreurs           | CSV col[10] opt                                                        |
| Timestamps        | Horodatages issus des lignes CSV (col[0]) — jamais Utc::now() fabriqué |
| Échantillons      | Comptage réel des lignes CSV parsées                                   |
| Statut            | Calculé par Rust sur données réelles uniquement                        |

**Règle** : Si CSV absent → `Err("SOURCE_UNAVAILABLE")`. Jamais de zéros fabriqués.
