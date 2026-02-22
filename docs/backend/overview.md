# 🎯 TITANE∞ Backend — Vue d'Ensemble (101)

**Tu es ici pour comprendre le backend TITANE∞ sans te brûler les neurones.**

Temps de lecture : 10 minutes.
Niveau : Développeur Rust/Tauri débutant → confirmé.

---

## 🌟 Vision

TITANE∞ est une **plateforme cognitive locale** (pas de cloud) qui :

- Tourne sur ta machine (React + Tauri v2 + Rust async)
- S'auto-surveille (Helios, Harmonia, Sentinel)
- S'auto-répare (SelfHeal Engine Phase 3)
- Stocke tout en local (Memory Core JSON)
- S'adapte à ton utilisation (Nexus, évolution)

**Objectif** : Une IA locale robuste, évolutive, et respectueuse de ta vie privée.

---

## 🏗️ Architecture en 3 Couches

```
┌─────────────────────────────────────────────────┐
│         FRONTEND (React 18 + Vite 6)            │
│         TypeScript + Tailwind + Zustand         │
└────────────────────┬────────────────────────────┘
                     │ tauri::invoke()
                     │ (IPC JSON)
┌────────────────────▼────────────────────────────┐
│          API LAYER (Tauri Commands)             │
│  30+ commandes exposées au frontend             │
│  Validation, routing, erreurs structurées       │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│         BUSINESS LOGIC (Core + Engine)          │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  CORE (5)    │  │  ENGINE (4)  │            │
│  │              │  │              │            │
│  │  • Helios    │  │  • AutoEvol  │            │
│  │  • Nexus     │  │  • Diagnost  │            │
│  │  • Harmonia  │  │  • Repair    │            │
│  │  • Sentinel  │  │  • HealthChk │            │
│  │  • Memory    │  │              │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  Services : System, IO, Storage, Security       │
└──────────────────────────────────────────────────┘
```

### Couche 1 : Frontend (hors scope backend)
React 18 + Vite qui communique avec Tauri via `invoke()`.

### Couche 2 : API Layer
**Fichiers** : `src-tauri/src/api/*.rs`

30+ commandes Tauri (`#[tauri::command]`) :
- `get_helios_state()` → État système CPU/RAM
- `write_snapshot()` → Sauvegarde mémoire
- `run_evolution()` → Lance auto-évolution
- etc.

**Rôle** :
- Validation inputs
- Routing vers Core/Engine/Services
- Gestion erreurs (`AppResult<T>`)
- Sérialisation JSON (serde)

### Couche 3 : Business Logic
**Core Modules** (5 noyaux) :
- **Helios** : Monitoring système (CPU, RAM, Disk)
- **Nexus** : Cohérence globale, priorisation
- **Harmonia** : Équilibrage charge CPU/RAM
- **Sentinel** : Sécurité, anomalies, logs
- **Memory** : Persistence JSON (snapshots, timeline, logs)

**Engine Modules** (4) :
- **AutoEvolution** : Amélioration continue du système
- **Diagnostics** : Scan des problèmes
- **Repair** : Auto-réparation
- **HealthCheck** : Vérification santé globale

**Services** (4) :
- **System** : Métriques OS (via `sysinfo`)
- **IO** : Fichiers, chemins
- **Storage** : JSON CRUD (avec `StorageGuard` v17.3.0)
- **Security** : ShellGuard + StorageGuard (v17.3.0)

---

## 📂 Structure des Dossiers

```
src-tauri/src/
  ├── main.rs              → Point d'entrée Tauri
  │
  ├── app/                 → Setup application
  │   ├── setup.rs         → Initialisation TitaneApp
  │   └── main_loop.rs     → Boucle principale (si besoin)
  │
  ├── api/                 → Commandes Tauri (30+)
  │   ├── helios_api.rs    → get_helios_state, get_system_health
  │   ├── memory_api.rs    → write_snapshot, read_logs, etc.
  │   ├── engine_api.rs    → run_evolution, quick_health_check
  │   ├── system_api.rs    → System-level commands
  │   └── legacy_commands.rs → DEPRECATED (v17.2.1)
  │
  ├── core/                → Noyaux (5)
  │   ├── helios.rs        → Monitoring système
  │   ├── nexus.rs         → Cohérence globale
  │   ├── harmonia.rs      → Charge CPU/RAM
  │   ├── sentinel.rs      → Sécurité, logs
  │   └── memory.rs        → Persistence JSON
  │
  ├── engine/              → Auto-évolution (4)
  │   ├── auto_evolution.rs → Amélioration continue
  │   ├── diagnostics.rs    → Scan problèmes
  │   ├── repair.rs         → Réparations
  │   └── health_check.rs   → Vérifications
  │
  ├── services/            → Services métier (4)
  │   ├── system_service.rs → sysinfo wrapper
  │   ├── io_service.rs     → Fichiers, paths
  │   └── storage_service.rs → JSON CRUD sécurisé
  │
  ├── security/            → Guards (v17.3.0)
  │   ├── mod.rs           → Types sécurité
  │   ├── shell_guard.rs   → Protection shell commands
  │   └── storage_guard.rs → Protection filesystem
  │
  ├── types/               → Tous les types (30+)
  │   ├── shared.rs        → Types unifiés (v17.3.0)
  │   ├── helios.rs        → HeliosState, SystemMetrics
  │   ├── memory.rs        → MemorySnapshot, LogEntry
  │   ├── engine.rs        → EvolutionState, DiagResult
  │   └── ...              → etc.
  │
  └── utils/               → Utilitaires (3)
      ├── error.rs         → AppError, AppResult
      ├── logger.rs        → Logging structuré
      └── constants.rs     → Constantes globales
```

---

## 🔄 Flux de Données Typique

### Exemple : Récupérer l'état Helios

```
┌────────────┐
│  Frontend  │
│            │  1. invoke('get_helios_state')
└─────┬──────┘
      │
      ▼
┌────────────────────────────┐
│  api/helios_api.rs         │
│  #[tauri::command]         │  2. Route vers HeliosCore
│  get_helios_state(app)     │
└──────────┬─────────────────┘
           │
           ▼
┌──────────────────────────┐
│  core/helios.rs          │
│  HeliosCore::collect()   │  3. Appelle SystemService
└──────────┬───────────────┘
           │
           ▼
┌───────────────────────────┐
│  services/system_service  │
│  SystemService::metrics() │  4. Lit CPU/RAM/Disk
└──────────┬────────────────┘
           │
           ▼
┌──────────────────────┐
│  HeliosState struct  │  5. Retour structuré
│  { cpu, ram, disk }  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────┐
│  JSON Response   │  6. Sérialisation serde
│  → Frontend      │
└──────────────────┘
```

### Points Clés

1. **Validation d'entrée** : Fait dans l'API layer
2. **Logique métier** : Dans Core/Engine, jamais dans API
3. **Gestion d'erreur** : `AppResult<T>` partout
4. **Async** : Toutes les opérations IO sont `async` (tokio)
5. **Thread-safe** : `Arc<RwLock<T>>` pour état partagé

---

## 🧠 Les 5 Noyaux Expliqués

### 1. **Helios Core** — "Le Moniteur"
**Responsabilité** : Métriques système temps réel

```rust
pub struct HeliosCore {
    system: SystemService,
}

// Retourne :
HeliosState {
    cpu_usage: 45.2,      // %
    ram_usage: 6.8,       // GB
    ram_total: 16.0,      // GB
    disk_usage: 234.5,    // GB
    disk_total: 500.0,    // GB
    timestamp: 1732267890,
}
```

**Utilisation** : Dashboard système, alertes overload

---

### 2. **Nexus** — "Le Coordinateur"
**Responsabilité** : Cohérence globale, priorisation

```rust
pub struct Nexus {
    priorities: Vec<Task>,
    coherence_score: f64,
}
```

**Rôle** :
- Éviter les conflits entre modules
- Prioriser les tâches (urgent vs. important)
- Garantir la cohérence des états

**Utilisation** : Orchestration Engine, résolution conflits

---

### 3. **Harmonia** — "L'Équilibreur"
**Responsabilité** : Charge CPU/RAM, modes adaptatifs

```rust
pub struct Harmonia {
    target_cpu: f64,   // % CPU cible
    target_ram: f64,   // GB RAM cible
    mode: Mode,        // Normal, Eco, Safe
}
```

**Modes** :
- **Normal** : Performance standard
- **Eco** : Économie CPU (jobs ralentis)
- **Safe** : Mode minimal (problèmes détectés)

**Utilisation** : Scheduler, throttling auto

---

### 4. **Sentinel** — "Le Gardien"
**Responsabilité** : Sécurité, anomalies, logs

```rust
pub struct Sentinel {
    log_buffer: Vec<LogEntry>,
    anomalies: Vec<Anomaly>,
}
```

**Fonctions** :
- Détection d'anomalies (usage anormal, crashes)
- Logging structuré (domain, level, message)
- Sanitization (texte, paths)

**Utilisation** : Debug, audit, alertes

---

### 5. **Memory Core** — "L'Archiviste"
**Responsabilité** : Persistence JSON locale

```rust
pub struct MemoryCore {
    storage: StorageService,
    snapshots: Vec<MemorySnapshot>,
}
```

**Structures** :
- **Snapshots** : États complets à un instant T
- **Logs** : Événements chronologiques
- **Timeline** : Historique des actions

**Utilisation** : Sauvegarde/restauration, analyse historique

---

## ⚙️ Engine : Auto-Évolution & Self-Healing

### AutoEvolution
**Objectif** : Améliorer le système au fil du temps

**Phases** :
1. Analyse de l'utilisation
2. Détection des inefficacités
3. Proposition d'améliorations
4. Application (avec validation)

### Diagnostics
**Objectif** : Scanner les problèmes système

**Checks** :
- Intégrité fichiers Memory
- État des noyaux (Helios, etc.)
- Performance (CPU/RAM anormale)
- Logs d'erreurs récents

### Repair
**Objectif** : Réparer automatiquement

**Actions** :
- Reconstruction Memory corrompue
- Reset de noyaux bloqués
- Nettoyage des fichiers temp
- Rotation logs

### HealthCheck
**Objectif** : Vérification rapide santé

**Types** :
- **Quick** : 2-3 secondes (checks basiques)
- **Full** : 15-30 secondes (scan complet)

---

## 🔒 Sécurité (v17.3.0)

### ShellGuard
**Protection** : Exécution commandes shell

**Whitelist** : espeak, festival, piper, whisper, pactl, which

**Validation** :
- Commande dans whitelist
- Arguments sans `|;&$`
- Sanitization texte (TTS)

### StorageGuard
**Protection** : Accès filesystem

**Sandbox** : `TITANE_DATA_ROOT` (ex: `~/.local/share/titane-infinity`)

**Validation** :
- Pas de path traversal (`..`)
- Pas de null bytes
- Canonicalization + starts_with

**API** :
- `safe_read()`, `safe_write()`, `safe_delete()`, `safe_list_dir()`

---

## 🚀 Démarrage Rapide

### 1. Installation
```bash
# Dépendances
node >= 20
npm >= 10
rust >= 1.70
tauri-cli >= 2.0

# Installer
pnpm install
```

### 2. Lancer en Dev
```bash
pnpm run dev:tauri
# ou
pnpm run dev  # Lance aussi le frontend
```

### 3. Vérifier la Santé
```bash
pnpm run verify          # Global
pnpm run verify:backend  # Backend seul (à créer)
```

### 4. Build Production
```bash
GO_FOR_PROD_BUILD__TITANE_INFINITY=YES corepack pnpm exec tauri build --config src-tauri/tauri.conf.json
```

---

## 📊 Métriques Importantes

| Métrique | Valeur Cible | Critique si |
|----------|--------------|-------------|
| CPU Usage | < 30% idle | > 80% constant |
| RAM Usage | < 50% | > 90% |
| Disk Usage | < 80% | > 95% |
| Response Time (API) | < 100ms | > 1000ms |
| Memory Snapshots | < 50 MB/snapshot | > 200 MB |

---

## 🧪 Tests

### Unitaires
```bash
cd src-tauri
cargo test
```

### Sécurité
```bash
cargo test --test security_tests
```

### Intégration
```bash
pnpm run test:integration  # À créer
```

---

## 📚 Prochaines Lectures

**Tu as compris les bases ? Super !**

Maintenant :

1. **Architecture détaillée** → [architecture.md](./architecture.md)
2. **API Tauri complète** → [api-tauri.md](./api-tauri.md)
3. **Contribuer** → [contribution-guide.md](./contribution-guide.md)

---

## 🤔 FAQ

**Q : Pourquoi Rust + Tauri ?**
R : Performance native, sécurité mémoire, pas de runtime Node côté desktop.

**Q : Pourquoi tout en local ?**
R : Vie privée, offline-first, latence zéro.

**Q : C'est compliqué ?**
R : Non. C'est structuré. Lis la doc dans l'ordre, ça rentre.

**Q : Puis-je ajouter un noyau ?**
R : Oui, voir [contribution-guide.md](./contribution-guide.md).

---

**TITANE∞** — *"Comprendre pour construire, construire pour évoluer."*
