# 🚀 Installation des Modèles Ollama — TITANE∞

## Prérequis

1. **Ollama installé:**

   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Serveur Ollama actif:**
   ```bash
   ollama serve
   ```
   (Laissez tourner dans un terminal)

---

## 🎯 Installation (3 options)

### ✅ Option 1: Script interactif (Recommandé)

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
./scripts/ollama/install-models.sh
```

**Avantages:**

- ✅ Progression détaillée
- ✅ Confirmation avant installation
- ✅ Résumé complet à la fin

---

### ⚡ Option 2: Installation automatique

```bash
./scripts/ollama/install-models-auto.sh
```

**Avantages:**

- ✅ Aucune interaction requise
- ✅ Parfait pour scripts/CI

---

### 🏃 Option 3: One-liner ultra-rapide

```bash
./scripts/ollama/quick-install.sh
```

Ou directement:

```bash
ollama pull qwen2.5:latest && \
ollama pull llama3.1:8b && \
ollama pull mistral:7b
```

---

## 📦 Modèles installés

Les scripts installent:

| Modèle           | Taille | Usage              |
| ---------------- | ------ | ------------------ |
| `qwen2.5:latest` | 4.7 GB | Principal (défaut) |
| `llama3.1:8b`    | 4.7 GB | Alternative        |
| `mistral:7b`     | 4.1 GB | Backup français    |

**Total:** ~13.5 GB

---

## ✅ Vérification

```bash
ollama list
```

Vous devriez voir:

```
qwen2.5:latest     [...]    4.7 GB    [...]
llama3.1:8b        [...]    4.7 GB    [...]
mistral:7b         [...]    4.1 GB    [...]
```

---

## 🎮 Utilisation dans TITANE∞

1. **Lancer TITANE∞:**

   ```bash
   pnpm run dev
   ```

2. **Dans l'application:**
   - Ouvrir Paramètres (⚙️)
   - Section "Providers IA"
   - Activer "Ollama"
   - Sélectionner `qwen2.5:latest`

3. **Tester:**
   - Ouvrir le Chat IA
   - Envoyer un message
   - ✅ Le modèle local répond!

---

## 🔧 Dépannage

### Le serveur n'est pas actif

```bash
# Démarrer en arrière-plan
nohup ollama serve > /tmp/ollama.log 2>&1 &

# Vérifier
curl http://localhost:11434/api/version
```

### Les modèles ne s'installent pas

```bash
# Vérifier l'espace disque
df -h

# Vérifier la connexion
curl -I https://ollama.com
```

### Changer le modèle par défaut

Éditez `.env`:

```env
OLLAMA_DEFAULT_MODEL=llama3.1:8b
```

---

## 📚 Plus d'infos

- [Guide complet Ollama](../../docs/OLLAMA_GUIDE.md)
- [Documentation Ollama](https://ollama.com/docs)
- [Liste des modèles](https://ollama.com/library)

---

**Temps d'installation:** ~10-20 minutes (selon connexion)  
**Espace requis:** ~13.5 GB
