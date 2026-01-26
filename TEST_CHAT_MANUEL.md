# 🧪 Guide de Test Manuel - Chat IA Fallback Fix v26.3.1

## ✅ Application Démarrée

L'application TITANE∞ est actuellement en cours d'exécution en mode dev.

## 📋 Scénarios de Test

### Scénario 1: Test du Message de Fallback (Aucun Provider Disponible)

**Conditions:** Ollama non installé, aucune clé API configurée

**Actions:**
1. Ouvre l'application TITANE∞
2. Va dans l'onglet "Chat IA"
3. Envoie un message: "Bonjour"

**Résultats Attendus (APRÈS FIX):**
- ✅ Typing indicator apparaît pendant < 3 secondes
- ✅ Un message de fallback s'affiche:
  ```
  🤖 TITANE∞ — Configuration IA Requise
  
  Aucun provider IA n'est actuellement disponible...
  
  Solutions recommandées:
  1. Installer Ollama (local, gratuit, privé)
  2. Ou configurer une clé API cloud
  ```
- ✅ Suggestions affichées en dessous
- ✅ La bulle n'est JAMAIS vide

**Résultats à Éviter (AVANT FIX):**
- ❌ Bulle de message vide qui reste indéfiniment
- ❌ Typing indicator qui tourne sans fin
- ❌ Aucun message d'erreur visible

---

### Scénario 2: Test du Timeout Provider

**Conditions:** Ollama installé mais non démarré

**Actions:**
1. Va dans Settings → AI Providers
2. Sélectionne "Ollama (Local)"
3. Retourne au Chat IA
4. Envoie un message: "Test"

**Résultats Attendus:**
- ✅ Typing indicator < 3s
- ✅ Après 3s, message d'erreur visible
- ✅ Suggestion de vérifier qu'Ollama est démarré
- ✅ Pas de bulle vide

---

### Scénario 3: Test avec Provider Fonctionnel

**Conditions:** Ollama démarré avec un modèle

**Actions:**
1. Démarre Ollama: `ollama serve`
2. Dans le chat, envoie: "Explique-moi ce qu'est TITANE"

**Résultats Attendus:**
- ✅ Typing indicator apparaît brièvement
- ✅ Réponse générée et affichée en markdown
- ✅ Aucune bulle vide
- ✅ Provider affiché: "Ollama" ou "Local"

---

## 🔍 Vérification dans les Logs

**Terminal Tauri:**
```bash
# Surveiller les logs en temps réel
tail -f runtime/dev/logs/*.log | grep -E "(AI Router|useChat|fallback)"
```

**Logs à Observer:**
- `[AI Router v15] Trying UnifiedIA...`
- `[AI Router v15] ✗ UnifiedIA failed`
- `[AI Router v20.1] Trying Gemini API...`
- `[AI Router v15] ✗ Gemini failed`
- `[AI Router v20.1] Routing to Ollama...`
- `[AI Router v15] ✗ Ollama failed`
- `[AI Router v15] ✗ No provider available`
- `[useChat] ⚠️ Backend returned empty content - triggering fallback`
- `[useChat] ✅ Fallback response created for no provider scenario`

---

## ✅ Checklist de Validation

- [ ] Typing indicator s'affiche correctement
- [ ] Typing indicator disparaît après < 3s
- [ ] Message de fallback s'affiche si aucun provider
- [ ] Message d'erreur s'affiche après 3s si timeout
- [ ] Aucune bulle vide permanente observée
- [ ] Suggestions affichées correctement
- [ ] Le style est cohérent (glass morphism)
- [ ] Les logs montrent la cascade de fallback

---

## 🐛 Si un Problème Persiste

1. **Vérifier que les corrections sont appliquées:**
   ```bash
   ./scripts/validate-chat-fallback-fix.sh
   ```

2. **Vérifier les commits:**
   ```bash
   git log --oneline | grep -E "(b8e6abca|7fef2e91)"
   ```

3. **Relancer les tests unitaires:**
   ```bash
   pnpm test src/__tests__/chat-fallback-display.test.ts
   pnpm test src/hooks/__tests__/useChat.test.ts
   ```

4. **Consulter la documentation:**
   ```bash
   cat docs/fixes/CHAT_FALLBACK_FIX_v26.3.1.md
   ```

---

## 📸 Captures d'Écran Attendues

### Avant Fix (❌ Bug)
```
┌─────────────────────────────────────┐
│ 👤 Vous                             │
│ Bonjour                              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🤖 TITANE∞                          │
│                                      │ ← Bulle VIDE permanente
│ ●●● (typing forever)                │
└─────────────────────────────────────┘
```

### Après Fix (✅ Corrigé)
```
┌─────────────────────────────────────┐
│ 👤 Vous                             │
│ Bonjour                              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🤖 TITANE∞                          │
│ 🤖 **TITANE∞ — Configuration IA**  │
│                                      │
│ Le système IA est en cours de...    │
│                                      │
│ **Pour activer le chat IA** :       │
│ - Installer Ollama (local)           │
│ - Ou configurer une clé API          │
└─────────────────────────────────────┘
```

---

**Date:** 2026-01-26  
**Version:** v26.3.1  
**Commits:** b8e6abca, 7fef2e91, a8856b0e, 83d6394d
