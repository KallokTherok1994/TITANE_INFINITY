# 📚 Guide Migration: console.log → Logger Structuré

**TITANE∞ v24.2.0**  
**Date**: 12 décembre 2025

---

## 🎯 Objectif

Remplacer tous les `console.log`, `console.warn`, `console.error` dispersés par le système de logging structuré centralisé.

**Bénéfices**:

- ✅ Logs structurés avec contexte
- ✅ Niveaux de log configurables
- ✅ Buffer pour analytics
- ✅ Export JSON/texte
- ✅ Configuration par environnement
- ✅ Performance (désactivable en prod)

---

## 📖 Usage de Base

### Import

```typescript
import { logger } from '@/lib/logger';
// OU dans composants React
import { useLogger } from '@/lib/logger';
```

### Niveaux de Log

```typescript
// DEBUG - Informations détaillées de débogage
logger.debug('Processing item', { itemId: '123', step: 1 });

// INFO - Informations générales
logger.info('User logged in', { userId: user.id });

// WARN - Avertissements (non-critique)
logger.warn('Slow response', { latencyMs: 5000, endpoint: '/api/search' });

// ERROR - Erreurs récupérables
logger.error('Failed to load data', { module: 'VectorStore' }, error);

// CRITICAL - Erreurs critiques
logger.critical('System crash imminent', { freeMemory: '10MB' }, error);
```

---

## 🔄 Patterns de Migration

### Pattern 1: Simple Log

```typescript
// ❌ AVANT
console.log('[VoiceFingerprint] 🔬 Extracting features');

// ✅ APRÈS
logger.info('Extracting features', { module: 'VoiceFingerprint' });
```

### Pattern 2: Log avec Données

```typescript
// ❌ AVANT
console.log('[VectorStoreClient] Initialized:', this.storeId);

// ✅ APRÈS
logger.info('Initialized', {
  module: 'VectorStoreClient',
  storeId: this.storeId,
});
```

### Pattern 3: Logs d'Erreur

```typescript
// ❌ AVANT
console.error('[VectorStoreClient] Insert failed:', error);

// ✅ APRÈS
logger.error('Insert failed', { module: 'VectorStoreClient' }, error);
```

### Pattern 4: Logs Conditionnels

```typescript
// ❌ AVANT
if (DEBUG_MODE) {
  console.log('[Engine] Step 1 complete');
}

// ✅ APRÈS
logger.debug('Step 1 complete', { module: 'Engine' });
// Le logger gère automatiquement le niveau selon l'environnement
```

### Pattern 5: Dans Composants React

```typescript
// ❌ AVANT
function ChatInput() {
  useEffect(() => {
    console.log('[ChatInput] Component mounted');
  }, []);
}

// ✅ APRÈS
function ChatInput() {
  const log = useLogger('ChatInput');

  useEffect(() => {
    log.info('Component mounted');
  }, []);
}
```

---

## 📋 Migration par Fichier

### VoiceFingerprint.ts (12 occurrences)

```typescript
// ❌ AVANT
console.log('[VoiceFingerprint] 🔬 Extracting features from audio buffer');
console.log('[VoiceFingerprint] 📝 Adding wake word sample');
console.log(`[VoiceFingerprint] ✅ Sample added (${fingerprint.sampleCount} total)`);
console.warn('[VoiceFingerprint] ⚠️ Not enough samples for similarity check');
console.log(`[VoiceFingerprint] 🎯 Similarity: ${similarity.toFixed(3)}`);
console.log('[VoiceFingerprint] 💾 Fingerprints saved');
console.error('[VoiceFingerprint] ❌ Save error:', error);

// ✅ APRÈS
import { logger } from '@/lib/logger';

const MODULE = 'VoiceFingerprint';

logger.debug('Extracting features from audio buffer', { module: MODULE });
logger.info('Adding wake word sample', { module: MODULE });
logger.info('Sample added', {
  module: MODULE,
  sampleCount: fingerprint.sampleCount,
});
logger.warn('Not enough samples for similarity check', { module: MODULE });
logger.info('Similarity calculated', {
  module: MODULE,
  similarity: similarity.toFixed(3),
});
logger.info('Fingerprints saved', { module: MODULE });
logger.error('Save error', { module: MODULE }, error);
```

### VectorStoreClient.ts (10 occurrences)

```typescript
// ❌ AVANT
console.log('[VectorStoreClient] Initialized:', this.storeId);
console.error('[VectorStoreClient] Initialization failed:', error);
console.error('[VectorStoreClient] Insert failed:', error);
console.warn('VectorStoreClient.deleteWhere not yet implemented');

// ✅ APRÈS
import { logger } from '@/lib/logger';

const MODULE = 'VectorStoreClient';

logger.info('Initialized', { module: MODULE, storeId: this.storeId });
logger.error('Initialization failed', { module: MODULE }, error);
logger.error('Insert failed', { module: MODULE }, error);
logger.warn('deleteWhere not yet implemented', { module: MODULE });
```

### SingularityFusionEngine.ts (15 occurrences)

```typescript
// ❌ AVANT
console.warn('[FusionEngine] Already initialized');
console.log('[FusionEngine] ✨ Initialized v∞');
console.error('[FusionEngine] Cycle error:', error);
console.warn('[FusionEngine v∞.Ω] ⚠️ Performance issues:', bottlenecks);

// ✅ APRÈS
import { logger } from '@/lib/logger';

const MODULE = 'SingularityFusion';

logger.warn('Already initialized', { module: MODULE });
logger.info('Initialized v∞', { module: MODULE });
logger.error('Cycle error', { module: MODULE }, error);
logger.warn('Performance issues detected', {
  module: MODULE,
  bottlenecks,
});
```

### AppMinimalTest.tsx (4 occurrences)

```typescript
// ❌ AVANT
console.log('🎨 [AppMinimalTest] Component rendering...');
console.log('✅ [AppMinimalTest] Component mounted successfully!');

// ✅ APRÈS
import { useLogger } from '@/lib/logger';

function AppMinimalTest() {
  const log = useLogger('AppMinimalTest');

  log.debug('Component rendering');

  useEffect(() => {
    log.info('Component mounted successfully');
  }, []);
}
```

---

## ⚙️ Configuration

### Environnement Development

```typescript
// vite.config.ts ou .env.development
logger.configure({
  minLevel: 'debug', // Tout logger
  enableConsole: true, // Console active
  enableFile: false, // Pas de fichier
  format: 'text', // Format lisible
});
```

### Environnement Production

```typescript
// .env.production
logger.configure({
  minLevel: 'warn', // Seulement warn/error/critical
  enableConsole: false, // Pas de console
  enableFile: true, // Logs fichier
  format: 'compact', // Format compact
  excludeModules: ['Debug', 'Test'], // Exclure modules debug
});
```

### Configuration Dynamique

```typescript
// Activer debug pour module spécifique
logger.configure({
  forceModules: ['VectorStore', 'VoiceFingerprint'],
});

// Exclure modules bavards
logger.configure({
  excludeModules: ['Particles', 'Animation'],
});
```

---

## 🔍 Debugging & Analytics

### Voir Buffer Logs

```typescript
const recentLogs = logger.getBuffer();
console.table(recentLogs);
```

### Exporter Logs

```typescript
// Export JSON pour analytics
const jsonLogs = logger.exportLogs('json');
await saveToFile(jsonLogs, 'logs.json');

// Export texte pour debugging
const textLogs = logger.exportLogs('text');
console.log(textLogs);
```

### Vider Buffer

```typescript
logger.clearBuffer();
```

---

## 📊 Checklist Migration

### Fichiers Haute Priorité (Production)

- [ ] `src/services/voice/voiceFingerprint.ts` (12 logs)
- [ ] `src/services/unified/VectorStoreClient.ts` (10 logs)
- [ ] `src/core/singularity/SingularityFusionEngine.ts` (15 logs)
- [ ] `src/modules/hybrid/HybridEngine.ts` (2 logs)
- [ ] `src/services/cognitive/ConversationEvaluationEngine.ts` (1 log)

### Fichiers Moyenne Priorité

- [ ] `src/os/config/ConfigManager.ts` (4 logs)
- [ ] `src/lib/validation.ts` (1 log)
- [ ] `src/services/ai/gateway/types.ts` (4 logs)

### Fichiers Test/Debug (Optionnel)

- [ ] `src/AppMinimalTest.tsx` (4 logs)
- [ ] Autres fichiers test

---

## 🎯 TODO Backend (Tauri)

### Implémenter Commande Tauri

```rust
// src-tauri/src/commands/logger.rs

#[tauri::command]
pub async fn log_to_file(entry: String) -> Result<(), String> {
    use std::fs::OpenOptions;
    use std::io::Write;

    let log_file = "logs/titane.log";
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_file)
        .map_err(|e| e.to_string())?;

    writeln!(file, "{}", entry)
        .map_err(|e| e.to_string())?;

    Ok(())
}
```

### Enregistrer Commande

```rust
// src-tauri/src/main.rs

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            log_to_file,
            // ... autres commandes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## 📈 Métriques Progression

### État Actuel

```
Console.log identifiés:  50+ occurrences
Fichiers impactés:       15+ fichiers
Migration:               0% complétée
```

### Objectif

```
Console.log restants:    0 occurrences
Logger structuré:        100% coverage
Format:                  Unifié + configurable
```

---

## 🚀 Prochaines Étapes

1. **Phase 1**: Migrer fichiers haute priorité (production)
2. **Phase 2**: Migrer fichiers moyenne priorité
3. **Phase 3**: Implémenter backend Tauri pour logs fichier
4. **Phase 4**: Ajouter analytics service (optionnel)
5. **Phase 5**: Configurer CI/CD pour bloquer nouveaux console.log

---

**TITANE∞ v24.2.0 — The Infinite Meta-Intelligence**  
_Guide créé le 12 décembre 2025_
