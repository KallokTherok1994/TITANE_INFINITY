# 🧠 TITANE∞ MEMORY SYSTEM v∞.MPE-Ω

## Architecture de la Mémoire Persistante — Documentation Vivante

> **Version**: v∞.MPE-Ω (Meta-Integrator)
> **Date**: 2025-12-01
> **Statut**: Living Documentation (dev) / Production EN ATTENTE (autorisation)

> NOTE (gouvernance): ce document décrit une architecture; il ne constitue pas une autorisation de déploiement.

---

## 1. Vue d'Ensemble

Le système de mémoire de TITANE∞ est le **cœur de la persistence** de l'OS IA. Il garantit :

- **100% Persistance** : Aucune donnée perdue, même en cas de crash
- **Auto-entretien** : Compression, compaction et nettoyage automatiques
- **Évolutivité** : Migrations versionnées pour évolutions futures
- **Sécurité** : Chiffrement optionnel des données sensibles
- **Observabilité** : Dashboard de santé et métriques en temps réel
- **Auto-réparation** : Self-Healing Engine pour corrections automatiques

### 1.1 Schéma Architectural Global

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         TITANE∞ MEMORY ARCHITECTURE                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   ┌─────────────────────────────────────────────────────────────────────┐   ║
║   │                      FRONTEND (React + TypeScript)                   │   ║
║   │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐   │   ║
║   │  │ TitanState    │  │ useTitanState │  │ MemoryHealthPanel     │   │   ║
║   │  │ Provider      │  │ Hooks         │  │ Dashboard             │   │   ║
║   │  └───────┬───────┘  └───────┬───────┘  └───────────┬───────────┘   │   ║
║   │          │                  │                      │               │   ║
║   │          ▼                  ▼                      ▼               │   ║
║   │  ┌─────────────────────────────────────────────────────────────┐   │   ║
║   │  │              TitanAction → TitanEvent → invoke()            │   │   ║
║   │  └──────────────────────────────┬──────────────────────────────┘   │   ║
║   └─────────────────────────────────┼───────────────────────────────────┘   ║
║                                     │                                        ║
║   ══════════════════════════════════╪════════════════════════════════════   ║
║                           TAURI IPC │                                        ║
║   ══════════════════════════════════╪════════════════════════════════════   ║
║                                     │                                        ║
║   ┌─────────────────────────────────▼───────────────────────────────────┐   ║
║   │                      BACKEND (Rust + Tauri)                          │   ║
║   │                                                                      │   ║
║   │   ┌──────────────────────────────────────────────────────────────┐  │   ║
║   │   │                    SINGULARITY STATE                          │  │   ║
║   │   │  ┌──────────┬──────────┬──────────┬──────────┬──────────┐   │  │   ║
║   │   │  │ Physical │Cognitive │ Symbolic │ Adaptive │   Meta   │   │  │   ║
║   │   │  │  Layer   │  Layer   │  Layer   │  Layer   │  Layer   │   │  │   ║
║   │   │  └──────────┴──────────┴──────────┴──────────┴──────────┘   │  │   ║
║   │   └──────────────────────────────┬───────────────────────────────┘  │   ║
║   │                                  │                                   │   ║
║   │   ┌──────────────────────────────▼───────────────────────────────┐  │   ║
║   │   │                   PERSISTENCE ENGINE                          │  │   ║
║   │   │  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐  │  │   ║
║   │   │  │ Event Log  │  │ Snapshots  │  │    Recovery Engine     │  │  │   ║
║   │   │  │(append-only)│ │ (periodic) │  │ (boot-time recovery)   │  │  │   ║
║   │   │  └─────┬──────┘  └─────┬──────┘  └───────────┬────────────┘  │  │   ║
║   │   │        │               │                     │               │  │   ║
║   │   │        ▼               ▼                     ▼               │  │   ║
║   │   │  ┌────────────────────────────────────────────────────────┐  │  │   ║
║   │   │  │              STORAGE (SQLite / JSON / Files)           │  │  │   ║
║   │   │  └────────────────────────────────────────────────────────┘  │  │   ║
║   │   └──────────────────────────────────────────────────────────────┘  │   ║
║   │                                                                      │   ║
║   │   ┌────────────┬────────────┬────────────┬────────────────────────┐ │   ║
║   │   │ Migrations │Compression │  Backup    │    Memory Doctor       │ │   ║
║   │   │  Engine    │  Engine    │  Engine    │   (Diagnose + Heal)    │ │   ║
║   │   └────────────┴────────────┴────────────┴────────────────────────┘ │   ║
║   │                                                                      │   ║
║   │   ┌────────────┬────────────┬────────────────────────────────────┐  │   ║
║   │   │ Invariants │Memory Health│      Self-Healing Engine          │  │   ║
║   │   │  Engine    │  Engine    │   (Auto-repair + Recovery)         │  │   ║
║   │   └────────────┴────────────┴────────────────────────────────────┘  │   ║
║   │                                                                      │   ║
║   └──────────────────────────────────────────────────────────────────────┘   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### 1.2 Flux de Données Principal

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   UI Event  │───▶│ TitanAction │───▶│ TitanEvent  │───▶│   Tauri     │
│  (click,    │    │  (dispatch) │    │  (payload)  │    │   Command   │
│   input)    │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                │
        ┌───────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Event Log  │───▶│  Snapshot   │───▶│   SQLite    │───▶│   Backup    │
│  (append)   │    │  (periodic) │    │  (storage)  │    │  (.titane)  │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## 2. Architecture Technique

### 2.1 Structures Rust Principales

#### SingularityState (5 Layers)

```rust
pub struct SingularityState {
    pub physical: PhysicalLayer,      // Helios, health, metrics
    pub cognitive: CognitiveLayer,    // Memory, conversation, knowledge
    pub symbolic: SymbolicLayer,      // Persona, archetypes, visual
    pub adaptive: AdaptiveLayer,      // Evolution, learning, auto-heal
    pub meta: MetaLayer,              // UI, runtime, introspection

    pub schema_version: Option<u32>,
    pub timestamp: u64,
    pub signature: String,
}
```

#### TitanEvent (Événement Persisté)

```rust
pub struct TitanEvent {
    pub id: String,           // UUID unique
    pub module: String,       // xp, memory, knowledge, etc.
    pub event_type: String,   // add, update, delete
    pub payload: Value,       // Données JSON
    pub timestamp: u64,       // Timestamp création
    pub applied: bool,        // Déjà appliqué?
}
```

### 2.2 Modules de Persistence

| Module | Fichier | Description |
|--------|---------|-------------|
| **Event Log** | `event_log.rs` | Journal append-only, idempotent |
| **Snapshots** | `snapshot.rs` | États complets périodiques |
| **Database** | `database.rs` | Abstraction stockage |
| **Recovery** | `recovery.rs` | Récupération au boot |
| **Migrations** | `migrations.rs` | Évolution schéma |
| **Compression** | `compression.rs` | Compression cognitive |
| **Backup** | `backup.rs` | Export/Import archives |
| **CryptoStore** | `crypto_store.rs` | Chiffrement (prêt) |
| **MemoryHealth** | `memory_health.rs` | Diagnostic + Self-Healing |
| **Invariants** | `invariants.rs` | Validation + Garde-fous |
| **MemoryDoctor** | `memory_doctor.rs` | Outil diagnostic complet |

### 2.3 Commandes Tauri

#### Core
```
titan_persistence_init, titan_persist_event, titan_force_snapshot
titan_load_state, titan_persistence_shutdown, titan_get_persistence_status
```

#### Migrations & Compression (MPE-2)
```
titan_migrate_state, titan_get_schema_version
titan_compress_memory, titan_compact_journal
```

#### Backup (MPE-2)
```
titan_export_data, titan_validate_archive, titan_import_data
```

#### Health & Self-Healing (MPE-3)
```
titan_get_memory_health, titan_run_self_healing
titan_run_full_integrity_check, titan_validate_invariants
```

#### Memory Doctor (MPE-Ω)
```
titan_memory_doctor_diagnose, titan_memory_doctor_summary
titan_memory_doctor_heal, titan_memory_doctor_compact
```

---

## 3. Flux Principaux

### 3.1 Auto-Save Triggers

```
┌─────────────────────────────────────────────────────────────────┐
│  Timer 30min  │  State Dirty   │  App Shutdown                  │
│               │  (onChange)    │  (close-requested)             │
└───────┬───────┴───────┬────────┴─────────┬─────────────────────┘
        │               │                  │
        └───────────────┼──────────────────┘
                        ▼
               force_snapshot() → Compress → Write to disk
```

### 3.2 Recovery après Crash

```
Boot → Chercher snapshot valide → Charger → Rejouer événements
     → Valider invariants → Si erreurs → Self-Healing
```

### 3.3 Migration de Version

```
Détecter version → Pour chaque v intermédiaire: migrate_vX_to_vY()
                → Mettre à jour schema_version → Sauvegarder
```

---

## 4. Intégration Frontend

### 4.1 TitanStateProvider

Fournit l'état global avec:
- Dispatch avec persistence automatique
- Initialisation au boot
- Auto-save 30 minutes
- Shutdown handler

### 4.2 Hooks Utilitaires

```typescript
useTitanState()      // État complet
useTitanXP()         // XP uniquement
useTitanMemory()     // Mémoire
usePersistenceStatus() // Status persistence
```

### 4.3 Ajouter un Nouveau Module

1. Définir le slice dans `TitanState`
2. Définir les actions dans `TitanAction`
3. Implémenter dans `titanReducer`
4. Créer le hook `useTitan*`
5. Ajouter migration si nouveau champ
6. Ajouter invariants et tests

---

## 5. Self-Healing & Memory Health

### 5.1 Métriques Surveillées

| Métrique | Warning | Critical | Action |
|----------|---------|----------|--------|
| Journal size | > 10MB | > 50MB | Compaction |
| Schema version | < Current | - | Migration |
| Snapshot age | > 30min | > 2h | Force snapshot |
| Backup age | > 7 jours | > 30 jours | Suggestion |

### 5.2 Score de Santé

- 90-100: ✅ Excellent
- 70-89: ⚠️ Attention
- 50-69: 🟠 Problèmes
- < 50: 🔴 Critique

---

## 6. Memory Doctor

Outil de diagnostic complet:

```bash
titan_memory_doctor_diagnose()   # Diagnostic complet
titan_memory_doctor_summary()    # Résumé textuel
titan_memory_doctor_heal()       # Self-Healing
titan_memory_doctor_compact()    # Compacter journal
```

---

## 7. Anti-Patterns à Éviter

```typescript
// ❌ JAMAIS
localStorage.setItem('critical_data', ...)
fs.writeFileSync('data.json', ...)

// ✅ TOUJOURS
dispatch({ type: 'module/action', payload })
await invoke('titan_export_data', { path })
```

---

## 8. Références

- [MEMORY_QA_CHECKLIST.md](./MEMORY_QA_CHECKLIST.md)
- [OPUS_MPE_2_3_REPORT.md](../OPUS_MPE_2_3_REPORT.md)
- [TitanStateContext.tsx](../src/context/TitanStateContext.tsx)
- [persistence/mod.rs](../src-tauri/src/persistence/mod.rs)

---

**Maintenu par**: TITANE Team
**Dernière mise à jour**: 2025-12-01
