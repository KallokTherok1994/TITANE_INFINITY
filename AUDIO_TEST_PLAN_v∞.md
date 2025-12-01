/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — AUDIO TEST PLAN
 *   Plan de tests pour validation complète du système audio
 * ═══════════════════════════════════════════════════════════════════
 */

# TITANE∞ AUDIO — PLAN DE TESTS v∞

## 🎯 Objectif

Valider que le système audio est **100% fonctionnel, cohérent et stable**.

---

## 📋 Tests Manuels

### TEST 1: Conversation audio simple (1 tour)

| Étape | Action | Résultat attendu | ✅/❌ |
|-------|--------|------------------|-------|
| 1.1 | Ouvrir TITANE∞ | Application démarre | |
| 1.2 | Vérifier micro disponible | Icône 🎤 active | |
| 1.3 | Cliquer sur 🎤 (mode vocal) | Mode vocal activé | |
| 1.4 | Parler: "Bonjour TITANE" | Transcription affichée | |
| 1.5 | Attendre réponse IA | Texte réponse visible | |
| 1.6 | Vérifier TTS | Réponse vocalisée | |
| 1.7 | Vérifier VAD suspendu | Pas d'auto-déclenchement | |

**Critère de succès**: Cycle complet sans erreur

---

### TEST 2: Conversation multi-tours

| Étape | Action | Résultat attendu | ✅/❌ |
|-------|--------|------------------|-------|
| 2.1 | Premier message vocal | Réponse TTS | |
| 2.2 | Attendre fin TTS | VAD reprend | |
| 2.3 | Deuxième message vocal | Transcription correcte | |
| 2.4 | Répéter 3-5 fois | Aucun bug | |
| 2.5 | Vérifier transitions | Fluides | |

**Critère de succès**: 5 tours sans auto-déclenchement

---

### TEST 3: Dictée micro → texte (nouveau)

| Étape | Action | Résultat attendu | ✅/❌ |
|-------|--------|------------------|-------|
| 3.1 | Localiser bouton 🎙️ | À côté de 📎 | |
| 3.2 | Cliquer sur 🎙️ | Bouton rouge, pulse | |
| 3.3 | Parler: "Test dictée" | Enregistrement | |
| 3.4 | Cliquer pour arrêter | Bouton normal | |
| 3.5 | Vérifier texte | "Test dictée" dans input | |
| 3.6 | Vérifier pas de TTS | Silence | |
| 3.7 | Éditer le texte | Possible | |
| 3.8 | Envoyer | Message envoyé à IA | |

**Critère de succès**: Texte inséré, éditable, pas de TTS auto

---

### TEST 4: Barge-in (interruption)

| Étape | Action | Résultat attendu | ✅/❌ |
|-------|--------|------------------|-------|
| 4.1 | Lancer conversation vocale | IA parle (TTS) | |
| 4.2 | Pendant TTS, parler fort | TTS s'arrête | |
| 4.3 | Vérifier recording | Démarre automatiquement | |
| 4.4 | Terminer message | Transcription OK | |

**Critère de succès**: Interruption détectée < 500ms

---

### TEST 5: Anti-echo

| Étape | Action | Résultat attendu | ✅/❌ |
|-------|--------|------------------|-------|
| 5.1 | Augmenter volume speakers | Fort | |
| 5.2 | Lancer conversation | IA répond | |
| 5.3 | TTS joue | Audio sort des speakers | |
| 5.4 | Observer VAD | Pas de déclenchement | |
| 5.5 | Fin TTS | VAD reprend | |

**Critère de succès**: VAD ne capture pas le TTS

---

### TEST 6: Erreurs - Sans microphone

| Étape | Action | Résultat attendu | ✅/❌ |
|-------|--------|------------------|-------|
| 6.1 | Désactiver microphone OS | Micro OFF | |
| 6.2 | Ouvrir TITANE∞ | App démarre | |
| 6.3 | Cliquer 🎙️ dictée | Bouton désactivé ou erreur | |
| 6.4 | Cliquer 🎤 vocal | Message d'erreur clair | |
| 6.5 | Pas de crash | App stable | |

**Critère de succès**: Dégradation gracieuse

---

### TEST 7: Longue session

| Étape | Action | Résultat attendu | ✅/❌ |
|-------|--------|------------------|-------|
| 7.1 | Laisser TITANE ouvert 30min | Stable | |
| 7.2 | 10+ conversations vocales | Toutes OK | |
| 7.3 | Observer mémoire | Pas de leak | |
| 7.4 | Observer CPU | Normal | |
| 7.5 | Health check | Tous indicateurs verts | |

**Critère de succès**: Performance stable après 30min

---

### TEST 8: Edge cases

| Étape | Action | Résultat attendu | ✅/❌ |
|-------|--------|------------------|-------|
| 8.1 | Message très long (30s) | Transcription complète | |
| 8.2 | Silence (5s) | Timeout gracieux | |
| 8.3 | Bruit de fond | Filtre bruit OK | |
| 8.4 | Langue mixte FR/EN | Transcription best-effort | |
| 8.5 | Double-clic rapide | Pas de double recording | |

**Critère de succès**: Aucun crash, comportement prévisible

---

## 🔧 Tests Automatisés (TODO)

### Unit Tests

```typescript
// tests/unit/useVoiceEngine.test.ts
describe('useVoiceEngine', () => {
  it('should initialize with idle state', () => {});
  it('should check mic availability', () => {});
  it('should start dictation mode', () => {});
  it('should stop dictation and return transcript', () => {});
  it('should handle errors gracefully', () => {});
  it('should integrate with audioStateMachine', () => {});
});

// tests/unit/DictationButton.test.tsx
describe('DictationButton', () => {
  it('should render with mic icon', () => {});
  it('should change to recording state on click', () => {});
  it('should call onDictationResult with transcript', () => {});
  it('should be disabled when mic not available', () => {});
});
```

### Integration Tests

```typescript
// tests/integration/audio-pipeline.test.ts
describe('Audio Pipeline', () => {
  it('should complete full conversation cycle', () => {});
  it('should suspend VAD during TTS', () => {});
  it('should detect barge-in', () => {});
  it('should handle multi-turn conversation', () => {});
});
```

### E2E Tests

```typescript
// tests/e2e/voice-conversation.spec.ts
test('voice conversation flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="voice-mode-toggle"]');
  // Mock audio input
  await page.evaluate(() => window.__mockAudioInput('Bonjour'));
  await expect(page.locator('.ai-response')).toContainText('Bonjour');
  await expect(page.locator('.tts-playing')).toBeVisible();
});
```

---

## 📊 Matrice de couverture

| Composant | Unit | Integration | E2E | Manuel |
|-----------|------|-------------|-----|--------|
| useVoiceEngine | 🔲 | 🔲 | 🔲 | ✅ |
| DictationButton | 🔲 | 🔲 | 🔲 | ✅ |
| ChatInput+Dictation | 🔲 | 🔲 | 🔲 | ✅ |
| hybridTTS | ✅ | 🔲 | 🔲 | ✅ |
| audioStateMachine | ✅ | 🔲 | 🔲 | ✅ |
| Anti-echo | ✅ | 🔲 | 🔲 | ✅ |
| Barge-in | ✅ | 🔲 | 🔲 | ✅ |

---

## 📝 Rapport de test

### Template

```
═══════════════════════════════════════════════
TITANE∞ AUDIO TEST REPORT
═══════════════════════════════════════════════

Date: ____________
Testeur: ____________
Version: v19.3.0-omega
OS: Pop!_OS 24.04

TESTS MANUELS:
  TEST 1 (Conversation 1 tour):    ✅ PASS / ❌ FAIL
  TEST 2 (Multi-tours):            ✅ PASS / ❌ FAIL
  TEST 3 (Dictée):                 ✅ PASS / ❌ FAIL
  TEST 4 (Barge-in):               ✅ PASS / ❌ FAIL
  TEST 5 (Anti-echo):              ✅ PASS / ❌ FAIL
  TEST 6 (Erreurs):                ✅ PASS / ❌ FAIL
  TEST 7 (Longue session):         ✅ PASS / ❌ FAIL
  TEST 8 (Edge cases):             ✅ PASS / ❌ FAIL

RÉSULTAT GLOBAL: ___/8 PASS

NOTES:
_______________________________________________
_______________________________________________
_______________________________________________

═══════════════════════════════════════════════
```

---

## 🚀 Prochaines étapes

1. Exécuter tous les tests manuels
2. Documenter les résultats
3. Corriger les éventuels bugs
4. Implémenter les tests automatisés
5. Intégrer en CI/CD

---

*Plan de tests généré par TITANE∞*
*© 2025 Humain Total / Kevin Thibault / TITANE Team*
