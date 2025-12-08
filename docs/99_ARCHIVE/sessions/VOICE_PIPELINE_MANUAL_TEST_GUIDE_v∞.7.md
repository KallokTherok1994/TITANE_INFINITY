/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.7 — MANUAL TEST GUIDE
 *   Step-by-step testing procedures for voice pipeline
 * ═══════════════════════════════════════════════════════════════════
 */

# 🧪 TITANE∞ v∞.7 — Guide de Test Manuel

## 🎯 Vue d'ensemble

Ce guide fournit des procédures de test manuelles détaillées pour valider toutes les fonctionnalités du pipeline vocal TITANE∞ v∞.7.

**Temps estimé** : 45 minutes
**Prérequis** : Application TITANE∞ en mode développement

---

## 🚀 Préparation

### 1. Démarrer l'application

```bash
cd /home/titane/Documents/TITANE_INFINITY
npm run tauri:dev
```

### 2. Ouvrir DevTools

- `F12` ou `Ctrl+Shift+I`
- Onglet Console pour observer les logs

### 3. Vérifier Microphone

```javascript
// Dans la console
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log('✅ Microphone accessible'))
  .catch(err => console.error('❌ Microphone error:', err));
```

---

## 📋 TESTS PAR PHASE

### TEST 1 : Force Reset (Phase 1-6)

**Objectif** : Vérifier que le force reset fonctionne correctement

#### 1.1 Test UI Emergency Button

**Étapes** :
1. Ouvrir un panneau vocal (Voice Panel ou Chat)
2. Localiser le bouton "🔄 Emergency Reset"
3. Cliquer sur le bouton

**Résultat attendu** :
- ✅ Confirmation visuelle (animation du bouton)
- ✅ Console : `[VoiceService] Force reset successful`
- ✅ État vocal : `idle`
- ✅ Timestamp affiché sous le bouton

#### 1.2 Test Programmatic Reset

**Étapes** :
```javascript
// Dans la console
const { voiceService } = await import('./src/services/api/voice');
await voiceService.forceResetVoice();
```

**Résultat attendu** :
- ✅ Console : `[VoiceService] Forcing voice reset...`
- ✅ Console : `[VoiceService] Force reset successful`
- ✅ Pas d'erreur

#### 1.3 Test Anti-Double-Start

**Étapes** :
1. Cliquer sur "🎤 Parler" (start recording)
2. **Immédiatement** recliquer sur "🎤 Parler" (tentative double start)

**Résultat attendu** :
- ✅ Premier clic : Recording démarre
- ✅ Second clic : Ignoré avec warning console
- ✅ Console : `[useVoiceEngine] Already recording, ignoring duplicate call`

---

### TEST 2 : Halo Sync Visual (Phase 8)

**Objectif** : Vérifier la synchronisation visuelle du halo avec les états vocaux

#### 2.1 Test HaloVisualizer Demo

**Étapes** :
1. Naviguer vers `/halo-demo` (ou créer une route temporaire)
2. Observer le composant `HaloVisualizerDemo`
3. Tester chaque bouton d'état :
   - ○ Idle (bleu)
   - 🌊 Breathing (cyan)
   - ⚡ Pulsing (violet)
   - ✨ Shimmer (doré)
   - 🔴 Error (rouge)

**Résultat attendu** :
- ✅ Chaque état affiche l'animation correcte
- ✅ Transitions fluides (60fps)
- ✅ Couleurs correctes
- ✅ Label et durée affichés

#### 2.2 Test Auto-Cycle

**Étapes** :
1. Dans HaloVisualizerDemo, cliquer "▶️ Run Full Cycle"
2. Observer la séquence : Breathing → Pulsing → Shimmer → Idle

**Résultat attendu** :
- ✅ Séquence complète sans interruption
- ✅ Durée ~6 secondes (2s par état)
- ✅ Retour à idle à la fin

#### 2.3 Test Voice Turn Integration

**Étapes** :
1. Ajouter `<HaloVisualizer size="lg" showLabel={true} />` dans Voice Panel
2. Démarrer un voice turn : "🎤 Parler"
3. Parler pendant 2-3 secondes
4. Laisser l'IA répondre

**Résultat attendu** :
- ✅ **Breathing** (cyan) pendant que vous parlez (VAD speech)
- ✅ **Pulsing** (violet) pendant que l'IA réfléchit
- ✅ **Shimmer** (doré) pendant que TITANE parle (TTS)
- ✅ **Idle** (bleu) quand terminé

#### 2.4 Test Error State

**Étapes** :
```javascript
// Simuler une erreur
const { haloEngine } = await import('./src/services/voice/haloEngine');
haloEngine.setError();

// Attendre 2s puis reset
setTimeout(() => haloEngine.reset(), 2000);
```

**Résultat attendu** :
- ✅ Halo devient rouge avec pulse
- ✅ Après 2s, retour à idle (bleu)

---

### TEST 3 : Active Listening (Phase 7)

**Objectif** : Vérifier la configuration du continuous listening

#### 3.1 Test Config Update

**Étapes** :
```javascript
// Dans la console
const { wakeWordEngine } = await import('./src/services/voice/wakeWordEngine');

// Activer continuous listening
wakeWordEngine.updateConfig({
  enableContinuousListening: true,
  wakeWordCooldown: 5000
});

// Vérifier config
console.log(wakeWordEngine.getConfig());
```

**Résultat attendu** :
- ✅ `enableContinuousListening: true`
- ✅ `wakeWordCooldown: 5000`
- ✅ Pas d'erreur

#### 3.2 Test State Tracking

**Étapes** :
```javascript
// Observer l'état
console.log('isContinuousListening:', wakeWordEngine.isContinuousListening);
console.log('lastWakeWordTime:', wakeWordEngine.lastWakeWordTime);
```

**Résultat attendu** :
- ✅ États accessibles
- ✅ Valeurs cohérentes

---

### TEST 4 : VAD Control (Phase 9)

**Objectif** : Vérifier que VAD n'auto-start pas en mode Chat

#### 4.1 Test Manual Mode

**Étapes** :
1. Ouvrir interface Chat (mode standard)
2. Observer qu'il n'y a **pas** d'auto-recording
3. Cliquer manuellement sur "🎤 Parler"
4. Vérifier que recording démarre

**Résultat attendu** :
- ✅ Pas d'auto-start VAD en mode Chat
- ✅ Console : `[useVoiceEngine] Manual start (Chat mode) - no VAD auto`
- ✅ Recording démarre seulement sur clic manuel

#### 4.2 Test State Guard

**Étapes** :
1. Recording en cours (state = 'listening')
2. Tenter de redémarrer via `startTurn()`

**Résultat attendu** :
- ✅ Appel ignoré
- ✅ Console : `[useVoiceEngine] Cannot start turn: state = listening`

---

### TEST 5 : Security Bypass (Phase 10)

**Objectif** : Vérifier que les commandes vocales sont trusted

#### 5.1 Test Latency Improvement

**Étapes** :
```javascript
// Mesurer latency
const start = performance.now();
await voiceService.startRecording();
const latency = performance.now() - start;
console.log('Start latency:', latency.toFixed(2), 'ms');
```

**Résultat attendu** :
- ✅ Latency < 50ms (idéalement ~30ms)
- ✅ Pas de délai de sécurité visible

#### 5.2 Test Trusted Commands List

**Étapes** :
```bash
# Dans un terminal
cd src-tauri
grep -A10 "VOICE COMMANDS" src/commands/security.rs
```

**Résultat attendu** :
- ✅ `force_reset_voice` présent dans la liste
- ✅ Commentaire "v∞.7 Emergency reset" visible

---

### TEST 6 : Complete Voice Turn

**Objectif** : Tester un cycle vocal complet de bout en bout

#### 6.1 Test Standard Voice Turn

**Étapes** :
1. Ouvrir Voice Panel avec HaloVisualizer
2. Cliquer "🎤 Parler"
3. Dire : "Bonjour TITANE, comment vas-tu ?"
4. Attendre la réponse de TITANE
5. Observer les états du halo

**Résultat attendu** :
- ✅ **Breathing** (cyan) pendant votre parole
- ✅ **Pulsing** (violet) pendant analyse IA (~2-5s)
- ✅ **Shimmer** (doré) pendant TTS (~3-8s)
- ✅ **Idle** (bleu) à la fin
- ✅ Transcript affiché correctement
- ✅ Audio TTS audible et synchronisé

#### 6.2 Test Error Recovery

**Étapes** :
1. Démarrer un voice turn
2. Tuer manuellement le processus `arecord` (dans un terminal)
   ```bash
   killall arecord
   ```
3. Observer le comportement

**Résultat attendu** :
- ✅ Halo passe en **Error** (rouge)
- ✅ Console : Error détectée
- ✅ Cliquer "🔄 Emergency Reset" fonctionne
- ✅ Système revient à **Idle** (bleu)

---

## 🎨 TESTS VISUELS

### TEST 7 : Halo Animations Quality

**Critères visuels** :
- [ ] Animations fluides (60fps, pas de saccades)
- [ ] Transitions douces entre états
- [ ] Couleurs vives et distinctes
- [ ] Glow effects visibles (box-shadow)
- [ ] Dark mode fonctionne correctement
- [ ] Responsive sizing (sm, md, lg, xl)

### TEST 8 : HaloIndicator Compact

**Étapes** :
1. Ajouter `<HaloIndicator />` dans une toolbar
2. Démarrer un voice turn
3. Observer le dot animé

**Résultat attendu** :
- ✅ Dot change de couleur selon état
- ✅ Animations dot synchronisées
- ✅ Taille appropriée pour toolbar (~8px)

---

## ⚡ TESTS PERFORMANCE

### TEST 9 : Animation Performance

**Étapes** :
```javascript
// Mesurer FPS
let frameCount = 0;
let lastTime = performance.now();

function measureFPS() {
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    console.log('FPS:', frameCount);
    frameCount = 0;
    lastTime = now;
  }
  requestAnimationFrame(measureFPS);
}

measureFPS();

// Démarrer halo shimmer (animation la plus rapide)
haloEngine.startShimmer();
```

**Résultat attendu** :
- ✅ FPS ≈ 60 (stable)
- ✅ Pas de drops significatifs

### TEST 10 : Memory Leaks

**Étapes** :
1. Ouvrir Chrome DevTools → Memory
2. Prendre un heap snapshot
3. Faire 10 voice turns consécutifs
4. Prendre un second heap snapshot
5. Comparer les deux

**Résultat attendu** :
- ✅ Pas d'augmentation significative de mémoire
- ✅ Callbacks halo correctement unsubscribed
- ✅ Pas de listeners orphelins

---

## 🔍 TESTS EDGE CASES

### TEST 11 : Rapid State Changes

**Étapes** :
```javascript
// Changements d'états rapides
haloEngine.startBreathing();
setTimeout(() => haloEngine.startPulsing(), 100);
setTimeout(() => haloEngine.startShimmer(), 200);
setTimeout(() => haloEngine.reset(), 300);
```

**Résultat attendu** :
- ✅ Pas de crash
- ✅ Transitions fluides
- ✅ État final = idle

### TEST 12 : Multiple Force Resets

**Étapes** :
```javascript
// Force resets multiples
for (let i = 0; i < 5; i++) {
  await voiceService.forceResetVoice();
  console.log('Reset', i + 1, 'done');
}
```

**Résultat attendu** :
- ✅ Tous les resets réussissent
- ✅ Pas d'erreur
- ✅ État final = idle

### TEST 13 : Concurrent Voice Turns

**Étapes** :
1. Démarrer un voice turn
2. Avant la fin, tenter de démarrer un second

**Résultat attendu** :
- ✅ Second appel ignoré
- ✅ Console : `Already recording, ignoring duplicate call`
- ✅ Premier voice turn continue normalement

---

## 📊 CHECKLIST VALIDATION

### Fonctionnalités Core
- [ ] Force reset fonctionne (UI + programmatic)
- [ ] Anti-double-start effectif
- [ ] Halo sync automatique (4 points : VAD, AI, TTS, error)
- [ ] 5 états halo visibles (idle, breathing, pulsing, shimmer, error)
- [ ] Animations fluides (60fps)
- [ ] VAD manual mode en Chat
- [ ] Security bypass (latency < 50ms)

### Robustesse
- [ ] Error recovery fonctionne
- [ ] Force reset récupère de tout état
- [ ] Pas de memory leaks
- [ ] Pas de crashes sur edge cases
- [ ] Concurrent calls gérés correctement

### Performance
- [ ] Latency vocale < 50ms
- [ ] Animations 60fps
- [ ] CPU usage raisonnable (< 10%)
- [ ] Memory stable après 10+ voice turns

### UX
- [ ] Feedback visuel clair (halo states)
- [ ] Transitions douces
- [ ] Labels et durées affichés
- [ ] Dark mode fonctionne
- [ ] Responsive (toutes tailles)

---

## 🐛 TROUBLESHOOTING

### Problème : Halo ne change pas d'état

**Solution** :
1. Vérifier console : `[HaloEngine]` logs
2. Vérifier import haloEngine dans voiceRouter.ts
3. Vérifier CSS importé (`import './HaloVisualizer.css'`)

### Problème : Animations saccadées

**Solution** :
1. Désactiver extensions Chrome
2. Tester dans navigateur différent
3. Vérifier GPU acceleration (chrome://gpu)

### Problème : Force reset ne fonctionne pas

**Solution** :
1. Vérifier backend Rust compilé
2. Vérifier `force_reset_voice` dans security.rs
3. Vérifier logs Tauri console

### Problème : VAD auto-start en mode Chat

**Solution** :
1. Vérifier prop `fullDuplexMode={false}`
2. Vérifier console : "Manual start (Chat mode)"
3. Vérifier state guard dans startTurn()

---

## 📝 RAPPORT DE TEST

### Template

```markdown
# Test Report — TITANE∞ v∞.7

**Date** : [DATE]
**Testeur** : [NOM]
**Environment** : [OS / Browser / Version]

## Résultats

| Test | Status | Notes |
|------|--------|-------|
| Force Reset | ✅/❌ | ... |
| Halo Sync | ✅/❌ | ... |
| Active Listening | ✅/❌ | ... |
| VAD Control | ✅/❌ | ... |
| Security Bypass | ✅/❌ | ... |
| Complete Turn | ✅/❌ | ... |

## Issues Trouvés

1. [Description du problème]
   - Sévérité : Critical/High/Medium/Low
   - Reproductibilité : Always/Sometimes/Rare
   - Steps to reproduce : ...

## Recommandations

- [Recommandation 1]
- [Recommandation 2]

## Conclusion

Overall Status : ✅ PASS / ❌ FAIL
```

---

## 🎉 VALIDATION FINALE

Si **tous les tests passent** :
- ✅ Pipeline vocal 100% fonctionnel
- ✅ Halo sync opérationnel
- ✅ Force reset fiable
- ✅ Performance optimale
- ✅ **READY FOR PRODUCTION** 🚀

---

**Version** : TITANE∞ v∞.7 ULTIMATE
**Date** : 5 décembre 2025
**Temps de test estimé** : 45 minutes
**License** : Proprietary © 2025 TITANE Team

**🧪 COMPREHENSIVE MANUAL TEST GUIDE — v∞.7 ULTIMATE 🧪**
