# TITANE∞ v19.3Ω — Observability Audit

## Date: 2025-01-24
## Scope: Logging, Metrics, Tracing

---

## 📊 État actuel de l'observabilité

### Logging Frontend
| Catégorie | Quantité | Évaluation |
|-----------|----------|------------|
| console.log dans useChat.ts | 28 | ✅ Bon (debug) |
| console.error | Variable | ✅ Présent |
| console.warn | Variable | ✅ Présent |

**Format typique:**
```typescript
console.log('[useChat OMNIS] 🚀 sendMessage appelé avec:', content?.substring(0, 50));
console.log('[useChat OMNIS] 🛡️ PROTECTED: Skipping sync during loading');
```

### Logging Backend Rust
| Catégorie | Quantité | Évaluation |
|-----------|----------|------------|
| println! dans chat_orchestrator.rs | 21 | ⚠️ Pas structuré |
| println!/eprintln! total | ~500 | ⚠️ À améliorer |

### Metrics existantes
- **HyperMetrics** - Métriques HyperIntelligence
- **SystemMetrics** - Métriques système (useHyperVision)
- **EngineMetrics** - Métriques moteurs

---

## ✅ Points Positifs

### 1. Préfixes de log cohérents
```typescript
// Frontend - Pattern cohérent
'[useChat OMNIS]' - Hook Chat
'[HybridTTS]' - Service TTS
'[OMEGA CHAT PAGE]' - Page Chat
```

### 2. Émojis pour lisibilité
```
🚀 - Démarrage opération
✅ - Succès
❌ - Erreur
🛡️ - Protection activée
🔒/🔓 - Lock/Unlock
```

### 3. Métriques internes
- `omnisStats` dans useChat
- `uiIntegrity` tracking
- `debugEntries` pour diagnostic

---

## ⚠️ Améliorations requises

### 1. Logs Rust non structurés

**Problème:**
```rust
println!("Starting chat orchestration...");
```

**Solution:**
```rust
// Utiliser tracing
use tracing::{info, error, warn, debug, instrument};

#[instrument(skip(self))]
async fn orchestrate(&self, input: &str) -> Result<String, Error> {
    info!(input = %input.len(), "Starting chat orchestration");
    // ...
}
```

### 2. Pas d'export de métriques

**Problème:** Les métriques sont collectées mais pas exportables

**Solution:**
```typescript
// Ajouter endpoint export
export function exportMetrics(): MetricsSnapshot {
  return {
    timestamp: Date.now(),
    chat: {
      totalRequests: omnisStats.totalRequests,
      successRate: omnisStats.successRate,
      autoHealCount: omnisStats.autoHealCount,
    },
    tts: hybridTTS.getStats(),
    memory: chatMemoryCompactor.getMemoryStats(),
  };
}
```

### 3. Pas de correlation ID

**Problème:** Difficile de tracer une requête end-to-end

**Solution:**
```typescript
// Ajouter requestId à chaque opération
const requestId = crypto.randomUUID();
console.log(`[useChat] [${requestId}] 🚀 Starting sendMessage`);
// Passer requestId au backend
const response = await chatService.sendMessage(messages, { requestId });
```

---

## 🔧 Recommandations

### Court terme (1 semaine)

#### 1. Ajouter `tracing` au backend Rust
```toml
# Cargo.toml
[dependencies]
tracing = "0.1"
tracing-subscriber = "0.3"
```

```rust
// main.rs
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

fn main() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .init();

    tauri::Builder::default()
        // ...
}
```

#### 2. Créer MetricsExporter frontend
```typescript
// src/services/metricsExporter.ts
class MetricsExporter {
  export(): MetricsSnapshot { ... }
  toJSON(): string { ... }
  toCLI(): string { ... }
}
```

### Moyen terme (1 mois)

#### 3. Ajouter correlation IDs
```typescript
// Chaque requête a un ID unique traçable
interface RequestContext {
  requestId: string;
  startTime: number;
  source: 'user' | 'system' | 'auto';
}
```

#### 4. Dashboard métriques
- Temps de réponse Chat
- Taux d'erreurs
- Utilisation mémoire
- TTS latency

### Long terme

#### 5. Export vers système externe (optionnel)
- OpenTelemetry pour traces
- Prometheus pour métriques
- Loki pour logs

---

## 📈 KPIs à tracker

| Métrique | Importance | Actuellement |
|----------|------------|--------------|
| Chat response time | P0 | ✅ debugEntries.latencyMs |
| TTS latency | P1 | ⚠️ Non tracké |
| Error rate | P0 | ✅ omnisStats.errorCount |
| Memory usage | P1 | ✅ memoryStats |
| Auto-heal count | P1 | ✅ omnisStats.autoHealCount |

---

## 📋 Checklist Observabilité

### Logs
- [x] Préfixes cohérents
- [x] Niveaux de log (info, warn, error)
- [ ] Logs structurés backend Rust
- [ ] Correlation IDs

### Métriques
- [x] Métriques internes Chat
- [x] Métriques mémoire
- [ ] Export métriques
- [ ] Dashboard

### Tracing
- [ ] Traces end-to-end
- [ ] OpenTelemetry integration
- [ ] Spans pour opérations async

---

## ✅ Conclusion

**Score Observabilité: 6.5/10**

Points forts:
- Logging frontend bien structuré
- Métriques internes présentes
- Préfixes et émojis pour lisibilité

Points à améliorer:
- Logs Rust non structurés (println!)
- Pas d'export de métriques
- Pas de correlation IDs pour traçage

**Action prioritaire:** Migrer backend Rust vers `tracing` crate

---

*Document généré par TITANE∞ Observability Audit System v19.3Ω*
