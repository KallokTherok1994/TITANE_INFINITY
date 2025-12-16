# 🚀 GUIDE RAPIDE — Tester l'IA Locale TITANE∞ v21.0

**Temps estimé**: 10-15 minutes  
**Prérequis**: Ollama installé et lancé ✅

---

## 📋 CHECKLIST RAPIDE

### Étape 1 — Démarrer l'App (2 min)

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

# Option A: Dev runtime
npm run dev

# Option B: Titan-Dev runtime
./runtime/dev/run-dev.sh
```

**Vérifier dans console** (F12 → Console):

```
✅ [OLLAMA] 🚀 Initializing Ollama provider...
✅ [OLLAMA] ✅ Health check passed - Ready at http://127.0.0.1:11434
✅ [OLLAMA] 📦 Model: llama3.1
```

**Si erreur**:

- Vérifier Ollama actif: `pgrep -f ollama`
- Relancer: `ollama serve`

---

### Étape 2 — Test Simple (1 min)

**Action**: Ouvrir Chat IA dans l'app

**Message**:

```
Réponds 'OK_LOCAL' si tu utilises Ollama
```

**Résultat attendu**:

- ⏱️ Réponse en < 5 secondes
- ✅ Contient "OK_LOCAL" ou équivalent
- 🖥️ Console: `Selected: ollama`

**Si réponse d'un autre provider (Claude/OpenAI)**:
→ Mode local pas activé, continuer test 3

---

### Étape 3 — Test Mémoire (3 min)

**Conversation 1**:

```
User: Je m'appelle Kevin et je travaille sur TITANE∞
```

**Attendre 2 secondes** (sauvegarde background)

**Conversation 2**:

```
User: Quel est mon prénom ?
```

**Résultat attendu**: ✅ "Kevin" ou "Tu es Kevin"

**Conversation 3**:

```
User: Sur quel projet je travaille ?
```

**Résultat attendu**: ✅ Mention de "TITANE∞"

**Si échec**: Mémoire non connectée → Vérifier logs console

---

### Étape 4 — Vérifier Logs Mémoire (2 min)

**Ouvrir**: F12 → Console → Filtrer "OLLAMA"

**Chercher**:

```
[OLLAMA] Memory context loaded:
  - Projects: X
  - Decisions: Y
  - Knowledge: Z
```

**Si absent**: `isDev` peut-être false → Normal en prod

**Alternative**: Envoyer message "Quels sont mes projets actifs ?"
→ Si répond avec projets réels = ✅ Mémoire active

---

## 🎯 RÉSULTATS ATTENDUS

### ✅ Test Réussi

```
1. Health check ✅ au démarrage
2. Ollama répond ✅ en < 5s
3. Mémoire prénom ✅ (Kevin)
4. Mémoire projet ✅ (TITANE∞)
```

**STATUS**: 🟢 **IA LOCALE 100% OPÉRATIONNELLE**

---

### ⚠️ Test Partiel

**Scénario A**: Ollama répond mais pas de mémoire

```
Symptôme: Oublie le prénom entre messages
Cause: memoryIntegration non appelée
Fix: Vérifier logs console, DB active
```

**Scénario B**: Claude/OpenAI répondent au lieu d'Ollama

```
Symptôme: Réponses cloud providers
Cause: Mode local pas forcé
Fix: Vérifier config.preferredProvider = 'local'
     ou ajuster scoring orchestrator
```

**Scénario C**: Timeout Ollama

```
Symptôme: Erreur après 8-30s
Cause: Model trop lent, RAM insuffisante
Fix: Utiliser llama3.2:1b (plus léger)
     ou augmenter timeout
```

---

### ❌ Test Échoué

**Erreur startup**: "[OLLAMA] ❌ Endpoint offline"

```
→ Ollama pas lancé
→ Solution: ollama serve
```

**Erreur runtime**: "Ollama endpoint not available"

```
→ Health check échoué après démarrage
→ Solution: Redémarrer Ollama
→ Vérifier: curl http://127.0.0.1:11434/api/tags
```

**Pas de réponse**: Aucun provider répond

```
→ Problème orchestrator
→ Vérifier console errors
→ Fallback titaneLocal devrait répondre
```

---

## 📊 MÉTRIQUES SUCCÈS

| Métrique           | Cible | Validation     |
| ------------------ | ----- | -------------- |
| **Startup Health** | < 2s  | Logs console   |
| **Latence Ollama** | < 5s  | Chrono réponse |
| **Mémoire Prénom** | 100%  | Test Kevin     |
| **Mémoire Projet** | 100%  | Test TITANE∞   |
| **Sauvegarde**     | Async | DB check       |

---

## 🔧 COMMANDES UTILES

### Vérifier Ollama

```bash
# Status
pgrep -f ollama && echo "✅ Running" || echo "❌ Stopped"

# Health
curl -s http://127.0.0.1:11434/api/tags | jq '.models | length'

# Test simple
curl -s -X POST http://127.0.0.1:11434/api/generate \
  -d '{"model":"llama3.1","prompt":"OK","stream":false}' | jq -r '.response'
```

### Logs App

```bash
# Dev mode
npm run dev 2>&1 | grep -E "\[OLLAMA\]|Selected:"

# Titan-Dev
tail -f runtime/dev/logs/vite.log | grep OLLAMA
```

### DB Memory Check (si SQLite)

```bash
# Vérifier dernières interactions
sqlite3 ~/.titane/memory.db "SELECT * FROM interactions ORDER BY timestamp DESC LIMIT 5;"
```

---

## 🎉 SUCCÈS FINAL

**Si tous les tests passent**:

```
✅ [OLLAMA] Health check passed
✅ Ollama répond en < 5s
✅ Mémoire prénom active
✅ Mémoire projet active
✅ Interactions sauvegardées

🟢 IA LOCALE TITANE∞ OPÉRATIONNELLE À 100%
```

**Prochaine étape**: Utiliser normalement l'IA locale !

**Feedback**: Rapporter résultats tests (succès/échecs) pour amélioration continue.

---

**Bonne chance !** 🚀

_Guide v21.0 - 2025-12-11_
