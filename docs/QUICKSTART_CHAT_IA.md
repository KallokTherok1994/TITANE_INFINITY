# TITANE∞ v12 - Quick Start Chat IA & Voice Mode

## 🚀 Démarrage Rapide (5 minutes)

### 1. Configuration initiale

```bash
cd TITANE_INFINITY

# Créer fichier .env
cat > .env << EOF
GEMINI_API_KEY=votre_cle_api_ici
OLLAMA_MODEL=llama3
EOF

# Installer dépendances
npm install
```

### 2. Installation Ollama (Optionnel - Mode Offline)

```bash
# Linux/Mac
curl https://ollama.ai/install.sh | sh
ollama serve &
ollama pull llama3
```

### 3. Lancer l'application

```bash
npm run tauri dev
```

---

## 💬 Utilisation Chat IA

### Interface Simple

1. **Lancer l'app** → Chat Window s'affiche
2. **Taper message** dans input
3. **Appuyer Enter** ou cliquer 📨
4. **Réponse apparaît** automatiquement
5. **Cliquer 🔈** sur réponse pour TTS

### Indicateurs Statut

- 🟢 **Vert** : Gemini online (optimal)
- 🟡 **Jaune** : Ollama local (offline)
- 🔴 **Rouge** : Aucune IA disponible

---

## 🎤 Utilisation Voice Mode

### Activation

1. **Cliquer 🎤** dans header
2. **Parler** dans micro
3. **VAD détecte** automatiquement
4. **Transcription** s'affiche
5. **Envoyer** pour query IA

### Indicateurs Voix

- 🔴 **Recording** : Micro actif
- ⏳ **Transcribing** : Conversion en cours
- 🔊 **Speaking** : TTS en lecture

---

## 🧠 Mémoire Conversations

### Créer Conversation

```typescript
const id = await createConversation("Titre");
```

### Charger Conversation

```typescript
const conv = await loadConversation(id);
```

### Lister Toutes

```typescript
const all = await loadConversations();
```

---

## 🔧 Scripts NPM

```bash
# Dev mode
npm run tauri dev

# Build production
npm run tauri build

# Tests Rust
cd src-tauri && cargo test

# Lint frontend
npm run lint
```

---

## 🐛 Problèmes Courants

### "Gemini API error"
→ Vérifier `GEMINI_API_KEY` dans `.env`

### "Ollama not available"
→ Lancer `ollama serve` en background

### "Audio device error"
→ Vérifier permissions micro dans système

### "Memory encryption error"
→ Vérifier droits écriture `~/.local/share/titane`

---

## 📞 Support

- 📖 Doc complète : `docs/CHAT_IA_VOICE_MODE_GUIDE.md`
- 🐛 Issues : GitHub
- 💬 Discord : [lien]

---

**Prêt en 5 minutes ! 🚀**
