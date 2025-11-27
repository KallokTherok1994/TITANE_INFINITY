# 🧪 TESTS BACKEND CHAT IA — PHASE 2 (DIRECT)

**Date**: 27 novembre 2025
**Status**: ✅ App lancée (npm run tauri:dev)
**DevTools**: ✅ Auto-ouverts

---

## 🎯 TESTS À EXÉCUTER MAINTENANT

### Context
L'app TITANE est lancée en mode dev. DevTools sont ouverts automatiquement.
On va tester **directement** les commandes Tauri backend pour identifier le problème.

---

## TEST 1: Providers Status

**Objectif**: Vérifier quels providers IA sont disponibles

**Commande DevTools Console**:
```javascript
// Copier-coller dans Console DevTools (F12)
const status = await window.__TAURI__.invoke('chat_get_providers_status');
console.log('🎯 Providers Status:', status);
```

**Résultat Attendu**:
```javascript
{
  gemini: { available: false, error: "API key missing", latency_ms: 0 },
  ollama: { available: false, error: "Connection refused", latency_ms: 0 },
  local: { available: true, latency_ms: 0 }
}
```

**Analyse**:
- ✅ **local = true** → Backend fonctionne, fallback garanti
- ⚠️ **gemini = false** → Clé API manquante (normal)
- ⚠️ **ollama = false** → Serveur Ollama pas lancé (normal)

---

## TEST 2: Message Local Echo (CRITIQUE)

**Objectif**: Vérifier que le backend local echo fonctionne (ne doit JAMAIS échouer)

**Commande DevTools Console**:
```javascript
// Test avec provider 'local' (fallback ultime)
const response = await window.__TAURI__.invoke('chat_send_message', {
  request: {
    message: 'Test backend local',
    provider: 'local',
    streaming: false,
    conversation_id: null,
    model: null,
    images: null,
    system_prompt: null
  }
});

console.log('✅ Response:', response);
console.log('📦 Type:', typeof response);
console.log('📝 Content:', response?.message?.content || 'NO CONTENT');
```

**Résultat Attendu**:
```javascript
// Response doit être:
{
  message: {
    id: "msg_1732719019_abc123",
    role: "assistant",
    content: "[LOCAL ECHO] Test backend local",
    timestamp: 1732719019000,
    provider: "local",
    model: "echo-v1",
    tokens: 0,
    multimodal: false
  },
  success: true,
  latency_ms: 5
}
```

**Si échec**:
```javascript
// ERROR POSSIBLE:
"ValidationError: Message cannot be empty"
"InternalError: ..."
"ParseError: ..."
```

**Analyse des Erreurs**:
- **ValidationError** → Message vide? (impossible ici)
- **InternalError** → Bug backend Rust generate_local()
- **ParseError** → Serialization JSON échoue
- **Timeout** → Backend freeze (>60s)
- **Response = undefined** → Commande non enregistrée (impossible, vérifié ligne 306)

---

## TEST 3: Message Auto Cascade

**Objectif**: Tester cascade automatique (gemini → ollama → local)

**Commande DevTools Console**:
```javascript
// Test avec provider 'auto' (cascade complète)
const response2 = await window.__TAURI__.invoke('chat_send_message', {
  request: {
    message: 'Bonjour TITANE, cascade test',
    provider: 'auto',
    streaming: false
  }
});

console.log('🔄 Auto Cascade Response:', response2);
console.log('🎯 Provider utilisé:', response2?.message?.provider);
```

**Résultat Attendu**:
```javascript
// Devrait fallback sur 'local' car gemini/ollama indisponibles
{
  message: {
    provider: "local",  // ← Doit être "local" après cascade
    content: "[LOCAL ECHO] Bonjour TITANE, cascade test"
  },
  success: true
}
```

**Si échec**:
- Providers cascade ne fonctionne pas (bug chat_orchestrator.rs)
- Timeout après tentative gemini + ollama (>60s)

---

## TEST 4: Logs Backend Rust

**Objectif**: Vérifier que les logs backend sont visibles dans terminal

**Où regarder**:
- Terminal où tourne `npm run tauri:dev`
- Chercher lignes format: `[CHAT]`

**Logs Attendus**:
```
[CHAT] 🔄 Tentative avec provider: gemini
[CHAT] ⏭️ Provider gemini non disponible (skip)
[CHAT] 🔄 Tentative avec provider: ollama
[CHAT] ⏭️ Provider ollama non disponible (skip)
[CHAT] 🔄 Tentative avec provider: local
[CHAT] ✅ Provider local: Response generated
```

**Si pas de logs**:
- Backend silent crash
- println!() pas visible (rare)
- Logs redirigés ailleurs

---

## TEST 5: Vérifier UI React

**Objectif**: Comprendre pourquoi UI ne montre rien

**Dans DevTools Console**:
```javascript
// 1. Vérifier hook useChat état
// (Regarder dans React DevTools ou Console logs)

// 2. Tester directement sendMessage
// Navigation: Chat page → Envoyer message "test"
// Observer Console logs

// 3. Vérifier MessageList reçoit messages
// React DevTools → Components → MessageList → Props → messages
```

**Analyse**:
- Si **backend response OK** mais **UI vide** → Problème React state
- Si **console.error** visible → Gestion erreur frontend
- Si **aucun log frontend** → useChat pas appelé (composant pas monté?)

---

## DIAGNOSTIC RAPIDE

### ✅ Si Test 2 réussit (local echo OK)
**Conclusion**: Backend fonctionne parfaitement
**Problème**: Frontend React (useChat → UI update)
**Action**: Vérifier addMessage() met à jour state, MessageList re-render

### ❌ Si Test 2 échoue (local echo KO)
**Conclusion**: Backend Rust critique
**Problème**: generate_local() bugué ou commande mal enregistrée
**Action**: Lire src-tauri/src/overdrive/chat_orchestrator.rs ligne 203+

### ⏱️ Si Test 2 timeout (>60s)
**Conclusion**: Backend freeze
**Problème**: Deadlock Rust, panic silencieux
**Action**: Vérifier logs Rust, ajouter timeout backend

---

## COMMANDES RAPIDES CLIPBOARD

```javascript
// === COPIER-COLLER DANS DEVTOOLS ===

// 1. Providers Status
await window.__TAURI__.invoke('chat_get_providers_status')

// 2. Local Echo
await window.__TAURI__.invoke('chat_send_message', {
  request: {
    message: 'Test local',
    provider: 'local',
    streaming: false
  }
})

// 3. Auto Cascade
await window.__TAURI__.invoke('chat_send_message', {
  request: {
    message: 'Test auto',
    provider: 'auto',
    streaming: false
  }
})

// 4. Vérifier window.__TAURI__ existe
console.log('Tauri API:', window.__TAURI__ ? '✅ Disponible' : '❌ Manquant')

// 5. Lister commandes disponibles
Object.keys(window.__TAURI__)
```

---

## PROCHAINE ÉTAPE

**MAINTENANT**: Exécuter Test 1-5 dans DevTools
**APRÈS**: Documenter résultats ici
**PUIS**: Phase 3 (Providers IA) si backend OK, ou debug backend si KO

---

**STATUS**: ⏳ EN ATTENTE RÉSULTATS TESTS
