# TITANE∞ v19.3Ω — Legacy Code Audit

## Date: 2025-01-24
## Auteur: TITANE∞ Audit System

---

## 📋 Résumé

Ce document identifie les fichiers et répertoires legacy/deprecated dans le codebase TITANE∞.
Ces éléments peuvent être candidats à la suppression ou à l'archivage.

---

## 🔴 Répertoires Legacy Identifiés

### 1. `src/hooks/archived/` (4 fichiers)
**Status:** ISOLÉ - Non importé dans le code actif

| Fichier | Description | Remplacé par |
|---------|-------------|--------------|
| `useChatOmnisSimple.ts` | Ancien hook chat simplifié | `useChat.ts` |
| `useChatOmnisSimple_v2.ts` | Version 2 du hook simplifié | `useChat.ts` |
| `useChat_OMNIS_Clean.ts` | Version nettoyée OMNIS | `useChat.ts` |
| `useChat_OMNIS_v1.ts` | Version 1 OMNIS | `useChat.ts` |

**Recommandation:** ✅ Peut être supprimé en toute sécurité

---

### 2. `src/omnisEngine/` (11 fichiers)
**Status:** ISOLÉ - Non importé depuis l'extérieur du dossier

| Fichier | Description |
|---------|-------------|
| `autoHealGlobal_OMNIS_v1.ts` | Ancien système auto-heal |
| `chatMemoryIntegration_OMNIS_v1.ts` | Intégration mémoire legacy |
| `deploymentOrchestrator_OMNIS_v1.ts` | Orchestrateur déploiement v1 |
| `integrationMaster_OMNIS_v1.ts` | Master d'intégration v1 |
| `memoryEngine_OMNIS_v1_Clean.ts` | Moteur mémoire v1 |
| `phase6_omnis_tests.tsx` | Tests phase 6 |
| `phase8Integration_OMNIS_v1.ts` | Intégration phase 8 |
| `phase9Runner_OMNIS_v1.ts` | Runner phase 9 |
| `testsIntelligence_OMNIS_v1.ts` | Tests intelligence v1 |
| `testsRunner_OMNIS_v1.ts` | Runner tests v1 |
| `validationFinale_OMNIS_v1.ts` | Validation finale v1 |

**Recommandation:** ✅ Peut être archivé ou supprimé

---

### 3. Fichiers OMNIS_v1 dans `src/services/ai/` (17 fichiers total)

**Status:** Partiellement utilisé (uniquement dans tests)

| Fichier | Importé par |
|---------|-------------|
| `chatEngine_OMNIS_v1.ts` | Tests uniquement |
| `orchestrator_OMNIS_v1.ts` | Tests uniquement |
| `providers/omnis/hardenedProviders_OMNIS_v1.ts` | Autre fichier v1 |
| `providers/omnis/hardenedProviders_OMNIS_v1_Clean.ts` | Autre fichier v1 |
| `providers/omnis/providerWrapper_OMNIS_v1.ts` | Autre fichier v1 |

**Recommandation:** ⚠️ Supprimer après migration des tests

---

### 4. Fichier Deprecated

| Fichier | Description |
|---------|-------------|
| `src/hooks/useAI.ts.deprecated` | Ancien hook AI |
| `src/hooks/useVoice.ts` | Marqué deprecated, remplacé par `useVoiceEngine.ts` |

**Recommandation:** ✅ Peut être supprimé

---

## 📊 Impact du Cleanup

### Avant cleanup
- Fichiers TypeScript total: ~822
- Fichiers legacy identifiés: ~33

### Estimation après cleanup
- Réduction: ~4% du codebase frontend
- Économie: Moins de confusion, builds plus rapides

---

## 🔧 Plan de Migration

### Phase 1: Tests (Priorité haute)
1. Migrer `src/tests/chat-backend-direct.test.ts` pour utiliser le nouveau `chatEngine`
2. Migrer `src/tests/chat-ia-diagnostic.test.ts` pour utiliser le nouveau `chatEngine`
3. Migrer `src/tests/phase3_omnis_tests.ts` pour utiliser le nouveau `orchestrator`

### Phase 2: Suppression fichiers isolés
1. Supprimer `src/hooks/archived/` (4 fichiers)
2. Supprimer `src/omnisEngine/` (11 fichiers)
3. Supprimer `src/hooks/useAI.ts.deprecated`

### Phase 3: Cleanup OMNIS_v1
1. Supprimer `src/services/ai/*_OMNIS_v1.ts` après migration tests
2. Supprimer `src/services/ai/providers/omnis/*_OMNIS_v1*.ts`

---

## ⚠️ Précautions

1. **Backup avant suppression** - Créer une branche archive
2. **Validation tests** - S'assurer que tous les tests passent après migration
3. **Git history** - Les fichiers restent dans l'historique git

---

## ✅ Actions recommandées immédiatement

```bash
# Créer branche archive
git checkout -b archive/legacy-omnis-v1

# Déplacer dans archive (au lieu de supprimer)
mkdir -p archive/omnis_v1
mv src/omnisEngine/* archive/omnis_v1/
mv src/hooks/archived/* archive/omnis_v1/
mv src/hooks/useAI.ts.deprecated archive/omnis_v1/
```

---

*Document généré par TITANE∞ Audit System v19.3Ω*
