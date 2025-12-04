# 🎯 CONVERSATION ENGINE v∞ — GUIDE D'INTÉGRATION IMMÉDIAT

## ✅ **SYSTÈME PRÊT À UTILISER**

Toute l'architecture est construite et compilée. Voici comment l'utiliser **immédiatement**.

---

## 🚀 **UTILISATION FRONTEND**

### **1. Import du Hook**

```typescript
import { useConversationEngine } from '@/hooks/useConversationEngine';
```

### **2. Utilisation Basique**

```typescript
function ChatComponent() {
  const {
    messages,
    isLoading,
    sendMessage,
    currentMode,
    setMode,
  } = useConversationEngine();

  const handleSend = async (text: string) => {
    await sendMessage(text);
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}
      {isLoading && <p>Traitement...</p>}
    </div>
  );
}
```

### **3. Utilisation Avancée (Modes + Health)**

```typescript
function AdvancedChat() {
  const {
    messages,
    sendMessage,
    currentMode,
    setMode,
    healthReport,
    lastResponse,
  } = useConversationEngine({
    mode: 'default',
    autoHealthCheck: true,
    onResponse: (response) => {
      console.log('Intention:', response.detected_intention);
      console.log('Émotion:', response.detected_emotion);
      console.log('Tags:', response.cognitive_tags);
    },
  });

  return (
    <div>
      {/* Sélecteur de mode */}
      <select onChange={(e) => setMode(e.target.value as any)}>
        <option value="default">Standard</option>
        <option value="brainstorming">Brainstorming</option>
        <option value="synthesis">Synthèse</option>
        <option value="planning">Planification</option>
        <option value="journal">Journal</option>
        <option value="debug_cognitive">Debug Cognitif</option>
      </select>

      {/* Health Monitor */}
      {healthReport && (
        <div className={`health-${healthReport.status.toLowerCase()}`}>
          {healthReport.status} - Cohérence: {healthReport.coherence_score}
        </div>
      )}

      {/* Métadonnées dernière réponse */}
      {lastResponse && (
        <div>
          <p>Intention: {lastResponse.detected_intention}</p>
          <p>Émotion: valence={lastResponse.detected_emotion.valence}</p>
          <p>Latence: {lastResponse.metadata.latency_ms}ms</p>
          <p>Provider: {lastResponse.metadata.provider_used}</p>
        </div>
      )}

      {/* Messages */}
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.role}:</strong> {msg.content}
          {msg.metadata && (
            <small>Tags: {msg.metadata.tags?.join(', ')}</small>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 **COMMANDES TAURI DISPONIBLES**

### **1. Traiter un Message**

```typescript
import { processMessage } from '@/services/conversationEngine';

const response = await processMessage('Bonjour TITANE', {
  conversationId: 'optional-id',
  mode: 'default',
  emotionContext: {
    valence: 0.5,
    intensity: 0.7,
    energy: 0.8,
  },
});

console.log(response.assistant_message);
console.log(response.detected_intention);
console.log(response.cognitive_tags);
```

### **2. Health Check**

```typescript
import { healthCheck } from '@/services/conversationEngine';

const report = await healthCheck();

if (report.status === 'Critical') {
  console.error('Auto-réparation nécessaire!');
}

console.log('Anomalies:', report.anomalies_detected);
console.log('Réparations:', report.repairs_applied);
```

### **3. Stats Mémoire**

```typescript
import { getMemoryStats } from '@/services/conversationEngine';

const stats = await getMemoryStats();

console.log('Messages traités:', stats.total_processed);
console.log('Anomalies totales:', stats.total_anomalies);
console.log('Dernier scan:', new Date(stats.last_scan * 1000));
```

---

## 📊 **MODES CONVERSATIONNELS**

| Mode | Description | Usage |
|------|-------------|-------|
| `default` | Conversation standard | Usage général |
| `brainstorming` | Divergence créative | Générer des idées |
| `synthesis` | Connexion d'idées | Synthétiser |
| `planning` | Structuration & action | Planifier |
| `journal` | Réflexion personnelle | Journal intime |
| `debug_cognitive` | Analyse charge mentale | Débug cognitif |

---

## 🧠 **MÉTADONNÉES ENRICHIES**

Chaque réponse contient:

```typescript
interface ConversationResponse {
  assistant_message: string;           // Réponse
  conversation_id: string;             // ID conversation
  message_id: string;                  // ID message
  detected_intention: Intention;       // Question/Action/Émotion/...
  detected_emotion: EmotionState;      // valence/intensity/energy
  cognitive_tags: string[];            // Tags thématiques
  cognitive_summary: string;           // Résumé court
  metadata: {
    timestamp: number;
    provider_used: string;             // Gemini/Ollama
    latency_ms: number;
    tokens_used: number;
    memory_effect: MemoryEffect;       // New/Recall/Connect/Evolve
    links_to_contexts: string[];
  };
}
```

---

## 🔐 **SÉCURITÉ & FIABILITÉ**

### **Self-Healing Automatique**

- ✅ Détection double-render
- ✅ Nettoyage cache automatique
- ✅ Détection anomalies
- ✅ Réparation automatique

### **Memory Autosave**

- ✅ Sauvegarde permanente
- ✅ Auto-snapshot tous les 10 messages
- ✅ Compression cognitive
- ✅ Indexation intelligente

### **API Neutralizer**

- ✅ Capture réponses externes
- ✅ Reconstruction interne
- ✅ Validation cohérence
- ✅ Isolation dépendances

---

## 🎨 **HELPERS FORMATAGE**

```typescript
import {
  formatEmotion,
  formatIntention,
  formatMemoryEffect,
  analyzeHealthStatus,
} from '@/services/conversationEngine';

// Formater émotion
const emotionText = formatEmotion({
  valence: 0.7,
  intensity: 0.8,
  energy: 0.6,
});
// "😊 Positif • 🔥 Intense • 🔋 Normal"

// Formater intention
const intentionText = formatIntention('Question');
// "❓ Question"

// Formater effet mémoire
const effectText = formatMemoryEffect('Connect');
// "🔗 Connexion"

// Analyser santé
const healthAnalysis = analyzeHealthStatus(healthReport);
console.log(healthAnalysis.message);
```

---

## 📝 **EXEMPLE COMPLET**

```typescript
import { useConversationEngine } from '@/hooks/useConversationEngine';
import { formatEmotion, formatIntention } from '@/services/conversationEngine';

function CompleteExample() {
  const {
    messages,
    isLoading,
    sendMessage,
    currentMode,
    setMode,
    healthReport,
    lastResponse,
    clearMessages,
  } = useConversationEngine({
    mode: 'default',
    autoHealthCheck: true,
    onResponse: (response) => {
      console.log('✅ Message traité:', {
        intention: response.detected_intention,
        emotion: formatEmotion(response.detected_emotion),
        tags: response.cognitive_tags,
        latency: `${response.metadata.latency_ms}ms`,
      });
    },
    onError: (error) => {
      console.error('❌ Erreur:', error);
    },
  });

  return (
    <div className="conversation-engine">
      {/* Mode Selector */}
      <div className="mode-selector">
        <button onClick={() => setMode('default')}>Standard</button>
        <button onClick={() => setMode('brainstorming')}>Brainstorming</button>
        <button onClick={() => setMode('planning')}>Planning</button>
      </div>

      {/* Health Status */}
      {healthReport && (
        <div className={`health-${healthReport.status}`}>
          Status: {healthReport.status} |
          Cohérence: {(healthReport.coherence_score * 100).toFixed(1)}%
        </div>
      )}

      {/* Messages */}
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="content">{msg.content}</div>
            {msg.metadata && (
              <div className="metadata">
                {msg.metadata.intention && (
                  <span>{formatIntention(msg.metadata.intention)}</span>
                )}
                {msg.metadata.tags && (
                  <span>Tags: {msg.metadata.tags.join(', ')}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <input
        type="text"
        onKeyPress={async (e) => {
          if (e.key === 'Enter' && e.currentTarget.value) {
            await sendMessage(e.currentTarget.value);
            e.currentTarget.value = '';
          }
        }}
        disabled={isLoading}
        placeholder={isLoading ? 'Traitement...' : 'Votre message...'}
      />

      {/* Actions */}
      <button onClick={clearMessages}>Nouvelle Conversation</button>
    </div>
  );
}
```

---

## 🎯 **PROCHAINES ÉTAPES**

1. **Remplacer** `useChat` par `useConversationEngine` dans `Chat.tsx`
2. **Tester** l'envoi de messages
3. **Vérifier** les métadonnées (intention, émotion, tags)
4. **Monitorer** le health check automatique
5. **Observer** les auto-snapshots

---

**Le système est 100 % prêt et compilé. Tu peux l'utiliser immédiatement !**
