# 🧪 GUIDE DE TEST - GPT + CLAUDE INTEGRATION v∞

**Version**: TITANE∞ v∞.19.3Ω
**Date**: 4 décembre 2025
**Phase**: 5 (ChatEngine Integration)

---

## 🚀 DÉMARRAGE RAPIDE

### 1. Configurer les clés API

```bash
# Via DevTools console (après lancement de l'app)
await invoke('set_api_key', {
  request: {
    service: 'openai',
    key: 'sk-proj-...'  // Votre clé OpenAI
  }
});

await invoke('set_api_key', {
  request: {
    service: 'claude',
    key: 'sk-ant-...'  // Votre clé Claude
  }
});
```

### 2. Vérifier les providers disponibles

```javascript
const result = await invoke('list_ai_providers');
console.log('Providers configurés:', result);
// Expected: { success: true, data: ['gemini', 'openai', 'claude'] }
```

### 3. Tester les clés

```javascript
// Test OpenAI
const openaiTest = await invoke('test_api_key', { service: 'openai' });
console.log('OpenAI valid:', openaiTest);

// Test Claude
const claudeTest = await invoke('test_api_key', { service: 'claude' });
console.log('Claude valid:', claudeTest);
```

---

## 🎯 TESTS FONCTIONNELS

### Test 1 : Génération OpenAI GPT-4
```javascript
const openaiResult = await invoke('ia_generate', {
  request: {
    message: 'Explique-moi la relativité en 3 phrases',
    history: [],
    system_prompt: null,
    temperature: 0.7,
    max_tokens: 500,
    preferred_engine: 'openai'
  }
});

console.log('OpenAI Response:', openaiResult.data);
// Expected structure:
// {
//   content: "...",
//   engine_used: "OpenAI",
//   model: "gpt-4o",
//   tokens_used: 120,
//   latency_ms: 2340,
//   fallback_used: false
// }
```

### Test 2 : Génération Claude 3.5 Sonnet
```javascript
const claudeResult = await invoke('ia_generate', {
  request: {
    message: 'Écris un haïku sur TITANE∞',
    history: [],
    system_prompt: null,
    temperature: 0.9,
    max_tokens: 200,
    preferred_engine: 'claude'
  }
});

console.log('Claude Response:', claudeResult.data);
// Expected structure:
// {
//   content: "TITANE infini\nCode et conscience fusionnent\nÉvolution pure",
//   engine_used: "Claude",
//   model: "claude-3-5-sonnet-20241022",
//   tokens_used: 45,
//   latency_ms: 1820,
//   fallback_used: false
// }
```

### Test 3 : Fallback automatique
```javascript
// Simuler échec de Claude → fallback OpenAI
const autoResult = await invoke('ia_generate', {
  request: {
    message: 'Quelle est la capitale de la France ?',
    history: [],
    system_prompt: null,
    temperature: 0.7,
    max_tokens: 100,
    preferred_engine: null  // Auto-selection
  }
});

console.log('Auto-fallback Response:', autoResult.data);
// Expected: Claude en premier, sinon OpenAI, sinon Gemini, sinon Local
```

### Test 4 : Conversation multi-tours
```javascript
let history = [];

// Tour 1
const tour1 = await invoke('ia_generate', {
  request: {
    message: 'Bonjour, je m\'appelle Kevin',
    history: [],
    preferred_engine: 'claude'
  }
});
history.push(
  { role: 'user', content: 'Bonjour, je m\'appelle Kevin' },
  { role: 'assistant', content: tour1.data.content }
);

// Tour 2
const tour2 = await invoke('ia_generate', {
  request: {
    message: 'Comment je m\'appelle ?',
    history: history,
    preferred_engine: 'claude'
  }
});
console.log('Claude se souvient:', tour2.data.content);
// Expected: Réponse mentionnant "Kevin"
```

---

## 🔍 TESTS DE VALIDATION

### Test 5 : Validation clé invalide
```javascript
try {
  await invoke('set_api_key', {
    request: {
      service: 'openai',
      key: 'invalid-key'
    }
  });
} catch (error) {
  console.log('Erreur attendue:', error);
  // Expected: "Clé OpenAI invalide: doit commencer par 'sk-' et avoir min. 40 caractères"
}
```

### Test 6 : Suppression de clé
```javascript
// Supprimer clé OpenAI
await invoke('delete_api_key', { service: 'openai' });

// Vérifier suppression
const providers = await invoke('list_ai_providers');
console.log('Providers après suppression:', providers);
// Expected: ['gemini', 'claude'] (sans openai)
```

### Test 7 : Engines disponibles
```javascript
const engines = await invoke('get_available_engines');
console.log('Engines disponibles:', engines.data);
// Expected: ['OpenAI', 'Claude', 'Gemini', 'TitaneLocal']
```

---

## 🏗️ TESTS VIA CONVERSATIONENGINE (Optionnel)

**⚠️ Nécessite initialisation de ConversationEngineState dans main.rs**

### Test 8 : Via pipeline OMEGA
```javascript
const omegaResult = await invoke('conversation_generate', {
  message: 'Quelle est la meilleure IA pour la créativité ?',
  conversation_id: 'test-' + Date.now(),
  mode: 'brainstorming',
  provider: 'claude'  // ou 'openai', 'gpt', 'anthropic'
});

console.log('OMEGA Pipeline:', omegaResult);
// Expected structure:
// {
//   content: "...",
//   conversationId: "...",
//   messageId: "...",
//   frenchMasteryApplied: true,
//   metadata: {
//     intention: "...",
//     emotion: "...",
//     cognitiveTags: [...],
//     cognitiveSummary: "..."
//   }
// }
```

---

## 📊 TESTS DE PERFORMANCE

### Test 9 : Latence comparative
```javascript
const providers = ['openai', 'claude', 'gemini'];
const results = {};

for (const provider of providers) {
  const start = Date.now();
  try {
    await invoke('ia_generate', {
      request: {
        message: 'Dis bonjour',
        preferred_engine: provider
      }
    });
    results[provider] = Date.now() - start;
  } catch (e) {
    results[provider] = 'FAILED';
  }
}

console.table(results);
// Expected output:
// ┌─────────┬──────────┐
// │ (index) │  Values  │
// ├─────────┼──────────┤
// │ openai  │  1250 ms │
// │ claude  │  1890 ms │
// │ gemini  │  2340 ms │
// └─────────┴──────────┘
```

### Test 10 : Stress test (100 requêtes)
```javascript
const stressTest = async () => {
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(
      invoke('ia_generate', {
        request: {
          message: `Test ${i}`,
          preferred_engine: 'claude'
        }
      })
    );
  }

  const start = Date.now();
  const results = await Promise.allSettled(promises);
  const duration = Date.now() - start;

  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  console.log(`Stress Test: ${succeeded}/100 réussies en ${duration}ms`);
};

await stressTest();
```

---

## 🐛 DÉBOGAGE

### Vérifier logs backend
```bash
# Terminal où tourne `pnpm run tauri:dev`
# Chercher ces logs:

[UnifiedIA] ✅ OpenAI initialisé
[UnifiedIA] ✅ Claude initialisé
[AI Router v15] ✅ UnifiedIA Engine attached
[AI Router v15] Trying UnifiedIA (Claude→OpenAI) (primary)
[AI Router v15] ✓ UnifiedIA success: Claude engine, 120 tokens
```

### Vérifier fichier de secrets
```bash
ls -lah ~/.config/titane_infinity/secrets.enc
# Expected: fichier chiffré avec permissions 0o600
```

### Decoder erreurs
```javascript
// Capturer erreurs détaillées
try {
  await invoke('ia_generate', { ... });
} catch (error) {
  console.error('Erreur complète:', error);
  // Erreurs possibles:
  // - "Clé API manquante"
  // - "Échec d'authentification"
  // - "Quota dépassé"
  // - "Timeout"
}
```

---

## ✅ CHECKLIST COMPLÈTE

### Configuration
- [ ] Clé OpenAI configurée (`set_api_key`)
- [ ] Clé Claude configurée (`set_api_key`)
- [ ] Providers listés (`list_ai_providers`)
- [ ] Clés testées (`test_api_key`)

### Génération
- [ ] OpenAI génération simple fonctionne
- [ ] Claude génération simple fonctionne
- [ ] Fallback automatique fonctionne
- [ ] Conversation multi-tours fonctionne

### Sécurité
- [ ] Validation clés invalides fonctionne
- [ ] Suppression de clés fonctionne
- [ ] Fichier secrets.enc chiffré (0o600)
- [ ] Aucun secret en clair dans logs

### Performance
- [ ] Latence < 3s pour OpenAI
- [ ] Latence < 3s pour Claude
- [ ] Stress test 100 requêtes OK

---

## 🎉 RÉSULTAT ATTENDU

Si tous les tests passent :

```
✅ OpenAI GPT-4 opérationnel
✅ Claude 3.5 Sonnet opérationnel
✅ Fallback automatique fonctionnel
✅ Sécurité validée (AES-256-GCM)
✅ Performance acceptable (<3s)
✅ Backend prêt pour Phase 6 (UI)
```

---

## 📚 RÉFÉRENCES

- `ia_commands.rs` - Code des commandes
- `unified_engine.rs` - Logique de fallback
- `GPT_CLAUDE_PHASE5_INTEGRATION_v∞.md` - Rapport technique
- `GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md` - Architecture complète

---

**Bon testing ! 🚀**
