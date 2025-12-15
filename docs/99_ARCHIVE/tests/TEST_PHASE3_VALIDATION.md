# 🧪 PHASE 3 - VALIDATION MINIMALE OBLIGATOIRE

**Date**: 12 décembre 2025  
**Mode**: TEMP CLEANUP - Noyau Chat Minimal  
**Backup**: `backup/chat-pre-cleanup` (tag: `BACKUP_TITANE_CHAT_PRE_PURGE`)

---

## 🎯 OBJECTIF

Valider que le **noyau chat minimal** fonctionne correctement avec **Ollama uniquement**, sans fallback silencieux.

---

## 📋 PRÉ-REQUIS

### 1. Ollama doit être lancé

```bash
# Vérifier si Ollama tourne
curl http://localhost:11434/api/tags 2>/dev/null && echo "✅ Ollama disponible" || echo "❌ Ollama offline"

# Si offline, lancer Ollama
ollama serve
```

### 2. Modèle Ollama installé

```bash
# Lister les modèles
ollama list

# Si aucun modèle, installer llama3.1
ollama pull llama3.1
```

---

## 🚀 LANCEMENT APPLICATION

### Terminal 1: Lancer TITANE∞

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
npm run dev:tauri
```

**Attendu:**

- Vite démarre sur `http://localhost:5173`
- Tauri ouvre une fenêtre
- Console affiche: `[CHAT] ✅ UnifiedMemory initialized`

---

## ✅ CHECKLIST VALIDATION (OBLIGATOIRE)

### Test 1: Input actif/inactif

- [ ] ✅ L'input textarea est cliquable
- [ ] ✅ L'input accepte la saisie clavier
- [ ] ✅ Le placeholder "Posez votre question..." est visible

**Si échec**: Input bloqué → Vérifier console erreurs React

---

### Test 2: Bouton Envoyer débloqué

**Actions:**

1. Taper "test" dans l'input
2. Observer le bouton Envoyer

**Attendu:**

- [ ] ✅ Bouton devient actif (pas grisé)
- [ ] ✅ Cliquer le bouton fonctionne
- [ ] ✅ Bouton ne reste PAS bloqué après envoi

**Si échec**: Bouton reste bloqué → `messageSent.current` problème

---

### Test 3: Réponses dynamiques (CRITIQUE)

**Prompts à envoyer (un par un):**

1. `Bonjour`
2. `Quelle est la capitale de la France ?`
3. `Raconte-moi une blague`
4. `Explique-moi Python en 2 lignes`
5. `Quel temps fait-il ?`

**Attendu:**

- [ ] ✅ Chaque réponse est **différente**
- [ ] ✅ Aucune réponse statique répétée (pas de "Bonjour ! Je suis TITANE∞...")
- [ ] ✅ Réponses contiennent du contenu pertinent (pas juste "echo")
- [ ] ✅ Les 5 messages s'envoient sans blocage

**Si échec**: Réponses identiques → Ollama ne répond pas, fallback local activé

---

### Test 4: Logs backend (PREUVE)

**Observer les logs console Tauri:**

**Logs ATTENDUS:**

```
[CHAT ROUTER] 📋 Provider cascade = ["ollama"]
[CHAT ROUTER] 🧪 Testing provider = ollama
[CHAT] ✅ ollama response (350 tokens, 2340ms)
```

**Logs INTERDITS (preuves d'échec):**

```
❌ [CHAT] ❌ Local fallback BLOCKED (debug mode)
❌ [CHAT] ⚠️ Aucun provider LLM n'a répondu
❌ Provider ollama non disponible (skip)
```

**Validation:**

- [ ] ✅ Logs montrent `ollama` appelé
- [ ] ✅ Logs montrent réponse reçue d'Ollama
- [ ] ✅ Aucun message d'erreur "fallback blocked"

**Si échec**: Ollama pas appelé → Vérifier heartbeat ou disponibilité

---

### Test 5: Pas de messages statiques

**Action**: Envoyer 3 fois le même message "test"

**Attendu:**

- [ ] ✅ Les 3 réponses sont **différentes** (contexte conversationnel)
- [ ] ✅ Pas de message hardcodé type "Je suis TITANE∞, votre assistant..."

**Si échec**: Réponses identiques → `titane-local` fallback actif

---

## 🚨 CRITÈRES D'ÉCHEC (STOP IMMÉDIAT)

**SI UN DE CES PROBLÈMES APPARAÎT:**

1. ❌ Bouton Envoyer reste bloqué en permanence
2. ❌ Toutes les réponses sont identiques/statiques
3. ❌ Logs montrent "Local fallback BLOCKED"
4. ❌ Input ne répond pas aux clics/saisie
5. ❌ Erreur console bloquante (crash React)

**→ ALORS: Rollback vers backup**

```bash
git checkout backup/chat-pre-cleanup
npm run dev:tauri
```

---

## ✅ CRITÈRES DE SUCCÈS (CONTINUER PHASE 4)

**TOUS CES CRITÈRES DOIVENT ÊTRE VALIDÉS:**

- ✅ Input fonctionne (actif/inactif dynamique)
- ✅ Bouton jamais bloqué après envoi
- ✅ 5 prompts différents = 5 réponses différentes
- ✅ Logs montrent Ollama appelé et répondant
- ✅ Aucun message statique/hardcodé répété

**→ ALORS: Passer à PHASE 4 (Réintroduction progressive)**

---

## 📊 RÉSULTATS À REPORTER

**Remplir après tests:**

```
┌─────────────────────────────────────────────┐
│  RÉSULTATS VALIDATION PHASE 3               │
├─────────────────────────────────────────────┤
│  Test 1 (Input):          [ ] ✅ / [ ] ❌  │
│  Test 2 (Bouton):         [ ] ✅ / [ ] ❌  │
│  Test 3 (Réponses):       [ ] ✅ / [ ] ❌  │
│  Test 4 (Logs):           [ ] ✅ / [ ] ❌  │
│  Test 5 (Pas statique):   [ ] ✅ / [ ] ❌  │
├─────────────────────────────────────────────┤
│  RÉSULTAT GLOBAL:         [ ] PASS / [ ] FAIL │
└─────────────────────────────────────────────┘
```

**Si PASS:** Continuer → PHASE 4  
**Si FAIL:** Analyser logs, corriger, re-tester

---

## 🔧 TROUBLESHOOTING

### Problème: Ollama ne répond pas

```bash
# Vérifier Ollama
curl http://localhost:11434/api/tags

# Relancer Ollama
pkill ollama && ollama serve

# Tester requête directe
curl -X POST http://localhost:11434/api/generate \
  -d '{"model":"llama3.1","prompt":"Hello","stream":false}'
```

### Problème: Bouton bloqué

**Console navigateur:**

```javascript
// Forcer reset manuel (console DevTools)
document.querySelector('.chat-send-btn').disabled = false;
```

### Problème: Build échoue

```bash
# Nettoyer et rebuild
npm run clean
npm install
npm run build
```

---

**IMPORTANT**: Ne PAS continuer vers PHASE 4 tant que TOUS les tests ne sont pas ✅ VALIDÉS.
