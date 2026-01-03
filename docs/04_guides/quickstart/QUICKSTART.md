# 🚀 TITANE∞ — Guide de Démarrage Rapide

**Version:** v24.2.0  
**Date:** 15 décembre 2025  
**Status:** Production Ready

---

## 📋 Table des Matières

1. [Installation Rapide (5 min)](#installation-rapide-5-min)
2. [Premier Lancement](#premier-lancement)
3. [Chat IA - Premiers Pas](#chat-ia---premiers-pas)
4. [Features Essentielles](#features-essentielles)
5. [Dépannage](#dépannage)

---

## ⚡ Installation Rapide (5 min)

### Prérequis

- **OS:** Ubuntu 24.04 LTS (recommandé) ou compatible Linux
- **Node.js:** v20+ (LTS)
- **Rust:** 1.75+
- **Espace disque:** 5 GB minimum

### Vérification Rapide

```bash
node --version   # v20.x.x ou supérieur
cargo --version  # 1.75+ ou supérieur
```

### Installation Complète (Ubuntu 24.04)

```bash
# 1. Télécharger script d'installation
wget https://raw.githubusercontent.com/KallokTherok1994/TITANE_INFINITY/main/TITANE_POST_INSTALL_UBUNTU.sh
chmod +x TITANE_POST_INSTALL_UBUNTU.sh

# 2. Exécuter installation automatique
./TITANE_POST_INSTALL_UBUNTU.sh

# 3. Recharger environnement
source ~/.bashrc
```

**Ce qui est installé:**
- ✅ Git, curl, build-essential
- ✅ Rust (stable + nightly)
- ✅ Node.js LTS via NVM
- ✅ Dépendances Tauri v2 (WebKit2GTK 4.1, GTK3, ALSA)
- ✅ VSCode + extensions (rust-analyzer, Tauri, ESLint)
- ✅ Repository TITANE∞ cloné dans `~/Projets/TITANE_INFINITY`
- ✅ Dépendances npm installées

**Durée:** 10-15 minutes (selon connexion)

### Installation Manuelle (Autres OS)

```bash
# 1. Cloner le repository
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 2. Installer dépendances
pnpm install

# 3. Configurer environnement Python (optionnel pour TTS)
./scripts/setup_environment.sh
```

---

## 🎯 Premier Lancement

### Mode Développement (Titan-Dev)

```bash
cd ~/Projets/TITANE_INFINITY  # ou chemin custom

# Méthode 1: Script dédié
./runtime/dev/run-dev.sh

# Méthode 2: npm
pnpm run dev:tauri

# Méthode 3: VSCode Task
# Ouvrir VSCode → Terminal → Run Task → "🟢 Launch Titan-Dev"
```

**Résultat attendu:**

```
✓ Vite ready in 290 ms
➜  Local:   http://localhost:1420/
✓ Tauri running target/debug/titane-infinity
🚀 TITANE∞ v24.2.0 starting...
✅ Database initialized: ./data/titane.db
✅ Frontend ready
⚡ Ready in 1.2s
```

L'application s'ouvre automatiquement dans une fenêtre native.

### Mode Production (Titan-Stable)

```bash
# Build optimisé pour production
./runtime/stable/build.sh

# Ou via npm
pnpm run build

# Ou via VSCode Task
# "🔵 Build Titan-Stable"
```

**Résultat:** AppImage dans `src-tauri/target/release/bundle/`

---

## 💬 Chat IA - Premiers Pas

### 1. Accéder au Chat

1. Lancer TITANE∞ (voir [Premier Lancement](#premier-lancement))
2. Dans le menu principal, cliquer sur **"Chat IA"**
3. Vous arrivez sur l'interface de conversation

### 2. Configurer un Provider IA

TITANE∞ supporte **4 providers** :

#### 🟢 **Ollama (Recommandé - Local & Gratuit)**

**Avantages:**
- ✅ 100% local (privacy totale)
- ✅ Gratuit
- ✅ Pas besoin d'API key
- ✅ 10+ modèles disponibles

**Installation Ollama:**

```bash
# Linux/Mac
curl https://ollama.ai/install.sh | sh

# Démarrer service
ollama serve

# Installer un modèle
ollama pull llama3.2
```

**Modèles recommandés:**
- `llama3.2:latest` - Conversation générale (4.7 GB)
- `llama3.1:latest` - Haute qualité (4.9 GB)
- `deepseek-coder-v2` - Spécialisé code (8.9 GB)
- `codellama:latest` - Meta code (3.8 GB)

**Dans TITANE∞:**
1. Sélectionner **"Ollama"** dans le dropdown provider
2. Choisir le modèle (ex: `llama3.2`)
3. Commencer à chatter !

---

#### 🔵 **Gemini (Cloud - Google)**

**Configuration:**

1. **Obtenir API Key:**
   - Aller sur https://makersuite.google.com/app/apikey
   - Créer une clé API
   - Copier la clé

2. **Dans TITANE∞:**
   - Ouvrir **Governance Center**
   - Section **"Gemini Settings"**
   - Coller votre API key
   - Sauvegarder

3. **Utiliser:**
   - Sélectionner **"Gemini"** dans le dropdown
   - Choisir modèle (ex: `gemini-1.5-flash`)
   - Commencer à chatter

**Modèles disponibles:**
- `gemini-1.5-flash` - Rapide et efficace
- `gemini-1.5-pro` - Haute qualité
- `gemini-2.0-flash-exp` - Expérimental

---

#### 🟣 **Claude (Cloud - Anthropic)**

**Configuration:**

1. **Obtenir API Key:**
   - Aller sur https://console.anthropic.com/
   - Section API Keys
   - Créer une clé

2. **Dans TITANE∞:**
   - Governance Center → Claude Settings
   - Coller API key
   - Sauvegarder

3. **Utiliser:**
   - Sélectionner **"Claude"**
   - Choisir modèle (ex: `claude-3-5-sonnet-20241022`)
   - Commencer à chatter

**Modèles recommandés:**
- `claude-3-5-sonnet-20241022` - Meilleur qualité/prix
- `claude-3-5-haiku-20241022` - Rapide et économique
- `claude-3-opus-20240229` - Qualité maximale

---

#### 🟠 **OpenAI (Cloud)**

**Configuration:**

1. **Obtenir API Key:**
   - Aller sur https://platform.openai.com/api-keys
   - Créer une clé

2. **Dans TITANE∞:**
   - Governance Center → OpenAI Settings
   - Coller API key
   - Sauvegarder

3. **Utiliser:**
   - Sélectionner **"OpenAI"**
   - Choisir modèle (ex: `gpt-4o`)
   - Commencer à chatter

**Modèles disponibles:**
- `gpt-4o` - GPT-4 Optimized
- `gpt-4o-mini` - Économique
- `gpt-4-turbo` - Haute qualité

---

### 3. Première Conversation

**Test Rapide:**

```
Bonjour! Peux-tu m'expliquer ce qu'est TITANE∞ en 3 phrases?
```

**Fonctionnalités Chat:**
- ✅ Conversation continue avec mémoire contextuelle
- ✅ Code syntax highlighting
- ✅ Markdown rendering complet
- ✅ Switch provider en cours de conversation
- ✅ Export conversations
- ✅ Mode vocal (si configuré)

---

## 🌟 Features Essentielles

### 🧠 UnifiedMemory OS

**Mémoire hiérarchique à 3 niveaux:**

- **STM** (Short-Term Memory) - Derniers échanges immédiats
- **MTM** (Mid-Term Memory) - Session courante
- **LTM** (Long-Term Memory) - Mémoire persistante vectorielle

**Accès:**
1. Menu → **"UnifiedMemory"**
2. Visualiser les 3 niveaux de mémoire
3. Rechercher dans l'historique

**Documentation complète:** [UNIFIED_MEMORY_GUIDE.md](../../../UNIFIED_MEMORY_GUIDE.md)

---

### 🎤 Mode Vocal

**Fonctionnalités:**
- 🎙️ Voice-to-Text (transcription)
- 🔊 Text-to-Speech (synthèse vocale)
- 🔄 Mode duplex (conversation bidirectionnelle)
- 🎯 Anti-feedback (3 couches de protection)

**Activation:**
1. Dans Chat IA, cliquer sur 🎤 bouton vocal
2. Autoriser microphone (navigateur)
3. Parler naturellement
4. L'IA répond en audio

**Configuration TTS:**

```bash
# Installation Parler-TTS (optionnel)
cd ~/Projets/TITANE_INFINITY
./install_parler_tts.sh

# Démarrer service TTS
cd tts-service
./start_tts_service.sh
```

**Documentation complète:** [VOCAL_README.md](../../../VOCAL_README.md)

---

### 🌈 Multimodal Engine

**Capacités:**
- 👁️ **Vision:** Analyse d'images, embeddings visuels
- 🎵 **Audio 3D:** Analyse spectrale, positionnement spatial
- 🔀 **Fusion:** Combinaison multi-modalités

**Utilisation:**

```rust
// Exemple analyse d'image
let vision_engine = VisionEngine::new(config);
let analysis = vision_engine.analyze_image_path("./image.jpg").await?;
```

**Documentation complète:** [MULTIMODAL_QUICK_START.md](../../../MULTIMODAL_QUICK_START.md)

---

### ⏰ Temporal Integrations

**Moteur temporel v2:**
- 📊 Tick health monitoring
- 🔄 Periodic task scheduler
- 🧠 Temporal reasoning
- 📈 Performance profiling

**Accès:**
1. Menu → **"Temporal Dashboard"**
2. Voir métriques en temps réel

**Documentation complète:** [TEMPORAL_INTEGRATIONS_README_FR.md](../../../TEMPORAL_INTEGRATIONS_README_FR.md)

---

### 🛡️ Self-Healing System

**Auto-diagnostic et auto-réparation:**
- ✅ Détection anomalies runtime
- ✅ Rollback automatique (erreurs critiques)
- ✅ Health checks périodiques
- ✅ Logs détaillés (journalisation complète)

**Accès diagnostics:**
1. Menu → **"System Center"**
2. Onglet **"Diagnostics"**
3. Voir rapports santé système

---

### 🎯 OMEGA Pipeline v2

**Pipeline traitement intelligent (10 étapes):**

1. **Router** - Analyse requête, détection intent
2. **Context** - Récupération contexte mémoire
3. **Executor** - Exécution stratégie adaptative
4. **Merger** - Fusion réponses multi-sources
5. **Validator** - Validation cohérence
6. **Guardrails** - Filtres sécurité
7. **Formatter** - Formatage Markdown
8. **Meta** - Meta-analyse qualité
9. **Logger** - Journalisation complète
10. **Response** - Délivrance finale

**Transparence:**
- Chaque étape loggée
- Métriques de performance
- Debug mode disponible

---

## 🛠️ Dépannage

### Problème: `pnpm install` échoue

**Solution:**

```bash
# Nettoyer cache
npm cache clean --force

# Supprimer node_modules
rm -rf node_modules package-lock.json

# Réinstaller
pnpm install --legacy-peer-deps
```

---

### Problème: Tauri build échoue

**Solution:**

```bash
# Vérifier dépendances Tauri (Ubuntu/Debian)
sudo apt update
sudo apt install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Rebuild
cargo clean
pnpm run tauri build
```

---

### Problème: Ollama ne répond pas

**Solutions:**

1. **Vérifier service:**
   ```bash
   # Démarrer Ollama
   ollama serve
   ```

2. **Vérifier modèle installé:**
   ```bash
   ollama list
   ```

3. **Installer modèle si manquant:**
   ```bash
   ollama pull llama3.2
   ```

4. **Tester manuellement:**
   ```bash
   ollama run llama3.2 "Bonjour"
   ```

---

### Problème: Chat IA - Erreur API

**Solutions:**

1. **Vérifier API key:**
   - Governance Center → Provider Settings
   - Re-coller API key
   - Sauvegarder

2. **Vérifier quotas:**
   - Console provider (Gemini/Claude/OpenAI)
   - Vérifier limite de requêtes

3. **Changer de provider:**
   - Basculer vers Ollama (local, pas de quota)

---

### Problème: Port 1420 déjà utilisé

**Solution:**

```bash
# Trouver processus utilisant port 1420
lsof -i :1420

# Tuer processus
kill -9 <PID>

# Ou changer port dans tauri.conf.json
```

---

### Problème: Écran blanc au lancement

**Solutions:**

1. **Vider cache Vite:**
   ```bash
   rm -rf node_modules/.vite
   pnpm run dev:tauri
   ```

2. **Rebuild complet:**
   ```bash
   pnpm run clean
   pnpm install
   pnpm run dev:tauri
   ```

3. **Vérifier logs:**
   ```bash
   # Logs frontend
   tail -f runtime/dev/logs/vite.log
   
   # Logs backend
   tail -f runtime/dev/logs/tauri.log
   ```

---

## 📚 Ressources Supplémentaires

### Guides Spécialisés

- **[VOCAL_README.md](../../../VOCAL_README.md)** - Mode vocal complet
- **[MULTIMODAL_QUICK_START.md](../../../MULTIMODAL_QUICK_START.md)** - Multimodal engine
- **[UNIFIED_MEMORY_GUIDE.md](../../../UNIFIED_MEMORY_GUIDE.md)** - Système mémoire
- **[TEMPORAL_INTEGRATIONS_README_FR.md](../../../TEMPORAL_INTEGRATIONS_README_FR.md)** - Temporal engine

### Documentation Technique

- **[Architecture](../../01_architecture/ARCHITECTURE_CURRENT_v24.md)** - Architecture système v24
- **[Data Flow](../../01_architecture/DATA_FLOW_CHAT.md)** - Flux de données Chat
- **[OMEGA Pipeline](../../01_architecture/OMEGA_PIPELINE_DETAILED.md)** - Pipeline détaillé
- **[Tauri Commands](../../06_api/TAURI_COMMANDS_REFERENCE.md)** - Référence API

### Développement

- **[SETUP.md](../development/SETUP.md)** - Configuration environnement dev
- **[TESTING.md](../development/TESTING.md)** - Stratégie de tests
- **[CONTRIBUTING.md](../../../CONTRIBUTING.md)** - Guide contribution

---

## 🎉 Félicitations !

Vous êtes maintenant prêt à utiliser TITANE∞ ! 🚀

**Prochaines étapes recommandées:**

1. ✅ Explorer les différents providers IA
2. ✅ Tester le mode vocal
3. ✅ Configurer UnifiedMemory selon vos besoins
4. ✅ Consulter documentation architecture
5. ✅ Rejoindre la communauté (Discord/GitHub)

**Besoin d'aide ?**

- **GitHub Issues:** https://github.com/KallokTherok1994/TITANE_INFINITY/issues
- **Discord:** [Communauté TITANE∞](#) (à venir)
- **Email:** support@titane-infinity.dev

---

**© 2025 TITANE∞ — Cognitive Operating System**  
**Version:** v24.2.0 | **License:** Proprietary
