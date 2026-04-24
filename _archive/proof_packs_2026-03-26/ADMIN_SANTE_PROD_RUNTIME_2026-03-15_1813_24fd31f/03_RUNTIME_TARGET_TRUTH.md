# 03 — VÉRITÉ DE LA CIBLE RUNTIME

**Statut** : TARGET_CONFIRMED (source) · STALE_ARTIFACT absent de la chaîne active

---

## Localisation des strings symptômes

### "Santé Prod (V25)"

- **Source** : `src/features/admin/types.ts` ligne 61 — `label: 'Santé Prod (V25)'`
- Artifact compilé : `dist/assets/index-*.js` (présent mais pas actif en dev)

### "Production V25 Week 1"

- **Source** : `src/features/production-health/ProductionHealthPanel.tsx` — hardcodé dans `renderContent()` → `<h3 className="ph-title">Production V25 Week 1</h3>`

### "Waiting for observation data..."

- **Source** : `src-tauri/src/api/telemetry_api.rs` ligne ~67 — `notes: Some("Waiting for observation data...".to_string())` injecté dans le champ `notes` du faux `Ok()` retourné quand le CSV est absent

### "Source: CSV local (Tauri IPC) · V26 Telemetry"

- **Source** : `src/features/production-health/ProductionHealthPanel.tsx` — hardcodé dans `renderContent()` → `<p className="ph-source">Source: CSV local (Tauri IPC) · V26 Telemetry</p>`

### "Inconnu"

- **Source** : `src/features/production-health/ProductionHealthPanel.tsx` — `getStatusLabel()` retourne `'❓ Inconnu'` pour `status === 'UNKNOWN'`. Ce statut vient du backend quand CSV absent.

---

## Preuve de la cible runtime active

| Critère                                | Valeur                           | Preuve                                                 |
| -------------------------------------- | -------------------------------- | ------------------------------------------------------ |
| Binaire de production                  | Non actif (Tauri non lancé)      | audit code source uniquement                           |
| Source code HEAD                       | 24fd31fc4                        | `git rev-parse --short HEAD`                           |
| CSV `/tmp/titane_production_week1.csv` | **ABSENT**                       | `ls /tmp/titane_production_week1.csv` → `No such file` |
| Runtime cible                          | Source/dev (code source courant) | FILES correlés avec strings symptômes                  |

---

## Corrélation markers visibles ↔ source

| Marker visible               | Fichier source                                 | Ligne  | Corrélation                |
| ---------------------------- | ---------------------------------------------- | ------ | -------------------------- |
| "Santé Prod (V25)"           | `src/features/admin/types.ts`                  | 61     | DIRECTE                    |
| "Production V25 Week 1"      | `ProductionHealthPanel.tsx`                    | ~90    | DIRECTE                    |
| badge "Inconnu"              | `ProductionHealthPanel.tsx` `getStatusLabel()` | ~36    | DIRECTE                    |
| "Waiting for observation..." | `telemetry_api.rs`                             | ~67    | DIRECTE (via `data.notes`) |
| "V26 Telemetry"              | `ProductionHealthPanel.tsx`                    | ~160   | DIRECTE                    |
| samples = 0                  | `telemetry_api.rs` `samples_collected: 0`      | ~70    | DIRECTE                    |
| métriques = 0                | `telemetry_api.rs` `initial_rss_mb: 0.0` etc.  | ~55–70 | DIRECTE                    |

---

## Conclusion

**TARGET_CONFIRMED** — La cible runtime est le code source courant (24fd31fc4). Tous les markers symptômes sont tracés vers leurs fichiers source exacts. Aucun artifact stale n'est actif dans le contexte analysé.

**Cause confirmée** : Le backend Rust retourne un `Ok()` avec des zéros fabriqués et `status: "UNKNOWN"` lorsque le fichier `/tmp/titane_production_week1.csv` est absent. Ce faux succès traverse la garde TypeScript et l'UI affiche un panneau complet avec des données invalides.
