# 🚀 Guide Rapide - Ollama + Tauri sur TITANE∞

## ✅ Configuration Terminée!

Ollama est maintenant **entièrement configuré et connecté** à l'interface chat de TITANE∞.

## 🎯 Ce Qui a Été Fait

### 1. Configuration Ollama

- ✅ Serveur Ollama vérifié et opérationnel (port 11434)
- ✅ 10 modèles IA installés et prêts (llama3.1, qwen2.5, mistral, etc.)
- ✅ Test de génération réussi

### 2. Configuration TITANE∞

- ✅ Fichier `.env.local` créé avec configuration Ollama
- ✅ Modèle par défaut: `llama3.1:latest`
- ✅ Proxy Vite configuré pour éviter CORS

### 3. Intégration Tauri

- ✅ Module Rust `ollama.rs` vérifié
- ✅ Commande `conversation_generate` active
- ✅ Build Rust compilé sans erreur

### 4. Tests Automatiques

- ✅ Script de test créé: `test-ollama-connection.sh`
- ✅ Tâche VS Code ajoutée: "🧪 Test Ollama Connection"
- ✅ 10/10 tests passés avec succès

## 🚀 Comment Utiliser

### Démarrer TITANE∞ avec Ollama

```bash
# Option 1: Via ligne de commande
pnpm run dev:tauri

# Option 2: Via VS Code
# Ctrl+Shift+P → "Run Task" → "🟢 Launch Titan-Dev"
```

### Tester la Connexion

```bash
# Option 1: Script direct
bash test-ollama-connection.sh

# Option 2: Via VS Code Task
# Ctrl+Shift+P → "Run Task" → "🧪 Test Ollama Connection"
```

## 💬 Utiliser le Chat IA

Une fois TITANE∞ lancé:

1. Ouvrir la section **Conversation** (🗨️)
2. Sélectionner le provider **Ollama** (🦙)
3. Commencer à discuter!

Le système utilisera automatiquement le modèle configuré (`llama3.1:latest`).

## 🔧 Changer de Modèle

Pour utiliser un autre modèle, éditez `.env.local`:

```bash
# Modèle léger et rapide
TITANE_OLLAMA_MODEL=llama3.2:latest

# Modèle optimisé pour le code
TITANE_OLLAMA_MODEL=qwen2.5:latest

# Modèle compact
TITANE_OLLAMA_MODEL=gemma2:2b
```

Puis redémarrez TITANE∞.

## 📚 Modèles Disponibles

| Modèle             | Taille | Usage Recommandé            |
| ------------------ | ------ | --------------------------- |
| `llama3.1:latest`  | 4.9 GB | **Par défaut** - Polyvalent |
| `qwen2.5:latest`   | 4.7 GB | Code et développement       |
| `llama3.2:latest`  | 2.0 GB | Rapide et léger             |
| `mistral:latest`   | 4.4 GB | Performant général          |
| `gemma2:2b`        | 1.6 GB | Ultra-léger                 |
| `codellama:latest` | 3.8 GB | Spécialiste code            |

## 🛠️ Dépannage

### Le serveur Ollama ne répond pas

```bash
# Démarrer Ollama
ollama serve

# Vérifier le statut
curl http://127.0.0.1:11434/api/tags
```

### Modèle non trouvé

```bash
# Lister les modèles installés
ollama list

# Installer le modèle manquant
ollama pull llama3.1:latest
```

### Relancer les tests

```bash
bash test-ollama-connection.sh
```

## 📖 Documentation Complète

Pour plus de détails techniques, voir:

- `docs/OLLAMA_TAURI_CONFIG.md` - Configuration complète
- `.env.ollama.example` - Template de configuration

## 🎉 Prêt à Utiliser!

Votre configuration Ollama + Tauri est **100% opérationnelle**.

Lancez TITANE∞ et profitez de l'IA locale!

```bash
pnpm run dev:tauri
```

---

_Configuration validée le: 2 février 2026_
