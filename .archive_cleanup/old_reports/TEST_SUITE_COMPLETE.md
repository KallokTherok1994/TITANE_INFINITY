# 🧪 TEST SUITE COMPLÈTE - Sprint 6 Phase 3

**Date**: 28 janvier 2026  
**Version**: v26.4.0  
**Status**: PRODUCTION - READY FOR TESTING

---

## 📋 TABLEAU DE TEST COMPLET

### 1️⃣ TOOL CALLING (4 outils)

#### Test 1a: `get_time` (Heure actuelle)

```
REQUÊTE: "Quelle heure est-il maintenant?"
ATTENDU:
  ✅ Console: [ToolCaller] ✅ JSON MATCH #1: tool_name=get_time
  ✅ Console: [ToolCaller] ✨ TOOL CALL PARSED: {toolName: "get_time", arguments: {}}
  ✅ Réponse: Timestamp ISO + heure locale française + timestamp Unix
  ✅ Format: {"tool_name": "get_time"}

VALIDATION:
  [ ] JSON détecté dans console
  [ ] Outil exécuté avec résultat
  [ ] Réponse du modèle inclut l'heure
  [ ] Pas d'erreur TypeScript
```

#### Test 1b: `calculate` (Calcul mathématique)

```
REQUÊTE: "Fais le calcul: 456 * 123 + 789"
ATTENDU:
  ✅ Console: [ToolCaller] ✅ JSON MATCH #1: tool_name=calculate
  ✅ Console: [ToolCaller]   → arg: expression=456*123+789
  ✅ Résultat: 56967
  ✅ Format: {"tool_name": "calculate", "expression": "456*123+789"}

VALIDATION:
  [ ] Expression correctement parsée
  [ ] Calcul correct (56967)
  [ ] Args affichés dans console
  [ ] Outil exécuté sans erreur
```

#### Test 1c: `web_search` (Recherche web)

```
REQUÊTE: "Fais une recherche sur la tour Eiffel"
ATTENDU:
  ✅ Console: [ToolCaller] ✅ JSON MATCH #1: tool_name=web_search
  ✅ Console: [ToolCaller]   → arg: query=la tour Eiffel
  ✅ Résultats de recherche retournés
  ✅ Format: {"tool_name": "web_search", "query": "la tour Eiffel"}

VALIDATION:
  [ ] JSON détecté
  [ ] Query extractée correctement
  [ ] Résultats affichés
  [ ] Pas d'erreur réseau
```

#### Test 1d: `get_weather` (Météo)

```
REQUÊTE: "Quel est la météo à Paris aujourd'hui?"
ATTENDU:
  ✅ Console: [ToolCaller] ✅ JSON MATCH #1: tool_name=get_weather
  ✅ Console: [ToolCaller]   → arg: location=Paris
  ✅ Données météo retournées
  ✅ Format: {"tool_name": "get_weather", "location": "Paris"}

VALIDATION:
  [ ] Location correctement parsée
  [ ] Température, humidité, vent retournés
  [ ] Aucune erreur
```

---

### 2️⃣ GESTION DE MÉMOIRE (Chat Memory)

#### Test 2a: Sauvegarde localStorage

```
REQUÊTE: Envoyer 3 messages consécutifs
ATTENDU:
  ✅ Console: [CHAT] – "📂 Initial load from localStorage:"
  ✅ localStorage key: titane_chat_mode_default
  ✅ Chaque message sauvegardé immédiatement

VALIDATION:
  [ ] F12 > Application > localStorage > titane_chat_mode_default
  [ ] Vérifier que 3+ messages sont sauvegardés
  [ ] Format JSON valide
  [ ] Persistance entre rechargement
```

#### Test 2b: Persistance des messages

```
PROCÉDURE:
  1. Envoyer 5 messages
  2. Rafraîchir la page (F5)
  3. Vérifier que les 5 messages sont toujours présents

ATTENDU:
  ✅ Messages toujours visibles après refresh
  ✅ Console: USE CHAT MEMORY: Loaded 5 messages for mode default
  ✅ Order préservé

VALIDATION:
  [ ] Messages visibles après F5
  [ ] Count augmente correctement
  [ ] Aucune duplication
```

#### Test 2c: Memory Compactor

```
REQUÊTE: Envoyer 50+ messages
ATTENDU:
  ✅ Console: [[MEMORY-COMPACTOR]] Loading messages
  ✅ Messages compactés automatiquement
  ✅ Pas de ralentissement

VALIDATION:
  [ ] App reste responsive
  [ ] Pas de memory leak visible
  [ ] localStorage ne dépasse pas limite raisonnable
```

---

### 3️⃣ MESSAGE REACTIONS (Émoji)

#### Test 3a: Ajout de réaction

```
PROCÉDURE:
  1. Cliquer sur message utilisateur
  2. Voir boutons d'émoji (👍 ❤️ 😂 😮 😢)
  3. Cliquer sur 👍

ATTENDU:
  ✅ Emoji 👍 affiché sous le message
  ✅ localStorage mise à jour
  ✅ Persistance après refresh

VALIDATION:
  [ ] Emoji visible
  [ ] localStorage: titane_message_reactions
  [ ] Survit au F5
```

#### Test 3b: Retrait de réaction

```
PROCÉDURE:
  1. Message avec 👍 réaction
  2. Cliquer sur 👍 à nouveau

ATTENDU:
  ✅ Emoji disparaît
  ✅ localStorage mis à jour

VALIDATION:
  [ ] Emoji enlevé
  [ ] Pas d'erreur
```

#### Test 3c: Multiples réactions

```
PROCÉDURE:
  1. Sur un même message, ajouter 👍 + ❤️ + 😂

ATTENDU:
  ✅ Les 3 émojis affichés
  ✅ Tous distincts

VALIDATION:
  [ ] 3 émojis visibles
  [ ] Pas de confusion
```

---

### 4️⃣ TOKEN COUNTER

#### Test 4a: Estimation token (OpenAI)

```
REQUÊTE: Message long (~500 caractères)
ATTENDU:
  ✅ Token count affiché dans les bubbles
  ✅ Modèle OpenAI: ~125 tokens
  ✅ Modèle Ollama: ~175 tokens
  ✅ Format: "345 tokens"

VALIDATION:
  [ ] Token count visible
  [ ] Estimation raisonnable (4.5:1 ratio car)
  [ ] Affichage formaté
```

#### Test 4b: Multi-modèle tokens

```
PROCÉDURE:
  1. Basculer entre Ollama / OpenAI / Gemini
  2. Observer token count pour même message

ATTENDU:
  ✅ Counts différents par modèle
  ✅ Todos les modèles supportés:
     • OpenAI: encoder cl100k_base
     • Gemini: estimation ~4.5 cars/token
     • Claude: estimation ~3.3 cars/token
     • Ollama: ~175 tokens/message moyen

VALIDATION:
  [ ] Switching models → token count change
  [ ] Aucun modèle ignoré
```

---

### 5️⃣ ZOOM CONTROL (Clavier)

#### Test 5a: Zoom In/Out

```
PROCÉDURE:
  1. Ctrl + Plus → Zoom +10%
  2. Ctrl + Minus → Zoom -10%
  3. Ctrl + 0 → Reset 75%

ATTENDU:
  ✅ Interface agrandie/réduite
  ✅ localStorage: titane_zoom_level
  ✅ Min 50%, Max 200%
  ✅ Persistance après F5

VALIDATION:
  [ ] Zoom in fonctionne
  [ ] Zoom out fonctionne
  [ ] Reset à 75%
  [ ] localStorage met à jour
```

---

### 6️⃣ FOURNISSEURS IA (Providers)

#### Test 6a: Ollama (local)

```
REQUIS: Ollama running sur 127.0.0.1:11434
PROCÉDURE:
  1. Envoyer message
  2. Provider: Ollama automatiquement

ATTENDU:
  ✅ Console: [Ollama] – "[DEBUG]" – "✅ Ollama endpoint: healthy"
  ✅ Message reçu de llama3.1
  ✅ Réponse rapide (<5s)

VALIDATION:
  [ ] Message envoyé
  [ ] Réponse reçue
  [ ] Format français
  [ ] Pas d'erreur 503
```

#### Test 6b: Provider Fallback

```
PROCÉDURE:
  1. Arrêter Ollama
  2. Envoyer message → Auto-fallback à OpenAI/autre

ATTENDU:
  ✅ Basculement automatique
  ✅ Message toujours reçu
  ✅ Console: [TauriChat] – Provider auto-selected

VALIDATION:
  [ ] Fallback fonctionne
  [ ] Pas de crash
```

---

### 7️⃣ CHAT MODES (Modes de conversation)

#### Test 7a: Mode par défaut

```
REQUÊTE: N'importe quel message
ATTENDU:
  ✅ Mode: default (TITANE∞ générale)
  ✅ Ton: Professionnel, français
  ✅ Tools disponibles

VALIDATION:
  [ ] Réponse en français
  [ ] Professionnelle
```

#### Test 7b: Autres modes (si disponibles)

```
MODES À TESTER:
  • Reflection: Mode introspection
  • Code mentor: Conseils code
  • Expert advisor: Expert domain

ATTENDU:
  ✅ Chaque mode a son systemPrompt unique
  ✅ Comportement distinct

VALIDATION:
  [ ] Modes différents
  [ ] System prompt changé
```

---

### 8️⃣ INTÉGRATION COMPLÈTE

#### Test 8a: Tool + Memory + Reactions

```
PROCÉDURE:
  1. Envoyer: "Quelle heure est-il?"
  2. Tool Calling → Heure retournée
  3. Message sauvegardé
  4. Ajouter emoji 👍

ATTENDU:
  ✅ Tool exécuté
  ✅ Message sauvegardé + emoji
  ✅ Tous les systèmes coordonnés

VALIDATION:
  [ ] Tool exécuté
  [ ] Emoji persistant
  [ ] localStorage a 2 entries
```

#### Test 8b: Performance globale

```
PROCÉDURE:
  1. Envoyer 10 messages rapides
  2. Observer latency
  3. Vérifier mémoire en F12

ATTENDU:
  ✅ Moyenne latency: <3s par message
  ✅ UI responsive
  ✅ Memory < 100MB

VALIDATION:
  [ ] Pas de lag
  [ ] Console clean (no repeated errors)
  [ ] Memory stable
```

---

## 🎯 RÉSUMÉ CHECKLIST FINALE

| Feature           | Test 1a | Test 2a | Test 3a | Test 4a | Test 5a | Test 6a | Test 8a |
| ----------------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- |
| Tool: get_time    | [ ]     |         |         |         |         |         |         |
| Tool: calculate   | [ ]     |         |         |         |         |         |         |
| Tool: web_search  | [ ]     |         |         |         |         |         |         |
| Tool: get_weather | [ ]     |         |         |         |         |         |         |
| Memory Save       |         | [ ]     |         |         |         |         |         |
| Memory Persist    |         | [ ]     |         |         |         |         |         |
| Reactions         |         |         | [ ]     |         |         |         |         |
| Token Counter     |         |         |         | [ ]     |         |         |         |
| Zoom Control      |         |         |         |         | [ ]     |         |         |
| Ollama Provider   |         |         |         |         |         | [ ]     |         |
| Full Integration  |         |         |         |         |         |         | [ ]     |

---

## 📊 RÉSULTATS À DOCUMENTER

Pour chaque test réussi, noter:

```
✅ Test 1a: get_time
   Status: PASS/FAIL
   Console logs: [ToolCaller] JSON MATCH #1: tool_name=get_time
   Response time: 2.3s
   Notes: Tool executed, heure retournée correctement
```

---

## 🚀 PROCÉDURE DE TEST

1. **Ouvrir DevTools** (F12)
2. **Onglet Console** pour voir logs [ToolCaller]
3. **Onglet Application** pour localStorage
4. **Envoyer requêtes de test** dans le chat
5. **Observer console** pour JSON MATCH / TOOL CALL PARSED
6. **Vérifier résultats** dans la réponse
7. **Documenter** chaque résultat

---

**Commit**: 30e452fd  
**Production Status**: ✅ READY  
**Next Step**: Exécuter tests complets et documenter résultats
