# 🔧 FIX TTS & CHAT IA — TITANE∞

## 🔍 DIAGNOSTIC

### Problème 1 : TTS (Synthèse Vocale)
**Symptômes** : Pas de voix quand on clique sur TTS
**Causes possibles** :
1. ❌ Commande Tauri `speak` non exposée ou non trouvée
2. ❌ Web Speech API fallback non activé correctement
3. ❌ Configuration audio système (espeak/piper non installé)

### Problème 2 : Chat IA
**Symptômes** : Messages n'arrivent pas / pas de réponse
**Causes possibles** :
1. ❌ Provider IA non configuré (Gemini API key manquante)
2. ❌ Ollama non démarré (localhost:11434)
3. ❌ Circuit breaker ouvert (trop d'erreurs)
4. ❌ Commandes Tauri chat non exposées

---

## ✅ SOLUTIONS IMMÉDIATES

### Solution TTS

#### Option 1 : Activer Web Speech API (Fallback navigateur)
```typescript
// src/services/tts/hybridTTS.ts (déjà implémenté)
// Devrait fonctionner automatiquement si Tauri échoue
```

**Test rapide** :
```javascript
// Dans DevTools console (F12)
window.speechSynthesis.speak(new SpeechSynthesisUtterance("Bonjour Kevin"));
```

#### Option 2 : Installer espeak (Backend local)
```bash
# Ubuntu/Pop!_OS
sudo apt-get update
sudo apt-get install espeak espeak-data libespeak-dev

# Test
espeak "Bonjour Kevin"
```

#### Option 3 : Vérifier commande Tauri
```rust
// src-tauri/src/commands/ai_chat.rs
#[tauri::command]
pub async fn speak(
    text: String,
    use_online: bool,
    rate: Option<f32>,
    pitch: Option<f32>,
    voice: Option<String>,
) -> Result<(), String> {
    // ... implémentation TTS
}
```

**Vérifier que la commande est exposée dans** `src-tauri/src/main.rs` :
```rust
.invoke_handler(tauri::generate_handler![
    speak,  // ← Doit être présent
    // ... autres commandes
])
```

---

### Solution Chat IA

#### Option 1 : Configurer Gemini (Priorité 1)
```bash
# Créer fichier .env à la racine
echo "VITE_GEMINI_API_KEY=YOUR_KEY_HERE" > .env

# Ou configurer dans l'UI TITANE
# Settings → AI Providers → Gemini API Key
```

**Obtenir clé API** :
- https://makersuite.google.com/app/apikey
- Gratuit : 60 requêtes/minute

#### Option 2 : Démarrer Ollama (Local)
```bash
# Installer Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Démarrer service
ollama serve &

# Télécharger modèle
ollama pull llama3.2:1b  # Léger (1.3 GB)
# ou
ollama pull mistral:7b   # Plus puissant (4.1 GB)

# Test
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:1b",
  "prompt": "Bonjour"
}'
```

#### Option 3 : Fallback Provider
Si Gemini et Ollama échouent, TITANE devrait utiliser le provider fallback (réponses prédéfinies).

**Vérifier dans DevTools Console** :
```javascript
// Test chat
await window.__TAURI_INVOKE__('ai_chat_stream', {
  prompt: 'Bonjour TITANE',
  provider: 'gemini',
  model: 'gemini-1.5-flash'
});
```

---

## 🛠️ COMMANDES DE RÉPARATION

### Réparation Complète TTS + Chat
```bash
cd /home/titane/Documents/TITANE_INFINITY

# 1. Installer dépendances système
sudo apt-get update
sudo apt-get install -y espeak espeak-data libespeak-dev curl

# 2. Installer Ollama (optionnel mais recommandé)
curl -fsSL https://ollama.com/install.sh | sh
ollama serve > /tmp/ollama.log 2>&1 &
sleep 3
ollama pull llama3.2:1b

# 3. Vérifier configuration Gemini
if [ -f .env ]; then
  echo "✅ .env existe"
  grep VITE_GEMINI_API_KEY .env || echo "⚠️ VITE_GEMINI_API_KEY manquant dans .env"
else
  echo "⚠️ Créer fichier .env avec VITE_GEMINI_API_KEY=YOUR_KEY"
fi

# 4. Rebuild TITANE
pnpm run build
cargo build --release --manifest-path=src-tauri/Cargo.toml

# 5. Relancer
pkill -f titane-infinity
./src-tauri/target/release/titane-infinity &

echo "✅ Réparation terminée"
echo "🧪 Test TTS : espeak 'Bonjour Kevin'"
echo "🧪 Test Ollama : curl http://localhost:11434/api/tags"
```

---

## 🧪 TESTS DE VALIDATION

### Test 1 : TTS Web Speech API
```javascript
// DevTools Console (F12)
const utterance = new SpeechSynthesisUtterance("TITANE est opérationnel");
utterance.lang = 'fr-FR';
utterance.rate = 1.0;
window.speechSynthesis.speak(utterance);
```

**Résultat attendu** : Voix du navigateur lit le texte

### Test 2 : TTS Backend (espeak)
```bash
espeak -v fr "TITANE est opérationnel"
```

**Résultat attendu** : Voix robotique lit le texte

### Test 3 : Chat IA Ollama
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:1b",
  "prompt": "Bonjour TITANE, présente-toi en une phrase",
  "stream": false
}'
```

**Résultat attendu** : JSON avec réponse du modèle

### Test 4 : Chat IA Gemini (via TITANE)
```javascript
// DevTools Console
await window.__TAURI_INVOKE__('ai_chat_stream', {
  prompt: 'Bonjour, comment vas-tu ?',
  provider: 'gemini',
  model: 'gemini-1.5-flash'
});
```

**Résultat attendu** : Réponse de Gemini streamée

---

## 📋 CHECKLIST DE VALIDATION

### TTS
- [ ] Web Speech API fonctionne (test console)
- [ ] espeak installé (`which espeak`)
- [ ] Commande `speak` exposée dans Tauri
- [ ] Audio système non muté
- [ ] Bouton TTS dans UI réagit (DevTools Network)

### Chat IA
- [ ] Gemini API key configurée (.env ou Settings)
- [ ] Ollama installé et démarré (`curl localhost:11434/api/tags`)
- [ ] Modèle téléchargé (`ollama list`)
- [ ] Circuit breaker non ouvert (redémarrer si besoin)
- [ ] Commandes `ai_chat_stream` exposées dans Tauri
- [ ] Whitelist 11434 dans tauri.conf.json (✅ déjà fait)

---

## 🚀 ACTIVATION RAPIDE

### Script d'activation complète
```bash
#!/bin/bash
# activation_titane.sh

echo "🌟 TITANE∞ — Activation TTS + Chat IA"
echo ""

# TTS
echo "📢 Activation TTS..."
sudo apt-get install -y espeak 2>/dev/null && echo "✅ espeak installé" || echo "⚠️ espeak déjà installé"

# Chat IA
echo "🤖 Activation Chat IA..."
if ! command -v ollama &> /dev/null; then
    echo "📥 Installation Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
fi

echo "🚀 Démarrage Ollama..."
pkill ollama 2>/dev/null
ollama serve > /tmp/ollama.log 2>&1 &
sleep 3

if ! ollama list | grep -q llama3.2; then
    echo "📥 Téléchargement llama3.2:1b..."
    ollama pull llama3.2:1b
fi

echo ""
echo "✅ Activation terminée !"
echo ""
echo "🧪 Tests :"
echo "  TTS : espeak 'Hello'"
echo "  Chat : curl http://localhost:11434/api/tags"
echo ""
echo "🚀 Lancer TITANE : ./src-tauri/target/release/titane-infinity"
```

**Utilisation** :
```bash
chmod +x activation_titane.sh
./activation_titane.sh
```

---

## 📖 DOCUMENTATION COMPLÈTE

### TTS : hybridTTS.ts
- Ligne 40-60 : Détection Tauri backend
- Ligne 70-100 : Fonction `speakTauri()`
- Ligne 100-150 : Fonction `speakWebSpeech()` (fallback)
- Ligne 150-200 : Fonction `speak()` (entry point)

### Chat IA : chatEngine.ts
- Ligne 1-100 : Configuration modes chat
- Ligne 100-200 : Fonction `generate()` principale
- Ligne 200-300 : Intégration Memory Core
- Ligne 300-400 : Provider orchestration

### Backend Tauri : ai_chat.rs
- Fonction `speak()` : TTS backend
- Fonction `ai_chat_stream()` : Chat streaming
- Fonction `ai_chat()` : Chat batch

---

## 🆘 SUPPORT

Si problèmes persistent :

1. **Logs Backend** :
   ```bash
   tail -f ~/.titane/logs/titane.log
   ```

2. **Logs Frontend** :
   - DevTools Console (F12)
   - Onglet Network (requêtes Tauri)

3. **Diagnostic complet** :
   ```bash
   # TTS
   which espeak
   espeak --version
   pactl list sinks short  # Audio outputs

   # Chat
   curl http://localhost:11434/api/tags
   ollama list
   env | grep GEMINI
   ```

4. **Reset complet** :
   ```bash
   rm -rf ~/.titane/vault/*.enc
   rm -rf ~/.titane/logs/*
   pkill -f titane
   cargo clean --manifest-path=src-tauri/Cargo.toml
   pnpm run build
   cargo build --release --manifest-path=src-tauri/Cargo.toml
   ```

---

**Dernière mise à jour** : 27 novembre 2025
**Version TITANE** : vΩ (Omega)
