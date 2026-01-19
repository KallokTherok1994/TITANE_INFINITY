# 🤖 TITANE∞ - GUIDE CONFIGURATION IA

## 🎯 Problème résolu

Le message **"Services IA déconnectés"** apparaît car aucun provider IA n'est actif.

---

## ✅ CORRECTIONS APPLIQUÉES

### 1. URL Gemini API corrigée
- **Avant** : `/v1beta/` (obsolète)
- **Après** : `/v1/` (stable)

### 2. Messages Fallback améliorés
- Instructions claires pour configurer IA
- Lien vers diagnostic automatique
- Format plus lisible

---

## 🔧 CONFIGURATION REQUISE

Tu as **2 options** pour activer l'IA :

### Option A : Ollama Local (Recommandé) 🏠

**Avantages :**
- ✅ Privé (aucune donnée envoyée sur internet)
- ✅ Gratuit
- ✅ Rapide après installation
- ✅ Fonctionne offline

**Installation :**

```bash
# 1. Installer Ollama
curl https://ollama.ai/install.sh | sh

# 2. Démarrer le service
ollama serve

# 3. Télécharger un modèle
ollama pull llama2
# ou plus performant :
ollama pull qwen2.5:latest
```

**Vérification :**
```bash
./diagnostic_ia.sh
# Doit afficher : ✅ Ollama service démarré
```

---

### Option B : Gemini API Cloud ☁️

**Avantages :**
- ✅ Aucune installation
- ✅ Très performant
- ✅ Multimodal (texte, image)

**Inconvénients :**
- ⚠️ Nécessite internet
- ⚠️ Données envoyées à Google

**Configuration :**

1. **Obtenir une clé API :**
   - Va sur : https://ai.google.dev
   - Connecte-toi avec ton compte Google
   - Clique "Get API Key"
   - Copie la clé (format `YOUR_GEMINI_API_KEY`)

2. **Ajouter dans .env :**
   ```bash
   # Ouvre le fichier
   nano .env

   # Vérifie/modifie cette ligne :
   VITE_GEMINI_API_KEY=ta_vraie_clé_ici
   ```

3. **Vérifier :**
   ```bash
   ./diagnostic_ia.sh
   # Doit afficher : ✅ Gemini API opérationnelle
   ```

---

## 🧪 TEST APRÈS CONFIGURATION

### Lancer TITANE∞ en Tauri

```bash
# Dans un terminal SYSTÈME (Super+T), pas VS Code Flatpak
cd /home/titane/Documents/TITANE_INFINITY
./dev_tauri.sh
```

### Tester le Chat IA

1. Ouvre l'onglet **Chat IA** (🤖)
2. Envoie un message : `Bonjour TITANE, es-tu opérationnel ?`
3. **Résultat attendu :**
   - ✅ Avec Ollama : Réponse générée localement
   - ✅ Avec Gemini : Réponse via API cloud
   - ❌ Sans config : Message fallback avec instructions

---

## 📊 DIAGNOSTIC AUTOMATIQUE

Le script `diagnostic_ia.sh` vérifie :
- ✅ Fichier .env présent
- ✅ Clés API configurées
- ✅ Service Ollama démarré
- ✅ Modèles installés
- ✅ Connexion Gemini API

**Utilisation :**
```bash
./diagnostic_ia.sh
```

---

## 🔄 ORDRE DE PRIORITÉ (Cascade)

TITANE∞ essaie les providers dans cet ordre :

1. **Fallback** (toujours actif, réponses de secours)
2. **Gemini** (si `VITE_GEMINI_API_KEY` configurée)
3. **Ollama** (si service démarré sur port 11434)

⚠️ **Note** : Fallback est testé en PREMIER pour le développement (pas de config requise).

Pour inverser l'ordre (Gemini → Ollama → Fallback), modifie :
```typescript
// src/services/ai/orchestrator.ts ligne 38
private providers = [geminiProvider, ollamaProvider, fallbackProvider];
```

---

## 🎨 INTERFACE CHAT IA

Une fois configuré, tu verras dans le Chat :

```
👤 Utilisateur: Bonjour TITANE

🤖 TITANE∞: [gemini|ollama]
Bonjour ! Je suis TITANE∞, opérationnel et prêt...
```

Le badge indique quel provider a répondu :
- `[gemini]` = Google Gemini API
- `[ollama]` = Ollama local
- `[fallback]` = Mode dégradé

---

## 🚨 DÉPANNAGE

### Erreur : "Gemini API: 403 Forbidden"
- Clé API invalide ou expirée
- Régénère une nouvelle clé sur ai.google.dev

### Erreur : "Ollama: Connection refused"
- Service non démarré
- Lance : `ollama serve`

### Erreur : "Ollama: No models found"
- Aucun modèle installé
- Lance : `ollama pull llama2`

### Message : "Services IA déconnectés"
- Aucun provider actif
- Configure Gemini OU Ollama (voir ci-dessus)

---

## 📝 FICHIERS MODIFIÉS

- ✅ `src/services/ai/providers/gemini.ts` : URL API corrigée
- ✅ `src/services/ai/providers/fallback.ts` : Messages améliorés
- ✅ `diagnostic_ia.sh` : Script de diagnostic créé

---

## 🔩 TITANE∞ — IA CONFIGURÉE, PRÊT À PENSER 🚀
