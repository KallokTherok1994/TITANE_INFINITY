# Week 2: UnifiedOrchestrator — Plan d'Exécution

**Date:** 5 décembre 2025  
**Branch:** `week-2-unified-orchestrator`  
**Méthodologie:** OMEGA-Dev vΩ Pipeline  
**Référence:** Succès Week 1 (UnifiedMemory -95.2% LOC)

---

## 🎯 OBJECTIFS WEEK 2

### Consolidation
- **Input:** 5 orchestrateurs (3,382 lignes core + dépendances)
- **Output:** 1 UnifiedOrchestrator (~1,800 lignes)
- **Réduction:** -47% minimum (-52% CPU, -42% latency)

### Orchestrateurs à Consolider
1. **MCPOrchestrator** (1,156 lignes) - Gouvernance MCP-Ω, jobs, mémoire
2. **CognitiveOmegaOrchestrator** (718 lignes) - Moteurs cognitifs
3. **AIOrchestrator (orchestrator.ts)** (998 lignes) - Providers AI neural
4. **AIOrchestrator (orchestrator_OMNIS_v1.ts)** (510 lignes) - OMNIS cognitive
5. **vsync_orchestrator** - Quantum/FPS (analyse séparée)

---

## 📐 ARCHITECTURE CIBLE

### Pattern: Strategy + Factory + Observer

```
UnifiedOrchestrator (Core)
├── Strategies/
│   ├── MCPStrategy (gouvernance, jobs, mémoire)
│   ├── CognitiveStrategy (semantic, goal, evaluation)
│   ├── AIStrategy (providers, selection, fallback)
│   └── QuantumStrategy (vsync, prediction)
├── Shared/
│   ├── HealthMonitor (unified health checks)
│   ├── MetricsCollector (stats agrégées)
│   ├── RecoveryEngine (auto-heal unifié)
│   └── ValidationEngine (quality checks)
└── Interfaces/
    ├── IOrchestrationStrategy
    ├── IHealthCheck
    ├── IMetricsProvider
    └── IRecoveryHandler
```

### Principes
- **Single Responsibility:** Chaque strategy = 1 domaine
- **Interface Segregation:** Types partagés séparés (pas de cycles)
- **Backward Compatibility:** APIs existantes préservées
- **Lazy Loading:** Strategies chargées à la demande

---

## 📅 PLANNING (5 JOURS)

### Day 1 (4h) - Architecture + Interfaces ✅ EN COURS
- [x] Analyse orchestrateurs existants
- [x] Design architecture UnifiedOrchestrator
- [ ] Créer `src/services/orchestration/types.ts` (interfaces)
- [ ] Créer `src/services/orchestration/UnifiedOrchestrator.ts` (core 400 lignes)
- [ ] Créer strategies skeleton
- [ ] Tests unitaires skeleton

### Day 2 (6h) - Core Implementation
- [ ] Implémenter MCPStrategy (gouvernance)
- [ ] Implémenter CognitiveStrategy (moteurs)
- [ ] Implémenter AIStrategy (providers)
- [ ] HealthMonitor unifié
- [ ] MetricsCollector agrégé
- [ ] Tests unitaires core (30 tests)

### Day 3 (6h) - Migration + Integration
- [ ] Adapter MCPOrchestrator → MCPStrategy
- [ ] Adapter CognitiveOmegaOrchestrator → CognitiveStrategy
- [ ] Adapter AIOrchestrator → AIStrategy
- [ ] RecoveryEngine unifié
- [ ] ValidationEngine unifié
- [ ] Tests d'intégration (20 tests)

### Day 4 (6h) - Backward Compatibility + Polish
- [ ] Créer wrappers compatibilité (exports legacy)
- [ ] Migration progressive hooks/consumers
- [ ] Documentation inline complète
- [ ] Tests de compatibilité (15 tests)
- [ ] Performance benchmarks initiaux

### Day 5 (4h) - Validation + Merge
- [ ] Performance tests finaux (CPU, latency, memory)
- [ ] Validation -52% CPU, -42% latency
- [ ] Coverage >75%
- [ ] Documentation README
- [ ] Commit + Push + Merge to main
- [ ] Tag v1.3-week-2-complete

---

## 🔧 FICHIERS À CRÉER

### Core
- `src/services/orchestration/types.ts` (200 lignes)
- `src/services/orchestration/UnifiedOrchestrator.ts` (600 lignes)
- `src/services/orchestration/index.ts` (50 lignes)

### Strategies
- `src/services/orchestration/strategies/MCPStrategy.ts` (350 lignes)
- `src/services/orchestration/strategies/CognitiveStrategy.ts` (300 lignes)
- `src/services/orchestration/strategies/AIStrategy.ts` (400 lignes)
- `src/services/orchestration/strategies/QuantumStrategy.ts` (150 lignes)

### Shared
- `src/services/orchestration/shared/HealthMonitor.ts` (200 lignes)
- `src/services/orchestration/shared/MetricsCollector.ts` (150 lignes)
- `src/services/orchestration/shared/RecoveryEngine.ts` (200 lignes)
- `src/services/orchestration/shared/ValidationEngine.ts` (150 lignes)

### Tests
- `src/services/orchestration/__tests__/UnifiedOrchestrator.unit.test.ts` (400 lignes)
- `src/services/orchestration/__tests__/strategies/*.test.ts` (600 lignes)
- `src/services/orchestration/__tests__/UnifiedOrchestrator.perf.test.ts` (150 lignes)

### Compatibility
- `src/services/orchestration/compat/mcpCompat.ts` (100 lignes)
- `src/services/orchestration/compat/cognitiveCompat.ts` (100 lignes)
- `src/services/orchestration/compat/aiCompat.ts` (100 lignes)

**Total estimé:** ~4,100 lignes (incluant tests)

---

## 📊 MÉTRIQUES SUCCÈS

### Réduction Code
- **Baseline:** 3,382 lignes core + ~5,000 dépendances = ~8,400 lignes
- **Target:** ~4,100 lignes total (core + tests + compat)
- **Réduction:** -51% (dépasse objectif -47%)

### Performance
- **CPU:** -52% (mesure via benchmarks)
- **Latency:** -42% (orchestration time)
- **Memory:** Stable ou amélioration

### Tests
- **Coverage:** >75% (amélioration vs 70% Week 1)
- **Tests:** ~65 tests (30 unit + 20 integration + 15 compat)
- **Success:** 100% passing

### Qualité
- **Zero cycles:** Maintenu (madge clean)
- **TypeScript:** Strict mode, zero any
- **Documentation:** Inline + README

---

## 🚨 RISQUES & MITIGATIONS

### Risque 1: Breaking Changes API
**Mitigation:** Wrappers compatibilité + migration progressive

### Risque 2: Complexité > Estimée
**Mitigation:** Simplification stratégies si nécessaire

### Risque 3: Performance Régression
**Mitigation:** Benchmarks continus, rollback si échec

### Risque 4: Tests Existants Cassés
**Mitigation:** Backward compat strict + tests adaptation

---

## 🎓 LESSONS LEARNED (Week 1)

### ✅ Ce qui a marché
- Interface Segregation Pattern (zero cycles)
- Consolidation progressive (5 jours structurés)
- Tests en parallèle de l'implémentation
- Benchmarks validation finale

### ⚠️ À améliorer
- Augmenter coverage dès Day 2 (pas Day 4)
- Tests perf dès Day 3 (pas Day 5)
- Documentation inline plus tôt

### 🔄 Appliqué Week 2
- Coverage target 75% (vs 70%)
- Tests perf Day 3 (vs Day 5)
- Documentation inline Day 1

---

## 📝 COMMIT STRATEGY

### Pattern
```
Week 2 Day X: [Feature] - [Details]

✅ [Changes]
🔧 [Technical details]
📊 [Metrics]
```

### Commits Prévus
1. Day 1: Architecture + Interfaces
2. Day 2: Core + Strategies Implementation
3. Day 3: Migration + Integration
4. Day 4: Compatibility + Polish
5. Day 5: Performance Validation + Merge

---

## ✅ VALIDATION FINALE

### Checklist Merge
- [ ] All tests passing (65/65)
- [ ] Coverage >75%
- [ ] Performance targets met (-52% CPU, -42% latency)
- [ ] Zero circular dependencies (madge clean)
- [ ] Documentation complete
- [ ] Backward compatibility verified
- [ ] No breaking changes (or documented)

### Post-Merge
- [ ] Tag v1.3-week-2-complete
- [ ] Update main README
- [ ] Celebrate success 🎉
- [ ] Plan Week 3 (UnifiedObservability?)

---

**STATUS:** Day 1 in progress (architecture + interfaces)  
**NEXT:** Create types.ts + UnifiedOrchestrator.ts core
