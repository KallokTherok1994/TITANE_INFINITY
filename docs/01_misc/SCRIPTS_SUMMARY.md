# 📦 SCRIPTS D'INSTALLATION — Résumé

## ✅ Scripts créés

### 1. `install-models.sh` — Installation interactive

**Utilisation:**

```bash
./scripts/ollama/install-models.sh
```

**Fonctionnalités:**

- ✅ Vérifications complètes (Ollama installé, serveur actif)
- ✅ Confirmation avant installation
- ✅ Progression détaillée pour chaque modèle
- ✅ Résumé complet à la fin
- ✅ Gestion d'erreurs robuste

**Parfait pour:** Installation manuelle, première fois

---

### 2. `install-models-auto.sh` — Installation automatique

**Utilisation:**

```bash
./scripts/ollama/install-models-auto.sh
```

**Fonctionnalités:**

- ✅ Aucune interaction requise
- ✅ Vérifications de base
- ✅ Sortie propre pour logs

**Parfait pour:** Scripts CI/CD, automation

---

### 3. `quick-install.sh` — One-liner

**Utilisation:**

```bash
./scripts/ollama/quick-install.sh
```

**Fonctionnalités:**

- ✅ Installation ultra-rapide
- ✅ Minimal, direct

**Parfait pour:** Installation rapide, experts

---

### 4. `run-ollama.sh` — Launcher complet

**Utilisation:**

```bash
./scripts/ollama/run-ollama.sh [command]
```

**Commandes:**

- `setup` — Configuration complète
- `serve` — Démarrer serveur
- `pull` — Installer modèles
- `status` — Vérifier statut
- `test` — Tester modèle
- `stop/restart` — Gérer serveur

**Parfait pour:** Gestion quotidienne, alias `/ollama`

---

### 5. `setup-ollama-alias.sh` — Configuration alias

**Utilisation:**

```bash
./scripts/ollama/setup-ollama-alias.sh
```

Configure l'alias global `/ollama` dans `~/.bashrc`

---

## 🎯 Quel script utiliser?

### Première installation

```bash
# 1. Installer les modèles
./scripts/ollama/install-models.sh

# 2. Configurer l'alias (optionnel)
./scripts/ollama/setup-ollama-alias.sh
source ~/.bashrc

# 3. Vérifier
/ollama status
```

### Installation rapide

```bash
./scripts/ollama/quick-install.sh
```

### Utilisation quotidienne

```bash
/ollama status
/ollama test
/ollama restart
```

---

## 📦 Modèles installés

Les scripts installent automatiquement:

1. **qwen2.5:latest** (4.7 GB) — Principal
2. **llama3.1:8b** (4.7 GB) — Alternative
3. **mistral:7b** (4.1 GB) — Backup français

**Total:** ~13.5 GB

---

## 📚 Documentation

- [INSTALL.md](./INSTALL.md) — Guide d'installation détaillé
- [README.md](./README.md) — Vue d'ensemble des scripts
- [ACTIVATION.md](./ACTIVATION.md) — Configuration de l'alias
- [../../docs/OLLAMA_GUIDE.md](../../docs/OLLAMA_GUIDE.md) — Guide complet

---

## ⚡ TL;DR (Installation express)

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

# Option A: Interactive
./scripts/ollama/install-models.sh

# Option B: Automatique
./scripts/ollama/install-models-auto.sh

# Option C: One-liner
./scripts/ollama/quick-install.sh

# Vérification
ollama list
```

**Temps:** ~10-20 minutes  
**Espace:** ~13.5 GB  
**Prérequis:** Ollama installé + serveur actif

---

**Version:** 1.0.0  
**Date:** 2026-01-04  
**TITANE∞ v26.2.0**
