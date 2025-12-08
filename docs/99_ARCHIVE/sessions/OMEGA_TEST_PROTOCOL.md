# 🧪 PROTOCOLE DE TEST — PIPELINE OMEGA

**Date :** 4 décembre 2025
**Version :** TITANE∞ v19.x
**Objectif :** Valider l'activation complète du pipeline OMEGA avec mémoire, modes et FrenchMastery

---

## ✅ PHASE 1 : VÉRIFICATION BACKEND

### Test B1 — Compilation réussie

**Statut :** ✅ VALIDÉ

```bash
cargo check --manifest-path src-tauri/Cargo.toml
```

**Résultat attendu :** Aucune erreur de compilation

**Résultat obtenu :**
```
Finished `dev` profile [unoptimized + debuginfo] target(s) in 1m 16s
```

### Test B2 — Commandes OMEGA enregistrées

**Fichier :** `src-tauri/src/main.rs`

**Commandes vérifiées :**
- [x] `create_new_conversation` — Ligne 1450
- [x] `conversation_generate` — Ligne 1451
- [x] `conversation_process_message` (legacy) — Ligne 1453

**Statut :** ✅ VALIDÉ

---

## ✅ PHASE 2 : VÉRIFICATION FRONTEND

### Test F1 — Service chat rerouté vers OMEGA

**Fichier :** `src/services/api/chat.ts`

**Méthodes vérifiées :**
- [x] `startNewConversation()` — Appelle `create_new_conversation`
- [x] `sendMessage(message, conversationId, config)` — Appelle `conversation_generate`
- [x] `getLastEndpoint()` — Retourne 'OMEGA' ou 'LEGACY'

**Statut :** ✅ VALIDÉ

### Test F2 — Store de modes fonctionnel

**Fichier :** `src/stores/useChatModeStore.ts`

**Vérifications :**
- [x] Store Zustand créé avec état `currentModeId`, `currentMode`, `availableModes`
- [x] Méthode `initialize()` charge les modes depuis `chatModeService`
- [x] Méthode `changeMode(modeId)` met à jour le mode actif

**Statut :** ✅ VALIDÉ

### Test F3 — ChatPage intégration

**Fichier :** `src/pages/ChatPage.tsx`

**Vérifications :**
- [x] Import de `useChatModeStore`
- [x] Gestion de `conversation_id` avec localStorage
- [x] Transmission du mode dans `handleSendMessage`
- [x] Bannière pipeline affichée avec métriques

**Statut :** ✅ VALIDÉ

---

## 🔬 PHASE 3 : TESTS FONCTIONNELS

### Test T1 — Endpoint OMEGA actif

**Procédure :**
1. Lancer l'application : `npm run tauri:dev`
2. Ouvrir ChatPage
3. Envoyer un premier message : "Bonjour TITANE"
4. Observer la bannière pipeline

**Résultat attendu :**
```
🔌 Pipeline: OMEGA (vert)
🆔 Conversation: a3f5b2c8
```

**Statut :** ⏳ EN ATTENTE (nécessite build + launch)

---

### Test T2 — Mémoire de session persistante

**Procédure :**
1. Envoyer : "Je m'appelle Kevin"
2. Attendre réponse
3. Envoyer 2-3 messages sur d'autres sujets
4. Demander : "Comment je m'appelle ?"

**Résultat attendu :**
- TITANE répond "Kevin" sans hésitation
- Le `conversation_id` reste identique dans la bannière

**Statut :** ⏳ EN ATTENTE

---

### Test T3 — Modes IA fonctionnels

**Procédure :**
1. Sélectionner mode "Coach"
2. Poser : "Comment améliorer ma productivité ?"
3. Noter le style de réponse
4. Changer pour mode "Strategist"
5. Poser la même question

**Résultat attendu :**
- Changement perceptible de ton (Coach = encourageant, Strategist = structuré)
- Badge mode dans la bannière se met à jour
- Logs backend montrent variation du `system_prompt`

**Statut :** ⏳ EN ATTENTE

---

### Test T4 — Persistance de conversation au rechargement

**Procédure :**
1. Démarrer conversation, envoyer 2 messages
2. Noter le `conversation_id` dans la bannière (ex: `a3f5b2c8`)
3. Recharger la page (F5)
4. Vérifier le `conversation_id` affiché

**Résultat attendu :**
- Même `conversation_id` après rechargement
- localStorage contient `titane_conversation_id`

**Statut :** ⏳ EN ATTENTE

---

### Test T5 — Langue française exclusive (FrenchMastery)

**Procédure :**
1. Poser une question technique en français :
   "Explique le fonctionnement du garbage collector de V8"
2. Examiner la réponse

**Résultat attendu :**
- Réponse 100% en français (hors termes techniques inévitables)
- Badge `🇫🇷 FR ✓` affiché dans la bannière
- `response.frenchMasteryApplied === true`

**Statut :** ⏳ EN ATTENTE

---

### Test T6 — Latence affichée

**Procédure :**
1. Envoyer un message simple : "Quelle heure est-il ?"
2. Observer la bannière après réponse

**Résultat attendu :**
- Badge `⚡ XXXms` apparaît avec latence
- Valeur cohérente (500-3000ms selon complexité)

**Statut :** ⏳ EN ATTENTE

---

### Test T7 — Bouton "Nouvelle conversation"

**Procédure :**
1. Démarrer une conversation
2. Noter le `conversation_id` (ex: `a3f5b2c8`)
3. Cliquer sur "🆕 Nouvelle conversation"
4. Vérifier le nouvel ID

**Résultat attendu :**
- `conversation_id` change immédiatement
- localStorage mis à jour
- Historique de messages effacé

**Statut :** ⏳ EN ATTENTE

---

### Test T8 — Mode → Prompt Backend Mapping

**Procédure :**
1. Ouvrir les DevTools backend (logs)
2. Sélectionner mode "Coach"
3. Envoyer un message
4. Examiner les logs backend

**Résultat attendu :**
- Log montre `mode: "coach"` dans la requête
- Backend utilise un `system_prompt` adapté au coaching
- Ton de réponse cohérent avec le mode

**Statut :** ⏳ EN ATTENTE (nécessite logs backend)

---

## 🎯 CHECKLIST VALIDATION COMPLÈTE

### Backend
- [x] Compilation réussie
- [x] Commandes `create_new_conversation` et `conversation_generate` enregistrées
- [x] Types `AIConfig` corrigés
- [x] Dépendance `uuid` présente

### Frontend
- [x] Service `chatService` rerouté vers OMEGA
- [x] Store `useChatModeStore` créé et fonctionnel
- [x] `ChatPage` intégration complète
- [x] Type `ChatResponse` étendu avec `frenchMasteryApplied`
- [x] Bannière pipeline ajoutée avec métriques

### Tests fonctionnels (nécessitent build + launch)
- [ ] Test T1 — Endpoint OMEGA actif
- [ ] Test T2 — Mémoire de session
- [ ] Test T3 — Modes IA fonctionnels
- [ ] Test T4 — Persistance rechargement
- [ ] Test T5 — FrenchMastery actif
- [ ] Test T6 — Latence affichée
- [ ] Test T7 — Nouvelle conversation
- [ ] Test T8 — Mode → Prompt mapping

---

## 🚀 PROCHAINE ACTION

### Option A — Build & Test manuel
```bash
npm run tauri:dev
```

Puis exécuter les tests T1-T8 manuellement dans l'interface.

### Option B — Build production
```bash
npm run tauri:build
```

Créer un binaire pour tests en conditions réelles.

---

## 📝 NOTES TECHNIQUES

### Architecture du pipeline OMEGA

```
Frontend (ChatPage)
    ↓
chatService.sendMessage(message, conversationId, { mode })
    ↓
Tauri Command: conversation_generate
    ↓
Backend Rust: ConversationEngineState.process_message()
    ↓
Pipeline OMEGA:
    1. Intent Analysis
    2. Emotion Detection
    3. Cognitive Processing
    4. LLM Generation
    5. FrenchMastery Post-Processing
    6. Memory Storage
    7. SingularityState Sync
    ↓
Response FR 100% + Metadata
```

### Codes couleur bannière

| Badge | Couleur | Signification |
|-------|---------|---------------|
| 🔌 OMEGA | Vert | Pipeline OMEGA actif |
| 🔌 LEGACY | Rouge | Pipeline legacy (erreur) |
| 🆔 [ID] | Gris | Conversation ID stable |
| 🎛️ [mode] | Bleu | Mode IA actif |
| ⚡ [ms] | Jaune | Latence mesurée |
| 🇫🇷 FR ✓ | Vert | FrenchMastery confirmé |

---

**Rapport généré le :** 4 décembre 2025
**Responsable technique :** Claude Sonnet 4.5
**Projet :** TITANE_INFINITY v19.x
