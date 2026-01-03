# GUIDE DEPLOYMENT OVERDRIVE v16

**Version :** TITANE∞ v16.1  
**Audience :** Développeurs / Admins Système  
**Durée estimée :** 30-60 minutes (selon config matérielle)

---

## 🎯 OBJECTIF

Ce guide vous accompagne dans le **déploiement complet de TITANE∞ v16 OVERDRIVE** sur Pop!_OS, depuis l'OS vierge jusqu'à l'application prête en production.

---

## ✅ PRÉ-REQUIS

### **Matériel minimum :**

- **CPU** : 4 cores (8 recommandé)
- **RAM** : 8GB (16GB recommandé)
- **Disque** : 50GB libre (SSD recommandé)
- **GPU** : Intel/AMD/NVIDIA (optionnel)
- **Micro + Speakers** : Pour Voice Engine

### **Système :**

- **OS** : Pop!_OS 22.04 ou 24.04 LTS
- **Connexion internet** : Requise (téléchargements ~5GB)
- **Droits sudo** : Nécessaires

---

## 🚀 MÉTHODE 1 : SCRIPT AUTOMATIQUE (RECOMMANDÉ)

### **Étape 1 : Cloner / Ouvrir le projet**

```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
```

### **Étape 2 : Vérifier le script**

```bash
ls -lh scripts/titane_overdrive_v16.sh
# Doit afficher : -rwxr-xr-x ... titane_overdrive_v16.sh
```

Si non exécutable :

```bash
chmod +x scripts/titane_overdrive_v16.sh
```

### **Étape 3 : Exécuter en mode simulation (optionnel)**

```bash
./scripts/titane_overdrive_v16.sh --dry-run
```

**Résultat :** Affiche toutes les actions sans les exécuter. Utile pour prévisualiser.

### **Étape 4 : Lancer le déploiement complet**

```bash
./scripts/titane_overdrive_v16.sh
```

#### **Sections exécutées :**

1. **Setup OS** — Mise à jour système + installation dépendances Tauri/Audio/IA
2. **System Check** — Vérification environnement + auto-fix erreurs
3. **Frontend Build** — `pnpm install` + `pnpm run build`
4. **Backend Build** — `cargo check` + `cargo tauri build`
5. **Voice Engine** — Installation Whisper.cpp + Piper TTS
6. **Chat IA** — Démarrage Ollama + pull modèles (llama3.1, qwen2.5, etc.)
7. **EXP System** — Création base de données XP locale
8. **Project Engine** — Setup indexation projets
9. **Auto-Heal** — Vérification modules + ErrorBoundary
10. **Build Final** — Compilation production + installation système
11. **Validation** — Tests binaire + services + santé
12. **Rapport** — Génération rapport ASCII détaillé

#### **Durée :** 30-60 minutes selon config

### **Étape 5 : Lire le rapport**

```bash
cat logs/deploy/overdrive_report_*.txt
```

**Contenu :**
- Résumé système (OS, CPU, RAM)
- Versions (Node, Rust, Cargo, Tauri)
- Modules Overdrive (8 modules listés)
- Résultat build (Frontend/Backend OK/FAILED)
- Services actifs (Ollama, PipeWire)
- Logs complets

### **Étape 6 : Lancer l'application**

```bash
# Option 1: Binaire installé système
titane

# Option 2: Dev mode
pnpm run tauri dev

# Option 3: Binaire direct
./src-tauri/target/release/titane-infinity
```

---

## 🛠️ MÉTHODE 2 : DÉPLOIEMENT MANUEL

Si vous préférez contrôler chaque étape :

### **1. Mise à jour système**

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### **2. Installer dépendances Tauri**

```bash
sudo apt-get install -y \
    libwebkit2gtk-4.1-dev \
    libsoup-3.0-dev \
    libjavascriptcoregtk-4.1-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libglib2.0-dev \
    build-essential \
    curl \
    wget \
    file
```

### **3. Installer PipeWire (audio)**

```bash
sudo apt-get install -y \
    pipewire \
    wireplumber \
    libpipewire-0.3-dev \
    libsoundio-dev \
    libopus-dev

# Démarrer PipeWire
systemctl --user enable --now pipewire.service
```

### **4. Installer Rust**

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
rustup update stable
rustup default stable
```

### **5. Installer Tauri CLI**

```bash
cargo install tauri-cli --version '^2.0.0'
```

### **6. Installer Node.js**

```bash
# Via nvm (recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
```

### **7. Installer Ollama + modèles**

```bash
# Installer Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Démarrer service
nohup ollama serve > /tmp/ollama.log 2>&1 &

# Pull modèles
ollama pull llama3.1:8b
ollama pull qwen2.5:7b
ollama pull mistral:7b
ollama pull nomic-embed-text
```

### **8. Build Frontend**

```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY

# Nettoyer
rm -rf node_modules dist .vite

# Installer
pnpm install

# Type check
pnpm run type-check

# Build
pnpm run build

# Vérifier
ls -lh dist/
```

### **9. Build Backend**

```bash
cd src-tauri

# Check
cargo check

# Fix warnings
cargo fix --allow-dirty

# Clippy
cargo clippy -- -D warnings

# Build release
cargo tauri build

# Vérifier
ls -lh target/release/titane-infinity
ls -lh target/release/bundle/
```

### **10. Installer système**

```bash
# Copier binaire
sudo cp target/release/titane-infinity /usr/local/bin/titane
sudo chmod +x /usr/local/bin/titane

# Créer structure
sudo mkdir -p /opt/titane/{bin,logs,models,data}
sudo chown -R $USER:$USER /opt/titane

# Copier bundles
cp -r target/release/bundle/* /opt/titane/bin/
```

### **11. Tester**

```bash
# Test version (si implémenté)
titane --version

# Lancer
titane
```

---

## 🔧 TROUBLESHOOTING

### **Problème : Build Tauri échoue avec "WebKitGTK not found"**

**Solution :**

```bash
sudo apt-get install -y libwebkit2gtk-4.1-dev libsoup-3.0-dev
cargo clean
cargo tauri build
```

### **Problème : Ollama ne démarre pas**

**Solution :**

```bash
# Vérifier process
pgrep ollama

# Si absent, démarrer
nohup ollama serve > /tmp/ollama.log 2>&1 &

# Vérifier API
curl http://localhost:11434/api/tags
```

### **Problème : Node version trop ancienne**

**Solution :**

```bash
nvm install 22
nvm use 22
nvm alias default 22
node -v  # Doit afficher v22.x.x
```

### **Problème : Cargo check erreurs Overdrive**

**Solution :**

Vérifier que `main.rs` contient bien :

```rust
mod overdrive;

// Dans fn main()
let overdrive_state = overdrive::init();
.manage(overdrive_state)
.invoke_handler(tauri::generate_handler![
    overdrive::overdrive_health_check,
    // ... toutes les commandes
])
```

### **Problème : PipeWire inactif**

**Solution :**

```bash
# Redémarrer
systemctl --user restart pipewire.service

# Vérifier
systemctl --user status pipewire.service

# Logs
journalctl --user -u pipewire.service
```

---

## 📊 VALIDATION POST-DÉPLOIEMENT

### **Checklist :**

- [ ] `titane` exécutable sans erreur
- [ ] `ollama list` affiche 4 modèles (llama3.1, qwen2.5, mistral, nomic-embed-text)
- [ ] `systemctl --user is-active pipewire.service` → active
- [ ] Frontend dist/ présent (`ls dist/`)
- [ ] Backend binaire présent (`ls src-tauri/target/release/titane-infinity`)
- [ ] Logs propres (`cat logs/deploy/overdrive_*.log`)

### **Test fonctionnel :**

1. Lancer `titane` ou `pnpm run tauri dev`
2. Vérifier UI s'affiche
3. Tester navigation (Dashboard, Chat, Settings, etc.)
4. Tester Chat IA (doit appeler Ollama ou Gemini)
5. Vérifier Auto-Heal (provoquer erreur → reload automatique)

---

## 🎯 UTILISATION POST-DÉPLOIEMENT

### **Lancer l'application :**

```bash
# Prod
titane

# Dev
pnpm run tauri dev
```

### **Activer Voice Engine :**

Dans l'UI TITANE :

1. Aller dans **Settings > Voice**
2. Activer **Voice Engine**
3. Sélectionner modèle ASR : `whisper-base`
4. Sélectionner modèle TTS : `piper`
5. Calibrer micro → Click **Calibrate**
6. Activer **Wake Word Detection** : `TITANE`
7. Sauvegarder

### **Configurer Gemini API (optionnel) :**

1. Aller dans **Settings > AI**
2. Entrer **Gemini API Key**
3. Tester connexion
4. Sauvegarder

### **AutoPilot Projects :**

1. Aller dans **Projects**
2. Ajouter projet : Click **Add Project**
3. Analyser : Click **Analyze**
4. Voir suggestions AutoPilot
5. Activer AutoPilot nocturne : **Settings > AutoPilot > Enable**

---

## 📝 NOTES IMPORTANTES

### **Performances :**

- **Build Vite** : ~1-2s (optimisé)
- **Build Tauri** : ~2-10 minutes (première fois)
- **Ollama inference** : 50-200ms selon modèle
- **Gemini API** : 500-2000ms selon réseau

### **Consommation :**

- **RAM** : 2-4GB en runtime
- **Disque** : ~2GB (frontend + backend + modèles)
- **CPU** : 20-40% en idle, 80-100% pendant inference IA

### **Sécurité :**

- **API Keys** : Stockées en clair pour l'instant (TODO: keyring)
- **IPC** : Validé par Tauri
- **Logs** : Rotation automatique (max 100MB)

---

## 🔄 MISE À JOUR

### **Frontend uniquement :**

```bash
pnpm install
pnpm run build
cargo tauri dev  # Test
```

### **Backend uniquement :**

```bash
cd src-tauri
cargo clean
cargo tauri build
sudo cp target/release/titane-infinity /usr/local/bin/titane
```

### **Complète (re-déploiement) :**

```bash
./scripts/titane_overdrive_v16.sh
```

---

## 📚 RESSOURCES

- **Architecture** : `ARCHITECTURE_OVERDRIVE_v16.md`
- **Changelog** : `CHANGELOG_v16.1_OVERDRIVE.md`
- **Logs** : `logs/deploy/overdrive_*.log`
- **Rapport** : `logs/deploy/overdrive_report_*.txt`

---

## ✉️ SUPPORT

En cas de problème persistant :

1. Consulter logs : `cat logs/deploy/overdrive_*.log`
2. Vérifier rapport : `cat logs/deploy/overdrive_report_*.txt`
3. Tester simulation : `./scripts/titane_overdrive_v16.sh --dry-run`
4. Re-déployer proprement après cleanup manuel

---

**FIN GUIDE DEPLOYMENT OVERDRIVE v16**
