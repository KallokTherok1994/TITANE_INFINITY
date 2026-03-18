# PROTOCOLE D'OBSERVATION OPÉRATIONNELLE — HOOKS DURCIS

**MISSION**: Mesurer le comportement réel des hooks durcis avant progression STABLE→SEALED  
**STATUS**: IN_PROGRESS  
**AUTHORITY**: .clinerules/00-kernel.md (Règles 2, 8, 9, 10)

---

## HYPOTHÈSE À VALIDER

**H1**: Hooks durcis réduisent le bruit sans perdre les captures critiques  
**H2**: Patterns AutoHeal stricts éliminent les faux positifs  
**H3**: Classification constitutionnelle enforcée correctly

---

## SCÉNARIOS DE VALIDATION (3 obligatoires)

### SCENARIO_A: Explicit Fix Work
**Objectif**: Vérifier capture AutoHeal pour fixes explicites  
**Action**: Corriger un défaut avec description contenant "fix:" ou patterns qualifiants  
**Attente**: PostToolUse DOIT capturer dans autoheal_rules.jsonl  
**Verdict**: PASS si capture + FAIL si pas de capture

### SCENARIO_B: Non-Fix Work  
**Objectif**: Vérifier absence de faux positifs AutoHeal  
**Action**: Documentation, refactor style, configuration sans "fix" patterns  
**Attente**: PostToolUse NE DOIT PAS capturer dans AutoHeal  
**Verdict**: PASS si pas de capture + FAIL si capture erronée

### SCENARIO_C: Borderline Changes
**Objectif**: Mesurer comportement dans zones grises  
**Action**: Amélioration/enhancement sans "fix" terminologie explicite  
**Attente**: Comportement cohérent avec patterns stricts  
**Verdict**: DOCUMENTED (comportement observé et justifié)

---

## MÉTRIQUES DE VALIDATION

### AutoHeal Precision
- **True Positives**: Fixes explicites capturés correctement
- **False Positives**: Non-fixes capturés par erreur  
- **False Negatives**: Fixes explicites ratés
- **True Negatives**: Non-fixes ignorés correctement

### Constitutional Status Enforcement
- **PASS/FAIL/BLOCKED** classification consistante
- **Proof-first discipline** respectée
- **Stop-the-line** sur violations appropriées

---

## CRITÈRES DE PROGRESSION

### STABLE → SEALED Requirements
- **SCENARIO_A**: PASS (captures fixes explicites)
- **SCENARIO_B**: PASS (ignore non-fixes) 
- **SCENARIO_C**: DOCUMENTED behavior coherent
- **Zero critical defects** discovered in observation
- **Hooks functional** without noise excessif

### Auto-Revert Triggers
- **Hook failure** causing Cline malfunction
- **AutoHeal corruption** from false positive flood
- **Constitutional violation** in status classification

---

## LOG TARGETS

### Observation Evidence
- `.clinerules/logs/operations.log` - hook execution records
- `scripts/autoheal/autoheal_rules.jsonl` - AutoHeal captures
- Terminal output - constitutional status enforcement
- Git state - file changes during scenarios

**DÉBUT OBSERVATION**: $(date +%Y-%m-%d_%H%M)  
**OBSERVER**: Constitutional Agent (Cline environment)