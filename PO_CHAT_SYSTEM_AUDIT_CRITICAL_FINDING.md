# ⚠️ **PΩ_CHAT_SYSTEM_AUDIT — PROBLÈME CRITIQUE DÉTECTÉ**

**Date:** 2025-02-03  
**Sévérité:** 🔴 CRITIQUE  
**Phase:** 3 (Backend & Pipeline IA)  
**Statut:** IDENTIFIÉ & EN CORRECTION

---

## Problème Identifié

### Système Dual de localStorage (Conflit)

**Ancien système (useChat.ts):**

```typescript
const stored = localStorage.getItem('titane_current_conversation_id');
localStorage.setItem('titane_current_conversation_id', newId);
localStorage.getItem('titane_chat_mode_default');
```

**Nouveau système (conversationStorage.ts):**

```typescript
const STORAGE_KEY_ACTIVE = 'titane_active_conversation_id';
const STORAGE_KEY_PREFIX = 'titane_conversation_';
```

### Problèmes Causés

1. **Deux sources de vérité** pour l'ID actif
2. **Chat histoire chargée depuis ancien système** (useChat.ts:477-482)
3. **Multi-conversations sauvegardée dans nouveau système** (conversationStorage.ts)
4. **Risque de désynchro** lors du switch de conversation
5. **Ancien système peut rester actif et écraser le nouveau**

### Manifestations

- Messages de 2 conversations apparaître dans la même UI
- Historique ne pas se charger correctement au switch
- Conversation ID en cache ne pas synchroniser
- Redémarrage app peut restaurer mauvaise conversation

---

## Solution

**Merger les deux systèmes en UN seul système centralisé:**

1. **useChat.ts** → Utiliser `conversationStorage.getActiveConversation()` au lieu du localStorage local
2. **Supprimer** les clés legacy (`titane_current_conversation_id`, `titane_chat_mode_default`)
3. **useChat.ts** → Charger messages depuis `conversationStorage.loadConversation(activeId)`
4. **Unifier** la persistance sous `conversationStorage`

---

## Correction en Cours

Phase: **PHASE 3 → CORRECTION IMMÉDIATE**
