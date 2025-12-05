# 🔧 TITANE∞ Services Architecture

## 📂 Structure

```
src/services/
├── tauriBridge.ts           (314 lignes) ⭐ NEW v18.3
├── ai/
│   └── chatClient.ts        (224 lignes) ⭐ NEW v18.3
├── tauriCommands.ts         (410 lignes) - Registry
├── personaTauriBridge.ts
├── singularityBridge.ts
├── singularityConnections.ts
└── ... (17 services au total, 7238 lignes)
```

---

## ⭐ Nouveaux Services v18.3

### 1. tauriBridge.ts

**Rôle**: Service centralisé pour toutes les commandes Tauri ↔ React

**Features**:
- ✅ Logging automatique (DEBUG_MODE)
- ✅ Error handling unifié (CoreError)
- ✅ Timeout configurable (défaut 30s)
- ✅ Retry avec exponential backoff
- ✅ 30+ commandes typées

**Usage**:
```typescript
import { invokeTauriCommand, sendChatMessage } from '@services/tauriBridge';

// Basic command
const response = await invokeTauriCommand<string[]>('helios_get_modules');
if (response.success) {
  console.log(response.data);
}

// With options
const result = await invokeTauriCommand<any>(
  'nexus_get_status',
  {},
  { timeout: 10000, retries: 2, retryDelay: 500 }
);

// Typed helper
const chatResult = await sendChatMessage(
  [{ role: 'user', content: 'Hello!' }],
  { model: 'gpt-4', temperature: 0.7 }
);
```

**API disponibles**:
- `getSingularityState()`, `syncSingularityState(state)`
- `getHeliosModules()`, `getHeliosHealth()`
- `getActiveProjects(limit)`, `getRecentMemories(limit)`
- `getNexusStatus()`, `getPersonaMultipliers()`
- `sendChatMessage(messages, config)` ⬅️ avec retry intégré
- `startVoiceRecording()`, `stopVoiceRecording()`, `voiceSpeak(text, voice?)`
- `engineInit()`, `engineTick()`, `engineMetrics()`, `engineHealth()`, `engineModules()`
- `getDevToolsLogs()`, `clearDevToolsLogs()`
- `getSystemStatus()`, `getSystemMetrics()`
- `readFile(path)`, `writeFile(path, content)`

---

### 2. chatClient.ts

**Rôle**: Client AI robuste avec circuit breaker, retry, fallback chain

**Features**:
- ✅ Circuit breaker (5 failures → open, 30s reset)
- ✅ Retry avec exponential backoff (1s, 2s, 4s...)
- ✅ Fallback chain configurable (gpt-4 → claude-3 → ollama)
- ✅ Timeout configurable (défaut 30s)
- ✅ Error handling robuste

**Usage**:
```typescript
import { sendMessage, sendSimpleMessage, getCircuitBreakerStatus } from '@services/ai/chatClient';

// Full control
const result = await sendMessage(
  [
    { role: 'system', content: 'Tu es un assistant IA.' },
    { role: 'user', content: 'Explique-moi TypeScript.' }
  ],
  {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    retries: 3,
    retryDelay: 1000,
    fallbackModels: ['claude-3', 'ollama']
  }
);

if (result.success) {
  console.log(`✅ Réponse (${result.model}, ${result.duration}ms):`);
  console.log(result.content);
} else {
  console.error('❌ Erreur:', result.error);
}

// Simple message
const simpleResult = await sendSimpleMessage('Hello!', { model: 'gpt-4' });

// Check circuit breaker
const cbState = getCircuitBreakerStatus(); // 'closed' | 'open' | 'half-open'
console.log('Circuit breaker:', cbState);
```

**Types**:
```typescript
interface ChatConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  fallbackModels?: string[];
}

interface ChatResult {
  success: boolean;
  content?: string;
  error?: string;
  model?: string;
  attempt?: number;
  duration?: number;
}
```

---

## 🔄 Migration Guide

### Migrer ChatWindow vers chatClient

**AVANT** (retry local):
```typescript
const handleSendWithRetry = async (prompt: string, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 30000);
      });
      await Promise.race([sendMessage(prompt), timeoutPromise]);
      return;
    } catch (err) {
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      } else {
        setAIError('Modèle distant indisponible. Basculer sur Ollama local?');
      }
    }
  }
};
```

**APRÈS** (chatClient):
```typescript
import { sendMessage } from '@services/ai/chatClient';

const handleSend = async () => {
  const result = await sendMessage(
    [...messages, { role: 'user', content: input }],
    {
      model: 'gpt-4',
      retries: 3,
      fallbackModels: ['claude-3', 'ollama']
    }
  );

  if (result.success) {
    setMessages(prev => [...prev, { role: 'assistant', content: result.content }]);
  } else {
    setAIError(result.error);
  }
};
```

**Avantages**:
- ✅ Code 70% plus court
- ✅ Circuit breaker automatique
- ✅ Fallback chain configuré
- ✅ Logging centralisé
- ✅ Error handling unifié

---

## 🏗️ Architecture Tauri Bridge

```
┌─────────────────────────────────────────────────┐
│         FRONTEND (React + TypeScript)           │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │      Components / Pages / Hooks         │   │
│  └──────────────┬──────────────────────────┘   │
│                 │                               │
│                 ▼                               │
│  ┌─────────────────────────────────────────┐   │
│  │   tauriBridge.ts (Single Source)        │   │
│  │   • invokeTauriCommand<T>()             │   │
│  │   • Logging (DEBUG_MODE)                │   │
│  │   • Timeout (30s default)               │   │
│  │   • Retry (exponential backoff)         │   │
│  │   • Error handling (CoreError)          │   │
│  └──────────────┬──────────────────────────┘   │
│                 │                               │
│                 ▼                               │
│  ┌─────────────────────────────────────────┐   │
│  │   @tauri-apps/api/core (invoke)         │   │
│  └──────────────┬──────────────────────────┘   │
└─────────────────┼───────────────────────────────┘
                  │
                  ▼ IPC
┌─────────────────────────────────────────────────┐
│          BACKEND (Rust + Tauri)                 │
│  ┌─────────────────────────────────────────┐   │
│  │   Tauri Commands Registry               │   │
│  │   • singularity_*, helios_*             │   │
│  │   • memory_*, nexus_*, persona_*        │   │
│  │   • chat_*, voice_*, engine_*           │   │
│  │   • devtools_*, system_*, fs_*          │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 🤖 AI Chat Client Architecture

```
┌─────────────────────────────────────────────────┐
│          sendMessage(messages, config)          │
│                                                 │
│  1️⃣ Check Circuit Breaker                       │
│     • State: closed | open | half-open          │
│     • Threshold: 5 failures → open              │
│     • Reset timeout: 30s                        │
│                                                 │
│  2️⃣ Primary Model Retry                         │
│     • Attempt 1 (delay 1s)                      │
│     • Attempt 2 (delay 2s)                      │
│     • Attempt 3 (delay 4s)                      │
│                                                 │
│  3️⃣ Fallback Chain                              │
│     • gpt-4 ✗                                   │
│     • claude-3 ✗                                │
│     • ollama local ✓                            │
│                                                 │
│  4️⃣ Return ChatResult                           │
│     • success: boolean                          │
│     • content?: string                          │
│     • error?: string                            │
│     • model?: string                            │
│     • duration?: number                         │
└─────────────────────────────────────────────────┘
```

---

## 📊 Statistiques

```
Total services: 17 fichiers
Total lignes:   7238 lignes
Nouveaux v18.3: 2 fichiers (tauriBridge.ts, chatClient.ts)
Lignes v18.3:   538 lignes (314 + 224)
```

---

## 🚀 Prochaines Étapes

### v19.0 Enhancements

1. **WebSocket Support** (tauriBridge.ts)
   - Streaming real-time
   - Event subscriptions
   - Bidirectional communication

2. **Batch Commands** (tauriBridge.ts)
   - Parallel invocations
   - Transaction support
   - Rollback on error

3. **AI Streaming** (chatClient.ts)
   - SSE support
   - Token-by-token streaming
   - Partial response handling

4. **File Operations** (tauriBridge.ts)
   - Upload progress tracking
   - Download with resume
   - Multi-file operations

---

**TITANE∞ v18.3.0** — Services centralisés robustes ✅
