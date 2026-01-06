# TITANE∞ — Scripts Ollama

Scripts pour gérer l'intégration d'Ollama (IA locale) avec TITANE∞.

## 📁 Fichiers

### Scripts principaux
- **`run-ollama.sh`** — Launcher complet (serve, pull, status, test...)
- **`install-models.sh`** — Installation interactive des modèles TITANE∞
- **`install-models-auto.sh`** — Installation automatique (CI/CD)
- **`quick-install.sh`** — Installation one-liner ultra-rapide
- **`setup-ollama-alias.sh`** — Configure l'alias global `/ollama`

### Fichiers annexes
- `README.md` — Ce fichier
- `ACTIVATION.md` — Guide d'activation de l'alias
- `bashrc-snippet.sh` — Snippet pour ~/.bashrc

## 🚀 Installation des modèles

### Option 1: Interactive (Recommandé)

```bash
./install-models.sh
```

Installe les 3 modèles avec confirmations et progression détaillée.

### Option 2: Automatique

```bash
./install-models-auto.sh
```

Installation non-interactive pour scripts/CI.

### Option 3: One-liner

```bash
./quick-install.sh
```

Installation ultra-rapide en une commande.

### Option 4: Via l'alias /ollama

```bash
# 1. Configurer l'alias
./setup-ollama-alias.sh
source ~/.bashrc

# 2. Installer les modèles
/ollama pull
```

## 📖 Modèles installés

Les scripts installent automatiquement:

1. **qwen2.5:latest** (~4.7 GB)
   - Modèle principal
   - Rapide, multilingue, excellent français
   - Recommandé pour usage quotidien

2. **llama3.1:8b** (~4.7 GB)
   - Alternative de Meta
   - Mémoire réduite, polyvalent
   - Bon pour contextes longs

3. **mistral:7b** (~4.1 GB)
   - Backup français
   - Optimisé pour le français
   - Mistral AI

**Total:** ~13.5 GB

## 🎯 Quick Start

### Installation complète en 2 commandes

```bash
# 1. Installer les modèles
./install-models.sh

# 2. Configurer l'alias (optionnel)
./setup-ollama-alias.sh
```

### Vérification

```bash
ollama list
# ou
/ollama status  # si alias configuré
```

## 📖 Documentation complète

Voir [docs/OLLAMA_GUIDE.md](../../docs/OLLAMA_GUIDE.md) pour la documentation complète.

## 🎯 Utilisation rapide

```bash
/ollama serve    # Démarrer le serveur
/ollama status   # Vérifier le statut
/ollama test     # Tester le modèle
/ollama help     # Aide complète
```

---

**Astuce:** Une fois l'alias configuré, tapez simplement `/ollama` depuis n'importe où! 🚀
