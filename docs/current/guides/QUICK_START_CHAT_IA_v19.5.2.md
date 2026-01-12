# 🚀 Quick Start Guide - Chat IA TITANE∞ v19.5.2

**Date**: 10 décembre 2025  
**Version**: TITANE∞ v19.5.2 OMEGA Pipeline  
**Statut**: ✅ Tech-Ready (Dev) | **Production**: ⛔ EN ATTENTE (autorisation requise)

---

## 📋 Table des Matières

1. [Démarrage Rapide (2 minutes)](#démarrage-rapide-2-minutes)
2. [Configuration Providers](#configuration-providers)
3. [Utilisation Chat IA](#utilisation-chat-ia)
4. [Fonctionnalités Avancées](#fonctionnalités-avancées)
5. [Dépannage](#dépannage)

---

## ⚡ Démarrage Rapide (2 minutes)

### 1. Lancer TITANE∞ Dev

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
pnpm run dev:tauri
```

**Résultat attendu**:

```
✓ Vite ready in 290 ms
➜  Local:   http://localhost:5173/
✓ Tauri running target/debug/titane-infinity
```

### 2. Accéder au Chat IA

1. Ouvrir navigateur: `http://localhost:5173`
2. Cliquer sur **"Chat IA"** dans le menu
3. Sélectionner un provider (Ollama recommandé pour débuter)
4. Commencer à chatter!

### 3. Test Rapide

**Message de test**:

```
Bonjour! Peux-tu m'expliquer ce qu'est TITANE∞ en 3 phrases?
```

**Si ça marche**: ✅ Vous êtes prêt!  
**Si erreur**: Voir [Dépannage](#dépannage)

---

## 🔧 Configuration Providers

### 🟢 Ollama (Local - Recommandé)

**Avantages**: Gratuit, privé, pas besoin d'API key

**Vérification**:

```bash
ollama list
```

**Démarrage**:

```bash
ollama serve
```

**Modèles disponibles** (si installés):

- `llama3.2:latest` - Conversation générale
- `llama3.1:latest` - Haute qualité
- `deepseek-coder-v2` - Code spécialisé
- `codellama:latest` - Meta code
- Plus de 6 autres modèles...

**Installation nouveau modèle**:

```bash
ollama pull llama3.2
```

---

### 🔵 Gemini (Cloud - Google)

**Configuration**:

1. **Obtenir API Key**:
   - Aller sur https://makersuite.google.com/app/apikey
   - Créer une clé API
   - Copier la clé

2. **Dans TITANE∞**:
   - Ouvrir Governance Center
   - Section "API Keys"
   - Coller la clé Gemini
   - Sauvegarder

**Modèles disponibles**:

- `gemini-2.0-flash-exp` - Ultra-rapide
- `gemini-1.5-pro` - Haute qualité
- `gemini-1.5-flash` - Équilibré

---

### 🤖 OpenAI (Cloud - GPT)

**Configuration**:

1. **Obtenir API Key**:
   - Aller sur https://platform.openai.com/api-keys
   - Créer une clé API
   - Copier la clé

2. **Dans TITANE∞**:
   - Governance Center → API Keys
   - Coller la clé OpenAI
   - Sauvegarder

**Modèles disponibles**:

- `gpt-4o` - Meilleur modèle
- `gpt-4o-mini` - Rapide et économique
- `gpt-4` - Haute qualité
- `gpt-3.5-turbo` - Économique

---

### 🧠 Anthropic (Cloud - Claude)

**Configuration**:

1. **Obtenir API Key**:
   - Aller sur https://console.anthropic.com/
   - Créer une clé API
   - Copier la clé

2. **Dans TITANE∞**:
   - Governance Center → API Keys
   - Coller la clé Anthropic
   - Sauvegarder

**Modèles disponibles**:

- `claude-3-5-sonnet-20241022` - Meilleur modèle
- `claude-3-opus` - Maximum intelligence
- `claude-3-sonnet` - Équilibré

---

## 💬 Utilisation Chat IA

### Interface Principale

```
┌─────────────────────────────────────────────────────────┐
│ Chat IA                                   [⚙️ Settings] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Provider: [Ollama ▼]  Mode: [Assistant ▼]              │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🤖 Assistant: Bonjour! Comment puis-je vous aider?  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Type your message...                      [Send 📤] │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Sélection Provider

**Auto Mode** (Recommandé):

- Cascade automatique: Cache → Gemini → Ollama
- Choisit le meilleur provider disponible
- Fallback si erreur

**Manual Mode**:

- Choisir provider spécifique
- Choisir modèle spécifique
- Contrôle total

### Modes de Conversation

| Mode          | Usage                 | System Prompt                |
| ------------- | --------------------- | ---------------------------- |
| **Assistant** | Conversation générale | "Helpful AI assistant"       |
| **Code**      | Programmation         | "Expert code assistant"      |
| **Creative**  | Écriture créative     | "Creative writing assistant" |
| **Research**  | Recherche et analyse  | "Research assistant"         |
| **Custom**    | Personnalisé          | Votre propre prompt          |

**Changer de mode**:

1. Cliquer sur "Mode: [Assistant ▼]"
2. Sélectionner nouveau mode
3. Le system prompt change automatiquement

---

## 🎯 Fonctionnalités Avancées

### 1. Custom System Prompts

**Utilisation**:

1. Sélectionner mode "Custom"
2. Entrer votre system prompt:
   ```
   Tu es un expert en sécurité informatique.
   Réponds de manière concise et technique.
   ```
3. Le prompt est transmis au backend ✅

**Transmission vérifiée**:

- Frontend: `OmegaGenerateArgs.systemPrompt`
- Backend: `ConversationRequest.custom_system_prompt`
- Pipeline: Priorité sur mode defaults

### 2. Mémoire Conversationnelle Intelligente

**Analyse automatique**:

- ✅ **Intention**: Question, Action, Emotion, Clarification, Meta
- ✅ **Émotion**: Valence, intensity, energy
- ✅ **Tags cognitifs**: Extraits du contexte
- ✅ **Résumé**: Généré automatiquement
- ✅ **Couches mémoire**: Immediate → Permanent
- ✅ **Liens**: Cross-conversation references

**Persistance**:

- **Chiffrement**: AES-256-GCM + Argon2id
- **Stockage**: `~/.local/share/com.titane.infinity/conversations/`
- **Auto-snapshot**: Tous les 10 messages
- **Reload**: Context restauré automatiquement

**Vérifier les conversations sauvegardées**:

```bash
ls -lah ~/.local/share/com.titane.infinity/conversations/
```

### 3. Multi-Conversation

**Créer nouvelle conversation**:

- Cliquer sur "Nouvelle Conversation"
- Chaque conversation a son propre context
- Mémorisation indépendante

**Charger conversation**:

- Liste des conversations dans sidebar
- Cliquer pour charger
- Context restauré instantanément

### 4. Monitoring & Analytics

**Provider Stats**:

- Latency tracking (ms)
- Success/failure rate
- Token usage

**Memory Stats**:

- Total conversations
- Total messages
- Memory layers distribution

**Accès**:

```bash
# Via commande Tauri (dev console)
conversation_health_check()
conversation_memory_stats()
```

---

## 🧪 Tests & Validation

### Test Scripts Disponibles

#### 1. Test Persistance Mémoire

```bash
./test_memory_persistence.sh
```

**Vérifie**:

- ✅ Répertoire storage créé
- ✅ Fichiers chiffrés
- ✅ Logs de sauvegarde
- ✅ Intégrité des données

#### 2. Test Intégration API

```bash
./test_api_integration.sh
```

**Vérifie**:

- ✅ OMEGA Pipeline commands (3/3)
- ✅ API Providers (3/3)
- ✅ Frontend integration
- ✅ TypeScript types
- ✅ Runtime services
- ✅ Compilation

**Résultats attendus**:

```
Total Tests:   23
✅ Passed:     16+
❌ Failed:     0
⏭️  Skipped:    7-
Success Rate:  69%+
```

### Test Manuel End-to-End

**Checklist**:

- [ ] 1. Lancer `pnpm run dev:tauri`
- [ ] 2. Ouvrir Chat IA
- [ ] 3. Sélectionner Ollama
- [ ] 4. Envoyer 3+ messages
- [ ] 5. Vérifier réponses correctes
- [ ] 6. Changer de mode (Code)
- [ ] 7. Vérifier system prompt change
- [ ] 8. Fermer app
- [ ] 9. Relancer app
- [ ] 10. Charger conversation
- [ ] 11. Vérifier context restauré
- [ ] 12. Continuer chat avec mémoire

---

## 🔧 Dépannage

### ❌ Erreur: "Provider not available"

**Cause**: Provider non configuré ou service arrêté

**Solution Ollama**:

```bash
# Vérifier service
ollama list

# Démarrer service
ollama serve

# Tester
ollama run llama3.2 "Hello"
```

**Solution Cloud (Gemini/OpenAI/Anthropic)**:

1. Vérifier API key dans Governance Center
2. Tester key: https://console.anthropic.com/workbench
3. Vérifier quota/crédits

---

### ❌ Erreur: "Conversation not found"

**Cause**: Fichier de conversation corrompu ou manquant

**Solution**:

```bash
# Vérifier fichiers
ls -lah ~/.local/share/com.titane.infinity/conversations/

# Recréer conversation
# 1. Créer nouvelle conversation
# 2. Envoyer message test
# 3. Vérifier fichier .enc créé
```

---

### ❌ Erreur: "Context not restored"

**Cause**: BUG-006 (fixed in v19.5.2) ou corruption

**Vérification**:

```bash
# Version TITANE∞
grep version package.json

# Doit être >= 19.5.2
```

**Solution si < 19.5.2**:

```bash
git pull origin MAIN
pnpm install
cargo build
```

---

### ⚠️ Warning: "Cognitive metadata lost on reload"

**Cause**: Limitation connue (Phase 2 improvement)

**Impact**: Minimal

- ✅ Messages préservés
- ✅ Context restauré
- ⚠️ Metadata (intention, emotion, tags) réinitialisés

**Workaround**: Aucun nécessaire

- Le chat fonctionne normalement
- Amélioration prévue Phase 2

---

### 🐛 Dev Server ne démarre pas

**Erreurs communes**:

**1. Port 5173 déjà utilisé**:

```bash
# Trouver processus
lsof -i :5173

# Tuer processus
kill -9 <PID>

# Relancer
pnpm run dev:tauri
```

**2. Cargo lock**:

```bash
# Tuer tous processus
killall -9 node vite tauri cargo

# Attendre 2s
sleep 2

# Relancer
pnpm run dev:tauri
```

**3. Dépendances manquantes**:

```bash
# Frontend
pnpm install

# Backend
cd src-tauri && cargo build
```

---

## 📊 Résumé État Système

### ✅ Validations Complètes

**Session Testing v19.5.2**:

- [x] 2 bugs critiques fixés (BUG-005, BUG-006)
- [x] 18/25 tests passed (72% success, 0 failures)
- [x] Memory persistence working
- [x] API integration verified
- [x] Intelligent analysis operational

**Commits**:

- `198e080`: Fix memory bugs + test suite
- `8625c0d`: Comprehensive documentation

**Documentation**:

- ✅ MEMORY_PERSISTENCE_FIX_v19.5.2.txt
- ✅ COMPREHENSIVE_TESTING_COMPLETE_v19.5.2.txt
- ✅ CHANGELOG_v19.5.2_TESTING.md
- ✅ SUCCESS_BANNER_v19.5.2_TESTING.txt
- ✅ test_memory_persistence.sh
- ✅ test_api_integration.sh

### 🎯 Providers Status

| Provider         | Local/Cloud | Statut              | Modèles        |
| ---------------- | ----------- | ------------------- | -------------- |
| **Ollama**       | Local       | ✅ Actif            | 10 modèles     |
| **Gemini**       | Cloud       | ⏸️ Key à configurer | 3 modèles      |
| **OpenAI**       | Cloud       | ⏸️ Key à configurer | 4 modèles      |
| **Anthropic**    | Cloud       | ⏸️ Key à configurer | 3 modèles      |
| **Auto**         | Cascade     | ✅ Ready            | Fallback smart |
| **TITANE Local** | Local       | ✅ Ready            | Custom model   |

---

## 🚀 Next Steps

### Utilisation Immédiate

1. Lancer dev server: `pnpm run dev:tauri`
2. Tester avec Ollama (local, gratuit)
3. Créer conversations, tester modes
4. Vérifier persistance mémoire

### Configuration Optionnelle

1. Ajouter API keys (Gemini/OpenAI/Anthropic)
2. Tester multi-provider cascade
3. Personnaliser system prompts
4. Explorer modes avancés

### Développement Futur (Phase 2)

1. Enrichir MemoryEntry.metadata avec cognitive data
2. Implémenter full-text search
3. Ajouter conversation tags/categories
4. Créer dashboard mémoire (stats, analytics)

---

## 📞 Support

**Logs en temps réel**:

```bash
# Dev logs
tail -f runtime/dev/logs/tauri.log | grep -i 'memory\|conversation\|omega'

# Vite logs
tail -f runtime/dev/logs/vite.log
```

**Documentation complète**:

- `COMPREHENSIVE_TESTING_COMPLETE_v19.5.2.txt`
- `MEMORY_PERSISTENCE_FIX_v19.5.2.txt`
- `CHANGELOG_v19.5.2_TESTING.md`
- `ACTIVATION_CHAT_IA_APIs_v19.3.0.md`

**Commandes utiles**:

```bash
# Status git
git status

# Derniers commits
git log --oneline -10

# Tests auto
./test_api_integration.sh
./test_memory_persistence.sh

# Build production (interdit sans autorisation)
# Ne pas exécuter `pnpm run build` / `tauri build` sans autorisation explicite.
```

---

**Version**: TITANE∞ v19.5.2 OMEGA Pipeline  
**Date**: 10 décembre 2025  
**Statut**: ✅ Tech-Ready (Dev) | **Production**: ⛔ EN ATTENTE (autorisation requise)

✨ **Bon Chat!** ✨
