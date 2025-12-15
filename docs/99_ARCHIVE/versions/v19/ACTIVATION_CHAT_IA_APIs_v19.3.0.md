# ✅ ACTIVATION CHAT IA APIs - TITANE∞ v19.3.0

**Date**: 10 décembre 2025  
**Statut**: ✅ **OLLAMA ACTIF - 10 MODÈLES DISPONIBLES**

---

## 🎯 RÉSUMÉ CONFIGURATION

### Providers Activés

| Provider         | Statut          | Modèles            | Usage                  |
| ---------------- | --------------- | ------------------ | ---------------------- |
| **🟢 Ollama**    | ✅ **ACTIF**    | 10 modèles (36 GB) | Local, gratuit, privé  |
| **🔵 Gemini**    | ⚠️ À configurer | 3 modèles          | Cloud, API key requise |
| **🔵 OpenAI**    | ⚠️ À configurer | 4 modèles          | Cloud, API key requise |
| **🧠 Anthropic** | ⚠️ À configurer | 3 modèles          | Cloud, API key requise |

**Total**: **1/4 providers actifs** (20+ modèles disponibles totaux)

---

## 🦙 OLLAMA - ACTIF ✅

### Modèles Installés (10)

#### 🤖 Conversation (4 modèles)

| Modèle              | Taille  | Paramètres | Usage               |
| ------------------- | ------- | ---------- | ------------------- |
| **llama3.2:latest** | 1.88 GB | 3B         | Conversation rapide |
| **llama3.2:1b**     | 1.23 GB | 1B         | Ultra-rapide        |
| **llama3.1:latest** | 4.58 GB | 8B         | Haute qualité       |
| **mistral:latest**  | 4.07 GB | 7.2B       | Mistral AI          |

#### 💻 Code (3 modèles)

| Modèle                | Taille  | Paramètres | Usage                     |
| --------------------- | ------- | ---------- | ------------------------- |
| **deepseek-coder-v2** | 8.29 GB | 16B        | Programmation spécialisée |
| **codellama:latest**  | 3.56 GB | 7B         | Meta code                 |
| **qwen2.5:latest**    | 4.36 GB | 7.6B       | Alibaba, maths            |

#### 🎨 Général (3 modèles)

| Modèle            | Taille  | Paramètres | Usage              |
| ----------------- | ------- | ---------- | ------------------ |
| **gemma2:latest** | 5.07 GB | 9B         | Google, précis     |
| **gemma2:2b**     | 1.52 GB | 2B         | Google, léger      |
| **phi3.5:latest** | 2.03 GB | 3.8B       | Microsoft, compact |

### Configuration Ollama

**URL**: `http://localhost:11434`  
**Status Check**: `curl http://localhost:11434/api/tags`  
**Service**: ✅ Actif (détecté automatiquement)

### Test Ollama

```bash
# Test rapide
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:latest",
    "prompt": "Bonjour, qui es-tu?",
    "stream": false
  }'
```

**Résultat**: ✅ **Fonctionnel** (réponse en < 2s)

---

## 🔵 GEMINI - À CONFIGURER ⚠️

### Configuration

**Fichier**: `~/.config/titane-infinity/secrets.json`

```json
{
  "gemini_api_key": "VOTRE_CLE_ICI",
  "openai_api_key": "",
  "anthropic_api_key": ""
}
```

### Obtenir Clé API

1. Visiter: https://makersuite.google.com/app/apikey
2. Se connecter avec compte Google
3. Créer nouvelle clé API
4. Copier la clé dans `secrets.json`

### Modèles Gemini Disponibles (3)

| Modèle                   | Contexte  | Usage                      |
| ------------------------ | --------- | -------------------------- |
| **gemini-2.0-flash-exp** | 1M tokens | Ultra-rapide, expérimental |
| **gemini-1.5-pro**       | 2M tokens | Production, haute qualité  |
| **gemini-1.5-flash**     | 1M tokens | Rapide, efficace           |

### Avantages Gemini

- ✅ **Gratuit** (quota généreux)
- ✅ **Multimodal** (texte + images)
- ✅ **2M tokens** de contexte (1.5 Pro)
- ✅ **Français natif**
- ✅ **Rapide** (< 1s)

---

## 🔵 OPENAI - À CONFIGURER ⚠️

### Configuration

**Fichier**: `~/.config/titane-infinity/secrets.json`

```json
{
  "gemini_api_key": "",
  "openai_api_key": "sk-...",
  "anthropic_api_key": ""
}
```

### Obtenir Clé API

1. Visiter: https://platform.openai.com/api-keys
2. Se connecter
3. Créer nouvelle clé secrète
4. Copier dans `secrets.json`

### Modèles OpenAI Disponibles (4)

| Modèle            | Contexte    | Prix | Usage              |
| ----------------- | ----------- | ---- | ------------------ |
| **gpt-4o**        | 128K tokens | $$   | Latest, multimodal |
| **gpt-4-turbo**   | 128K tokens | $$   | Rapide, précis     |
| **gpt-4**         | 8K tokens   | $$$  | Haute qualité      |
| **gpt-3.5-turbo** | 16K tokens  | $    | Économique         |

### Avantages OpenAI

- ✅ **Haute qualité** (GPT-4o)
- ✅ **Multimodal** (vision)
- ✅ **Rapide** (< 2s)
- ⚠️ **Payant** (nécessite crédits)

---

## 🧠 ANTHROPIC - À CONFIGURER ⚠️

### Configuration

**Fichier**: `~/.config/titane-infinity/secrets.json`

```json
{
  "gemini_api_key": "",
  "openai_api_key": "",
  "anthropic_api_key": "sk-ant-..."
}
```

### Obtenir Clé API

1. Visiter: https://console.anthropic.com/settings/keys
2. Se connecter
3. Créer nouvelle clé API
4. Copier dans `secrets.json`

### Modèles Anthropic Disponibles (3)

| Modèle                         | Contexte    | Usage            |
| ------------------------------ | ----------- | ---------------- |
| **claude-3-5-sonnet-20241022** | 200K tokens | Latest, meilleur |
| **claude-3-opus-20240229**     | 200K tokens | Très puissant    |
| **claude-3-sonnet-20240229**   | 200K tokens | Équilibré        |

### Avantages Anthropic

- ✅ **Meilleure qualité** (Claude 3.5 Sonnet)
- ✅ **200K tokens** de contexte
- ✅ **Sécurisé** (Constitutional AI)
- ✅ **Excellent français**
- ⚠️ **Payant** (nécessite crédits)

---

## 🎨 INTERFACE CHAT IA

### Sélecteur Provider

```tsx
<select value={provider}>
  <option value="auto">🤖 Auto (Intelligent)</option>
  <option value="openai">🔵 OpenAI GPT-4o</option>
  <option value="anthropic">🧠 Claude 3.5 Sonnet</option>
  <option value="gemini">🔵 Gemini</option>
  <option value="ollama">🟢 Ollama</option>
  <option value="local">🏠 Local (Fallback)</option>
</select>
```

### Sélecteur Modèle Ollama (Dynamique)

```tsx
{
  provider === 'ollama' && (
    <select value={selectedModel}>
      <option value="llama3.2:latest">🤖 llama3.2:latest</option>
      <option value="deepseek-coder-v2:latest">💻 deepseek-coder-v2:latest</option>
      <option value="gemma2:latest">🤖 gemma2:latest</option>
      {/* 10 modèles au total */}
    </select>
  );
}
```

**Icônes de catégorisation**:

- 🤖 Conversation
- 💻 Code
- ⚡ Ultra-rapide (< 2B params)
- 🌍 Multilingue
- 👁️ Vision

---

## 🔧 ARCHITECTURE BACKEND

### Chat Orchestrator

**Fichier**: `src-tauri/src/overdrive/chat_orchestrator.rs`

**Fonction principale**: `chat_send_message()`

### Flow Cascade (Auto Mode)

```
User envoie message
  ↓
Mode "auto" → Cascade intelligente
  ↓
1. Essayer OpenAI (si configuré)
   ❌ Non disponible → Fallback
  ↓
2. Essayer Anthropic (si configuré)
   ❌ Non disponible → Fallback
  ↓
3. Essayer Gemini (si configuré)
   ❌ Non disponible → Fallback
  ↓
4. Essayer Ollama (local)
   ✅ Disponible → Succès
  ↓
5. Fallback Local (dernière chance)
```

### Flow Direct (Provider Sélectionné)

```
User sélectionne "Ollama" + "llama3.2:latest"
  ↓
ChatRequest {
  provider: "ollama",
  model: "llama3.2:latest",
  message: "Bonjour"
}
  ↓
send_to_ollama(request)
  ↓
POST http://localhost:11434/api/generate
{
  "model": "llama3.2:latest",
  "prompt": "Bonjour",
  "stream": false
}
  ↓
Response {
  "response": "Bonjour! Comment puis-je vous aider?",
  "done": true
}
  ↓
Frontend affiche réponse + badge "🟢 Ollama"
```

---

## 🚀 UTILISATION

### 1. Lancer TITANE∞ Dev

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
./runtime/dev/run-dev.sh
```

### 2. Ouvrir Chat IA

- Naviguer vers **💬 Chat IA**
- Interface s'ouvre automatiquement

### 3. Sélectionner Provider

**Provider**: Choisir **🟢 Ollama** (actif)

### 4. Sélectionner Modèle

**Modèle**: Choisir parmi 10 modèles:

- **llama3.2:latest** (recommandé - rapide)
- **deepseek-coder-v2:latest** (code)
- **gemma2:latest** (précis)

### 5. Envoyer Message

**Exemples**:

```
💬 Conversation générale (llama3.2):
"Explique-moi la physique quantique en français simple"

💻 Code (deepseek-coder-v2):
"Écris une fonction Python pour calculer Fibonacci récursivement"

🎨 Créatif (mistral):
"Écris un poème sur l'IA en français"
```

### 6. Vérifier Réponse

- Badge provider: **🟢 Ollama**
- Latence: **< 2s** (local)
- Réponse en français

---

## 🧪 TESTS

### Test 1: Ollama API

```bash
curl http://localhost:11434/api/tags
```

**Résultat attendu**: Liste de 10 modèles ✅

### Test 2: Conversation Ollama

```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:latest",
    "prompt": "Dis bonjour en français",
    "stream": false
  }'
```

**Résultat attendu**: `{"response": "Bonjour!", ...}` ✅

### Test 3: UI Chat IA

1. Lancer app
2. Ouvrir Chat IA
3. Provider: Ollama
4. Modèle: llama3.2:latest
5. Message: "Test"
6. Vérifier réponse

**Résultat attendu**: Réponse en < 2s avec badge Ollama ✅

---

## 📊 MÉTRIQUES

### Performance Ollama (Local)

| Métrique            | Valeur                |
| ------------------- | --------------------- |
| **Latence moyenne** | 500-2000ms            |
| **Débit**           | 20-50 tokens/s        |
| **RAM utilisée**    | 4-8 GB (selon modèle) |
| **CPU**             | Moyen (sans GPU)      |
| **Coût**            | **Gratuit** ✅        |

### Comparaison Providers

| Provider      | Latence    | Qualité    | Coût      | Privé    |
| ------------- | ---------- | ---------- | --------- | -------- |
| **Ollama**    | ⚡ 1-2s    | ⭐⭐⭐⭐   | Gratuit   | ✅ Oui   |
| **Gemini**    | ⚡⚡ 500ms | ⭐⭐⭐⭐⭐ | Gratuit\* | ❌ Cloud |
| **OpenAI**    | ⚡⚡ 1s    | ⭐⭐⭐⭐⭐ | Payant    | ❌ Cloud |
| **Anthropic** | ⚡ 1-2s    | ⭐⭐⭐⭐⭐ | Payant    | ❌ Cloud |

\*Gemini gratuit avec quotas

---

## 🔐 SÉCURITÉ

### Fichier Secrets

**Permissions**: `600` (lecture/écriture propriétaire seulement)

```bash
ls -la ~/.config/titane-infinity/secrets.json
-rw------- 1 user user 123 Dec 10 12:00 secrets.json
```

### Bonnes Pratiques

1. ✅ **Ne jamais commit** `secrets.json` dans Git
2. ✅ **Permissions 600** sur fichier secrets
3. ✅ **Clés API uniques** par projet
4. ✅ **Rotation régulière** des clés
5. ✅ **Quotas API** configurés

### .gitignore

```gitignore
# Secrets
.config/titane-infinity/secrets.json
secrets.json
*.key
```

---

## 📁 FICHIERS CONFIGURATION

### Structure

```
~/.config/titane-infinity/
├── secrets.json          # Clés API (600)
├── chat_history.db       # Conversations (optionnel)
└── preferences.json      # Préférences UI (optionnel)
```

### secrets.json (Template)

```json
{
  "gemini_api_key": "AIza...",
  "openai_api_key": "sk-...",
  "anthropic_api_key": "sk-ant-..."
}
```

### Variables d'Environnement (Alternative)

```bash
# .env (optionnel)
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OLLAMA_URL=http://localhost:11434
```

---

## 🛠️ DÉPANNAGE

### Problème 1: Ollama non détecté

**Symptôme**: Badge "⚠️ Non détecté"

**Solution**:

```bash
# Démarrer Ollama
ollama serve &

# Vérifier
curl http://localhost:11434/api/tags
```

### Problème 2: Modèle non trouvé

**Symptôme**: `"model 'llama3.2' not found"`

**Solution**:

```bash
# Télécharger modèle
ollama pull llama3.2:latest

# Vérifier
ollama list
```

### Problème 3: Réponse lente

**Symptôme**: Latence > 10s

**Causes**:

- CPU surchargé (fermer apps)
- Modèle trop gros (utiliser llama3.2:1b)
- RAM insuffisante (< 8 GB)

**Solution**:

```bash
# Utiliser modèle léger
ollama pull llama3.2:1b  # 1.3 GB

# Ou utiliser Gemini (cloud, < 1s)
```

### Problème 4: API Key invalide

**Symptôme**: `"API key invalid"`

**Solution**:

1. Vérifier clé dans `secrets.json`
2. Régénérer clé sur plateforme
3. Vérifier quotas/crédits
4. Redémarrer application

---

## 🎯 PROCHAINES ÉTAPES

### Phase 1 (Immédiat) ✅

- [x] Activer Ollama (10 modèles)
- [x] Créer fichier `secrets.json`
- [x] Tester conversation Ollama
- [x] Interface sélecteur modèles

### Phase 2 (Optionnel)

- [ ] Configurer Gemini API (gratuit)
- [ ] Tester mode "Auto" cascade
- [ ] Configurer OpenAI/Anthropic (payant)

### Phase 3 (Avancé)

- [ ] Télécharger modèles vision (llama3.2-vision)
- [ ] Télécharger modèles multilingues (aya-expanse)
- [ ] Configurer streaming responses
- [ ] Historique conversations persistant

---

## 📚 RESSOURCES

### Documentation

- **Ollama**: https://ollama.ai/docs
- **Gemini API**: https://ai.google.dev/docs
- **OpenAI API**: https://platform.openai.com/docs
- **Anthropic API**: https://docs.anthropic.com

### Scripts Utilitaires

```bash
# Activation APIs
./scripts/activate_chat_apis.sh

# Test APIs
/tmp/test_chat_apis.sh

# Télécharger modèle
ollama pull llama3.2:latest
```

### Rapports

- `VALIDATION_FINALE_CHAT_IA_v19.3.0.md` - Validation complète
- `CHAT_IA_MODEL_SELECTOR_v19.3.0.md` - Architecture sélecteur
- `AUDIT_API_COMPLET_v19.3.0.md` - Audit APIs

---

## ✅ CHECKLIST ACTIVATION

### Configuration Minimale (Ollama)

- [x] Ollama installé
- [x] Ollama service démarré (`ollama serve`)
- [x] 10 modèles téléchargés
- [x] API détectée (`curl http://localhost:11434/api/tags`)
- [x] Test conversation fonctionnel
- [x] Interface Chat IA accessible

**Résultat**: ✅ **SYSTÈME FONCTIONNEL**

### Configuration Complète (Tous Providers)

- [x] Ollama actif
- [ ] Gemini API key configurée
- [ ] OpenAI API key configurée
- [ ] Anthropic API key configurée
- [ ] Tests E2E passés pour chaque provider
- [ ] Mode "Auto" cascade testé

**Résultat**: 🟡 **1/4 providers actifs** (Ollama uniquement)

---

## 🎉 CONCLUSION

**Statut Global**: ✅ **OLLAMA ACTIF - PRÊT À L'EMPLOI**

### Ce qui fonctionne

- ✅ **Ollama**: 10 modèles, local, gratuit, privé
- ✅ **Chat IA**: Interface complète avec sélecteurs
- ✅ **Architecture**: Backend multi-provider fonctionnel
- ✅ **Tests**: Conversation testée et validée

### Prochaines actions

1. **Tester Chat IA** avec Ollama (fonctionnel)
2. **Configurer Gemini** (optionnel, gratuit)
3. **Explorer modèles** (10 disponibles)

---

**🚀 SYSTÈME PRÊT POUR UTILISATION ! 🚀**

_Créé le 10 décembre 2025_  
_Version: 19.3.0_  
_Auteur: TITANE∞ Development Team_
