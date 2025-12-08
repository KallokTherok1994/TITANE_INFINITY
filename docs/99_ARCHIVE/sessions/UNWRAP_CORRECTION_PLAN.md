# Plan de Correction des unwrap() — TITANE INFINITY

**Date:** 6 Décembre 2025  
**Version:** v19.2.3  
**Statut:** 🟡 EN COURS

---

## 📊 ANALYSE DÉTAILLÉE

### Statistiques Globales

| Catégorie | Occurrences | Criticité | Action |
|-----------|-------------|-----------|--------|
| **Tests** | ~250 | ✅ OK | Acceptable dans les tests |
| **Archive** | ~231 | 🟢 FAIBLE | Code non utilisé |
| **Production** | ~184 | 🔴 CRITIQUE | **À CORRIGER** |
| **TOTAL** | **665** | | |

### Répartition Par Module (Production)

| Module | unwrap() | expect() | Criticité | Priorité |
|--------|----------|----------|-----------|----------|
| **audio/streaming_engine.rs** | 29 | 0 | 🔴 HAUTE | P0 |
| **audio/commands.rs** | 7 | 0 | 🔴 HAUTE | P0 |
| **memory_persistence.rs** | 1 | 0 | 🟡 MOYENNE | P1 |
| **hyper_evolution/** | 2 | 0 | 🟢 FAIBLE | P2 |
| **numeric_twin/** | 1 | 0 | 🟢 FAIBLE | P2 |
| **Autres modules** | ~144 | ~80 | 🟡 VARIABLE | P1-P2 |

---

## 🎯 PLAN D'ACTION PRIORISÉ

### Phase 0: URGENT (Aujourd'hui) ⚡

**Module:** `audio/streaming_engine.rs` (29 unwrap())

**Contexte:** Audio streaming en temps réel, crashes = perte d'expérience utilisateur

**Lignes critiques:**
```rust
Line 227:  *self.state.lock().unwrap() = StreamingState::Listening;
Line 269:  let current_state = *state.lock().unwrap();
Line 275:  *state.lock().unwrap() = StreamingState::Recording;
Line 276:  *speech_start.lock().unwrap() = Some(Instant::now());
Line 277:  *last_speech.lock().unwrap() = Some(Instant::now());
Line 283:  *last_speech.lock().unwrap() = Some(Instant::now());
Line 286:  if let Some(last) = *last_speech.lock().unwrap() {
Line 290:  *state.lock().unwrap() = StreamingState::Processing;
... (21 autres lignes)
```

**Solution Recommandée:**

```rust
// ❌ AVANT
*self.state.lock().unwrap() = StreamingState::Listening;

// ✅ APRÈS (avec recovery)
if let Ok(mut state) = self.state.lock() {
    *state = StreamingState::Listening;
} else {
    log::error!("[StreamingEngine] ⚠️ State mutex poisoned, recovering");
    // Recover from poisoned mutex
    *self.state.lock().unwrap_or_else(|e| e.into_inner()) = StreamingState::Listening;
}

// ✅ ALTERNATIVE (plus concis)
let mut state = self.state.lock()
    .unwrap_or_else(|e| {
        log::warn!("Mutex poisoned, recovering");
        e.into_inner()
    });
*state = StreamingState::Listening;
```

**Effort:** 2-3 heures  
**Impact:** ⭐⭐⭐⭐⭐ Élimine crashes audio

---

### Phase 1: IMPORTANT (Cette semaine)

**Module:** `audio/commands.rs` (7 unwrap())

**Contexte:** Commandes Tauri audio, global state

**Lignes critiques:**
```rust
Line 1397: *WHISPER_ENGINE.lock().unwrap() = Some(engine);
Line 1398: *AUDIO_TX.lock().unwrap() = Some(audio_tx);
Line 1412: let tx_guard = AUDIO_TX.lock().unwrap();
Line 1438: *AUDIO_TX.lock().unwrap() = None;
Line 1441: if let Some(ref engine) = *WHISPER_ENGINE.lock().unwrap() {
Line 1445: *WHISPER_ENGINE.lock().unwrap() = None;
Line 726:  Ok(serde_json::to_value(state).unwrap())
```

**Solution:**

```rust
// ❌ AVANT
*WHISPER_ENGINE.lock().unwrap() = Some(engine);

// ✅ APRÈS
WHISPER_ENGINE.lock()
    .map_err(|e| AudioError::InternalError(format!("Lock poisoned: {}", e)))?
    .replace(engine);

// Pour les static globals
lazy_static! {
    static ref WHISPER_ENGINE: Mutex<Option<WhisperEngine>> = Mutex::new(None);
}

// Helper function
fn set_whisper_engine(engine: WhisperEngine) -> Result<(), AudioError> {
    WHISPER_ENGINE.lock()
        .map_err(|e| AudioError::InternalError(format!("Lock poisoned: {}", e)))?
        .replace(engine);
    Ok(())
}
```

**Effort:** 1-2 heures  
**Impact:** ⭐⭐⭐⭐ Stabilise commandes audio

---

### Phase 2: AMÉLIORATION (Semaine prochaine)

**Modules restants:**
- `memory_persistence.rs` (1 unwrap)
- `hyper_evolution/` (2 unwrap)
- `numeric_twin/` (1 unwrap)
- Autres modules mineurs (~140 unwrap)

**Stratégie:**

1. **Audit par module:**
   ```bash
   rg "\.unwrap\(\)" --type rust src/module/ -n | grep -v test
   ```

2. **Correction batch:**
   - Grouper par pattern similaire
   - Créer helpers de gestion d'erreur
   - Appliquer systématiquement

3. **Validation:**
   ```bash
   cargo clippy -- -D warnings
   cargo test
   ```

**Effort:** 10-15 heures  
**Impact:** ⭐⭐⭐ Robustesse complète

---

## 🛠️ TECHNIQUES DE CORRECTION

### Technique #1: Pattern de Recovery pour Mutex

```rust
use std::sync::{Mutex, PoisonError};

impl<T> Mutex<T> {
    /// Helper pour récupérer même si empoisonné
    pub fn lock_or_recover(&self) -> std::sync::MutexGuard<T> {
        self.lock().unwrap_or_else(|e| {
            log::warn!("Mutex poisoned, recovering");
            e.into_inner()
        })
    }
}

// Usage
*self.state.lock_or_recover() = NewState;
```

### Technique #2: Type Result Unifié

```rust
// src-tauri/src/error.rs
#[derive(Debug, Error)]
pub enum AppError {
    #[error("Mutex poisoned: {0}")]
    MutexPoisoned(String),
    
    #[error("Lock error: {0}")]
    LockError(String),
    
    // ... autres erreurs
}

impl<T> From<PoisonError<T>> for AppError {
    fn from(e: PoisonError<T>) -> Self {
        AppError::MutexPoisoned(e.to_string())
    }
}

// Usage dans fonctions async
pub async fn process(&self) -> Result<(), AppError> {
    let mut state = self.state.lock()?; // Auto-conversion!
    *state = NewState;
    Ok(())
}
```

### Technique #3: Macro pour Pattern Répétitif

```rust
macro_rules! lock_or_recover {
    ($mutex:expr) => {
        $mutex.lock().unwrap_or_else(|e| {
            log::warn!("Mutex poisoned, recovering: {}", e);
            e.into_inner()
        })
    };
}

// Usage
*lock_or_recover!(self.state) = NewState;
```

---

## 📝 CHECKLIST CORRECTION

### Par Fichier

- [ ] **audio/streaming_engine.rs**
  - [ ] Lines 220-230: state.lock() recovery
  - [ ] Lines 265-295: VAD processing locks
  - [ ] Lines 310-350: Stream stop cleanup
  - [ ] Lines 355-385: Getters/Setters
  - [ ] Test: Audio streaming ne crash pas

- [ ] **audio/commands.rs**
  - [ ] Lines 1397-1445: Global state access
  - [ ] Line 726: JSON serialization
  - [ ] Test: Toutes commandes audio OK

- [ ] **memory_persistence.rs**
  - [ ] Line 174: get_all_files()
  - [ ] Test: Memory persistence stable

- [ ] **Autres modules**
  - [ ] Audit systématique module par module
  - [ ] Grouper par patterns similaires
  - [ ] Appliquer corrections batch

### Tests Validation

```bash
# Aucun unwrap/expect en production
cd src-tauri
rg "\.unwrap\(\)" src/ -n | grep -v "test\|archive" | wc -l
# Doit être 0

rg "\.expect\(" src/ -n | grep -v "test\|archive" | wc -l  
# Doit être 0

# Build sans warnings
cargo clippy -- -D warnings
# 0 warning

# Tests passent
cargo test
# All pass

# Run app
cargo run --release
# No panic
```

---

## 🎯 OBJECTIFS FINAUX

### Court Terme (Cette semaine)
- ✅ Audio modules: 0 unwrap() en production
- ✅ Clippy: 0 warning
- ✅ Tests: Aucun panic détecté

### Moyen Terme (Semaine prochaine)
- ✅ TOUS modules: 0 unwrap/expect en production
- ✅ Error handling: Type Result unifié
- ✅ Tests: >50% coverage + stress tests

### Long Terme (Mois prochain)
- ✅ Production deployment: 0 crash observé
- ✅ Monitoring: Alertes sur panics
- ✅ Documentation: Guide error handling

---

## 📊 MÉTRIQUES DE SUIVI

| Métrique | Baseline | Cible | Actuel | Status |
|----------|----------|-------|--------|--------|
| unwrap() production | 184 | 0 | 184 | 🔴 |
| expect() production | ~80 | 0 | ~80 | 🔴 |
| Clippy warnings | 0 | 0 | 0 | ✅ |
| Tests coverage | 0% | >50% | 0% | 🔴 |
| Crash reports | ? | 0 | ? | ⚠️ |

---

## 🚀 PROCHAINES ACTIONS IMMÉDIATES

1. **MAINTENANT:** Corriger `audio/streaming_engine.rs` (29 unwrap)
   ```bash
   code src-tauri/src/audio/streaming_engine.rs
   # Focus lignes 220-400
   ```

2. **ENSUITE:** Corriger `audio/commands.rs` (7 unwrap)
   ```bash
   code src-tauri/src/audio/commands.rs
   # Focus lignes 700-1450
   ```

3. **PUIS:** Tests audio streaming
   ```bash
   cargo test audio::streaming
   cargo run --release  # Test manuel
   ```

4. **VALIDATION:**
   ```bash
   rg "\.unwrap\(\)" src/audio/ -n | grep -v test | wc -l
   # Doit être 0
   ```

---

**Statut:** 🟡 EN COURS  
**Prochaine mise à jour:** Après Phase 0  
**Owner:** @KallokTherok1994
