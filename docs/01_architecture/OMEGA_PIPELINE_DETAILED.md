# ⚡ TITANE∞ — Pipeline OMEGA v2 Détaillé (Code Réel)

**Date:** 15 décembre 2025  
**Version:** v24.2.0  
**Source:** [`src-tauri/src/omega/pipeline.rs`](../../src-tauri/src/omega/pipeline.rs) (589 lignes)

---

## 🎯 VUE D'ENSEMBLE

Pipeline OMEGA = **4 étapes séquentielles** pour traiter toute requête cognitive :

```
INPUT → [1. Router] → [2. Executor] → [3. Merger] → [4. Guardrails] → OUTPUT
```

**Caractéristiques** :
- **Timeout adaptatif** : Configuration par requête
- **Diagnostics intégrés** : Métriques chaque étape
- **Safety-first** : Guardrails finaux obligatoires
- **Async/Tokio** : Traitement parallèle interne

---

## 📊 LES 4 ÉTAPES (Implémentation Réelle)

### ÉTAPE 1 — ROUTER (Routage Intelligence)

**Fichier** : `src-tauri/src/omega/router.rs`  
**Lignes** : pipeline.rs L169-202

```rust
// STAGE 1: ROUTER
let router_input = StageInput {
    request_id: request_id.clone(),
    data: serde_json::json!({ "text": input_text }),
    context: context.clone(),
};

let router_output = self.router.process(router_input).await?;
self.diagnostics.record_stage(
    PipelineStage::Router,
    router_output.latency_ms,
    router_output.success,
).await;
```

**Rôle** :
- Analyse intent utilisateur (question, commande, conversation)
- Sélectionne mode exécution (local, cloud, hybrid)
- Vérifie cache (réponses précédentes)
- Détermine confidence score

**Output** :
```rust
pub struct RoutingResult {
    pub request_id: String,
    pub intent: Intent,          // Question | Command | Conversation
    pub confidence: f64,          // 0.0 - 1.0
    pub execution_mode: ExecutionMode, // Local | Cloud | Hybrid
    pub cache_hit: bool,
    pub cached_response: Option<String>,
}
```

**Performance** : ~10-50ms (analyse rapide)

---

### ÉTAPE 2 — EXECUTOR (Exécution Tâches)

**Fichier** : `src-tauri/src/omega/executor.rs`  
**Lignes** : pipeline.rs L213-237

```rust
// STAGE 2: EXECUTOR
let executor_input = StageInput {
    request_id: request_id.clone(),
    data: serde_json::json!({ "text": input_text }),
    context: context.clone(),
};

let executor_output = self.executor.process(executor_input).await?;
```

**Rôle** :
- Exécute tâches selon routing
- Gère workers parallèles (jusqu'à 4 simultanés)
- Intègre Memory OS (STM/MTM/LTM)
- Collecte résultats multi-sources

**Modes** :
- **Local** : Ollama, modèles embarqués
- **Cloud** : OpenAI, Claude, Gemini
- **Hybrid** : Fusion local + cloud

**Output** :
```rust
pub struct ExecutionResult {
    pub request_id: String,
    pub results: Vec<TaskResult>, // Résultats multiples
    pub total_duration: u64,
    pub workers_used: usize,
}

pub struct TaskResult {
    pub task_id: String,
    pub source: String,           // "openai", "ollama", etc.
    pub content: String,
    pub confidence: f64,
    pub latency_ms: u64,
}
```

**Performance** : 100ms - 30s (selon provider)

---

### ÉTAPE 3 — MERGER (Fusion Intelligente)

**Fichier** : `src-tauri/src/omega/merger.rs`  
**Lignes** : pipeline.rs L246-275

```rust
// STAGE 3: MERGER
let merger_input = StageInput {
    request_id: request_id.clone(),
    data: serde_json::json!({}), // Utilise context.previous_outputs
    context: context.clone(),
};

let merger_output = self.merger.process(merger_input).await?;
```

**Rôle** :
- Fusionne résultats multiples (si Executor hybrid)
- Sélectionne meilleure réponse (quality scoring)
- Combine connaissances complémentaires
- Calcule confidence finale

**Stratégies** :
```rust
pub enum MergeStrategy {
    SelectBest,       // Sélectionne score le plus élevé
    Concatenate,      // Combine toutes réponses
    Weighted,         // Moyenne pondérée confidence
    Consensus,        // Accord multi-sources
}
```

**Output** :
```rust
pub struct MergeResult {
    pub request_id: String,
    pub response: String,         // Réponse fusionnée
    pub confidence: f64,
    pub sources: Vec<TaskResult>, // Sources utilisées
    pub strategy: MergeStrategy,
    pub quality_score: f64,       // 0.0 - 1.0
}
```

**Performance** : ~5-20ms (traitement léger)

---

### ÉTAPE 4 — GUARDRAILS (Validation Sécurité)

**Fichier** : `src-tauri/src/omega/guardrails.rs`  
**Lignes** : pipeline.rs L283-325

```rust
// STAGE 4: GUARDRAILS
let guardrails_input = StageInput {
    request_id: request_id.clone(),
    data: serde_json::json!({}),
    context: context.clone(),
};

let guardrails_result = self.guardrails.process(guardrails_input).await;

let (final_response, was_blocked, safety_score) = match guardrails_result {
    Ok(output) => {
        let guardrail: GuardrailResult = serde_json::from_value(output.data)?;
        (guardrail.final_response, guardrail.was_blocked, guardrail.safety_score)
    }
    Err(OmegaError::GuardrailsBlocked(reason)) => {
        self.diagnostics.record_blocked().await;
        ("Je ne peux pas répondre à cette demande.".to_string(), true, 0.0)
    }
    Err(e) => return Err(e),
};
```

**Rôle** :
- Validation sécurité (contenu inapproprié, données sensibles)
- Filtrage hallucinations (fact-checking)
- Vérification cohérence (contradictions logiques)
- Application policies IA (gouvernance)

**Checks** :
```rust
pub struct GuardrailCheck {
    pub name: String,
    pub passed: bool,
    pub severity: Severity, // Low | Medium | High | Critical
    pub message: Option<String>,
}

pub enum Severity {
    Low,      // Warning seulement
    Medium,   // Modification texte
    High,     // Blocage potentiel
    Critical, // Blocage immédiat
}
```

**Output** :
```rust
pub struct GuardrailResult {
    pub request_id: String,
    pub original_response: String,
    pub final_response: String,   // Potentiellement modifié
    pub was_modified: bool,
    pub was_blocked: bool,
    pub safety_score: f64,        // 0.0 - 1.0
    pub checks: Vec<GuardrailCheck>,
    pub block_reason: Option<String>,
}
```

**Performance** : ~10-50ms (analyse sécurité)

---

## 🔄 FLUX COMPLET ANNOTÉ

```rust
pub async fn process(&self, input: PipelineInput) -> OmegaResult<PipelineOutput> {
    let start = std::time::Instant::now();
    let mut context = StageContext::default();
    
    // === 1. ROUTER ===
    let router_result = self.router.process(router_input).await?;
    context.previous_outputs.insert(PipelineStage::Router, router_result.data);
    
    // Cache hit shortcut
    if routing.cache_hit {
        return Ok(PipelineOutput {
            response: routing.cached_response.unwrap(),
            // ...
        });
    }
    
    // === 2. EXECUTOR ===
    let executor_result = self.executor.process(executor_input).await?;
    context.previous_outputs.insert(PipelineStage::Executor, executor_result.data);
    
    // === 3. MERGER ===
    let merger_result = self.merger.process(merger_input).await?;
    context.previous_outputs.insert(PipelineStage::Merger, merger_result.data);
    
    // === 4. GUARDRAILS ===
    let guardrails_result = self.guardrails.process(guardrails_input).await;
    let (final_response, was_blocked, safety_score) = match guardrails_result {
        Ok(output) => extract_guardrail_result(output),
        Err(OmegaError::GuardrailsBlocked(_)) => {
            ("Réponse bloquée".to_string(), true, 0.0)
        }
        Err(e) => return Err(e),
    };
    
    // === BUILD OUTPUT ===
    let total_latency = start.elapsed().as_millis() as u64;
    
    Ok(PipelineOutput {
        request_id: input.request_id,
        response: final_response,
        metadata: OutputMetadata {
            intent: format!("{:?}", routing.intent),
            confidence: routing.confidence,
            safety_score,
            timings: timings_map,
            total_latency_ms: total_latency,
        },
    })
}
```

---

## ⚙️ CONFIGURATION & TUNING

### Configuration Globale

```rust
pub struct OmegaConfig {
    pub timeout_ms: u64,           // Timeout global (défaut 30000)
    pub max_retries: u32,          // Retries max (défaut 2)
    pub enable_cache: bool,        // Cache actif (défaut true)
    pub cache_ttl_secs: u64,       // TTL cache (défaut 3600)
    pub max_parallel_workers: usize, // Workers max (défaut 4)
    pub guardrails_level: GuardrailLevel, // Strict | Moderate | Permissive
}
```

### Builder Pattern

```rust
let pipeline = OmegaPipelineBuilder::new()
    .with_timeout(60000)  // 60s
    .with_cache_ttl(1800) // 30min
    .with_max_workers(8)
    .with_guardrails(GuardrailLevel::Strict)
    .build()
    .await?;
```

---

## 📈 MÉTRIQUES & DIAGNOSTICS

### Métriques Collectées

```rust
pub struct PipelineStats {
    pub total_requests: u64,
    pub successful_requests: u64,
    pub failed_requests: u64,
    pub blocked_requests: u64,
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub avg_latency_ms: f64,
    pub p95_latency_ms: u64,
    pub p99_latency_ms: u64,
}
```

### Health Check

```rust
#[derive(Serialize)]
pub struct PipelineHealth {
    pub status: HealthStatus,     // Healthy | Degraded | Critical
    pub router_ok: bool,
    pub executor_ok: bool,
    pub merger_ok: bool,
    pub guardrails_ok: bool,
    pub cache_ok: bool,
}

pub async fn health_check(&self) -> PipelineHealth {
    // Teste chaque composant
}
```

---

## 🧪 TESTS & VALIDATION

### Test Unitaire

```rust
#[tokio::test]
async fn test_pipeline_full_flow() {
    let pipeline = OmegaPipelineBuilder::new().build().await.unwrap();
    
    let input = PipelineInput {
        request_id: "test-123".to_string(),
        text: "Quelle est la capitale de la France?".to_string(),
        context: HashMap::new(),
    };
    
    let output = pipeline.process(input).await.unwrap();
    
    assert!(output.response.contains("Paris"));
    assert!(output.metadata.safety_score > 0.8);
    assert!(output.metadata.total_latency_ms < 5000);
}
```

### Test Intégration

```bash
# Test via Tauri command
curl -X POST http://localhost:1420/omega/process \
  -H "Content-Type: application/json" \
  -d '{"text": "Test pipeline OMEGA"}'
```

---

## 🚀 OPTIMISATIONS FUTURES

1. **Streaming Support** : Réponses progressives (étape par étape)
2. **Parallel Stages** : Router + Executor simultanés (gain 30%)
3. **Smart Caching** : Cache par étape (pas seulement final)
4. **Auto-tuning** : Ajustement config selon métriques

---

## 🔗 FICHIERS SOURCES

| Fichier | Lignes | Composant |
|---------|--------|-----------|
| [`omega/pipeline.rs`](../../src-tauri/src/omega/pipeline.rs) | 589 | Pipeline principal |
| `omega/router.rs` | ~400 | Router étape 1 |
| `omega/executor.rs` | ~600 | Executor étape 2 |
| `omega/merger.rs` | ~350 | Merger étape 3 |
| `omega/guardrails.rs` | ~450 | Guardrails étape 4 |
| `omega/diagnostics.rs` | ~200 | Métriques & monitoring |
| `omega/scheduler.rs` | ~180 | Job scheduling |

---

**Statut** : ✅ Pipeline documenté factuellement (code v24.2.0)  
**Prochaine étape** : [TAURI_COMMANDS_REFERENCE.md](../06_api/TAURI_COMMANDS_REFERENCE.md)

---

*TITANE∞ Documentation Evolution Engine — Phase 2 Architecture*
