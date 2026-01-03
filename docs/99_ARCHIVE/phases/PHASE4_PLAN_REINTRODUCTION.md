# PHASE 4 — Plan Réintroduction Progressive Protections

**Date**: 12 décembre 2025  
**Statut PHASE 3**: ✅ VALIDÉE (5 PASS / 0 FAIL / 2 WARN)

---

## 🎯 Objectif PHASE 4

Réintroduire **une par une** les protections supprimées en PHASE 2, en testant après chaque modification pour identifier quelle protection cause le blocage du bouton.

---

## 📋 Protections Supprimées (PHASE 2)

### 1️⃣ **Timeout ChatInput** (3s → 10s)

- **Fichier**: `src/components/chat/ChatInput.tsx` ligne 341
- **Modification actuelle**: `3000` ms (TEMP CLEANUP)
- **Valeur originale**: `10000` ms
- **Impact**: Protection anti-blocage messageSent.current

### 2️⃣ **messageSent.current dans button disabled**

- **Fichier**: `src/components/chat/ChatInput.tsx` lignes 727, 734
- **Modification actuelle**: `isInputDisabled` seulement
- **Valeur originale**: `isInputDisabled || messageSent.current`
- **Impact**: Protection anti-spam double-clic

### 3️⃣ **Providers orchestrator simplifiés**

- **Fichier**: `src/services/ai/orchestrator.ts`
- **Modification actuelle**: 2 providers (tauri-backend, titane-local)
- **Valeur originale**: 7 providers (tous les providers IA)
- **Impact**: Cascade multi-providers, fallback

### 4️⃣ **Backend cascade Ollama-only**

- **Fichier**: `src-tauri/src/overdrive/chat_orchestrator.rs`
- **Modification actuelle**: Ollama seulement, pas de fallback
- **Valeur originale**: Cascade Ollama → OpenAI → Anthropic → Gemini → Local
- **Impact**: Résilience multi-providers

---

## 🔄 Plan de Réintroduction

### Étape 1: Timeout 3s → 10s

**Objectif**: Vérifier si le timeout long cause blocage

```typescript
// ChatInput.tsx ligne 341
}, 10000); // Restaurer timeout original
```

**Test après**:

- ✓ Envoyer 3 messages
- ✓ Vérifier bouton se débloque après chaque réponse
- ✓ Si bloqué → timeout 10s est problématique
- ✓ Si OK → continuer étape 2

---

### Étape 2: Réactiver messageSent.current

**Objectif**: Vérifier si messageSent.current cause blocage

```typescript
// ChatInput.tsx lignes 727, 734
disabled={isInputDisabled || messageSent.current}
```

**Test après**:

- ✓ Envoyer 3 messages
- ✓ Vérifier bouton se débloque après chaque réponse
- ✓ Si bloqué → messageSent.current est problématique ⚠️ **SUSPECT PRINCIPAL**
- ✓ Si OK → continuer étape 3

---

### Étape 3: Réactiver providers complets

**Objectif**: Vérifier si cascade providers cause problème

```typescript
// orchestrator.ts
const providers = [
  { id: 'tauri-backend', name: 'TITANE∞ Backend', ... },
  { id: 'gemini', name: 'Google Gemini', ... },
  { id: 'ollama', name: 'Ollama Local', ... },
  { id: 'openai', name: 'OpenAI GPT', ... },
  { id: 'anthropic', name: 'Claude', ... },
  { id: 'titane-local', name: 'TITANE∞ Local', ... },
  { id: 'mock', name: 'Mock (Dev)', ... },
];
```

**Test après**:

- ✓ Envoyer messages avec chaque provider
- ✓ Vérifier cascade fallback fonctionne
- ✓ Si bloqué → identifier provider problématique
- ✓ Si OK → continuer étape 4

---

### Étape 4: Réactiver cascade backend

**Objectif**: Vérifier si cascade Rust cause problème

```rust
// chat_orchestrator.rs - Restaurer cascade complète
if heartbeat_check("ollama") { provider = "ollama"; }
else if heartbeat_check("openai") { provider = "openai"; }
else if heartbeat_check("anthropic") { provider = "anthropic"; }
// etc.
```

**Test après**:

- ✓ Tester cascade avec Ollama ON
- ✓ Tester cascade avec Ollama OFF (fallback)
- ✓ Vérifier logs backend
- ✓ Si bloqué → cascade backend problématique
- ✓ Si OK → continuer étape 5

---

### Étape 5: Réactiver kernels/auto-heal

**Objectif**: Vérifier si protections avancées causent problème

```typescript
// Réactiver tous les kernels OMEGA
// Réactiver auto-heal engine
// Réactiver protection layers
```

**Test après**:

- ✓ Validation complète système
- ✓ Tests de charge
- ✓ Si bloqué → identifier kernel problématique
- ✓ Si OK → **PHASE 4 COMPLÈTE** ✅

---

## 🎯 Critères de Succès PHASE 4

Pour chaque étape:

1. ✅ Bouton Envoyer se débloque après réponse
2. ✅ Pas de blocage permanent
3. ✅ Réponses toujours dynamiques
4. ✅ Performance acceptable
5. ✅ Logs backend propres

**Si UNE étape échoue**:
→ Revenir à l'étape précédente (dernière config fonctionnelle)  
→ Analyser pourquoi cette protection bloque  
→ Corriger le bug dans la protection  
→ Re-tester avant de continuer

---

## 📊 Hypothèse Principale

**Suspect #1**: `messageSent.current` (Étape 2)  
**Raison**: Protection anti-spam qui ne se reset pas correctement  
**Symptôme**: Bouton reste `disabled={true}` même après `messageSent.current = false`

**Solution probable**:

- Forcer re-render après `messageSent.current = false`
- Ou remplacer `useRef` par `useState` pour messageSent
- Ou ajouter debug logs pour voir état exact

---

## 🚀 Lancement PHASE 4

**Commandes**:

```bash
# Modifier fichier pour Étape 1
# pnpm run dev:tauri
# Tester
# Si OK → Étape 2
# Si FAIL → Analyser
```

**Rollback disponible**:

```bash
git checkout backup/chat-pre-cleanup
```

---

## 📝 Notes

- Chaque étape = 1 commit
- Documenter résultats de chaque étape
- Garder logs de tests
- Si problème détecté → créer issue séparée pour fix

**Ready to start PHASE 4** 🚀
