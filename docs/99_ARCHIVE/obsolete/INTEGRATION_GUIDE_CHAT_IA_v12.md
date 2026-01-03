# 🚀 TITANE∞ v12 - Chat IA & Voice Mode - GUIDE D'INTÉGRATION

## 📋 ÉTAPES D'INTÉGRATION

### 1. Vérification des fichiers générés

```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY

# Vérifier structure backend
ls -la src-tauri/src/ai/
ls -la src-tauri/src/memory/
ls -la src-tauri/src/tts/
ls -la src-tauri/src/audio/
ls -la src-tauri/src/modules/
ls -la src-tauri/src/commands/

# Vérifier structure frontend
ls -la src/hooks/
ls -la src/components/

# Vérifier documentation
ls -la docs/
```

**Attendu : 44 fichiers créés**

---

### 2. Installation des dépendances

```bash
# Installer dépendances Rust
cd src-tauri
cargo check

# Installer dépendances npm (si manquantes)
cd ..
pnpm install react-markdown

# Vérifier react-markdown
npm list react-markdown
```

---

### 3. Configuration environnement

```bash
# Créer fichier .env à la racine
cat > .env << 'EOF'
# Gemini API Key (obtenir sur: https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=votre_cle_api_gemini

# Ollama Model (optionnel, pour mode offline)
OLLAMA_MODEL=llama3

# Log level
RUST_LOG=info
EOF

# Rendre le fichier privé
chmod 600 .env
```

---

### 4. Modifier main.rs (Intégration)

**Option A : Intégration Minimale**

Ajouter au début de `src-tauri/src/main.rs` :

```rust
// Ajouter les modules
mod ai;
mod audio;
mod memory;
mod modules;
mod tts;

// Ajouter les commandes
use commands::ai_chat;
```

Dans la fonction `main()`, ajouter les commandes :

```rust
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Commandes existantes...
            
            // Commandes AI Chat
            ai_chat::ai_query,
            ai_chat::speak,
            ai_chat::start_recording,
            ai_chat::stop_recording,
            ai_chat::transcribe_audio,
            ai_chat::create_conversation,
            ai_chat::load_conversation,
            ai_chat::list_conversations,
            ai_chat::delete_conversation,
            ai_chat::clear_all_memory,
            ai_chat::check_connection,
            ai_chat::health_check,
            ai_chat::get_vad_state,
            ai_chat::get_module_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Option B : Intégration Complète avec État**

```rust
mod ai;
mod audio;
mod memory;
mod modules;
mod tts;

use commands::ai_chat::{self, AIChatState};

fn main() {
    // Initialiser l'état AI Chat
    let ai_state = AIChatState::new();

    tauri::Builder::default()
        .manage(ai_state)  // Gérer l'état
        .invoke_handler(tauri::generate_handler![
            // Commandes existantes...
            
            // Commandes AI Chat
            ai_chat::ai_query,
            ai_chat::speak,
            ai_chat::start_recording,
            ai_chat::stop_recording,
            ai_chat::transcribe_audio,
            ai_chat::create_conversation,
            ai_chat::load_conversation,
            ai_chat::list_conversations,
            ai_chat::delete_conversation,
            ai_chat::clear_all_memory,
            ai_chat::check_connection,
            ai_chat::health_check,
            ai_chat::get_vad_state,
            ai_chat::get_module_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

### 5. Mise à jour App.tsx

```tsx
// src/App.tsx
import React, { useState } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { VoiceUI } from './components/VoiceUI';
import './App.css';

function App() {
  const [voiceModeActive, setVoiceModeActive] = useState(false);

  return (
    <div className="app-container">
      <ChatWindow
        onVoiceModeToggle={() => setVoiceModeActive(!voiceModeActive)}
        voiceModeActive={voiceModeActive}
      />
      
      {voiceModeActive && (
        <div className="voice-mode-panel">
          <VoiceUI />
        </div>
      )}
    </div>
  );
}

export default App;
```

Ajouter styles dans `src/App.css` :

```css
.app-container {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  height: 100vh;
  background: #0a0a0a;
}

.app-container > * {
  flex: 1;
}

.voice-mode-panel {
  max-width: 400px;
}
```

---

### 6. Installation Ollama (Optionnel - Mode Offline)

```bash
# Linux/Mac
curl https://ollama.ai/install.sh | sh

# Démarrer le service
ollama serve &

# Télécharger un modèle
ollama pull llama3

# Vérifier disponibilité
ollama list
```

**Windows :** Télécharger depuis https://ollama.ai/download

---

### 7. Installation Whisper (Optionnel - ASR Offline)

```bash
# Python + pip requis
pip install openai-whisper

# Vérifier installation
whisper --help
```

---

### 8. Installation TTS Local (Optionnel)

**Linux (Debian/Ubuntu) :**
```bash
sudo apt update
sudo apt install espeak espeak-ng festival
```

**Mac :**
```bash
brew install espeak
brew install festival
```

**Windows :** Utilise la voix système intégrée

---

### 9. Test Compilation

```bash
# Test backend Rust
cd src-tauri
cargo build

# Si erreurs :
cargo check --verbose

# Test frontend
cd ..
pnpm run build
```

---

### 10. Lancement Dev

```bash
# Lancer en mode développement
pnpm run tauri dev
```

**Attendu :**
- ✅ Application se lance
- ✅ Chat window visible
- ✅ Status indicator vert si Gemini configuré
- ✅ Bouton Voice Mode fonctionnel

---

### 11. Tests Fonctionnels

#### Test Chat IA
1. Taper "Bonjour TITANE"
2. Appuyer Enter
3. Vérifier réponse IA

#### Test Mémoire
1. Chat → plusieurs messages
2. Fermer app
3. Relancer
4. Vérifier conversation rechargée

#### Test TTS
1. Recevoir réponse IA
2. Cliquer 🔈 sur message
3. Vérifier lecture audio

#### Test Voice Mode
1. Cliquer 🎤 dans header
2. Parler dans micro
3. Vérifier transcription
4. Envoyer message vocal

---

### 12. Build Production

```bash
# Build complet
pnpm run tauri build

# Binaire dans :
# src-tauri/target/release/titane-infinity
```

---

## 🐛 TROUBLESHOOTING

### Erreur "Cannot find module 'react-markdown'"
```bash
pnpm install react-markdown
```

### Erreur "GEMINI_API_KEY not found"
```bash
# Vérifier .env existe
cat .env

# Exporter manuellement
export GEMINI_API_KEY="votre_cle"
```

### Erreur "Ollama not available"
```bash
# Vérifier Ollama tourne
ollama list

# Sinon lancer :
ollama serve
```

### Erreur compilation Rust
```bash
# Nettoyer et rebuild
cd src-tauri
cargo clean
cargo build
```

### Erreur audio "Device not found"
```bash
# Linux : Vérifier PulseAudio
pactl list short sources

# Permissions micro
sudo usermod -a -G audio $USER
```

---

## 📝 CHECKLIST FINALE

- [ ] Fichiers générés présents (44 fichiers)
- [ ] Dependencies Rust installées
- [ ] Dependencies npm installées
- [ ] Fichier .env configuré
- [ ] main.rs modifié avec commandes
- [ ] App.tsx mis à jour
- [ ] Compilation backend OK
- [ ] Compilation frontend OK
- [ ] App se lance en dev
- [ ] Chat IA fonctionne
- [ ] Mémoire persiste
- [ ] TTS fonctionne
- [ ] Voice Mode fonctionnel
- [ ] Build production OK

---

## 🎯 SUPPORT

**Documentation complète :**
- `docs/CHAT_IA_VOICE_MODE_GUIDE.md`
- `docs/QUICKSTART_CHAT_IA.md`

**Rapports :**
- `RAPPORT_CHAT_IA_VOICE_MODE_v12.md`
- `INVENTAIRE_CHAT_IA_v12.md`

---

**TITANE∞ CHAT IA & VOICE MODE — Prêt pour l'intégration ! 🚀**
