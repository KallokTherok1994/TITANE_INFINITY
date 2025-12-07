# 🔴 SPRINT 1 — STABILITÉ: Fix Tests (Dec 9-13)

**Objectif:** 1,854/1,888 (98.2%) → 1,888/1,888 (100%)  
**Durée Estimée:** 10 heures  
**Priorité:** 🔴 P0 (BLOQUANT)  

---

## 📋 TESTS EN ÉCHEC (9 fichiers, 34 tests)

### Fichier 1: `CognitiveStrategy.test.ts`
**Erreur:** `should handle invalid operation`

**Prompt Copilot:**
```
Analyse src/services/orchestration/__tests__/strategies/CognitiveStrategy.test.ts

Le test "should handle invalid operation" échoue.

Actions:
1. Vérifie la logique du test (que teste-t-il exactement?)
2. Simule l'opération invalide (ex: undefined operation)
3. Assure que CognitiveStrategy.executeOperation() gère correctement les erreurs
4. Ajoute try-catch si nécessaire
5. Valide que le test capture l'erreur correctement

Corrige et lance:
  npm run test:watch -- CognitiveStrategy.test.ts
```

---

### Fichier 2: `MCPStrategy.test.ts` (3 tests)
**Erreurs:**
1. `should create job`
2. `should evaluate job`
3. `should list jobs`

**Prompt Copilot:**
```
Analyse src/services/orchestration/__tests__/strategies/MCPStrategy.test.ts

Les 3 tests échouent:
- should create job
- should evaluate job  
- should list jobs

Problème probablement: MCPStrategy.createJob() ou state management.

Actions:
1. Vérifie que createJob() initialise bien le job dans this.jobs
   - Assure que this.jobs est une Map ou Array
   - Check que le job créé a un ID unique
   
2. Vérifie que listJobs() retourne bien tous les jobs créés
   - Test: const jobs = strategy.listJobs(); expect(jobs.length).toBe(2);
   
3. Vérifie que evaluateJob() trouve le job par ID
   - Test: const eval = strategy.evaluateJob(jobId); expect(eval).toBeDefined();

4. Debug avec console.log:
   const job = strategy.createJob({ name: 'test' });
   console.log('Created job:', job);
   console.log('List jobs:', strategy.listJobs());

Corrige et valide:
  npm run test:watch -- MCPStrategy.test.ts
```

---

### Fichier 3: `ChatEngineOmega.test.ts`
**Erreur:** `Error: Invalid message input`

**Prompt Copilot:**
```
Analyse src/services/ai/chatEngine.test.ts

Erreur: "Invalid message input" ligne 57

Le test appelle ChatEngineOmega.generate() mais le message input est invalide.

Actions:
1. Vérifie le format attendu du message:
   - Doit-il avoir des propriétés spécifiques (role, content, etc.)?
   - Y a-t-il une validation stricte?

2. Crée un message valide dans le test:
   ```typescript
   const validMessage = {
     role: 'user',
     content: 'Test message',
     timestamp: Date.now()
   };
   ```

3. Assure que le test passe ce message valide à generate()

4. Si la validation est trop stricte, considère des message fixtures

Corrige et valide:
  npm run test:watch -- chatEngine.test.ts
```

---

### Fichier 4: `ConversationEvaluationEngine.test.ts`
**Erreur:** À identifier

**Prompt Copilot:**
```
Lance le test et capture l'erreur exacte:
  npm run test:watch -- ConversationEvaluationEngine.test.ts

Puis envoie-moi l'output pour que je crée un prompt spécifique.
```

---

### Fichier 5: `MCPOrchestrator.test.ts`
**Erreur:** À identifier

**Prompt Copilot:**
```
Lance le test et capture l'erreur exacte:
  npm run test:watch -- MCPOrchestrator.test.ts

Puis envoie-moi l'output pour que je crée un prompt spécifique.
```

---

### Fichier 6: `PresenceOS.test.ts` (Uncaught Exception)
**Erreur:** `TypeError: Cannot read properties of undefined (reading 'pitch')`

**Prompt Copilot:**
```
Analyse src/tests/presenceOS.test.ts

Erreur ligne ~60: state.expressive.voice.pitch is undefined

Actions:
1. Vérifie que state.expressive est bien initialisé avant le test
2. Ajoute null-safe access:
   ```typescript
   const pitch = state?.expressive?.voice?.pitch ?? 0.5;
   console.log(`Voice pitch: ${pitch * 100}%`);
   ```
3. Ou initialise state complètement:
   ```typescript
   const state = {
     expressive: {
       voice: { pitch: 0.5, timbre: 'warm' },
       prosodie: { speed: 1.0 }
     }
   };
   ```
4. Applique le même pattern à tous les state.expressive.* accesses

Corrige et valide:
  npm run test:watch -- presenceOS.test.ts
```

---

### Fichier 7-9: Autres fichiers
**À identifier** - Lance les tests individuellement:

```bash
npm run test:watch -- [FILENAME].test.ts
```

Et envoie les erreurs exactes.

---

## 🚀 PROCESS DE FIX

### Étape 1: Analyser (30 min)
```bash
# Lancer tous les tests et noter les erreurs
npm run test:unit 2>&1 | grep "FAIL" -A 10 > /tmp/test-failures.txt

# Vérifier chaque fichier individuellement
npm run test:watch -- src/services/orchestration/__tests__/strategies/MCPStrategy.test.ts
```

### Étape 2: Corriger (6-8 heures)
- 1h par fichier en moyenne
- Certains fixes simples (30 min), d'autres complexes (2h)

### Étape 3: Valider (1 heure)
```bash
# Valider tous les tests passent
npm run test:unit

# Vérifier le CI/CD complet
npm run test:ci

# Devrait afficher: ✓ Test Files  71 passed (71)
```

### Étape 4: Documenter (1 heure)
```bash
# Créer un changelog des fixes
cat > SPRINT_1_FIXES_APPLIED.md << 'EOF'
# Sprint 1: Test Fixes Applied

## Fixed Tests (34 → 0 failures)

1. ✅ MCPStrategy - 3 tests fixed
   - Issue: Job state not persisting
   - Fix: Initialize this.jobs properly in constructor
   
2. ✅ CognitiveStrategy - 1 test fixed
   - Issue: Invalid operation handling
   - Fix: Add proper error boundary
   
...
EOF
```

---

## 📊 MÉTRIQUES

### Avant Sprint 1
```
Test Files: 9 failed | 62 passed (71)
Tests: 34 failed | 1854 passed (1888)
Success Rate: 98.2%
```

### Cible Sprint 1
```
Test Files: 0 failed | 71 passed (71) ✅
Tests: 0 failed | 1888 passed (1888) ✅
Success Rate: 100% ✅
```

### Timeline

| Phase | Durée | Status |
|-------|-------|--------|
| Analysis | 30m | ⏳ |
| Fixes | 8h | ⏳ |
| Validation | 1h | ⏳ |
| Documentation | 1h | ⏳ |
| **Total** | **10h** | **⏳** |

---

## ✅ ACCEPTANCE CRITERIA

- [ ] All 34 tests fixed (1,888/1,888 passing)
- [ ] `npm run test:unit` shows 0 failures
- [ ] `npm run test:ci` passes all stages
- [ ] No regressions (all existing passing tests still pass)
- [ ] SPRINT_1_FIXES_APPLIED.md documented

---

## 📝 NEXT ACTIONS

1. **Immédiate:** Analyser les 9 fichiers de test
2. **Today:** Commencer fixes MCPStrategy (test file #2)
3. **Tomorrow:** Continuer fixes autres fichiers
4. **End of week:** Validation complète + documentation

---

## 🔗 RESSOURCES

- **Test Config:** `vitest.unit.config.ts`
- **Test Runner:** `npm run test:unit` ou `npm run test:watch`
- **Coverage:** `npm run test:coverage`
- **CI/CD:** `npm run test:ci` (lint + type-check + test)

---

**Sprint 1 Start Date:** Dec 9, 2025  
**Sprint 1 End Date:** Dec 13, 2025  
**Estimated Completion:** Dec 10 (1 day)  
**Risk Level:** 🟢 LOW (mostly state management issues)
