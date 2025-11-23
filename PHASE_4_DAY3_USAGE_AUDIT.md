# 🔗 COMMAND DEDUPLICATION - USAGE AUDIT RESULTS

**Date**: 23 novembre 2025
**Phase**: Phase 4 Jour 3 Step 1
**Méthode**: grep search sur src/**/*.{ts,tsx} pour 14 doublons

---

## 📊 RÉSULTATS AUDIT FRONTEND

### Commandes UTILISÉES (3/14) ✅

| Command | Frontend Usage | Files | Decision |
|---------|----------------|-------|----------|
| `memory_clear` | ✅ **1 usage** | src/hooks/useMemoryCore.ts:67 | **KEEP** - Garder version active |
| `clear_all_memory` | ✅ **1 usage** | src/hooks/useMemory.ts:137 | **KEEP** - Garder version active |
| `meta_mode_reset` | ✅ **1 usage** | src/components/MetaModeConsole.tsx:105 | **KEEP** - Garder version active |

### Commandes NON UTILISÉES (11/14) ❌

| Command | Frontend Usage | Backend Locations | Decision |
|---------|----------------|-------------------|----------|
| `start_recording` | ❌ **0 usages** | api/legacy_commands.rs + commands/ai_chat.rs | **DELETE BOTH** - Voice feature unused |
| `stop_recording` | ❌ **0 usages** | api/legacy_commands.rs + commands/ai_chat.rs | **DELETE BOTH** - Voice feature unused |
| `speak` | ❌ **0 usages** | api/legacy_commands.rs + commands/ai_chat.rs | **DELETE BOTH** - TTS unused |
| `delete_conversation` | ❌ **0 usages** | api/legacy_commands.rs + commands/ai_chat.rs | **DELETE BOTH** - Chat feature dormant |
| `memory_save_entry` | ❌ **0 usages** | api/legacy_commands.rs + ??? | **DELETE** - Replaced by memory_save_chat_interaction? |
| `memory_get_state` | ❌ **0 usages** (doublon!) | api/legacy_commands.rs + api/memory_api.rs | **DELETE legacy** - Keep memory_api version (v17.3.0) |
| `get_system_status` | ❌ **0 usages** | api/legacy_commands.rs | **DELETE** - Replaced by get_system_health |
| `helios_get_metrics` | ❌ **0 usages** | api/legacy_commands.rs | **DELETE** - Replaced by get_helios_state |
| `harmonia_get_flows` | ❌ **0 usages** | api/legacy_commands.rs | **DELETE** - Replaced by get_harmonia_state |
| `nexus_get_graph` | ❌ **0 usages** | api/legacy_commands.rs | **DELETE** - Replaced by get_nexus_state |
| `auto_heal_scan` | ❌ **0 usages** | auto_heal.rs (not in main.rs) | **DELETE** - Orphan command never registered |
| `auto_heal_repair` | ❌ **0 usages** | auto_heal.rs (not in main.rs) | **DELETE** - Orphan command never registered |
| `auto_heal_get_logs` | ❌ **0 usages** | auto_heal.rs (not in main.rs) | **DELETE** - Orphan command never registered |

---

## 🎯 DÉCISIONS FINALES

### KEEP (3 commandes)
Commandes UTILISÉES par frontend, garder version active:

1. **memory_clear**
   - Usage: hooks/useMemoryCore.ts
   - Action: Vérifier quelle version backend (legacy vs ai_chat), garder celle-là
   - Backend check requis: grep src-tauri pour trouver implémentation

2. **clear_all_memory**
   - Usage: hooks/useMemory.ts
   - Action: Vérifier backend location, garder version utilisée

3. **meta_mode_reset**
   - Usage: components/MetaModeConsole.tsx
   - Action: Vérifier backend (probablement commands/meta_mode.rs), garder

### DELETE (11 commandes)
Commandes NON utilisées, supprimer toutes versions:

**Voice/Audio (3)**: start_recording, stop_recording, speak
- Raison: Voice engine non utilisé dans v17.3.0
- Action: Supprimer de legacy_commands.rs + ai_chat.rs + main.rs

**Memory Legacy (2)**: memory_save_entry, memory_get_state (doublon)
- Raison: Remplacées par API v17.3.0 (memory_save_chat_interaction, get_memory_state)
- Action: Supprimer versions legacy uniquement

**System Monitoring Legacy (4)**: get_system_status, helios_get_metrics, harmonia_get_flows, nexus_get_graph
- Raison: Remplacées par API v17.3.0 (get_system_health, get_helios_state, get_harmonia_state, get_nexus_state)
- Action: Supprimer de legacy_commands.rs + main.rs

**Auto-Heal Orphans (3)**: auto_heal_scan, auto_heal_repair, auto_heal_get_logs
- Raison: Jamais enregistrées dans main.rs, feature dormante
- Action: Supprimer auto_heal.rs entièrement OU commenter commandes

**Chat Legacy (1)**: delete_conversation
- Raison: Chat AI non utilisé (feature dormante)
- Action: Supprimer de legacy_commands.rs + ai_chat.rs

---

## 📋 PROCHAINES ÉTAPES (Step 2)

**Backend Verification** (Jour 3 Step 2):
Pour les 3 commandes KEEP, vérifier implémentation backend:

```bash
# 1. memory_clear
grep -r "fn memory_clear" src-tauri/src --include="*.rs"
# Output: Trouver quelle version (legacy vs ai_chat)

# 2. clear_all_memory
grep -r "fn clear_all_memory" src-tauri/src --include="*.rs"

# 3. meta_mode_reset
grep -r "fn meta_mode_reset" src-tauri/src --include="*.rs"
```

**Résultat attendu**:
```markdown
| Command | Backend Location | Action |
|---------|------------------|--------|
| memory_clear | commands/ai_chat.rs | KEEP ai_chat, DELETE legacy version |
| clear_all_memory | api/legacy_commands.rs | KEEP legacy (only version) |
| meta_mode_reset | commands/meta_mode.rs | KEEP meta_mode, DELETE legacy version |
```

---

## 🔧 MÉTRIQUES

**Suppression prévue**:
- **11 commandes** à supprimer (0 usage frontend)
- **3 commandes** à garder (utilisées activement)
- **Estimation lignes supprimées**: ~300-500 lignes (doublons + legacy)

**Impact main.rs**:
- AVANT: 146 lignes invoke_handler (doublons inclus)
- APRÈS: ~70-80 lignes (unique commands only)
- Réduction: **-50%**

**Impact frontend**:
- 0 modifications TypeScript requises (commandes gardées inchangées)
- 0 invokes orphelins (toutes commandes supprimées = non utilisées)

---

**Status**: ✅ STEP 1 COMPLETE
**Prochaine action**: Step 2 - Backend Verification (grep search 3 commandes KEEP)
