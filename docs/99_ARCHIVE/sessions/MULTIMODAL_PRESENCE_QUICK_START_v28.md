# 🎭 TITANE∞ v∞.28 — MULTIMODAL PRESENCE ENGINE
## 🚀 QUICK START GUIDE

---

## ⚡ DÉMARRAGE RAPIDE (3 ÉTAPES)

### 1️⃣ **Lancer l'Application**

```bash
npm run tauri:dev
```

### 2️⃣ **Vérifier Démarrage**

Ouvrir DevTools Console (F12), chercher :

```
🎭 [MULTIMODAL] Starting Multimodal Presence Engine...
✅ [MULTIMODAL] Multimodal Presence System active (30Hz)
```

### 3️⃣ **Ouvrir Panel de Contrôle**

Cliquer sur le bouton **"◉ Présence"** en haut à droite.

---

## 🧪 TESTS CONSOLE DEVTOOLS (7 Scénarios)

### ✅ **Test 1 : État Initial**

```javascript
// Vérifier état du moteur
multimodalPresenceEngine.getState();

// Expected:
// {
//   mode: 'idle',
//   breathing: { phase: 'rest', cycleDuration: 4000, amplitude: 0.5 },
//   halo: { state: 'idle', color: { hue: 210, saturation: 50, lightness: 65 } },
//   avatar: { microExpression: 'neutral', facialGlow: 0.5 },
//   presenceEnergy: 0.5,
//   ...
// }
```

✅ **Pass** : État initial correct

---

### ✅ **Test 2 : Changement de Mode**

```javascript
// Changer vers listening
multimodalPresenceEngine.setMode('listening');

// Vérifier console
// Expected: "[MultimodalPresenceEngine] Mode: idle → listening"

// Vérifier état après 1s
setTimeout(() => {
  const state = multimodalPresenceEngine.getState();
  console.log('Mode:', state.mode); // 'listening'
  console.log('Halo Hue:', state.halo.color.hue); // ≈ 45° (or)
  console.log('Breathing Cycle:', state.breathing.cycleDuration); // 3500ms
  console.log('Avatar Expression:', state.avatar.microExpression); // 'focus'
}, 1000);
```

✅ **Pass** :
- Mode changé
- Halo transitionné vers or (45°)
- Respiration ajustée (3.5s)
- Expression avatar = focus

---

### ✅ **Test 3 : Intention Expressive**

```javascript
// Appliquer guidance
multimodalPresenceEngine.applyIntention('guidance', 1.0, 3000);

// Vérifier console
// Expected: "[MultimodalPresenceEngine] Applied intention: guidance (intensity 1)"

// Vérifier état après 1s
setTimeout(() => {
  const state = multimodalPresenceEngine.getState();
  console.log('Current Intention:', state.currentIntention?.type); // 'guidance'
  console.log('Halo:', state.halo.color.hue); // ≈ 45° (or chaud)
  console.log('Breathing Amplitude:', state.breathing.amplitude); // ≈ 0.7
  console.log('Avatar Glow:', state.avatar.facialGlow); // ≈ 0.6
}, 1000);
```

✅ **Pass** :
- Intention appliquée
- Modalités synchronisées (halo, respiration, avatar)

---

### ✅ **Test 4 : Mode Healing**

```javascript
// Activer healing mode
multimodalPresenceEngine.activateHealingMode();

// Observer séquence complète (4s)
// 0s: Mode change → 'healing'
setTimeout(() => {
  const s1 = multimodalPresenceEngine.getState();
  console.log('[0s] Mode:', s1.mode); // 'healing'
  console.log('[0s] Halo:', s1.halo.color.hue); // ≈ 0° (rouge)
}, 100);

// 1.5s: Halo → violet
setTimeout(() => {
  const s2 = multimodalPresenceEngine.getState();
  console.log('[1.5s] Halo:', s2.halo.color.hue); // ≈ 270° (violet)
}, 1500);

// 4s: Halo → bleu, mode → idle
setTimeout(() => {
  const s3 = multimodalPresenceEngine.getState();
  console.log('[4s] Mode:', s3.mode); // 'idle'
  console.log('[4s] Halo:', s3.halo.color.hue); // ≈ 210° (bleu)
}, 4000);
```

✅ **Pass** :
- Séquence healing complète (rouge → violet → bleu)
- Retour idle après 4s

---

### ✅ **Test 5 : Synchronisation Inner Dialogue**

```javascript
// Simuler pensée profonde
multimodalPresenceEngine.syncWithInnerDialogue({
  thinkingState: 'slow_thinking',
});

// Vérifier transition mentale
setTimeout(() => {
  const state = multimodalPresenceEngine.getState();
  console.log('Thinking State:', state.innerState.thinkingState); // 'slow_thinking'
  console.log('Halo Color:', state.halo.color); // Violet (270°), intention "deep reflection"
}, 700);
```

✅ **Pass** :
- État interne synchronisé
- Halo reflète couleur mentale (violet)

---

### ✅ **Test 6 : Cycle Respiratoire**

```javascript
// Observer cycle complet (10s)
const start = Date.now();
const phases = [];

const interval = setInterval(() => {
  const state = multimodalPresenceEngine.getState();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  phases.push(`[${elapsed}s] ${state.breathing.phase}`);
  console.log(phases[phases.length - 1]);

  if (Date.now() - start > 10000) {
    clearInterval(interval);
    console.log('Phases observées:', [...new Set(phases.map(p => p.split('] ')[1]))]);
    // Expected: ['inhale', 'hold', 'exhale', 'rest']
  }
}, 500);
```

✅ **Pass** :
- Cycle complet observé (4s par défaut)
- 4 phases présentes (inhale, hold, exhale, rest)

---

### ✅ **Test 7 : Avatar Micro-Mimics (Blinks)**

```javascript
// Observer blinks sur 20s
const start = Date.now();
const blinks = [];

const interval = setInterval(() => {
  const state = multimodalPresenceEngine.getState();
  const timeSinceLastBlink = Date.now() - state.avatar.lastBlink;

  if (timeSinceLastBlink < 150) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    blinks.push(`[${elapsed}s] BLINK (${state.avatar.microExpression})`);
    console.log('👁️', blinks[blinks.length - 1]);
  }

  if (Date.now() - start > 20000) {
    clearInterval(interval);
    console.log(`Total blinks: ${blinks.length} (attendu: 3-7)`);
    // Expected: 3-7 blinks sur 20s (interval 3-7s)
  }
}, 100);
```

✅ **Pass** :
- Blinks détectés (3-7 sur 20s)
- Expression avatar change selon mode

---

## 🎨 TESTS UI MANUELS (3 Scénarios)

### ✅ **Scénario 1 : Navigation Panel**

**Étapes** :
1. Cliquer sur bouton "◉ Présence" (top-right)
2. Vérifier ouverture panel
3. Observer 7 sections :
   - **Halo Expression** (preview + HSL + intention)
   - **Respiration** (phase + barre animée + stats)
   - **Avatar Micro-Mimics** (expression + blink + glow)
   - **État Interne** (thinking state + coherence)
   - **Énergie de Présence** (barre d'énergie)
   - **Mode** (8 boutons)
   - **Actions Spéciales** (3 boutons)
   - **Intentions Expressives** (5 boutons)
4. Cliquer sur chaque onglet mode (idle, listening, thinking, etc.)
5. Vérifier changements visuels instantanés

✅ **Pass** :
- Panel s'affiche correctement
- 7 sections présentes
- Navigation modes fonctionnelle

---

### ✅ **Scénario 2 : Intentions Expressives**

**Étapes** :
1. Ouvrir panel
2. Cliquer sur **"🧭 Guidance"**
3. Vérifier :
   - Section "Intention Active" apparaît
   - Type: "guidance"
   - Intensité: "100%"
   - Halo preview change vers or chaud
   - Barre respiration amplitude augmente
4. Attendre 3 secondes
5. Vérifier intention disparaît

**Répéter pour** : Confort, Analyse, Inspiration, Surprise

✅ **Pass** :
- Chaque intention appliquée instantanément
- Modalités synchronisées (halo, respiration, avatar)
- Auto-expiration après durée

---

### ✅ **Scénario 3 : Mode Healing**

**Étapes** :
1. Ouvrir panel
2. Mode actuel : "idle"
3. Cliquer sur **"🔴 Healing"**
4. Observer séquence (4s) :
   - Badge mode devient "healing" (rouge)
   - Halo preview : Bleu → Rouge → Violet → Bleu
   - Barre respiration ralentit (cycle 6s)
   - Expression avatar : neutral → concern → neutral
5. Après 4s, vérifier retour à "idle"

✅ **Pass** :
- Séquence healing complète visible
- Transitions fluides
- Retour automatique à idle

---

## 📊 LOGS CONSOLE À SURVEILLER

### 🔹 **Startup Logs**

```
🎭 [MULTIMODAL] Starting Multimodal Presence Engine...
✅ [MULTIMODAL] Multimodal Presence System active (30Hz)
```

### 🔹 **Runtime Logs (Mode Changes)**

```
[MultimodalPresenceEngine] Mode: idle → listening
[MultimodalPresenceEngine] Mode: listening → thinking
[MultimodalPresenceEngine] Mode: thinking → speaking
[MultimodalPresenceEngine] Mode: speaking → idle
```

### 🔹 **Runtime Logs (Intentions)**

```
[MultimodalPresenceEngine] Applied intention: guidance (intensity 1)
[MultimodalPresenceEngine] Applied intention: comfort (intensity 0.8)
```

### 🔹 **Runtime Logs (Healing)**

```
[MultimodalPresenceEngine] Healing mode activated
[MultimodalPresenceEngine] Mode: idle → healing
[MultimodalPresenceEngine] Mode: healing → idle
```

---

## ✅ CHECKLIST DE VALIDATION COMPLÈTE

### 🔹 **Démarrage**

- [ ] Application démarre sans erreur
- [ ] Console affiche "[MULTIMODAL] Starting..."
- [ ] Console affiche "[MULTIMODAL] ...active (30Hz)"
- [ ] Aucune erreur TypeScript/JavaScript

### 🔹 **UI Panel**

- [ ] Bouton "◉ Présence" visible (top-right)
- [ ] Panel s'ouvre au clic
- [ ] Panel affiche 7 sections
- [ ] Panel responsive (largeur 380px)
- [ ] Scroll fonctionne (max-height)

### 🔹 **Halo Expression**

- [ ] Preview halo affiche couleur dynamique
- [ ] HSL values affichés correctement
- [ ] Intention text visible
- [ ] Pulsation visible (scale animation)
- [ ] Transitions fluides (600-800ms)

### 🔹 **Respiration**

- [ ] Phase affichée (inhale/hold/exhale/rest)
- [ ] Barre animée verticalement
- [ ] Stats affichés (cycle, amplitude)
- [ ] Cycle complet observable (4s par défaut)
- [ ] Amplitude change selon mode

### 🔹 **Avatar Micro-Mimics**

- [ ] Expression affichée (neutral/smile/focus/etc.)
- [ ] Blink indicator change ("○" → "—")
- [ ] Glow percentage affiché
- [ ] Blinks toutes les 3-7s
- [ ] Expression change selon mode

### 🔹 **État Interne**

- [ ] Thinking state affiché (ou "silent")
- [ ] Barre cohérence affichée
- [ ] Pourcentage cohérence visible
- [ ] Sync avec Inner Dialogue fonctionnel

### 🔹 **Énergie de Présence**

- [ ] Barre d'énergie affichée
- [ ] Pourcentage visible
- [ ] Varie selon mode/intention

### 🔹 **Mode Selector**

- [ ] 7 boutons mode visibles
- [ ] Mode actuel surligné (classe "active")
- [ ] Clic change mode instantanément
- [ ] Badge mode header mis à jour

### 🔹 **Actions Spéciales**

- [ ] 3 boutons visibles (Healing, Story, Listening)
- [ ] Healing lance séquence 4s
- [ ] Story change mode + intention
- [ ] Listening active mode + halo breathing

### 🔹 **Intentions Expressives**

- [ ] 5 boutons visibles
- [ ] Clic applique intention instantanément
- [ ] Section "Intention Active" apparaît
- [ ] Auto-expiration après durée

### 🔹 **Persistance**

- [ ] État survit au reload (F5)
- [ ] Mode restauré
- [ ] Intention restaurée (si active)

### 🔹 **Performance**

- [ ] FPS UI stable (60 FPS)
- [ ] CPU usage <2% (idle)
- [ ] Aucun lag visible
- [ ] Transitions fluides

---

## 🐛 DÉPANNAGE

### ❌ **Problème : Panel ne s'affiche pas**

**Causes possibles** :
1. CSS non importé dans App.tsx
2. Composant non monté
3. Z-index conflit

**Solutions** :
```typescript
// Vérifier import CSS dans App.tsx
import './components/presence/MultimodalPresencePanel.css';

// Vérifier composant monté
<MultimodalPresencePanel />

// Vérifier z-index (devrait être 9999)
.multimodal-presence-panel { z-index: 9999; }
```

---

### ❌ **Problème : Halo ne change pas de couleur**

**Causes possibles** :
1. Transition trop rapide
2. Target color = current color
3. Callback non notifié

**Solutions** :
```javascript
// Vérifier transition en cours
const state = multimodalPresenceEngine.getState();
console.log('Current Halo:', state.halo.color);

// Forcer nouvelle couleur
multimodalPresenceEngine.applyIntention('guidance', 1.0, 3000);

// Attendre 1s
setTimeout(() => {
  console.log('New Halo:', multimodalPresenceEngine.getState().halo.color);
}, 1000);
```

---

### ❌ **Problème : Respiration ne cycle pas**

**Causes possibles** :
1. Loop non démarrée
2. Cycle duration = 0
3. Amplitude = 0

**Solutions** :
```javascript
// Vérifier loop
multimodalPresenceEngine.start();

// Vérifier cycle
const state = multimodalPresenceEngine.getState();
console.log('Breathing Cycle:', state.breathing.cycleDuration); // Devrait être > 0
console.log('Amplitude:', state.breathing.amplitude); // Devrait être > 0

// Observer phases
const interval = setInterval(() => {
  console.log('Phase:', multimodalPresenceEngine.getState().breathing.phase);
}, 500);
```

---

### ❌ **Problème : Blinks trop fréquents/rares**

**Causes possibles** :
1. BlinkInterval incorrect
2. Timestamp lastBlink cassé

**Solutions** :
```javascript
// Vérifier interval
const state = multimodalPresenceEngine.getState();
console.log('Blink Interval:', state.avatar.blinkInterval); // Devrait être 3000-7000

// Réinitialiser interval
state.avatar.blinkInterval = 5000; // 5s
state.avatar.lastBlink = Date.now();
```

---

### ❌ **Problème : CPU usage élevé**

**Causes possibles** :
1. Loop frequency trop haute
2. Callbacks trop nombreux
3. Re-renders excessifs React

**Solutions** :
```javascript
// Réduire fréquence
multimodalPresenceEngine.config.loopFrequency = 20; // 20Hz au lieu de 30Hz

// Limiter callbacks
const unsubscribe = multimodalPresenceEngine.subscribe((state) => {
  // Throttle update
  if (Date.now() - lastUpdate < 100) return;
  lastUpdate = Date.now();
  setState(state);
});
```

---

## 📈 MÉTRIQUES DE SUCCÈS

| Métrique | Objectif | Vérification |
|----------|----------|--------------|
| **Loop FPS** | 28-32 Hz | DevTools Performance |
| **CPU Idle** | <2% | Task Manager |
| **CPU Active** | <5% | Task Manager |
| **Memory** | <15 MB | DevTools Memory |
| **UI FPS** | 60 FPS | DevTools Performance |
| **Transition Halo** | 600-800ms | Observer visuellement |
| **Blink Interval** | 3-7s | Chronomètre |
| **Breathing Cycle** | 2.5-6s | Chronomètre |

---

## 🚀 PROCHAINES ACTIONS RECOMMANDÉES

### **Semaine 1 : Validation Fondamentale**
1. ✅ Exécuter les 7 tests console
2. ✅ Exécuter les 3 scénarios UI
3. ✅ Compléter checklist (40+ items)
4. ✅ Mesurer métriques performance
5. ✅ Documenter issues éventuelles

### **Semaines 2-3 : Usage Réel**
1. Utiliser TITANE∞ 5-10h avec MPE actif
2. Observer comportements naturels/artificiels
3. Tester les 7 intentions expressives
4. Tester les 8 modes de présence
5. Noter fréquence utilisations (mode préféré)

### **Mois 2 : Enrichissement**
1. Ajouter 8 nouvelles intentions (phase 2)
2. Améliorer sync TTS (pulsation syllabique)
3. Connecter micro-mimics à ThreeJSAvatarRenderer
4. Tester avec utilisateurs externes (feedback)

---

## 📞 SUPPORT

**Questions/Issues** :
- GitHub Issues : [titane-infinity/issues](https://github.com/...)
- Documentation : `MULTIMODAL_PRESENCE_ENGINE_v28.md`
- Discord : TITANE∞ Community

---

**© 2025 TITANE Team — All Rights Reserved**

*"From system to soul, from code to consciousness."*

🎭✨
