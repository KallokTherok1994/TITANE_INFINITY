# 📦 Guide d'Installation — TITANE∞ v19.4.3

Ce guide vous accompagne étape par étape pour installer TITANE∞ sur votre machine.

---

## ⚡ Installation Rapide (5 minutes)

### Prérequis

- **Node.js** ≥ 18.0 (recommandé: v20 LTS)
- **npm** ≥ 9.0 ou **pnpm** ≥ 8.0
- **Rust** ≥ 1.75 (pour développement)
- **OS supportés**: Linux, macOS, Windows 10/11

### Vérifier les prérequis

```bash
node --version   # doit afficher v18+ ou v20+
npm --version    # doit afficher 9+
cargo --version  # doit afficher 1.75+
```

---

## 📥 Installation Standard

### 1. Cloner le dépôt

```bash
# Via HTTPS
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git

# Ou via SSH (recommandé)
git clone git@github.com:KallokTherok1994/TITANE_INFINITY.git

cd TITANE_INFINITY
```

### 2. Installer les dépendances

```bash
# Avec npm
pnpm install

# Ou avec pnpm (plus rapide)
pnpm install
```

**Temps estimé**: 2-3 minutes (selon votre connexion)

### 3. Configuration de l'environnement

```bash
# Copier le fichier d'environnement template
cp .env.example .env

# Éditer avec votre éditeur préféré
nano .env   # ou: code .env, vim .env
```

**Variables essentielles**:

```env
# API OpenAI (optionnel si vous utilisez des modèles locaux)
VITE_OPENAI_API_KEY=sk-...

# Base de données
VITE_DATABASE_PATH=./data/titane.db

# Sécurité
VITE_ENCRYPTION_KEY=votre_clé_256bits_ici

# Dossier de stockage
VITE_STORAGE_PATH=./user_data
```

### 4. Build et lancement

```bash
# Build du frontend + backend
pnpm run build

# Lancer l'application
pnpm run tauri dev
```

**Temps estimé**: 30-60 secondes au premier lancement

---

## 🐧 Installation Linux

### Ubuntu/Debian

```bash
# Installer les dépendances système
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Installer Rust (si non présent)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Installer Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Suivre les étapes d'installation standard ci-dessus
```

### Arch Linux

```bash
# Installer les dépendances
sudo pacman -S --needed webkit2gtk-4.1 \
    base-devel \
    curl \
    wget \
    openssl \
    appmenu-gtk-module \
    libappindicator-gtk3 \
    librsvg

# Installer Rust + Node.js
sudo pacman -S rust nodejs npm

# Suivre les étapes d'installation standard
```

---

## 🍎 Installation macOS

### Via Homebrew

```bash
# Installer Homebrew (si non présent)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer les dépendances
brew install node
brew install rust

# Suivre les étapes d'installation standard
```

---

## 🪟 Installation Windows

### Via winget

```powershell
# Installer Node.js
winget install OpenJS.NodeJS.LTS

# Installer Rust
winget install Rustlang.Rust.GNU

# Redémarrer le terminal puis suivre les étapes standard
```

### Via installateurs manuels

1. **Node.js**: Télécharger depuis [nodejs.org](https://nodejs.org/)
2. **Rust**: Télécharger depuis [rustup.rs](https://rustup.rs/)
3. Redémarrer le terminal
4. Suivre les étapes d'installation standard

---

## 🐳 Installation Docker (Optionnel)

```bash
# Build de l'image
docker build -t titane-infinity:latest .

# Lancer le conteneur
docker run -d \
    -p 5173:5173 \
    -v $(pwd)/user_data:/app/user_data \
    -v $(pwd)/data:/app/data \
    --name titane \
    titane-infinity:latest

# Accéder à l'application
open http://localhost:5173
```

---

## 🔧 Configuration Avancée

### Activer les modèles locaux (Ollama)

```bash
# Installer Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Télécharger un modèle
ollama pull llama3.2:3b

# Vérifier que le service tourne
curl http://localhost:11434/api/tags
```

Dans TITANE∞, sélectionnez **Ollama** dans les paramètres IA.

### Configurer le Vault chiffré

```bash
# Générer une clé de chiffrement forte
openssl rand -base64 32

# Ajouter dans .env
VITE_ENCRYPTION_KEY=<votre_clé_générée>

# Définir le chemin du vault
VITE_VAULT_PATH=./user_data/vault
```

### Optimiser les performances

```env
# .env - Configuration performance
VITE_IPC_TIMEOUT=5000
VITE_MAX_MEMORY_MB=512
VITE_ENABLE_PROFILER=true
VITE_LOG_LEVEL=info
```

---

## ✅ Vérification de l'installation

### Tests de base

```bash
# Exécuter les tests
pnpm test

# Vérifier la compilation Rust
cd src-tauri && cargo check

# Vérifier le build frontend
pnpm run build
```

### Checklist post-installation

- [ ] L'application démarre en <5 secondes
- [ ] Le chat IA répond correctement
- [ ] La base de données SQLite se crée dans `./data/`
- [ ] Les logs s'affichent dans la console
- [ ] Aucune erreur critique dans les DevTools

---

## ❌ Dépannage

### Erreur: "Command not found: tauri"

```bash
# Installer Tauri CLI globalement
pnpm install -g @tauri-apps/cli

# Ou utiliser via npx
npx tauri dev
```

### Erreur: "Failed to initialize database"

```bash
# Vérifier les permissions
chmod 755 ./data
chmod 644 ./data/titane.db

# Recréer la base
rm ./data/titane.db
pnpm run tauri dev
```

### Erreur: "WebView2 not found" (Windows)

```powershell
# Installer WebView2 Runtime
winget install Microsoft.EdgeWebView2Runtime
```

### Performances dégradées

```bash
# Nettoyer les caches
rm -rf node_modules/.vite
rm -rf src-tauri/target/debug

# Rebuild propre
pnpm run clean
pnpm install
pnpm run build
```

---

## 🚀 Prochaines Étapes

Une fois l'installation terminée:

1. **Démarrage rapide**: Consultez [quickstart.md](./quickstart.md)
2. **Configuration IA**: Voir [features/chat.md](./features/chat.md)
3. **Personnalisation**: Voir [tutorials/configuration.md](./tutorials/configuration.md)

---

## 💬 Besoin d'Aide ?

- **Discord**: [discord.gg/titane-infinity](https://discord.gg/titane-infinity)
- **GitHub Issues**: [github.com/KallokTherok1994/TITANE_INFINITY/issues](https://github.com/KallokTherok1994/TITANE_INFINITY/issues)
- **Email**: support@titane-infinity.dev

---

**Installation réussie ?** 🎉 Passez au [Guide de Démarrage Rapide](./quickstart.md) !
