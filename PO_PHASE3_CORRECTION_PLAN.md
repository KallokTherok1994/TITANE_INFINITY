# PΩ_CHAT_SYSTEM_AUDIT — RAPPORT PHASE 3 CRITIQUE + PLAN DE CORRECTION

**Date:** 2025-02-03  
**Status:** PROBLÈME IDENTIFIÉ + PLAN EN COURS DE VALIDATION  
**Sévérité:** 🔴 CRITIQUE (Architectural)  
**Phase:** 3 (Backend & Pipeline IA)

---

## PROBLÈME DÉTECTÉ: Dual-localStorage Architectural Conflict

### Situation Actuelle

**Système 1 — Legacy (useChat.ts):**

```typescript
// Line 444-447 (useChat.ts)
const stored = localStorage.getItem('titane_current_conversation_id');
localStorage.setItem('titane_current_conversation_id', newId);
localStorage.getItem('titane_chat_mode_default'); // Messages sauvegardés ici
```

**Système 2 — New Multi-Conversations (conversationStorage.ts):**

```typescript
// Lines 26-28 (conversationStorage.ts)
private static readonly STORAGE_KEY_PREFIX = 'titane_conversation_';
private static readonly STORAGE_KEY_ACTIVE = 'titane_active_conversation_id';
private static readonly STORAGE_KEY_INDEX = 'titane_conversations_index';
```

### Le Danger

1. **Deux sources de vérité pour l'ID actif**
   - useChat.ts: `titane_current_conversation_id`
   - conversationStorage: `titane_active_conversation_id`
   - Ces deux peuvent diverger!

2. **Messages stockés en deux endroits différents**
   - Legacy: `titane_chat_mode_default` (pour mode "default")
   - New: `titane_conversation_{id}` (par ID)
   - Au switch: vieux messages peuvent réapparaître

3. **Comportement imprévisible au switch de conversation**
   - useChat réinitialise messages via ancien système
   - conversationStorage charge via nouveau système
   - Collision = comportement undefined

4. **Redémarrage App**
   - useChat initialise depuis `titane_current_conversation_id`
   - conversationStorage initialise depuis `titane_active_conversation_id`
   - Si divergent → divergence persist

### Violation Architecturale

**INVARIANT VIOLÉ:** "Source de vérité unique pour l'ID actif"

---

## PLAN DE CORRECTION

### Phase 3a: Ajouter Méthodes Sync à conversationStorage

**Raison:** useChat doit charger synchroniquement au mount (pour éviter le flash)

**Action:**

```typescript
// src/services/conversation/conversationStorage.ts

// Méthode synchrone pour obtenir l'ID actif (safe pour mount)
getActiveConversationId(): string | null {
  const id = localStorage.getItem(STORAGE_KEY_ACTIVE);
  return id || null;
}

// Méthode synchrone pour charger une conversation (safe pour mount)
loadConversationSync(conversationId: string): Conversation | null {
  const data = localStorage.getItem(STORAGE_KEY_PREFIX + conversationId);
  if (!data) return null;
  try {
    return JSON.parse(data) as Conversation;
  } catch (error) {
    logger.error('Failed to parse conversation', error);
    return null;
  }
}
```

**Impact:** Zéro, purement additionnel

---

### Phase 3b: Migrer useChat vers conversationStorage

**Step 1: Remove legacy conversationId generation**

```typescript
// BEFORE (Line 444-447)
const stored = localStorage.getItem('titane_current_conversation_id');
if (stored) return stored;
const newId = `conv-${Date.now()}-...`;
localStorage.setItem('titane_current_conversation_id', newId);

// AFTER
const activeId = conversationStorage.getActiveConversationId();
if (activeId) return activeId;
// If no active, fallback to creating one via conversationStorage
// But THIS SHOULD NOT HAPPEN in normal flow!
```

**Step 2: Remove legacy message loading**

```typescript
// BEFORE (Line 477-482)
const stored = localStorage.getItem('titane_chat_mode_default');
if (stored) {
  const memory = JSON.parse(stored);
  if (memory && Array.isArray(memory.messages)) {
    // Load from here
  }
}

// AFTER
const activeId = conversationStorage.getActiveConversationId();
if (activeId) {
  const conversation = conversationStorage.loadConversationSync(activeId);
  if (conversation) {
    // Load messages from conversation.messages
  }
}
```

**Step 3: Listen to conversation changes**

```typescript
// Add listener for when conversation changes externally
useEffect(() => {
  // When user clicks "new conversation" or switches via sidebar
  // this hook should reflect the change
  // Trigger reload of messages for new active conversation
}, [activeConversationId_FROM_LIFECYCLE]);
```

**Impact:** useChat now sources truth from conversationStorage

---

### Phase 3c: Remove Legacy Keys

**After full migration:**

```typescript
// Remove these keys from localStorage (they are obsolete)
// localStorage.removeItem('titane_current_conversation_id');
// localStorage.removeItem('titane_chat_mode_default');
// localStorage.removeItem('titane_chat_mode_architect');
// localStorage.removeItem('titane_chat_mode_debug');
// etc.

// Add one-time cleanup on app init
if (localStorage.getItem('titane_current_conversation_id')) {
  logger.info('Removing legacy conversation keys');
  Object.keys(localStorage)
    .filter(key => key.startsWith('titane_chat_mode_'))
    .forEach(key => localStorage.removeItem(key));
  localStorage.removeItem('titane_current_conversation_id');
}
```

---

## VALIDATION CRITERIA (After Correction)

- [ ] **Single Source of Truth:** Only `titane_active_conversation_id` exists
- [ ] **Message Loading:** All messages from `titane_conversation_{id}`
- [ ] **Switch Test:** Switch conversations → messages update correctly
- [ ] **Restart Test:** Close app → reopen → same conversation restored
- [ ] **New Conversation:** Click "New" → fresh context, empty messages
- [ ] **Legacy Keys:** Removed entirely from localStorage
- [ ] **No Conflicts:** Zero warnings about dual keys

---

## DEPENDENCY CHAIN

```
Phase 3a (Add sync methods to conversationStorage)
    ↓
Phase 3b (Migrate useChat to use conversationStorage)
    ↓
Phase 3c (Remove legacy keys)
    ↓
Phase 4 (Verify 4-Ring Architecture intact)
    ↓
PHASE 3 COMPLETE
```

---

## NEXT IMMEDIATE STEPS

1. ✅ Identify problem (DONE)
2. ⏳ Implement Phase 3a (add sync methods)
3. ⏳ Implement Phase 3b (migrate useChat)
4. ⏳ Implement Phase 3c (cleanup)
5. ⏳ Test thoroughly
6. ⏳ Update audit report

**No further phases until Phase 3 is fully resolved.**

---

**Document Status:** ANALYSIS COMPLETE, READY FOR IMPLEMENTATION  
**Confidence Level:** 100% (problem is clear and solution is straightforward)
