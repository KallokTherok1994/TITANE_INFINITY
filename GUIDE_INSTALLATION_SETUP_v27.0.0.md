# 🚀 TITANE∞ — GUIDE D'INSTALLATION & SETUP v27.0.0

**Version:** 27.0.0 | **Date:** 31 Janvier 2026

---

## 📖 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Installation Linux](#installation-linux)
3. [Installation macOS](#installation-macos)
4. [Installation Windows](#installation-windows)
5. [Configuration Initiale](#configuration-initiale)
6. [Setup Providers IA](#setup-providers-ia)
7. [Optimisation Performance](#optimisation-performance)
8. [Troubleshooting Installation](#troubleshooting-installation)

---

## 📋 PRÉREQUIS

### Configuration Minimale

```
CPU:        2 GHz (4 cores recommandés)
RAM:        512 MB (4 GB recommandés)
Disque:     500 MB espace libre
Résolution: 1024x768 minimum (1920x1080 optimal)
```

### Configuration Recommandée (Production)

```
CPU:        Intel i5+ / AMD Ryzen 5+
RAM:        8 GB
Disque:     SSD, 2 GB espace
Résolution: 1920x1080 ou supérieur
Internet:   Optionnel (pour providers cloud)
```

### Dépendances Système

#### Linux (Ubuntu/Debian)

```bash
# Mettre à jour packages
sudo apt update && sudo apt upgrade -y

# Dépendances essentielles
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev

# Dépendances optionnelles (recommandées)
sudo apt install -y \
    ffmpeg \
    sox
```

#### macOS

```bash
# Installer Xcode Command Line Tools
xcode-select --install

# Via Homebrew (recommandé)
brew install git curl
```

#### Windows 10/11

```powershell
# Via chocolatey (si installé)
choco install git curl

# Ou téléchargez manuellement:
# - Git: https://git-scm.com/download/win
# - curl: https://curl.se/download.html
```

---

## 🐧 INSTALLATION LINUX

### Méthode 1 : AppImage (Recommandée)

**Avantages:** Facile, pas de dépendances, portable

```bash
# 1. Télécharger
cd ~/Downloads
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.0/Titan-Stable_27.0.0_amd64.AppImage

# 2. Rendre exécutable
chmod +x Titan-Stable_27.0.0_amd64.AppImage

# 3. Lancer
./Titan-Stable_27.0.0_amd64.AppImage
```

**Durée:** ~2 minutes

### Méthode 2 : Package APK/DEB

**Précondition:** Ubuntu 20.04+ ou Debian 11+

```bash
# Télécharger le .deb
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.0/titane-infinity_27.0.0_amd64.deb

# Installer
sudo dpkg -i titane-infinity_27.0.0_amd64.deb

# Ou via apt (si repository activé)
sudo apt install titane-infinity

# Lancer
titane-infinity
# Ou via menu applications
```

**Durée:** ~1 minute

### Méthode 3 : Build from Source

**Pour developers & contributeurs**

```bash
# 1. Cloner repo
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 2. Installer Node.js (18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 4. Installer dépendances frontend
pnpm install  # ou npm install

# 5. Build production
pnpm run build  # crée dist/

# 6. Build Tauri (desktop app)
pnpm run tauri build

# 7. AppImage résultant
ls src-tauri/target/release/bundle/appimage/Titan-Stable_*.AppImage
```

**Durée:** ~10-15 minutes (première fois)

---

## 🍎 INSTALLATION macOS

### Méthode 1 : DMG (Recommandée)

**Pour utilisateurs non-techniques**

```bash
# 1. Télécharger
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.0/Titan-Stable_27.0.0_x64.dmg

# 2. Monter le DMG
open Titan-Stable_27.0.0_x64.dmg

# 3. Drag-drop dans Applications
# Apparaît dans le DMG automount

# 4. Lancer depuis Launchpad ou Applications
open /Applications/TITANE.app
```

**Durée:** ~2 minutes

### Méthode 2 : Homebrew

**Si vous utilisez Homebrew**

```bash
# Installer (si tap disponible)
brew tap KallokTherok1994/titane
brew install titane

# Lancer
titane
```

### Méthode 3 : Build M1/M2 (Apple Silicon)

```bash
# Sur Mac Apple Silicon (M1/M2)
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# Installer Rust (auto-détecte ARM64)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Node
brew install node@18

# Installer dépendances
pnpm install

# Build pour M1/M2
pnpm run tauri build  # Auto-détecte arch

# Résultat
ls src-tauri/target/release/bundle/macos/
```

---

## 🪟 INSTALLATION WINDOWS

### Méthode 1 : MSI Installer (Recommandée)

**Pour utilisateurs Windows standard**

```powershell
# 1. Télécharger MSI
Invoke-WebRequest -Uri "https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.0/Titan-Stable_27.0.0_x64.msi" `
  -OutFile "$env:USERPROFILE\Downloads\Titan-Stable_27.0.0_x64.msi"

# 2. Lancer l'installateur
& "$env:USERPROFILE\Downloads\Titan-Stable_27.0.0_x64.msi"

# 3. Suivre l'assistant (Next → Next → Finish)

# 4. TITANE apparaît dans Start Menu
```

**Durée:** ~2-3 minutes

### Méthode 2 : Portable EXE

```powershell
# 1. Télécharger ZIP portable
Invoke-WebRequest -Uri "https://github.com/.../Titan-Stable_27.0.0_portable.zip" `
  -OutFile "TITANE_portable.zip"

# 2. Extraire
Expand-Archive "TITANE_portable.zip" -DestinationPath "$env:USERPROFILE\TITANE"

# 3. Lancer
& "$env:USERPROFILE\TITANE\TITANE.exe"

# Avantage: Pas d'installation, fonctionnez immédiatement
```

### Méthode 3 : Winget (Windows 11+)

```powershell
# Si winget est disponible
winget install titane.titane-infinity

# Lancer
titane
```

### Méthode 4 : Build from Source

**Pour developers Windows**

```powershell
# 1. Installer Rust
# Visitez: https://rustup.rs/
# Téléchargez & lancez: rustup-init.exe

# 2. Installer Node.js
# Visitez: https://nodejs.org/
# Téléchargez & installez LTS (18.x)

# 3. Installer pnpm
npm install -g pnpm

# 4. Cloner repo
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 5. Installer dépendances
pnpm install

# 6. Build
pnpm run tauri build

# 7. MSI résultant
ls src-tauri\target\release\bundle\msi\
```

**Durée:** ~15-20 minutes (première fois)

---

## ⚙️ CONFIGURATION INITIALE

💡 **Après configuration:** Découvrez toutes les fonctionnalités dans le [Manuel Utilisateur Complet](./MANUEL_UTILISATEUR_COMPLET_v27.0.0.md).

💡 **Pour les concepts détaillés:** Consultez la [section Paramètres du Manuel](./MANUEL_UTILISATEUR_COMPLET_v27.0.0.md#paramètres--personnalisation) pour personnalisation avancée.

### Premier Lancement

Au premier démarrage, TITANE affiche un **Setup Wizard** (assistant):

```
┌──────────────────────────────────────────────┐
│  Bienvenue dans TITANE∞ v27.0.0             │
│                                              │
│  🎯 Étape 1/4: Accepter Conditions         │
└──────────────────────────────────────────────┘

Veuillez lire & accepter:
□ Conditions d'Utilisation (FR)
□ Politique de Confidentialité
□ Licence Propriétaire

[Refuser]  [Accepter & Continuer]
```

**Parcourez les 4 étapes:**

1. **Conditions d'Utilisation** — Lisez & acceptez
2. **Configuration Profil** — Votre nom, email, rôle
3. **Provider IA** — Choisir : Ollama, Gemini, Local?
4. **Mémoire** — Initialiser base de données

### Étape 1: Conditions Légales

```
✅ Lire tous les termes
✅ Cocher les 3 cases
✅ Cliquer [Accepter & Continuer]
```

**Fichiers créés:**
```
~/.titane/
  ├─ config.json (configuration)
  ├─ memory/ (base de données)
  └─ logs/ (fichiers log)
```

### Étape 2: Profil Utilisateur

```
┌──────────────────────────────────────┐
│ 📋 Étape 2/4: Configuration Profil  │
├──────────────────────────────────────┤
│                                      │
│ Prénom: _________ Alice              │
│ Nom: _______________ Dubois         │
│                                      │
│ Email: __________________ │
│ alice@example.com       │
│                                      │
│ Rôle:                                │
│ ○ Développeur    ○ Créatif         │
│ ○ Manager        ○ Étudiant        │
│ ○ Chercheur      ○ Autre           │
│                                      │
│ Langue: [Français ▼]               │
│ Timezone: [Europe/Paris ▼]        │
│                                      │
│            [Précédent] [Continuer] │
│                                      │
└──────────────────────────────────────┘
```

**Remplissez sincèrement** (utilisé pour personnalisation):
- Votre nom complet
- Email valide (optionnel mais recommandé)
- Rôle principal
- Langue préférée

### Étape 3: Provider IA

```
┌──────────────────────────────────────────┐
│ 🧠 Étape 3/4: Sélectionner Provider IA  │
├──────────────────────────────────────────┤
│                                          │
│ Quel fournisseur IA voulez-vous?        │
│                                          │
│ ○ Ollama (Local, gratuit)               │
│  └ Recommandé! Privé & rapide          │
│  └ Nécessite: https://ollama.com       │
│                                          │
│ ○ Gemini API (Google Cloud)             │
│  └ Performant mais cloud                │
│  └ Nécessite: API Key                   │
│                                          │
│ ○ Local Provider (Fallback)             │
│  └ Toujours disponible                 │
│  └ Basique mais fiable                  │
│                                          │
│ [Recommandations d'installation]        │
│                                          │
│      [Précédent] [Continuer]           │
│                                          │
└──────────────────────────────────────────┘
```

**Choix recommandé: Ollama**
- Priv- acité maximale (local)
- Performance excellente
- Gratuit
- Open-source

**Si vous choisissez Ollama:**
```
1. Visitez: https://ollama.com
2. Téléchargez & installez pour votre OS
3. Lancez: ollama serve
4. TITANE détecte automatiquement
```

### Étape 4: Initialisation Mémoire

```
┌────────────────────────────────────────┐
│ 💾 Étape 4/4: Initialiser Mémoire     │
├────────────────────────────────────────┤
│                                        │
│ ✅ Création base de données STM       │
│ ✅ Création cache MTM                 │
│ ✅ Initialisation LTM vault           │
│ ✅ Configuration encryption (AES-256) │
│                                        │
│ Prêt! TITANE va démarrer...          │
│                                        │
│      [Terminer Setup]                 │
│                                        │
└────────────────────────────────────────┘
```

Cliquez [Terminer Setup] et c'est parti! 🚀

---

## 🔧 SETUP PROVIDERS IA

💡 **Exemples pratiques:** Voir [Tutoriel #1 : Première Conversation](./TUTORIELS_PRACTIQUES_EXEMPLES_v27.0.0.md#tuto-1-première-conversation-3-min) pour tester votre provider après configuration.

### Provider: Ollama (Local)

**Configuration Optimale**

```bash
# 1. Installer Ollama
# Linux/Mac/Windows: https://ollama.com/download

# 2. Lancer le serveur
ollama serve

# 3. Dans un autre terminal, télécharger un modèle
ollama pull llama2:latest  # Modèle par défaut (~4GB)
# OU
ollama pull mistral:latest # Modèle alternatif (~5GB)
# OU
ollama pull neural-chat   # Optimisé conversation

# 4. TITANE auto-détecte sur http://localhost:11434
```

**Vérifier la connexion:**
```bash
curl http://localhost:11434/api/version
# Doit retourner: {"version": "..."}
```

**Settings TITANE:**
```
Settings → Providers IA
✅ Ollama: http://localhost:11434
   Modèle: llama2:latest ✅ Connecté
```

**Performance:**
- Latence: ~2-5 secondes par réponse
- GPU acéléré: ~500ms si NVIDIA CUDA
- CPU: ~5-10 secondes

### Provider: Gemini API (Google)

**Pour utiliser Claude/GPT-style cloud**

```bash
# 1. Créer compte Google Cloud
# Visitez: https://cloud.google.com

# 2. Créer projet & activer Generative AI API
# Console: https://console.cloud.google.com

# 3. Créer API Key
# Visitez: https://aistudio.google.com/app/apikey

# 4. Copier la clé
GEMINI_API_KEY="sk-..."
```

**Configuration TITANE:**
```
Settings → Providers IA → + Ajouter

Type: Gemini API
API Key: [Coller votre clé]
Model: gemini-pro
Temperature: 0.7

[Tester] → ✅ Connecté!
```

**Tarification:**
- Gratuit: ~100 requêtes/jour
- Payant: $0.00025 per 1K input tokens

### Provider: Local (Builtin)

**Toujours Disponible (Fallback)**

Aucune configuration nécessaire! C'est le fallback ultime.

```
Avantage: Jamais d'erreur "provider down"
Qualité: Basique mais fiable
Latence: ~1 second (très rapide)
```

---

## ⚡ OPTIMISATION PERFORMANCE

💡 **Benchmarks détaillés:** Consultez la [section Performance du Manuel](./MANUEL_UTILISATEUR_COMPLET_v27.0.0.md#⚡-performance--optimisation) pour comparatifs complets par provider et mode.

### Régler Température IA

**Impact:** Change créativité vs déterminisme

```
Settings → Chat

Température: [========●] 0.7 (défaut)

Recommandations:
• Développement/Code: 0.3-0.5 (déterministe)
• Normal/Chat: 0.7 (équilibré) ← Recommandé
• Brainstorming: 0.9-1.0 (créatif)
```

### Réduire Tokens Max

**Impact:** Réponses plus courtes = plus rapides

```
Settings → Chat

Max Tokens: [======●] 3000

Diminuer à 2000 si:
- Réponses trop lentes
- RAM limitée
- Modèle lent (Ollama CPU)

Augmenter à 4000 si:
- Vous avez besoin de réponses longues
- RAM disponible (8GB+)
- Modèle rapide (GPU CUDA)
```

### Optimiser Ollama

**Pour performance maximale:**

```bash
# Utilisez un modèle rapide (7B plutôt que 13B)
ollama pull mistral:7b       # ⚡ Rapide
ollama pull neural-chat:7b   # ⚡ Conversation
ollama pull tinyllama        # ⚡ Très léger

# Pas: llama2:13b (trop lourd)
```

### GPU Acceleration

**Si vous avez NVIDIA GPU:**

```bash
# Installer CUDA support pour Ollama
# Visitez: https://ollama.com/download

# TITANE utilisera automatiquement GPU
# Performance: 10-100x plus rapide!

# Vérifier utilisation GPU
nvidia-smi
# Doit montrer ollama utilisant vRAM
```

### Cache & Mémoire

**Nettoyer cache périodiquement:**

```bash
Settings → Memory → STM → [Effacer]
# Cela ne supprime pas les conversations, juste cache

Settings → Memory → [Export/Import]
# Pour backup régulier
```

---

## 🐛 TROUBLESHOOTING INSTALLATION

### "AppImage ne démarre pas (Linux)"

**Symptôme:** Erreur permission ou FUSE manquant

**Solution 1 — Vérifier permissions:**
```bash
chmod +x Titan-Stable_27.0.0_amd64.AppImage
./Titan-Stable_27.0.0_amd64.AppImage --help
```

**Solution 2 — Installer FUSE:**
```bash
# Ubuntu/Debian
sudo apt install fuse libfuse2

# Fedora/RHEL
sudo dnf install fuse libfuse
```

**Solution 3 — Extraire & lancer:**
```bash
# Extraire AppImage
./Titan-Stable_27.0.0_amd64.AppImage --appimage-extract
cd squashfs-root
./AppRun
```

### "Ollama: connection refused"

**Symptôme:** TITANE ne trouve pas Ollama

**Vérifications:**
```bash
# 1. Ollama en train de tourner?
ps aux | grep ollama
# Doit montrer: ollama serve

# 2. Port 11434 actif?
netstat -tlnp | grep 11434
# Doit montrer: LISTEN on :11434

# 3. Test connexion manuelle
curl http://localhost:11434/api/version
# Doit retourner JSON

# 4. Relancer Ollama
ollama serve
```

**Solution:**
```bash
# Tuer tous les processu Ollama
pkill -9 ollama

# Relancer
ollama serve

# TITANE re-détecte automatiquement
```

### "Pas assez de RAM"

**Symptôme:** TITANE très lent ou crash

**Diagnostic:**
```bash
free -h  # Voir RAM disponible
```

**Solutions:**
1. **Réduire Token Max:** Settings → Chat → 2000 (au lieu 3000)
2. **Fermer autres apps:** Chrome, Slack, etc. consomment RAM
3. **Utiliser modèle léger:** Ollama → `tinyllama` (1.1GB)
4. **Upgrade RAM:** Si sérieux, ajouter 4GB+

### "GPU not detected (Ollama)"

**Symptôme:** Ollama utilise CPU même avec GPU NVIDIA

**Vérifications:**
```bash
nvidia-smi  # NVIDIA GPU présent?
# Doit lister votre GPU

nvidia-smi -l 1  # Monitor GPU en live
```

**Solutions:**
```bash
# Installer Ollama avec CUDA support
# Visitez: https://ollama.com
# Re-download pour version GPU

# Redémarrer Ollama
pkill ollama
ollama serve

# Vérifier nvidia-smi
# GPU vRAM doit augmenter
```

### "Gemini API Key invalid"

**Symptôme:** "API Key rejected"

**Vérifications:**
```bash
# 1. Clé copiée correctement?
# Vérifiez: aucun espace extra

# 2. Clé valide?
# Visitez: https://aistudio.google.com/app/apikey
# Vérifiez que clé est active

# 3. API Generative AI activée?
# Google Cloud Console → APIs → Generative AI API
# Status doit être: ENABLED
```

**Solution:**
```bash
# Générer nouvelle clé
1. Visitez: https://aistudio.google.com/app/apikey
2. Cliquez [Create API Key]
3. Copie-colle dans Settings
4. [Tester] → ✅
```

### "Démarrage très lent (10+ secondes)"

**Causes possibles:**
- Disque dur lent (SSD recommandé)
- Trop de cache accumulé
- Mémoire fragmentée

**Solutions:**
```bash
# 1. Nettoyer cache
rm -rf ~/.titane/cache

# 2. Réinitialiser STM
Settings → Memory → STM → [Effacer]

# 3. Défragmenter (Linux)
sudo fstrim -v /

# 4. Migrer sur SSD si HDD
```

### "Build from Source échoue (Rust)"

**Symptôme:** Erreur lors de `pnpm run tauri build`

```bash
# 1. Mettre à jour Rust
rustup update

# 2. Installer dépendances
# Voir section "Prérequis" pour votre OS

# 3. Nettoyer cache Rust
cargo clean

# 4. Re-build
pnpm run tauri build
```

---

## 🎯 CONFIGURATIONS AVANCÉES

### Build Optimisé pour Production

Pour créer une build ultra-optimisée:

```bash
# Linux - Optimisation maximale
RUSTFLAGS="-C target-cpu=native -C opt-level=3" \
  pnpm run tauri build --release

# Résultat:
# - Binary size: ~15 MB (vs 25 MB standard)
# - Startup time: 400ms (vs 585ms)
# - CPU usage: -20%
```

### Configuration Multi-Provider

Configurez plusieurs providers simultanément:

```toml
# ~/.titane/config.toml

[providers.gemini]
enabled = true
api_key_encrypted = "..."
model = "gemini-pro"
temperature = 0.7
max_tokens = 2048

[providers.ollama]
enabled = true
endpoint = "http://localhost:11434"
model = "llama2"
temperature = 0.8
context_window = 4096

[providers.local]
enabled = true
fallback = true  # Utilisé si autres échouent
```

### Déploiement Entreprise

#### Installation Silencieuse (Linux/Windows)

```bash
# Linux (DEB) - Silent install
sudo DEBIAN_FRONTEND=noninteractive \
  apt-get install -y ./titan-stable_27.0.0_amd64.deb

# Windows (MSI) - Silent install
msiexec /i Titan-Stable_27.0.0.msi /quiet /norestart

# Configuration automatique
titane-infinity --init-config --profile=enterprise
```

#### Configuration Centralisée

```yaml
# /etc/titane/enterprise.yaml

organization:
  name: "Votre Entreprise"
  policy:
    allowed_providers: ["ollama"]  # Pas de cloud
    encryption_required: true
    telemetry: false
    auto_updates: false

restrictions:
  file_upload_max_size: 10485760  # 10 MB
  memory_retention_days: 90
  export_allowed: false

compliance:
  gdpr: true
  iso27001: true
  log_retention_days: 365
```

### Haute Disponibilité (HA)

Configuration cluster pour grande entreprise:

```yaml
# cluster.yaml

mode: ha
nodes:
  - id: node1
    hostname: titane-01.local
    role: master
    ip: 192.168.1.10
  
  - id: node2
    hostname: titane-02.local
    role: replica
    ip: 192.168.1.11
  
  - id: node3
    hostname: titane-03.local
    role: replica
    ip: 192.168.1.12

loadbalancer:
  algorithm: round-robin
  health_check_interval: 30s
  failover_timeout: 5s

database:
  replicated: true
  sync_mode: synchronous
  backup_interval: 6h
```

---

## 🌐 INTÉGRATIONS

### Docker Deployment

```dockerfile
# Dockerfile
FROM rust:1.75 AS builder

WORKDIR /app
COPY . .

RUN rustup target add x86_64-unknown-linux-gnu
RUN cargo build --release

FROM ubuntu:22.04
COPY --from=builder /app/target/release/titane-infinity /usr/bin/
COPY --from=builder /app/dist /app/dist

EXPOSE 8080
CMD ["titane-infinity", "--server"]
```

```bash
# Build image
docker build -t titane-infinity:27.0.0 .

# Run container
docker run -d \
  --name titane \
  -p 8080:8080 \
  -v titane-data:/data \
  titane-infinity:27.0.0
```

### Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: titane-infinity
spec:
  replicas: 3
  selector:
    matchLabels:
      app: titane
  template:
    metadata:
      labels:
        app: titane
    spec:
      containers:
      - name: titane
        image: titane-infinity:27.0.0
        ports:
        - containerPort: 8080
        env:
        - name: TITANE_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        volumeMounts:
        - name: titane-storage
          mountPath: /data
      volumes:
      - name: titane-storage
        persistentVolumeClaim:
          claimName: titane-pvc
```

### CI/CD Pipeline

```yaml
# .github/workflows/build.yml
name: Build TITANE

on:
  push:
    branches: [MAIN]
  pull_request:
    branches: [MAIN]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build Tauri
        run: pnpm run tauri build
      
      - name: Run tests
        run: cargo test --all
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: titane-${{ matrix.os }}
          path: src-tauri/target/release/bundle/
```

---

## 📊 MÉTRIQUES & MONITORING

### Prometheus Integration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'titane'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

```rust
// src-tauri/src/metrics.rs
use prometheus::{Counter, Gauge, Histogram};

lazy_static! {
    static ref CHAT_REQUESTS: Counter = Counter::new(
        "titane_chat_requests_total",
        "Total chat requests"
    ).unwrap();
    
    static ref MEMORY_USAGE: Gauge = Gauge::new(
        "titane_memory_bytes",
        "Memory usage in bytes"
    ).unwrap();
    
    static ref RESPONSE_TIME: Histogram = Histogram::new(
        "titane_response_time_seconds",
        "Response time distribution"
    ).unwrap();
}
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "TITANE∞ Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(titane_chat_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "targets": [
          {
            "expr": "titane_memory_bytes / 1024 / 1024"
          }
        ]
      },
      {
        "title": "P95 Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, titane_response_time_seconds)"
          }
        ]
      }
    ]
  }
}
```

---

## ✅ CHECKLIST APRÈS INSTALLATION

Avant d'utiliser TITANE en production:

- [ ] ✅ TITANE démarre sans erreur
- [ ] ✅ First chat fonctionne
- [ ] ✅ Provider IA connecté (vérifier /status)
- [ ] ✅ Caméra détectée (si Vision activé)
- [ ] ✅ Mémoire initialisée
- [ ] ✅ Impossible de trouver des erreurs dans les logs
- [ ] ✅ Performance acceptable (réponses < 5s)
- [ ] ✅ Export mémoire fonctionne
- [ ] ✅ Backup initial réalisé
- [ ] ✅ Raccourcis clavier appris (5 essentiels)
- [ ] ✅ Configuration monitoring (si prod)
- [ ] ✅ Politique backup définie

---

## 🎓 RESSOURCES COMPLÉMENTAIRES

### Documentation

- 📚 **Manuel Utilisateur:** `MANUEL_UTILISATEUR_COMPLET_v27.0.0.md`
- 🎓 **Tutoriels:** `TUTORIELS_PRACTIQUES_EXEMPLES_v27.0.0.md`
- 📖 **Index Documentation:** `DOCUMENTATION_INDEX_v27.0.0.md`
- 🔧 **API Reference:** `/docs/06_api/TAURI_COMMANDS_REFERENCE.md`

### Support

- 💬 **Discord Community:** `discord.gg/titane`
- 🐛 **Issue Tracker:** `github.com/KallokTherok1994/TITANE_INFINITY/issues`
- 📧 **Email Support:** `support@titane.dev`
- 📺 **Video Tutorials:** `youtube.com/@titane-infinity`

### Liens Utiles

- 🌐 **Website:** `titane-infinity.dev`
- 📦 **Releases:** `github.com/KallokTherok1994/TITANE_INFINITY/releases`
- 📝 **Blog:** `blog.titane-infinity.dev`
- 🎨 **Design System:** `/docs/design/`

---

**TITANE∞ v27.0.0 — Guide Installation & Setup Complet**
*Créé: 31 Janvier 2026 | Validé par Kevin Thibault*
*Dernière mise à jour: 31 Janvier 2026 | Version: 27.0.0*
*Pour support détaillé: support@titane.dev ou Discord community*
*Copyright © 2025 Humain Total / TITANE Team. Tous droits réservés.*
