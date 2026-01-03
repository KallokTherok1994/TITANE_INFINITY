# Guide Développeur TITANE∞ v8.0

## 🎯 Introduction

Ce guide explique comment contribuer au développement de TITANE∞, ajouter des modules, et étendre les fonctionnalités.

---

## 🛠️ Configuration Environnement

### Prérequis
```bash
# Node.js 20+
node -v  # v20.x.x

# Rust 1.70+
rustc --version  # rustc 1.70+

# Cargo
cargo --version  # cargo 1.70+
```

### Installation Développement
```bash
# Cloner le projet
git clone https://github.com/titane/infinity.git
cd TITANE_INFINITY

# Installer dépendances
./system/scripts/install_deps.sh

# Lancer en dev
./system/scripts/run.sh
```

---

## 📁 Structure du Projet

### Backend (Rust)
```
core/backend/
├── main.rs              # Point d'entrée, TitaneCore
├── system/              # Tous les modules
│   ├── mod.rs          # Exports
│   ├── helios/
│   │   └── mod.rs      # Module complet
│   └── ...
└── shared/              # Code partagé
    ├── types.rs        # Types communs
    ├── utils.rs        # Fonctions utilitaires
    └── macros.rs       # Macros
```

### Frontend (React)
```
core/frontend/
├── App.tsx             # Composant principal
├── main.tsx            # Point d'entrée
├── hooks/              # Custom hooks
│   └── useTitaneCore.ts
├── core/               # Composants métier
│   └── Dashboard.tsx
├── devtools/           # Outils développement
│   ├── DevTools.tsx
│   └── panels/
└── ui/                 # Composants UI réutilisables
    └── ModuleCard.tsx
```

---

## ➕ Ajouter un Nouveau Module

### Étape 1 : Créer le Module Backend

Créer `core/backend/system/mon_module/mod.rs` :

```rust
// TITANE∞ v8.0 - Mon Module
// Description du module

use crate::shared::types::{ModuleHealth, ModuleState, HealthStatus, TitaneResult};
use crate::shared::utils::current_timestamp;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;

#[derive(Debug)]
pub struct MonModule {
    state: MonState,
    start_time: u64,
    last_tick: Arc<AtomicU64>,
}

#[derive(Debug)]
struct MonState {
    // Données du module
    counter: usize,
    active: bool,
}

impl MonModule {
    pub fn init() -> TitaneResult<Self> {
        log::info!("🎯 MonModule: Initializing");
        
        Ok(Self {
            state: MonState {
                counter: 0,
                active: false,
            },
            start_time: current_timestamp(),
            last_tick: Arc::new(AtomicU64::new(0)),
        })
    }

    pub fn start(&mut self) -> TitaneResult<()> {
        log::info!("🎯 MonModule: Starting");
        self.state.active = true;
        self.tick()?;
        Ok(())
    }

    pub fn tick(&mut self) -> TitaneResult<()> {
        self.last_tick.store(current_timestamp(), Ordering::Relaxed);
        
        // Logique du tick
        self.state.counter += 1;
        
        Ok(())
    }

    pub fn health(&self) -> ModuleHealth {
        let current = current_timestamp();
        let uptime = current.saturating_sub(self.start_time);
        
        let status = if self.state.active {
            HealthStatus::Healthy
        } else {
            HealthStatus::Offline
        };

        ModuleHealth {
            name: "MonModule".to_string(),
            status,
            uptime,
            last_tick: self.last_tick.load(Ordering::Relaxed),
            message: format!("Counter: {}", self.state.counter),
        }
    }

    // Méthodes publiques spécifiques
    pub fn get_data(&self) -> String {
        serde_json::to_string(&self.state).unwrap_or_default()
    }
}

impl ModuleState for MonModule {
    fn init() -> TitaneResult<Self> {
        Self::init()
    }

    fn start(&mut self) -> TitaneResult<()> {
        self.start()
    }

    fn tick(&mut self) -> TitaneResult<()> {
        self.tick()
    }

    fn health(&self) -> ModuleHealth {
        self.health()
    }
}
```

### Étape 2 : Déclarer dans system/mod.rs

```rust
// core/backend/system/mod.rs
pub mod helios;
pub mod nexus;
// ...existing modules...
pub mod mon_module;  // ← Ajouter
```

### Étape 3 : Intégrer dans TitaneCore

```rust
// core/backend/main.rs

use system::{
    // ...existing modules...
    mon_module::MonModule,  // ← Ajouter
};

pub struct TitaneCore {
    // ...existing fields...
    mon_module: Arc<Mutex<MonModule>>,  // ← Ajouter
}

impl TitaneCore {
    pub fn new() -> TitaneResult<Self> {
        // ...existing init...
        let mon_module = Arc::new(Mutex::new(MonModule::init()?));
        
        Ok(Self {
            // ...existing fields...
            mon_module,  // ← Ajouter
        })
    }

    pub fn start(&self) -> TitaneResult<()> {
        // ...existing starts...
        self.mon_module.lock().map_err(|e| format!("Lock error: {}", e))?.start()?;
        Ok(())
    }

    pub fn get_status(&self) -> TitaneResult<SystemStatus> {
        // ...existing health checks...
        let mon_health = self.mon_module.lock().map_err(|e| format!("Lock error: {}", e))?.health();
        
        Ok(SystemStatus {
            modules: vec![
                // ...existing modules...
                mon_health,  // ← Ajouter
            ],
        })
    }
}
```

### Étape 4 : Exposer Commande Tauri (Optionnel)

```rust
// core/backend/main.rs

#[tauri::command]
fn mon_module_get_data(state: State<Arc<Mutex<TitaneCore>>>) -> Result<String, String> {
    let core = state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let module = core.mon_module.lock().map_err(|e| format!("Lock error: {}", e))?;
    Ok(module.get_data())
}

// Dans run():
tauri::Builder::default()
    .manage(core)
    .invoke_handler(tauri::generate_handler![
        // ...existing commands...
        mon_module_get_data,  // ← Ajouter
    ])
```

### Étape 5 : Frontend (Optionnel)

```typescript
// core/frontend/hooks/useTitaneCore.ts

export const useTitaneCore = () => {
  // ...existing code...

  const getMonModuleData = useCallback(async () => {
    try {
      const data = await invoke<string>('mon_module_get_data');
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to fetch MonModule data:', err);
      return null;
    }
  }, []);

  return {
    // ...existing...
    getMonModuleData,
  };
};
```

---

## 🧪 Tests

### Tests Unitaires Rust

```rust
// core/backend/system/mon_module/mod.rs

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_module_init() {
        let module = MonModule::init();
        assert!(module.is_ok());
    }

    #[test]
    fn test_module_start() {
        let mut module = MonModule::init().unwrap();
        let result = module.start();
        assert!(result.is_ok());
    }

    #[test]
    fn test_module_tick() {
        let mut module = MonModule::init().unwrap();
        module.start().unwrap();
        let result = module.tick();
        assert!(result.is_ok());
    }

    #[test]
    fn test_health_status() {
        let module = MonModule::init().unwrap();
        let health = module.health();
        assert_eq!(health.name, "MonModule");
        assert_eq!(health.status, HealthStatus::Offline);
    }
}
```

### Exécuter Tests

```bash
# Tous les tests
cargo test

# Tests d'un module spécifique
cargo test mon_module

# Tests avec logs
cargo test -- --nocapture

# Tests en release
cargo test --release
```

---

## 🎨 Style Guide

### Rust

```rust
// ✅ BON : Nommage clair
pub struct ModuleState { ... }
pub fn init() -> TitaneResult<Self> { ... }

// ✅ BON : Documentation
/// Initialize the module
/// 
/// # Returns
/// Result containing initialized module or error
pub fn init() -> TitaneResult<Self> {

// ✅ BON : Gestion d'erreur
let data = fetch_data()?;

// ❌ MAUVAIS : Pas de .unwrap()
let data = fetch_data().unwrap();

// ✅ BON : Logging
log::info!("Module initialized");

// ❌ MAUVAIS : println!() en production
println!("Module initialized");
```

### TypeScript

```typescript
// ✅ BON : Types stricts
interface ModuleData {
  count: number;
  active: boolean;
}

// ✅ BON : Gestion d'erreur
try {
  const data = await invoke<ModuleData>('command');
} catch (err) {
  console.error('Error:', err);
}

// ✅ BON : Hooks
const useModuleData = () => {
  const [data, setData] = useState<ModuleData | null>(null);
  // ...
};

// ❌ MAUVAIS : any
const data: any = await invoke('command');
```

---

## 🔍 Debugging

### Backend Rust

```rust
// Activer logs debug
env_logger::Builder::from_default_env()
    .filter_level(log::LevelFilter::Debug)
    .init();

// Dans le code
log::debug!("Variable value: {:?}", variable);
```

### Frontend

```typescript
// DevTools browser
console.log('Data:', data);
console.table(metrics);

// React DevTools
// Extensions: React Developer Tools
```

### Tauri Dev Tools

```bash
# Lancer avec logs verbeux
RUST_LOG=debug pnpm run tauri:dev

# Logs spécifique module
RUST_LOG=mon_module=trace pnpm run tauri:dev
```

---

## 📦 Build & Release

### Build Development

```bash
./system/scripts/run.sh
```

### Build Production

```bash
./system/scripts/build.sh
```

### Binaires

```
src-tauri/target/release/
├── titane-infinity           # Exécutable
├── bundle/
│   ├── deb/                  # Linux .deb
│   ├── appimage/             # Linux AppImage
│   └── dmg/                  # macOS .dmg
```

---

## 🔄 Workflow Git

### Branches

```
main          → Production stable
develop       → Développement actif
feature/*     → Nouvelles fonctionnalités
fix/*         → Corrections bugs
hotfix/*      → Corrections urgentes
```

### Commit Convention

```bash
# Format
<type>(<scope>): <message>

# Types
feat:     Nouvelle fonctionnalité
fix:      Correction bug
docs:     Documentation
style:    Formatage
refactor: Refactoring
test:     Tests
chore:    Maintenance

# Exemples
feat(helios): add GPU monitoring
fix(nexus): resolve memory leak
docs(readme): update installation steps
```

---

## 📊 Performance

### Profiling Rust

```bash
# Avec perf (Linux)
cargo build --release
perf record --call-graph=dwarf ./target/release/titane-infinity
perf report

# Avec cargo-flamegraph
cargo install flamegraph
cargo flamegraph
```

### Optimisations

```rust
// Release profile optimisé
[profile.release]
opt-level = "z"        # Optimiser taille
lto = true            # Link-Time Optimization
codegen-units = 1     # Meilleure optimisation
strip = true          # Retirer symboles debug
panic = "abort"       # Pas d'unwinding
```

---

## 🐛 Troubleshooting

### Erreur: "Failed to initialize module"
**Solution** : Vérifier logs avec `RUST_LOG=debug`

### Erreur: "Lock error"
**Solution** : Deadlock potentiel, vérifier ordre des locks

### Erreur: "Command not found"
**Solution** : Vérifier que la commande est dans `invoke_handler!`

### Build lent
**Solution** : 
```bash
# Utiliser cache
export CARGO_INCREMENTAL=1

# Paralléliser
cargo build -j8
```

---

## 📚 Ressources

### Documentation
- [Rust Book](https://doc.rust-lang.org/book/)
- [Tauri Docs](https://tauri.app/)
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

### Outils
- [rust-analyzer](https://rust-analyzer.github.io/) - LSP Rust
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/setup/)
- [cargo-watch](https://crates.io/crates/cargo-watch) - Auto-rebuild

---

## 🤝 Contribution

### Checklist Pull Request

- [ ] Code suit le style guide
- [ ] Tests ajoutés/passent
- [ ] Documentation mise à jour
- [ ] Pas de warnings compilation
- [ ] Changelog mis à jour
- [ ] Branch à jour avec develop

### Review Process

1. Soumettre PR sur GitHub
2. CI/CD vérifie build + tests
3. Review par 2 développeurs
4. Corrections si nécessaire
5. Merge dans develop
6. Release périodique vers main

---

## 📞 Support

- **Issues** : GitHub Issues
- **Discussions** : GitHub Discussions
- **Chat** : Discord (lien dans README)
- **Email** : dev@titane-project.org

---

**TITANE∞ v8.0** - Happy Coding! 🚀
