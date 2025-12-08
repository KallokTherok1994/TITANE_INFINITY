# 🔧 Guide d'Installation WebKit pour TITANE∞

## 🚨 Problème Actuel

Le backend Rust Tauri ne peut pas compiler à cause de dépendances système manquantes :

```
rust-lld: error: unable to find library -lwebkit2gtk-4.1
rust-lld: error: unable to find library -ljavascriptcoregtk-4.1
```

## ✅ Solution : Installation des Dépendances WebKit

### Ubuntu / Pop!_OS / Debian

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf
```

### Alternative : WebKit 4.0 (si 4.1 indisponible)

Si votre distribution n'a pas webkit2gtk-4.1, utilisez la version 4.0 :

```bash
sudo apt install -y \
  libwebkit2gtk-4.0-dev \
  libjavascriptcoregtk-4.0-dev
```

Puis modifiez `src-tauri/Cargo.toml` :

```toml
[dependencies]
tauri = { version = "2.9.0", features = ["...", "linux-ipc-protocol"] }
webkit2gtk = "2.0"  # Au lieu de "4.1"
```

### Vérification de l'Installation

```bash
# Vérifier webkit2gtk-4.1
pkg-config --modversion webkit2gtk-4.1

# Si erreur, essayer 4.0
pkg-config --modversion webkit2gtk-4.0

# Vérifier JavaScriptCore
pkg-config --modversion javascriptcoregtk-4.1
```

## 🔄 Rebuild Backend après Installation

```bash
cd /home/titane/Documents/TITANE_INFINITY

# Clean cache Cargo
cargo clean --manifest-path src-tauri/Cargo.toml

# Rebuild
cargo build --manifest-path src-tauri/Cargo.toml

# Si succès, lancer dev
pnpm run dev
```

## 🧪 Test du Backend Chat Mock

Une fois le backend compilé :

### 1. Vérifier les Logs au Démarrage

```
╔══════════════════════════════════════════════════════════════╗
║     TITANE∞ v18 — MOCK BACKEND MODE + CHAT AI              ║
║     Frontend Development - Mocked Data                      ║
╚══════════════════════════════════════════════════════════════╝
[INFO] Starting TITANE∞ v18 in MOCK BACKEND mode
[INFO] Chat AI mock orchestrator: 8 commands registered
```

### 2. Test Console DevTools (F12)

```javascript
// Test 1: Vérifier status providers
const { invoke } = window.__TAURI__;
const status = await invoke('chat_get_providers_status');
console.log('Providers:', status);

// Résultat attendu:
// [
//   { provider: "gemini", available: false, error: "API key not configured (mock mode)" },
//   { provider: "ollama", available: false, error: "Ollama not running (mock mode)" },
//   { provider: "local", available: true, latency_ms: 50 }
// ]

// Test 2: Envoyer message
const response = await invoke('chat_send_message', {
  message: "Bonjour TITANE",
  provider: "auto",
  streaming: false
});
console.log('Response:', response);

// Résultat attendu:
// {
//   message: {
//     role: "assistant",
//     content: "Bonjour ! Je suis TITANE∞ en mode mock backend...",
//     provider: "local",
//     model: "titane-echo"
//   },
//   success: true,
//   latency_ms: ~500
// }
```

### 3. Test Chat UI

1. Ouvrir l'application (http://127.0.0.1:1420)
2. Naviguer vers `/chat`
3. Envoyer message : "test"
4. Vérifier dans Console :
   ```
   🚀 ORCHESTRATOR: Début cascade AI providers
   🔍 [1/4] Testing tauri-backend...
      ✅ Available: true
      🌟 Generating response...
      ✅ Success in 450ms
   ```
5. Vérifier UI :
   - Texte assistant visible (#c4c4c4 sur fond #1a1a1a)
   - Provider badge affiche "tauri-local"
   - Loader "TITANE réfléchit..." avant réponse

## 🎯 Tests de Fallback

### Test 1: Backend indisponible → Fallback Gemini

```bash
# Arrêter Tauri dev
# Relancer SANS rebuild (backend fail)
pnpm run dev

# Dans Chat UI:
# - Message envoyé
# - tauri-backend fail (expected)
# - gemini provider activé (si .env configuré)
# - Réponse reçue avec provider="gemini"
```

### Test 2: Tous providers externes fail → titane-local

```bash
# Désactiver Gemini API (.env vide)
# Arrêter Ollama si actif
# Backend Tauri fail

# Dans Chat UI:
# - Message envoyé
# - Cascade: tauri fail → gemini fail → ollama fail
# - titane-local activé (toujours disponible)
# - Réponse reçue avec provider="titane-local"
```

## 📊 Architecture Cascade Complète

```
ChatWindow (UI)
  ↓
useChat (React Hook)
  ↓
chatEngine (Modes)
  ↓
orchestrator (Cascade)
  ↓
┌─────────────────────────────────────────────┐
│ [1] tauriChatProvider (Backend Rust Mock)   │
│     ├─ gemini (mock unavailable)            │
│     ├─ ollama (mock unavailable)            │
│     └─ local (mock AVAILABLE ✅)            │
│     → Returns: provider="tauri-local"       │
├─────────────────────────────────────────────┤
│ [2] geminiProvider (Frontend API)           │
│     → Requires: VITE_GEMINI_API_KEY         │
├─────────────────────────────────────────────┤
│ [3] ollamaProvider (Frontend Local)         │
│     → Requires: Ollama running              │
├─────────────────────────────────────────────┤
│ [4] titaneLocalProvider (Frontend Auto)     │
│     → ALWAYS AVAILABLE (safety net)         │
└─────────────────────────────────────────────┘
```

## 🔥 Mode Frontend-Only (Développement Actuel)

Si vous ne pouvez pas installer webkit, le développement frontend reste possible :

```bash
# Lancer UNIQUEMENT Vite (pas Tauri)
pnpm vite dev

# Ouvrir navigateur: http://localhost:5173
# Chat fonctionne avec providers frontend uniquement
# Backend Tauri non nécessaire pour UI/UX dev
```

**Limitations mode frontend-only :**
- ❌ Pas de commands Tauri (Helios, Memory, etc.)
- ❌ tauriChatProvider indisponible
- ✅ geminiProvider fonctionne (si API key configurée)
- ✅ ollamaProvider fonctionne (si Ollama actif)
- ✅ titaneLocalProvider fonctionne (toujours)
- ✅ UI/UX complète visible et testable

## 📝 Prochaines Étapes

Une fois webkit installé et backend compilé :

1. ✅ **Phase 6 complète** : Backend ↔ Frontend validé
2. **Phase 7** : Vérifier TTS synthèse vocale
3. **Phase 8** : Module importation fichiers
4. **Phase 9** : Tests automatisés

---

**Document :** `GUIDE_INSTALLATION_WEBKIT.md`
**Auteur :** GitHub Copilot
**Date :** 24 novembre 2025
**Version TITANE∞ :** 18.0
