# 🔧 TROUBLESHOOTING VOICE MODE v12

## ❌ PROBLÈMES COURANTS ET SOLUTIONS

### 1. Erreur compilation Rust: `webkit2gtk-4.1 not found`

**Symptôme** :
```
The system library `webkit2gtk-4.1` required by crate `webkit2gtk-sys` was not found.
```

**Causes** :
- Dépendances système manquantes
- Environnement Flatpak sans accès hôte
- PKG_CONFIG_PATH non configuré

**Solutions** :

#### Solution A: Installation native (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y \
    libwebkit2gtk-4.1-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    patchelf
```

#### Solution B: Installation native (Fedora)
```bash
sudo dnf install -y \
    webkit2gtk4.1-devel \
    gtk3-devel \
    libappindicator-gtk3-devel \
    librsvg2-devel
```

#### Solution C: Environnement Flatpak
```bash
# Utiliser flatpak-spawn pour accéder à l'hôte
flatpak-spawn --host cargo build

# Ou installer les dépendances sur l'hôte
flatpak-spawn --host sudo apt install libwebkit2gtk-4.1-dev
```

#### Solution D: Utiliser version bundled
```toml
# Dans src-tauri/Cargo.toml, ajouter feature:
[dependencies.tauri]
version = "2.0"
features = ["bundled"]
```

---

### 2. Erreur: `framer-motion not found`

**Symptôme** :
```
Cannot find module 'framer-motion'
```

**Solution** :
```bash
npm install framer-motion
```

Vérifier installation :
```bash
npm list framer-motion
```

---

### 3. Erreur CSS: `} attendue`

**Symptôme** :
Warnings CSS dans les fichiers `.css`

**Cause** :
Linter VS Code mal configuré ou parsing incomplet

**Solution** :
Les fichiers CSS sont valides. Ignorer ces warnings ou :

```bash
# Vérifier syntax CSS
npx stylelint "src/**/*.css"

# Formatter CSS
npx prettier --write "src/**/*.css"
```

---

### 4. Modules Rust non reconnus

**Symptôme** :
```
error[E0583]: file not found for module `wakeword`
error[E0583]: file not found for module `duplex`
```

**Cause** :
Modules non déclarés dans `main.rs`

**Solution** :
Ajouter dans `src-tauri/src/main.rs` :

```rust
mod wakeword;
mod duplex;
```

---

### 5. Erreur: `rand` crate not found

**Symptôme** :
```
error: failed to resolve: use of undeclared crate or module `rand`
```

**Solution** :
Ajouter dans `src-tauri/Cargo.toml` :

```toml
[dependencies]
rand = "0.8"
chrono = "0.4"
```

Puis :
```bash
cd src-tauri
cargo build
```

---

### 6. Build Frontend avec warnings

**Symptôme** :
```
warning: Unused variable 'setIsHovered'
warning: React Hook useEffect has missing dependencies
```

**Cause** :
Warnings normaux de développement

**Solution** :
Ces warnings n'empêchent pas le fonctionnement. Pour les corriger :

```tsx
// Ajouter ESLint disable si nécessaire
// eslint-disable-next-line react-hooks/exhaustive-deps

// Ou corriger les dépendances useEffect
useEffect(() => {
  // ...
}, [dependency1, dependency2]);
```

---

### 7. Audio ne fonctionne pas

**Symptôme** :
Pas de capture audio ou lecture TTS

**Cause** :
Code utilise des mocks pour la démo

**Solution** :
Intégrer vrai audio I/O :

```rust
// Installer cpal pour audio natif
[dependencies]
cpal = "0.15"

// Dans audio_input.rs, remplacer mock par:
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

let host = cpal::default_host();
let device = host.default_input_device()
    .expect("no input device available");
// ... configurer stream
```

---

### 8. Wakeword ne détecte rien

**Symptôme** :
Le mot "TITANE" n'est jamais détecté

**Cause** :
Utilisation du mock qui détecte aléatoirement

**Solution** :
Intégrer vrai moteur de hotword :

```toml
# Option A: Porcupine
[dependencies]
porcupine = "2.0"

# Option B: Vosk
[dependencies]
vosk = "0.3"
```

Voir `VOICE_MODE_LUXE_DUPLEX_GUIDE_v12.md` section "Roadmap"

---

### 9. Performance: FPS < 60

**Symptôme** :
Animations saccadées

**Solutions** :

#### A. Vérifier GPU acceleration
```css
/* Déjà appliqué dans design-system.css */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}
```

#### B. Réduire complexité
```tsx
// Réduire nombre de barres waveform
<WaveformVisualizer barCount={32} /> // Au lieu de 64
```

#### C. Désactiver particules
```tsx
<VoiceCircle audioReactive={false} />
```

---

### 10. Latence > 1000ms

**Symptôme** :
Délai important entre parole et réponse

**Causes & Solutions** :

| Composant | Latence cible | Solution |
|-----------|---------------|----------|
| Wakeword | <200ms | Optimiser VAD threshold |
| ASR | <300ms | Utiliser Whisper.cpp au lieu de cloud |
| IA | <400ms | Cache + streaming responses |
| TTS | <100ms | Piper TTS local |

---

### 11. Erreur Tauri: `invoke handler not found`

**Symptôme** :
```
Error: failed to invoke command: start_duplex
```

**Cause** :
Commandes non enregistrées dans `invoke_handler`

**Solution** :
```rust
// Dans main.rs
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        start_duplex,
        stop_duplex,
        get_duplex_state,
        // ... autres commandes
    ])
```

---

### 12. Thèmes ne changent pas

**Symptôme** :
`data-theme` n'applique pas les styles

**Solution** :
Vérifier que `design-system.css` est bien importé :

```tsx
// Dans App.tsx ou index.tsx
import './styles/design-system.css';

// Changer thème
document.documentElement.setAttribute('data-theme', 'light');
```

---

## 🧪 TESTS DE DIAGNOSTIC

### Test 1: Vérifier installation
```bash
./install_voice_mode_v12.sh
```

### Test 2: Compiler backend
```bash
cd src-tauri
cargo check
cargo test
```

### Test 3: Build frontend
```bash
npm run build
```

### Test 4: Lancer en dev
```bash
npm run tauri dev
```

### Test 5: Tests unitaires
```bash
# Backend
cd src-tauri
cargo test wakeword::tests
cargo test duplex::tests

# Frontend
npm test
```

---

## 📞 SUPPORT

### Logs utiles

```bash
# Logs Rust
RUST_LOG=debug npm run tauri dev

# Logs frontend
npm run dev -- --debug

# Logs Tauri
npm run tauri dev -- --verbose
```

### Vérifier versions

```bash
node --version    # >= 18
npm --version     # >= 9
cargo --version   # >= 1.70
rustc --version   # >= 1.70
```

---

## ✅ CHECKLIST DÉBOGAGE

- [ ] Dépendances système installées (`webkit2gtk-4.1`)
- [ ] `framer-motion` installé (`npm list`)
- [ ] Modules Rust déclarés dans `main.rs`
- [ ] `design-system.css` importé
- [ ] Commandes Tauri enregistrées
- [ ] Tests backend passent (`cargo test`)
- [ ] Build frontend sans erreurs (`npm run build`)
- [ ] Environnement dev fonctionnel (`npm run tauri dev`)

---

**Si le problème persiste après ces solutions, consultez :**
- `VOICE_MODE_LUXE_DUPLEX_GUIDE_v12.md`
- `INVENTAIRE_VOICE_MODE_v12.md`
- GitHub Issues de Tauri: https://github.com/tauri-apps/tauri

---

**TITANE∞ Voice Mode v12 — Troubleshooting Guide**
