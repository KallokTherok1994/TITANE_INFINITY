# ✅ TESTS MANUELS — Checklist Utilisateur

**Date**: 10 Décembre 2025  
**Version**: TITANE∞ v19.5.2  
**Objectif**: Validation UX end-to-end

---

## 🎯 PRÉ-REQUIS

- [ ] Dev server lancé (`npm run dev:tauri`)
- [ ] Vite ready sur port 5173
- [ ] Tauri app compilée et ouverte
- [ ] Ollama service running (`ollama serve`)

---

## 📋 TESTS FONCTIONNELS

### 1️⃣ Chat IA — Conversation Simple (5 min)

**Objectif**: Valider flux de base conversation

**Actions**:

1. [ ] Ouvrir Chat IA (menu latéral)
2. [ ] Vérifier affichage modes (8 modes + Custom)
3. [ ] Sélectionner mode "Conversation" (par défaut)
4. [ ] Sélectionner provider "Ollama" (local)
5. [ ] Taper message: "Bonjour, peux-tu te présenter ?"
6. [ ] Envoyer message (Enter ou bouton)
7. [ ] Vérifier:
   - [ ] Loading spinner affiché
   - [ ] Réponse IA reçue (dans les 5-10s)
   - [ ] Message affiché dans historique
   - [ ] Aucune erreur console

**Critères de succès**:

- ✅ Réponse cohérente et pertinente
- ✅ Latence <10s (Ollama local)
- ✅ UI responsive (pas de freeze)

---

### 2️⃣ Modes de Conversation (5 min)

**Objectif**: Valider système de modes

**Actions**:

1. [ ] Tester mode "Code Expert":
   - Message: "Explique-moi les closures en Rust"
   - Vérifier: Réponse technique détaillée
2. [ ] Tester mode "Créatif":
   - Message: "Écris un haiku sur l'intelligence artificielle"
   - Vérifier: Réponse créative et poétique
3. [ ] Tester mode "Custom":
   - Cliquer "Gérer modes" (bouton settings)
   - Créer mode custom: "Philosophe"
   - System prompt: "Tu es un philosophe existentialiste"
   - Sauvegarder
   - Tester: "Qu'est-ce que la liberté ?"
   - Vérifier: Réponse philosophique

**Critères de succès**:

- ✅ Chaque mode change comportement IA
- ✅ Custom mode fonctionnel
- ✅ Sauvegarde modes persistante

---

### 3️⃣ Memory Persistence (10 min)

**Objectif**: Valider sauvegarde/chargement conversations

**Actions**:

1. [ ] Créer nouvelle conversation:
   - Message 1: "Je m'appelle Alice"
   - Message 2: "J'aime la pizza"
   - Message 3: "Quel est mon nom et ma nourriture préférée ?"
   - Vérifier: IA se souvient (context preserved)

2. [ ] Vérifier fichier .enc créé:

   ```bash
   ls -lh ~/.local/share/com.titane.infinity/conversations/
   # Devrait montrer fichier <conversation_id>.enc
   ```

3. [ ] Reload application:
   - Fermer Tauri app (Cmd/Ctrl+Q)
   - Relancer: `npm run dev:tauri`
   - Ouvrir Chat IA
   - Vérifier: Conversation précédente listée
   - Ouvrir conversation
   - Vérifier: Historique complet (3 messages)

4. [ ] Tester continuité context:
   - Message 4: "Rappelle-moi mon nom"
   - Vérifier: IA répond "Alice"

**Critères de succès**:

- ✅ Fichier .enc créé et chiffré
- ✅ Conversation rechargée après reload
- ✅ Context préservé (IA se souvient)
- ✅ Aucune perte de données

---

### 4️⃣ Multi-Conversations (5 min)

**Objectif**: Valider gestion multiple conversations

**Actions**:

1. [ ] Créer conversation #1:
   - Titre: "Rust Development"
   - Message: "Explique-moi les lifetimes"

2. [ ] Créer conversation #2:
   - Titre: "Recettes Cuisine"
   - Message: "Recette de carbonara"

3. [ ] Créer conversation #3:
   - Titre: "Philosophie"
   - Message: "Qu'est-ce que le temps ?"

4. [ ] Switcher entre conversations:
   - Ouvrir conv #1 → Vérifier: Messages Rust
   - Ouvrir conv #2 → Vérifier: Messages cuisine
   - Ouvrir conv #3 → Vérifier: Messages philo

5. [ ] Vérifier isolation context:
   - Dans conv #1, demander: "Quelle recette on parlait ?"
   - Vérifier: IA ne connaît pas (context isolé)

**Critères de succès**:

- ✅ 3+ conversations simultanées
- ✅ Switch rapide (<1s)
- ✅ Context isolé (pas de leakage)
- ✅ Aucune confusion IA

---

### 5️⃣ Multi-Provider Cascade (10 min)

**Objectif**: Valider fallback providers

**Actions**:

1. [ ] Mode Auto (sans API keys cloud):
   - Sélectionner provider "Auto"
   - Envoyer message
   - Vérifier: Fallback vers Ollama
   - Vérifier console: Log fallback

2. [ ] Si API keys configurées:
   - Configurer Gemini API key (Governance Center)
   - Sélectionner "Auto"
   - Envoyer message
   - Vérifier: Utilise Gemini (priorité 3)
   - Comparer latence vs Ollama

3. [ ] Test manuel providers:
   - Test Ollama llama3.2:1b (rapide, petits tokens)
   - Test Ollama mistral:7b (plus lent, meilleure qualité)
   - Comparer réponses

**Critères de succès**:

- ✅ Cascade fallback functional
- ✅ Auto mode sélectionne meilleur provider
- ✅ Latence tracking affiché (UI)
- ✅ Aucune erreur API

---

### 6️⃣ UI/UX Polish (5 min)

**Objectif**: Valider expérience utilisateur

**Actions**:

1. [ ] Test responsive design:
   - Redimensionner fenêtre (petit → grand)
   - Vérifier: Layout adaptatif

2. [ ] Test dark mode:
   - Vérifier: Couleurs cohérentes
   - Vérifier: Lisibilité texte

3. [ ] Test interactions:
   - Hover boutons → Feedback visuel
   - Click boutons → Animation smooth
   - Scroll messages → Smooth scrolling

4. [ ] Test keyboard shortcuts:
   - Enter: Envoyer message
   - Shift+Enter: Nouvelle ligne
   - Cmd/Ctrl+K: Focus search (si implémenté)

**Critères de succès**:

- ✅ UI fluide (60 FPS)
- ✅ Aucun glitch visuel
- ✅ Accessibility respectée
- ✅ Keyboard navigation functional

---

### 7️⃣ Error Handling (5 min)

**Objectif**: Valider gestion erreurs

**Actions**:

1. [ ] Test Ollama offline:
   - Arrêter Ollama: `killall ollama`
   - Envoyer message
   - Vérifier: Error message clair
   - Vérifier: Suggestion redémarrer Ollama

2. [ ] Test API key invalide (si configurée):
   - Entrer fake API key
   - Sélectionner provider
   - Envoyer message
   - Vérifier: Error 401/403 handled
   - Vérifier: Message utilisateur clair

3. [ ] Test network timeout (simulation):
   - Bloquer network (airplane mode)
   - Envoyer message
   - Vérifier: Timeout après 30s
   - Vérifier: Retry option proposée

**Critères de succès**:

- ✅ Erreurs captées (pas de crash)
- ✅ Messages utilisateur clairs
- ✅ Suggestions actions (retry, check config)
- ✅ Fallback graceful

---

## 📊 MÉTRIQUES À COLLECTER

### Performance

- [ ] **Startup time** (cold):
  - Stopwatch: Lancer app → UI ready
  - Cible: <5s

- [ ] **Startup time** (warm):
  - Relancer app (cache warm)
  - Cible: <2s

- [ ] **Message latency** (Ollama):
  - Time to first token (TTFT)
  - Ollama llama3.2:1b: **\_** tokens/s
  - Ollama mistral:7b: **\_** tokens/s

- [ ] **Memory usage**:
  - Idle (app open, aucune conversation): **\_** MB
  - Active (conversation en cours): **\_** MB
  - Peak (10+ messages): **\_** MB

- [ ] **CPU usage**:
  - Idle: **\_**%
  - Active (génération réponse): **\_**%

### Stabilité

- [ ] Crashes observés: **\_** (cible: 0)
- [ ] Erreurs console: **\_** (cible: 0 critical)
- [ ] Warnings console: **\_** (acceptable si non-bloquants)

---

## ✅ VALIDATION FINALE

**Après avoir complété tous tests**:

- [ ] Aucun bug bloquant identifié
- [ ] UX fluide et intuitive
- [ ] Performance acceptable (latence <10s Ollama)
- [ ] Memory persistence fonctionnelle
- [ ] Multi-provider cascade OK

**Si tous critères validés**:

✅ **TITANE∞ v19.5.2 PRODUCTION READY** 🚀

---

## 📝 NOTES & OBSERVATIONS

**Bugs identifiés**:

1. ***
2. ***
3. ***

**Améliorations suggérées**:

1. ***
2. ***
3. ***

**Questions utilisateur**:

1. ***
2. ***
3. ***

---

**Testeur**: **********\_**********  
**Date début**: **********\_**********  
**Date fin**: **********\_**********  
**Durée totale**: **\_** minutes

**Score UX Global**: **\_** / 10

**Recommandation**:

- [ ] ✅ SHIP IT — Production ready
- [ ] ⚠️ MINOR FIXES — Corriger bugs mineurs
- [ ] ❌ BLOCK — Bugs critiques bloquants
