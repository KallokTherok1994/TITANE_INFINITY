# 🧪 TEST TAURI MODE - Guide de Validation

**Version :** v16.1  
**Date :** 21 novembre 2025  
**Objectif :** Valider le mode TAURI-ONLY + OFFLINE FIRST

---

## ✅ PRÉREQUIS

### 1. Build Frontend

```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
pnpm run build
```

**Attendu :**
```
✓ 360 modules transformed.
dist/index.html                 1.56 kB
dist/assets/main-DvU2vu7p.css  64.56 kB
dist/assets/vendor-QYCSsVv3.js 139.46 kB
dist/assets/main-Dcb9geZo.js   253.05 kB
✓ built in ~2s
```

### 2. Validation Configuration

```bash
./scripts/validate-tauri-only.sh
```

**Attendu :**
```
✅ pnpm run dev configuré correctement
✅ vite preview désactivé
✅ devUrl configuré correctement
✅ HMR désactivé (mode Tauri)
✅ strictPort activé
✅ Port 5173 libre (aucun serveur HTTP)
✅ Port 8080 libre
✅ Port 4173 libre
✅ Build dist/ présent

⚠️ MODE TAURI-ONLY: VALIDÉ
```

### 3. Vérification Ollama (Optionnel)

```bash
# Vérifier si Ollama est installé
which ollama

# Si installé, vérifier status
curl http://localhost:11434/api/tags

# Modèles recommandés pour TITANE
ollama pull mistral
ollama pull llama2
```

---

## 🚀 TEST 1 : Lancement Tauri Dev

### Commande

```bash
pnpm run dev
```

### Comportement Attendu

1. **Terminal affiche :**
   ```
   Running beforeDevCommand: pnpm run build
   ✓ 360 modules transformed
   Compiling src-tauri/...
   Finished dev [unoptimized + debuginfo]
   ```

2. **Fenêtre Tauri s'ouvre :**
   - ✅ Application native (pas de navigateur web)
   - ✅ Titre : "TITANE INFINITY"
   - ✅ UI responsive et fonctionnelle
   - ✅ Console développeur accessible (F12)

3. **Navigateur NE S'OUVRE PAS :**
   - ❌ Aucun onglet Firefox/Chrome
   - ❌ Aucune URL localhost:5173

### Vérification Console

**Dans la fenêtre Tauri, appuyer F12 :**

```javascript
// Console devrait afficher :
✅ TITANE INFINITY v16.1 - OFFLINE FIRST MODE
🏠 Mode LOCAL activé par défaut
🔒 Confirmation cloud requise : true
```

### En cas d'échec

**Problème : Navigateur s'ouvre au lieu de Tauri**

```bash
# Vérifier package.json
cat package.json | grep '"dev"'
# Doit afficher : "dev": "tauri dev"

# Si "dev": "vite", corriger :
npm pkg set scripts.dev="tauri dev"
```

**Problème : Erreur "beforeDevCommand failed"**

```bash
# Vérifier tauri.conf.json
cat src-tauri/tauri.conf.json | grep -A 2 'beforeDevCommand'
# Doit afficher : "beforeDevCommand": "pnpm run build"

# Test build séparément :
pnpm run build
# Si erreurs, corriger avant de relancer pnpm run dev
```

---

## 🤖 TEST 2 : Chat IA Local (Ollama)

### Scénario A : Ollama Installé

**Étapes :**

1. Ouvrir l'app : `pnpm run dev`
2. Naviguer vers **Chat IA**
3. Taper message : `"Bonjour TITANE, présente-toi en 2 phrases"`
4. Observer console (F12)

**Console attendue :**

```javascript
🤖 [LOCAL FIRST] Tentative Ollama...
POST http://localhost:11434/api/generate
✅ Ollama OK
```

**Résultat attendu :**
- Réponse IA en français
- Délai : 0.5-2s selon modèle
- Aucune modal de confirmation

### Scénario B : Ollama Non Installé

**Console attendue :**

```javascript
🤖 [LOCAL FIRST] Tentative Ollama...
⚠️ Ollama non disponible
🌐 [CLOUD MODE] Modal confirmation affichée
```

**Modal attendue :**

```
┌───────────────────────────────────────┐
│   🌐 Accès API Cloud Requis          │
│                                       │
│   Gemini AI nécessite une connexion  │
│   Ollama local non disponible         │
│                                       │
│   ⚠️ Mode OFFLINE FIRST activé       │
│                                       │
│  ┌────────────┐  ┌─────────────────┐ │
│  │ ❌ Refuser │  │ ✅ Cette session │ │
│  └────────────┘  └─────────────────┘ │
│                                       │
│  ┌───────────────────────────────────┐│
│  │ ⭐ Toujours autoriser Gemini     ││
│  └───────────────────────────────────┘│
└───────────────────────────────────────┘
```

**Test 2.1 : Cliquer "❌ Refuser"**

Console :
```javascript
❌ Accès cloud refusé par l'utilisateur
⚠️ Fallback local activé
```

Résultat : Réponse fallback générique

**Test 2.2 : Cliquer "✅ Cette session"**

Console :
```javascript
✅ Gemini AI approuvé pour cette session
🌐 [CLOUD MODE] Tentative Gemini API...
✅ Gemini OK
```

Résultat : Réponse Gemini (si clé API configurée)

**Test 2.3 : Cliquer "⭐ Toujours autoriser"**

Console :
```javascript
⭐ Gemini AI approuvé définitivement
💾 Approbations permanentes sauvegardées
```

Résultat : 
- Réponse Gemini
- Prochains messages → Gemini directement (pas de modal)
- Sauvegarde dans `localStorage.titane_permanent_cloud_approvals`

---

## 🎙️ TEST 3 : Voice Mode

### Étapes

1. Ouvrir l'app : `pnpm run dev`
2. Activer **Voice Mode** (bouton micro 🎙️)
3. Cliquer bouton **"Parler"** ou équivalent
4. Observer console

### Console Attendue (TTS Local)

```javascript
🔊 [LOCAL FIRST] TTS Local...
[VOICE] TTS Local: espeak
```

### Audio Attendu

- Son de synthèse vocale (voix robotique espeak)
- Qualité : Basique mais fonctionnelle
- Latence : <100ms

### Test avec Cloud TTS (Optionnel)

**Si bouton "Haute Qualité" ou équivalent :**

Console :
```javascript
🌐 Modal confirmation TTS Cloud...
```

Modal attendue (similaire à Chat IA)

**Si approuvé :**
```javascript
🌐 TTS Cloud (Google)...
✅ Audio haute qualité
```

---

## ⚙️ TEST 4 : Settings Modal

### Étapes

1. Ouvrir l'app
2. Cliquer icône **⚙️** (Settings)
3. Modal s'affiche

### Vérifications

**Section 1 : Status Internet**

```
📡 Status Internet
🟢 En ligne  [🔄 Vérifier]
```

- Cliquer **"🔄 Vérifier"**
- Status doit se mettre à jour
- Indicateur change : 🟢 (en ligne) ou 🔴 (hors ligne)

**Section 2 : Mode AI**

Trois boutons :
- 🏠 **Local** (100% offline) ← Actif par défaut
- 🌐 **Cloud** (APIs externes)
- ⚡ **Hybrid** (Local + Cloud)

Test :
1. Cliquer **🌐 Cloud**
2. Vérifier localStorage :
   ```javascript
   JSON.parse(localStorage.getItem('titane_ai_config'))
   // mode: 'cloud'
   ```

**Section 3 : Provider Cloud**

Select dropdown :
- Google Gemini
- OpenAI GPT
- Ollama (Local)

Test : Changer provider → Vérifier localStorage

**Section 4 : Confirmations**

Checkbox :
```
☑️ Demander confirmation avant chaque appel API cloud
```

**Section 5 : Approbations Actives**

Si approbations présentes :
```
⭐ Permanentes: Gemini AI
🔄 Session: Google TTS
```

Bouton : **"🗑️ Réinitialiser toutes les approbations"**

Test :
1. Cliquer bouton
2. Confirmer alerte
3. Vérifier console : `🔄 Toutes les approbations réinitialisées`
4. localStorage vidé

---

## 💾 TEST 5 : Memory & Persistence

### Test Historique Chat

**Étapes :**

1. Envoyer 3 messages dans Chat IA
2. Vérifier localStorage :
   ```javascript
   JSON.parse(localStorage.getItem('titane_chat_history'))
   // Array de 6 messages (3 user + 3 assistant)
   ```
3. Fermer app (Ctrl+C dans terminal)
4. Relancer : `pnpm run dev`
5. Vérifier historique toujours présent

**Attendu :** Historique persiste entre sessions

### Test Clear History

1. Bouton "Effacer historique" (si présent)
2. Vérifier localStorage vidé
3. UI affiche conversation vide

---

## 🔒 TEST 6 : Sécurité & Confidentialité

### Vérification Aucun Appel Automatique

**Outil : Chrome DevTools Network (ou équivalent Tauri)**

1. Ouvrir DevTools (F12) → Onglet **Network**
2. Démarrer l'app
3. Naviguer dans UI (Chat, Voice, Settings)
4. **NE PAS envoyer de message**

**Attendu :**
- ❌ Aucune requête vers `googleapis.com`
- ❌ Aucune requête vers `openai.com`
- ✅ Seules requêtes locales : `localhost:11434` (si Ollama test)

### Test Refus Persistant

1. Modal confirmation apparaît
2. Cliquer **"❌ Refuser"** 3 fois de suite
3. Vérifier console :
   ```javascript
   ❌ Accès cloud refusé (x3)
   ⚠️ Fallback local (x3)
   ```
4. **Attendu :** Aucun appel cloud effectué

---

## 📊 TEST 7 : Performance

### Métriques à Mesurer

**1. Temps de démarrage**
```bash
time pnpm run dev
# Target : <5s (build + compilation Rust)
```

**2. Mémoire Tauri**
```bash
# Pendant que l'app tourne :
ps aux | grep titane-infinity
# Target : <200 MB RSS
```

**3. CPU Idle**
```bash
top -p $(pgrep -f titane-infinity)
# Target : <2% CPU en idle
```

**4. Latence Ollama (si installé)**
- Envoyer message court : "Bonjour"
- Mesurer temps réponse
- Target : <2s

---

## 🐛 PROBLÈMES COURANTS

### Problème 1 : "Tauri CLI not found"

**Solution :**
```bash
pnpm install --save-dev @tauri-apps/cli
# OU
cargo install tauri-cli
```

### Problème 2 : "libwebkit2gtk not found"

**Solution (Ubuntu/Debian) :**
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

### Problème 3 : Modal confirmation ne s'affiche jamais

**Diagnostic :**
```bash
# Vérifier fichier présent
ls -la src/utils/cloudAPIConfirmation.ts

# Vérifier import dans aiService.ts
grep "confirmCloudAPIUsage" src/services/aiService.ts
```

**Solution :** Vérifier code source correspondant au guide architecture

### Problème 4 : Ollama "Connection refused"

**Solution :**
```bash
# Démarrer Ollama service
ollama serve &

# Vérifier status
curl http://localhost:11434/api/tags
```

---

## ✅ CHECKLIST FINALE

Avant de considérer le mode Tauri validé :

- [ ] `pnpm run build` : ✅ 0 erreurs
- [ ] `./scripts/validate-tauri-only.sh` : ✅ Validé
- [ ] `pnpm run dev` : ✅ Fenêtre Tauri s'ouvre (pas navigateur)
- [ ] Chat IA : ✅ Fonctionne (Ollama ou Gemini avec confirmation)
- [ ] Modal confirmation : ✅ S'affiche correctement
- [ ] Voice Mode : ✅ TTS local fonctionne
- [ ] Settings Modal : ✅ Toutes sections fonctionnelles
- [ ] Memory : ✅ Historique persiste (localStorage)
- [ ] Sécurité : ✅ Aucun appel cloud sans confirmation
- [ ] Performance : ✅ Mémoire <200MB, CPU <2% idle

---

## 📝 RAPPORT DE TEST

**Template à remplir après tests :**

```markdown
## 🧪 RAPPORT DE TEST - TAURI MODE v16.1

**Date :** [Date]
**Testeur :** [Nom]
**OS :** [Linux/Windows/macOS + version]

### Environnement
- Node.js : [version]
- npm : [version]
- Cargo : [version]
- Ollama : [Installé Oui/Non, version]

### Résultats

| Test | Status | Notes |
|------|--------|-------|
| Build Frontend | ✅/❌ | [Temps, erreurs] |
| Validation Script | ✅/❌ | [Erreurs, warnings] |
| Lancement Tauri | ✅/❌ | [Fenêtre native Oui/Non] |
| Chat IA Local | ✅/❌ | [Ollama fonctionnel] |
| Modal Confirmation | ✅/❌ | [UI correcte] |
| Voice Mode | ✅/❌ | [TTS local OK] |
| Settings Modal | ✅/❌ | [Toutes sections OK] |
| Memory Persistence | ✅/❌ | [localStorage OK] |
| Sécurité | ✅/❌ | [Pas d'appels auto] |
| Performance | ✅/❌ | [RAM, CPU] |

### Métriques
- Temps démarrage : [X]s
- Mémoire RSS : [X] MB
- CPU idle : [X]%
- Latence Ollama : [X]s

### Bugs Trouvés
[Liste des problèmes rencontrés]

### Recommandations
[Améliorations suggérées]

### Conclusion
[✅ PRODUCTION READY / ⚠️ CORRECTIONS NÉCESSAIRES / ❌ BLOQUEURS]
```

---

## 🎯 CONCLUSION

Ce guide permet de valider complètement le mode **TAURI-ONLY + OFFLINE FIRST** de TITANE INFINITY v16.1.

**Tests critiques (minimum) :**
1. ✅ Lancement Tauri (pas navigateur)
2. ✅ Modal confirmation cloud
3. ✅ Aucun appel API automatique

**Tests complets (recommandé) :**
- Tous les 7 tests ci-dessus

**Durée estimée :**
- Tests critiques : ~5 minutes
- Tests complets : ~20 minutes

**État actuel (21 nov 2025) :**
- Configuration : ✅ Complète
- Build : ✅ Fonctionnel (2.03s, 0 erreurs)
- Tests : ⏳ À exécuter

**Prochaine étape : Exécuter `pnpm run dev` et commencer TEST 1** 🚀
