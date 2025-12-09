/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — UNIFIED MEMORY DEVELOPER GUIDE
 *   Guide d'utilisation du système de mémoire unifiée STM/MTM/LTM
 * ═══════════════════════════════════════════════════════════════════
 */

# Unified Memory System — Guide Développeur

## Architecture

Le système Unified Memory organise la mémoire en 3 tiers hiérarchiques:

### 📋 STM (Short-Term Memory)
- **Capacité**: 20 entrées max
- **TTL**: 5 minutes
- **Usage**: Messages récents d'une conversation
- **Auto-cleanup**: Expire automatiquement ou garde les 20 plus récents

### 📚 MTM (Medium-Term Memory)  
- **Capacité**: 100 entrées max
- **TTL**: 24 heures
- **Usage**: Contexte de session, décisions temporaires
- **Promotion**: Peut être promu vers LTM si accessCount >= 10 ou importance > 0.7

### 🏛️ LTM (Long-Term Memory)
- **Capacité**: Illimitée
- **TTL**: Permanent
- **Usage**: Connaissances durables, patterns appris
- **Accès**: Compte total des accès pour analytics

## Quick Start

### Import

```typescript
import { unifiedMemory } from '@/core/services/unifiedMemory';
```

### Stocker un message

```typescript
// Message basique (importance par défaut 0.5 → MTM)
const entry = unifiedMemory.store(
  'Décision importante prise',
  'user'
);

// Message avec importance haute (→ LTM)
const criticalEntry = unifiedMemory.store(
  'Configuration système critique',
  'system',
  0.9, // importance > 0.7 → LTM automatique
  'conv-123',
  ['config', 'system']
);

// Message rapide (→ STM)
const quickEntry = unifiedMemory.store(
  'Question rapide',
  'user',
  0.3 // importance < 0.5 → STM
);
```

### Rappeler des messages

```typescript
// Recherche simple
const results = unifiedMemory.recall('projet architecture');

// Recherche avec filtres
const filtered = unifiedMemory.recall('décision', {
  tier: 'MTM',           // Chercher seulement dans MTM
  minImportance: 0.6,    // Seulement messages importants
  limit: 5,              // Max 5 résultats
  conversationId: 'conv-123',
  tags: ['project']
});

// Rappel avec promotion automatique
// Si une entrée MTM atteint 10 accès, elle est promue vers LTM
for (let i = 0; i < 10; i++) {
  unifiedMemory.recall('knowledge important');
}
// → Entry promue automatiquement vers LTM après 10 accès
```

### Promouvoir manuellement

```typescript
const entry = unifiedMemory.store('Important pattern', 'assistant', 0.6);

// Forcer promotion vers LTM
const promoted = unifiedMemory.promote(entry.id);
if (promoted) {
  console.log('Entry maintenant en LTM (permanent)');
}
```

### Obtenir statistiques

```typescript
const stats = unifiedMemory.getStats();

console.log(`Total entries: ${stats.total}`);
console.log(`STM: ${stats.stm.totalEntries}/${stats.stm.maxEntries} (TTL: ${stats.stm.ttl})`);
console.log(`MTM: ${stats.mtm.totalEntries}/${stats.mtm.maxEntries} (TTL: ${stats.mtm.ttl})`);
console.log(`LTM: ${stats.ltm.totalEntries} (${stats.promotions} promotions)`);
console.log(`Last cleanup: ${new Date(stats.lastCleanup).toISOString()}`);
```

### Nettoyage

```typescript
// Cleanup automatique toutes les 5 minutes (configuré par défaut)
// Mais peut être appelé manuellement:

unifiedMemory.cleanup();

// Effacer tier spécifique
unifiedMemory.clear('STM');

// Reset complet (⚠️ irréversible!)
unifiedMemory.clear();
```

## Patterns d'utilisation

### Pattern 1: Chat avec auto-storage

```typescript
import { chatEngine } from '@/services/ai/chatEngine';
import { unifiedMemory } from '@/core/services/unifiedMemory';

async function handleUserMessage(message: string, mode: ChatMode) {
  // chatEngine calcule importance automatiquement selon mode
  const importance = calculateImportance(mode, message);
  
  // Stocker message utilisateur
  unifiedMemory.store(message, 'user', importance);
  
  // Envoyer au chat
  const response = await chatEngine.sendMessage(message, { mode });
  
  // Stocker réponse assistant
  unifiedMemory.store(response.content, 'assistant', importance * 0.8);
  
  return response;
}
```

### Pattern 2: Contexte enrichi

```typescript
async function getChatContext(conversationId: string): Promise<string> {
  // Rappeler contexte pertinent (derniers 10 messages importants)
  const context = unifiedMemory.recall('', {
    conversationId,
    minImportance: 0.4,
    limit: 10
  });
  
  // Formater pour prompt
  return context
    .map(e => `[${e.role}]: ${e.content}`)
    .join('\n');
}
```

### Pattern 3: Learning from usage

```typescript
function trackImportantDecision(decision: string, tags: string[]) {
  // Stocker décision importante
  const entry = unifiedMemory.store(
    decision,
    'system',
    0.8, // Importance haute → stocké en LTM
    undefined,
    tags
  );
  
  console.log(`Decision stored in ${entry.tier}`);
  return entry.id;
}

// Plus tard: retrouver patterns
const patterns = unifiedMemory.recall('', {
  tier: 'LTM',
  tags: ['pattern', 'decision'],
  minImportance: 0.7
});
```

### Pattern 4: Session management

```typescript
class SessionManager {
  private sessionId: string;
  
  constructor() {
    this.sessionId = `session_${Date.now()}`;
  }
  
  storeMessage(content: string, role: 'user' | 'assistant', importance = 0.5) {
    return unifiedMemory.store(content, role, importance, this.sessionId);
  }
  
  getSessionContext(limit = 20) {
    return unifiedMemory.recall('', {
      conversationId: this.sessionId,
      limit
    });
  }
  
  clearSession() {
    // Note: pas d'API clear par conversationId actuellement
    // Workaround: filtrer manuellement ou attendre cleanup automatique
    unifiedMemory.cleanup();
  }
}
```

## Importance Guidelines

Choisir bon score d'importance (0.0 → 1.0):

| Range | Tier | Usage | Exemples |
|-------|------|-------|----------|
| 0.0-0.3 | STM | Messages éphémères | Questions rapides, salutations |
| 0.3-0.5 | STM/MTM | Conversation standard | Discussion normale |
| 0.5-0.7 | MTM | Contexte important | Décisions, objectifs, plans |
| 0.7-0.9 | LTM | Connaissance durable | Configs, patterns, principes |
| 0.9-1.0 | LTM | Critique permanent | Core knowledge, identité |

### Auto-importance (chatEngine)

Le chatEngine calcule automatiquement l'importance selon:

1. **Mode de chat** (base):
   - `emergency`: 0.9
   - `reflection`: 0.8
   - `creation`/`strategy`: 0.7
   - `debug_cognitive`: 0.6
   - `omega`: 0.5
   - `standard`: 0.4
   - `default`: 0.3
   - `quick`: 0.2

2. **Keywords boost** (+0.1):
   - `décision`, `important`, `urgent`, `critique`, `projet`, `objectif`

3. **Length boost** (+0.05):
   - Message > 200 caractères

4. **Max cap**: 1.0

## Performance Tips

### ✅ Best Practices

```typescript
// ✅ Bon: importance explicite pour contrôle
unifiedMemory.store(message, 'user', calculateImportance(mode, message));

// ✅ Bon: filtrage par importance pour performance
unifiedMemory.recall(query, { minImportance: 0.5, limit: 10 });

// ✅ Bon: cleanup manuel si beaucoup d'entrées
if (stats.total > 200) unifiedMemory.cleanup();

// ✅ Bon: promouvoir knowledge important
if (entry.accessCount > 5 && entry.importance > 0.6) {
  unifiedMemory.promote(entry.id);
}
```

### ❌ Anti-patterns

```typescript
// ❌ Mauvais: importance 0 (sera supprimé immédiatement)
unifiedMemory.store(message, 'user', 0);

// ❌ Mauvais: importance > 1.0 (clamped à 1.0 mais incohérent)
unifiedMemory.store(message, 'user', 1.5);

// ❌ Mauvais: trop de recalls sans limite
unifiedMemory.recall(query); // → retourne tous les résultats!

// ❌ Mauvais: clear() sans confirmation
unifiedMemory.clear(); // Perte irréversible!
```

## Troubleshooting

### Messages disparaissent trop vite

**Cause**: Importance trop basse ou TTL expiré

**Solution**:
```typescript
// Augmenter importance
unifiedMemory.store(message, 'user', 0.6); // Au lieu de 0.3

// Ou promouvoir manuellement
unifiedMemory.promote(entryId);
```

### Mémoire pleine

**Cause**: Trop d'entrées LTM (illimité mais occupe RAM)

**Solution**:
```typescript
// Cleanup manuel
unifiedMemory.cleanup();

// Ou clear LTM si vraiment nécessaire
unifiedMemory.clear('LTM');
```

### Contexte incomplet

**Cause**: Limite trop basse ou minImportance trop haute

**Solution**:
```typescript
// Augmenter limite et baisser seuil
const results = unifiedMemory.recall(query, {
  limit: 50,           // Au lieu de 10
  minImportance: 0.2   // Au lieu de 0.5
});
```

## API Reference

Voir JSDoc complet dans `src/core/services/unifiedMemory.ts`:

- `store()` - Stocker nouvelle entrée
- `recall()` - Rappeler entrées selon query
- `promote()` - Promouvoir MTM → LTM
- `cleanup()` - Nettoyage automatique
- `getStats()` - Statistiques détaillées
- `clear()` - Effacer tier ou tout

## Tests

Tests disponibles dans `src/__tests__/unifiedMemory.test.ts` (100% coverage)

```bash
npm test unifiedMemory
```

## Roadmap

Fonctionnalités futures envisagées:

- [ ] Clear par conversationId
- [ ] Export/import mémoire (backup)
- [ ] Recherche sémantique (embeddings)
- [ ] Compression LTM (archivage)
- [ ] Analytics avancés (patterns, trends)
- [ ] Multi-utilisateur (isolation par userId)

---

**Dernière mise à jour**: PHASE 3.4 (Décembre 2025)
**Auteur**: TITANE∞ Team
**License**: Proprietary
