# 📚 API REFERENCE — TITANE∞ v27.0.0

**Documentation complète des APIs disponibles dans TITANE∞. Destinée aux développeurs.**

---

## 📖 Table des Matières

1. [REST API](#rest-api)
2. [WebSocket API](#websocket-api)
3. [AI Services API](#ai-services)
4. [Storage API](#storage-api)
5. [Security API](#security-api)
6. [Examples](#examples)

---

## 🔌 REST API

### Base URL

```
Development:  http://localhost:5173 (Vite)
              http://localhost:1430 (Tauri backend)
Production:   http://localhost:1430
```

### Authentication

Toutes les requêtes utilisent les headers:

```http
Content-Type: application/json
Authorization: Bearer <token>  # Si sécurité activée
X-Request-ID: <uuid>  # Optionnel, aide au debugging
```

---

### AI Providers

#### POST `/api/ai/chat`

Envoyer un message à un provider AI (Ollama, OpenAI, etc.)

**Request**:

```bash
curl -X POST http://localhost:1430/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "ollama",
    "message": "Hello, what is AI?",
    "history": [],
    "config": {
      "temperature": 0.7,
      "maxTokens": 2048
    }
  }'
```

**Parameters**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `provider` | string | Yes | `"ollama"` or `"openai"` |
| `message` | string | Yes | User message (max 4000 chars) |
| `history` | array | No | Previous messages (MessageHistory[]) |
| `config` | object | No | AI config overrides |

**Response** (200 OK):

```json
{
  "content": "AI is a field of computer science...",
  "role": "assistant",
  "timestamp": 1708000000000,
  "metadata": {
    "model": "mistral:7b",
    "tokens": 245,
    "provider": "ollama"
  }
}
```

**Error Responses**:

- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Auth token missing/invalid
- `503 Service Unavailable`: Provider endpoint down
- `408 Timeout`: Request took too long (> 30s)

---

#### POST `/api/ai/stream`

Streamer la réponse AI (SSE - Server Sent Events)

**Request**:

```bash
curl -X POST http://localhost:1430/api/ai/stream \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "ollama",
    "message": "Tell me a story",
    "stream": true
  }'
```

**Response Stream** (text/event-stream):

```
event: token
data: {"token": "Once"}

event: token
data: {"token": " upon"}

event: done
data: {"totalTokens": 145}
```

---

### Ollama Integration

#### GET `/api/ollama/models`

Lister les modèles Ollama disponibles

**Response** (200 OK):

```json
{
  "models": [
    {
      "name": "mistral:7b",
      "size": 4294967296,
      "digest": "sha256:..."
    }
  ]
}
```

---

#### POST `/api/ollama/pull`

Télécharger un nouveau modèle Ollama

**Request**:

```bash
curl -X POST http://localhost:1430/api/ollama/pull \
  -H "Content-Type: application/json" \
  -d '{"model": "neural-chat:7b"}'
```

**Response Stream** (text/event-stream):

```
event: progress
data: {"status": "pulling", "digest": "sha256:...", "complete": 45}

event: complete
data: {"model": "neural-chat:7b"}
```

---

#### GET `/api/ollama/health`

Vérifier la santé du serveur Ollama

**Response** (200 OK):

```json
{
  "status": "healthy",
  "models": 3,
  "memoryUsage": 2147483648,
  "uptime": 3600
}
```

**Response** (503 Service Unavailable):

```json
{
  "status": "offline",
  "error": "Connection refused"
}
```

---

## 🔌 WebSocket API

### Connection

```javascript
const ws = new WebSocket('ws://localhost:1430/ws');

ws.onopen = () => {
  console.log('Connected to TITANE');
};

ws.onmessage = event => {
  const data = JSON.parse(event.data);
  console.log('Message:', data);
};
```

### Events

#### `chat_message`

Envoyer/recevoir un message chat

**Send**:

```json
{
  "type": "chat_message",
  "payload": {
    "content": "Hello",
    "timestamp": 1708000000000
  }
}
```

**Receive**:

```json
{
  "type": "chat_message",
  "payload": {
    "content": "Hi there!",
    "role": "assistant",
    "timestamp": 1708000000001
  }
}
```

---

#### `connection_status`

Statut de la connexion

```json
{
  "type": "connection_status",
  "payload": {
    "status": "online",
    "timestamp": 1708000000000
  }
}
```

---

#### `error`

Erreur de serveur

```json
{
  "type": "error",
  "payload": {
    "code": "OLLAMA_UNAVAILABLE",
    "message": "Ollama endpoint is offline",
    "timestamp": 1708000000000
  }
}
```

---

## 🤖 AI Services API

### TypeScript Types

```typescript
// Message in conversation
interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// AI Response
interface AIResponse {
  content: string;
  role: 'assistant';
  timestamp: number;
  metadata?: {
    model?: string;
    tokens?: number;
    provider?: string;
  };
}

// AI Config
interface AIConfig {
  temperature: number; // 0.0 - 2.0 (default: 0.7)
  maxTokens: number; // 1 - 4096 (default: 2048)
  topP: number; // 0.0 - 1.0 (default: 0.9)
  topK: number; // 1 - 100 (default: 40)
  timeout: number; // ms (default: 30000)
}

// Provider type
type AIProvider = 'ollama' | 'openai' | 'anthropic';
```

### JavaScript/TypeScript Usage

```typescript
import { useAI } from '@/hooks/useAI';

export function ChatComponent() {
  const { chat, isLoading, error } = useAI();

  const handleSend = async (message: string) => {
    try {
      const response = await chat(message, [], {
        temperature: 0.7,
        maxTokens: 2048,
      });
      console.log('Response:', response.content);
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  return (
    // Component JSX
  );
}
```

---

## 💾 Storage API

### React Hook: `useStorage`

```typescript
import { useStorage } from '@/hooks/useStorage';

export function DataComponent() {
  const { data, set, remove, clear } = useStorage('my-key');

  // Read
  console.log(data); // null | any

  // Write
  set({ user: 'John', age: 30 });

  // Delete
  remove();

  // Clear all
  clear();
}
```

### Direct Storage Access

```typescript
import { storageManager } from '@/lib/storage';

// Set
storageManager.set('key', { data: 'value' });

// Get
const data = storageManager.get('key');

// Remove
storageManager.remove('key');

// List all
const all = storageManager.list();

// Clear
storageManager.clear();
```

---

## 🔐 Security API

### Auth Management

```typescript
import { authManager } from '@/lib/security/auth';

// Check if authenticated
const isAuthed = authManager.isAuthenticated();

// Get token
const token = authManager.getToken();

// Validate token
const isValid = authManager.validateToken(token);

// Logout
authManager.logout();
```

### Input Sanitization

```typescript
import { sanitizeInput, validateEmail } from '@/lib/security';

// Sanitize user input
const clean = sanitizeInput(userMessage);

// Validate email
const isValid = validateEmail('user@example.com');
```

---

## 📋 Examples

### Example 1: Simple Chat

```typescript
async function simpleChat() {
  const response = await fetch('http://localhost:1430/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'ollama',
      message: 'What is the capital of France?',
      history: [],
    }),
  });

  const data = await response.json();
  console.log('Response:', data.content);
}

simpleChat();
```

---

### Example 2: Streaming Chat

```typescript
async function streamingChat() {
  const response = await fetch('http://localhost:1430/api/ai/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'ollama',
      message: 'Tell me a story about a robot',
    }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        console.log('Token:', data.token);
      }
    }
  }
}

streamingChat();
```

---

### Example 3: WebSocket Connection

```javascript
function connectWebSocket() {
  const ws = new WebSocket('ws://localhost:1430/ws');

  ws.onmessage = event => {
    const message = JSON.parse(event.data);

    if (message.type === 'chat_message') {
      console.log('AI:', message.payload.content);
    }
  };

  // Send message
  ws.send(
    JSON.stringify({
      type: 'chat_message',
      payload: {
        content: 'Hello AI',
        timestamp: Date.now(),
      },
    })
  );
}

connectWebSocket();
```

---

### Example 4: Conversation History

```typescript
async function conversationWithHistory() {
  const history = [
    { role: 'user', content: 'What is AI?' },
    { role: 'assistant', content: 'AI is artificial intelligence...' },
  ];

  const response = await fetch('http://localhost:1430/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'ollama',
      message: 'Tell me more about deep learning',
      history: history,
      config: { temperature: 0.5 },
    }),
  });

  const data = await response.json();
  console.log('Response:', data);
}

conversationWithHistory();
```

---

## 🔗 Related Resources

- [README.md](README.md) - Vue d'ensemble du projet
- [PERFORMANCE_TUNING.md](PERFORMANCE_TUNING.md) - Optimisation des performances
- [docs/](docs/) - Documentation complète
- [src/services/ai/](src/services/ai/) - Code source AI services

---

**Dernière mise à jour**: 2026-01-30  
**Status**: ✅ Production Ready (v27.0.0)
