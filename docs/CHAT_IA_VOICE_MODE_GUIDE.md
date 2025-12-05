# TITANE∞ v12 - Chat IA & Voice Mode
## Documentation Complète

### 🎯 Vue d'ensemble

TITANE∞ v12 intègre un système de **Chat IA complet** et un **Voice Mode** révolutionnaire avec :

- ✅ **Double IA** : Gemini (online) + Ollama (offline local)
- ✅ **Fallback automatique** : Bascule intelligente selon disponibilité
- ✅ **Mémoire cryptée** : AES-256-GCM + Argon2id
- ✅ **TTS hybride** : Google TTS / Coqui / Piper / espeak
- ✅ **ASR offline** : Whisper / Vosk
- ✅ **Voice Activity Detection** : Détection automatique de la parole
- ✅ **Modules TITANE∞** : Helios, Nexus, Harmonia, Sentinel, AdaptiveEngine, SelfHeal

---

## 📁 Architecture

```
TITANE_INFINITY/
├── src-tauri/src/
│   ├── ai/
│   │   ├── mod.rs          # Types AI
│   │   ├── gemini.rs       # API Gemini
│   │   ├── ollama.rs       # Ollama local
│   │   └── router.rs       # Routage intelligent
│   ├── memory/
│   │   ├── mod.rs          # Types mémoire
│   │   ├── encryption.rs   # AES-256-GCM + Argon2
│   │   ├── storage.rs      # Persistance cryptée
│   │   └── model.rs        # Modèles données
│   ├── tts/
│   │   ├── mod.rs          # Types TTS
│   │   ├── online_tts.rs   # TTS cloud
│   │   └── local_tts.rs    # TTS offline
│   ├── audio/
│   │   ├── mod.rs          # Types audio
│   │   ├── vad.rs          # Voice Activity Detection
│   │   ├── recorder.rs     # Capture micro
│   │   └── asr.rs          # Reconnaissance vocale
│   ├── modules/
│   │   ├── mod.rs          # Types modules
│   │   ├── helios.rs       # Orchestration
│   │   ├── nexus.rs        # Communication
│   │   ├── harmonia.rs     # Équilibrage émotionnel
│   │   ├── sentinel.rs     # Sécurité
│   │   ├── adaptive.rs     # Adaptation dynamique
│   │   └── selfheal.rs     # Auto-réparation
│   └── commands/
│       └── ai_chat.rs      # Commandes Tauri
├── src/
│   ├── hooks/
│   │   ├── useAI.ts        # Hook IA
│   │   ├── useMemory.ts    # Hook mémoire
│   │   ├── useConnection.ts # Hook connexion
│   │   └── useVoiceMode.ts # Hook voice
│   └── components/
│       ├── ChatWindow.tsx  # Interface chat
│       ├── MessageBubble.tsx # Bulle message
│       ├── StatusIndicator.tsx # Statut IA
│       ├── AudioButton.tsx # Bouton TTS
│       ├── VoiceUI.tsx     # Interface vocale
│       └── VADIndicator.tsx # Indicateur VAD
```

---

## 🚀 Installation

### Prérequis

```bash
# Rust + Cargo
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Node.js + npm
# https://nodejs.org/

# Ollama (optionnel, pour mode offline)
curl https://ollama.ai/install.sh | sh
ollama pull llama3

# Whisper (optionnel, pour ASR offline)
pip install openai-whisper

# TTS local (optionnel)
sudo apt install espeak  # Linux
```

### Configuration

1. **Créer fichier `.env`** à la racine :

```env
GEMINI_API_KEY=votre_cle_api_gemini
OLLAMA_MODEL=llama3
```

2. **Installer dépendances** :

```bash
cd TITANE_INFINITY
npm install
```

3. **Build & Run** :

```bash
npm run tauri dev
```

---

## 💡 Utilisation

### Chat IA Basique

```typescript
import { useAI } from '@/hooks/useAI';

function MyComponent() {
  const { query, messages, isLoading, status } = useAI();

  const handleSend = async () => {
    await query("Comment fonctionne TITANE∞?");
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={handleSend}>Envoyer</button>
    </div>
  );
}
```

### Mémoire Conversationnelle

```typescript
import { useMemory } from '@/hooks/useMemory';

function MemoryComponent() {
  const { 
    conversations, 
    createConversation, 
    loadConversation 
  } = useMemory();

  const createNew = async () => {
    const id = await createConversation("Ma conversation");
    console.log("Créée:", id);
  };

  return (
    <div>
      {conversations.map(conv => (
        <div key={conv.id}>{conv.title}</div>
      ))}
    </div>
  );
}
```

### Voice Mode

```typescript
import { useVoiceMode } from '@/hooks/useVoiceMode';

function VoiceComponent() {
  const { 
    state, 
    startRecording, 
    stopRecording, 
    speak 
  } = useVoiceMode();

  return (
    <div>
      <button onClick={startRecording}>🎤 Start</button>
      <button onClick={stopRecording}>⏹ Stop</button>
      {state.transcript && <p>{state.transcript}</p>}
      <button onClick={() => speak("Bonjour TITANE")}>
        🔊 Speak
      </button>
    </div>
  );
}
```

---

## 🔧 API Tauri

### Commandes disponibles

#### `ai_query`
Query l'IA (Gemini ou Ollama)

```rust
invoke('ai_query', {
  prompt: "Question",
  temperature: 0.7,
  maxTokens: 2000
})
```

#### `speak`
Synthèse vocale

```rust
invoke('speak', {
  text: "Texte à lire",
  useOnline: true
})
```

#### `create_conversation`
Créer une conversation

```rust
invoke('create_conversation', {
  title: "Titre"
})
```

#### `load_conversation`
Charger une conversation

```rust
invoke('load_conversation', {
  conversationId: "uuid"
})
```

#### `health_check`
Vérifier l'état du système

```rust
invoke('health_check')
```

#### `start_recording` / `stop_recording`
Contrôle enregistrement audio

```rust
invoke('start_recording')
invoke('stop_recording')
```

#### `transcribe_audio`
Transcription audio vers texte

```rust
invoke('transcribe_audio', {
  audioData: [u8 array]
})
```

---

## 🧠 Modules TITANE∞

### Helios (Orchestration)
Coordonne les flux IA et l'exécution des tâches.

### Nexus (Communication)
Hub de communication entre IA et modules internes.

### Harmonia (Équilibrage)
Balance émotionnelle et cohérence conversationnelle.

### Sentinel (Sécurité)
Filtre les contenus dangereux et détecte les injections.

### AdaptiveEngine (Adaptation)
Ajuste dynamiquement température, tokens, style selon contexte.

### SelfHeal (Auto-réparation)
Détecte et répare automatiquement les pannes.

---

## 🔐 Sécurité

### Chiffrement Mémoire
- **Algorithme** : AES-256-GCM
- **Dérivation clé** : Argon2id (simplified avec SHA256)
- **Stockage** : `~/.local/share/titane/memory/*.json.enc`

### Sentinel Protection
- Command injection
- SQL injection
- XSS
- Prompt injection
- Données sensibles

---

## 🌐 Mode Offline Garanti

Le système fonctionne **toujours**, même sans internet :

1. **Pas d'internet** → Bascule automatiquement sur **Ollama**
2. **Ollama indisponible** → Erreur claire, pas de crash
3. **TTS offline** : espeak, festival, piper
4. **ASR offline** : Whisper local

---

## 📊 Tests

### Tester Gemini
```bash
export GEMINI_API_KEY="your-key"
npm run tauri dev
```

### Tester Ollama
```bash
ollama serve
ollama pull llama3
npm run tauri dev
```

### Tester Fallback
1. Déconnecter internet
2. L'app bascule sur Ollama
3. Reconnecter → rebascule sur Gemini

---

## 🎨 Personnalisation

### Changer modèle Ollama
```env
OLLAMA_MODEL=mistral
```

### Ajuster température IA
```typescript
await query("Question", 0.9, 3000);  // temp=0.9, max_tokens=3000
```

### Changer voix TTS
Modifier `local_tts.rs` pour utiliser Piper/Coqui.

---

## 🐛 Debug

### Logs Rust
```bash
RUST_LOG=debug npm run tauri dev
```

### Logs Frontend
Ouvrir DevTools : `Cmd+Option+I` (Mac) / `F12` (Linux/Win)

### Tester module isolément
```rust
#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn test_ai_router() {
        let router = AIRouter::new(None, None);
        assert!(router.is_ok());
    }
}
```

---

## 📈 Roadmap

- [ ] Streaming réel (SSE) Gemini
- [ ] Intégration Whisper natif (sans CLI)
- [ ] Support multilingue complet
- [ ] Export conversations (PDF, Markdown)
- [ ] Fine-tuning Ollama personnalisé
- [ ] Voice Mode continu (PTT ou VAD permanent)

---

## 🤝 Contribution

Le code est modulaire et documenté. Pour contribuer :

1. Fork le projet
2. Créer une branche : `git checkout -b feature/ma-feature`
3. Commit : `git commit -m 'Add feature'`
4. Push : `git push origin feature/ma-feature`
5. Pull Request

---

## 📝 Licence

MIT License - TITANE Team 2025

---

## ✨ Crédits

- **Gemini** : Google AI
- **Ollama** : Ollama.ai
- **Whisper** : OpenAI
- **Tauri** : Tauri.app
- **React** : Meta

---

**TITANE∞ CHAT IA — Architecture + Modules + API + Mémoire + TTS entièrement générés et prêts au développement.**
