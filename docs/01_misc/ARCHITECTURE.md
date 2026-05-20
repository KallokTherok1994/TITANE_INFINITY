# TITANE_INFINITY — Architecture Technique

## Vue d'Ensemble

TITANE_INFINITY est un assistant IA local-first avec architecture cognitive à 9 moteurs.

## Stack Technique

### Frontend

- **Framework:** React 18.3.1
- **Build:** Vite 6
- **Language:** TypeScript 5.3 (strict mode)
- **State:** Zustand
- **Testing:** Vitest
- **UI:** Framer Motion, Radix UI

### Backend

- **Runtime:** Tauri v2 + Rust 2021
- **Async:** tokio async/await
- **IPC:** Tauri commands
- **Storage:** JSON files (local-first)
- **Testing:** cargo test + cargo bench

## Architecture 9 Moteurs

### 1. Orchestrator (#0)

**Rôle:** Coordination centrale du pipeline OMEGA

**Responsabilités:**

- Orchestration séquentielle des 8 autres moteurs
- Gestion du workflow conversationnel
- Dispatch des requêtes vers moteurs appropriés

**Fichiers:**

- `src-tauri/src/engines/orchestrator.rs`
- `src/stores/orchestrator.ts`

### 2. Style Engine (#1)

**Rôle:** Style conversationnel adaptatif

**Responsabilités:**

- Analyse du ton de l'utilisateur
- Adaptation du style de réponse
- Maintien de la cohérence stylistique

**Fichiers:**

- `src-tauri/src/engines/style_engine.rs`
- `src/stores/style.ts`

### 3. CoherenceEngine

**Rôle:** Cohérence globale système

**Fusion de:** Nexus + Moteur #2 (ancien)

**Responsabilités:**

- Validation cohérence inter-moteurs
- Détection contradictions
- Synchronisation états

**Fichiers:**

- `src-tauri/src/engines/coherence_engine.rs`
- `src/stores/coherence.ts`

### 4. Reflection Engine (#3)

**Rôle:** Analyse réflexive et métacognition

**Responsabilités:**

- Auto-analyse des réponses
- Détection biais
- Amélioration continue

**Fichiers:**

- `src-tauri/src/engines/reflection_engine.rs`
- `src/stores/reflection.ts`

### 5. Emotion Engine (#4)

**Rôle:** Dimension émotionnelle

**Responsabilités:**

- Détection émotions utilisateur
- Adaptation empathique
- Gestion contexte émotionnel

**Fichiers:**

- `src-tauri/src/engines/emotion_engine.rs`
- `src/stores/emotion.ts`

### 6. UnifiedMemory

**Rôle:** Mémoire unifiée STM/MTM/LTM

**Fusion de:** Systèmes mémoire multiples

**Responsabilités:**

- **STM** (Short-Term): Mémoire conversation courante
- **MTM** (Medium-Term): Mémoire session (quelques heures)
- **LTM** (Long-Term): Mémoire persistante

**Fichiers:**

- `src-tauri/src/memory/unified_memory.rs`
- `src/stores/memory.ts`

### 7. Behavior Engine (#6)

**Rôle:** Patterns comportementaux

**Responsabilités:**

- Détection patterns utilisateur
- Anticipation besoins
- Personnalisation comportement

**Fichiers:**

- `src-tauri/src/engines/behavior_engine.rs`
- `src/stores/behavior.ts`

### 8. Adaptation Engine (#7)

**Rôle:** Évolution et apprentissage

**Responsabilités:**

- Apprentissage préférences utilisateur
- Ajustement paramètres système
- Évolution continue

**Fichiers:**

- `src-tauri/src/engines/adaptation_engine.rs`
- `src/stores/adaptation.ts`

### 9. SystemHealth

**Rôle:** Monitoring + self-healing

**Fusion de:** Helios + Harmonia + Sentinel

**Responsabilités:**

- Monitoring performances
- Détection anomalies
- Auto-réparation erreurs
- Health checks périodiques

**Fichiers:**

- `src-tauri/src/health/system_health.rs`
- `src/stores/health.ts`

## Pipeline OMEGA

Séquence d'exécution lors d'une requête utilisateur:

```
User Input
    ↓
1. Orchestrator (dispatch)
    ↓
2. Style Engine (analyse ton)
    ↓
3. Emotion Engine (contexte émotionnel)
    ↓
4. UnifiedMemory (récupération contexte STM/MTM/LTM)
    ↓
5. Behavior Engine (patterns utilisateur)
    ↓
6. CoherenceEngine (validation cohérence)
    ↓
7. Reflection Engine (métacognition)
    ↓
8. Adaptation Engine (apprentissage)
    ↓
9. SystemHealth (health check)
    ↓
Response to User
```

## Communication IPC

### Frontend → Backend

```typescript
import { invoke } from '@tauri-apps/api/core';

const result = await invoke<ResponseType>('command_name', {
  param1: value1,
  param2: value2,
});
```

### Backend → Frontend

```rust
#[tauri::command]
pub async fn command_name(
    param1: String,
    param2: i32,
) -> Result<ResponseType, String> {
    // Implementation
    Ok(result)
}
```

## Standards de Code

### Rust

```rust
// async/await OBLIGATOIRE
pub async fn process() -> Result<Data, AppError> {
    let data = fetch_data().await?; // Pas de unwrap()
    Ok(data)
}

// Tests unitaires
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_process() {
        let result = process().await;
        assert!(result.is_ok());
    }
}
```

### TypeScript

```typescript
// Types explicites
async function process(input: string): Promise<Data> {
  try {
    return await riskyOp(input);
  } catch (error) {
    throw new AppError('Failed', error);
  }
}

// Tests Vitest
describe('process', () => {
  it('should handle input correctly', async () => {
    const result = await process('test');
    expect(result).toBeDefined();
  });
});
```

## Performance Targets

- **IPC latency:** < 200ms (P95)
- **Memory usage:** < 500MB en idle
- **Startup time:** < 3s
- **Test coverage:** > 80%
- **Build time:** < 60s

## Sécurité

- **Local-first:** Toutes données stockées localement
- **No telemetry:** Aucune donnée envoyée sans consentement
- **Encryption:** Données sensibles chiffrées AES-256
- **Sandboxing:** Tauri security model
