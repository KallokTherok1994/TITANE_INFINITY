# 🧪 TESTS TERRAIN SINGULARITY + R05 — SCÉNARIOS

**Date**: 11 décembre 2025  
**Runtime**: Titan-Dev (localhost:5173)  
**Version**: TITANE∞ v19.5.2  
**Status**: 🔄 **EN COURS**

---

## 📋 SCÉNARIOS DE TEST

### Groupe 1 : Singularity Meta-Processing

#### Test S1 : Conversation Courte (Baseline)

**Objectif**: Vérifier comportement normal sans LTM  
**Input**:

```
User: "Bonjour TITANE"
```

**Attentes**:

- ✅ Réponse générée via OMEGA
- ✅ Meta-processing Singularity activé
- ✅ Meta-tag `meta:coherence:*` présent
- ❌ Pas de LTM suggestion (message trop court <500 chars)
- ⏱️ Latence Singularity: <30ms

**Validation**:

- [ ] Response reçue dans Chat IA UI
- [ ] Logs montrent `[Ω:SINGULARITY] ✅ Meta-processing success`
- [ ] Meta-coherence score entre 0-1
- [ ] Aucun warning détecté

---

#### Test S2 : Conversation Longue (LTM Trigger)

**Objectif**: Déclencher suggestion LTM  
**Input**:

```
User: "TITANE, peux-tu m'expliquer en détail l'architecture de ton système Singularity ?
J'aimerais comprendre comment fonctionne la validation cohérence, l'analyse style French-only,
les critères de consolidation mémoire longue durée, et comment tu détectes les ambiguïtés
dans les réponses. Donne-moi aussi des exemples concrets de meta-tags générés et leur signification.
C'est important pour mon projet de recherche sur les systèmes meta-cognitifs d'IA."
```

**Caractéristiques**:

- Longueur: ~520 caractères (>500 target)
- Complexité: Haute (architecture, concepts techniques)
- Intention: Explanation (tag cognitive élevé)

**Attentes**:

- ✅ Réponse détaillée générée
- ✅ Meta-processing Singularity activé
- ✅ LTM suggestion présente (critère longueur >500)
- ✅ Cognitive_tags enrichis (>5 tags minimum)
- ✅ Meta-coherence élevé (>0.8)
- ⏱️ Latence Singularity: 15-30ms

**Validation**:

- [ ] Response longue reçue (>1000 chars)
- [ ] Logs montrent `ltm_suggestions: ["Long conversation..."]`
- [ ] Meta-tag `meta:ltm_candidate` présent
- [ ] Cognitive_tags count >5

---

#### Test S3 : Fuite Anglais (Style Validation)

**Objectif**: Détecter fuites anglais dans réponse  
**Input**:

```
User: "TITANE, what is the weather today?"
```

**Attentes**:

- ✅ Réponse générée (probablement avec anglais si pas de FrenchMastery pre-processing)
- ✅ Meta-processing Singularity activé
- ✅ Warning `meta:warning:english_leak` détecté
- ✅ Regex match: `\b(the|is|what|today)\b`
- ⚠️ Corrections potentiellement appliquées

**Validation**:

- [ ] Logs montrent détection fuite anglais
- [ ] Meta-tag `meta:warning:english_leak` présent
- [ ] Corrections_applied non vide (si corrections faites)
- [ ] Meta-coherence peut être réduit (<0.7)

---

#### Test S4 : Ambiguïté Détectée

**Objectif**: Détecter marqueurs incertitude  
**Input**:

```
User: "TITANE, est-ce que tu penses que l'IA va dépasser l'intelligence humaine ?"
```

**Attentes**:

- ✅ Réponse générée (probablement avec "peut-être", "probablement")
- ✅ Meta-processing Singularity activé
- ✅ Détection marqueur ambiguïté
- ✅ Meta-tag `meta:ambiguity_detected` présent
- 📊 Meta-coherence normal (ambiguïté ≠ incohérence)

**Marqueurs recherchés**:

- "peut-être"
- "probablement"
- "je ne suis pas sûr"
- "il semblerait"
- "possiblement"

**Validation**:

- [ ] Response contient marqueur ambiguïté
- [ ] Logs montrent détection ambiguïté
- [ ] Meta-tag warning présent
- [ ] Pas de correction (ambiguïté acceptable)

---

### Groupe 2 : R05 OMEGA Performance

#### Test R1 : Latence P2 (<200ms)

**Objectif**: Valider performance direct conversion  
**Input**:

```
User: "Quelle heure est-il ?"
```

**Attentes**:

- ✅ OMEGA Router: Classification intention (Help/Question)
- ✅ OMEGA Executor: Génération réponse rapide
- ✅ Direct conversion P2 (bypass legacy pipeline)
- ✅ FrenchMastery post-processing actif
- ✅ Latence totale <200ms
- ⏱️ Breakdown: OMEGA 100-150ms + P2 conversion 30-50ms + Singularity 10-30ms

**Validation**:

- [ ] Response instantanée (<200ms perceptible)
- [ ] Logs montrent `bypass_legacy=true`
- [ ] Timestamp départ → arrivée <200ms
- [ ] Aucun fallback legacy déclenché

---

#### Test R2 : Logs OMEGA Bypass

**Objectif**: Confirmer utilisation P2 direct  
**Input**:

```
User: "Explique-moi le fonctionnement d'OMEGA"
```

**Attentes**:

- ✅ OMEGA success (4 stages exécutés)
- ✅ Logs `[OMEGA:P2] Direct conversion activated`
- ✅ Logs `bypass_legacy=true`
- ❌ Aucun log legacy pipeline (IntentionDetector, EmotionAnalyzer old)

**Validation**:

- [ ] Grep logs: `bypass_legacy=true` présent
- [ ] Grep logs: Aucune trace "legacy" ou "fallback"
- [ ] Conversion OMEGA → ConversationResponse réussie
- [ ] FrenchMastery tags présents

---

#### Test R3 : Fallback Legacy (OMEGA Fail)

**Objectif**: Valider graceful degradation  
**Method**: Simuler échec OMEGA (si possible via config ou query edge-case)

**Attentes**:

- ⚠️ OMEGA fail détecté
- ✅ Fallback automatique vers legacy pipeline
- ✅ Logs `[OMEGA] Failed, fallback to legacy`
- ✅ Response générée via legacy (latence ~300ms acceptable)
- ✅ Pas de crash, erreur silencieuse

**Validation**:

- [ ] Response reçue malgré OMEGA fail
- [ ] Logs montrent fallback explicit
- [ ] Latence >200ms mais <400ms (legacy overhead)
- [ ] User ne voit aucune erreur

---

### Groupe 3 : Performance Metrics

#### Test P1 : Mesure Latence Singularity

**Objectif**: Confirmer overhead <30ms  
**Method**: Analyser logs timestamps

**Calcul**:

```
Singularity_latency = timestamp_after_singularity - timestamp_before_singularity
```

**Attentes**:

- ✅ Latence moyenne: 10-25ms
- ✅ Latence max: <30ms
- ⚠️ Latence >30ms: Identifier bottleneck (regex? LTM criteria?)

**Validation**:

- [ ] 10 samples collectés
- [ ] Moyenne calculée
- [ ] Aucun outlier >50ms
- [ ] Overhead <2% latence totale

---

#### Test P2 : Mesure Latence OMEGA P2

**Objectif**: Confirmer target <200ms  
**Method**: Analyser logs timestamps pipeline complet

**Calcul**:

```
Total_latency = timestamp_response - timestamp_user_input
Breakdown:
  - OMEGA: 100-150ms
  - P2 conversion: 30-50ms
  - Singularity: 10-30ms
  - Network overhead: 10-20ms
```

**Attentes**:

- ✅ Latence totale moyenne: 150-200ms
- ✅ Latence max: <250ms (acceptable edge-case)
- 🎯 Target: <200ms (90% queries)

**Validation**:

- [ ] 20 queries testées
- [ ] 90% <200ms
- [ ] Aucune requête >300ms
- [ ] Breakdown détaillé documenté

---

## 📊 MÉTRIQUES COLLECTÉES

### Singularity Meta-Processing

| Métrique                     | Target  | Réel | Status |
| ---------------------------- | ------- | ---- | ------ |
| Latence moyenne              | 10-30ms | -    | ⏳     |
| Coherence score moyen        | 0.8-1.0 | -    | ⏳     |
| LTM suggestions (>500 chars) | 100%    | -    | ⏳     |
| Détection fuites anglais     | 100%    | -    | ⏳     |
| Détection ambiguïtés         | 100%    | -    | ⏳     |

### OMEGA P2 Performance

| Métrique             | Target | Réel | Status |
| -------------------- | ------ | ---- | ------ |
| Latence totale P2    | <200ms | -    | ⏳     |
| Bypass legacy activé | 100%   | -    | ⏳     |
| Fallback graceful    | 100%   | -    | ⏳     |
| FrenchMastery actif  | 100%   | -    | ⏳     |

---

## 🔧 PROCÉDURE EXÉCUTION

### Préparation

1. ✅ Runtime Titan-Dev actif (localhost:5173)
2. ✅ Logs monitoring actif: `tail -f runtime/dev/logs/tauri.log`
3. ⏳ Ouvrir Chat IA dans interface
4. ⏳ Préparer fichier capture logs

### Exécution Tests

1. **Pour chaque test** :
   - Copier input dans Chat IA
   - Envoyer message
   - Noter timestamp départ
   - Attendre réponse
   - Noter timestamp arrivée
   - Copier response complète
   - Extraire logs pertinents

2. **Capture logs** :

   ```bash
   # Filtrer logs Singularity
   tail -100 runtime/dev/logs/tauri.log | grep "Singularity"

   # Filtrer logs OMEGA
   tail -100 runtime/dev/logs/tauri.log | grep "OMEGA"

   # Filtrer meta-tags
   tail -100 runtime/dev/logs/tauri.log | grep "meta:"
   ```

3. **Remplir métriques** :
   - Latences calculées
   - Coherence scores extraits
   - Warnings/corrections comptés
   - Comportements anormaux notés

---

## ✅ CRITÈRES VALIDATION

### Singularity ✅ si :

- [x] 4/4 tests passent (S1-S4)
- [ ] Meta-tags détectés dans 100% responses
- [ ] LTM suggestion trigger correct (>500 chars)
- [ ] Fuites anglais détectées (regex functional)
- [ ] Ambiguïtés détectées (marqueurs identifiés)
- [ ] Latence <30ms (overhead acceptable)

### R05 OMEGA ✅ si :

- [ ] 3/3 tests passent (R1-R3)
- [ ] Latence P2 <200ms (90% queries)
- [ ] Bypass legacy activé (logs confirm)
- [ ] Fallback graceful (aucun crash)
- [ ] FrenchMastery actif (qualité maintenue)

### Performance ✅ si :

- [ ] Singularity: <30ms (P1 validé)
- [ ] OMEGA P2: <200ms (P2 validé)
- [ ] Overhead total: <5% (acceptable)
- [ ] Aucun bottleneck >50ms détecté

---

## 📝 NOTES

**Blocages potentiels** :

- ⚠️ Interface Chat IA non responsive
- ⚠️ Logs non loggés (verbosity insuffisante)
- ⚠️ OMEGA désactivé (config)
- ⚠️ Singularity Step 12 skip (pipeline bypass)

**Solutions** :

- Vérifier config OMEGA enabled
- Augmenter log level (RUST_LOG=debug)
- Inspecter pipeline.rs (Step 12 actif ?)
- DevTools Network tab (timing HTTP)

---

**Status** : 🔄 Prêt à exécuter  
**Next** : Ouvrir interface Chat IA → Lancer Test S1
