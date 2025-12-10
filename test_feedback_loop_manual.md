# TEST FEEDBACK LOOP MANUAL — P0-1

**Date**: 8 décembre 2025  
**Objectif**: Valider architecture 3-layers anti-feedback en conditions réelles  
**Status**: ⏳ En attente test manuel

---

## 🎯 OBJECTIF

Valider que l'architecture anti-feedback à 3 couches empêche effectivement la boucle TTS → Microphone :

1. **Layer 1**: Hardware echo cancellation (`echoCancellation: true`)
2. **Layer 2**: VAD suspension (auto-mute pendant TTS)
3. **Layer 3**: Voice fingerprinting (détection acoustique TITANE vs User)

---

## 📋 PRÉREQUIS

- ✅ Matériel : Ordinateur avec haut-parleurs + microphone intégrés (ou séparés)
- ✅ Configuration : **SANS casque** (test acoustique speaker → mic)
- ✅ Volume : Haut-parleurs à **80%**
- ✅ Environnement : Pièce silencieuse (pas d'écho parasite)

---

## 🧪 PROCÉDURE DE TEST

### **Étape 1 : Lancer TITANE en mode Tauri**

```bash
cd /home/titane/Documents/TITANE_INFINITY
npm run tauri dev
```

**Vérifications initiales** :

- ✅ Application démarre sans erreur
- ✅ Console DevTools ouverte (F12)
- ✅ Onglet "Console" visible (pour logs temps réel)

---

### **Étape 2 : Vérifier permissions audio**

**Actions** :

1. Cliquer sur l'icône microphone dans TITANE
2. Navigateur demande permission micro → **Accepter**
3. Vérifier logs console :

```
[useVAD] 🎤 Audio context initialized
[useVAD] 🎤 Microphone connected
[audioStateMachine] 🔵 IDLE (ready for user input)
```

**Critères succès** :

- ✅ Pas d'erreur "NotAllowedError" ou "NotFoundError"
- ✅ State machine en état `idle`
- ✅ Indicateur visuel microphone actif

---

### **Étape 3 : Test cycle vocal simple (x10)**

**Scénario** : 10 cycles de requête vocale complète

| Cycle | Phrase user                 | Attendu TITANE | Durée max |
| ----- | --------------------------- | -------------- | --------- |
| 1     | "Bonjour TITANE"            | Réponse vocale | 10s       |
| 2     | "Comment vas-tu ?"          | Réponse vocale | 10s       |
| 3     | "Quelle heure est-il ?"     | Réponse vocale | 10s       |
| 4     | "Raconte-moi une blague"    | Réponse vocale | 15s       |
| 5     | "Donne-moi un conseil"      | Réponse vocale | 15s       |
| 6     | "Parle-moi du soleil"       | Réponse vocale | 15s       |
| 7     | "Qu'est-ce que tu aimes ?"  | Réponse vocale | 15s       |
| 8     | "Explique la photosynthèse" | Réponse vocale | 20s       |
| 9     | "Résume en 3 mots ton rôle" | Réponse vocale | 10s       |
| 10    | "Merci, au revoir"          | Réponse vocale | 10s       |

**Actions par cycle** :

1. Parler clairement dans le microphone (phrase courte)
2. Attendre détection VAD (voyant vert ou log `USER_SPEAKING`)
3. Attendre silence → log `PROCESSING`
4. TITANE répond (TTS playback) → log `AI_SPEAKING`
5. **OBSERVER** : Micro doit être suspendu pendant TTS
6. TTS termine → log `IDLE`
7. Passer au cycle suivant

---

### **Étape 4 : Vérifier logs Layer 2 (VAD suspension)**

**Logs attendus pendant TTS playback** :

```
[useTTSWithMicControl] 🔇 Suspending VAD for TTS playback
[audioStateMachine] 🟡 IDLE → AI_SPEAKING (TTS start)
[useVAD] ⏸️ VAD suspended (Layer 2 anti-feedback)
[useTTSWithMicControl] ✅ TTS playback completed
[useTTSWithMicControl] 🔊 Resuming VAD after 500ms delay
[audioStateMachine] 🟡 AI_SPEAKING → IDLE (TTS end)
[useVAD] ▶️ VAD resumed
```

**Critères succès** :

- ✅ VAD suspendue 100% du temps pendant TTS
- ✅ Resume delay de 500ms respecté
- ✅ Pas de log `USER_SPEAKING` pendant TTS (= Layer 2 fonctionne)

---

### **Étape 5 : Vérifier logs Layer 3 (Voice Fingerprinting)**

⚠️ **Note** : Layer 3 nécessite calibration au démarrage (voir Étape 6)

**Logs attendus si Layer 3 active** :

```
[voiceFingerprintTauri] 🎯 Calibrating TITANE voice with 5 samples
[voiceFingerprintTauri] ✅ TITANE voice profile calibrated
[useVAD] 🎯 TITANE detected (similarity: 0.87), skipping VAD
```

**Critères succès** :

- ✅ Si audio TTS détecté par erreur → Layer 3 bloque (pas d'ASR)
- ✅ Similarity score > 0.75 = TITANE détecté
- ✅ Logs montrent `skipping VAD` si TTS audio capté

---

### **Étape 6 : Calibration Layer 3 (optionnel)**

**Si Layer 3 pas calibrée** (logs `⚠️ TITANE profile not calibrated`) :

```typescript
// Dans DevTools Console (F12)
// 1. Générer 5 échantillons TTS TITANE
const samples = await Promise.all([
  generateTTSSample('Bonjour, je suis TITANE'),
  generateTTSSample('Comment puis-je vous aider ?'),
  generateTTSSample('Je suis là pour vous assister'),
  generateTTSSample('Posez-moi vos questions'),
  generateTTSSample('Je vous écoute attentivement'),
]);

// 2. Calibrer profile
await window.__TITANE__.voiceFingerprintTauri.calibrateTitaneVoice(samples);
```

**Vérification** :

```bash
# Console logs attendus
[voiceFingerprintTauri] 🎯 Calibrating TITANE voice with 5 samples
[voiceFingerprintTauri] ✅ TITANE voice profile calibrated
```

---

## 📊 MÉTRIQUES À COLLECTER

### **1. Timing VAD Suspension**

| Métrique        | Target        | Mesure      | Status |
| --------------- | ------------- | ----------- | ------ |
| Suspend latency | < 50ms        | \_\_\_\_ ms | ⏳     |
| Resume delay    | 500ms ± 50ms  | \_\_\_\_ ms | ⏳     |
| TTS overlap     | 0% (0 frames) | \_\_\_\_ %  | ⏳     |

**Comment mesurer** :

```typescript
// Dans useVAD.ts (lignes ~140-150)
const suspendStartTime = performance.now();
// ... suspension code
const suspendLatency = performance.now() - suspendStartTime;
console.log(`[METRIC] Suspend latency: ${suspendLatency.toFixed(2)}ms`);
```

---

### **2. Layer 3 Accuracy**

| Métrique              | Target | Mesure     | Status |
| --------------------- | ------ | ---------- | ------ |
| TITANE detection rate | > 80%  | \_\_\_\_ % | ⏳     |
| False positive rate   | < 5%   | \_\_\_\_ % | ⏳     |
| False negative rate   | < 10%  | \_\_\_\_ % | ⏳     |

**Définitions** :

- **True Positive** : Audio TTS détecté comme TITANE (similarity > 0.75)
- **False Positive** : Audio user détecté comme TITANE (erreur Layer 3)
- **False Negative** : Audio TTS pas détecté comme TITANE (Layer 3 rate)

---

### **3. Feedback Loop Detection**

| Cycle | Feedback détecté ? | Cause | Fix appliqué |
| ----- | ------------------ | ----- | ------------ |
| 1     | ❌ Non             | -     | -            |
| 2     | ❌ Non             | -     | -            |
| 3     | ❌ Non             | -     | -            |
| 4     | ❌ Non             | -     | -            |
| 5     | ❌ Non             | -     | -            |
| 6     | ❌ Non             | -     | -            |
| 7     | ❌ Non             | -     | -            |
| 8     | ❌ Non             | -     | -            |
| 9     | ❌ Non             | -     | -            |
| 10    | ❌ Non             | -     | -            |

**Définition feedback loop** :

- TTS audio déclenche re-capture VAD (state `USER_SPEAKING` pendant `AI_SPEAKING`)
- ASR transcrit propre voix TITANE au lieu de user
- OMEGA génère réponse à sa propre parole (boucle infinie)

**Critères succès** : **0 feedback loop sur 10 cycles**

---

## ✅ CRITÈRES DE VALIDATION

### **P0-1 SUCCÈS si** :

1. ✅ **0 feedback loop détecté** sur 10 cycles vocaux
2. ✅ **Layer 2 (VAD suspension)** : 100% efficace (VAD suspendue pendant TTS)
3. ✅ **Layer 3 (Voice fingerprinting)** : > 80% accuracy (si calibrée)
4. ✅ **Timing** : Suspend latency < 50ms, resume delay ~500ms
5. ✅ **Audio quality** : Pas d'écho audible, pas de distorsion

### **P0-1 ÉCHEC si** :

1. ❌ **≥ 1 feedback loop détecté** (boucle TTS → Mic)
2. ❌ **Layer 2 rate** : VAD capture audio TTS (state `USER_SPEAKING` pendant `AI_SPEAKING`)
3. ❌ **Layer 3 high false positive** : > 10% user voice détectée comme TITANE
4. ❌ **Timing dégradé** : Suspend latency > 100ms
5. ❌ **Audio artifacts** : Écho, distorsion, clipping

---

## 🐛 DEBUGGING EN CAS D'ÉCHEC

### **Cas 1 : Feedback loop détecté**

**Symptômes** :

- Logs montrent `USER_SPEAKING` pendant `AI_SPEAKING`
- ASR transcrit voix TITANE au lieu de user
- Boucle infinie réponses TITANE

**Causes possibles** :

1. Layer 2 pas activée (bug `suspendForTTS()`)
2. Layer 1 echo cancellation off (browser config)
3. Volume trop élevé (> 90%)

**Actions** :

```typescript
// Vérifier suspension active
console.log('[DEBUG] suspendedRef.current:', suspendedRef.current);

// Vérifier echo cancellation
navigator.mediaDevices.getUserMedia({
  audio: { echoCancellation: true, noiseSuppression: true },
});
```

---

### **Cas 2 : Layer 3 high false positive**

**Symptômes** :

- User voice détectée comme TITANE (similarity > 0.75)
- Commandes vocales ignorées
- Logs `🎯 TITANE detected, skipping VAD`

**Causes possibles** :

1. Calibration profile incorrect
2. Threshold trop bas (< 0.75)
3. Similarité pitch user ≈ TITANE

**Actions** :

```typescript
// Re-calibrer avec plus d'échantillons
const samples = await Promise.all([
  // ... 10 échantillons diversifiés
]);
await voiceFingerprintTauri.calibrateTitaneVoice(samples);

// Ajuster threshold (si nécessaire)
// Dans voice_fingerprint.rs ligne ~50
similarity_threshold: 0.80, // Au lieu de 0.75
```

---

### **Cas 3 : Suspend latency élevée**

**Symptômes** :

- Delay > 100ms entre TTS start et VAD suspend
- Audio TTS capté pendant ~100ms avant suspension

**Causes possibles** :

1. CPU overload (> 80%)
2. Audio context latency élevée
3. Suspension async mal gérée

**Actions** :

```typescript
// Profiler CPU
console.log('[DEBUG] CPU usage:', performance.now());

// Réduire audio context latency
const audioContext = new AudioContext({ latencyHint: 'interactive' });

// Synchroniser suspension (pas async)
suspendedRef.current = true; // Immédiat, pas await
```

---

## 📝 RAPPORT FINAL

**Template de rapport P0-1** :

```markdown
# P0-1 TEST FEEDBACK LOOP — RAPPORT FINAL

**Date**: [DATE]  
**Testeur**: [NOM]  
**Environment**: [OS, Browser, Hardware]

## Résultats

- ✅/❌ **Feedback loop** : [X détectés sur 10 cycles]
- ✅/❌ **Layer 2 (VAD suspension)** : [X% efficace]
- ✅/❌ **Layer 3 (Voice fingerprinting)** : [X% accuracy]
- ✅/❌ **Timing** : Suspend [X]ms, Resume [X]ms
- ✅/❌ **Audio quality** : [Pas d'écho / Écho détecté]

## Métriques

| Métrique             | Target | Mesure | Status |
| -------------------- | ------ | ------ | ------ |
| Feedback loops       | 0      | [X]    | ✅/❌  |
| VAD suspend efficacy | 100%   | [X]%   | ✅/❌  |
| Layer 3 accuracy     | > 80%  | [X]%   | ✅/❌  |
| Suspend latency      | < 50ms | [X]ms  | ✅/❌  |
| Resume delay         | 500ms  | [X]ms  | ✅/❌  |

## Conclusion

[✅ P0-1 VALIDÉ / ❌ P0-1 ÉCHEC]

**Justification** : [Texte libre 2-3 phrases]

## Recommandations

1. [Amélioration 1 si échec]
2. [Amélioration 2 si échec]
3. [Amélioration 3 si échec]
```

---

## 🔗 FICHIERS IMPACTÉS

- `src/hooks/useVAD.ts` : Layer 2+3 integration
- `src/hooks/useTTSWithMicControl.ts` : Layer 2 suspend/resume
- `src/services/voice/voiceFingerprintTauri.ts` : Layer 3 service
- `src-tauri/src/audio/voice_fingerprint.rs` : Layer 3 backend
- `src/stores/audioStateMachine.ts` : State transitions

---

## 📚 RÉFÉRENCES

- **VOCAL_MAP.md** : Architecture vocale complète
- **OMEGA_MAP_VOCALE.md** : Pipeline OMEGA vocale
- **P0_2_VOICE_FINGERPRINTING_REPORT_v20.0.md** : Layer 3 détails
- **P0_7_TESTS_USEVAD_REPORT_v20.0.md** : Tests Layer 2
- **DIAGNOSTIC_PLAN_ACTION_VOCAL_v∞.md** : Plan complet P0-1 à P0-7

---

**Prochaine étape après P0-1** : P0-4 (Test backend Parler-TTS Python)
