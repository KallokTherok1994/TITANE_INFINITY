# 🚀 TESTS PHASE 6 - QUICKSTART

**Serveur:** ✅ http://localhost:5174 (ACTIF)
**Date:** 24 novembre 2025

---

## 📋 CHECKLIST RAPIDE

### ✅ Test 1: Chat IA Fallback (5 min)

**Actions:**
1. Ouvrir http://localhost:5174 dans navigateur
2. Appuyer F12 → Onglet Console
3. Naviguer vers Chat IA
4. Envoyer message: **"test"**

**Résultat attendu:**
- ✅ Logs cascade affichés (🔍 [1/3] [2/3] [3/3])
- ✅ Réponse TITANE∞ affichée (~3s)
- ✅ Provider = "fallback"
- ✅ Message: "Je suis TITANE∞, mais mes services IA..."

**Validation:**
- [ ] Message reçu
- [ ] Logs complets
- [ ] Aucune erreur rouge

---

### ✅ Test 2: TTS Web Speech API (5 min)

**Actions:**
1. Dans Chat IA, cliquer 🎤 Toggle Voice Mode
2. Envoyer message: **"bonjour TITANE"**
3. Attendre réponse
4. Écouter synthèse vocale

**Résultat attendu:**
- ✅ Logs TTS: "🔊 Voice mode enabled..."
- ✅ Logs: "⚠️ Tauri backend unavailable, using Web Speech API"
- ✅ Logs: "✅ TTS (Web Speech API): Success"
- ✅ Voix synthétique lit la réponse

**Validation:**
- [ ] Toggle actif visuellement
- [ ] Voix audible
- [ ] Logs TTS complets
- [ ] Chat continue normalement

---

### ✅ Test 3: Logs Console (2 min)

**Actions:**
1. Console ouverte (F12)
2. Observer logs du Test 1

**Structure attendue:**
```
═════ USE CHAT: Sending new message
╔══╗ CHAT ENGINE: Starting generation
━━━ ORCHESTRATOR: Début cascade
🔍 [1/3] Testing gemini... ❌
🔍 [2/3] Testing ollama... ❌
🔍 [3/3] Testing fallback... ✅
🎉 ORCHESTRATOR: Response generated
```

**Validation:**
- [ ] 3 niveaux (═══, ╔══╗, ━━━)
- [ ] Émojis clairs
- [ ] Numérotation [1/3]
- [ ] Timing ms

---

### ✅ Test 4: Styles (2 min)

**Actions:**
1. Observer UI Chat IA
2. Vérifier lisibilité

**Validation:**
- [ ] Texte utilisateur lisible
- [ ] Texte TITANE∞ lisible
- [ ] Fond glassmorphism visible
- [ ] Boutons accessibles
- [ ] Toggle 🎤 visible

---

## 🎯 RÉSUMÉ VALIDATION

**Total temps:** ~15 minutes

| Test | Status | Notes |
|------|--------|-------|
| Chat Fallback | [ ] | |
| TTS WebSpeech | [ ] | |
| Logs Console | [ ] | |
| Styles | [ ] | |

---

## 🔧 SI PROBLÈME

**Chat ne répond pas:**
```bash
# Vérifier console logs pour erreurs
# Vérifier src/services/ai/orchestrator.ts ligne 15+
```

**TTS ne fonctionne pas:**
```javascript
// Dans console navigateur :
console.log('speechSynthesis' in window);
// Attendu: true
```

**Logs manquants:**
```bash
# Vérifier imports
grep -r "console.log" src/services/ai/orchestrator.ts
```

---

## ✅ PHASE 6 COMPLÈTE SI

- [x] Serveur Vite actif
- [ ] Test 1 validé
- [ ] Test 2 validé
- [ ] Test 3 validé
- [ ] Test 4 validé

**Prochaine étape:** Configuration Gemini API (optionnel)

---

🎉 **Commencer maintenant:** http://localhost:5174
