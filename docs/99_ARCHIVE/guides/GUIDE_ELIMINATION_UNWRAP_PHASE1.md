# 🔥 GUIDE CORRECTION UNWRAP/EXPECT — Phase 1 Stabilisation v20.0

## 🎯 Objectif

Remplacer **100+ occurrences** de `unwrap()` / `expect()` par gestion d'erreurs robuste avec `AppError`.

---

## 📋 Inventaire Complet (Criticité)

### 🚨 **P0 — CRITIQUE (Production, non-test)**

#### 1. `commands/orchestration_center.rs` (ligne 144)

```rust
// ❌ AVANT (DANGEREUX)
let api_key = api_key.unwrap();

// ✅ APRÈS (ROBUSTE)
let api_key = api_key.ok_or_else(|| {
    "API key not found: GEMINI_API_KEY not set in environment or secrets".to_string()
})?;
```

**Contexte**: Fonction `ping_gemini_internal()` — Si `api_key` est `None`, unwrap() panic.
**Impact**: Crash backend complet au ping Gemini.
**Correction**: Retourner erreur propre, logger, continuer avec status "unavailable".

---

#### 2. `commands/ai_chat.rs` (ligne 96)

```rust
// ❌ AVANT (DANGEREUX)
.expect("Failed to initialize memory storage")

// ✅ APRÈS (ROBUSTE)
.map_err(|e| format!("Failed to initialize memory storage: {}", e))?
```

**Contexte**: Initialisation `MemoryStorage` dans `AIChatState::new()`.
**Impact**: Panic au démarrage si storage inaccessible.
**Correction**: Propager erreur avec `Result`, fallback à mémoire in-memory.

---

#### 3. `commands/persistent_memory.rs` (ligne 241)

```rust
// ❌ AVANT (DANGEREUX)
.expect("Failed to get app data dir")

// ✅ APRÈS (ROBUSTE)
.ok_or_else(|| "Failed to get app data dir: dirs::data_local_dir() returned None".to_string())?
```

**Contexte**: Récupération du répertoire de données app.
**Impact**: Panic si `dirs::data_local_dir()` retourne `None`.
**Correction**: Fallback à `PathBuf::from(".")` ou retourner erreur.

---

#### 4. `app/main.rs` (ligne 46)

```rust
// ❌ AVANT (DANGEREUX)
.expect("error while running tauri application")

// ✅ APRÈS (ROBUSTE)
.map_err(|e| {
    eprintln!("FATAL: Tauri application failed to start: {}", e);
    std::process::exit(1);
})
```

**Contexte**: Lancement de l'app Tauri.
**Impact**: Panic si Tauri échoue (mais déjà critique, app ne peut pas continuer).
**Correction**: Logger erreur détaillée, exit propre avec code d'erreur.

---

#### 5. `system_center/logs.rs` (lignes 153, 185, 205)

```rust
// ❌ AVANT (DANGEREUX)
let buffer = LOG_BUFFER.lock().unwrap();

// ✅ APRÈS (ROBUSTE)
let buffer = LOG_BUFFER.lock()
    .map_err(|e| format!("LOG_BUFFER lock poisoned: {}", e))?;
```

**Contexte**: Accès concurrent au buffer de logs.
**Impact**: Panic si lock empoisonné (rare mais critique).
**Correction**: Gérer poison error, fallback ou retourner erreur.

---

#### 6. `commands/evolution_v14.rs` (lignes 99, 128)

```rust
// ❌ AVANT (DANGEREUX)
let mut evolution_state = state.state.lock().unwrap();

// ✅ APRÈS (ROBUSTE)
let mut evolution_state = state.state.lock()
    .map_err(|e| format!("EvolutionState lock poisoned: {}", e))?;
```

**Contexte**: Accès à l'état d'évolution.
**Impact**: Panic si lock empoisonné.
**Correction**: Gérer poison, retourner erreur propre.

---

#### 7. `commands/automations.rs` (lignes 243, 843)

```rust
// ❌ AVANT (DANGEREUX)
let configs = state.configs.lock().unwrap();

// ✅ APRÈS (ROBUSTE)
let configs = state.configs.lock()
    .map_err(|e| format!("Automations configs lock poisoned: {}", e))?;
```

**Contexte**: Accès aux configs d'automation.
**Impact**: Panic si lock empoisonné.
**Correction**: Gérer poison error.

---

### ⚠️ **P1 — HAUTE PRIORITÉ (Tests, mais patterns dangereux)**

#### 8. `security/validation.rs` (lignes 20-24)

```rust
// ❌ AVANT (ACCEPTABLE en lazy_static, mais à documenter)
Regex::new(r"<script[^>]*>.*?</script>").unwrap(),
Regex::new(r"javascript:").unwrap(),
```

**Contexte**: Regex statiques dans `lazy_static!`.
**Impact**: Panic au démarrage si regex invalide (mais regex hard-codées).
**Correction**: **Acceptable** car regex constantes, mais ajouter commentaire `// Safe: static regex`.

---

#### 9. `security/vault_engine.rs` (10+ dans tests)

```rust
// Tests uniquement — Acceptable mais à améliorer
let vault = VaultEngine::new(&master_key).await.unwrap();
```

**Contexte**: Tests unitaires.
**Impact**: Test échoue avec panic (OK pour tests).
**Correction**: **Optionnel** — Remplacer par `?` avec `#[tokio::test] async fn test() -> Result<(), Box<dyn std::error::Error>>`.

---

#### 10. `meta_energy/distributor.rs` (lignes 212, 373)

```rust
// ❌ AVANT (DANGEREUX même en test)
let (best_agent_id, _, _) = candidates.first().unwrap();

// ✅ APRÈS (ROBUSTE)
let (best_agent_id, _, _) = candidates.first()
    .ok_or_else(|| AppError::Internal("No candidates available for distribution".to_string()))?;
```

**Contexte**: Sélection du meilleur agent.
**Impact**: Panic si `candidates` est vide (bug logique).
**Correction**: Retourner erreur `NoAvailableAgent`.

---

### 🟡 **P2 — MOYENNE PRIORITÉ (Cycle, API Hub, AGI)**

#### 11. `cycle_engine/engine.rs` (lignes 263, 268)

```rust
// Tests uniquement
engine.start().await.expect("Failed to start");
```

**Contexte**: Tests unitaires.
**Correction**: **Acceptable** en tests, mais mieux avec `?`.

---

#### 12. `api_hub/temporal_rate_limiter.rs` (ligne 214)

```rust
// ❌ AVANT (TEST)
limiter.acquire_permit().await.unwrap();

// ✅ APRÈS
limiter.acquire_permit().await?;
```

**Contexte**: Test du rate limiter.
**Correction**: Remplacer par `?` avec `Result<(), Box<dyn Error>>`.

---

#### 13. `agi_core/*` (15+ dans tests)

Tous dans tests → **P2** — Corriger progressivement.

---

### 🟢 **P3 — BASSE PRIORITÉ (Cloud, AI cache, config)**

#### 14. `cloud/cloud_crypto.rs` (10+ dans tests)

Tests uniquement → **P3**.

#### 15. `ai/cache.rs`, `ai/config_multi.rs` (tests)

Tests uniquement → **P3**.

---

## 🔧 Stratégie de Correction (Phase par Phase)

### **Phase 1.1: P0 Commands** ✅ (À FAIRE MAINTENANT)

- [ ] `commands/orchestration_center.rs` (ligne 144)
- [ ] `commands/ai_chat.rs` (ligne 96)
- [ ] `commands/persistent_memory.rs` (ligne 241)
- [ ] `app/main.rs` (ligne 46)

**Estimation**: 30 min

---

### **Phase 1.2: P0 System Center** (SUIVANT)

- [ ] `system_center/logs.rs` (3 occurrences)
- [ ] `commands/evolution_v14.rs` (2 occurrences)
- [ ] `commands/automations.rs` (2 occurrences)

**Estimation**: 20 min

---

### **Phase 1.3: P1 Security** (APRÈS P0)

- [ ] Documenter `security/validation.rs` (lazy_static OK)
- [ ] Améliorer `security/vault_engine.rs` tests (optionnel)

**Estimation**: 10 min

---

### **Phase 1.4: P1 Meta-Energy** (IMPORTANT)

- [ ] `meta_energy/distributor.rs` (2 occurrences critiques)

**Estimation**: 15 min

---

### **Phase 1.5: P2/P3** (OPTIONNEL)

- [ ] Améliorer tests progressivement

---

## 🧪 Tests Après Correction

### Commandes de validation

```bash
# Scanner unwrap/expect restants
rg 'unwrap\(\)|expect\(' src-tauri/src --type rust | grep -v "\.rs:#\[cfg(test)\]" | grep -v "// Safe:"

# Compiler
cargo build

# Tester (résoudre OpenSSL avant)
cargo test --lib
```

### Résultat attendu

- **P0**: 0 unwrap/expect en code production
- **P1**: Documentés ou corrigés
- **P2/P3**: Améliorés progressivement

---

## 📚 Pattern de Correction Complet

### 1. Option<T> → Result<T, E>

```rust
// AVANT
let value = option.unwrap();

// APRÈS
let value = option.ok_or_else(|| AppError::InvalidInput("Value is None".to_string()))?;
```

### 2. Result<T, E> → Propagation

```rust
// AVANT
let content = fs::read_to_string(path).unwrap();

// APRÈS
let content = fs::read_to_string(path)
    .map_err(|e| AppError::Io(e))?;
```

### 3. Mutex/RwLock poison

```rust
// AVANT
let guard = mutex.lock().unwrap();

// APRÈS
let guard = mutex.lock()
    .map_err(|e| AppError::LockPoisoned(e.to_string()))?;
```

### 4. Tests unitaires (optionnel mais mieux)

```rust
// AVANT
#[tokio::test]
async fn test_something() {
    let result = function().await.unwrap();
    assert_eq!(result, expected);
}

// APRÈS
#[tokio::test]
async fn test_something() -> Result<(), Box<dyn std::error::Error>> {
    let result = function().await?;
    assert_eq!(result, expected);
    Ok(())
}
```

---

## 🎯 Objectif Final Phase 1

- [x] AppError créé et intégré
- [ ] **0 unwrap/expect en P0** (production critique)
- [ ] **P1 documentés** (lazy_static safe)
- [ ] **Tests P0 passent** (après fix OpenSSL)
- [ ] **Commit**: `fix(backend): 🔥 Phase 1 — Élimination unwrap/expect P0`

---

**Version**: 1.0
**Date**: 2025-12-09
**Auteur**: TITANE∞ Stabilization Team
