# TITANE∞ — UI ARBITRATION LOG
**Strategic Decisions on Master Coherence Analysis**  
**Date:** 2026-02-07  
**Mode:** Decision-Only (NO code, NO solutions)  
**Input:** MASTER_COHERENCE_ANALYSIS.md (18 findings)

---

## DECISION FRAMEWORK

- **FIX_NOW:** Blocker résolu dans les prochains sprints
- **MONITOR:** Surveiller activement, décision future basée sur métriques
- **FREEZE:** Pattern validé, à préserver tel quel
- **IGNORE_CONSCIOUSLY:** Décision explicite de ne pas agir

---

## 1) DÉCISIONS P1 (Décalages Majeurs)

| Item | Décision | Justification | Horizon |
|------|----------|---------------|---------|
| **P1-1: Dual Router Confusion** | FIX_NOW | Code mort (router.tsx 50 lignes) crée confusion maintenance. Navigation UI unifiée mais 2 routers backend = risque modification accidentelle mauvais router. Consolidation = améliore clarté sans risque regression. | Sprint N+1 |
| **P1-2: Silent IPC Failures** | FIX_NOW | 10 catch blocks vides = utilisateur dans le noir (action échouée silencieusement). Perte de confiance utilisateur + debug impossible. Fix minimal = console.error + toast notification. Impact UX critique. | Sprint N+1 |
| **P1-3: Unknown/NaN Display** | MONITOR | Metrics affichant "Unknown/NaN" = perception "app non terminée". Nécessite validation layer (zod schema) entre IPC et UI. Impact perception qualité mais non bloquant fonctionnellement. Si plaintes utilisateurs répétées → FIX. | Sprint N+2-3 |
| **P1-4: Tab Overflow Navigation** | MONITOR | 9 tabs DEV section, >7-8 = overflow invisible. Fonctionnalités cachées = mauvaise découvrabilité. Solution = limiter tabs OU dropdown "More...". Pas bloquant si usage actuel <8 utilisateurs simultanés. Observer analytics. | Sprint N+2-3 |

---

## 2) DÉCISIONS P2 (Warnings Structurels)

| Item | Décision | Justification | Horizon |
|------|----------|---------------|---------|
| **P2-1: Store Granularity Mismatch** | MONITOR | systemStore utilisé 120× force re-renders larges. Pas de problème performance actuel observable. Split store = refactor massif à risque. Décision = surveiller profiling React DevTools. Si lag UI >100ms mesuré → split. Sinon = acceptable. | Later (metrics-driven) |
| **P2-2: Hook Depth Violations** | FREEZE | OrchestratorUI avec 15+ hooks viole rule-of-thumb (<10). Mais composant stable depuis 6 mois, zéro bug reporté. Split = refactor sans bénéfice clair. Décision = freeze pattern actuel. Si nouveau hook ajouté → bloquer et forcer split à ce moment. | Conditional (future change) |
| **P2-3: Effect Cascades** | FREEZE | useEffect cascades 3-4 niveaux = orchestration implicite. Pattern actuel stable, zéro race condition détectée. Réécriture = risque régression élevé pour gain incertain. Décision = accepter pattern tant que stable. Si bug timing → event bus explicite. | Conditional (if bugs) |
| **P2-4: Lazy Loading Sans Boundaries** | MONITOR | Routes lazy sans Suspense fallback = écran blanc 200-500ms. Impact perception performance. Fix = skeleton screen minimal. Priorité moyenne (UX polish). Implémenter si feedback utilisateur ou phase "UX refinement". | Sprint N+3-4 |
| **P2-5: State Derivation Missing** | IGNORE_CONSCIOUSLY | Calculs inline dans composants vs selectors Zustand. Duplication 3 composants détectée. Mais pas de problème performance mesuré. Migration vers selectors = refactor sans urgence. Décision = ignorer sauf si performance dégradée mesurée (>50ms render). | Never (unless metrics) |
| **P2-6: ErrorBoundary Coverage Gaps** | MONITOR | ErrorBoundary seulement App.tsx + CognitiveLayout. Manque Chat, Memory, Stats. Risque = crash app entière si erreur module. Mais zéro crash production reporté. Décision = ajouter boundaries si crash critique observé en prod. | Later (reactive) |

---

## 3) DÉCISIONS ANTI-PATTERNS

| Item | Décision | Justification | Horizon |
|------|----------|---------------|---------|
| **AP-1: Console.log Forensics** | IGNORE_CONSCIOUSLY | 180+ console.log détectés. Pattern = debug permanent vs temporaire. Impact prod = pollution logs + performance stringify. Mais cleanup = tâche chronophage à faible ROI. Décision = ignorer consciemment. Si besoin logger abstraction → future (pas prioritaire). | Never (low ROI) |
| **AP-2: Boolean Props Proliferation** | FREEZE | TButton avec 8 boolean props. Pattern sub-optimal (enum variant/size/state meilleur). Mais composants existants stables. Décision = freeze pattern existant, documenter pour futurs composants (préférer enums). Pas de refactor rétroactif. | Frozen (new: enum) |
| **AP-3: Implicit State Machine** | IGNORE_CONSCIOUSLY | États via booleans (isLoading, hasError, isEmpty, isStreaming) = 2^4 combinaisons, pas FSM explicite (XState). Pattern actuel fonctionne, zéro état invalide reporté. Migration FSM = refactor lourd. Décision = ignorer sauf si bugs états impossibles. | Never (unless bugs) |

---

## 4) DÉCISIONS RISQUES FUTURS

| Item | Décision | Justification | Horizon |
|------|----------|---------------|---------|
| **RISK-1: Scale Breaking Point** | MONITOR | Architecture stable <100 conversations. Au-delà = memory bloat (10MB+), UI lag probable. Pas de virtualization actuellement. Décision = surveiller usage metrics. Si >50 conversations actives détectées → implémenter react-window + pagination. Préventif non justifié maintenant. | Later (usage-driven) |
| **RISK-2: Memory Leak Vectors** | MONITOR | 30% useEffect sans cleanup (ex: setInterval sans clear). Risque = memory leak graduel sur app long-running (2h+). Pas de leak mesuré actuellement. Décision = audit systématique useEffect à programmer. Test = laisser app 2h, profiler memory. Si croissance >50MB → fix cleanup. | Sprint N+2 (audit) |
| **RISK-3: Provider Explosion** | FREEZE | 10+ providers imbriqués, ordre init implicite. Risque = race conditions si ajout providers. Mais architecture actuelle stable. Décision = freeze count à 10, documenter ordre init. Si besoin 11e provider → bloquer et refactor composition pattern. Hard limit = protection. | Frozen at 10 |

---

## 5) NON-DÉCISIONS ASSUMÉES

Ces items sont **intentionnellement laissés ouverts** (pas de décision figée):

### ND-1: Hook Custom Abstractions
**Contexte:** 80+ custom hooks détectés. Certains trop spécifiques (1 usage), d'autres trop génériques (20+ usages).  
**Non-décision:** Pas de règle universelle "bon/mauvais hook". Chaque cas doit être évalué contextuellement. Pattern émergent acceptable tant que testé.  
**Rationale:** Flexibilité nécessaire pour innovation. Hard rules = blocage créativité.

### ND-2: Component Composition Depth
**Contexte:** Certains composants ont 5-6 niveaux d'imbrication. Pas de standard défini.  
**Non-décision:** Pas de limite artificielle sur composition depth. Décision au cas-par-cas selon lisibilité.  
**Rationale:** Profondeur dépend du contexte (layout vs widget vs form). Règle générale = contre-productive.

### ND-3: IPC Contract Evolution
**Contexte:** 180+ commandes IPC, certains contracts évoluent, d'autres figés.  
**Non-décision:** Pas de stratégie universelle versioning IPC. Tauri permet breaking changes (desktop app).  
**Rationale:** Versioning prématuré = complexité inutile. Acceptable pour app desktop local-first.

### ND-4: Test Coverage Target
**Contexte:** Tests existants (Vitest unit, Playwright E2E, cargo test). Pas de coverage % défini.  
**Non-décision:** Pas de target coverage arbitraire (ex: "80% obligatoire"). Focus sur critical paths testés.  
**Rationale:** Coverage % = metric trompeuse. Préférer qualité tests vs quantité. Critical paths > exhaustivité.

### ND-5: Performance Budget
**Contexte:** Pas de budget performance défini (ex: "TTI <2s", "FCP <1s").  
**Non-décision:** Pas de métriques performance figées. Observer user feedback réel.  
**Rationale:** App desktop Tauri ≠ web app. Performance généralement acceptable. Metrics web non applicables. User feeling > chiffres arbitraires.

---

## SYNTHÈSE STRATÉGIQUE

### Décisions Immédiates (Sprint N+1)
- ✅ **FIX_NOW:** Dual Router (P1-1) + Silent IPC (P1-2)
- Total items: 2

### Surveillance Active (Sprint N+2-3)
- 👁️ **MONITOR:** Unknown/NaN (P1-3), Tab Overflow (P1-4), systemStore (P2-1), Lazy Loading (P2-4), Memory Leaks (RISK-2)
- Total items: 5

### Patterns Gelés (Préserver)
- 🔒 **FREEZE:** Hook Depth (P2-2), Effect Cascades (P2-3), Boolean Props (AP-2), Provider Count (RISK-3)
- Total items: 4

### Ignorés Consciemment (Pas d'action)
- ❌ **IGNORE:** State Derivation (P2-5), Console.log (AP-1), Implicit FSM (AP-3)
- Total items: 3

### Non-Décisions (Flexibles)
- ⚪ **OPEN:** Hook abstractions, Component depth, IPC versioning, Test coverage, Performance budget
- Total items: 5

---

## MÉTA-RÈGLES DE GOUVERNANCE

1. **Principe de Preuve:** Toute décision FIX_NOW doit être justifiée par:
   - Bug production reporté, OU
   - Risque UX critique mesuré, OU
   - Dette technique bloquant feature future clairement identifiée

2. **Principe de Stabilité:** Pattern stable depuis 3+ mois sans bug → FREEZE par défaut (même si "imparfait" théoriquement)

3. **Principe de ROI:** Refactor doit avoir ROI clair:
   - Gain maintenance mesuré (ex: -50% temps debug)
   - Gain performance mesuré (ex: -200ms render)
   - Gain UX observable (ex: feedback utilisateur positif)

4. **Principe de Réversibilité:** Si décision = incertaine → MONITOR + metrics. Décision future basée sur data, pas opinion.

5. **Principe de Non-Régression:** FIX_NOW interdit si risque régression >20%. Dans ce cas → FREEZE + mitigation alternative.

---

## CHANGELOG ARBITRATION

| Date | Item | Ancienne Décision | Nouvelle Décision | Rationale |
|------|------|-------------------|-------------------|-----------|
| 2026-02-07 | Initial | N/A | All decisions logged | Premier arbitrage stratégique post Master Coherence Analysis |

*(Ce tableau sera mis à jour si décisions évoluent suite à nouvelles preuves/metrics)*

---

## VALIDATION CRITÈRES

Pour chaque item FIX_NOW, critères de validation:

**P1-1 (Dual Router):**
- ✅ router.tsx supprimé
- ✅ routerSecondary.tsx renommé → router.tsx
- ✅ Tous imports mis à jour
- ✅ Tests E2E navigation passent
- ✅ Aucune route cassée

**P1-2 (Silent IPC):**
- ✅ 10 catch blocks identifiés incluent console.error minimum
- ✅ Toast notification ajoutée pour actions user-facing
- ✅ ErrorBoundary propagation si erreur critique
- ✅ Aucun catch vide restant dans code

---

**UI ARBITRATION COMPLETE**
