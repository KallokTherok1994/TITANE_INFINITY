# 🎯 Suite d'Installation TITANE∞ — Ubuntu 24.04 LTS

> **Installation automatisée complète** de l'environnement de développement TITANE∞

---

## 📦 Contenu du Package

### Scripts Principaux

| Fichier | Taille | Description |
|---------|--------|-------------|
| `TITANE_POST_INSTALL_UBUNTU.sh` | 32 KB | **Script d'installation principal** — Configure automatiquement tout l'environnement |
| `validate_environment.sh` | 11 KB | **Validation rapide** — Vérifie que tout est correctement installé |
| `test_install_script.sh` | 6 KB | **Tests unitaires** — Valide la syntaxe et structure des scripts |

### Documentation

| Fichier | Taille | Description |
|---------|--------|-------------|
| `POST_INSTALL_README.md` | 5.5 KB | Documentation détaillée du processus d'installation |
| `QUICKSTART_UBUNTU_24.04.md` | 6.9 KB | Guide de démarrage rapide pour nouveaux utilisateurs |
| `MANIFEST_INSTALLATION.md` | 8.6 KB | Récapitulatif complet et cas d'usage |
| `README_INSTALL_SUITE.md` | Ce fichier | Vue d'ensemble de la suite d'installation |

---

## 🚀 Démarrage Rapide

### Installation en 1 ligne

```bash
curl -fsSL https://raw.githubusercontent.com/KallokTherok1994/TITANE_INFINITY/main/TITANE_POST_INSTALL_UBUNTU.sh | bash
```

### Installation standard

```bash
# 1. Télécharger
wget https://raw.githubusercontent.com/KallokTherok1994/TITANE_INFINITY/main/TITANE_POST_INSTALL_UBUNTU.sh

# 2. Rendre exécutable
chmod +x TITANE_POST_INSTALL_UBUNTU.sh

# 3. Exécuter
./TITANE_POST_INSTALL_UBUNTU.sh

# 4. Recharger l'environnement
source ~/.bashrc

# 5. Valider
./validate_environment.sh
```

---

## ✨ Fonctionnalités

### 🤖 Installation Complètement Automatisée

- ✅ **Détection intelligente** : Vérifie ce qui est déjà installé
- ✅ **Installation sélective** : N'installe que ce qui manque
- ✅ **Gestion d'erreurs** : Arrêt propre en cas de problème
- ✅ **Idempotence** : Peut être réexécuté sans problème

### 📊 Logging Détaillé

- ✅ Tous les logs sauvegardés dans `~/.titane_install_logs/`
- ✅ Timestamps pour chaque opération
- ✅ Niveau de détail complet pour le debugging

### 🎨 Interface Utilisateur

- ✅ Interface colorée et claire
- ✅ Progression visuelle (9 phases)
- ✅ Bannière ASCII art
- ✅ Résumé final avec statistiques

### 🔄 Support Backup/Restore

- ✅ Restauration automatique des clés SSH
- ✅ Configuration Git préservée
- ✅ Paramètres VSCode restaurés
- ✅ Extensions VSCode réinstallées

---

## 📋 Ce qui est installé

### Phase 1 : Système
- Mise à jour APT complète
- Outils essentiels (git, curl, wget, build-essential)

### Phase 2 : Dépendances Tauri v2 ⚡
```
libgtk-3-dev
libwebkit2gtk-4.1-dev
libjavascriptcoregtk-4.1-dev
libsoup-3.0-dev
libayatana-appindicator3-dev
libasound2-dev
librsvg2-dev
patchelf
```

### Phase 3 : Rust
- rustup (gestionnaire toolchains)
- Toolchains stable + nightly
- rustfmt, clippy
- Target wasm32-unknown-unknown

### Phase 4 : Node.js
- NVM (Node Version Manager)
- Node.js LTS
- npm dernière version

### Phase 5 : VSCode
- Éditeur VSCode
- 9 extensions essentielles

### Phase 6 : Configurations
- Clés SSH (si backup fourni)
- Configuration Git
- Paramètres VSCode

### Phase 7 : Projet
- Clone TITANE_INFINITY
- Checkout branche main

### Phase 8 : Dépendances
- `npm install`
- `cargo build`

### Phase 9 : Validation
- Rapport complet
- Recommandations

---

## 🔍 Validation

### Script de validation automatique

```bash
./validate_environment.sh
```

Vérifie :
- ✅ Ubuntu 24.04 LTS
- ✅ Rust + Cargo
- ✅ Node.js + npm
- ✅ WebKit2GTK 4.1
- ✅ GTK3
- ✅ VSCode
- ✅ Git (configuré)
- ✅ SSH GitHub (authentifié)
- ✅ TITANE_INFINITY (cloné)
- ✅ Composants Rust (rustfmt, clippy, wasm32)
- ✅ Tauri CLI

**Exit code** = nombre d'échecs (0 = succès complet)

---

## 🧪 Tests

### Tester sans exécuter

```bash
./test_install_script.sh
```

Ce script teste :
- ✅ Existence des fichiers
- ✅ Permissions exécutables
- ✅ Syntaxe Bash
- ✅ Présence de toutes les phases
- ✅ Dépendances mentionnées
- ✅ Gestion d'erreurs

---

## 📚 Documentation

### Pour les nouveaux utilisateurs
→ Lire **`QUICKSTART_UBUNTU_24.04.md`**
- Installation en 3 commandes
- Commandes essentielles
- Dépannage rapide

### Pour les détails techniques
→ Lire **`POST_INSTALL_README.md`**
- Description complète des 9 phases
- Configuration SSH pas-à-pas
- Structure installée
- Dépannage complet

### Pour les cas d'usage
→ Lire **`MANIFEST_INSTALLATION.md`**
- Scénarios d'utilisation
- Statistiques (temps, espace)
- Maintenance
- Sécurité

---

## ⚙️ Configuration

### Variables personnalisables

Dans `TITANE_POST_INSTALL_UBUNTU.sh` :

```bash
# Chemin du repository Git
TITANE_REPO="git@github.com:KallokTherok1994/TITANE_INFINITY.git"

# Répertoire de projets
PROJECTS_DIR="$HOME/Projets"

# Répertoire des logs
LOG_DIR="$HOME/.titane_install_logs"
```

### Extensions VSCode installées

```bash
rust-lang.rust-analyzer
tauri-apps.tauri-vscode
dbaeumer.vscode-eslint
esbenp.prettier-vscode
eamodio.gitlens
yzhang.markdown-all-in-one
bradlc.vscode-tailwindcss
formulahendry.auto-rename-tag
usernamehw.errorlens
```

---

## 🛠️ Dépannage

### Script s'arrête avec une erreur

1. **Consulter les logs** :
   ```bash
   cat ~/.titane_install_logs/install_*.log | grep ERROR
   ```

2. **Réexécuter** (le script est idempotent) :
   ```bash
   ./TITANE_POST_INSTALL_UBUNTU.sh
   ```

3. **Installation manuelle** de l'élément problématique

### Commandes non trouvées après installation

```bash
# Recharger TOUT l'environnement
source ~/.bashrc

# Ou spécifiquement :
source ~/.cargo/env  # Pour Rust
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # Pour Node
```

### WebKit2GTK non trouvé

```bash
sudo apt update
sudo apt install --reinstall \
    libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    libsoup-3.0-dev
```

### SSH GitHub échoue

```bash
# Générer une nouvelle clé
ssh-keygen -t ed25519 -C "votre_email@example.com"

# Afficher la clé publique
cat ~/.ssh/id_ed25519.pub

# Ajouter à GitHub : https://github.com/settings/keys

# Tester
ssh -T git@github.com
```

---

## 📊 Statistiques

### Temps d'exécution
- **Installation complète** : 15-30 min (selon connexion)
- **Avec backup** : +2-3 min
- **Validation** : ~5 secondes

### Espace disque requis
- **Outils système** : ~500 MB
- **Rust** : ~1.5 GB
- **Node.js** : ~200 MB
- **VSCode** : ~500 MB
- **TITANE** : ~1 GB
- **Total** : ~3.7 GB

### Compatibilité
- ✅ **Ubuntu 24.04 LTS** (recommandé)
- ⚠️ **Ubuntu 22.04 LTS** (devrait fonctionner)
- ⚠️ **Debian 12+** (avec adaptations mineures)
- ❌ **Autres distributions** (non testé)

---

## 🔐 Sécurité

### Ce qui est fait
- ✅ Téléchargements via HTTPS
- ✅ Vérifications de signatures (rustup)
- ✅ Permissions correctes sur clés SSH (600/644)
- ✅ Pas de sudo pour l'utilisateur (sauf apt)

### Ce qui n'est PAS fait
- ❌ Vérification des checksums APT (confiance au système)
- ❌ Scan antivirus (responsabilité utilisateur)
- ❌ Sandboxing (exécution directe)

### Logs
- ✅ Commandes loggées
- ✅ Pas de secrets enregistrés
- ✅ Permissions 644 sur logs

---

## 🔄 Maintenance

### Mise à jour des scripts

```bash
cd ~/Projets/TITANE_INFINITY
git pull origin main
chmod +x *.sh
```

### Réexécution sécurisée

Le script est **idempotent** : il peut être réexécuté sans danger.

```bash
./TITANE_POST_INSTALL_UBUNTU.sh
```

Il détectera automatiquement ce qui est déjà installé.

---

## 🎓 Architecture du Projet

TITANE∞ utilise une **architecture à 9 moteurs cognitifs** :

1. **Orchestrator** — Coordination
2. **Style Engine** — Interface
3. **Coherence Engine** — Consistance
4. **Reflection Engine** — Auto-amélioration
5. **Emotion Engine** — Empathie
6. **Unified Memory** — Persistance
7. **Behavior Engine** — Patterns
8. **Adaptation Engine** — Apprentissage
9. **System Health** — Monitoring

Pour plus de détails : `ARCHITECTURE.md`

---

## 📞 Support

### Issues GitHub
https://github.com/KallokTherok1994/TITANE_INFINITY/issues

### Documentation projet
- `ARCHITECTURE.md`
- `.github/instructions/titane.instructions.md`
- `README.md`

---

## 📝 Changelog

### v1.0.0 (2024-12-09)
- ✨ Création initiale de la suite d'installation
- ✨ Script d'installation automatisée complet
- ✨ Script de validation environnement
- ✨ Tests unitaires
- ✨ Documentation exhaustive

---

## 📜 Licence

Voir le fichier `LICENSE` dans le repository principal.

---

## 👥 Auteurs

**Kevin Thibault** / **Claude AI**

Créé avec 💜 pour TITANE∞

---

## ✅ Checklist de Déploiement

Avant de distribuer :

- [x] Scripts testés localement
- [x] Syntaxe Bash validée
- [x] Permissions correctes (755)
- [x] Documentation complète
- [x] Tests unitaires passent
- [x] Compatibilité Ubuntu 24.04 vérifiée
- [x] Gestion d'erreurs robuste
- [x] Logs détaillés
- [x] Interface utilisateur claire
- [x] Support backup/restore

---

## 🎉 Prêt à Déployer!

La suite d'installation TITANE∞ est **complète** et **prête à l'emploi**.

```bash
./TITANE_POST_INSTALL_UBUNTU.sh
```

**Bienvenue dans l'univers TITANE∞! 🚀**
