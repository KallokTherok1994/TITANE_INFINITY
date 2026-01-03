# 🧪 GUIDE DE TEST END-TO-END v17.3.0

**Date:** 24 novembre 2025
**Status:** ⏳ **PHASE 6 EN COURS**
**Serveur:** ✅ http://localhost:5173 (ACTIF)

---

## 🎯 OBJECTIF PHASE 6

Valider l'ensemble du système TITANE∞ :
- ✅ Chat IA répond via cascade providers
- ✅ TTS lit les réponses (Web Speech API)
- ✅ Logs verbeux fonctionnent
- ✅ Styles lisibles (Design System v20)
- ✅ Gestion d'erreurs robuste

---

## 📋 CHECKLIST TESTS

### ✅ Test 1: Chat IA Fallback Mode

**Objectif:** Vérifier que le Chat répond via Fallback provider

**Étapes:**
```
1. ✅ Serveur démarré : http://localhost:5173
2. Ouvrir dans navigateur (Chrome/Firefox recommandé)
3. Ouvrir DevTools Console (F12)
4. Naviguer vers Chat IA
5. Envoyer message : "test"
```

**Logs attendus dans Console:**
```
═════════════════════════════════════════════════════════════
💬 USE CHAT: Sending new message
📝 Content: "test"
🎯 Mode: default
═════════════════════════════════════════════════════════════

╔══════════════════════════════════════════════════════════════╗
║  CHAT ENGINE: Starting generation                            ║
╚══════════════════════════════════════════════════════════════╝
🎯 Mode: default
📝 Message: "test"
🔒 Step 1: Validating input...
   ✅ Validated (4 chars)
🧠 Step 2: Loading Memory Core context...
   ✅ Context loaded
🎨 Step 3: Building prompt for mode "default"...
   ✅ Enriched history built
🚀 Step 4: Calling orchestrator...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 ORCHESTRATOR: Début cascade AI providers
📝 Message: "test"
📚 Historique: X messages
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 [1/3] Testing gemini...
   ⏳ Checking availability...
   ❌ Available: false
   ⏭️  Skipping to next provider...

🔍 [2/3] Testing ollama...
   ⏳ Checking availability...
   ❌ Available: false
   ⏭️  Skipping to next provider...

🔍 [3/3] Testing fallback...
   ⏳ Checking availability...
   ✅ Available: true
   🌟 Generating response...
   ✅ Success in 2ms
   📦 Response length: 156 chars
   🏷️  Provider: fallback, Model: fallback-v1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 ORCHESTRATOR: Response generated successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   ✅ Orchestrator response received
⚙️  Step 5: Post-processing...
   ✅ Response processed
💾 Step 6: Saving to Memory Core...
   ✅ Interaction saved

╔══════════════════════════════════════════════════════════════╗
║  CHAT ENGINE: Generation complete!                           ║
╚══════════════════════════════════════════════════════════════╝

✅ Response received from chatEngine
📦 Content length: 156 chars
🏷️  Provider: fallback
✅ AI response added to history
═════════════════════════════════════════════════════════════
🎉 USE CHAT: Message processed successfully!
═════════════════════════════════════════════════════════════
🔓 isLoading set to false
```

**Message affiché dans UI:**
```
TITANE∞: Je suis TITANE∞, mais mes services IA principaux
sont temporairement indisponibles. Vérifie ta configuration
Gemini API ou Ollama.
```

**✅ Validation:**
- [ ] Message utilisateur apparaît dans chat
- [ ] Réponse TITANE∞ apparaît sous 3 secondes
- [ ] Provider affiché : "fallback"
- [ ] isLoading repasse à false
- [ ] Logs complets dans console
- [ ] Aucune erreur rouge dans console

**❌ Si échec:**
- Vérifier imports dans ChatWindow.tsx
- Vérifier chatEngine exporté correctement
- Vérifier orchestrator.ts sans erreurs TypeScript
- Relancer build : `pnpm run build`

---

### ✅ Test 2: TTS Web Speech API

**Objectif:** Vérifier synthèse vocale sur réponses IA

**Prérequis:**
- Navigateur avec Web Speech API (Chrome, Edge, Firefox)
- Haut-parleurs/casque audio fonctionnels
- Permissions audio accordées

**Étapes:**
```
1. Dans Chat IA, localiser bouton 🎤 (Toggle Voice Mode)
2. Cliquer pour activer mode voix
3. Observer changement visuel (bouton actif)
4. Envoyer message : "bonjour TITANE"
5. Attendre réponse écrite
6. Écouter synthèse vocale
```

**Logs attendus:**
```
═════════════════════════════════════════════════════════════
💬 USE CHAT: Sending new message
📝 Content: "bonjour TITANE"
🎯 Mode: default
═════════════════════════════════════════════════════════════

[... cascade AI normale ...]

✅ Response received from chatEngine
📦 Content length: 180 chars
🏷️  Provider: fallback
✅ AI response added to history

🔊 TTS: Voice mode enabled, synthesizing response...

🔊 TTS: Starting synthesis...
📝 Text: "Je suis TITANE∞, mais mes services IA principau..."
⚠️ TTS: Tauri backend unavailable, using Web Speech API fallback
🌐 TTS (Web Speech API): Synthesizing...
✅ TTS (Web Speech API): Success
✅ TTS: Synthesis complete

═════════════════════════════════════════════════════════════
🎉 USE CHAT: Message processed successfully!
═════════════════════════════════════════════════════════════
```

**✅ Validation:**
- [ ] Bouton 🎤 change d'état visuellement
- [ ] Réponse s'affiche normalement
- [ ] Voix synthétique lit la réponse
- [ ] Logs TTS dans console
- [ ] Provider = "webspeech"
- [ ] Aucune interruption du chat
- [ ] Possibilité d'envoyer nouveau message pendant TTS

**🔧 Test Supplémentaires:**

**Test 2.1: Désactivation mode voix**
```
1. Désactiver 🎤 Toggle Voice Mode
2. Envoyer message "test désactivation"
3. Vérifier : réponse affichée mais PAS de voix
4. Logs : Pas de ligne "🔊 TTS: Voice mode enabled..."
```

**Test 2.2: Multiples messages rapides**
```
1. Activer mode voix
2. Envoyer "message 1"
3. Attendre début synthèse
4. Envoyer "message 2" immédiatement
5. Observer : 2e message n'interrompt pas 1ère synthèse
6. Après fin 1ère synthèse → 2e synthèse démarre
```

**Test 2.3: Messages longs**
```
1. Activer mode voix
2. Envoyer message qui génère réponse longue
3. Observer durée synthèse (peut prendre 10-30s)
4. Vérifier : UI reste responsive pendant synthèse
```

---

### ✅ Test 3: Logs Console Complets

**Objectif:** Valider système de logging verbeux

**Étapes:**
```
1. Ouvrir DevTools Console (F12)
2. Vider console (Clear console)
3. Envoyer message "test logs"
4. Observer logs s'afficher en temps réel
```

**Structure logs attendue:**
```
Niveau 1: USE CHAT (═════)
   ├─ Sending new message
   ├─ Content preview
   └─ Mode actuel

Niveau 2: CHAT ENGINE (╔══╗)
   ├─ Step 1: Validation
   ├─ Step 2: Memory Core
   ├─ Step 3: Prompt building
   ├─ Step 4: Orchestrator call
   ├─ Step 5: Post-processing
   └─ Step 6: Save interaction

Niveau 3: ORCHESTRATOR (━━━)
   ├─ Début cascade
   ├─ [1/3] Testing gemini
   ├─ [2/3] Testing ollama
   ├─ [3/3] Testing fallback
   └─ Response generated

Retour Niveau 2: CHAT ENGINE
   └─ Generation complete

Retour Niveau 1: USE CHAT
   └─ Message processed successfully
```

**✅ Validation:**
- [ ] 3 niveaux distincts (USE CHAT, CHAT ENGINE, ORCHESTRATOR)
- [ ] Bordures visuelles (═══, ╔══╗, ━━━)
- [ ] Émojis clairs (💬, 🎯, 📝, ✅, ❌, 🔍, etc.)
- [ ] Timing précis (ms pour orchestrator)
- [ ] Status disponibilité explicites (Available: true/false)
- [ ] Aucun log "undefined" ou "null"
- [ ] Pas de stack traces non gérées

**🔧 Test Logs Erreurs:**
```
1. Simuler erreur : modifier temporairement orchestrator.ts
   // Dans generate(), ajouter :
   throw new Error("TEST ERROR");

2. Envoyer message
3. Observer logs erreur :
   ❌ USE CHAT: Error occurred
   Error: TEST ERROR

4. Vérifier : message d'erreur affiché dans chat UI
5. Restaurer code original
```

---

### ✅ Test 4: Styles & Lisibilité

**Objectif:** Valider Design System v20 appliqué

**Zones à tester:**

**4.1 Chat IA**
```
1. Ouvrir Chat IA
2. Envoyer plusieurs messages (3-5)
3. Vérifier :
   - [ ] Texte utilisateur lisible (couleur contrastée)
   - [ ] Texte TITANE∞ lisible (couleur différente utilisateur)
   - [ ] Fond messages distinct de fond page
   - [ ] Bordures messages visibles
   - [ ] Timestamps lisibles
   - [ ] Bouton envoi visible et accessible
```

**4.2 Mode Voix Toggle**
```
1. Localiser bouton 🎤
2. État inactif :
   - [ ] Gris/neutre
   - [ ] Visible
   - [ ] Tooltip "Activer mode voix"

3. Cliquer pour activer
4. État actif :
   - [ ] Couleur accent (bleu/cyan)
   - [ ] Glow effect visible
   - [ ] Tooltip "Désactiver mode voix"
```

**4.3 Messages d'erreur**
```
1. Générer erreur (couper réseau)
2. Envoyer message
3. Vérifier message erreur :
   - [ ] Couleur rouge/orange distinct
   - [ ] Icône ❌ visible
   - [ ] Texte lisible sur fond
   - [ ] Bordure différente messages normaux
```

**4.4 Loading States**
```
1. Envoyer message
2. Observer état "Je traite votre demande..."
3. Vérifier :
   - [ ] Indicateur loading visible (spinner/dots)
   - [ ] Texte placeholder lisible
   - [ ] Animation fluide
   - [ ] Durée raisonnable (< 3s pour Fallback)
```

**4.5 Glassmorphism Effects**
```
1. Ouvrir plusieurs composants
2. Vérifier effet verre :
   - [ ] Backdrop blur visible
   - [ ] Transparence subtile
   - [ ] Bordures lumineuses
   - [ ] Ombres portées
```

**✅ Validation globale:**
- [ ] Aucun texte illisible (contraste insuffisant)
- [ ] Palette cohérente (Design System v20)
- [ ] Animations fluides (60fps)
- [ ] Responsive design (resize fenêtre OK)

---

### ✅ Test 5: Gestion d'Erreurs

**Objectif:** Valider robustesse système

**5.1 Provider Cascade Fallback**
```
Status initial :
- Gemini : ❌ (clé manquante)
- Ollama : ❌ (service down)
- Fallback : ✅ (toujours OK)

Test : Envoyer "test cascade"
✅ Résultat : Fallback répond sans erreur
```

**5.2 Network Offline**
```
1. Activer mode offline (DevTools → Network → Offline)
2. Envoyer message
3. Observer :
   - [ ] Gemini skip (fetch fail)
   - [ ] Ollama skip (localhost fail)
   - [ ] Fallback répond (hardcodé, pas de réseau)
4. Message : "... services IA indisponibles"
```

**5.3 TTS Fail Gracefully**
```
1. Activer mode voix
2. Bloquer Web Speech API (incognito + permissions refusées)
3. Envoyer message
4. Observer :
   - [ ] Chat continue normalement
   - [ ] Message affiché
   - [ ] Logs : "⚠️ TTS: Synthesis failed (non-blocking)"
   - [ ] Aucune erreur bloquante
```

**5.4 Messages vides/invalides**
```
1. Envoyer message vide (juste espaces)
2. Vérifier : rien ne se passe (validation bloque)
3. Envoyer message très long (10000+ chars)
4. Vérifier : tronqué à 10000 (orchestrator.ts sanitizeMessage)
```

**✅ Validation:**
- [ ] Système ne crashe jamais
- [ ] Erreurs affichées clairement
- [ ] Logs explicites
- [ ] Fallback toujours disponible
- [ ] TTS non-blocking garanti

---

## 📊 RÉSULTATS ATTENDUS

### ✅ Chat IA

| Critère | Attendu | Validation |
|---------|---------|------------|
| **Réponse Fallback** | < 3s | [ ] |
| **Cascade logs** | 3 niveaux visibles | [ ] |
| **Message affiché** | Texte lisible | [ ] |
| **isLoading** | Retour à false | [ ] |
| **Provider** | "fallback" | [ ] |

### ✅ TTS Web Speech API

| Critère | Attendu | Validation |
|---------|---------|------------|
| **Détection provider** | "webspeech" | [ ] |
| **Synthèse vocale** | Voix audible | [ ] |
| **Logs TTS** | Complets | [ ] |
| **Non-blocking** | Chat continue | [ ] |
| **Toggle ON/OFF** | Fonctionne | [ ] |

### ✅ Logs Console

| Critère | Attendu | Validation |
|---------|---------|------------|
| **3 niveaux** | USE CHAT, CHAT ENGINE, ORCHESTRATOR | [ ] |
| **Bordures visuelles** | ═══, ╔══╗, ━━━ | [ ] |
| **Émojis** | Clairs et cohérents | [ ] |
| **Timing** | ms précis | [ ] |
| **Aucune erreur** | Pas de stack traces non gérées | [ ] |

### ✅ Styles

| Critère | Attendu | Validation |
|---------|---------|------------|
| **Lisibilité** | Tous textes contrastés | [ ] |
| **Design System v20** | Palette cohérente | [ ] |
| **Glassmorphism** | Blur + transparence | [ ] |
| **Animations** | 60fps fluides | [ ] |
| **Responsive** | Resize OK | [ ] |

### ✅ Gestion Erreurs

| Critère | Attendu | Validation |
|---------|---------|------------|
| **Fallback garanti** | Toujours répond | [ ] |
| **TTS non-blocking** | Chat continue si fail | [ ] |
| **Messages erreur** | Clairs et explicites | [ ] |
| **No crash** | Système stable | [ ] |

---

## 🎯 CHECKLIST FINALE

### Avant Tests
- [x] Serveur Vite démarré (http://localhost:5173)
- [x] Build TypeScript OK (0 erreurs)
- [x] Logs verbeux ajoutés (3 fichiers)
- [x] TTS hybride créé (3 fichiers)
- [x] .env configuré (variables AI)

### Tests Fonctionnels
- [ ] Test 1: Chat IA Fallback (message + réponse)
- [ ] Test 2: TTS Web Speech API (voix audible)
- [ ] Test 3: Logs Console (3 niveaux)
- [ ] Test 4: Styles lisibilité (Design System v20)
- [ ] Test 5: Gestion erreurs (fallback garanti)

### Tests Avancés (Optionnels)
- [ ] Configuration Gemini API (si clé disponible)
- [ ] Installation Ollama (si temps disponible)
- [ ] VoiceControlPanel intégration (UI premium)
- [ ] Tests performance (10+ messages rapides)
- [ ] Tests accessibilité (clavier, screen reader)

---

## 🚀 ACTIONS POST-TESTS

### Si tous tests ✅ PASSÉS

**Célébration ! 🎉**
```
╔═══════════════════════════════════════════════════════════════╗
║  TITANE∞ v17.3.0 — VALIDATION COMPLÈTE                       ║
║  ✅ Toutes les phases complétées (1-6)                       ║
║  ✅ Chat IA opérationnel                                     ║
║  ✅ TTS intégré et fonctionnel                               ║
║  ✅ Logs verbeux validés                                     ║
║  ✅ Styles lisibles                                          ║
║  ✅ Gestion erreurs robuste                                  ║
╚═══════════════════════════════════════════════════════════════╝
```

**Prochaines étapes:**
1. Configurer Gemini API (production)
2. Installer Ollama (backup local)
3. Intégrer VoiceControlPanel (UI premium)
4. Exposer commandes Tauri voice_* (backend optimal)
5. Tests utilisateurs finaux
6. Déploiement production

### Si tests ❌ ÉCHOUÉS

**Debugging :**

**Chat ne répond pas:**
```bash
# Vérifier imports
grep -r "useChat" src/components/ChatWindow.tsx

# Vérifier orchestrator
grep -r "generate" src/services/ai/orchestrator.ts

# Vérifier logs console
# Chercher erreurs TypeScript rouges

# Rebuild
pnpm run build
```

**TTS ne fonctionne pas:**
```bash
# Vérifier Web Speech API support
# Dans console navigateur :
console.log('speechSynthesis' in window);
// Attendu: true

# Vérifier hybridTTS import
grep -r "hybridTTS" src/hooks/useChat.ts

# Vérifier voiceEnabled
grep -r "voiceEnabled" src/components/ChatWindow.tsx
```

**Logs manquants:**
```bash
# Vérifier fichiers modifiés
git diff src/services/ai/orchestrator.ts
git diff src/services/ai/chatEngine.ts
git diff src/hooks/useChat.ts

# Si pas de logs → réappliquer patches
```

**Styles cassés:**
```bash
# Vérifier Design System importé
grep -r "titane-design-system" src/main.tsx

# Vérifier CSS compile
pnpm run build
# Observer warnings CSS
```

---

## 📚 DOCUMENTATION RÉFÉRENCE

**Fichiers créés (Phase 1-5) :**
1. CARTOGRAPHIE_COMPLETE_CHAT_IA_VOIX_v17.3.0.md
2. DIAGNOSTIC_CHAT_IA_COMPLET_v17.3.0.md
3. RAPPORT_FINAL_REPARATION_CHAT_IA_v17.3.0.md
4. INTEGRATION_TTS_CHAT_IA_v17.3.0.md
5. RAPPORT_FINAL_COMPLET_v17.3.0.md

**Code créé :**
1. src/services/tts/hybridTTS.ts (279 lignes)
2. src/components/VoiceControlPanel.tsx (128 lignes)
3. src/components/VoiceControlPanel.css (154 lignes)

**Code modifié :**
1. src/services/ai/orchestrator.ts (logs verbeux)
2. src/services/ai/chatEngine.ts (logs 6 étapes)
3. src/hooks/useChat.ts (TTS integration)
4. src/components/ChatWindow.tsx (voiceEnabled)
5. .env (variables AI)

---

## ✅ VALIDATION FINALE

**Date test:** ____________________
**Testeur:** ____________________
**Navigateur:** ____________________
**OS:** ____________________

**Résultat global:**
- [ ] ✅ TOUS TESTS PASSÉS → Phase 6 complétée
- [ ] ⚠️ TESTS PARTIELS → Debugging nécessaire
- [ ] ❌ ÉCHEC CRITIQUE → Revue architecture

**Commentaires:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

**Signature validation:** ____________________

---

**🎉 Prêt pour les tests ! Ouvrir http://localhost:5173 et commencer par Test 1.**
