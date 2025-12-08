# 🎯 TESTS USER — INSTRUCTIONS RAPIDES

**URL** : http://localhost:5173/
**Durée** : 5 minutes
**Status** : ✅ Backend 100% Ready

---

## ▶️ TEST 1 : Diagnostic Backend (2 min)

### Action
1. Ouvrir http://localhost:5173/
2. Chercher overlay **coin haut droite** (bouton bleu)
3. Cliquer **"Lancer Diagnostic"**
4. Attendre 10-15 secondes

### Résultats Attendus
```
✅ TEST 1: Providers Status
   3 providers détectés (gemini, ollama, local)

✅ TEST 2: Local Echo
   Réponse: "Echo: Test diagnostic"

✅ TEST 3: Auto Cascade
   Provider: gemini (ou ollama si gemini timeout)
```

### Si Problème
- ❌ Test 2 échoue → Bug critique, copie message erreur
- ✅ Test 2 passe → 80% du travail validé !

---

## 💬 TEST 2 : Chat UI Manuel (2 min)

### Action
1. Naviguer `/chat` ou cliquer menu Chat
2. Taper : **"Bonjour TITANE, qui es-tu ?"**
3. Appuyer **Entrée**
4. Attendre réponse (max 60s)

### Résultat Attendu
```
[User] 12h55
Bonjour TITANE, qui es-tu ?

[TITANE∞] 12h55 (gemini, 2345ms)
Bonjour ! Je suis TITANE∞, votre assistant IA hybride...
```

### Vérifier
- ✅ Message user apparaît
- ✅ Réponse IA apparaît
- ✅ Status Bar affiche "Provider: gemini | Latency: Xms"

---

## 🔊 TEST 3 : TTS Voice Mode (1 min)

### Action
1. Chercher bouton **🎤 Voice Mode** (si présent)
2. Activer voice mode
3. Envoyer message
4. Écouter audio

### Résultat Attendu
- Son joué (voix robotique espeak-ng)

---

## 📊 Résultat Final

### Si 3/3 tests passent ✅
```
🎉 CHAT IA FONCTIONNEL !
→ Build production possible
→ Commit final v16.2.2
```

### Si Test 2 échoue ❌
```
⚠️ BUG CRITIQUE
→ Copier message erreur exact
→ Vérifier logs terminal Tauri
→ Me partager erreur
```

---

## 📄 Logs Utiles

### Terminal Tauri (Backend)
Chercher :
```
[CHAT] 🔄 Tentative avec provider: gemini
[CHAT] ✅ Gemini success: 247 chars, 51 tokens
```

### DevTools Console (F12)
Chercher :
```
[tauriClient] Sending chat message...
[tauriClient] Response received
```

---

**Temps total** : 5 minutes
**Documents** : `FIX_STATE_MANAGEMENT_SUCCESS.md` (détails techniques)
**Status** : ✅ Prêt pour tests

🎯 **START TEST 1 NOW !**
