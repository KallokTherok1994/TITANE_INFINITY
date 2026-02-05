# TITANE∞ — ARCHITECTURE DOCUMENTATION

**Version:** 26.3.0  
**Last Updated:** 2025-02-03  
**Author:** GitHub Copilot / TITANE∞ Team  
**License:** TITANE∞ Proprietary

---

## Table of Contents

1. [System Overview](#system-overview)
2. [4-Ring Architecture Pattern](#4-ring-architecture-pattern)
3. [Core Systems](#core-systems)
   - [Chat Engine & Pipeline](#chat-engine--pipeline)
   - [Multi-Conversation Lifecycle](#multi-conversation-lifecycle)
   - [Memory & Context Management](#memory--context-management)
4. [Data Flow](#data-flow)
5. [Isolation Mechanisms](#isolation-mechanisms)
6. [Error Handling Strategy](#error-handling-strategy)

---

## System Overview

TITANE∞ is a desktop chat application with advanced features:
- **Local-First:** All data stored locally (localStorage)
- **Tauri-Based:** Rust backend, React frontend
- **Multi-Conversation:** Support for multiple concurrent conversations
- **Memory-Aware:** Integration with memory/context systems
- **Governed:** Strict architectural patterns enforced

**Technology Stack:**
- Frontend: React (TypeScript), Vite
- Backend: Tauri (Rust)
- Storage: localStorage (browser API)
- Testing: Vitest + Playwright
- Build: pnpm (Node.js)

---

## 4-Ring Architecture Pattern

TITANE∞ employs a **4-Ring architectural pattern** for separation of concerns:

```
┌─────────────────────────────────────┐
│  Ring 4: UI Components & Hooks      │  (React)
│  - ConversationsSidebar.tsx         │
│  - ConversationsButton.tsx          │
│  - useConversations() hook          │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Ring 3: Services & Persistence     │  (State Management)
│  - ConversationStorageService       │
│  - Event handlers & listeners       │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Ring 2: Engines & Business Logic   │  (Orchestration)
│  - ConversationLifecycleEngine      │
│  - State transitions                │
│  - Event emission                   │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Ring 1: Types & Interfaces         │  (Contracts)
│  - Conversation                     │
│  - ConversationSummary              │
│  - ConversationLifecycleEvent       │
└─────────────────────────────────────┘
```

**Key Principle:** Each ring has single responsibility
- **Ring 1 (Types):** Define what is possible
- **Ring 2 (Engines):** Orchestrate business logic
- **Ring 3 (Services):** Handle persistence & events
- **Ring 4 (UI):** Render and delegate to lower rings

---

## Core Systems

### Chat Engine & Pipeline

**Location:** `src/services/ai/chatEngine.ts`

**Responsibilities:**
- Execute chat pipeline (preprocessor → model → postprocessor)
- Manage conversation context
- Thread `conversationId` through all pipeline stages
- Integrate with ConversationLifecycleEngine

**Key Integration Points:**
```typescript
// Line 57: Import lifecycle engine
import { conversationLifecycle } from '@/engines/conversation/conversationLifecycleEngine';

// Line 204: Get active conversation
const activeId = conversationLifecycle.getActiveConversation();

// Line 220: Activate new conversation
conversationLifecycle.setActiveConversation(id);

// Line 411-413: Inject into backend request
const request = {
  conversationId: activeId,
  messages: contextMessages,
  ...
};

// Line 1010, 1177, 1197: Thread through pipeline stages
// conversationId passed to preprocessor, model, postprocessor
```

**Message Flow:**
```
User Input
    ↓
Preprocessor (with conversationId)
    ↓
AI Model (context includes conversationId)
    ↓
Postprocessor (appends to specific conversation)
    ↓
ConversationStorageService.appendMessage(conversationId, message)
```

---

### Multi-Conversation Lifecycle

**Location:** `src/engines/conversation/`

**Architecture:**

The multi-conversation system follows the 4-Ring pattern:

#### Ring 1: Types
**File:** `src/types/conversation.ts` (153 lines)

**Interfaces:**
- `Conversation` — Full conversation state (id, title, messages[], status, mode, metadata)
- `ConversationSummary` — Lightweight reference (id, title, status, counts)
- `ConversationLifecycleEvent` — Audit events (type, timestamp, conversation_id, data)
- `CreateConversationOptions` — Parameters for creation (title, mode, metadata)

#### Ring 2: Engine
**File:** `src/engines/conversation/conversationLifecycleEngine.ts` (244 lines)

**Class:** `ConversationLifecycleEngine` (singleton)

**Responsibilities:**
- Manage active conversation state
- Emit lifecycle events (created, activated, archived, etc.)
- Validate message eligibility
- Create conversation summaries

**Key Methods:**
```typescript
// State management
createConversation(options?: CreateConversationOptions): Conversation
setActiveConversation(conversationId: string): void
getActiveConversation(): string | null

// Message validation
canReceiveMessages(conversationId: string | null): boolean

// Lifecycle operations
archiveConversation(conversationId: string): void
updateConversationTitle(conversationId: string, title: string): void

// Summaries & metadata
createSummary(conversation: Conversation): ConversationSummary

// Event system
addEventListener(listener: (event: ConversationLifecycleEvent) => void): void
```

**Event Types:**
- `conversation.created` — New conversation created
- `conversation.activated` — Conversation became active
- `conversation.message.appended` — Message added to conversation
- `conversation.archived` — Conversation archived
- `conversation.title.updated` — Conversation title changed

#### Ring 3: Service
**File:** `src/services/conversation/conversationStorage.ts` (371 lines)

**Class:** `ConversationStorageService` (singleton)

**Responsibilities:**
- localStorage persistence (read/write/update)
- Event listener registration
- Message isolation (load conversation before append)
- Index management

**Key Methods:**
```typescript
// Persistence
async initialize(): Promise<void>
async saveConversation(conversation: Conversation): Promise<void>
async loadConversation(conversationId: string): Promise<Conversation | null>
async listConversations(): Promise<ConversationSummary[]>

// Message operations (ISOLATED by conversationId)
async appendMessage(conversationId: string, message: AIMessage): Promise<void>

// Active conversation tracking
async getActiveConversation(): Promise<Conversation | null>
```

**Storage Schema:**
```
localStorage keys:
├── titane_conversation_{id}         — Full conversation state (JSON)
├── titane_conversations_index       — List of all conversations (metadata)
├── titane_active_conversation_id    — Current active conversation ID
└── titane_conversation_events       — Append-only event log (JSON array)
```

**Critical Implementation Detail:**
```typescript
// Message isolation enforced at Ring 3
async appendMessage(conversationId: string, message: AIMessage): Promise<void> {
  // 1. Load ONLY the specified conversation
  const conversation = await this.loadConversation(conversationId);
  
  // 2. Fail if conversation doesn't exist
  if (!conversation) {
    throw new Error('Conversation not found: ' + conversationId);
  }
  
  // 3. Append to loaded conversation only
  conversation.messages.push(message);
  
  // 4. Persist immediately
  await this.saveConversation(conversation);
}
// Result: Message CANNOT leak to wrong conversation
```

#### Ring 4: UI & Hooks
**Files:** `src/components/chat/Conversations*.tsx` + `src/hooks/useConversations.ts`

**Components:**
- `ConversationsSidebar.tsx` — Drawer with conversation history
- `ConversationsButton.tsx` — Toggle button for sidebar
- `useConversations.ts` — React hook for CRUD operations

**Hook State & Actions:**
```typescript
// State
conversations: ConversationSummary[]
activeConversationId: string | null
activeConversation: Conversation | null
isLoading: boolean

// Actions (delegate to lower rings)
createConversation(options?: CreateConversationOptions): Promise<Conversation>
setActiveConversation(conversationId: string): Promise<void>
archiveConversation(conversationId: string): Promise<void>
deleteConversation(conversationId: string): Promise<void>
refreshConversations(): Promise<void>
```

**Usage in Components:**
```typescript
const { conversations, activeConversationId, createConversation } = useConversations();

// Hook auto-initializes on mount
// Provides CRUD interface to Ring 4 components
// Components remain stateless (no business logic)
```

---

## Data Flow

### New User Message → Storage

```
┌─ UI: User types message ─────────────────────┐
│                                               │
│  User Input: "What is AI?"                   │
│  Component: ChatInput.tsx                    │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─ chatEngine.ts: executeChat() ─────────────────┐
│                                                 │
│  1. Get activeConversation via lifecycle      │
│  2. Build context (recent messages, memories)  │
│  3. Call AI model with conversationId          │
│  4. Store response in ACTIVE conversation      │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─ conversationStorage.ts: appendMessage() ─────┐
│                                                │
│  1. Load conversation by conversationId       │
│  2. Append AIMessage to messages[]            │
│  3. Update updated_at timestamp               │
│  4. Persist to localStorage                   │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─ localStorage: titane_conversation_{id} ─────┐
│                                               │
│  Conversation {                               │
│    id: "conv-1234567-abc",                   │
│    title: "AI Discussion",                   │
│    messages: [                                │
│      { role: "user", content: "..." },       │
│      { role: "assistant", content: "..." }   │
│    ]                                          │
│  }                                            │
└───────────────────────────────────────────────┘
```

### User Switches Conversation

```
┌─ UI: Click conversation in sidebar ──────────┐
│                                               │
│  Target: "conv-5678-xyz"                     │
│  Component: ConversationsSidebar.tsx         │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─ useConversations hook ─────────────────────┐
│                                              │
│  Call: setActiveConversation("conv-5678")   │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─ conversationLifecycle.setActiveConversation() ─┐
│                                                  │
│  1. Update activeConversationId                │
│  2. Emit "conversation.activated" event        │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─ conversationStorage event handler ──────────┐
│                                               │
│  1. Receive "conversation.activated" event  │
│  2. Save activeConversation ID to localStorage│
│  3. Update UI state                          │
└───────────────────────────────────────────────┘
```

---

## Isolation Mechanisms

### 1. One Active Conversation (Single State)

**Mechanism:** Singleton pattern with single `activeConversationId` field

```typescript
// src/engines/conversation/conversationLifecycleEngine.ts:56
private activeConversationId: string | null = null;

// Only setter is setActiveConversation() → enforces one at a time
setActiveConversation(conversationId: string): void {
  if (this.activeConversationId === conversationId) {
    return; // Already active
  }
  this.activeConversationId = conversationId;
  this.emitEvent({ type: 'conversation.activated', ... });
}
```

**Result:** Impossible to have two conversations active simultaneously

### 2. Message Storage Isolation (By Conversation ID)

**Mechanism:** Explicit conversation loading before message append

```typescript
// src/services/conversation/conversationStorage.ts:176
async appendMessage(conversationId: string, message: AIMessage): Promise<void> {
  // Load ONLY the specified conversation
  const conversation = await this.loadConversation(conversationId);
  
  // Fail if doesn't exist
  if (!conversation) {
    throw new Error('Conversation not found: ' + conversationId);
  }
  
  // Append only to loaded conversation
  conversation.messages.push(message);
  await this.saveConversation(conversation);
}
```

**Result:** Message cannot be appended to wrong conversation

### 3. localStorage Key Prefixing

**Mechanism:** Unique key per conversation with prefix

```typescript
// Each conversation gets unique key
const key = `titane_conversation_${conversation.id}`;

// Example keys in localStorage:
// titane_conversation_conv-1738541234000-abc123
// titane_conversation_conv-1738541235000-def456
// (Different conversations = different keys)
```

**Result:** No key collision, physical separation of data

### 4. Pipeline conversationId Threading

**Mechanism:** conversationId passed explicitly through all stages

```typescript
// Stage 1: Get active conversation
const activeId = conversationLifecycle.getActiveConversation();

// Stage 2: Pass to preprocessor
const preprocessed = await preprocessor(messages, activeId);

// Stage 3: Pass to model
const response = await model.chat({
  conversationId: activeId,  // ← Explicit parameter
  ...
});

// Stage 4: Append to specific conversation
await conversationStorage.appendMessage(activeId, response);
```

**Result:** conversationId never implicit; always explicit parameter

---

## Error Handling Strategy

### Try-Catch Coverage

All critical paths have error handling:

| Function | Pattern | Result |
|----------|---------|--------|
| `saveConversation()` | try-catch | Logs error, throws Error |
| `loadConversation()` | try-catch | Returns null on error |
| `appendMessage()` | Null check before append | Throws if not found |
| `setActiveConversation()` | Idempotent | Safe to call repeatedly |
| `canReceiveMessages()` | Early returns | Returns false instead of throwing |

### Logging Strategy

**Pattern:** All operations logged at appropriate levels

```typescript
logger.debug('Conversation loaded', { id: conversationId });
logger.warn('Conversation not found', { id: conversationId });
logger.error('Save conversation error', error);
logger.info('Conversation created', { id, title });
```

**Purpose:** Enable debugging without exposing sensitive data

### Silent Failure Prevention

**Rule:** No operation silently succeeds or fails

Example:
```typescript
// ❌ Bad: Silent failure
if (conversation) {
  conversation.messages.push(message);  // What if conversation is null?
}

// ✅ Good: Explicit handling
if (!conversation) {
  throw new Error('Conversation not found: ' + conversationId);
}
conversation.messages.push(message);
```

---

## Appendix: File Locations

| Component | File | Lines |
|-----------|------|-------|
| Types | `src/types/conversation.ts` | 153 |
| Engine | `src/engines/conversation/conversationLifecycleEngine.ts` | 244 |
| Service | `src/services/conversation/conversationStorage.ts` | 371 |
| Hook | `src/hooks/useConversations.ts` | 190 |
| Components | `src/components/chat/Conversations*.tsx` | 263 |
| Tests | `src/engines/conversation/__tests__/*.test.ts` | 233 |
| **Total** | | **1,454** |

---

**Document Version:** 1.0  
**Status:** FINAL  
**Approved:** Phase 2 Audit Complete ✅
