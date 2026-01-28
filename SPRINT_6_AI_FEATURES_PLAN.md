# 🚀 SPRINT 6: AI FEATURES - PLAN D'EXÉCUTION

**Statut:** 🔵 PLANNING  
**Date:** 28 janvier 2026  
**Niveau:** NIVEAU 3 (après Sprint 5)  
**Cible:** ✅ Complete AI Feature Set

---

## 📊 AUDIT: Qu'est-ce qui EXISTE vs ce qui MANQUE?

### ✅ DÉJÀ IMPLÉMENTÉ (Ne pas refaire!)

1. **Context Window Management** ✅
   - File: `src/services/ai/contextManager.ts` (520 lines)
   - 15+ AI models supported
   - 4 truncation strategies (RECENT, SUMMARIZE, IMPORTANCE, SLIDING)
   - Token estimation & management
   - Status: PRODUCTION READY

2. **Multi-turn Memory (RAG)** ✅
   - File: `src/services/ai/ConversationManager.ts`
   - Semantic search for relevant context
   - Memory tiers (STM, MEDIUM, LONG)
   - RAG augmentation with system messages
   - Status: INTEGRATED

3. **Tool Calling Infrastructure** ✅
   - Type definitions: `src/types/conversation.ts` (ToolCall interface)
   - Metadata support in messages
   - Status: FRAMEWORK READY

4. **Streaming Response** ✅
   - `enableStreaming: true` in ConversationManager
   - Stream batching (performance optimization)
   - Status: INTEGRATED

5. **Message Persistence** ✅ (Just added in Sprint 5!)
   - localStorage with useConversationEngine
   - Tab switch persistence
   - Cross-session history
   - Status: JUST COMPLETED

---

### ❌ À FAIRE (PRIORITAIRE)

#### **HIGH PRIORITY**

1. **Stream Response with Markdown Real-time**
   - Current: Raw text streaming
   - Needed: Markdown rendering during stream
   - Components to modify:
     - MessageBubble rendering logic
     - Stream message formatting
     - Code block highlighting integration
   - Effort: 3-4 hours
   - Impact: 🟢 HIGH (UX improvement)

2. **Code Syntax Highlighting**
   - Current: No code highlighting in messages
   - Needed: Syntax coloring for code blocks
   - Library: Prismjs or highlight.js
   - Components:
     - MessageBubble markdown support
     - Code block component
   - Effort: 2-3 hours
   - Impact: 🟢 HIGH (readability)

3. **Conversation Export/Import**
   - Current: localStorage only (volatile)
   - Needed: JSON export + import (persistent)
   - Features:
     - Export conversation as JSON/Markdown
     - Import previous conversations
     - Batch export all conversations
   - Effort: 2-3 hours
   - Impact: 🟡 MEDIUM

#### **MEDIUM PRIORITY**

4. **Tool Calling Implementation**
   - Current: Infrastructure ready, no execution
   - Needed: Execute tool calls from AI responses
   - Features:
     - Parse tool_calls from response
     - Execute registered tools
     - Return results to AI for next turn
   - Effort: 4-5 hours
   - Impact: 🟡 MEDIUM

5. **Advanced Context Display**
   - Current: Memory context loaded (hidden)
   - Needed: Visual display of active context
   - Components:
     - ChatContextPanel improvements
     - Show which memories are active
     - Token usage visualization
   - Effort: 2-3 hours
   - Impact: 🟡 MEDIUM

6. **Model Selection UI**
   - Current: Provider preference stored
   - Needed: User-facing model selector
   - Features:
     - Dropdown of available models
     - Model switching mid-conversation
     - Model capabilities display
   - Effort: 2 hours
   - Impact: 🟢 HIGH (for power users)

#### **LOW PRIORITY** 

7. **Conversation Search**
   - Current: No search in messages
   - Needed: Full-text search in history
   - Components:
     - Search input
     - Highlight results
     - Jump to message
   - Effort: 2 hours
   - Impact: 🟡 MEDIUM

---

## 🎯 SPRINT 6 SCOPE (RECOMMENDED)

**Focus:** Make AI features VISIBLE and INTERACTIVE (not infrastructure)

### Phase 1: User-Facing UI (Day 1)
**Goal:** Messages look better, more informative

- [ ] **Stream with Markdown Rendering**
  - Real-time markdown parsing during stream
  - Better formatting in MessageBubble
  - Effort: 3h

- [ ] **Code Syntax Highlighting**
  - Integrate highlight.js or Prismjs
  - CodeBlock component with colors
  - Theme support (dark/light)
  - Effort: 2.5h

### Phase 2: Export/Import (Day 1.5)
**Goal:** Users can save conversations**

- [ ] **Conversation Export**
  - JSON format (machine-readable)
  - Markdown format (human-readable)
  - Download button in UI
  - Effort: 1.5h

- [ ] **Conversation Import**
  - File upload & parsing
  - Load into chat history
  - Validation & error handling
  - Effort: 1.5h

### Phase 3: Advanced Features (Day 2+)
**Goal:** Unlock more capabilities

- [ ] **Model Selector UI**
  - Dropdown in chat header
  - Show current model
  - Switch models
  - Effort: 1.5h

- [ ] **Tool Calling** (if time permits)
  - Parse tool_calls in responses
  - Execute tool functions
  - Return results loop
  - Effort: 4-5h (skip if time limited)

---

## 📝 IMPLEMENTATION DETAILS

### 1. Stream with Markdown Rendering

**Current Flow:**
```
Backend sends: "# Title\n\nContent"
↓
Message received as string
↓
MessageBubble renders as plain text
```

**New Flow:**
```
Backend streams: "# Title" → "\n\n" → "Content"
↓
React component parses markdown in real-time
↓
MessageBubble renders formatted: Bold, code blocks, lists, etc.
```

**Files to Modify:**
- `src/components/chat/MessageBubble.tsx` (render logic)
- `src/hooks/useConversationEngine.ts` (stream handling)
- New: `src/components/chat/MarkdownContent.tsx` (markdown parser)

**Library:** `react-markdown` (already in most React projects)

### 2. Code Syntax Highlighting

**Implementation:**
```tsx
// CodeBlock component
<CodeBlock
  language="typescript"
  code="const x = 42;"
/>
```

**Library:** `highlight.js` (lightweight, no dependencies)

**Files:**
- New: `src/components/chat/CodeBlock.tsx`
- New: `src/components/chat/MarkdownContent.tsx` (use CodeBlock)

### 3. Conversation Export

**Format (JSON):**
```json
{
  "id": "conv-123",
  "mode": "default",
  "messages": [
    {"role": "user", "content": "...", "timestamp": 1234567890},
    {"role": "assistant", "content": "...", "timestamp": 1234567891}
  ],
  "metadata": {
    "createdAt": "2026-01-28",
    "provider": "Ollama",
    "messageCount": 2
  }
}
```

**Files:**
- New: `src/services/chat/conversationExporter.ts`
- Modify: `src/components/chat/ChatHeader.tsx` (add export button)
- Modify: `src/components/chat/ChatInputArea.tsx` (add import button)

### 4. Conversation Import

**Flow:**
```
User selects file
↓
Parse JSON/validate structure
↓
Load into useConversationEngine
↓
Display in chat UI
```

**Files:**
- Use: `src/services/chat/conversationExporter.ts` (parser)
- Modify: useConversationEngine (import method)

---

## 🔄 EXECUTION PLAN

### Sprint 6A: Quick Wins (Day 1 - 3-4h)
**Goal:** 2-3 visible improvements quickly

1. **Stream + Markdown** (3h)
   - Install react-markdown
   - Create MarkdownContent component
   - Integrate in MessageBubble
   - Test with simple messages

2. **Code Highlighting** (2.5h)
   - Install highlight.js
   - Create CodeBlock component
   - Add language detection
   - Style code blocks

**Outcome:** Messages look WAY better

### Sprint 6B: Persistence (Day 1.5 - 3h)
**Goal:** Users can save work

1. **Export** (1.5h)
   - conversationExporter.ts utility
   - Download button
   - Test export JSON/Markdown

2. **Import** (1.5h)
   - File upload handler
   - Parser + validation
   - Test import from exported file

**Outcome:** Conversations can be saved/restored

### Sprint 6C: Advanced (Day 2+ - if time)
**Goal:** More power for users

1. **Model Selector** (1.5h)
   - Dropdown UI
   - Provider integration
   - Model switching

2. **Tool Calling** (4-5h)
   - If there's time after other features
   - Complex feature, lowest priority

---

## ✅ VALIDATION CHECKLIST

**After completion, verify:**

- [ ] Markdown renders correctly in messages
- [ ] Code blocks have syntax highlighting
- [ ] Export creates valid JSON
- [ ] Import loads conversations
- [ ] No TypeScript errors
- [ ] Performance: no lag with 100+ messages
- [ ] Mobile: UI works on small screens
- [ ] Accessibility: keyboard navigation works

---

## 🎊 SUCCESS CRITERIA

**Sprint 6 = SUCCESS if:**

1. ✅ Messages render with markdown (bold, italic, code, links)
2. ✅ Code blocks have syntax colors
3. ✅ Users can export conversations
4. ✅ Users can import conversations
5. ✅ No regressions (Sprint 5 still works)
6. ✅ TypeScript: 0 errors

**Bonus (if time):**
- ✅ Model selector UI
- ✅ Tool calling works
- ✅ Context visualization

---

## 📊 DIFFICULTY DISTRIBUTION

| Feature | Difficulty | Time | Impact |
|---------|-----------|------|--------|
| Markdown rendering | 🟢 Easy | 3h | 🟢 HIGH |
| Code highlighting | 🟢 Easy | 2.5h | 🟢 HIGH |
| Export/Import | 🟡 Medium | 3h | 🟡 MEDIUM |
| Model selector | 🟡 Medium | 1.5h | 🟢 HIGH |
| Tool calling | 🔴 Hard | 4-5h | 🟡 MEDIUM |
| Context display | 🟡 Medium | 2h | 🟡 MEDIUM |

---

**Ready to start? Pick a feature and let's go!** 🚀

Recommended order:
1. **Markdown + Code Highlighting** (quick wins, high impact)
2. **Export/Import** (useful immediately)
3. **Model Selector** (bonus if time)
4. **Tool Calling** (skip unless explicitly requested)
