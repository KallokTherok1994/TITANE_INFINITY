# 🎨 ChatEngine (Frontend) — Module Documentation

**Module Path:** `src/services/ai/chatEngine.ts`  
**Version:** v19.2Ω (OMEGA reconstruction)  
**Purpose:** Frontend AI orchestration and chat management  
**Language:** TypeScript  
**Architecture Role:** Frontend bridge to backend OMEGA pipeline

---

## 🎯 MODULE OVERVIEW

**ChatEngine** est le service frontend qui orchestre les interactions AI chat. Il gère le streaming, fallback logic (backend vs frontend execution), memory context injection, et coordination avec UnifiedMemory + Cognitive engines.

### Responsibilities

- 🔄 **Chat Orchestration** — Coordonner interactions AI (user → backend OMEGA → response)
- 📡 **Backend Dispatch** — Dispatch vers backend OMEGA pipeline (Tauri commands)
- 🔀 **Fallback Logic** — Frontend execution si backend unavailable
- 💾 **Memory Integration** — Inject/save memory context (UnifiedMemory)
- 🧠 **Cognitive Integration** — Call cognitive engines (semantic memory, goals, observability)
- 📊 **Pipeline Tracking** — Track pipeline steps pour debugging/observability
- ⚡ **Streaming Support** — Real-time UI updates via streaming responses
- 🛡️ **Error Handling** — Graceful degradation + auto-healing

### Key Components

**Main Class:**
- `ChatEngineOmega` — Singleton chat orchestrator

**Dependencies:**
- `UnifiedMemory` (`src/services/unified/UnifiedMemory.ts`) — Memory recall/store
- `CognitiveOmegaOrchestrator` (`src/services/cognitive/cognitiveOmegaIntegration.ts`) — Cognitive engines
- `chatService` (`src/services/chat/chatService.ts`) — Tauri backend communication
- `secureInvoke` (`src/lib/security.ts`) — Secure Tauri command invocation

**Integration Points:**
- Backend OMEGA Pipeline (via `conversation_generate` Tauri command)
- UnifiedMemory (recall context before AI call, store after)
- Cognitive engines (semantic memory, goals, evaluation, observability)
- UI stores (chat store, memory store, singularity store)

---

## 📊 ARCHITECTURE

### Chat Flow (Frontend → Backend → Frontend)

```
┌──────────────────────────────────────────────────────────────┐
│               USER INPUT (ChatPage UI)                       │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ CHATENGINE.generate(message, history, config)               │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1.1: INPUT VALIDATION                                  │
│ - Sanitize user message                                      │
│ - Validate config (mode, provider, temperature)              │
│ - Initialize pipeline tracking                               │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1.2: MEMORY CONTEXT RETRIEVAL (UnifiedMemory)          │
│ - Recall relevant memories (semantic search)                 │
│ - Build memory bundle (context for AI)                       │
│ - Calculate importance score                                 │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1.3: COGNITIVE CONTEXT INJECTION                       │
│ - Semantic memory retrieval (SemanticMemoryEngine)           │
│ - Goals & facts injection (GoalConsistencyEngine)            │
│ - Start observability trace (CognitiveObservability)         │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1.4: BACKEND DISPATCH                                  │
│ - Call Tauri command: conversation_generate                  │
│ - Pass: conversationId, message, systemPrompt, config        │
│ - Wait for backend OMEGA Pipeline execution                  │
└──────────────────────────────────────────────────────────────┘
                            ↓ (Backend OMEGA: 12 stages)
┌──────────────────────────────────────────────────────────────┐
│ BACKEND: OMEGA PIPELINE + CONVERSATION ENGINE                │
│ (See OMEGA_PIPELINE.md + CONVERSATION_ENGINE.md)             │
│ - Stages 1-12 (validation → AI generation → meta-processing) │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1.5: RESPONSE PROCESSING                               │
│ - Receive backend response (ConversationResponse)            │
│ - Extract: message, intent, emotion, quality, safety         │
│ - Process streaming chunks (if streaming enabled)            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1.6: MEMORY SAVING (UnifiedMemory)                     │
│ - Store interaction (user message + AI response)             │
│ - Calculate importance (based on mode, quality)              │
│ - Persist to STM → MTM → LTM                                 │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1.7: COGNITIVE MEMORY SAVING                           │
│ - Save to SemanticMemoryEngine (long-term semantic)          │
│ - Update goals (GoalConsistencyEngine)                       │
│ - End observability trace (CognitiveObservability)           │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1.8: RESPONSE FINALIZATION                             │
│ - Build ChatEngineResponse                                   │
│ - Attach metadata (pipeline steps, timing, auto-healed)      │
│ - Return to UI                                               │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                  UI UPDATE (ChatPage)                        │
│              (Display AI response + metadata)                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 API REFERENCE

### Main Class: `ChatEngineOmega`

```typescript
class ChatEngineOmega {
  private memoryContext: MemoryContext | null = null;
  private cognitiveOrchestrator: CognitiveOmegaOrchestrator;
  
  // Singleton pattern
  private static instance: ChatEngineOmega;
}
```

### Core Methods

#### `generate(message: string, history: AIMessage[], config?: Partial<ChatEngineConfig>): Promise<ChatEngineResponse>`

**Purpose:** Generate AI response (main entry point)

**Parameters:**
- `message: string` — User message (plain text)
- `history: AIMessage[]` — Conversation history (for context)
- `config?: Partial<ChatEngineConfig>` — Optional config override

**Returns:** `Promise<ChatEngineResponse>` — AI response + metadata

**Example:**
```typescript
import { chatEngine } from '@/services/ai/chatEngine';

const response = await chatEngine.generate(
  "Explique-moi le pipeline OMEGA",
  [], // history
  {
    mode: 'technical',
    aiConfig: {
      provider: 'ollama',
      model: 'mistral:latest',
      temperature: 0.7,
    }
  }
);

console.log('AI Response:', response.content);
console.log('Quality score:', response.metadata.qualityScore);
console.log('Pipeline steps:', response.metadata.pipelineSteps);
```

#### `generateStreaming(message: string, onChunk: (chunk: string) => void, config?: Partial<ChatEngineConfig>): Promise<ChatEngineResponse>`

**Purpose:** Generate AI response avec streaming (real-time UI updates)

**Parameters:**
- `message: string` — User message
- `onChunk: (chunk: string) => void` — Callback pour each chunk received
- `config?: Partial<ChatEngineConfig>` — Optional config

**Returns:** `Promise<ChatEngineResponse>` — Final complete response

**Example:**
```typescript
const response = await chatEngine.generateStreaming(
  "Explique-moi l'architecture TITANE∞",
  (chunk) => {
    // Update UI avec chunk
    updateChatUI(chunk);
  },
  { mode: 'educational' }
);
```

#### `setMemoryContext(context: MemoryContext): void`

**Purpose:** Set memory context for next generation

**Parameters:**
- `context: MemoryContext` — Memory bundle (retrieved memories + metadata)

---

## 💾 DATA STRUCTURES

### `ChatEngineConfig`

```typescript
interface ChatEngineConfig {
  /// Conversation mode
  mode: 'technical' | 'creative' | 'empathetic' | 'educational' | 'professional';
  /// Conversation ID (for tracking)
  conversationId?: string;
  /// AI provider config
  aiConfig?: {
    provider: 'ollama' | 'gemini' | 'claude' | 'openai';
    model: string;
    temperature?: number; // 0.0-2.0
    maxTokens?: number;
  };
  /// Enable streaming
  streaming?: boolean;
  /// Custom system prompt
  systemPrompt?: string;
}
```

### `ChatEngineResponse`

```typescript
interface ChatEngineResponse {
  /// AI-generated response content
  content: string;
  /// Metadata
  metadata: {
    /// Intent detected
    intent?: string;
    /// Emotion detected
    emotion?: string;
    /// Quality score (0.0-1.0)
    qualityScore?: number;
    /// Safety score (0.0-1.0)
    safetyScore?: number;
    /// Pipeline steps executed
    pipelineSteps: string[];
    /// Processing time (ms)
    processingTimeMs: number;
    /// Auto-healing applied?
    autoHealed: boolean;
    /// Provider used
    provider?: string;
  };
}
```

### `MemoryContext`

```typescript
interface MemoryContext {
  /// Retrieved memories (semantic search)
  memories: MemoryEntry[];
  /// Total memories count
  totalCount: number;
  /// Search query used
  query: string;
  /// Retrieval time (ms)
  retrievalTimeMs: number;
}
```

---

## 🔗 INTEGRATIONS

### Backend OMEGA Pipeline

**Flow:** ChatEngine → Tauri `conversation_generate` → Backend OMEGA

**Example:**
```typescript
const payload: ChatEngineRequestArgs = {
  conversationId: this.getConversationId(config.mode),
  userMessage: validatedMessage,
  systemPrompt: config.systemPrompt || DEFAULT_SYSTEM_PROMPT,
  temperature: config.aiConfig?.temperature ?? 0.7,
  maxOutputTokens: config.aiConfig?.maxTokens ?? 4096,
  conversationMode: config.mode,
};

const backendResponse = await secureInvoke<ConversationResponseType>(
  'conversation_generate',
  payload
);
```

### UnifiedMemory Integration

**Flow:** ChatEngine → UnifiedMemory (recall → generate → store)

**Example:**
```typescript
// Phase 1.2: Recall memories
const memories = await unifiedMemory.recall(message, 10);

// Phase 1.6: Store interaction
await unifiedMemory.store(
  `${message}\n\n${response.content}`,
  'assistant',
  importance,
  conversationId,
  [config.mode, 'conversation']
);
```

### Cognitive Engines Integration

**Flow:** ChatEngine → CognitiveOmegaOrchestrator → 4 cognitive engines

**Example:**
```typescript
// Phase 1.3.1: Semantic memory retrieval
const semanticMemories = await this.cognitiveOrchestrator.retrieveSemanticMemories({
  text: validatedMessage,
  conversationId,
  topK: 5,
});

// Phase 1.3.2: Goals & facts injection
const goalsAndFacts = await this.cognitiveOrchestrator.getGoalsAndFactsContext(conversationId);

// Phase 1.7: Cognitive memory saving
await this.cognitiveOrchestrator.storeConversation({
  conversationId,
  userMessage: validatedMessage,
  assistantMessage: response.content,
  metadata: { mode: config.mode, quality: response.metadata.qualityScore },
});
```

---

## 🧪 TESTING

### Unit Tests

**File:** `src/services/ai/__tests__/chatEngine.test.ts`

```bash
# Run ChatEngine tests
npm run test chatEngine

# Run with coverage
npm run test:coverage chatEngine
```

**Key Test Cases:**
- `test_generate_basic` — Basic generation flow
- `test_generate_streaming` — Streaming chunks handling
- `test_backend_fallback` — Frontend fallback si backend fails
- `test_memory_integration` — UnifiedMemory recall/store
- `test_cognitive_integration` — Cognitive engines integration
- `test_auto_healing` — Auto-healing scenarios

---

## 📚 RELATED DOCUMENTATION

**Backend:**
- [OMEGA_PIPELINE.md](../backend/OMEGA_PIPELINE.md) — Backend OMEGA integration
- [CONVERSATION_ENGINE.md](../backend/CONVERSATION_ENGINE.md) — Backend conversation processing

**Frontend:**
- [UNIFIED_MEMORY_FRONTEND.md](UNIFIED_MEMORY_FRONTEND.md) — Frontend memory service
- [COGNITIVE_ORCHESTRATOR.md](COGNITIVE_ORCHESTRATOR.md) — Cognitive engines orchestration

**Architecture:**
- [DATA_FLOW_CHAT.md](../../02_architecture_reality/DATA_FLOW_CHAT.md) — Full chat data flow
- [TAURI_COMMANDS_REFERENCE.md](../../02_architecture_reality/TAURI_COMMANDS_REFERENCE.md) — Tauri commands

---

**Module documentation généré:** 15 décembre 2025  
**Version:** v1.0.0  
**Maintainer:** TITANE∞ Documentation Evolution Engine vΩ
