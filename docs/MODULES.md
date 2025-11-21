# Guide des Modules TITANE∞ v8.0

## 🧩 Vue d'Ensemble

TITANE∞ est composé de **8 modules autonomes** qui travaillent ensemble pour créer un système cognitif adaptatif.

---

## ☀️ HELIOS - System Monitor

### 🎯 Objectif
Surveillance en temps réel des ressources système (CPU, mémoire, disque).

### 📊 Métriques Collectées
- **CPU Usage** : Pourcentage d'utilisation processeur
- **Memory Usage** : Pourcentage RAM utilisée
- **Disk Usage** : Pourcentage disque utilisé
- **Uptime** : Temps actif du système

### 🔄 Cycle de Vie
```rust
init()  → Initialisation capteurs
  ↓
start() → Activation monitoring
  ↓
tick()  → Collecte métriques (2s)
  ↓
health() → État du module
```

### 📈 Status Health
- **Healthy** : CPU < 70%, MEM < 70%
- **Degraded** : CPU 70-90%, MEM 70-90%
- **Critical** : CPU > 90%, MEM > 90%

### 🔌 API Frontend
```typescript
const metrics = await invoke<string>('helios_get_metrics');
const data = JSON.parse(metrics);
// { cpu_usage, memory_usage, disk_usage, uptime }
```

---

## 🔗 NEXUS - Cognitive Graph

### 🎯 Objectif
Gestion du graphe de connaissances et des connexions cognitives.

### 🌐 Structure
```rust
CognitiveNode {
    id: String,
    node_type: String,
    connections: Vec<String>,
    weight: f32,
}
```

### 🔄 Cycle de Vie
```rust
init()      → Création graphe initial (node "root")
  ↓
start()     → Activation du système
  ↓
tick()      → Mise à jour des connexions
  ↓
get_graph() → Export JSON du graphe
```

### 📊 Métriques
- Nombre de nœuds
- Nombre de connexions
- Poids moyens

### 🔌 API Frontend
```typescript
const graph = await invoke<string>('nexus_get_graph');
const data = JSON.parse(graph);
// { nodes: [...], connections: number }
```

---

## 🎼 HARMONIA - Orchestrator

### 🎯 Objectif
Orchestration des processus et synchronisation des modules.

### 📊 Métriques
- **Active Processes** : Nombre de processus actifs
- **Sync Rate** : Taux de synchronisation (%)

### 🔄 Rôle
- Coordination inter-modules
- Gestion des dépendances
- Ordonnancement des tâches
- Équilibrage de charge

### 📈 Status Health
- **Healthy** : Sync Rate > 50%
- **Degraded** : Sync Rate < 50%

---

## 🛡️ SENTINEL - Security Monitor

### 🎯 Objectif
Surveillance de la sécurité et détection des menaces.

### 🔐 Niveaux de Sécurité
```rust
enum SecurityLevel {
    Normal,    // Aucune menace
    Elevated,  // Vigilance accrue
    High,      // Menace détectée
}
```

### 🔍 Surveillance
- Tentatives d'accès non autorisées
- Comportements anormaux
- Intégrité des modules
- Validation des entrées

### 📈 Status Health
- **Healthy** : SecurityLevel::Normal
- **Degraded** : SecurityLevel::Elevated
- **Critical** : SecurityLevel::High

---

## 🐕 WATCHDOG - System Health

### 🎯 Objectif
Logging système et surveillance continue de la santé globale.

### 📝 Logging
```rust
struct LogEntry {
    timestamp: u64,
    level: LogLevel,     // Info, Warning, Error, Critical
    module: String,
    message: String,
}
```

### 💾 Capacité
- **Max Logs** : 1000 entrées
- **Rotation** : FIFO (First In First Out)

### 🔄 Cycle
```rust
init()      → Initialisation buffer
  ↓
start()     → Activation surveillance
  ↓
add_log()   → Ajout d'entrées
  ↓
get_logs()  → Récupération logs
```

### 🔌 API Frontend
```typescript
const logs = await invoke<string[]>('watchdog_get_logs');
// ["[Info] [Module] Message", ...]
```

---

## 🔧 SELFHEAL - Auto-Recovery

### 🎯 Objectif
Détection et réparation automatique des erreurs système.

### 🩹 Capacités
- **Détection** : Identification des anomalies
- **Diagnostic** : Analyse de la cause
- **Réparation** : Correction automatique
- **Logging** : Historique des réparations

### 📊 Métriques
- **Repairs Performed** : Nombre de réparations
- **Last Repair** : Timestamp dernière intervention
- **Success Rate** : Taux de succès

### 🔄 Stratégies de Réparation
1. **Restart Module** : Redémarrage module défaillant
2. **Reset State** : Réinitialisation état
3. **Fallback** : Mode dégradé
4. **Isolation** : Isolation du problème

---

## 🧠 ADAPTIVE ENGINE - Machine Learning

### 🎯 Objectif
Apprentissage continu et adaptation du système.

### 📊 Paramètres
```rust
struct AdaptiveState {
    learning_rate: f32,    // Taux d'apprentissage
    adaptations: usize,    // Nombre d'adaptations
    active: bool,
}
```

### 🔄 Cycle d'Apprentissage
```
Observation → Analyse → Adaptation → Validation
     ↑                                    ↓
     └────────────── Feedback ───────────┘
```

### 📈 Méthodes
- **Reinforcement Learning** : Apprentissage par renforcement
- **Pattern Recognition** : Reconnaissance de patterns
- **Optimization** : Optimisation continue
- **Decay** : Décroissance learning rate

---

## 💾 MEMORY - Persistent Storage

### 🎯 Objectif
Stockage persistant et gestion de la mémoire long-terme.

### 🗄️ Structure
```rust
struct MemoryState {
    storage: HashMap<String, String>,
    capacity: usize,  // 10,000 entrées par défaut
    active: bool,
}
```

### 💾 Opérations
- **store(key, value)** : Stockage
- **retrieve(key)** : Récupération
- **delete(key)** : Suppression
- **clear()** : Nettoyage complet

### 📈 Status Health
- **Healthy** : Usage < 75%
- **Degraded** : Usage 75-90%
- **Critical** : Usage > 90%

### 🔒 Sécurité (Futur)
- Chiffrement AES-256
- Hashing des clés
- Compression des données
- Backup automatique

---

## 🔄 Communication Inter-Modules

### Message Passing
```rust
// Module A → Module B
let message = ModuleMessage {
    from: "helios",
    to: "nexus",
    data: metrics,
};
bus.send(message)?;
```

### Event Bus (Futur)
```rust
pub struct EventBus {
    subscribers: HashMap<String, Vec<Subscriber>>,
}
```

---

## 📊 Tableau Récapitulatif

| Module | Rôle | Métriques Clés | Priorité |
|--------|------|----------------|----------|
| Helios | Monitoring | CPU, RAM, Disk | Haute |
| Nexus | Graphe | Nodes, Connections | Haute |
| Harmonia | Orchestration | Sync Rate | Moyenne |
| Sentinel | Sécurité | Threats | Critique |
| Watchdog | Logging | Log Count | Haute |
| SelfHeal | Réparation | Repairs | Haute |
| Adaptive | Apprentissage | Learning Rate | Moyenne |
| Memory | Stockage | Capacity | Haute |

---

## 🛠️ Développement de Nouveaux Modules

### Template Module
```rust
// system/nouveau_module/mod.rs

use crate::shared::types::{ModuleHealth, ModuleState, TitaneResult};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;

pub struct NouveauModule {
    state: NouveauState,
    start_time: u64,
    last_tick: Arc<AtomicU64>,
}

struct NouveauState {
    // État du module
    active: bool,
}

impl NouveauModule {
    pub fn init() -> TitaneResult<Self> {
        log::info!("🆕 NouveauModule: Initializing");
        Ok(Self {
            state: NouveauState { active: false },
            start_time: current_timestamp(),
            last_tick: Arc::new(AtomicU64::new(0)),
        })
    }

    pub fn start(&mut self) -> TitaneResult<()> {
        self.state.active = true;
        Ok(())
    }

    pub fn tick(&mut self) -> TitaneResult<()> {
        self.last_tick.store(current_timestamp(), Ordering::Relaxed);
        // Logique du tick
        Ok(())
    }

    pub fn health(&self) -> ModuleHealth {
        // État santé
        ModuleHealth { /* ... */ }
    }
}

impl ModuleState for NouveauModule {
    fn init() -> TitaneResult<Self> { Self::init() }
    fn start(&mut self) -> TitaneResult<()> { self.start() }
    fn tick(&mut self) -> TitaneResult<()> { self.tick() }
    fn health(&self) -> ModuleHealth { self.health() }
}
```

---

**TITANE∞ v8.0** - Guide Complet des Modules
