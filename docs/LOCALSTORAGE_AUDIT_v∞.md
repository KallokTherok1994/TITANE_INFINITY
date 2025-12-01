# 🔍 LOCALSTORAGE AUDIT REPORT — OPUS v∞.MPE-Ω

> **Date:** 2025-01-21  
> **Auditor:** TITAN Memory Doctor  
> **Total bypasses:** 93 usages localStorage détectés  
> **Priorité:** Migration progressive vers SingularityState

---

## 📊 RÉSUMÉ EXÉCUTIF

| Catégorie | Fichiers | Usages | Priorité |
|-----------|----------|--------|----------|
| 🔴 Critique (mémoire core) | 8 | 22 | URGENT |
| 🟡 Modérée (préférences) | 10 | 28 | HAUTE |
| 🟢 Faible (cache/logs) | 14 | 43 | NORMALE |

---

## 🔴 CATÉGORIE CRITIQUE — BYPASS MÉMOIRE CENTRALE

Ces fichiers contournent directement l'architecture SingularityState pour des données de mémoire :

### 1. `src/services/chatMemory.ts`
```
Clé: titane_chat_history
Usages: getItem(27), setItem(45), removeItem(56)
Impact: Chat history non synchronisé avec backend Rust
Migration: → state.memory.chat_history via titan_state_update
```

### 2. `src/services/chatMemoryCompactor.ts`
```
Clés: titane_chat_history, titane_chat_history_*
Usages: 10 (lignes 53, 84, 107, 124, 140, 159, 176, 279, 296)
Impact: Compaction locale sans notification backend
Migration: → titan_memory_compact command
```

### 3. `src/core/persona/PERSONA_MEMORY.ts`
```
Clé: titane-persona-memory
Usages: getItem(73), setItem(84)
Impact: Persona memory isolée
Migration: → state.nexus.persona via singularity
```

### 4. `src/core/ai/agents/memory_core_agent.ts`
```
Clé: memory_core_knowledge
Usages: getItem(331), setItem(351)
Impact: Knowledge base non centralisée
Migration: → state.cognition.knowledge via singularity
```

### 5. `src/cognitive/memory/memoryEngine.ts`
```
Clé: MEMORY_STORAGE_KEY
Usages: setItem(433)
Impact: Double écriture potentielle
Migration: → Supprimer localStorage, garder que Rust
```

### 6. `src/cognitive/knowledge/knowledgeVault.ts`
```
Clé: STORAGE_KEY (knowledgeVault)
Usages: getItem(198), setItem(530)
Impact: Knowledge vault fragmenté
Migration: → state.cognition.knowledge
```

### 7. `src/cognitive/evolution/evolutionEngine.ts`
```
Clé: STORAGE_KEY (evolution)
Usages: getItem(205), setItem(349)
Impact: Evolution state non synchronisé
Migration: → state.metrics.evolution
```

### 8. `src/cognitive/progression/xpEngine.ts`
```
Clé: xp_state (cognitive)
Usages: getItem(239), setItem(439)
Impact: XP fragmenté entre 2 systèmes
Migration: → Utiliser state.nexus.xp exclusivement
```

---

## 🟡 CATÉGORIE MODÉRÉE — PRÉFÉRENCES UTILISATEUR

### 1. `src/services/userPreferencesEngine.ts`
```
Clé: STORAGE_KEY (preferences)
Usages: getItem(136), setItem(149)
Migration: → state.harmonia.preferences
```

### 2. `src/features/audio-center/services/audioService.ts`
```
Clés: STORAGE_KEY (audio), elevenlabs_api_key
Usages: 3 (getItem x2, setItem x1)
Migration: → state.harmonia.audio_config
```

### 3. `src/hooks/useAudioSettings.ts`
```
Clés: selectedInput, selectedOutput, healthSummary
Usages: 11 (lignes 144, 145, 170, 347, 351, 364, 375, 590, 619, 631-633)
Migration: → state.harmonia.audio_devices
```

### 4. `src/services/tts/ttsEngineService.ts`
```
Clé: titane_tts_preferences
Usages: getItem(630), setItem(647)
Migration: → state.harmonia.tts_preferences
```

### 5. `src/hooks/useChat.ts`
```
Clés: titane_chat_provider_preferred, titane_chat_mode_default
Usages: getItem(72, 188), setItem(224)
Migration: → state.harmonia.chat_preferences
```

### 6. `src/config/offline-first.ts`
```
Clé: titane_ai_config
Usages: getItem(56, 114), setItem(92, 106)
Migration: → state.sentinel.ai_config
```

### 7. `src/utils/cloudAPIConfirmation.ts`
```
Clé: titane_permanent_cloud_approvals
Usages: getItem(36), setItem(53), removeItem(257)
Migration: → state.sentinel.cloud_approvals
```

### 8. `src/lib/notificationSystem.ts`
```
Clé: notification-config
Usages: getItem(52), setItem(73)
Migration: → state.harmonia.notification_config
```

### 9. `src/hooks/useSingularityStore.ts`
```
Clé: singularity-storage
Usages: getItem(65), setItem(113)
Note: ⚠️ Celui-ci est LÉGITIME - c'est le fallback quand Tauri unavailable
Migration: N/A - Garder comme fallback navigateur
```

### 10. `src/core/experience/XP_ENGINE.ts`
```
Clé: xp_state
Usages: setItem(84), getItem(95)
Note: Doublon avec xpEngine.ts
Migration: → Fusionner avec un seul système XP
```

---

## 🟢 CATÉGORIE FAIBLE — CACHE & LOGS

### 1. `src/lib/UILogger.ts`
```
Clé: titane_ui_logs
Usages: getItem(135), setItem(150), removeItem(373)
Migration: → Logs éphémères, acceptable en localStorage
```

### 2. `src/services/audio/audioHealthCheck.ts`
```
Clé: titane_device_health_logs
Usages: getItem(70), setItem(74)
Migration: → Cache temporaire acceptable
```

### 3. `src/hooks/useDevicePermissions.ts`
```
Clés: titane_device_permissions_cache, titane_device_issues
Usages: removeItem(455), getItem(491), setItem(494)
Migration: → Cache temporaire acceptable
```

### 4. `src/services/devices/deviceHealthService.ts`
```
Clés: __titane_repair_test__, test temporaires
Usages: 4 (lignes 229-230, 395-396)
Migration: → Tests health, acceptable
```

### 5. `src/services/experienceService.ts`
```
Clé: titane_experience
Usages: setItem(206), getItem(215), setItem(221)
Migration: → state.metrics.experience ou fusionner
```

### 6. `src/services/selftest/systemSelfTest.ts`
```
Clé: titane_selftest_last_run
Usages: setItem(264), getItem(276)
Migration: → Cache temporaire acceptable
```

### 7. `src/services/selftest/xpSelfTest.ts`
```
Clé: xp_state
Usages: getItem(67)
Migration: → Lecture pour test, dépend de xpEngine
```

### 8. `src/services/autoAuditEngine.ts`
```
Clé: audit_log
Usages: getItem(407), setItem(412)
Migration: → Cache temporaire acceptable
```

### 9. `src/omnisEngine/memoryEngine_OMNIS_v1_Clean.ts`
```
Clés: backup_*, memory backups
Usages: 3 (lignes 459, 538, 605)
Note: Système legacy OMNIS
Migration: → Considérer dépréciation si migré vers SingularityState
```

### 10. `src/core/autonomy/SingularityAutonomyEngine.ts`
```
Clés: Nettoyage de doublons localStorage
Usages: getItem(942, 972), removeItem(945, 975)
Note: ⚠️ LÉGITIME - Ce code NETTOIE les doublons
Migration: N/A - C'est le garbage collector
```

### 11. `src/core/safety/CrashGuardEngine.ts`
```
Clés: singularity-state, singularity-emergency-backup
Usages: getItem(236), setItem(238)
Note: ⚠️ LÉGITIME - Emergency backup
Migration: N/A - Garder pour crash recovery
```

---

## 📋 FICHIERS DE TEST (À IGNORER)

Ces fichiers sont des tests unitaires, les usages localStorage sont mockés :

- `src/lib/__tests__/UILogger.test.ts` (lignes 270, 308)
- `src/test/singularityStore.test.ts` (lignes 120, 131, 137)
- `src/components/__tests__/DiagnosticPanel.test.ts` (ligne 76)

---

## 🎯 PLAN DE MIGRATION RECOMMANDÉ

### Phase 1: Critique (Semaine 1-2)
1. ✅ Créer wrapper `MemoryBridge` pour intercepter localStorage
2. Migrer `chatMemory.ts` → `titan_state_update`
3. Migrer `chatMemoryCompactor.ts` → `titan_memory_compact`
4. Unifier XP engines (3 fichiers → 1)

### Phase 2: Préférences (Semaine 3-4)
1. Créer section `harmonia.preferences` dans SingularityState
2. Migrer audio settings
3. Migrer TTS preferences
4. Migrer chat preferences

### Phase 3: Cleanup (Semaine 5)
1. Marquer OMNIS engine comme deprecated
2. Ajouter lint rule `no-localStorage` avec exceptions
3. Documenter exceptions légitimes (fallback, emergency)

---

## ⚙️ OUTILS CRÉÉS POUR CETTE MIGRATION

| Outil | Fichier | Description |
|-------|---------|-------------|
| Memory Doctor | `memory_doctor.rs` | Diagnostic complet du système mémoire |
| QA Checklist | `MEMORY_QA_CHECKLIST.md` | Validation pré-release |
| Living Docs | `MEMORY_SYSTEM.md` | Documentation architecturale |

---

## 🏷️ MARQUEURS POUR RECHERCHE

Pour trouver tous les bypasses dans le code :
```bash
# Recherche globale
grep -rn "localStorage\." src/ --include="*.ts" | grep -v test | grep -v __tests__

# Avec clés spécifiques
grep -rn "titane_\|singularity-" src/ --include="*.ts" | grep localStorage
```

---

**Document généré par OPUS v∞.MPE-Ω — TITAN Memory Doctor**  
*Prochaine mise à jour: après chaque migration*
