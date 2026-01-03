# 🧪 TITANE∞ - GUIDE DE TESTS RAPIDES

## 📋 Tests Prioritaires (15 minutes)

### 1. TTS Service (2 min) ✅ VALIDÉ

```bash
# Status
./tts_menu.sh status

# Test synthèse
./tts_menu.sh synth

# Test intégration
./tts_menu.sh test
```

**Résultats:**
- ✅ Service actif (PID 1353998)
- ✅ Modèle chargé
- ✅ Audio généré (12.6s, 1.1MB)
- ✅ Qualité ⭐⭐⭐⭐⭐

---

### 2. Chat IA Interface (3 min)

```bash
# Lancer app
pnpm run tauri:dev

# Ouvrir navigateur
http://localhost:5173/chat

# Test:
# 1. Envoyer: "Bonjour TITANE, comment vas-tu ?"
# 2. Attendre réponse (<3s)
# 3. Envoyer: "Je m'appelle Kevin"
# 4. Envoyer: "Comment je m'appelle ?"
# 5. Vérifier: TITANE répond "Kevin"
```

**Attendu:**
- ✅ Interface charge sans erreurs
- ✅ Messages envoyés/reçus
- ✅ Contexte maintenu (mémoire)

---

### 3. Mémoire Conversationnelle (2 min)

```bash
# Dans le chat, envoyer 5 messages
# Fermer l'application (Ctrl+C)
# Relancer: pnpm run tauri:dev
# Rouvrir http://localhost:5173/chat
```

**Attendu:**
- ✅ Messages précédents affichés
- ✅ Contexte conservé

**Vérifier localStorage (F12 → Console):**
```javascript
localStorage.getItem('titane_chat_history')
// Doit retourner JSON avec messages
```

---

### 4. Mode Vocal (5 min) ⚠️ À VALIDER

```bash
# App lancée: pnpm run tauri:dev
# Ouvrir: http://localhost:5173

# Test micro:
# 1. Cliquer bouton 🎤
# 2. Parler: "Bonjour TITANE"
# 3. Vérifier transcription affichée
```

**Attendu:**
- ✅ Bouton vocal activable
- ⏸️ Transcription visible
- ⏸️ Réponse vocale (TTS Parler)

**Si échec STT:**
```bash
# Vérifier Whisper.cpp
find ~/ -name "whisper.cpp" 2>/dev/null

# Si absent, installer:
cd /tmp
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp
make
./models/download-ggml-model.sh base
```

---

### 5. Conversation Audio Complète (3 min) ⚠️ À VALIDER

**Scénario complet:**
```
1. Activer mode vocal 🎤
2. Dire: "Bonjour TITANE"
   → Attendre réponse vocale
3. Dire: "Je m'appelle Kevin"
   → Attendre réponse
4. Dire: "Comment je m'appelle ?"
   → Vérifier: TITANE dit "Kevin"
5. Dire: "Au revoir"
   → Fin conversation
```

**Validation:**
- ✅ 5 tours conversation fluides
- ✅ Transcriptions correctes (>85%)
- ✅ Réponses contextuelles
- ✅ Mémoire maintenue
- ✅ TTS audible et clair

---

## 🔧 Tests Avancés (30 minutes)

### 6. Performance TTS

```bash
# Test latence
time curl -X POST http://localhost:8765/api/v1/tts/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "Test de latence pour 10 secondes audio.", "return_audio": true}' \
  > /tmp/perf_test.wav

# Mesurer durée audio
ffprobe -v error -show_entries format=duration /tmp/perf_test.wav

# Calculer ratio
# Ratio = Temps_generation / Duree_audio
# Cible: <3x (GPU) ou <20x (CPU acceptable)
```

**Résultat Actuel:**
- Mode CPU: ~14-20x realtime
- Mode GPU (après ROCm): ~1-2x realtime (estimé)

---

### 7. Mémoire Sous Charge

```bash
# Test compaction auto
# Dans console JS (F12):
for (let i = 0; i < 100; i++) {
  const msg = {
    id: `test-${i}`,
    role: 'user',
    content: `Message ${i}`.repeat(100),
    timestamp: Date.now(),
    metadata: {}
  };
  localStorage.setItem('titane_test_' + i, JSON.stringify(msg));
}

# Vérifier taille
let total = 0;
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const size = localStorage.getItem(key).length;
  total += size;
}
console.log('Total:', (total / 1024 / 1024).toFixed(2), 'MB');
// Attendu: <10MB, sinon compaction se déclenche
```

---

### 8. Multi-Providers Chat

```bash
# Test provider: auto
# Envoyer message, vérifier réponse

# Test provider: ollama
# Changer provider dans UI
# Envoyer message, vérifier réponse

# Test provider: local
# Changer provider
# Envoyer message, vérifier réponse
```

**Validation:**
- ✅ Tous providers fonctionnent
- ✅ Fallback auto si erreur
- ✅ Latence acceptable (<5s)

---

## 🐛 Diagnostic Erreurs

### Service TTS non disponible

```bash
# Vérifier status
./tts_menu.sh status

# Si inactif:
./tts_menu.sh start

# Si échec:
cd /home/titane/Documents/TITANE_INFINITY/tts-service
source venv-parler-tts/bin/activate
python3 tts_api_server.py
# Observer erreurs
```

### STT ne fonctionne pas

```bash
# Test backend direct
cd /home/titane/Documents/TITANE_INFINITY
pnpm run tauri:dev

# Console navigateur (F12):
# Observer erreurs lors activation mode vocal

# Logs backend:
tail -f ~/.local/state/com.titane.infinity/logs/titane_infinity.log
```

### Mémoire non persistée

```bash
# Vérifier localStorage
localStorage.getItem('titane_chat_history')

# Si vide après envoi messages:
# 1. Vérifier aucune erreur console
# 2. Vérifier quota storage:
navigator.storage.estimate().then(console.log)
# Doit montrer usage < quota
```

### Audio crackling/distortion

```bash
# Test qualité
ffprobe -v error -show_entries stream /tmp/test.wav
# Vérifier: sample_rate=44100, codec=pcm_s16le

# Si problème:
# 1. Vérifier buffer audio
# 2. Tester autre haut-parleur
# 3. Vérifier CPU usage (doit rester <80%)
```

---

## 📊 Checklist Validation Complète

### TTS System
- [x] Service actif
- [x] Modèle chargé
- [x] Synthèse simple OK
- [x] Qualité audio ⭐⭐⭐⭐⭐
- [x] Latence CPU acceptable
- [ ] GPU ROCm installé (optionnel)

### Chat IA
- [ ] Interface charge
- [ ] Messages envoi/réception
- [ ] Multi-providers OK
- [ ] Contexte maintenu
- [ ] Streaming tokens
- [ ] Error handling

### Mémoire
- [ ] Sauvegarde auto
- [ ] Chargement au démarrage
- [ ] Persistance après fermeture
- [ ] Compaction >5MB
- [ ] Export/Import

### Audio Complet
- [ ] TTS Parler-TTS OK
- [ ] STT transcription OK
- [ ] Boucle conversation OK
- [ ] Auto-continue OK
- [ ] Mémoire conversation OK
- [ ] VAD détection OK

---

## 🎯 Score Attendu

### Après Tests Rapides (15 min)
- TTS: ✅ 5/5 (100%)
- Chat: ⏸️ 0/4 (À tester)
- Mémoire: ⏸️ 0/3 (À tester)
- Audio: ⏸️ 0/4 (À tester)

**Score Global: 31% (5/16)**

### Après Tests Complets (45 min)
- TTS: ✅ 6/6 (100%)
- Chat: ✅ 6/6 (100%)
- Mémoire: ✅ 5/5 (100%)
- Audio: ⚠️ 3/6 (50% - STT à valider)

**Score Global Cible: 87% (20/23)**

---

## 📚 Documentation

- **Audit Complet:** `CHAT_MEMORY_AUDIO_AUDIT_v24.1.md`
- **Tests Auto:** `test_audio_complete.sh`
- **TTS Guide:** `TTS_FINAL_REPORT.md`
- **TTS Quick Ref:** `TTS_QUICKSTART.txt`

---

## 🚀 Prochaines Actions

1. **Maintenant:** Tester Chat + Mémoire (5 min)
2. **Ensuite:** Valider STT (10 min)
3. **Si OK:** Tester conversation complète (10 min)
4. **Optionnel:** Installer ROCm GPU (2-4h)

**Objectif:** 80%+ tests validés avant déploiement production.

---

**© 2024 TITANE∞ - Guide Tests v24.1**
**Dernière MAJ:** 4 Décembre 2024
