# Configuration de l'alias `/ollama` — TITANE∞

## ✅ Étape 1: Activer l'alias pour la session actuelle

Copiez et collez cette commande dans votre terminal:

```bash
alias /ollama='/home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/ollama/run-ollama.sh'
```

Testez immédiatement:

```bash
/ollama status
```

## ✅ Étape 2: Rendre l'alias permanent

### Option A: Script automatique (Recommandé)

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
./scripts/ollama/setup-ollama-alias.sh
```

### Option B: Configuration manuelle

Ajoutez cette ligne à `~/.bashrc`:

```bash
# TITANE∞ — Ollama Launcher
alias /ollama='/home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/ollama/run-ollama.sh'
```

Puis rechargez:

```bash
source ~/.bashrc
```

## ✅ Étape 3: Vérification

Ouvrez un **nouveau terminal** et tapez:

```bash
/ollama help
```

Vous devriez voir l'aide du launcher.

---

## 🎯 Commandes rapides

```bash
/ollama status     # Vérifier Ollama
/ollama test       # Tester le modèle
/ollama restart    # Redémarrer le serveur
/ollama help       # Aide complète
```

---

## 📚 Documentation complète

Voir [docs/OLLAMA_GUIDE.md](../../docs/OLLAMA_GUIDE.md)

---

**Note:** L'alias `/ollama` sera disponible dans **tous** vos terminaux après activation permanente!
