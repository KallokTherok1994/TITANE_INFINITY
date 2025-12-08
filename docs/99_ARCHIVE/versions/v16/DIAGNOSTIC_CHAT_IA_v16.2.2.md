# 🧪 DIAGNOSTIC CHAT IA v16.2.2 — PLAN D'ACTION COMPLET

**Date**: 27 novembre 2025
**Version**: TITANE∞ v16.2.2
**Statut**: PHASE 1/7 Cartographie Frontend COMPLÉTÉE ✅
**Objectif**: Réparer Chat IA + TTS + Modules (problème utilisateur critique)

---

## 📊 RÉSUMÉ CARTOGRAPHIE (Phase 1 - 100% ✅)

### ✅ Architecture Chat IA Identifiée

**Frontend (React 18 + TypeScript)**:
```
src/ui/pages/Chat.tsx (PRODUCTION) ← App.tsx ligne 66
  ├── useChat() hook (composition)
  │   ├── useChatCore() → Génération IA
  │   ├── useChatUI() → État UI (messages, input, loading, error)
  │   └── useChatMemory() → Sync backend
  ├── MessageList component
  └── ChatInput component (src/components/chat/ChatInput.tsx)
```

**Backend (Rust async + Tauri v2)**:
```
src-tauri/src/overdrive/chat_orchestrator.rs (758 lignes)
  ├── chat_send_message() ← Commande principale
  ├── chat_stream_message() ← Streaming
  ├── chat_get_providers_status()
  └── Providers cascade: Gemini → Ollama → Local
```

**Commandes Tauri enregistrées** (main.rs ligne 306):
```rust
overdrive::chat_orchestrator::chat_send_message,       // ✅ ENREGISTRÉE
overdrive::chat_orchestrator::chat_stream_message,     // ✅ ENREGISTRÉE
overdrive::chat_orchestrator::chat_get_providers_status, // ✅ ENREGISTRÉE
```

**Client TypeScript** (src/services/tauriClient.ts):
```typescript
async chatSendMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await this.safeInvoke<string>('chat_send_message', { request });
  return JSON.parse(response);
}
```

**Flux Données Complet**:
```
User Input (ChatInput.tsx)
  ↓ onSend(text)
Chat.tsx → sendMessage(text) [useChat hook]
  ↓
useChat.sendMessage()
  ├── addMessage(userMessage) [UI]
  ├── saveMessage(userMessage) [Memory backend]
  ↓
useChatCore.generate(content, messages)
  ↓
tauriClient.chatSendMessage({ message, provider: 'auto', streaming: false })
  ↓
invoke('chat_send_message', { request: ChatRequest })
  ↓
Backend Rust: chat_orchestrator.rs
  ├── Validation input (empty? too long?)
  ├── Providers cascade: gemini → ollama → local
  ├── is_provider_available() heartbeat check
  ├── generate_gemini() / generate_ollama() / generate_local()
  └── ChatResponse { message, success, latency_ms }
  ↓
Frontend: JSON.parse(response)
  ↓
useChat.sendMessage()
  ├── addMessage(aiMessage) [UI]
  ├── saveMessage(aiMessage) [Memory backend]
  ├── awardXP(5) [Experience system]
  ├── hybridTTS.speak(content) [si voiceEnabled]
  └── setSuggestions()
```

### 🎯 Composants Utilisés en Production

| Fichier | Rôle | Utilisé en Prod ? |
|---------|------|-------------------|
| `src/ui/pages/Chat.tsx` | Page Chat principale | ✅ OUI (App.tsx ligne 66) |
| `src/components/chat/ChatInput.tsx` | Input simple (auto-resize) | ✅ OUI (Chat.tsx ligne 142) |
| `src/features/chat/ChatInput.tsx` | Input avancé (XP, suggestions, file import) | ❌ NON (alternative) |
| `src/components/ChatWindow.tsx` | Fenêtre Chat complète (retry logic) | ❌ NON (legacy?) |
| `src/pages/ChatPage.tsx` | Page Chat mock (setTimeout) | ❌ NON (demo) |
| `src/hooks/useChat.ts` | Hook composition principal | ✅ OUI |
| `src/hooks/useAIChatStreaming.ts` | Hook streaming alternatif | ❌ NON (non utilisé) |

### 🔍 Gestion Erreurs Actuelle

**Console Logs** (✅ Activé):
- `console.log()` dans useChat.ts (verbose)
- `console.error()` dans useChat.ts (catch blocks)
- Logs Rust backend via `println!()` et `log::info!()`

**UI Feedback** (⚠️ Partiel):
- `error` state dans useChat → Affiché par MessageList
- Mais: Erreurs silencieuses si backend ne répond pas (timeout, crash)
- Pas de Toast UI pour erreurs temporaires
- Status Bar affiche provider mais pas erreurs

**Timeout**:
- Frontend: 60s (tauriClient.ts ligne 268)
- Backend: Aucun timeout explicite trouvé
- useChat: Cache + debounce 300ms

### 🎤 TTS (Synthèse Vocale)

**Module**: `src/services/tts/hybridTTS.ts`

**Stratégie**: Fallback cascade
1. Tauri Backend (secureInvoke('speak')) → espeak-ng / piper local
2. Web Speech API (window.speechSynthesis) → Browser natif
3. Silence (pas d'erreur bloquante)

**Activation**: `voiceEnabled: boolean` passé à useChat()

**Appel**: `hybridTTS.speak(response.content, { lang: 'fr-FR', rate: 1.0 })`

**Issue Potentielle**:
- Commande `speak` pas trouvée dans main.rs invoke_handler
- hybridTTS vérifie `secureInvoke('ping')` pour tester Tauri → peut échouer
- Backend audio players whitelistés: espeak-ng, aplay, ffplay, afplay

---

## 🚨 PROBLÈMES IDENTIFIÉS

### ❌ Issue #1: Chat IA Ne Répond Pas (Priorité CRITIQUE)

**Symptômes**:
- User envoie message → aucune réponse visible
- Aucune erreur affichée dans UI
- Silence complet (pas de loading, pas de feedback)

**Hypothèses**:
1. **Backend providers tous échouent**:
   - Gemini: Clé API manquante/invalide (.env `VITE_GEMINI_API_KEY`)
   - Ollama: Pas installé localement ou port 11434 fermé
   - Local: Echo fallback bugué ou désactivé

2. **Timeout silencieux**:
   - Backend met >60s → timeout frontend → erreur pas affichée
   - Rust panic → crash silencieux sans logs visibles

3. **Serialization JSON**:
   - Backend retourne string brute, pas JSON → JSON.parse() crash
   - TAPIError pas sérialisée correctement → frontend crash

4. **Invoke handler non enregistré** (peu probable):
   - Commande `chat_send_message` mal enregistrée dans main.rs
   - Mais ✅ VÉRIFIÉ: Ligne 306 main.rs enregistrée correctement

5. **Gestion erreur silencieuse**:
   - try/catch dans useChat.sendMessage() attrape erreur
   - Mais: setError() pas propagé visuellement (MessageList bug?)
   - Console.error() log mais user ne voit rien

**Tests à Effectuer**:
```typescript
// Test 1: Vérifier providers status
const status = await invoke('chat_get_providers_status');
console.log('Providers status:', status);

// Test 2: Message minimal
const response = await invoke('chat_send_message', {
  request: {
    message: 'test',
    provider: 'local', // Force local echo
    streaming: false
  }
});
console.log('Response:', response);

// Test 3: Gemini avec clé API
// Vérifier .env contient: VITE_GEMINI_API_KEY=...

// Test 4: Logs backend Rust
// Lancer app et vérifier terminal pour logs [CHAT]
```

### ❌ Issue #2: TTS Ne Fonctionne Pas (Priorité HAUTE)

**Symptômes**:
- Synthèse vocale ne joue aucun son
- Pas d'erreur visible

**Hypothèses**:
1. **Commande `speak` non enregistrée**:
   - hybridTTS.checkTauriAvailable() → secureInvoke('ping') échoue
   - Fallback Web Speech API utilisé mais silencieux?

2. **Backend audio players manquants**:
   - espeak-ng pas installé sur système
   - Commande système bloquée par sandbox Tauri

3. **voiceEnabled pas propagé**:
   - Chat.tsx pas de toggle voice mode (useState présent mais pas utilisé?)
   - useChat({ voiceEnabled: voiceModeActive }) jamais true

**Tests à Effectuer**:
```bash
# Test 1: Vérifier espeak-ng installé
which espeak-ng
espeak-ng --version

# Test 2: Test manuel TTS
espeak-ng "Test TITANE" -v fr

# Test 3: Vérifier Web Speech API
# Dans DevTools Console:
window.speechSynthesis.speak(new SpeechSynthesisUtterance("Test"))
```

### ❌ Issue #3: DevTools F12 Non Accessibles (Priorité MOYENNE)

**Symptômes**:
- User ne peut pas ouvrir DevTools avec F12

**Hypothèses**:
1. **Mode release sans devtools**:
   - Icône bureau lance binaire release (pas dev)
   - tauri.conf.json `devtools: true` activé uniquement en debug

2. **Raccourci désactivé**:
   - Tauri v2 change raccourcis par défaut?

**Tests à Effectuer**:
```typescript
// Test 1: Vérifier mode build
console.log('DEV mode:', import.meta.env.DEV);
console.log('PROD mode:', import.meta.env.PROD);

// Test 2: Ouvrir devtools via code
// Ajouter dans App.tsx:
useEffect(() => {
  if (window.__TAURI__) {
    window.__TAURI__.window.getCurrent().openDevtools();
  }
}, []);
```

### ⚠️ Issue #4: Duplication Composants (Priorité BASSE)

**Symptômes**:
- 2 versions ChatInput.tsx (src/components/ vs src/features/)
- 2 pages Chat (Chat.tsx vs ChatPage.tsx)
- 2 hooks chat (useChat vs useAIChatStreaming)

**Impact**:
- Confusion maintenance
- Risque utiliser mauvais composant

**Résolution**:
- ✅ VÉRIFIÉ: Chat.tsx (production) utilise src/components/chat/ChatInput.tsx
- Supprimer fichiers legacy après confirmation:
  - src/features/chat/ChatInput.tsx (alternative non utilisée)
  - src/pages/ChatPage.tsx (demo mock setTimeout)
  - src/hooks/useAIChatStreaming.ts (streaming alternatif non utilisé)

---

## 📋 PLAN D'ACTION (7 Phases)

### ✅ PHASE 1: Cartographie Frontend (100% COMPLÉTÉ)

**Objectif**: Identifier tous composants, hooks, flux données
**Statut**: ✅ TERMINÉ
**Résultat**: 30+ fichiers identifiés, flux complet documenté

### 🔄 PHASE 2: Audit Pont Tauri Commands (EN COURS)

**Objectif**: Valider communication frontend ↔ backend

**Actions**:
1. ✅ Vérifier commands enregistrées main.rs (ligne 306 ✅)
2. ⏳ Tester invoke('chat_send_message') retourne bien JSON valide
3. ⏳ Vérifier signature ChatRequest/ChatResponse Rust ↔ TypeScript
4. ⏳ Auditer TAPIError serialization (kind, message, context, timestamp)
5. ⏳ Tester timeout 60s frontend vs backend
6. ⏳ Logs backend Rust → vérifier println!() visible dans terminal
7. ⏳ Vérifier providers cascade fonctionne (gemini fail → ollama → local)

**Tests**:
```typescript
// Dans DevTools Console (après app lancée):

// Test 1: Providers status
const status = await window.__TAURI__.invoke('chat_get_providers_status');
console.log('Providers:', status);

// Test 2: Message local echo (toujours disponible)
const response = await window.__TAURI__.invoke('chat_send_message', {
  request: {
    message: 'Hello TITANE',
    provider: 'local',
    streaming: false
  }
});
console.log('Response:', response);

// Test 3: Message auto (cascade providers)
const response2 = await window.__TAURI__.invoke('chat_send_message', {
  request: {
    message: 'Test auto cascade',
    provider: 'auto',
    streaming: false
  }
});
console.log('Response auto:', response2);
```

### ⏳ PHASE 3: Intégration Moteur IA (NON DÉMARRÉE)

**Objectif**: Vérifier providers IA (Gemini, Ollama, Local)

**Actions**:
1. Auditer Gemini provider:
   - Vérifier .env `VITE_GEMINI_API_KEY` (doit être `GEMINI_API_KEY` backend?)
   - Tester endpoint Google AI Studio
   - Vérifier quota API

2. Auditer Ollama provider:
   - Vérifier installation: `ollama --version`
   - Tester server: `curl http://localhost:11434/api/generate`
   - Vérifier modèles disponibles: `ollama list`
   - Installer llama2 si manquant: `ollama pull llama2`

3. Auditer Local provider:
   - Vérifier generate_local() retourne toujours réponse
   - Tester echo fallback (ne doit jamais échouer)

4. Auditer is_provider_available():
   - Vérifier heartbeat cache (évite spam)
   - Timeout heartbeat (ne doit pas bloquer >2s)

**Tests**:
```bash
# Test Ollama local
ollama --version
ollama serve  # Démarrer serveur
ollama pull llama2  # Télécharger modèle
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Test"
}'

# Test Gemini API (remplacer YOUR_KEY)
curl "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=YOUR_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Test"}]}]}'
```

### ⏳ PHASE 4: TTS + Audio Pipeline (NON DÉMARRÉE)

**Objectif**: Réparer synthèse vocale TITANE

**Actions**:
1. Localiser commande `speak` backend Rust:
   - Chercher `#[tauri::command]` fonction speak
   - Vérifier enregistrement main.rs invoke_handler

2. Vérifier audio players système:
   ```bash
   which espeak-ng
   which aplay
   which ffplay
   which afplay  # macOS
   ```

3. Tester hybridTTS:
   - Vérifier secureInvoke('ping') ne bloque pas
   - Fallback Web Speech API fonctionne
   - Config voiceEnabled propagée depuis Chat.tsx

4. Activer voice mode UI:
   - Chat.tsx: useState voiceModeActive déjà présent
   - Ajouter bouton toggle (🎤) dans header
   - Passer voiceEnabled à useChat({ voiceEnabled })

**Tests**:
```typescript
// Dans DevTools Console:
import { hybridTTS } from './src/services/tts/hybridTTS';

// Test 1: Web Speech API
window.speechSynthesis.speak(
  new SpeechSynthesisUtterance("Test TITANE Infinity")
);

// Test 2: Hybrid TTS
await hybridTTS.speak("Bonjour TITANE", { lang: 'fr-FR', rate: 1.0 });

// Test 3: Status
const status = hybridTTS.getStatus();
console.log('TTS Status:', status);
```

### ⏳ PHASE 5: DevTools + Logs Visibles (NON DÉMARRÉE)

**Objectif**: Rendre erreurs VISIBLES pour user

**Actions**:
1. Activer DevTools F12:
   - Vérifier tauri.conf.json `devtools: true`
   - Tester mode release: Activer devtools même en prod
   - Ajouter raccourci Ctrl+Shift+I custom

2. Créer panneau DevTools TITANE:
   - Component DiagnosticPanel.tsx (déjà existe ligne 72 App.tsx)
   - Afficher logs Rust en temps réel (via events Tauri)
   - Afficher providers status + latence
   - Afficher erreurs récentes

3. Logs Rust → Fichier:
   - Backend écrit logs dans ~/titane_logs.txt
   - Frontend lit via Tauri fs API
   - Affiche dans DiagnosticPanel

4. Console.error → Toast UI:
   - Installer react-hot-toast
   - Wrapper errorTracker.track() affiche toast
   - Garder console.error pour debug

**UI DevTools Proposé**:
```tsx
// Component à créer: src/components/DevToolsPanel.tsx
<DevToolsPanel>
  <Section title="🎯 Providers Status">
    {providers.map(p => (
      <StatusBadge
        name={p.name}
        status={p.status}
        latency={p.latency}
      />
    ))}
  </Section>

  <Section title="⚠️ Recent Errors">
    {errors.map(e => (
      <ErrorCard
        timestamp={e.timestamp}
        message={e.message}
        trace={e.trace}
      />
    ))}
  </Section>

  <Section title="📊 Backend Logs">
    <LogViewer
      logs={rustLogs}
      filter={logLevel}
    />
  </Section>
</DevToolsPanel>
```

### ⏳ PHASE 6: Version + Icône Desktop (PARTIEL)

**Objectif**: Garantir binaire correct déployé

**Actions**:
1. ✅ Version v16.2.2 validée partout
2. ⏳ Vérifier mode build icône:
   - `TITANE_Installer.desktop` action "Build Production" lance quoi?
   - Mode dev (cargo run) vs release (cargo build --release)

3. ⏳ Tester Chat IA via icône:
   - Cliquer icône bureau → Lance app
   - Tester envoi message → Vérifier réponse
   - Comparer avec npm run tauri:dev

4. ⏳ Activer DevTools en release:
   - tauri.conf.json: `devtools: true` même en !debug_assertions
   - Ou: Ajouter hotkey Ctrl+Shift+D pour ouvrir devtools

### ⏳ PHASE 7: Tests + Documentation (NON DÉMARRÉE)

**Objectif**: Validation finale complète

**Actions**:
1. Tests end-to-end Chat IA:
   - Envoyer message → Vérifier réponse affichée
   - Tester 3 providers (local, ollama, gemini)
   - Tester cascade fallback (gemini fail → ollama → local)
   - Tester retry logic (3x avec backoff)

2. Tests TTS:
   - Activer voice mode → Envoyer message
   - Vérifier audio joué
   - Tester Web Speech API fallback

3. Tests gestion erreurs:
   - Provider offline → Affiche erreur UI
   - Timeout 60s → Message "Timeout"
   - Message trop long (>10000 chars) → Validation error

4. Documentation:
   - README_CHATIA_REPAIR.md (guide troubleshooting)
   - FAQ.md (erreurs courantes)
   - Video screencast démo Chat IA fonctionnel

---

## 🔬 TESTS IMMÉDIAT À EFFECTUER (MAINTENANT)

### Test 1: Vérifier Providers Status

**Objectif**: Savoir quels providers sont disponibles

**Méthode**:
1. Ouvrir app TITANE (npm run tauri:dev)
2. Ouvrir DevTools (F12 ou auto-ouvert)
3. Console → Exécuter:
```javascript
await window.__TAURI__.invoke('chat_get_providers_status')
```

**Résultat Attendu**:
```json
{
  "gemini": { "available": false, "error": "API key missing" },
  "ollama": { "available": false, "error": "Connection refused" },
  "local": { "available": true, "latency_ms": 0 }
}
```

### Test 2: Message Local Echo

**Objectif**: Vérifier backend local fonctionne (ne doit jamais échouer)

**Méthode**:
```javascript
const response = await window.__TAURI__.invoke('chat_send_message', {
  request: {
    message: 'Test echo',
    provider: 'local',
    streaming: false
  }
});
console.log('Response:', response);
```

**Résultat Attendu**:
```json
{
  "message": {
    "id": "...",
    "role": "assistant",
    "content": "[LOCAL ECHO] Test echo",
    "timestamp": 1732719019000,
    "provider": "local",
    "model": "echo-v1"
  },
  "success": true,
  "latency_ms": 5
}
```

### Test 3: Logs Backend Rust

**Objectif**: Vérifier logs Rust visibles dans terminal

**Méthode**:
1. Terminal où tourne `npm run tauri:dev`
2. Envoyer message dans Chat UI
3. Observer logs format `[CHAT]`

**Résultat Attendu**:
```
[CHAT] 🔄 Tentative avec provider: gemini
[CHAT] ⚠️ Provider gemini non disponible
[CHAT] 🔄 Tentative avec provider: ollama
[CHAT] ⚠️ Provider ollama non disponible
[CHAT] 🔄 Tentative avec provider: local
[CHAT] ✅ Provider local: Response generated
```

### Test 4: Vérifier UI Affiche Erreur

**Objectif**: Valider gestion erreur frontend

**Méthode**:
1. Envoyer message dans Chat UI
2. Si erreur: Vérifier MessageList affiche erreur rouge

**Résultat Attendu**:
- Si erreur: Message "❌ Erreur: [message]" affiché
- Si timeout: Message "⏱️ Timeout (60s dépassé)"
- Si aucun provider: Message "⚠️ Aucun provider disponible"

---

## 🎯 PROCHAINE ÉTAPE IMMÉDIATE

**Action #1**: Exécuter Test 1-4 ci-dessus dans app lancée

**Action #2**: Créer script de diagnostic automatique:

```typescript
// src/scripts/diagnosticChatIA.ts
export async function runChatIADiagnostic() {
  const results = {
    providersStatus: null,
    localEchoTest: null,
    backendLogs: [],
    uiErrorDisplay: false
  };

  try {
    // Test 1: Providers
    results.providersStatus = await invoke('chat_get_providers_status');

    // Test 2: Local echo
    results.localEchoTest = await invoke('chat_send_message', {
      request: { message: 'Diagnostic test', provider: 'local', streaming: false }
    });

    // Test 3: Logs (via backend command si existe)
    // TODO: Implémenter get_recent_logs backend

    // Test 4: UI error
    // TODO: Trigger intentional error et vérifier UI

  } catch (error) {
    console.error('Diagnostic failed:', error);
  }

  return results;
}
```

**Action #3**: Si local echo fonctionne mais pas UI:
- Problème dans flux frontend (useChat → UI update)
- Vérifier addMessage() met bien à jour state
- Vérifier MessageList re-render avec nouveaux messages

**Action #4**: Si local echo ne fonctionne pas:
- Problème backend Rust critique
- Vérifier chat_orchestrator.rs generate_local() simple echo
- Vérifier main.rs enregistre bien commande

---

## 📝 NOTES TECHNIQUES

### Structure ChatRequest (Rust ↔ TypeScript)

**Rust** (src-tauri/src/overdrive/chat_orchestrator.rs):
```rust
#[derive(Serialize, Deserialize, Clone)]
pub struct ChatRequest {
    pub message: String,
    pub conversation_id: Option<String>,
    pub provider: String, // "auto" | "gemini" | "ollama" | "local"
    pub model: Option<String>,
    pub streaming: bool,
    pub images: Option<Vec<String>>, // base64
    pub system_prompt: Option<String>,
}
```

**TypeScript** (src/services/tauriClient.ts):
```typescript
export interface ChatRequest {
  message: string;
  conversation_id?: string;
  provider: 'auto' | 'gemini' | 'ollama' | 'local';
  model?: string;
  streaming: boolean;
  images?: string[]; // base64
  system_prompt?: string;
}
```

### TAPIError Structure

**Rust**:
```rust
pub enum TAPIErrorKind {
    ValidationError,
    ProviderUnavailable,
    Timeout,
    NetworkError,
    ParseError,
    StorageError,
    ConfigError,
    InternalError,
    SecurityError,
    NotFound,
}

pub struct TAPIError {
    pub kind: TAPIErrorKind,
    pub message: String,
    pub context: Option<String>,
    pub code: Option<u16>,
    pub timestamp: u64,
}
```

**TypeScript**:
```typescript
export interface TAPIError {
  kind: 'ValidationError' | 'ProviderUnavailable' | 'Timeout' | ...;
  message: string;
  context?: string;
  code?: number;
  timestamp: number;
}
```

---

## 📚 RÉFÉRENCES

- **Architecture Chat v19.2**: CHAT_IA_AUDIT_FINAL_v19.2_COMPLETE.md
- **Rapport v18**: RAPPORT_CHAT_IA_v18.md
- **Fix devUrl v19.3**: FIX_CHAT_IA_FINAL_v19.3.md
- **Whitelisting Audio**: RAPPORT_WHITELISTING_AUDIO_v19.1.0.md
- **Backend Refactor v17.3**: BACKEND_REFACTOR_REPORT_v17.3.0.md

---

## ✅ CHECKLIST VALIDATION FINALE

- [ ] **Providers Status**: Les 3 providers (gemini, ollama, local) testés
- [ ] **Local Echo**: Fonctionne TOUJOURS (fallback ultime)
- [ ] **UI Response**: Messages affichés dans MessageList
- [ ] **Gestion Erreurs**: Erreurs visibles dans UI (pas seulement console)
- [ ] **TTS Fonctionnel**: Synthèse vocale joue audio
- [ ] **DevTools Accessibles**: F12 ouvre DevTools
- [ ] **Logs Backend**: Visible dans terminal + fichier
- [ ] **Timeout Géré**: 60s timeout affiche message user-friendly
- [ ] **Cascade Providers**: Auto → gemini → ollama → local
- [ ] **XP Attribution**: +5 XP par message
- [ ] **Memory Sync**: Messages sauvegardés backend
- [ ] **Cache Actif**: Réponses cached (100 entrées max)
- [ ] **Debounce**: 300ms entre requêtes
- [ ] **Version Cohérente**: v16.2.2 partout
- [ ] **Icône Bureau**: Lance app correctement

---

**Prochaine action**: Exécuter tests 1-4 dans app lancée, documenter résultats, passer Phase 2 (Audit Pont Tauri).
