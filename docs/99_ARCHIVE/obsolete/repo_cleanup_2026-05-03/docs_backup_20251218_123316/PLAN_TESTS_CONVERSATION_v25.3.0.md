# 🧪 PLAN DE TESTS COMPLET - PAGE CONVERSATION v25.3.0

**Date:** 16 décembre 2025  
**Version:** TITANE∞ v25.3.0  
**Responsable:** QA Team + Dev Team

---

## 📋 VUE D'ENSEMBLE

### Objectifs des Tests

- ✅ Valider toutes les fonctionnalités
- ✅ Vérifier performance et stabilité
- ✅ Assurer sécurité et robustesse
- ✅ Confirmer UX optimale

### Méthodologie

- **Tests manuels** - Interface et flux utilisateur
- **Tests automatisés** - Logique et API
- **Tests de charge** - Performance sous stress
- **Tests de sécurité** - Vulnérabilités et exploits

---

## 🎯 TESTS FONCTIONNELS

### TC-001: Envoi et Réception de Message

**Prérequis:** Page Conversation ouverte, provider sélectionné

| Étape | Action                 | Résultat Attendu            |
| ----- | ---------------------- | --------------------------- |
| 1     | Taper "Bonjour TITANE" | Texte apparaît dans input   |
| 2     | Cliquer "Envoyer"      | Message utilisateur affiché |
| 3     | Attendre réponse       | Loading indicator visible   |
| 4     | Réponse reçue          | Message assistant affiché   |
| 5     | Vérifier scroll        | Auto-scroll vers bas        |

**Critères de Succès:**

- ✅ Message utilisateur visible immédiatement
- ✅ Loading max 3 secondes
- ✅ Réponse cohérente et contextuelle
- ✅ Scroll automatique fonctionne
- ✅ Timestamp correct

**Statut:** [ ] À tester | [x] Réussi | [ ] Échec

---

### TC-002: Changement de Provider

**Prérequis:** Conversation active avec messages

| Étape | Action                | Résultat Attendu               |
| ----- | --------------------- | ------------------------------ |
| 1     | Sélectionner "Gemini" | Provider changé                |
| 2     | Envoyer message       | Réponse de Gemini              |
| 3     | Changer pour "Ollama" | Provider changé                |
| 4     | Envoyer message       | Réponse d'Ollama               |
| 5     | Vérifier métadonnées  | Provider correct dans metadata |

**Critères de Succès:**

- ✅ Changement provider instantané
- ✅ Pas de perte de messages
- ✅ Réponses adaptées au provider
- ✅ Metadata provider_used correcte

**Statut:** [ ] À tester | [ ] Réussi | [ ] Échec

---

### TC-003: Modes Conversationnels

**Prérequis:** Page Conversation ouverte

**Tests pour chaque mode:**

| Mode           | Test                 | Résultat Attendu                  |
| -------------- | -------------------- | --------------------------------- |
| Normal         | "Explique-moi React" | Réponse standard claire           |
| Brainstorming  | "Idées app mobile"   | Réponse créative, multiples idées |
| Synthèse       | "Résume cet article" | Réponse concise, structurée       |
| Planification  | "Plan projet 3 mois" | Réponse avec étapes, timeline     |
| Journal        | "Ma journée"         | Réponse empathique, réflexive     |
| Debug Cognitif | "Analyse système"    | Réponse technique, diagnostics    |

**Critères de Succès:**

- ✅ Chaque mode adapte le comportement
- ✅ System prompt correctement appliqué
- ✅ Cohérence tonalité par mode

**Statut:** [ ] À tester | [ ] Réussi | [ ] Échec

---

### TC-004: Mode Builder - Création Mode Custom

**Prérequis:** Aucun mode custom existant

| Étape | Action                          | Résultat Attendu              |
| ----- | ------------------------------- | ----------------------------- |
| 1     | Cliquer bouton ⚙️               | Modal Mode Builder s'ouvre    |
| 2     | Décrire concept "Expert Python" | Texte saisi                   |
| 3     | Cliquer "Générer avec IA"       | Prompt généré automatiquement |
| 4     | Modifier nom: "Python Pro"      | Nom mis à jour                |
| 5     | Sélectionner icône 🐍           | Icône changée                 |
| 6     | Ajuster température: 0.6        | Slider mis à jour             |
| 7     | Cliquer "Aperçu"                | Preview affiché correctement  |
| 8     | Cliquer "Sauvegarder"           | Mode sauvegardé, modal ferme  |
| 9     | Vérifier liste modes            | "Python Pro" 🐍 visible       |
| 10    | Sélectionner et tester          | Comportement conforme         |

**Critères de Succès:**

- ✅ Workflow complet sans erreur
- ✅ Génération IA fonctionnelle
- ✅ Mode persist après refresh page
- ✅ Mode utilisable immédiatement

**Statut:** [ ] À tester | [ ] Réussi | [ ] Échec

---

### TC-005: Mode Builder - Templates

**Prérequis:** Modal Mode Builder ouvert

| Template             | Test             | Résultat Attendu               |
| -------------------- | ---------------- | ------------------------------ |
| Expert Technique     | Cliquer template | Fields remplis automatiquement |
| Coach Créatif        | Cliquer template | Prompt créativité correct      |
| Analyste Stratégique | Cliquer template | Prompt stratégie correct       |
| Mentor Pédagogique   | Cliquer template | Prompt pédagogie correct       |

**Critères de Succès:**

- ✅ Tous les fields remplis
- ✅ Prompts cohérents avec template
- ✅ Sauvegarde possible directement

**Statut:** [ ] À tester | [ ] Réussi | [ ] Échec

---

### TC-006: Audio - Text-to-Speech

**Prérequis:** TTS disponible sur système

| Étape | Action                | Résultat Attendu           |
| ----- | --------------------- | -------------------------- |
| 1     | Cliquer bouton 🔇     | Icône change en 🔊         |
| 2     | Envoyer message       | Réponse textuelle + audio  |
| 3     | Vérifier lecture      | Audio joué automatiquement |
| 4     | Envoyer autre message | Audio joué à nouveau       |
| 5     | Cliquer 🔊            | Audio désactivé, icône 🔇  |
| 6     | Envoyer message       | Pas d'audio                |

**Critères de Succès:**

- ✅ Toggle fonctionne correctement
- ✅ Audio qualité acceptable
- ✅ Synchronisation texte/audio
- ✅ Pas de delay excessif (< 2s)

**Statut:** [ ] À tester | [ ] Réussi | [ ] Échec

---

### TC-007: Audio - Speech-to-Text

**Prérequis:** Microphone disponible, permissions accordées

| Étape | Action                        | Résultat Attendu             |
| ----- | ----------------------------- | ---------------------------- |
| 1     | Cliquer bouton 🎤             | Recording démarre, bouton 🔴 |
| 2     | Parler: "Test reconnaissance" | Transcription en cours       |
| 3     | Cliquer à nouveau             | Recording stop               |
| 4     | Vérifier input                | Texte "Test reconnaissance"  |
| 5     | Envoyer                       | Message normal traité        |

**Critères de Succès:**

- ✅ Recording démarre/stop correctement
- ✅ Transcription précise (>80%)
- ✅ Texte inséré dans input
- ✅ Message envoyable normalement

**Statut:** [ ] À tester | [ ] Réussi | [ ] Échec

---

### TC-008: Health Check

**Prérequis:** Système fonctionnel

| Étape | Action                          | Résultat Attendu        |
| ----- | ------------------------------- | ----------------------- |
| 1     | Observer icône santé            | ✅ (Healthy)            |
| 2     | Cliquer icône                   | Health report rafraîchi |
| 3     | Vérifier console                | Aucune erreur           |
| 4     | Simuler anomalie (TODO backend) | ⚠️ Warning              |
| 5     | Attendre auto-repair            | Retour ✅               |

**Critères de Succès:**

- ✅ États santé corrects
- ✅ Auto-repair fonctionne
- ✅ Refresh instantané
- ✅ Cohérence score (>0.8)

**Statut:** [ ] À tester | [ ] Réussi | [ ] Échec

---

### TC-009: Clear Chat

**Prérequis:** Conversation avec plusieurs messages

| Étape | Action                 | Résultat Attendu      |
| ----- | ---------------------- | --------------------- |
| 1     | Cliquer bouton 🗑️      | Popup confirmation    |
| 2     | Confirmer              | Messages effacés      |
| 3     | Vérifier zone messages | Empty state affiché   |
| 4     | Vérifier localStorage  | Conversation archivée |

**Critères de Succès:**

- ✅ Confirmation demandée
- ✅ Messages effacés complètement
- ✅ Nouvel ID conversation généré
- ✅ Pas de crash

**Statut:** [ ] À tester | [ ] Réussi | [ ] Échec

---

### TC-010: Tags Cognitifs

**Prérequis:** Conversation active

| Étape | Action                                   | Résultat Attendu                   |
| ----- | ---------------------------------------- | ---------------------------------- |
| 1     | Envoyer "Développement React TypeScript" | Réponse reçue                      |
| 2     | Vérifier tags                            | Tags: "React", "TypeScript", "Dev" |
| 3     | Envoyer question différente              | Tags mis à jour                    |
| 4     | Observer métadonnées                     | Tags dans metadata.tags[]          |

**Critères de Succès:**

- ✅ Tags extraits automatiquement
- ✅ Max 3 tags affichés
- ✅ Tags pertinents et précis
- ✅ Pas de doublons

**Statut:** [ ] À tester | [ ] Réussi | [ ] Échec

---

## ⚡ TESTS DE PERFORMANCE

### TP-001: Temps de Réponse UI

| Métrique                | Cible   | Méthode de Mesure     |
| ----------------------- | ------- | --------------------- |
| Click → Message affiché | < 50ms  | Chrome DevTools       |
| Typing → Input update   | < 16ms  | Performance API       |
| Send → Message visible  | < 100ms | Timestamp diff        |
| Scroll auto             | < 100ms | requestAnimationFrame |

**Résultat:** [ ] Pass | [ ] Fail | Valeur mesurée: \_\_\_ms

---

### TP-002: Temps de Réponse Backend

| Provider | Cible | Mesure Réelle | Statut |
| -------- | ----- | ------------- | ------ |
| Gemini   | < 2s  | \_\_\_s       | [ ]    |
| Ollama   | < 5s  | \_\_\_s       | [ ]    |
| OpenAI   | < 3s  | \_\_\_s       | [ ]    |
| Claude   | < 3s  | \_\_\_s       | [ ]    |

**Conditions:** Message 50 caractères, historique 10 messages

---

### TP-003: Utilisation Mémoire

| Scénario             | Mémoire Initiale | Après 100 messages | Leak?           |
| -------------------- | ---------------- | ------------------ | --------------- |
| Conversation normale | \_\_\_MB         | \_\_\_MB           | [ ] Oui [ ] Non |
| Avec TTS activé      | \_\_\_MB         | \_\_\_MB           | [ ] Oui [ ] Non |
| Mode Builder ouvert  | \_\_\_MB         | \_\_\_MB           | [ ] Oui [ ] Non |

**Outil:** Chrome DevTools Memory Profiler

---

### TP-004: Charge Lourde

**Test:** 50 messages consécutifs en 30 secondes

| Métrique         | Résultat  |
| ---------------- | --------- |
| Messages envoyés | \_\_\_/50 |
| Messages reçus   | \_\_\_/50 |
| Erreurs          | \_\_\_    |
| Latence moyenne  | \_\_\_ms  |
| CPU usage        | \_\_\_%   |
| Mémoire peak     | \_\_\_MB  |

**Statut:** [ ] Pass | [ ] Fail

---

## 🔒 TESTS DE SÉCURITÉ

### TS-001: Injection XSS

**Test:** Envoyer messages avec scripts

| Payload                         | Résultat Attendu     |
| ------------------------------- | -------------------- |
| `<script>alert('XSS')</script>` | Échappé, pas exécuté |
| `<img src=x onerror=alert(1)>`  | Échappé, pas exécuté |
| `javascript:void(0)`            | Échappé, pas exécuté |

**Critères:** Aucun script ne doit s'exécuter

**Statut:** [ ] Pass | [ ] Fail

---

### TS-002: Injection SQL (Mémoire)

**Test:** Tenter injection dans sauvegarde mémoire

| Payload                      | Protection            |
| ---------------------------- | --------------------- |
| `'; DROP TABLE messages; --` | Parameterized queries |
| `1' OR '1'='1`               | Input validation      |

**Statut:** [ ] Pass | [ ] Fail

---

### TS-003: Rate Limiting

**Test:** Spam messages rapides

| Action              | Résultat Attendu      |
| ------------------- | --------------------- |
| 10 messages en 1s   | Throttle activé       |
| 100 messages en 10s | Bloqué temporairement |

**Statut:** [ ] Pass | [ ] Fail

---

## 📱 TESTS RESPONSIVE

### TR-001: Mobile (375px)

- [ ] Toolbar layout adaptatif
- [ ] Messages max-width 85%
- [ ] Input full-width
- [ ] Boutons touch-friendly (44px min)
- [ ] Scroll fluide
- [ ] Modal plein écran

---

### TR-002: Tablet (768px)

- [ ] Layout 2 colonnes si applicable
- [ ] Messages max-width 75%
- [ ] Toolbar horizontal
- [ ] Modal centré

---

### TR-003: Desktop (1920px)

- [ ] Layout optimal
- [ ] Max-width conversation container
- [ ] Tous les boutons visibles
- [ ] Pas de scroll horizontal

---

## ♿ TESTS ACCESSIBILITÉ

### TA-001: Keyboard Navigation

- [ ] Tab traverse tous les éléments
- [ ] Enter envoie message
- [ ] Esc ferme modals
- [ ] Focus visible sur éléments actifs

---

### TA-002: Screen Reader

- [ ] ARIA labels présents
- [ ] Rôles corrects (button, textbox, etc.)
- [ ] Live regions (messages, loading)
- [ ] Alt text images/icônes

---

### TA-003: Contraste Couleurs

- [ ] Ratio min 4.5:1 (texte normal)
- [ ] Ratio min 3:1 (texte large)
- [ ] Focus indicators visibles

---

## 🧪 TESTS AUTOMATISÉS (TODO)

### Exemple Test E2E (Playwright)

```typescript
test('send message and receive response', async ({ page }) => {
  await page.goto('/titane');

  // Click Conversation tab
  await page.click('text=💬 Conversation');

  // Type message
  await page.fill('.conversation-input', 'Bonjour TITANE');

  // Send
  await page.click('text=Envoyer');

  // Wait for response
  await page.waitForSelector('.conversation-message.assistant', {
    timeout: 5000,
  });

  // Verify
  const messages = await page.$$('.conversation-message');
  expect(messages.length).toBeGreaterThanOrEqual(2);
});
```

---

## 📊 RAPPORT DE TESTS

### Résumé Global

| Catégorie     | Total  | Réussis | Échecs | Taux    |
| ------------- | ------ | ------- | ------ | ------- |
| Fonctionnels  | 10     | \_\_\_  | \_\_\_ | \_\_\_% |
| Performance   | 4      | \_\_\_  | \_\_\_ | \_\_\_% |
| Sécurité      | 3      | \_\_\_  | \_\_\_ | \_\_\_% |
| Responsive    | 3      | \_\_\_  | \_\_\_ | \_\_\_% |
| Accessibilité | 3      | \_\_\_  | \_\_\_ | \_\_\_% |
| **TOTAL**     | **23** | \_\_\_  | \_\_\_ | \_\_\_% |

### Bugs Identifiés

| ID      | Sévérité | Description | Statut             |
| ------- | -------- | ----------- | ------------------ |
| BUG-001 | Haute    | \_\_\_      | [ ] Open [ ] Fixed |
| BUG-002 | Moyenne  | \_\_\_      | [ ] Open [ ] Fixed |
| BUG-003 | Basse    | \_\_\_      | [ ] Open [ ] Fixed |

### Recommandations

1. **Critiques** (à fixer immédiatement):
   - ***

2. **Importantes** (avant release):
   - ***

3. **Nice to have** (post-release):
   - ***

---

## ✅ VALIDATION FINALE

### Critères de Release

- [ ] Tous tests fonctionnels réussis (100%)
- [ ] Tous tests sécurité réussis (100%)
- [ ] Performance acceptable (>90%)
- [ ] Accessibilité conforme WCAG 2.1 AA
- [ ] 0 bugs critiques
- [ ] 0 bugs haute sévérité
- [ ] Documentation complète

### Approbations

- [ ] QA Lead: **\*\*\*\***\_**\*\*\*\***
- [ ] Dev Lead: **\*\*\*\***\_**\*\*\*\***
- [ ] Product Owner: **\*\*\*\***\_**\*\*\*\***
- [ ] Security Team: **\*\*\*\***\_**\*\*\*\***

**Date de validation:** **_/_**/2025

---

**Document de Tests - TITANE∞ v25.3.0**  
**Statut:** 🚧 En cours de tests
