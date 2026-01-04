# TITANE∞ — Ollama Integration Guide

## 🚀 Installation Rapide

### 1. Configurer l'alias `/ollama`

```bash
# Depuis la racine du projet TITANE∞
./scripts/ollama/setup-ollama-alias.sh

# Activer l'alias dans le terminal actuel
source ~/.bashrc
```

### 2. Configuration complète (une seule commande)

```bash
/ollama setup
```

Cette commande va:
- ✅ Vérifier l'installation d'Ollama
- ✅ Démarrer le serveur Ollama
- ✅ Télécharger les 3 modèles TITANE∞
- ✅ Tester le système

---

## 📖 Commandes Disponibles

```bash
/ollama setup      # Configuration initiale complète
/ollama serve      # Démarrer le serveur Ollama
/ollama status     # Vérifier le statut + liste des modèles
/ollama test       # Tester le modèle par défaut
/ollama pull       # Télécharger les modèles TITANE∞
/ollama restart    # Redémarrer le serveur
/ollama stop       # Arrêter le serveur
/ollama help       # Afficher l'aide
```

---

## 🧠 Modèles Inclus

| Modèle | Taille | Usage | Notes |
|--------|--------|-------|-------|
| **qwen2.5:latest** | ~4.7 GB | Défaut | Rapide, multilingue, excellent français |
| **llama3.1:8b** | ~4.7 GB | Alternative | Meta, mémoire réduite, polyvalent |
| **mistral:7b** | ~4.1 GB | Backup | Français optimisé, Mistral AI |

Le modèle par défaut est configuré dans `.env`:

```env
OLLAMA_DEFAULT_MODEL=qwen2.5:latest
```

---

## ⚙️ Configuration

### Variables d'environnement (`.env`)

```env
# OLLAMA (IA Locale)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=qwen2.5:latest
```

### Changer le modèle par défaut

Éditez `.env` et changez `OLLAMA_DEFAULT_MODEL`:

```env
# Pour utiliser LLama 3.1
OLLAMA_DEFAULT_MODEL=llama3.1:8b

# Pour utiliser Mistral
OLLAMA_DEFAULT_MODEL=mistral:7b
```

---

## 🔧 Installation d'Ollama

Si Ollama n'est pas installé, le script vous guidera.

### Linux / macOS

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Vérification

```bash
ollama --version
# Ollama version 0.x.x
```

---

## 📊 Utilisation dans TITANE∞

### 1. Démarrer Ollama

```bash
/ollama serve
```

Le serveur démarre en arrière-plan sur `http://localhost:11434`.

### 2. Lancer TITANE∞ Dev

```bash
# Ouvrir un nouveau terminal
pnpm run dev
# ou
npm run dev:tauri
```

### 3. Tester dans l'application

Dans l'interface Chat de TITANE∞:

1. Ouvrir les **Paramètres** (⚙️)
2. Section **Providers IA**
3. Activer **Ollama** (local)
4. Sélectionner le modèle: `qwen2.5:latest`
5. Envoyer un message test

---

## 🐛 Dépannage

### Le serveur ne démarre pas

```bash
# Vérifier les logs
tail -f /tmp/ollama-serve.log

# Arrêter tous les processus Ollama
pkill -9 ollama

# Redémarrer proprement
/ollama restart
```

### Les modèles ne se téléchargent pas

```bash
# Vérifier la connexion
curl -sf https://ollama.com

# Télécharger manuellement
ollama pull qwen2.5:latest
```

### Changer le port Ollama

Par défaut, Ollama écoute sur `11434`. Pour changer:

```bash
# Dans .env
OLLAMA_BASE_URL=http://localhost:12345

# Démarrer Ollama sur ce port
OLLAMA_HOST=127.0.0.1:12345 /ollama serve
```

---

## 📈 Monitoring

### Vérifier l'utilisation des ressources

```bash
# CPU/RAM du serveur Ollama
top -p $(pgrep ollama)

# Logs en temps réel
tail -f /tmp/ollama-serve.log
```

### Test de performance

```bash
/ollama test
```

Mesure le temps de réponse du modèle.

---

## 🔄 Mise à jour des modèles

```bash
# Re-télécharger les modèles (dernière version)
/ollama pull
```

---

## 🛑 Désinstallation

### Supprimer l'alias

Éditez `~/.bashrc` et supprimez:

```bash
alias /ollama='...'
```

### Désinstaller Ollama

```bash
# Arrêter le service
/ollama stop

# Désinstaller (Linux)
sudo systemctl stop ollama
sudo systemctl disable ollama
sudo rm /usr/local/bin/ollama
sudo rm -rf /usr/share/ollama
```

---

## 📚 Ressources

- [Documentation Ollama](https://ollama.com/docs)
- [Modèles disponibles](https://ollama.com/library)
- [TITANE∞ Architecture](../ARCHITECTURE.md)

---

## 🎯 Quick Start (TL;DR)

```bash
# 1. Installer l'alias
./scripts/ollama/setup-ollama-alias.sh
source ~/.bashrc

# 2. Tout configurer en 1 commande
/ollama setup

# 3. Vérifier
/ollama status

# 4. Lancer TITANE∞
pnpm run dev
```

**C'est tout!** 🎉

---

**Version:** 26.2.0  
**Dernière mise à jour:** 2026-01-04  
**Auteur:** TITANE∞ Team
