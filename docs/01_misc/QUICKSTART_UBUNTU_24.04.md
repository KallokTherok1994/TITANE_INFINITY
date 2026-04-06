# 🚀 TITANE∞ — Guide de Démarrage Rapide Ubuntu 24.04 LTS

## 📋 Vue d'ensemble

Ce guide vous permet de configurer complètement votre environnement de développement TITANE∞ après une installation fraîche d'Ubuntu 24.04 LTS.

---

## ⚡ Installation en 3 Commandes

```bash
# 1. Télécharger et rendre exécutable
wget https://raw.githubusercontent.com/KallokTherok1994/TITANE_INFINITY/main/TITANE_POST_INSTALL_UBUNTU.sh && chmod +x TITANE_POST_INSTALL_UBUNTU.sh

# 2. Exécuter l'installation
./TITANE_POST_INSTALL_UBUNTU.sh

# 3. Recharger l'environnement
source ~/.bashrc
```

**C'est tout!** L'environnement est maintenant configuré. 🎉

---

## 📦 Ce qui est installé automatiquement

### Outils système

- ✅ **Git** (contrôle de version)
- ✅ **curl / wget** (téléchargements)
- ✅ **build-essential** (compilation)

### Environnement Rust

- ✅ **Rust stable + nightly**
- ✅ **cargo** (gestionnaire de paquets Rust)
- ✅ **rustfmt** (formatage code)
- ✅ **clippy** (linting)
- ✅ **wasm32 target** (WebAssembly)

### Environnement Node.js

- ✅ **NVM** (Node Version Manager)
- ✅ **Node.js LTS**
- ✅ **npm**

### Dépendances Tauri v2

- ✅ **WebKit2GTK 4.1**
- ✅ **GTK3**
- ✅ **libsoup 3.0**
- ✅ **AppIndicator**
- ✅ **ALSA** (audio)
- ✅ **librsvg** (SVG)
- ✅ **patchelf**

### Éditeur & Extensions

- ✅ **VSCode**
- ✅ **rust-analyzer**
- ✅ **Tauri extension**
- ✅ **ESLint / Prettier**
- ✅ **GitLens**
- ✅ **Tailwind CSS**
- ✅ **Error Lens**

### Projet TITANE∞

- ✅ Repository cloné dans `~/Projets/TITANE_INFINITY`
- ✅ Dépendances npm installées
- ✅ Backend Rust compilé

---

## 🔧 Validation de l'Installation

Après l'installation, vérifiez que tout fonctionne :

```bash
./validate_environment.sh
```

Ce script affiche un rapport détaillé de votre configuration.

---

## 🎯 Commandes Essentielles

### Naviguer vers le projet

```bash
cd ~/Projets/TITANE_INFINITY
```

### Mode développement (avec hot-reload)

```bash
npm run tauri dev
```

### Build de production

```bash
npm run tauri build
```

### Tests

```bash
# Tests frontend
npm test

# Tests backend Rust
cd src-tauri && cargo test
```

### Linting & Formatage

```bash
# Frontend
npm run lint
npm run format

# Backend
cd src-tauri
cargo fmt
cargo clippy
```

---

## 📁 Structure du Projet

```
~/Projets/TITANE_INFINITY/
├── src/                    # Frontend React + TypeScript
│   ├── components/         # Composants React
│   ├── stores/             # Zustand state management
│   ├── engines/            # 9 Moteurs cognitifs
│   └── ...
├── src-tauri/              # Backend Rust
│   ├── src/
│   │   ├── main.rs        # Point d'entrée
│   │   ├── commands/      # Commandes IPC
│   │   └── ...
│   └── Cargo.toml
├── public/                 # Assets statiques
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🔑 Configuration SSH GitHub (si non restaurée)

Si vous n'avez pas utilisé de backup avec le script :

### 1. Générer une clé SSH

```bash
ssh-keygen -t ed25519 -C "votre_email@example.com"
# Appuyer sur ENTER pour accepter l'emplacement par défaut
# Optionnel : Entrer une passphrase
```

### 2. Afficher la clé publique

```bash
cat ~/.ssh/id_ed25519.pub
```

### 3. Ajouter à GitHub

1. Copier la clé affichée
2. Aller sur https://github.com/settings/keys
3. Cliquer **"New SSH key"**
4. Coller la clé et donner un titre (ex: "Ubuntu 24.04 TITANE")
5. Cliquer **"Add SSH key"**

### 4. Tester la connexion

```bash
ssh -T git@github.com
# Devrait afficher : "Hi USERNAME! You've successfully authenticated..."
```

---

## 🛠️ Dépannage Rapide

### "command not found" après installation

Recharger l'environnement :

```bash
source ~/.bashrc
```

Pour Rust spécifiquement :

```bash
source ~/.cargo/env
```

Pour NVM :

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Erreur "webkit2gtk not found"

Réinstaller les dépendances :

```bash
sudo apt update
sudo apt install --reinstall libwebkit2gtk-4.1-dev
```

### Erreur de permissions SSH

Corriger les permissions :

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

### Build Rust échoue

Nettoyer et rebuild :

```bash
cd ~/Projets/TITANE_INFINITY/src-tauri
cargo clean
cargo build
```

### npm install échoue

Nettoyer le cache et réinstaller :

```bash
cd ~/Projets/TITANE_INFINITY
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 📚 Architecture TITANE∞

Le projet suit une architecture à **9 Moteurs Cognitifs** :

1. **Orchestrator** — Coordination globale
2. **Style Engine** — Gestion de l'interface
3. **Coherence Engine** — Consistance des réponses
4. **Reflection Engine** — Auto-amélioration
5. **Emotion Engine** — Empathie & contexte émotionnel
6. **Unified Memory** — Mémoire persistante
7. **Behavior Engine** — Patterns comportementaux
8. **Adaptation Engine** — Apprentissage continu
9. **System Health** — Monitoring & diagnostics

Pour plus de détails, voir `ARCHITECTURE.md`.

---

## 🎓 Conventions de Code

### TypeScript

- **Strict mode** obligatoire
- **Types explicites** (ZERO `any`)
- **Composants purs** React
- `try/catch` pour toutes les opérations async

### Rust

- **async/await** obligatoire
- **Result<T, E>** pour gestion d'erreurs
- **ZERO `unwrap()`** (utiliser `?` ou pattern matching)
- Tests unitaires pour chaque fonction publique

### Commits

```
<type>(<scope>): <description>

- Point de changement 1
- Point de changement 2

Task: <id>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 📞 Support & Ressources

### Documentation

- `ARCHITECTURE.md` — Architecture détaillée
- `POST_INSTALL_README.md` — Guide d'installation complet
- `.github/instructions/titane.instructions.md` — Instructions développement

### Scripts Utiles

- `TITANE_POST_INSTALL_UBUNTU.sh` — Installation complète
- `validate_environment.sh` — Validation environnement
- `auto_build.sh` — Build automatisé
- `dev_on_host.sh` — Dev sans conteneur

### Issues & Bugs

https://github.com/KallokTherok1994/TITANE_INFINITY/issues

---

## ✅ Checklist Post-Installation

- [ ] Script d'installation exécuté sans erreurs
- [ ] `validate_environment.sh` affiche tous les ✅
- [ ] SSH GitHub configuré et fonctionnel
- [ ] `npm run tauri dev` démarre sans erreurs
- [ ] Hot-reload fonctionne (modifier un fichier .tsx)
- [ ] Backend Rust compile sans warnings
- [ ] VSCode ouvre le projet sans erreurs
- [ ] Extensions VSCode actives (rust-analyzer, Tauri)

---

## 🎉 Félicitations!

Vous êtes maintenant prêt à développer sur TITANE∞!

Pour démarrer :

```bash
cd ~/Projets/TITANE_INFINITY
npm run tauri dev
```

**Bon développement! 🚀**

---

_Créé avec 💜 par Kevin Thibault & Claude AI_  
_Dernière mise à jour : 9 décembre 2024_
