# 🧪 Plan de Tests Manuels — Full Duplex v∞.5

**TITANE_INFINITY** — Full Duplex Overlap Engine
Version: v∞.5
Date: 2024

---

## 🎯 Objectif

Valider manuellement le fonctionnement du système Full Duplex avec hardware audio réel (microphone + haut-parleurs).

---

## 📋 Pré-requis

### Hardware
- ✅ Microphone fonctionnel (USB ou intégré)
- ✅ Haut-parleurs ou casque audio
- ✅ Niveau audio microphone > 50%
- ✅ Volume haut-parleurs 30-70% (éviter echo)

### Software
- ✅ Chrome/Edge ≥ 90 (Web Audio API support)
- ✅ Permissions microphone autorisées
- ✅ TITANE_INFINITY running (npm run tauri:dev)
- ✅ Console DevTools ouverte (F12)

### Configuration
```typescript
// src/examples/FullDuplexExample.tsx doit être monté
const voice = useVoiceEngine({ fullDuplexMode: true });
await voice.enableFullDuplex();
```

---

## 🧪 Test Suite 1: Hard Interrupt Detection

### Test 1.1: Interrupt pendant TTS
**Objectif:** Vérifier que le système détecte une interruption vocale forte et stoppe immédiatement le TTS.

**Steps:**
1. Click "Speak Long Message"
2. Attendre 2 secondes (laisser TTS démarrer)
3. Dire clairement dans le micro: **"Stop!"** ou **"Arrête!"**
4. Observer les logs

**Expected:**
- ✅ Event log affiche: `INTERRUPT → interruption`
- ✅ Barge-in type: `USER_INTERRUPT`
- ✅ TTS s'arrête < 200ms
- ✅ Status "Speaking" → `No`
- ✅ Status "Listening" → `Yes`
- ✅ Console: `🚨 [FullDuplex] Hard interrupt detected`

**Metrics:**
- Latence: mesurer temps entre voix et arrêt TTS (objectif < 200ms)
- Confidence: doit être ≥ 0.8

**Fallback:** Si échec, vérifier volume micro et répéter plus fort.

---

### Test 1.2: Multiple Hard Interrupts
**Objectif:** Vérifier stabilité sur interruptions multiples rapides.

**Steps:**
1. Click "Speak Long Message"
2. Dire "Stop!" après 1s
3. Re-click "Speak Long Message"
4. Dire "Stop!" après 2s
5. Répéter 3x

**Expected:**
- ✅ Chaque interrupt fonctionne indépendamment
- ✅ Pas de crash
- ✅ Event log contient 5 événements `INTERRUPT`
- ✅ Interruption history contient 5 entrées

---

## 🧪 Test Suite 2: Soft Interrupt (Ducking)

### Test 2.1: Volume Ducking
**Objectif:** Vérifier que TTS réduit volume sur voix douce (overlap).

**Steps:**
1. Click "Speak Long Message"
2. Attendre 3 secondes
3. Parler doucement dans le micro (voix basse): **"Hmm oui..."**
4. Observer volume TTS

**Expected:**
- ✅ Event log: `INTERRUPT → full_duplex`
- ✅ Barge-in type: `USER_SOFT_BARGE`
- ✅ Volume TTS baisse à ~30% (audible mais réduit)
- ✅ TTS continue de parler (ne s'arrête pas)
- ✅ Après 1s silence, volume remonte automatiquement

**Metrics:**
- Volume target: 0.3 (30%)
- Transition: smooth (~150ms)

**Debug:** Si volume ne baisse pas, vérifier console pour `applyDucking(0.3)` appelé.

---

### Test 2.2: Overlap Detection
**Objectif:** Vérifier détection quand utilisateur parle en même temps que TTS.

**Steps:**
1. Click "Speak Long Message"
2. Attendre 2s
3. Parler simultanément avec TTS (voix normale): **"Oui d'accord je comprends"**
4. Continuer 3 secondes
5. Arrêter de parler

**Expected:**
- ✅ Event log: barge-in type `USER_OVERLAP`
- ✅ TTS continue avec volume légèrement réduit (ducking)
- ✅ Après silence utilisateur, volume remonte
- ✅ Confidence ≥ 0.6

---

## 🧪 Test Suite 3: Echo Filtering

### Test 3.1: False Positive Prevention
**Objectif:** Vérifier que le système ne détecte pas le TTS comme interruption utilisateur (pas d'echo).

**Steps:**
1. Click "Speak Long Message"
2. **NE PAS PARLER** pendant toute la durée TTS
3. Observer event log

**Expected:**
- ✅ Aucun événement `INTERRUPT` détecté
- ✅ Aucun barge-in type `USER_INTERRUPT` ou `USER_SOFT_BARGE`
- ✅ Event log: seulement `STATE_CHANGE → speaking` et `STATE_CHANGE → idle` à la fin
- ✅ Console: logs `[BargeIn] Echo detected (similarity: 0.XX), blocking`

**Metrics:**
- Spectral similarity TTS vs capture: > 0.7 = echo
- False positive rate: < 5% (sur 20 tests)

**Debug:** Si false positive détecté, augmenter `echoThreshold` dans BargeInDetector config.

---

### Test 3.2: Background Noise Immunity
**Objectif:** Vérifier que bruits ambiants ne déclenchent pas barge-in.

**Steps:**
1. Click "Speak Long Message"
2. Jouer musique douce en arrière-plan (Spotify, YouTube)
3. Ne pas parler
4. Observer logs

**Expected:**
- ✅ Aucun `INTERRUPT` détecté
- ✅ Barge-in type `FALSE_POSITIVE` si détection mais bloquée
- ✅ TTS continue sans interruption

**Fallback:** Si musique déclenche interruption, réduire gain microphone ou augmenter `hardInterruptThreshold`.

---

## 🧪 Test Suite 4: Context-Aware Interruption

### Test 4.1: Interruption Type Detection
**Objectif:** Vérifier que chatInterruptionHandler détecte correctement le type d'interruption.

**Steps:**
1. Click "Speak Long Message"
2. Après 2s, dire: **"Non attends, je veux parler d'autre chose"**
3. Observer interruption history

**Expected:**
- ✅ Interruption type: `REDIRECT`
- ✅ User text: "Non attends, je veux parler d'autre chose"
- ✅ Confidence ≥ 0.7
- ✅ System message généré contient contexte interruption

**Variations:**
- **Hard Stop:** "Stop!" → type `hard_stop`
- **Clarification:** "Qu'est-ce que tu veux dire ?" → type `clarification`
- **Correction:** "Non c'est faux" → type `correction`
- **Agreement:** "Oui exactement" → type `agreement`
- **Disagreement:** "Non pas du tout" → type `disagreement`

---

### Test 4.2: AI Context Generation
**Objectif:** Vérifier que l'IA reçoit contexte d'interruption correct.

**Steps:**
1. Click "Speak Long Message"
2. Après 3s, click "Inject Interruption"
3. Observer console AI request

**Expected:**
- ✅ `chatInterruptionHandler.generateSystemMessage()` appelé
- ✅ Message système contient:
  - Type d'interruption: "redirect"
  - Position interruption: ~60% (0.6)
  - Texte utilisateur: "Non attends, je veux parler d'autre chose"
- ✅ AI adapte réponse selon contexte (ex: "D'accord, de quoi veux-tu parler ?")

**Debug:** Check console pour `[ChatInterruption] Generated system message: ...`

---

## 🧪 Test Suite 5: Long Conversations

### Test 5.1: Continuous Listening
**Objectif:** Vérifier que le système reste en écoute continue sans timeout.

**Steps:**
1. Click "Start Conversation"
2. Parler pendant 30 secondes (monologue)
3. Observer status "Listening"

**Expected:**
- ✅ Status "Listening" reste `Yes` pendant toute la durée
- ✅ Aucun timeout après 10s (ancien comportement)
- ✅ Audio chunks envoyés en continu au backend
- ✅ Full duplex state: `listening` stable

---

### Test 5.2: Multi-Turn with Interrupts
**Objectif:** Conversation naturelle avec interruptions multiples.

**Steps:**
1. Click "Speak Long Message"
2. Interrompre après 2s: "Stop!"
3. Parler: "Dis-moi plutôt la météo"
4. TITANE∞ répond avec TTS
5. Interrompre à nouveau: "Non attends"
6. Parler: "Quelle heure est-il ?"
7. Répéter 5 tours

**Expected:**
- ✅ Chaque interruption gérée correctement
- ✅ Context transmis à l'IA à chaque tour
- ✅ Aucune dégradation performance
- ✅ Memory stable (< 500MB RAM)
- ✅ CPU usage < 30%

---

## 🧪 Test Suite 6: Edge Cases

### Test 6.1: Rapid Fire Interrupts
**Objectif:** Tester stabilité sur interruptions très rapides.

**Steps:**
1. Click "Speak Long Message"
2. Répéter rapidement: "Stop! Stop! Stop! Stop! Stop!" (5x en 2 secondes)
3. Observer logs

**Expected:**
- ✅ Système détecte première interruption
- ✅ Interruptions suivantes ignorées (TTS déjà arrêté)
- ✅ Pas de crash
- ✅ Event log contient 1 `INTERRUPT`, puis `STATE_CHANGE → listening`

---

### Test 6.2: Whisper Detection
**Objectif:** Vérifier détection voix très faible (< 0.08 RMS).

**Steps:**
1. Click "Speak Long Message"
2. Chuchoter très doucement: "Stop..."
3. Observer logs

**Expected:**
- ⚠️ Possible non-détection (RMS < softInterruptThreshold 0.08)
- ✅ Aucun crash
- ✅ Si détecté: barge-in type `USER_SOFT_BARGE`

**Note:** Whisper < 0.05 RMS est limitation connue (voir Known Limitations).

---

### Test 6.3: Concurrent Multiple Audio Elements
**Objectif:** TTS multiples en parallèle (edge case).

**Steps:**
1. Click "Speak Long Message"
2. Pendant que TTS parle, click à nouveau "Speak Long Message"
3. Observer comportement

**Expected:**
- ✅ TTSDuckingEngine gère multiple audio elements
- ✅ Ducking appliqué à tous les éléments enregistrés
- ✅ Pas de conflict entre GainNodes

**Debug:** Check `ttsDuckingEngine.audioElements.size` (devrait être 2).

---

## 📊 Performance Metrics

### À mesurer manuellement

| Metric | Target | Measured | Status |
|--------|--------|----------|--------|
| Interrupt Detection Latency | < 200ms | ___ ms | ⚠️ |
| True Positive Rate | > 85% | ___ % | ⚠️ |
| False Positive Rate | < 5% | ___ % | ⚠️ |
| Echo Rejection Rate | > 95% | ___ % | ⚠️ |
| CPU Usage (active) | < 30% | ___ % | ⚠️ |
| RAM Usage | < 500MB | ___ MB | ⚠️ |
| Ducking Transition | ~150ms | ___ ms | ⚠️ |
| Auto-Release Delay | 1000ms | ___ ms | ⚠️ |

**Méthode de mesure:**
- Latency: `performance.now()` avant/après interrupt
- True/False Positive: 20 tests, compter succès/échecs
- CPU/RAM: Chrome Task Manager (Shift+Esc)
- Transitions: Observer Web Audio timeline

---

## 🐛 Troubleshooting

### Problème: Aucune détection d'interruption
**Causes possibles:**
- Volume micro trop faible → Augmenter à 70%+
- Permissions micro refusées → Vérifier chrome://settings/content/microphone
- BargeInDetector pas initialisé → Check console pour `[BargeIn] Initialized`

**Solutions:**
```typescript
// Augmenter sensibilité
const detector = new BargeInDetector({
  hardInterruptThreshold: 0.10, // was 0.15
  softInterruptThreshold: 0.05, // was 0.08
});
```

---

### Problème: Trop de false positives
**Causes possibles:**
- Echo haut-parleurs → micro capte TTS
- Seuils trop bas
- Bruit ambiant élevé

**Solutions:**
```typescript
// Réduire sensibilité
const detector = new BargeInDetector({
  hardInterruptThreshold: 0.20, // was 0.15
  echoThreshold: 0.65, // was 0.7 (plus strict)
});
```

---

### Problème: Ducking pas audible
**Causes possibles:**
- Audio element pas enregistré
- GainNode pas connecté
- Volume TTS déjà faible

**Debug:**
```typescript
// Vérifier registration
console.log('Registered elements:', ttsDuckingEngine.audioElements.size);

// Forcer duck
ttsDuckingEngine.applyDucking(0.1); // 10% volume
```

---

### Problème: Performance dégradée
**Causes possibles:**
- FFT size trop grand (2048)
- Analyse spectrale lourde
- Multiple audio contexts

**Solutions:**
```typescript
// Réduire FFT size
const detector = new BargeInDetector({
  fftSize: 1024, // was 2048
});

// Augmenter sliding window
const detector = new BargeInDetector({
  slidingWindowMs: 300, // was 200
});
```

---

## ✅ Validation Checklist

### Core Features
- [ ] Hard interrupt detection fonctionne
- [ ] Soft interrupt (ducking) fonctionne
- [ ] Echo filtering fonctionne (< 5% false positive)
- [ ] Overlap detection fonctionne
- [ ] Context-aware interruption fonctionne
- [ ] Interruption type detection fonctionne (6 types)
- [ ] Long conversations stables (> 30s)
- [ ] Multi-turn conversations fluides

### Edge Cases
- [ ] Rapid fire interrupts gérés
- [ ] Whisper detection (ou échec attendu si < 0.08 RMS)
- [ ] Background noise immunité
- [ ] Multiple audio elements gérés

### Performance
- [ ] Latency < 200ms
- [ ] CPU < 30%
- [ ] RAM < 500MB
- [ ] Aucun memory leak

### UX
- [ ] Visual feedback clair (event log)
- [ ] Status indicators corrects
- [ ] Pas de crash ou freeze
- [ ] Interruption history affichée

---

## 📝 Test Results Template

```markdown
### Test Session: YYYY-MM-DD HH:MM

**Environment:**
- OS: Linux / Windows / macOS
- Browser: Chrome 120.0
- Microphone: [Model]
- Speakers: [Model]

**Test Results:**

✅ Test 1.1: Hard Interrupt - PASS (latency: 145ms)
✅ Test 2.1: Volume Ducking - PASS
⚠️ Test 2.2: Overlap Detection - PARTIAL (confidence low: 0.55)
❌ Test 3.2: Background Noise - FAIL (false positive on music)

**Issues Found:**
1. False positive rate 8% (above 5% target) → Need tune echoThreshold
2. Ducking transition noticeable click → Need smooth ramp curve

**Recommendations:**
- Increase echoThreshold to 0.65
- Use exponentialRampToValueAtTime instead of linearRamp
- Add smoothing window to RMS calculation

**Overall Status:** 🟡 NEEDS TUNING
```

---

## 🚀 Next Steps

Après validation manuelle:

1. **Configuration Tuning** → Ajuster thresholds basés sur résultats réels
2. **Unit Tests** → Écrire tests automatisés pour chaque composant
3. **Integration Tests** → E2E flows avec mocks audio
4. **Performance Benchmarks** → Valider métriques sur hardware varié
5. **Production Deployment** → Staging → Beta → Production

---

## 📚 References

- Architecture: `SUPER_PROMPT_VIII_FULL_DUPLEX_v∞.5_COMPLETE.md`
- Quick Start: `QUICKSTART_FULL_DUPLEX_v∞.5.md`
- Changelog: `CHANGELOG_v∞.5_FULL_DUPLEX.md`
- Validation: `VALIDATION_FINALE_FULL_DUPLEX_v∞.5.md`

---

**🔥 Full Duplex v∞.5 — TITANE_INFINITY**
*Conversation naturelle, interruptions organiques, IA contextuelle*
