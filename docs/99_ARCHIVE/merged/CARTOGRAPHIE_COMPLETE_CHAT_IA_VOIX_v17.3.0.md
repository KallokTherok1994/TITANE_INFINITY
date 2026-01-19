# 🗺️ CARTOGRAPHIE COMPLÈTE — TITANE∞ v17.3.0

**Date**: 24 novembre 2025
**Objectif**: Audit complet Chat IA + API + Voix

---

## 📁 1. FRONTEND CHAT IA

### 1.1. Composants Principaux

| Fichier | Rôle | Status |
|---------|------|--------|
| **`src/components/ChatWindow.tsx`** | Composant principal du chat | ✅ Principal |
| **`src/ui/pages/Chat.tsx`** | Page de chat alternative | ⚠️ Doublon? |
| **`src/pages/ChatPage.tsx`** | Autre page de chat | ⚠️ Doublon? |
| **`src/features/chat/ChatMessage.tsx`** | Composant message individuel | ✅ Utilisé |
| **`src/features/chat/ChatInput.tsx`** | Input de chat (features) | ⚠️ Doublon? |
| **`src/components/ChatInput.tsx`** | Input de chat (components) | ⚠️ Doublon? |
| **`src/components/chat/ChatInput.tsx`** | Input de chat (components/chat) | ⚠️ Doublon? |
| **`src/features/chat/ChatContextPanel.tsx`** | Panneau contexte | ✅ Utilisé |

**⚠️ PROBLÈME DÉTECTÉ**: Multiples versions de composants similaires → risque de confusion.

### 1.2. Hooks & Services

| Fichier | Rôle | Utilisation |
|---------|------|-------------|
| **`src/hooks/useChat.ts`** | Hook principal pour le chat | ✅ Correctement implémenté (déjà vérifié) |
| **`src/services/ai/chatEngine.ts`** | Moteur de chat unifié | ✅ Gère modes + Memory Core |
| **`src/services/ai/orchestrator.ts`** | Cascade Gemini → Ollama → Fallback | ✅ Logique de fallback OK |
| **`src/services/ai/chatEngine.test.ts`** | Tests unitaires | ℹ️ Tests disponibles |

### 1.3. Types de Messages

Définis dans `src/services/ai/types.ts`:

```typescript
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIResponse {
  content: string;
  provider: string;
  timestamp: number;
}
```

---

## 🔗 2. BRIDGE TAURI ↔ FRONTEND

### 2.1. Fichiers Bridge Principaux

| Fichier | Rôle | Commandes utilisées |
|---------|------|---------------------|
| **`src/services/singularityBridge.ts`** | Bridge principal pour SingularityState | `singularity_get_full_state`, état global |
| **`src/services/singularityConnections.ts`** | Polling sync des modules | `get_helios_state`, `get_memory_state` (déjà corrigé) |
| **`src/services/personaTauriBridge.ts`** | Bridge pour Persona Engine | ⚠️ Commandes anciennes? |
| **`src/services/tauriBridge.ts`** | Bridge générique | Utilitaires Tauri |
| **`src/core/persona/PersonaBridge.ts`** | Autre bridge Persona | ⚠️ Doublon avec personaTauriBridge? |

### 2.2. Commandes Tauri Utilisées (Frontend)

#### Chat IA / AI

**❌ PROBLÈME CRITIQUE**: Aucun appel Tauri direct détecté dans `chatEngine.ts` ou `orchestrator.ts` !

Les providers (`gemini`, `ollama`, `fallback`) utilisent:
- **Gemini**: API HTTP externe (`https://generativelanguage.googleapis.com`)
- **Ollama**: API HTTP locale (`http://localhost:11434`)
- **Fallback**: Réponses hardcodées (pas d'appel backend)

**→ Le Chat IA ne passe PAS par Tauri actuellement.**

#### Modules de Sync (SingularityConnections)

| Commande Frontend | Commande Rust Attendue | Status |
|-------------------|------------------------|--------|
| `get_helios_state` | `get_helios_state` | ✅ Aligné (corrigé) |
| `get_memory_state` | `get_memory_state` | ✅ Aligné (corrigé) |
| `singularity_get_symbolic` | *(inexistant)* | ❌ Manquant |
| `singularity_get_adaptive` | *(inexistant)* | ❌ Manquant |
| `singularity_get_meta` | *(inexistant)* | ❌ Manquant |

---

## ⚙️ 3. BACKEND RUST / TAURI

### 3.1. Point d'Entrée

**Fichier**: `src-tauri/src/main.rs`

**Mode actuel**: **MOCK BACKEND** (frontend-only development)

```rust
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        // Helios
        mock_commands::get_helios_state,
        mock_commands::get_system_health,

        // Memory
        mock_commands::get_memory_state,
        mock_commands::write_snapshot,
        mock_commands::read_snapshot,
        // ... autres commandes mock

        // Singularity
        mock_commands::singularity_get_full_state,
        mock_commands::singularity_get_global_coherence,
        mock_commands::singularity_is_critical,
        mock_commands::get_singularity_state,
        mock_commands::sync_singularity,
    ])
```

**⚠️ PROBLÈME MAJEUR**: Aucune commande de Chat IA enregistrée !

### 3.2. Modules Backend Disponibles

#### Chat IA (Overdrive)

**Fichier**: `src-tauri/src/overdrive/chat_orchestrator.rs`

**Commandes détectées** (non enregistrées dans main.rs):

| Commande | Signature | Status |
|----------|-----------|--------|
| `chat_send_message` | `(state, conversation_id, message, history)` | ❌ Non exposée |
| `chat_create_conversation` | `(state)` | ❌ Non exposée |
| `chat_get_conversation` | `(state, id)` | ❌ Non exposée |
| `chat_delete_conversation` | `(state, id)` | ❌ Non exposée |
| `chat_set_gemini_key` | `(state, key)` | ❌ Non exposée |
| `chat_get_providers_status` | `(state)` | ❌ Non exposée |
| `chat_check_providers` | `(state)` | ❌ Non exposée |
| `chat_stream_message` | `(state, conversation_id, message, history)` | ❌ Non exposée |

**→ Le backend Rust a un orchestrateur de chat complet mais il n'est PAS exposé à Tauri !**

#### Voice Engine (Overdrive)

**Fichier**: `src-tauri/src/overdrive/voice_engine.rs`

**Commandes détectées** (non enregistrées):

- `voice_start_recording`
- `voice_stop_recording`
- `voice_transcribe`
- `voice_synthesize`
- `voice_set_config`
- ... (15+ commandes TTS/STT)

**→ Le backend a un moteur voix complet mais non exposé !**

#### Autres Modules

- **Memory Engine**: `src-tauri/src/overdrive/memory_engine.rs` (10+ commandes)
- **Exp Engine**: `src-tauri/src/overdrive/exp_engine.rs` (progression, XP)
- **Semantic Kernel**: `src-tauri/src/overdrive/semantic_kernel.rs` (RAG, embeddings)
- **Auto Heal**: `src-tauri/src/overdrive/auto_heal.rs` (récupération erreurs)
- **Project Autopilot**: `src-tauri/src/overdrive/project_autopilot.rs` (gestion projets)

**Tous ces modules existent mais ne sont PAS exposés dans `main.rs` !**

---

## 🎤 4. SYNTHÈSE VOCALE & MODE VOIX

### 4.1. Logique TTS Frontend

| Fichier | Rôle | Technologie |
|---------|------|-------------|
| **`src/hooks/useVoiceMode.ts`** | Hook principal voix | Tauri invoke (vers voice_engine.rs) |
| **`src/core/sound/SOUND_ENGINE.ts`** | Moteur audio UI | Web Audio API (sons système) |
| **`src/services/api.ts`** | Service voix (voiceService) | API wrapper |

**Stratégie actuelle**:
- **STT (Speech-to-Text)**: Via Tauri vers backend Rust
- **TTS (Text-to-Speech)**: Via Tauri vers backend Rust
- **Sons UI**: Via Web Audio API (SOUND_ENGINE)

**❌ PROBLÈME**: Les commandes Tauri appelées par `useVoiceMode` ne sont pas exposées dans `main.rs` !

### 4.2. Composants UI Voix

| Fichier | Rôle |
|---------|------|
| **`src/components/VoiceCircle.tsx`** | Visualisation circulaire de l'état voix |
| **`src/components/VoiceDuplexUI.tsx`** | Interface duplex voix |
| **`src/components/ListeningIndicator.tsx`** | Indicateur écoute active |
| **`src/components/WakewordIndicator.tsx`** | Indicateur mot de réveil |
| **`src/components/VoiceButton.tsx`** | Bouton activation voix |
| **`src/components/FullDuplexWave.tsx`** | Visualisation waveform |

### 4.3. Intégration avec Chat IA

**État actuel**: ❌ Aucune intégration détectée !

Le composant `ChatWindow.tsx` a une prop `voiceModeActive` mais:
- Aucun appel à TTS après réception d'un message IA
- Aucun listener sur les réponses pour déclencher la synthèse vocale
- Mode voix désynchronisé du Chat IA

---

## 🎨 5. STYLES DU CHAT IA

### 5.1. Fichiers CSS Concernés

| Fichier | Rôle | Status |
|---------|------|--------|
| **`src/components/ChatWindow.css`** | Styles fenêtre chat | ✅ Migré vers tokens v20 |
| **`src/components/MessageBubble.css`** | Styles bulles messages | ✅ Migré vers tokens v20 |
| **`src/styles/chat-messages.css`** | Utility classes chat | ✅ Nouveau fichier créé |

### 5.2. Design Systems Chargés

| Fichier | Ordre de chargement | Rôle |
|---------|---------------------|------|
| **`src/styles/titane-design-system.css`** | 1er (unique) | Design system unifié v12+v20 |
| ~~`src/design-system/titane-v12.css`~~ | *(deprecated)* | Ancien DS |
| ~~`src/design-system/titane-v20.css`~~ | *(deprecated)* | Ancien DS |

**Import actuel** (dans `src/main.tsx`):

```typescript
import './styles/titane-design-system.css';
```

### 5.3. Tokens Utilisés

#### Couleurs Texte

```css
--text-primary: rgba(255, 255, 255, 0.95);   /* Texte principal clair */
--text-secondary: rgba(255, 255, 255, 0.7);  /* Texte secondaire */
--text-tertiary: rgba(255, 255, 255, 0.5);   /* Texte tertiaire */
```

#### Couleurs Bulles Chat

```css
/* Bulles utilisateur (saphir) */
.chat-message--user {
  background: linear-gradient(135deg, var(--titane-saphir-500), var(--titane-saphir-600));
  color: var(--text-primary);
}

/* Bulles assistant (diamant) */
.chat-message--assistant {
  background: linear-gradient(135deg, var(--titane-diamant-700), var(--titane-diamant-800));
  color: var(--text-primary);
}

/* Messages système/erreur (rubis) */
.chat-message--system {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--titane-rubis-500);
  color: var(--titane-rubis-50);
}
```

**✅ Styles déjà corrigés** dans la session précédente.

---

## 🔍 6. DIAGNOSTIC CRITIQUE

### 6.1. Pourquoi le Chat IA ne répond pas ?

#### Hypothèse 1: Providers IA Indisponibles

**Test à faire**:
- Vérifier si Gemini API key est configurée
- Vérifier si Ollama est installé et running (`http://localhost:11434`)
- Vérifier si le fallback provider fonctionne

**Fichiers à inspecter**:
- `src/services/ai/providers/gemini.ts`
- `src/services/ai/providers/ollama.ts`
- `src/services/ai/providers/fallback.ts`

#### Hypothèse 2: Erreur Silencieuse dans Orchestrator

Le code de `orchestrator.ts` catch les erreurs mais peut-être pas assez verbeux.

**Action**: Ajouter logs détaillés dans la cascade de providers.

#### Hypothèse 3: État "processing" Jamais Reseté

Dans `useChat.ts`, si une exception non catchée se produit, `isLoading` peut rester à `true`.

**Action**: Vérifier que `finally` est bien appelé.

### 6.2. Pourquoi les Erreurs SingularityConnections ?

**RÉSOLU** dans la session précédente :
- Ajout de `safeInvoke()` qui désactive gracieusement les commandes manquantes
- Correction des noms de commandes

**À vérifier**: Les commandes `singularity_get_symbolic`, `singularity_get_adaptive`, `singularity_get_meta` ne seront jamais disponibles tant que le mode MOCK BACKEND est actif.

### 6.3. Pourquoi la Voix ne Fonctionne pas ?

**PROBLÈME CRITIQUE**: Les commandes Tauri pour la voix ne sont PAS exposées dans `main.rs`.

**Actions nécessaires**:
1. Soit exposer les commandes de `voice_engine.rs` dans `main.rs`
2. Soit implémenter un fallback Web Speech API côté frontend

---

## 🎯 7. PLAN D'ACTION PRIORITAIRE

### Phase 1: Débloquer le Chat IA (URGENT)

1. **Inspecter les providers IA**
   - Lire `gemini.ts`, `ollama.ts`, `fallback.ts`
   - Identifier pourquoi aucune réponse n'est renvoyée

2. **Ajouter logs verbeux**
   - Dans `orchestrator.ts` : logs à chaque étape de la cascade
   - Dans `useChat.ts` : log des erreurs avec stack trace

3. **Vérifier le fallback provider**
   - S'assurer qu'au minimum le fallback renvoie une réponse mock

### Phase 2: Activer le Backend Overdrive (MOYEN TERME)

1. **Exposer les commandes Chat dans main.rs**
   ```rust
   use overdrive::chat_orchestrator;

   .invoke_handler(tauri::generate_handler![
       // Existing mock commands...

       // Chat IA
       chat_orchestrator::chat_send_message,
       chat_orchestrator::chat_stream_message,
       chat_orchestrator::chat_get_providers_status,
   ])
   ```

2. **Basculer les providers frontend vers Tauri**
   - Modifier `orchestrator.ts` pour appeler `invoke('chat_send_message')` au lieu d'API HTTP

### Phase 3: Réparer la Voix (MOYEN TERME)

1. **Option A: Exposer voice_engine.rs**
   - Ajouter les commandes dans `main.rs`
   - Tester `useVoiceMode` avec le backend Rust

2. **Option B: Fallback Web Speech API**
   - Implémenter une solution pure frontend
   - Utiliser `window.speechSynthesis` et `window.SpeechRecognition`

### Phase 4: Intégration Chat ↔ Voix

1. **Déclencher TTS après réponse IA**
   - Dans `ChatWindow.tsx` ou `useChat.ts`
   - Appeler `voiceService.synthesize(response.content)` si mode voix actif

2. **Gérer l'interruption**
   - Arrêter la lecture si nouveau message ou changement de page

---

## 📊 8. STATISTIQUES

| Catégorie | Fichiers | Commandes Tauri | Status |
|-----------|----------|-----------------|--------|
| **Chat IA (Frontend)** | 8 composants | 0 (HTTP API) | ⚠️ Fragmenté |
| **Chat IA (Backend)** | 1 module (overdrive) | 8 commandes | ❌ Non exposé |
| **Voice (Frontend)** | 6 composants + 1 hook | Invoke vers voice_engine | ⚠️ Appels échouent |
| **Voice (Backend)** | 1 module (voice_engine) | 15+ commandes | ❌ Non exposé |
| **Sync Modules** | SingularityConnections | 5 commandes | ✅ Partiellement corrigé |

**Conclusion**: Architecture solide mais **désynchronisée**. Le backend Overdrive complet existe mais n'est pas branché au frontend.

---

**Prochaine étape**: Inspecter les providers IA pour comprendre pourquoi le Chat ne répond pas.
