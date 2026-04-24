# 06 — MATRICE DES CONTRATS (CHAMP PAR CHAMP)

| Champ affiché        | Signification                       | Source attendue                       | Source réelle                                    | Transformation      | Comportement vide              | Honnête ? | Mise à jour      | Classe           |
| -------------------- | ----------------------------------- | ------------------------------------- | ------------------------------------------------ | ------------------- | ------------------------------ | --------- | ---------------- | ---------------- |
| RSS Initial          | Mémoire RSS au démarrage            | Premier échantillon CSV col[2]        | `initial_rss_mb: 0.0` (fabriqué)                 | aucune              | affiche "0 MB"                 | NON       | à chaque refresh | DEFAULT_FAKE     |
| RSS Actuel           | RSS courant dernier échantillon     | Dernier échantillon CSV col[2]        | `rss_current_mb: 0.0` (fabriqué)                 | aucune              | affiche "0 MB"                 | NON       | à chaque refresh | DEFAULT_FAKE     |
| Croissance           | Delta RSS %                         | Calculé CSV                           | `growth_mb: 0.0, growth_percent: 0.0` (fabriqué) | aucune              | affiche "+0 MB (0.0%)"         | NON       | à chaque refresh | DEFAULT_FAKE     |
| Event Loop Lag       | Lag boucle événements ms            | CSV col[8] opt                        | `None` → non affiché                             | conditionnel        | caché                          | OUI       | à chaque refresh | EMPTY_BUT_HONEST |
| Provider Timeouts/h  | Timeouts fournisseurs               | CSV col[9] opt                        | `None` → non affiché                             | conditionnel        | caché                          | OUI       | à chaque refresh | EMPTY_BUT_HONEST |
| Erreurs              | Compteur d'erreurs                  | CSV col[10] opt                       | `None` → non affiché                             | conditionnel        | caché                          | OUI       | à chaque refresh | EMPTY_BUT_HONEST |
| Dernière mise à jour | Horodatage dernier échantillon      | `lastSample.timestamp`                | `chrono::Utc::now()` au moment de l'appel        | `getTimeAgo()`      | "À l'instant" ou date fabricée | NON       | à chaque refresh | DEFAULT_FAKE     |
| Fenêtre              | Plage temporelle des données        | `windowStartIso` → `windowEndIso` CSV | `Utc::now()` x2 (fabriqué)                       | `formatDateShort()` | dates fabricées                | NON       | à chaque refresh | DEFAULT_FAKE     |
| Échantillons         | Nombre de lignes CSV parsées        | Comptage lignes CSV                   | `samples_collected: 0` (fabriqué)                | aucune              | affiche "0"                    | NON       | à chaque refresh | DEFAULT_FAKE     |
| Badge statut         | État de santé global                | Calculé à partir des seuils RSS       | `status: "UNKNOWN"` (fabriqué)                   | `getStatusLabel()`  | "❓ Inconnu"                   | NON       | à chaque refresh | DEFAULT_FAKE     |
| Source footer        | Déclaration de la source de données | —                                     | Hardcodé "V26 Telemetry"                         | —                   | toujours visible               | PARTIEL   | jamais           | LEGACY_PATH      |
| Action refresh       | Déclencheur de rechargement         | Bouton → loadData()                   | Réel (appelle IPC)                               | —                   | disabled si loading            | OUI       | manuel           | OK_REAL          |

## Notes critiques

1. **samples = 0 affiché** : `DEFAULT_FAKE` — la valeur 0 est injectée par le backend quand le fichier est absent. Ce n'est pas un "zéro observé" mais un "zéro fabriqué".
2. **Timestamps fabriqués** : `DEFAULT_FAKE` — les champs `windowStartIso` et `windowEndIso` sont `Utc::now()` au moment de l'appel IPC. Ils ne représentent aucune donnée réelle.
3. **Footer "V26 Telemetry"** : Label de version du système de collecte. Honnête en soi mais en mismatch avec le titre "V25". Classifié `LEGACY_PATH` car non mis à jour dynamiquement.
4. **Refresh** : Seul champ vraiment fonctionnel. Mais son effet est nul tant que CSV absent car le backend retourne toujours la même fake data.
