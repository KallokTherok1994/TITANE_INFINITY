# RUST UNWRAP() AUDIT — v24.2.0

**Date**: 15 décembre 2025  
**Objectif**: Identifier et catégoriser tous les `unwrap()` et `expect()` Rust  
**Priorité**: 🔴 CRITIQUE (Production Stability Risk)

---

## EXECUTIVE SUMMARY

**Total occurrences**: 261+ `unwrap()`/`expect()` à travers le codebase Rust  
**Impact**: Crash potentiel de l'application utilisateur en production  
**Action recommandée**: Remplacer P0 unwrap() par Result<T, AppError> pattern

---

## CATÉGORISATION

### P0 — CRITIQUE (Production Critical Paths)
> **Définition**: Code exécuté fréquemment dans le runtime utilisateur  
> **Impact**: Crash immédiat de l'application  
> **Action**: Remplacement IMMÉDIAT obligatoire

**Exemples de P0**:
- OMEGA Pipeline execution paths
- Memory operations (STM/MTM/LTM)
- API handlers (Tauri commands invoquées depuis UI)
- Message routing et streaming
- File I/O dans runtime paths

---

### P1 — IMPORTANT (Important Features)
> **Définition**: Fonctionnalités secondaires mais régulièrement utilisées  
> **Impact**: Feature crash possible  
> **Action**: Remplacer dans les 2-4 semaines

**Exemples de P1**:
- DevTools API handlers
- Diagnostic/monitoring endpoints
- Configuration loading (non-critical paths)
- Cache operations

---

### P2 — ACCEPTABLE (Tests, Setup, Rare Paths)
> **Définition**: Code de test, initialisation one-time, edge cases  
> **Impact**: Limité aux tests ou setup initial  
> **Action**: Acceptable, remplacer si temps disponible

**Exemples acceptables**:
- Test fixtures et mocks
- Configuration par défaut (validated ailleurs)
- Parsing de constantes hardcodées
- Setup initial avant runtime

---

## AUDIT DÉTAILLÉ PAR MODULE

### 🔴 OMEGA Pipeline

**Fichiers**:
- `omega/pipeline.rs`
- `omega/router.rs`
- `omega/executor.rs`
- `omega/merger.rs`
- `omega/guardrails.rs`

**Action**: Audit ligne par ligne pour identifier P0 occurrences

---

### 🟡 Memory Systems

**Fichiers**:
- `omega/memory_bridge.rs`
- `memory/unified_memory.rs` (si existe)
- `memory/persistence.rs` (si existe)

**Action**: Audit des unwrap() sur operations de lecture/écriture

---

### 🟡 API Handlers

**Fichiers**:
- `devtools/api.rs`
- `commands/*.rs`
- `api/*.rs`

**Action**: Identifier unwrap() dans les Tauri command handlers

---

### 🟢 Scheduler & Jobs

**Fichiers**:
- `omega/scheduler.rs`

**Action**: Catégoriser job execution vs. setup unwrap()

---

## PATTERN DE REMPLACEMENT

### ❌ AVANT (Unsafe)
```rust
pub async fn process_message(input: String) -> String {
    let parsed = parse_input(&input).unwrap(); // 💥 CRASH si parse échoue
    let result = engine.execute(parsed).await.unwrap(); // 💥 CRASH si exec fail
    result.to_string()
}
```

### ✅ APRÈS (Safe)
```rust
use crate::error::{AppError, AppResult};

pub async fn process_message(input: String) -> AppResult<String> {
    let parsed = parse_input(&input)
        .map_err(|e| AppError::ParseError(e.to_string()))?;
    
    let result = engine.execute(parsed).await
        .map_err(|e| AppError::ExecutionError(e.to_string()))?;
    
    Ok(result.to_string())
}
```

### ✅ Custom Error Type
```rust
// error.rs
use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error, Serialize)]
pub enum AppError {
    #[error("Parse error: {0}")]
    ParseError(String),
    
    #[error("Execution error: {0}")]
    ExecutionError(String),
    
    #[error("Memory error: {0}")]
    MemoryError(String),
    
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
}

pub type AppResult<T> = Result<T, AppError>;
```

---

## PLAN D'EXÉCUTION

### Phase 1 (Semaine 2): Audit P0
- [ ] Lister tous les unwrap() dans `omega/` modules critiques
- [ ] Identifier 10-20 unwrap() les plus dangereux
- [ ] Créer AppError enum de base
- [ ] Remplacer 5 unwrap() P0 comme POC

### Phase 2 (Semaine 3): Remplacements P0
- [ ] Remplacer 50-70 unwrap() P0 identifiés
- [ ] Ajouter tests pour error paths
- [ ] Documenter AppError variants

### Phase 3 (Semaines 4-5): P1 + Tests
- [ ] Auditer et remplacer unwrap() P1 (important features)
- [ ] Ajouter integration tests error scenarios
- [ ] Valider production stability

---

## MÉTRIQUES DE SUCCÈS

**Baseline actuel**:
- unwrap() P0: **~50-70** (estimé)
- unwrap() P1: **~100-120** (estimé)
- unwrap() P2: **~90** (tests, setup)

**Targets après 3 semaines**:
- unwrap() P0: **0** ✅
- unwrap() P1: **<20** ✅
- unwrap() P2: **acceptable** (~90)

**Impact attendu**:
- Production crashes: **-95%**
- Error visibility: **+100%** (via AppError serialization)
- Debug time: **-50%** (error messages clairs vs. panics)

---

## NEXT STEPS

1. **Maintenant**: Utiliser `grep_search` pour lister tous unwrap() dans `src-tauri/src/omega/`
2. **Ensuite**: Catégoriser manuellement P0/P1/P2
3. **Puis**: Créer `error.rs` avec AppError enum
4. **Enfin**: Remplacer P0 un par un avec tests

---

**Propriétaire**: DevOps Team  
**Reviewer**: Architecture Team  
**Timeline**: 3 semaines (Semaines 2-4 du roadmap)
