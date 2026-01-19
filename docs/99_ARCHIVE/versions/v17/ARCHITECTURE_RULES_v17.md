# 🏛️ TITANE∞ v17 — ARCHITECTURE RULES & BEST PRACTICES

**Version:** 17.0.0  
**Date:** 21 novembre 2025  
**Statut:** ✅ STABLE — Send-Safe, Tauri v2 Compatible, Production-Ready

---

## 📋 TABLE DES MATIÈRES

1. [Règles Async/Send Obligatoires](#règles-asyncsend-obligatoires)
2. [Architecture Tauri-Only](#architecture-tauri-only)
3. [Offline-First Design](#offline-first-design)
4. [Structure des Commandes Tauri](#structure-des-commandes-tauri)
5. [Gestion de la Concurrence](#gestion-de-la-concurrence)
6. [Tests et Validation](#tests-et-validation)
7. [Interdictions Permanentes](#interdictions-permanentes)

---

## 🔒 RÈGLES ASYNC/SEND OBLIGATOIRES

### Règle #1: Pas de `std::sync::Mutex` dans du code async

❌ **INTERDIT:**
```rust
use std::sync::Mutex;

pub struct State {
    data: Arc<Mutex<HashMap<String, String>>>,
}

#[tauri::command]
async fn command(state: State<'_, MyState>) -> Result<(), String> {
    let guard = state.data.lock().unwrap();
    some_async_call().await; // ❌ MutexGuard traverse un .await
}
```

✅ **CORRECT:**
```rust
use tokio::sync::RwLock;

pub struct State {
    data: RwLock<HashMap<String, String>>,
}

#[tauri::command]
async fn command(state: State<'_, MyState>) -> Result<(), String> {
    let data = {
        let guard = state.data.read().await;
        guard.clone() // Cloner AVANT le .await
    };
    some_async_call().await; // ✅ Pas de guard vivant
}
```

### Règle #2: Toutes les futures doivent être `Send + 'static`

❌ **INTERDIT:**
```rust
#[async_recursion]
async fn recursive_fn(...) { ... } // ❌ Génère des futures non-'static
```

✅ **CORRECT:**
```rust
async fn iterative_fn(...) {
    loop {
        // Boucle au lieu de récursion
    }
}
```

### Règle #3: Cloner les données AVANT tout `.await`

✅ **Pattern recommandé:**
```rust
async fn safe_async_fn(state: &MyState) -> Result<(), String> {
    // 1. Acquérir lock
    // 2. Cloner données
    // 3. Libérer lock immédiatement
    let data = {
        let guard = state.data.read().await;
        guard.clone()
    };
    
    // 4. Utiliser données clonées dans async
    process_data(data).await?;
    
    Ok(())
}
```

---

## 🎯 ARCHITECTURE TAURI-ONLY

### Principe fondamental

> **TITANE∞ est 100% Tauri, 0% HTTP**

### Règles d'Architecture

1. **✅ OBLIGATOIRE:** Toutes les fonctionnalités passent par IPC Tauri
2. **❌ INTERDIT:** Aucun serveur HTTP local (`http://localhost`)
3. **❌ INTERDIT:** Aucun build web-only (`vite preview`)
4. **✅ OBLIGATOIRE:** Communication frontend ↔ backend via `invoke()`

### Structure Frontend → Backend

```typescript
// ✅ Frontend (React/TypeScript)
import { invoke } from '@tauri-apps/api/core';

const result = await invoke<ResponseType>('command_name', {
  param1: value1,
  param2: value2,
});
```

```rust
// ✅ Backend (Rust/Tauri)
#[tauri::command]
async fn command_name(
    param1: Type1,
    param2: Type2,
    state: State<'_, MyState>,
) -> Result<ResponseType, String> {
    // Logique métier
    Ok(response)
}
```

---

## 🌐 OFFLINE-FIRST DESIGN

### Règles de Connectivité

1. **Local-First:** Toutes les fonctionnalités de base fonctionnent offline
2. **API On-Demand:** Seules les APIs explicitement demandées nécessitent internet
3. **Graceful Degradation:** Fallback automatique vers local si API échoue

### APIs Autorisées (Online)

- ✅ **Gemini API:** Pour chat IA avancé (optionnel)
- ✅ **Ollama:** Pour modèles locaux (optionnel)
- ✅ **Web Scraping:** Uniquement si demandé par l'utilisateur

### Données Persistantes

- **Stockage:** Fichiers JSON locaux dans `~/.titane_infinity/`
- **Chiffrement:** AES-256-GCM pour données sensibles
- **Backup:** Backup automatique avant modifications critiques

---

## 🛠️ STRUCTURE DES COMMANDES TAURI

### Template Standard

```rust
#[tauri::command]
async fn command_name(
    param: Type,
    state: State<'_, MyState>,
) -> Result<ReturnType, String> {
    // 1. Valider les entrées
    if !validate_input(&param) {
        return Err("Invalid input".to_string());
    }
    
    // 2. Cloner state si nécessaire
    let cloned_data = {
        let guard = state.data.read().await;
        guard.clone()
    };
    
    // 3. Logique métier (async-safe)
    let result = process_logic(cloned_data).await?;
    
    // 4. Mettre à jour state si nécessaire
    {
        let mut guard = state.data.write().await;
        *guard = result.clone();
    }
    
    // 5. Retourner résultat
    Ok(result)
}
```

### Gestion des Erreurs

```rust
// ✅ Toujours utiliser Result<T, String>
#[tauri::command]
async fn command() -> Result<Data, String> {
    operation()
        .await
        .map_err(|e| format!("Error: {}", e))?;
    Ok(data)
}

// ❌ Jamais de panic!/unwrap() en production
// ❌ unwrap() est interdit sauf dans les tests
```

---

## 🔀 GESTION DE LA CONCURRENCE

### Utilisation de `tokio::sync::RwLock`

```rust
use tokio::sync::RwLock;

pub struct MyState {
    // Lecture fréquente, écriture rare
    config: RwLock<Config>,
    
    // Accès concurrent en lecture
    cache: RwLock<HashMap<String, Data>>,
}

impl MyState {
    pub fn new() -> Self {
        Self {
            config: RwLock::new(Config::default()),
            cache: RwLock::new(HashMap::new()),
        }
    }
}

// Lecture (plusieurs lecteurs simultanés)
let config = state.config.read().await;

// Écriture (exclusif, bloque les lecteurs)
let mut config = state.config.write().await;
*config = new_config;
```

### Pattern: Lock Scope Minimal

```rust
// ✅ CORRECT: Lock libéré rapidement
let value = {
    let guard = state.data.read().await;
    guard.get(&key).cloned()
}; // Guard drop ici

process_value(value).await; // Pas de lock actif

// ❌ INCORRECT: Lock maintenu trop longtemps
let guard = state.data.read().await;
let value = guard.get(&key);
process_value(value).await; // Lock toujours actif!
```

---

## ✅ TESTS ET VALIDATION

### Tests Unitaires Obligatoires

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_command() {
        let state = MyState::new();
        let result = command_name(param, State::from(&state)).await;
        assert!(result.is_ok());
    }
}
```

### Validation Send/Sync

```rust
// Vérifier qu'un type est Send + Sync
fn assert_send<T: Send>() {}
fn assert_sync<T: Sync>() {}

#[test]
fn test_state_is_send_sync() {
    assert_send::<MyState>();
    assert_sync::<MyState>();
}
```

### Vérification Automatique

Voir `src-tauri/src/tauri_v2_guard.rs` pour tests automatiques.

---

## 🚫 INTERDICTIONS PERMANENTES

### Code Rust

1. ❌ **`std::sync::Mutex` dans async** → Utiliser `tokio::sync::RwLock`
2. ❌ **`#[async_recursion]`** → Utiliser des boucles
3. ❌ **`.unwrap()` sans contrôle** → Utiliser `?` ou `map_err()`
4. ❌ **MutexGuard traversant `.await`** → Cloner avant async
5. ❌ **Futures non-Send** → Toujours vérifier avec tests

### Architecture

6. ❌ **Serveurs HTTP internes** → 100% Tauri IPC uniquement
7. ❌ **Dépendances GTK/WebKit externes** → Géré par Tauri automatiquement
8. ❌ **Build web-only** → Toujours `pnpm tauri build`
9. ❌ **URLs `http://localhost`** → Utiliser `invoke()` à la place
10. ❌ **Imports web non-Tauri** → Frontend doit être Tauri-aware

### Frontend

11. ❌ **fetch() pour backend local** → Utiliser `invoke()`
12. ❌ **window.location reload** → Navigation React Router
13. ❌ **Process env vars côté client** → Passer par Tauri commands

---

## 📊 CHECKLIST PRÉ-COMMIT

Avant chaque commit, vérifier:

- [ ] Aucun `std::sync::Mutex` dans code async
- [ ] Aucun `#[async_recursion]`
- [ ] Tous les guards libérés avant `.await`
- [ ] Pas de `.unwrap()` non-contrôlé
- [ ] Tests passent: `cargo test --manifest-path src-tauri/Cargo.toml`
- [ ] Compilation réussie: `pnpm tauri build --debug`
- [ ] Frontend utilise `invoke()` et non `fetch()`
- [ ] Aucune URL `http://localhost` dans le code

---

## 🎯 OBJECTIFS ATTEINTS v17

- ✅ 100% Send-Safe
- ✅ 100% Tauri-Only  
- ✅ 100% Async-Safe
- ✅ 0 Warning
- ✅ 0 Future non-Send
- ✅ 0 async_recursion
- ✅ 0 std::sync::Mutex dans async
- ✅ Architecture blindée
- ✅ Production-Ready

---

**Dernière mise à jour:** 21 novembre 2025  
**Mainteneur:** TITANE∞ Core Team  
**Statut:** 🟢 Active — À respecter strictement
