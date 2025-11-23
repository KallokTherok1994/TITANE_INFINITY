# 🛠️ Guide de Contribution — TITANE∞ Backend

**Tu es arrivé(e) dans le backend TITANE∞. Bienvenue. Voici comment contribuer.**

---

## ⚡ Installation Rapide (2 minutes)

\`\`\`bash
# 1. Prerequisites
node >= 20, npm >= 10, rust >= 1.70, cargo, tauri-cli

# 2. Clone & Install
git clone <repo>
cd TITANE_INFINITY
npm install

# 3. Verify
npm run verify:backend  # (quand créé - voir SUPER-PROMPT 3)
# Ou manuellement:
cd src-tauri
cargo build
cargo test
\`\`\`

---

## 🚀 Lancer le Backend (Dev)

\`\`\`bash
# Dev avec hot-reload
npm run tauri dev

# Build production
npm run tauri build
\`\`\`

---

## 📁 Organisation des Modules

\`\`\`
src-tauri/src/
├── utils/       → Helpers (dates, validation)
├── types/       → Structs Rust
├── services/    → Business logic (SystemService, IOService, StorageService)
├── core/        → 5 Kernels (Helios, Nexus, Harmonia, Sentinel, Memory)
├── engine/      → AutoEvolution, Diagnostics, Repair, HealthCheck
├── security/    → ShellGuard, StorageGuard (v17.3.0)
├── api/         → Tauri commands (#[tauri::command])
└── app/         → State management (AppState, initialization)
\`\`\`

**Principe**: Logique business dans `services/`, exposition Tauri dans `api/`.

---

## ➕ Ajouter un Nouveau Composant

### 🔹 Nouveau Kernel

\`\`\`rust
// 1. Créer src-tauri/src/core/my_kernel.rs
pub struct MyKernel {
    state: Arc<RwLock<MyState>>,
}

impl MyKernel {
    pub fn new() -> Self { /*...*/ }
    pub async fn scan(&self) -> AppResult<()> { /*...*/ }
}

// 2. Ajouter dans app/mod.rs
pub struct AppState {
    // ...
    my_kernel: Arc<MyKernel>,
}

// 3. Initialiser dans main.rs
let my_kernel = Arc::new(MyKernel::new());
\`\`\`

### 🔹 Nouvelle Commande Tauri

\`\`\`rust
// 1. Dans api/my_module_api.rs
#[tauri::command]
pub async fn my_command(
    state: tauri::State<'_, AppState>,
    param: String,
) -> AppResult<MyResponse> {
    // Validate input
    if param.is_empty() {
        return Err(AppError::InvalidInput("Empty param".into()));
    }
    
    // Delegate to service
    let result = state.my_service.do_work(param).await?;
    
    Ok(MyResponse { data: result })
}

// 2. Enregistrer dans main.rs
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        // ... existing commands
        my_command
    ])
\`\`\`

### 🔹 Nouveau Service

\`\`\`rust
// src-tauri/src/services/my_service.rs
pub struct MyService {
    storage: Arc<StorageService>,
}

impl MyService {
    pub fn new(storage: Arc<StorageService>) -> Self {
        Self { storage }
    }
    
    pub async fn do_work(&self, input: String) -> AppResult<String> {
        // Business logic ici
        // Utilise services existants (storage, io, system)
        Ok(format!("Processed: {}", input))
    }
}
\`\`\`

---

## 📏 Conventions

### Nommage
- **Modules**: snake_case (`my_module.rs`)
- **Types**: PascalCase (`MyStruct`)
- **Fonctions**: snake_case (`do_something`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRIES`)

### Erreurs
\`\`\`rust
use crate::types::app_error::{AppError, AppResult};

pub fn might_fail() -> AppResult<String> {
    if condition {
        Err(AppError::NotFound("Resource missing".into()))
    } else {
        Ok("Success".into())
    }
}
\`\`\`

### Logs
\`\`\`rust
log::info!("[MyModule] Operation started");
log::warn!("[MyModule] Potential issue detected");
log::error!("[MyModule] Failed: {}", error);
\`\`\`

Format: `[Domain] Message`

### Tests
\`\`\`rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_my_function() {
        let result = my_function("input");
        assert_eq!(result, expected);
    }
    
    #[tokio::test]
    async fn test_async_function() {
        let result = async_function().await;
        assert!(result.is_ok());
    }
}
\`\`\`

---

## ✅ Checklist Contribution

Avant de commit:

- [ ] Code compile (`cargo build`)
- [ ] Tests passent (`cargo test`)
- [ ] Pas de warning (`cargo clippy`)
- [ ] Format OK (`cargo fmt`)
- [ ] Doc/README mis à jour si nouveau module
- [ ] Logs ajoutés pour debug
- [ ] Erreurs gérées proprement (AppResult)

---

## 🎓 Ressources

- [Architecture Overview](./overview.md) — 10 min lecture
- [Architecture Détaillée](./architecture.md) — 20 min lecture
- [API Tauri](./api-tauri-summary.md) — Référence commandes
- [Debug & Self-Heal](./debug-and-self-heal.md) — Playbook

---

**TITANE∞** — *"Code propre, mental clair, mission accomplie."*
