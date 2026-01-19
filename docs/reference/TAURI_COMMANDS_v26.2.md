# 📡 Référence Commandes Tauri — TITANE∞ v26.2

**Version:** 26.2.0  
**Date:** 2025-12-23  
**Backend:** Rust + Tauri v2.2.0

---

## 🎯 VUE D'ENSEMBLE

Cette référence liste les principales commandes Tauri disponibles dans TITANE∞ v26.2.

**Commandes Principales:** conversation_generate, memory_search_semantic, system_health_check  
**Documentation Complète:** Voir `docs/COMMANDES_TAURI_COMPLETE_v26.3.0.md`

---

## 🔑 COMMANDES ESSENTIELLES

### `conversation_generate` (OMEGA v2)

Pipeline conversation avec IA - **NOUVELLE API v26.0**

```typescript
import { invoke } from '@tauri-apps/api/tauri';

const response = await invoke('conversation_generate', {
  conversationId: 'uuid-123',  // Requis (breaking change)
  message: 'Bonjour TITANE',
  context: {}                  // Optionnel
});
```

### `memory_search_semantic`

Recherche vectorielle en mémoire

```typescript
const results = await invoke('memory_search_semantic', {
  query: 'déploiement production',
  limit: 5,
  threshold: 0.7
});
```

### `system_health_check`

Check santé système complet

```typescript
const health = await invoke('system_health_check');
console.log(`Score: ${health.overall_score}/100`);
```

---

## 📖 DOCUMENTATION COMPLÈTE

**45+ commandes disponibles** - Voir:
- **Guide Migration:** `docs/guides/MIGRATION_v24_to_v26.md`
- **Référence Complète:** `docs/COMMANDES_TAURI_COMPLETE_v26.3.0.md`

---

**Status:** ✅ À jour v26.2.0
