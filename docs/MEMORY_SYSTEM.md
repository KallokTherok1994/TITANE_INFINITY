# 🧠 TITANE∞ MEMORY SYSTEM v∞.MPE-2/3

## Architecture de la Mémoire Persistante

> **Version**: v∞.MPE-2/3
> **Date**: 2025-12-01
> **Statut**: Production Ready

---

## 1. Vue d'Ensemble

Le système de mémoire de TITANE∞ est conçu pour être:

- **100% Persistant**: Aucune donnée perdue, même en cas de crash
- **Auto-entretenu**: Compression, compaction et nettoyage automatiques
- **Évolutif**: Migrations versionnées pour évolutions futures
- **Sécurisé**: Chiffrement optionnel des données sensibles
- **Observable**: Dashboard de santé et métriques en temps réel
- **Auto-réparable**: Self-Healing Engine pour corrections automatiques

---

## 2. Composants Principaux

### 2.1 Event Log (Append-Only)

```
src-tauri/src/persistence/event_log.rs
```

Journal d'événements immuable:
- Chaque action utilisateur → événement persisté
- Idempotence via UUID unique
- Rotation automatique en mémoire (max 10k events)

**Modules événementiels**:
- `xp`: Points d'expérience
- `memory`: Mémoires/connaissances
- `progress`: Progression/niveaux
- `knowledge`: Base de connaissances
- `settings`: Configuration
- `console`: Logs internes
- `agenda`: Tâches/événements

### 2.2 Snapshots

```
src-tauri/src/persistence/snapshot.rs
```

État complet périodique:
- Compression GZip
- Checksum SHA256 pour intégrité
- Version du schéma incluse

**Stratégie**:
- Auto-save: toutes les 30 minutes
- Au shutdown propre
- Sur changement de données critiques

### 2.3 Recovery Engine

```
src-tauri/src/persistence/recovery.rs
```

Récupération au démarrage:
1. Charger dernier snapshot valide
2. Rejouer événements postérieurs
3. Valider invariants
4. Réparer si nécessaire

---

## 3. Modules MPE-2 (Long Terme)

### 3.1 Migrations de Schéma

```
src-tauri/src/persistence/migrations.rs
```

**Version actuelle**: `CURRENT_SCHEMA_VERSION = 2`

**Pipeline**:
```rust
migrate_to_current(state) → Result<SingularityState>
  → v1 → v2: schema_version, created_at, last_migrated_at
  → v2 → v3: (futur)
```

**Invariants**:
- `schema_version` toujours présent
- Migration testée unitairement
- Rollback possible via backup

### 3.2 Compression Cognitive

```
src-tauri/src/persistence/compression.rs
```

Compression des données anciennes:
- Seuil: 30 jours par défaut
- Minimum: 100 items avant compression
- Résumés structurés: thèmes, points clés, contexte

**Types de résumés**:
- `CognitiveSummary`: Résumé d'une période
- `Theme`: Thème extrait (nom, poids, occurrences)
- `KeyPoint`: Point clé (contenu, importance, timestamp)

### 3.3 Backup/Export/Import

```
src-tauri/src/persistence/backup.rs
```

**Format archive**: `.titane` (header + metadata JSON + données GZip)

**Export**:
```typescript
await invoke('titan_export_data', {
  path: '/chemin/backup.titane',
  description: 'Mon backup'
});
```

**Import**:
```typescript
await invoke('titan_import_data', {
  path: '/chemin/backup.titane',
  mode: 'replace' // ou 'merge'
});
```

**Validation**:
```typescript
const result = await invoke('titan_validate_archive', { path });
// { is_valid, compatible_version, compatible_schema, integrity_ok }
```

### 3.4 Crypto Store

```
src-tauri/src/persistence/crypto_store.rs
```

Architecture prête pour chiffrement:
- PBKDF2-SHA256 pour dérivation de clé
- AES-256-GCM prévu (actuellement XOR placeholder)
- Clé jamais stockée, dérivée du mot de passe

**Usage** (futur):
```rust
CRYPTO_STORE.write().set_master_password("secret")?;
let encrypted = crypto_store.encrypt_blob(data)?;
let decrypted = crypto_store.decrypt_blob(&encrypted)?;
```

---

## 4. Modules MPE-3 (Fiabilité Absolue)

### 4.1 Memory Health Engine

```
src-tauri/src/persistence/memory_health.rs
```

Dashboard de santé:
- Score global (0-100)
- Problèmes détectés (Critical, Warning, Info)
- Recommandations priorisées

**Commande Tauri**:
```typescript
const health = await invoke<MemoryHealth>('titan_get_memory_health');
```

**Seuils par défaut**:
- Journal > 10MB: Warning
- Journal > 50MB: Critical
- Snapshot > 30min: Recommandation
- Backup > 7 jours: Recommandation

### 4.2 Self-Healing Engine

Corrections automatiques:
1. Détection des problèmes
2. Actions auto-réparables identifiées
3. Exécution séquentielle
4. Rapport de résultat

**Commande**:
```typescript
const report = await invoke<SelfHealingReport>('titan_run_self_healing');
```

**Actions supportées**:
- `titan_compact_journal`: Compacter le journal
- `titan_repair_integrity`: Réparer l'intégrité DB
- `titan_migrate_state`: Migration de schéma (manuel)

### 4.3 Invariants Engine

```
src-tauri/src/persistence/invariants.rs
```

Validation des contraintes:
- `schema_version`: présent et valide
- `timestamp`: pas dans le futur
- Layers obligatoires: physical, cognitive, symbolic, adaptive, meta
- Cohérence des dates

**Modes**:
- `Strict`: Toute violation = erreur
- `Lenient`: Certaines violations = warnings
- `Recovery`: Tente de réparer

**Commande**:
```typescript
const result = await invoke('titan_validate_invariants', {
  stateJson: JSON.stringify(state),
  strict: true
});
```

---

## 5. Commandes Tauri

### Core
| Commande | Description |
|----------|-------------|
| `titan_persistence_init` | Initialiser le moteur |
| `titan_persist_event` | Persister un événement |
| `titan_force_snapshot` | Créer un snapshot |
| `titan_load_state` | Charger l'état |
| `titan_persistence_shutdown` | Shutdown propre |

### MPE-2
| Commande | Description |
|----------|-------------|
| `titan_migrate_state` | Migrer vers version actuelle |
| `titan_get_schema_version` | Version du schéma |
| `titan_export_data` | Exporter archive |
| `titan_validate_archive` | Valider archive |
| `titan_import_data` | Importer archive |
| `titan_compact_journal` | Compacter le journal |

### MPE-3
| Commande | Description |
|----------|-------------|
| `titan_get_memory_health` | État de santé |
| `titan_run_self_healing` | Lancer Self-Healing |
| `titan_validate_invariants` | Valider invariants |
| `titan_run_full_integrity_check` | Check complet |
| `titan_dump_raw_state` | Dump JSON (debug) |
| `titan_reset_module` | Reset module (TODO) |

---

## 6. Diagnostic et Dépannage

### Problème: État corrompu au démarrage

1. Vérifier les logs Tauri
2. Exécuter: `titan_run_full_integrity_check`
3. Si échec: `titan_run_self_healing`
4. En dernier recours: Restaurer un backup

### Problème: Journal trop volumineux

1. Vérifier: `titan_get_memory_health` → `event_log_size_bytes`
2. Exécuter: `titan_compact_journal`
3. Configurer des seuils de compression plus agressifs

### Problème: Migration échouée

1. Sauvegarder l'état actuel (export)
2. Vérifier les logs de migration
3. Appliquer manuellement les migrations manquantes
4. Restaurer si nécessaire

### Problème: Données perdues

1. Vérifier les backups dans ~/Documents/TITANE_INFINITY_Backups/
2. Valider l'archive: `titan_validate_archive`
3. Importer en mode `merge` pour récupérer

---

## 7. Tests

### Tests Rust
```bash
cd src-tauri
cargo test --lib -- persistence::
```

### Tests Unitaires
- `migrations::tests` - Pipeline de migration
- `compression::tests` - Compression cognitive
- `invariants::tests` - Validation des invariants
- `backup::tests` - Export/Import

### Tests d'Intégration
1. Créer état v1
2. Ajouter 1000 événements
3. Créer snapshots
4. Simuler crash
5. Redémarrer et vérifier recovery
6. Migrer vers v2
7. Exporter/Importer
8. Valider état final

---

## 8. Feuille de Route

### v∞.MPE-2.1
- [ ] Implémentation SQLite réelle (rusqlite)
- [ ] Compression cognitive par LLM local
- [ ] Chiffrement AES-256-GCM complet

### v∞.MPE-3.1
- [ ] Tests de stress automatisés
- [ ] Métriques Prometheus
- [ ] Dashboard graphique temps réel
- [ ] Reset par module

### v∞.MPE-4
- [ ] Synchronisation multi-devices
- [ ] Backup cloud chiffré
- [ ] Versioning Git-like des états

---

## 9. Références

- [OPUS v∞.MPE](../OPUS_MPE_REPORT.md) - Architecture de base
- [OPUS v∞.MPE-2](../OPUS_MPE_2_REPORT.md) - Long terme
- [OPUS v∞.MPE-3](../OPUS_MPE_3_REPORT.md) - Fiabilité
- [Architecture TITANE∞](../ARCHITECTURE.md) - Vue globale

---

**Maintenu par**: TITANE Team
**Contact**: Voir LICENSE.md
