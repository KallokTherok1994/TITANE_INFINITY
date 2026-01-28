# 🚨 DEBUG CHAT IA — PHASE 3: LOGS CRITIQUES (Chemin Correct)

**Date:** 2026-01-06  
**Version:** v26.4.1  
**Auteur:** GitHub Copilot (GPT-5.2)  
**Statut:** ⚠️ EN ATTENTE DE TEST

---

## 🔍 DIAGNOSTIC PHASE 2 (ÉCHEC)

### ❌ Problème identifié
- **Mauvais chemin de code modifié** dans Phase 2
- Logs ajoutés à `conversationEngine.ts` → **NON UTILISÉ** par interface Chat IA
- Logs ajoutés à `conversation_process_message` → **JAMAIS APPELÉ**
- **Résultat:** 0 logs visibles dans console utilisateur

### ✅ Chemin réel découvert
```
Interface Chat IA
    ↓
useChat.ts (hook composition)
    ↓
useChatCore.ts
    ↓
chatEngine.ts → generate()
    ↓
aiOrchestrator.ts → generate()
    ↓
ollamaProvider.ts → generate()
    ↓
Ollama API (http://127.0.0.1:11434)
```

---

## 🎯 PHASE 3: LOGS CRITIQUES AJOUTÉS

### 1️⃣ chatEngine.ts
**Fichier:** `src/services/ai/chatEngine.ts`  
**Ligne ~235:** Début de `generate()`

```typescript
// 🚨 DEBUG CRITICAL: Log direct console pour tracer le flux
console.log('[chatEngine] 📤 generate() APPELÉ', {
  message: message.substring(0, 100),
  historyLength: history.length,
  timestamp: new Date().toISOString()
});
```

**Ligne ~530:** Avant appel orchestrator

```typescript
// 🚨 DEBUG CRITICAL: Log avant appel orchestrator
console.log('[chatEngine] → Appel aiOrchestrator.generate()', {
  message: validatedMessage.substring(0, 100),
  historyLength: enrichedHistory.length,
  mode: finalConfig.mode,
  aiConfig: finalConfig.aiConfig
});
```

**Ligne ~550:** Après réponse orchestrator

```typescript
// 🚨 DEBUG CRITICAL: Log après réception réponse
console.log('[chatEngine] ← Réponse orchestrator reçue', {
  provider: response?.provider,
  contentLength: response?.content?.length,
  timestamp: new Date().toISOString()
});
```

---

### 2️⃣ orchestrator.ts
**Fichier:** `src/services/ai/orchestrator.ts`  
**Ligne ~730:** Début de `generate()`

```typescript
// 🚨 DEBUG CRITICAL: Log entrée orchestrator
console.log('[aiOrchestrator] 📨 generate() APPELÉ', {
  message: message.substring(0, 100),
  historyLength: history.length,
  preferredProvider: config?.preferredProvider,
  timestamp: new Date().toISOString()
});
```

**Ligne ~930:** Avant tentative provider

```typescript
// 🚨 DEBUG CRITICAL: Log avant tentative provider
console.log(`[aiOrchestrator] 🎯 Tentative provider #${attempts}`, {
  providerName,
  totalProviders: providersToTry.length,
  isAvailable: !!provider,
  timestamp: new Date().toISOString()
});
```

**Ligne ~950:** Succès provider

```typescript
// 🚨 DEBUG CRITICAL: Log succès provider
console.log(`[aiOrchestrator] ✅ Succès provider`, {
  providerName,
  contentLength: response.content?.length,
  provider: response.provider,
  timestamp: new Date().toISOString()
});
```

**Ligne ~1040:** Échec provider

```typescript
// 🚨 DEBUG CRITICAL: Log échec provider
console.error(`[aiOrchestrator] ❌ Échec provider`, {
  providerName,
  error: lastError.message,
  latency: providerFailureLatency,
  timestamp: new Date().toISOString()
});
```

---

### 3️⃣ ollamaProvider.ts
**Fichier:** `src/services/ai/providers/ollama.ts`  
**Ligne ~325:** Début de `generate()`

```typescript
// 🚨 DEBUG CRITICAL: Log appel Ollama provider
console.log('[ollamaProvider] 🟢 generate() APPELÉ', {
  message: message.substring(0, 100),
  historyLength: history.length,
  model: OLLAMA_MODEL,
  url: OLLAMA_API_URL,
  timestamp: new Date().toISOString()
});
```

**Ligne ~338:** Après health check

```typescript
console.log('[ollamaProvider] ✅ Health check passed, proceeding...');
```

**Ligne ~427:** Erreur fetch

```typescript
// 🚨 DEBUG CRITICAL: Log erreur fetch Ollama
console.error('[ollamaProvider] ❌ Fetch error', {
  error: error instanceof Error ? error.message : String(error),
  url: OLLAMA_API_URL,
  timestamp: new Date().toISOString()
});
```

**Ligne ~470:** Succès Ollama

```typescript
// 🚨 DEBUG CRITICAL: Log succès Ollama
console.log('[ollamaProvider] ✅ Réponse Ollama générée avec succès', {
  contentLength: aiResponse.content.length,
  provider: aiResponse.provider,
  model: aiResponse.model,
  timestamp: new Date().toISOString()
});
```

---

## 📋 LOGS ATTENDUS DANS CONSOLE

Lors d'un envoi de message dans Chat IA, vous devez maintenant voir **cette séquence**:

```
[chatEngine] 📤 generate() APPELÉ { message: "...", historyLength: 0, timestamp: "..." }
[chatEngine] → Appel aiOrchestrator.generate() { message: "...", historyLength: 1, mode: "default", ... }
[aiOrchestrator] 📨 generate() APPELÉ { message: "...", historyLength: 1, preferredProvider: undefined, ... }
[aiOrchestrator] 🎯 Tentative provider #1 { providerName: "ollama", totalProviders: 5, ... }
[ollamaProvider] 🟢 generate() APPELÉ { message: "...", model: "llama3.1", url: "http://127.0.0.1:11434", ... }
[ollamaProvider] ✅ Health check passed, proceeding...
[ollamaProvider] ✅ Réponse Ollama générée avec succès { contentLength: 523, provider: "ollama", model: "llama3.1", ... }
[aiOrchestrator] ✅ Succès provider { providerName: "ollama", contentLength: 523, ... }
[chatEngine] ← Réponse orchestrator reçue { provider: "ollama", contentLength: 523, ... }
```

---

## 🧪 PROCÉDURE DE TEST

### Étape 1: Lancer l'application
```bash
pnpm run dev:tauri
```

### Étape 2: Ouvrir DevTools
- Appuyer sur **F12**
- Onglet **Console**
- Filtrer: `[chatEngine] | [aiOrchestrator] | [ollamaProvider]`

### Étape 3: Envoyer message Chat IA
1. Ouvrir interface **Chat IA**
2. Taper: `"Bonjour, peux-tu me dire l'heure ?"`
3. Envoyer

### Étape 4: Observer logs
- ✅ Si logs apparaissent → Le problème est identifié
- ❌ Si aucun log → Vérifier quelle interface Chat est ouverte

---

## 🔎 SCÉNARIOS POSSIBLES

### Scénario A: Tous les logs apparaissent
**Diagnostic:** Ollama fonctionne, mais problème d'affichage UI  
**Action:** Examiner composant UI (ChatBubble.tsx, AIChatBubble.tsx)

### Scénario B: Logs s'arrêtent à `[chatEngine] → Appel aiOrchestrator`
**Diagnostic:** Erreur dans orchestrator (timeout, provider unavailable)  
**Action:** Vérifier Ollama status: `curl http://127.0.0.1:11434/api/version`

### Scénario C: Logs s'arrêtent à `[ollamaProvider] 🟢 generate() APPELÉ`
**Diagnostic:** Health check échoue ou fetch timeout  
**Action:** Tester Ollama API manuellement:
```bash
curl -X POST http://127.0.0.1:11434/api/generate \
  -d '{"model": "llama3.1", "prompt": "Hello", "stream": false}'
```

### Scénario D: Aucun log [chatEngine] n'apparaît
**Diagnostic:** Interface Chat utilise encore un autre chemin (legacy)  
**Action:** Identifier composant UI ouvert et tracer son code

---

## 📊 DIFFÉRENCES PHASE 2 vs PHASE 3

| Phase | Fichiers modifiés | Résultat |
|-------|-------------------|----------|
| **Phase 2** | `conversationEngine.ts`<br>`conversation_process_message` | ❌ Aucun log visible (code non utilisé) |
| **Phase 3** | `chatEngine.ts`<br>`orchestrator.ts`<br>`ollamaProvider.ts` | ⚠️ Logs sur le **vrai chemin** utilisé |

---

## 🎯 PROCHAINES ÉTAPES

### Après test:
1. **Copier-coller les logs console** dans un nouveau message
2. Identifier à quelle étape le flux s'arrête
3. Cibler le problème exact (UI, Provider, Network, etc.)

### Si logs fonctionnent:
- Créer version production (enlever logs console)
- Ajouter telemetry structurée
- Documenter chemin Chat IA définitif

---

## ⚠️ AVERTISSEMENT

Ces logs utilisent **`console.log()` direct** au lieu de `logger.info()` pour garantir qu'ils s'affichent même si le niveau de log est mal configuré. **À enlever avant production**.

---

**Fin du rapport Phase 3**
