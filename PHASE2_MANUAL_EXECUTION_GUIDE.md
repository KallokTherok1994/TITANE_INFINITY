# 🎯 PHASE 2 — GUIDE D'EXÉCUTION MANUELLE

**Date:** 2026-02-02  
**Durée:** ~90 minutes  
**Mode:** Auditeur interactif

---

## ⚡ DÉMARRAGE RAPIDE

### 1️⃣ PRÉ-REQUIS (5 min)

```bash
# Terminal 1: Lancer TITANE
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
pnpm run dev:tauri
```

Attendre que TITANE démarre à http://127.0.0.1:5173

### 2️⃣ DEVTOOLS INJECTION (2 min)

1. Ouvrir DevTools (F12) dans TITANE
2. Aller dans l'onglet Console
3. Copier-coller ce code:

```javascript
// PHASE 2 AUTO-LOGGING INJECTION
window.__PHASE2_LOGS = [];
window.__PHASE2_LOG = (event, data) => {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    data,
  };
  window.__PHASE2_LOGS.push(entry);
  console.log('[PHASE2]', event, data);
};

window.__PHASE2_SHOW_SUMMARY = () => {
  console.table(window.__PHASE2_LOGS);
};

window.__PHASE2_EXPORT_LOGS = () => {
  const json = JSON.stringify(window.__PHASE2_LOGS, null, 2);
  console.log('COPY THIS JSON:', json);
  return json;
};

console.log('🚀 PHASE 2 AUTO-LOGGING INITIALIZED');
```

4. Attendre le message: `🚀 PHASE 2 AUTO-LOGGING INITIALIZED`

### 3️⃣ VÉRIFIER TAURI (1 min)

Dans Console DevTools, exécuter:

```javascript
window.__TAURI__ ? '✅ TAURI_OK' : '❌ TAURI_MISSING';
```

Si résultat = `✅ TAURI_OK`, continuer. Sinon, relancer en mode Tauri.

---

## 📋 SEGMENT A: STATE COHERENCE (20 min)

### Test A.1: Boot State

**Action:** Recharger la page (F5)  
**Observer:** UI se charge proprement, pas d'erreurs console  
**Résultat:** VALID si OK, INVALID si erreurs

### Test A.2: Send Message

**Action:** Taper "test" dans chat, envoyer  
**Observer:** Message apparaît, spinner visible, réponse arrive  
**Résultat:** VALID si tout visible, INVALID si silent

### Test A.3: Rapid Fire

**Action:** Envoyer 3 messages rapidement: "msg1", "msg2", "msg3"  
**Observer:** Les 3 messages apparaissent, 3 réponses arrivent  
**Résultat:** VALID si tous visibles, INVALID si perdu

### Test A.4: Invalid Input

**Action:** Envoyer message invalide ou vide  
**Observer:** Erreur de validation affichée (pas de silence)  
**Résultat:** VALID si erreur montrée, INVALID si silent

### Test A.5: Navigation

**Action:** Cliquer Settings → puis revenir au chat  
**Observer:** Messages précédents toujours là  
**Résultat:** VALID si état persiste, INVALID si perdu

### Test A.6: Error State

**Action:** Forcer une erreur (ex: débrancher Ollama temporairement)  
**Observer:** Message d'erreur clair dans UI  
**Résultat:** VALID si erreur visible, INVALID si silent

### Test A.7: Reload

**Action:** Recharger page (F5)  
**Observer:** Conversation précédente se recharge  
**Résultat:** VALID si persisté, INVALID si perdu

**Score minimal:** ≥6/7 pour passer

---

## 📋 SEGMENT B: CHAT IA LOGIC (30 min)

### Test B.1: Simple Message

**Action:** Envoyer "Hello"  
**Observer:** Réponse arrive en <10s  
**Résultat:** PASS si réponse OK, FAIL si timeout/silent

### Test B.2: Complex Query

**Action:** Envoyer "Quelle est la signification de la vie?"  
**Observer:** Réponse cohérente arrive  
**Résultat:** PASS si réponse reçue, FAIL si erreur

### Test B.3: Error Handling

**Action:** Envoyer caractères invalides: `{invalid`  
**Observer:** Erreur de parsing affichée (pas de crash silencieux)  
**Résultat:** PASS si erreur montrée, FAIL si silent

### Test B.4: Latency Check

**Action:** Envoyer "test" et chronométrer  
**Observer:** Noter le temps de réponse  
**Résultat:** PASS si <5s normal, FAIL si >30s

### Test B.5: Concurrent Messages

**Action:** Envoyer 2 messages rapides sans attendre réponse  
**Observer:** Les 2 reçoivent des réponses  
**Résultat:** PASS si 2 réponses OK, FAIL si 1 perdue

### Test B.6: Empty Input

**Action:** Appuyer Enter sans texte  
**Observer:** Validation affichée (message requis)  
**Résultat:** PASS si validation visible, FAIL si envoi silencieux

### Test B.7: Long Message

**Action:** Envoyer message de 500+ caractères  
**Observer:** Traité sans erreur  
**Résultat:** PASS si traité OK, FAIL si tronqué/erreur

### Test B.8: Special Characters

**Action:** Envoyer "Hello 👋 مرحبا 🎉"  
**Observer:** Unicode géré correctement  
**Résultat:** PASS si affiché OK, FAIL si corrompu

### Test B.9: Timeout Behavior

**Action:** Si une réponse prend >30s  
**Observer:** Erreur de timeout affichée (pas de spinner infini)  
**Résultat:** PASS si erreur montrée, FAIL si hang

**Score minimal:** ≥8/9 pour passer

---

## 📋 SEGMENT C: MEMORY & PERSISTENCE (15 min)

### Test C.1: STM (Short-Term Memory)

**Action:** Regarder les 5 derniers messages  
**Observer:** Tous visibles dans UI  
**Résultat:** PASS si présents, FAIL si manquants

### Test C.2: MTM (Mid-Term Memory)

**Action:** Scroller historique, voir messages plus anciens  
**Observer:** Contexte de conversation maintenu  
**Résultat:** PASS si contexte OK, FAIL si perdu

### Test C.3: LTM (Long-Term Memory)

**Action:** Rechercher vieux messages (si fonctionnalité existe)  
**Observer:** Récupérables depuis stockage  
**Résultat:** PASS si récupérables, FAIL si perdus

### Test C.4: Reload Persistence

**Action:** Recharger page (F5)  
**Observer:** Conversation entière se recharge  
**Résultat:** PASS si rechargée, FAIL si vide

### Test C.5: UI ↔ Backend ↔ IA Coherence

**Action:** Vérifier dans Console DevTools les logs IPC  
**Observer:** État UI = État Backend = État IA (pas de désynchronisation)  
**Résultat:** PASS si cohérent, FAIL si désync

**Score minimal:** ≥4/5 pour passer

---

## 📋 SEGMENT D: TAURI IPC & SECURITY (15 min)

### Test D.1: IPC Invocation Logging

**Action:** Envoyer message (déclenche IPC)  
**Observer:** Dans Console, voir logs `[IPC] secureInvoke(...)`  
**Résultat:** PASS si loggé, FAIL si silent

### Test D.2: Authorization

**Action:** Tenter commande non autorisée (si possible)  
**Observer:** Rejetée avec erreur claire  
**Résultat:** PASS si rejetée, FAIL si exécutée

### Test D.3: Error Response from Rust

**Action:** Forcer erreur côté Rust (ex: Ollama down)  
**Observer:** Erreur propagée au UI avec message clair  
**Résultat:** PASS si erreur visible, FAIL si silent

### Test D.4: Response Validation

**Action:** Vérifier format des réponses IPC dans Console  
**Observer:** Format JSON valide, pas de corruption  
**Résultat:** PASS si valide, FAIL si corrompu

### Test D.5: Timeout Handling

**Action:** Si IPC call prend >5s  
**Observer:** Timeout géré avec erreur, pas de hang  
**Résultat:** PASS si timeout géré, FAIL si hang

### Test D.6: Concurrent IPC Calls

**Action:** Déclencher plusieurs appels IPC simultanés  
**Observer:** Tous traités, pas de blocage  
**Résultat:** PASS si tous OK, FAIL si bloqués

**Score minimal:** ≥5/6 pour passer

---

## 📋 SEGMENT E: EDGE CASES (Optional, 10 min)

**Facultatif.** Si temps disponible:

- E.1: Memory Leak Test (envoyer 50+ messages, observer mémoire)
- E.2: Boundary Integers (valeurs extrêmes)
- E.3: Null/Undefined Handling
- E.4: Rate Limiting (spam messages)
- E.5: Offline Mode (débrancher réseau)

---

## 📤 EXPORT DES PREUVES (5 min)

### Dans Console DevTools:

```javascript
// 1. Voir résumé
__PHASE2_SHOW_SUMMARY();

// 2. Exporter JSON
__PHASE2_EXPORT_LOGS();

// 3. Copier le JSON affiché
// 4. Sauvegarder dans: reports/phase2/phase2-manual-logs.json
```

### Capturer Screenshots:

- Screenshot UI principale
- Screenshot Console avec logs
- Screenshot erreurs (si présentes)

Sauvegarder dans: `reports/phase2/screenshots/`

---

## 📊 CALCUL DU VERDICT

### FAIL si:

- ❌ Segment A: <6/7 (86%)
- ❌ Segment B: <8/9 (89%)
- ❌ Segment C: <4/5 (80%)
- ❌ Segment D: <5/6 (83%)
- ❌ Silent failures détectés
- ❌ Corruptions détectées
- ❌ Tauri absent

### PASS si:

- ✅ Segment A: ≥6/7
- ✅ Segment B: ≥8/9
- ✅ Segment C: ≥4/5
- ✅ Segment D: ≥5/6
- ✅ ZÉRO silent failures
- ✅ ZÉRO corruptions
- ✅ Tauri présent & vérifié

---

## 📄 RAPPORT FINAL

### Créer: `reports/phase2/REPORT_PHASE2_MANUAL.md`

```markdown
# PHASE 2 VERIFICATION REPORT (MANUAL)

**Date:** [DATE]  
**Auditeur:** Kevin Thibault  
**Durée:** [X] minutes

## Résultats

### Segment A: [SCORE]/7

- A.1: [VALID/INVALID]
- A.2: [VALID/INVALID]
- ...

### Segment B: [SCORE]/9

- B.1: [PASS/FAIL]
- ...

### Segment C: [SCORE]/5

### Segment D: [SCORE]/6

### Segment E: [SCORE]/5 (optionnel)

## Issues Trouvés

1. [ID] [SEVERITY] Description
2. ...

## Silent Failures

- Aucun ✅
- OU: Liste des silent failures détectés

## Corruptions

- Aucune ✅
- OU: Liste des corruptions détectées

## Verdict Final

**[PASS/FAIL]**

### Si PASS:

✅ Phase 2 vérifiée. Prêt pour Phase 3 (Backend & Database).

### Si FAIL:

❌ Phase 2 échouée. Issues à corriger:

- [Liste des issues critiques]

## Prochaines Étapes

- [Action 1]
- [Action 2]
```

---

## 🎯 APRÈS PHASE 2

### Si PASS:

→ Lancer Phase 3 (Backend & Database)

### Si FAIL:

→ Créer plan de correction
→ Corriger issues
→ Re-tester Phase 2

---

**Bon courage! Phase 2 est le test le plus critique de l'audit.**
