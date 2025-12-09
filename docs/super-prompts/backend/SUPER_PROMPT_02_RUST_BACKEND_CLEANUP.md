# 🔥 SUPER PROMPT #2 — TITANE∞ RUST BACKEND CLEANUP

**Nettoyage complet + Optimisation + Robustesse du backend Rust**

---

## 📋 Métadonnées

- **Priorité** : 🔥 P0 (Critique)
- **Complexité** : ⭐⭐⭐⭐⭐ (Très élevée)
- **Durée estimée** : 3-6h
- **Dépendances** : Super Prompt #1 (recommandé mais pas obligatoire)
- **Output** : Code Rust propre + Tests + Documentation Rustdoc
- **Outils** : GitHub Copilot Chat + VS Code

---

## 🎯 Objectif

Nettoyer, optimiser et **sécuriser le backend Rust** de TITANE∞ pour qu'il soit :

- ✅ Sans code mort (dead code elimination)
- ✅ Sans `unwrap()` dangereux (gestion d'erreurs robuste)
- ✅ Optimisé (performance + mémoire)
- ✅ Bien documenté (Rustdoc complet)
- ✅ Testé (tests unitaires + intégration)
- ✅ Conforme aux best practices Rust 2021

---

## 🚀 Super Prompt (Copier-coller dans Copilot Chat)

````markdown
@workspace

Tu es mon copilote expert Backend/Rust senior sur le projet **TITANE_INFINITY**.

Ton rôle : **nettoyer, optimiser et FINALISER le backend Rust** pour qu'il soit :
- sans code mort,
- sans unwrap() dangereux,
- robuste avec gestion d'erreurs exhaustive,
- performant (optimisations mémoire + CPU),
- bien documenté (Rustdoc),
- testé (unitaires + intégration).

Tu dois travailler SUR le code existant (Rust 2021 + Tauri v2) et produire du **code réel**, prêt à être commité.
Pas de pseudo-code, pas de TODO abstrait : des fichiers concrets, complets.

---

## 1. CONTEXTE PROJET (À ANALYSER EN PREMIER)

Parcours le workspace et établis une vision claire de :

1. **Stack Backend** :
   - Rust edition 2021
   - Tauri v2 (backend pour app desktop)
   - Tokio (async runtime)
   - Serde (serialization)
   - Autres crates utilisées

2. **Structure actuelle** (à détecter) :
   - Dossier `src-tauri/src/`
   - Modules principaux (kernels, engines, memory, etc.)
   - Commandes Tauri exposées au frontend
   - Services internes

3. **Problèmes connus** :
   - Code mort (fonctions/modules non utilisés)
   - `unwrap()` et `expect()` en production
   - Gestion d'erreurs incomplète
   - Pas assez de logging
   - Tests manquants
   - Documentation Rustdoc absente ou incomplète

📌 **Objectif de cette section** :
Générer un **rapport de diagnostic** dans un fichier :

- `docs/backend/RUST_BACKEND_DIAGNOSTIC_TITANE.md`

Contenu attendu :
- Liste des modules détectés
- Statistiques sur `unwrap()`, `expect()`, `panic!()`, `.unwrap_or()`
- Code mort détecté (via `cargo check --all-features`)
- Résumé des problèmes (sécurité, performance, maintenabilité)

---

## 2. ARCHITECTURE CIBLE BACKEND TITANE∞

Tu dois converger vers cette architecture cible :

```text
src-tauri/src/
 ├─ main.rs              → Entry point Tauri
 ├─ lib.rs               → Library exports
 ├─ error.rs             → Type d'erreur global unifié
 ├─ result.rs            → Type Result<T> global
 ├─ config.rs            → Configuration centralisée
 ├─ commands/
 │   ├─ mod.rs           → Exports des commandes Tauri
 │   ├─ chat.rs          → Commandes chat
 │   ├─ devtools.rs      → Commandes DevTools
 │   ├─ settings.rs      → Commandes settings
 │   └─ system.rs        → Commandes system
 ├─ services/
 │   ├─ mod.rs
 │   ├─ kernel.rs        → Kernel management
 │   ├─ memory.rs        → Memory management
 │   ├─ cognitive.rs     → Cognitive engines
 │   └─ monitoring.rs    → Monitoring services
 ├─ models/
 │   ├─ mod.rs
 │   ├─ message.rs       → Message types
 │   ├─ kernel.rs        → Kernel types
 │   └─ state.rs         → State types
 ├─ utils/
 │   ├─ mod.rs
 │   ├─ logging.rs       → Logging utilities
 │   └─ validation.rs    → Input validation
 └─ tests/
     ├─ integration/
     └─ unit/
```

🎯 **Mission** :

* Réorganiser le code existant pour se rapprocher de cette structure,
* Créer les modules manquants (error, result, config, etc.),
* Supprimer le code mort détecté.

---

## 3. GESTION D'ERREURS ROBUSTE

### 3.1. Créer un type d'erreur global

Fichier : `src-tauri/src/error.rs`

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum TitaneError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serde(#[from] serde_json::Error),

    #[error("Tauri error: {0}")]
    Tauri(#[from] tauri::Error),

    #[error("Kernel error: {0}")]
    Kernel(String),

    #[error("Memory error: {0}")]
    Memory(String),

    #[error("Cognitive error: {0}")]
    Cognitive(String),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Unknown error: {0}")]
    Unknown(String),
}

pub type Result<T> = std::result::Result<T, TitaneError>;
```

### 3.2. Remplacer TOUS les `unwrap()` et `expect()`

**Règle absolue** : AUCUN `unwrap()` ou `expect()` dans le code de production.

Pour chaque occurrence :
1. Identifier le contexte
2. Remplacer par :
   - `?` avec propagation d'erreur
   - `.ok_or(TitaneError::...)` pour convertir `Option` en `Result`
   - `.map_err(|e| TitaneError::...)` pour convertir les erreurs
   - Pattern matching explicite si nécessaire

**Exceptions acceptées** :
- Tests uniquement (`#[cfg(test)]`)
- Code prototypage explicitement marqué `#[allow(clippy::unwrap_used)]`

### 3.3. Ajouter du logging exhaustif

Utiliser `tracing` ou `log` + `env_logger` :

```rust
use tracing::{info, warn, error, debug};

// Exemple
pub async fn process_message(msg: &str) -> Result<String> {
    debug!("Processing message: {}", msg);

    let result = do_processing(msg)
        .map_err(|e| {
            error!("Failed to process message: {}", e);
            TitaneError::Unknown(e.to_string())
        })?;

    info!("Message processed successfully");
    Ok(result)
}
```

---

## 4. SUPPRESSION DU CODE MORT

### 4.1. Détecter le code mort

```bash
# Activer tous les lints Rust
cargo clippy --all-features -- -W dead_code -W unused_imports

# Analyser avec cargo-udeps (unused dependencies)
cargo install cargo-udeps
cargo +nightly udeps
```

### 4.2. Supprimer

Pour chaque fonction/module/struct non utilisé :
1. Vérifier qu'il n'est pas appelé (grep récursif)
2. Vérifier qu'il n'est pas documenté comme API publique
3. Supprimer complètement (pas de commentaire `// TODO: removed`)

---

## 5. OPTIMISATIONS PERFORMANCE

### 5.1. Optimisations mémoire

- Utiliser `&str` au lieu de `String` où possible
- Utiliser `Cow<'_, str>` pour éviter les clones inutiles
- Passer les gros types par référence (`&LargeStruct`)
- Utiliser `Arc<T>` pour partage thread-safe sans clone

### 5.2. Optimisations CPU

- Remplacer les `.clone()` inutiles
- Utiliser `Vec::with_capacity()` pour pré-allouer
- Préférer les iterators à la place de boucles manuelles
- Lazy evaluation avec `once_cell` ou `lazy_static`

### 5.3. Async best practices

- Ne pas bloquer le runtime Tokio (pas de `std::thread::sleep`)
- Utiliser `tokio::time::sleep` pour async
- Utiliser `tokio::spawn` pour parallélisation
- Éviter les `.await` inutiles en série (utiliser `join!`)

---

## 6. DOCUMENTATION RUSTDOC

### 6.1. Documenter TOUS les items publics

```rust
/// Description courte de la fonction.
///
/// # Arguments
///
/// * `param1` - Description du paramètre 1
/// * `param2` - Description du paramètre 2
///
/// # Returns
///
/// Description du retour
///
/// # Errors
///
/// Cette fonction retourne une erreur si...
///
/// # Examples
///
/// ```
/// use titane::my_function;
/// let result = my_function("test").unwrap();
/// assert_eq!(result, "expected");
/// ```
pub fn my_function(param1: &str, param2: i32) -> Result<String> {
    // Implementation
}
```

### 6.2. Générer la doc

```bash
cargo doc --open --no-deps
```

Vérifier que TOUS les warnings de documentation sont résolus.

---

## 7. TESTS UNITAIRES & INTÉGRATION

### 7.1. Tests unitaires

Pour chaque module critique :

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_function_success() {
        let result = my_function("valid input", 42);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "expected output");
    }

    #[test]
    fn test_function_error() {
        let result = my_function("", 0);
        assert!(result.is_err());
    }
}
```

### 7.2. Tests d'intégration

Fichier : `src-tauri/tests/integration_test.rs`

```rust
use titane::commands;

#[tokio::test]
async fn test_full_workflow() {
    // Setup
    let state = setup_test_state();

    // Execute
    let result = commands::process_chat_message(state, "test").await;

    // Assert
    assert!(result.is_ok());
}
```

### 7.3. Coverage

```bash
# Installer tarpaulin
cargo install cargo-tarpaulin

# Mesurer la couverture
cargo tarpaulin --out Html --output-dir coverage
```

**Objectif** : >80% de couverture sur les modules critiques.

---

## 8. CONFIGURATION CENTRALISÉE

### 8.1. Créer `src-tauri/src/config.rs`

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TitaneConfig {
    pub log_level: String,
    pub data_dir: PathBuf,
    pub max_memory_mb: u64,
    pub enable_telemetry: bool,
}

impl TitaneConfig {
    pub fn load() -> Result<Self> {
        // Charger depuis fichier ou env vars
    }

    pub fn default() -> Self {
        Self {
            log_level: "info".to_string(),
            data_dir: PathBuf::from("./data"),
            max_memory_mb: 512,
            enable_telemetry: false,
        }
    }
}
```

---

## 9. COMMANDES TAURI SÉCURISÉES

### 9.1. Valider TOUS les inputs

```rust
use validator::Validate;

#[derive(Validate)]
struct ChatMessage {
    #[validate(length(min = 1, max = 5000))]
    content: String,
}

#[tauri::command]
pub async fn send_message(
    state: tauri::State<'_, AppState>,
    message: String,
) -> Result<String> {
    // Validation
    let msg = ChatMessage { content: message };
    msg.validate()
        .map_err(|e| TitaneError::Validation(e.to_string()))?;

    // Processing
    process_chat_message(state, &msg.content).await
}
```

---

## 10. RÈGLES GÉNÉRALES DE TRAVAIL

* Tu travailles **module par module**, en expliquant brièvement les modifications.
* Tu ne laisses **aucun `TODO` vague** : soit tu fais, soit tu documentes précisément ce qui reste.
* Tu respectes le **style Rust 2021** (édition Rust, idiomatique).
* Tu utilises **clippy** pour valider la qualité :
  ```bash
  cargo clippy --all-features --all-targets -- -D warnings
  ```
* Tu t'assures que **cargo check** et **cargo test** passent.

---

## 11. OUTPUT ATTENDU (DANS CETTE SESSION)

1. Le fichier :
   * `docs/backend/RUST_BACKEND_DIAGNOSTIC_TITANE.md`

2. Le système d'erreurs unifié :
   * `src-tauri/src/error.rs`
   * `src-tauri/src/result.rs`

3. Configuration centralisée :
   * `src-tauri/src/config.rs`

4. Modules refactorés :
   * `src-tauri/src/commands/` (refactored)
   * `src-tauri/src/services/` (refactored)
   * Code mort supprimé

5. Documentation :
   * Rustdoc complète pour tous les items publics
   * `cargo doc --open` fonctionne sans warning

6. Tests :
   * Tests unitaires pour modules critiques
   * Au moins 1 test d'intégration

7. Rapport final :
   * Statistiques avant/après (unwrap, code mort, couverture tests)
   * Liste des optimisations effectuées

Tu peux proposer des ajustements, mais tu dois **toujours livrer du code immédiatement exploitable**.

Commence maintenant par :

1. Lire la structure backend existante
2. Générer `RUST_BACKEND_DIAGNOSTIC_TITANE.md`
3. Ensuite enchaîner sur le système d'erreurs puis les refactors.
````

---

## ✅ Checklist Post-Application

Après avoir appliqué ce super prompt avec Copilot :

- [ ] Le fichier `docs/backend/RUST_BACKEND_DIAGNOSTIC_TITANE.md` existe et est complet
- [ ] Le système d'erreurs `error.rs` + `result.rs` est créé
- [ ] Configuration `config.rs` existe et fonctionne
- [ ] AUCUN `unwrap()` ou `expect()` en production
- [ ] `cargo clippy --all-features -- -D warnings` passe ✅
- [ ] `cargo check` passe ✅
- [ ] `cargo test` passe ✅
- [ ] `cargo doc --open` génère la doc sans warning
- [ ] Couverture de tests > 80% sur modules critiques
- [ ] Code mort supprimé (0 dead_code warnings)

---

## 🔄 Itérations possibles

Si le super prompt ne couvre pas tout en une fois :

1. **Itération 1** : Diagnostic + Système d'erreurs + Config
2. **Itération 2** : Refactor modules commands + Suppression unwrap()
3. **Itération 3** : Refactor services + Optimisations
4. **Itération 4** : Documentation Rustdoc + Tests

---

## 📚 Ressources liées

- [Rust Error Handling Best Practices](https://doc.rust-lang.org/book/ch09-00-error-handling.html)
- [thiserror crate](https://docs.rs/thiserror/)
- [Clippy Lints](https://rust-lang.github.io/rust-clippy/master/)
- [Rustdoc Guide](https://doc.rust-lang.org/rustdoc/)

---

## 🐛 Troubleshooting

### Copilot génère du code qui ne compile pas

➡️ Copier l'erreur exacte de `cargo check` et la donner à Copilot pour correction

### Trop d'unwrap() à remplacer manuellement

➡️ Demander à Copilot de traiter module par module, pas tout d'un coup

### Les tests cassent après refactor

➡️ Mettre à jour les tests pour refléter la nouvelle signature avec `Result<T>`

### La doc Rustdoc a des warnings

➡️ Copier les warnings et demander à Copilot de les corriger

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-12-09
**Auteur** : TITANE∞ Core Team
