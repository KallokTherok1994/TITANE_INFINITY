# 🤖 TITANE∞ - Configuration Ollama

## ✅ Status: CONNECTÉ ET OPÉRATIONNEL

Ollama est correctement configuré et prêt à être utilisé avec TITANE∞.

---

## 📊 Informations de Configuration

### Service Ollama
- **Version**: 0.13.5
- **URL**: http://127.0.0.1:11434
- **Status**: ✅ En ligne et fonctionnel

### Modèles Installés
| Modèle | Taille | Usage Recommandé |
|--------|--------|------------------|
| **llama3.1** ⭐ | 4.58 GB | Modèle par défaut - Usage général |
| codellama | 3.56 GB | Génération et analyse de code |
| mistral | 4.07 GB | Rapide et performant |
| qwen2.5-coder | 4.36 GB | Excellent pour code et technique |
| llama3.2 | 1.88 GB | Léger et rapide (basse latence) |

---

## 🚀 Démarrage Rapide

### 1. Tester la Connexion
```bash
# Vérification rapide
curl http://127.0.0.1:11434/api/version

# Test complet avec script TITANE
node test-ollama-connection.js
```

### 2. Lancer TITANE∞ avec Ollama
```bash
# Avec les variables d'environnement
OLLAMA_DEFAULT_MODEL=llama3.1 pnpm tauri dev

# Ou simplement (utilise .env)
pnpm tauri dev
```

### 3. Tester dans TITANE
1. Ouvrez TITANE∞
2. Allez dans le chat
3. Sélectionnez le provider "Ollama" ou "Local"
4. Posez une question !

---

## ⚙️ Configuration Avancée

### Changer de Modèle
Éditez `.env`:
```bash
OLLAMA_DEFAULT_MODEL=mistral  # ou codellama, qwen2.5-coder, etc.
```

### Installer un Nouveau Modèle
```bash
# Lister les modèles disponibles
ollama list

# Installer un modèle
ollama pull llama3.3

# Voir les modèles installés
ollama list
```

### Performance et Ressources
```bash
# Arrêter Ollama si besoin
pkill ollama

# Redémarrer avec des options personnalisées
OLLAMA_NUM_PARALLEL=4 ollama serve

# Limiter la mémoire GPU (si applicable)
OLLAMA_CUDA_VISIBLE_DEVICES=0 ollama serve
```

---

## 🔧 Dépannage

### Problème: Ollama n'est pas accessible
```bash
# Vérifier si le service tourne
ps aux | grep ollama

# Démarrer manuellement
ollama serve

# Vérifier les logs
journalctl -u ollama -f  # si installé comme service
```

### Problème: Modèle introuvable
```bash
# Vérifier les modèles installés
ollama list

# Installer le modèle manquant
ollama pull llama3.1
```

### Problème: Réponses lentes
Solutions:
1. Utiliser un modèle plus léger (llama3.2)
2. Réduire le contexte des messages
3. Fermer les applications gourmandes en RAM
4. Considérer un GPU si disponible

---

## 📚 Intégration TITANE

### Providers AI Disponibles
TITANE∞ supporte plusieurs providers en cascade:

1. **Ollama (Local)** ⭐ - Priorité #1
   - 100% privé
   - Aucune API key requise
   - Fonctionne hors ligne

2. **Gemini** (Optional)
   - Cloud API de Google
   - Requiert GEMINI_API_KEY

3. **OpenAI** (Optional)
   - GPT-4, GPT-3.5
   - Requiert OPENAI_API_KEY

4. **Claude** (Optional)
   - Anthropic Claude 3
   - Requiert ANTHROPIC_API_KEY

### Stratégie de Fallback
TITANE utilisera automatiquement:
1. Ollama (si disponible)
2. Gemini (si clé configurée)
3. OpenAI (si clé configurée)
4. Claude (si clé configurée)
5. Mode local simple (fallback final)

---

## 📈 Monitoring

### Statistiques Ollama
```bash
# Voir l'utilisation mémoire
htop | grep ollama

# Logs en temps réel
tail -f ~/.ollama/logs/server.log  # path peut varier
```

### Depuis TITANE
- Allez dans Admin Center > AI Providers
- Vérifiez le status de chaque provider
- Consultez les statistiques d'utilisation

---

## 🔗 Ressources

- [Documentation Ollama](https://ollama.ai/docs)
- [Modèles disponibles](https://ollama.ai/library)
- [TITANE Docs](./GETTING_STARTED.md)
- [Configuration AI](./AI_CONFIGURATION.md)

---

## ✨ Prochaines Étapes

1. ✅ Ollama configuré
2. 🔄 Testez dans TITANE Chat
3. 📊 Explorez les différents modèles
4. ⚡ Ajustez les paramètres de performance
5. 🎯 (Optionnel) Configurez des API keys cloud pour backup

---

**Date de configuration**: 12 janvier 2026  
**Status**: ✅ Production Ready
