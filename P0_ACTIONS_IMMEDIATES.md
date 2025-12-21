# 🚨 ACTIONS IMMÉDIATES P0 - TITANE∞ v26.2.0

**Date :** 2025-12-20  
**Durée totale :** 1h20  
**Impact :** 88/100 → 90/100 (+2 pts)

---

## ⏱️ CHECKLIST P0 (1h20)

### ✅ 1. Audits de Sécurité (30 min)

**Objectif :** Détecter vulnérabilités CVE dans dépendances

```bash
# 1.1 Installer pnpm (package manager du projet)
corepack enable
corepack prepare pnpm@latest --activate

# 1.2 Audit frontend
cd /home/runner/work/TITANE_INFINITY/TITANE_INFINITY
pnpm audit
pnpm audit --json > audit-npm-report.json

# 1.3 Fixer vulnérabilités automatiques
pnpm audit --fix

# 1.4 Audit backend Rust
cd src-tauri
cargo install cargo-audit
cargo audit
cargo audit --json > ../audit-cargo-report.json
```

**Cible :** 0 vulnérabilités critiques/hautes  
**Résultat attendu :** Rapport de sécurité clean

---

### ✅ 2. Mesurer Couverture de Tests (15 min)

**Objectif :** Quantifier zones testées

```bash
# 2.1 Générer rapport coverage frontend
cd /home/runner/work/TITANE_INFINITY/TITANE_INFINITY
npm run test:coverage

# 2.2 Générer rapport HTML
npm run test:coverage -- --reporter=html

# 2.3 Vérifier coverage global
cat coverage/coverage-summary.json | jq '.total.lines.pct'

# 2.4 Identifier zones critiques non testées
cat coverage/coverage-summary.json | jq '
  to_entries |
  map(select(.value.lines.pct < 80)) |
  map({file: .key, coverage: .value.lines.pct}) |
  sort_by(.coverage)
'
```

**Cible :** ≥80% coverage global  
**Résultat attendu :** Rapport coverage + zones à améliorer

---

### ✅ 3. Auditer unwrap() en Rust (20 min)

**Objectif :** Identifier risques de panic en production

```bash
# 3.1 Compter unwrap() totaux
cd /home/runner/work/TITANE_INFINITY/TITANE_INFINITY/src-tauri/src
grep -r "\.unwrap()" . | wc -l
# Résultat actuel: 1,278

# 3.2 Identifier unwrap() critiques (production code)
grep -r "\.unwrap()" . | \
  grep -v test | \
  grep -v "\/\/" | \
  grep -E "(main|command|handler|lib\.rs)" > unwrap_critical.txt

wc -l unwrap_critical.txt

# 3.3 Analyser zones critiques
cat unwrap_critical.txt | head -20

# 3.4 Créer plan de fix (top 10 fichiers)
cat unwrap_critical.txt | \
  cut -d: -f1 | \
  sort | uniq -c | \
  sort -rn | \
  head -10 > unwrap_fix_plan.txt
```

**Cible :** <10 unwrap() en production  
**Résultat attendu :** Liste fichiers à corriger en priorité

**Exemple fix :**

```rust
// AVANT (risque panic)
let value = option.unwrap();

// APRÈS (safe)
let value = option.ok_or(Error::NullValue)?;
// ou avec contexte
let value = option.expect("Context: why this should exist");
```

---

### ✅ 4. Fixer Violation Architecture (15 min)

**Objectif :** Corriger violation Ring 2 → Ring 3

**Fichier :** `src/engines/time/AgendaEngine.ts`

```typescript
// AVANT (violation Ring 2 → Ring 3)
import { agendaService } from '@/services/agendaService';

export class AgendaEngine {
  async getEvents() {
    return agendaService.getEvents(); // ❌ Direct service call
  }

  async createEvent(event: Event) {
    return agendaService.createEvent(event);
  }
}

// APRÈS (injection de dépendance)
import { IAgendaService } from '@/types/services';

export class AgendaEngine {
  constructor(private agendaService: IAgendaService) {}

  async getEvents() {
    return this.agendaService.getEvents(); // ✅ Injected
  }

  async createEvent(event: Event) {
    return this.agendaService.createEvent(event);
  }
}
```

**Instanciation (dans Service layer ou App) :**

```typescript
// src/services/time/timeService.ts ou src/App.tsx
import { AgendaEngine } from '@/engines/time/AgendaEngine';
import { agendaService } from '@/services/agendaService';

// Injecter service dans engine
const agendaEngine = new AgendaEngine(agendaService);

// Exporter instance configurée
export { agendaEngine };
```

**Vérification :**

```bash
# Tester violation corrigée
bash scripts/verify/validate-architecture.sh
# Résultat attendu: 0 erreurs
```

**Cible :** 0 violations architecture  
**Résultat attendu :** Script validation passe ✅

---

## 📊 RÉSULTATS ATTENDUS

### Métriques Avant P0

- Score global : 88/100
- Sécurité : 85/100 (audits non exécutés)
- Tests : 82/100 (coverage non mesuré)
- Architecture : 95/100 (1 violation)

### Métriques Après P0

- Score global : **90/100** (+2 pts) ✅
- Sécurité : **90/100** (+5 pts) ✅
- Tests : **85/100** (+3 pts) ✅
- Architecture : **98/100** (+3 pts) ✅

### Validation Finale

```bash
# Exécuter tous les checks
bash scripts/verify/enforce-tauri-only.sh
bash scripts/verify/enforce-local-first.sh
bash scripts/verify/validate-architecture.sh
npm run lint
npm run test:architecture

# Résultat attendu: Tous les checks passent ✅
```

---

## 📝 RAPPORT FINAL

### Créer Rapport P0

```bash
# Créer rapport synthétique
cat > P0_ACTIONS_REPORT.md << 'EOF'
# Rapport Actions P0 - TITANE∞ v26.2.0

**Date exécution :** $(date)
**Durée totale :** 1h20

## Résultats

### 1. Audits Sécurité ✅
- npm audit: X vulnérabilités (Y critiques, Z hautes)
- cargo audit: X vulnerabilities
- Fixes appliqués: Y vulnérabilités corrigées

### 2. Coverage Tests ✅
- Coverage global: X.X%
- Zones <80%: Y fichiers
- Tests à ajouter: Z prioritaires

### 3. Rust unwrap() ✅
- Total unwrap(): 1,278
- Critiques (production): X
- Plan fix: Top 10 fichiers identifiés

### 4. Architecture ✅
- Violations avant: 1 (AgendaEngine)
- Violations après: 0
- Validation script: PASSED

## Score Final
- Avant P0: 88/100
- Après P0: 90/100 (+2 pts)

## Next Steps
- Planifier Sprint 1 (P1 actions)
- TypeScript strict flags (2h)
- ESLint warnings reduction (3h)
EOF
```

---

## 🎯 SUCCESS CRITERIA

### Critères de Validation

**P0 RÉUSSI si :**

- ✅ Audits sécurité exécutés (rapports disponibles)
- ✅ Coverage ≥70% mesuré (rapport HTML généré)
- ✅ unwrap() critiques <50 (plan fix disponible)
- ✅ Architecture 0 violations (script passe)
- ✅ Score global ≥90/100

**P0 ÉCHOUÉ si :**

- ❌ Vulnérabilités critiques détectées (non fixables rapidement)
- ❌ Coverage <50% (trop faible)
- ❌ unwrap() critiques >100 (trop de travail)
- ❌ Violations architecture multiples (problème structurel)

---

## 📞 SUPPORT

### En cas de problème

**1. Dépendances manquantes :**

```bash
# Réinstaller proprement
./titane.sh repair
```

**2. Tests échouent :**

```bash
# Vérifier node_modules
rm -rf node_modules
npm install

# Vérifier build
npm run build
```

**3. Rust ne compile pas :**

```bash
# Clean + rebuild
cd src-tauri
cargo clean
cargo build
```

**4. Questions :**

- Consulter : `AUDIT_COMPLET_v26.2.0_2025-12-20.md`
- Section : "ACTIONS PRIORITAIRES" (page 38+)

---

## ✅ CHECKLIST FINALE

**Avant de commencer :**

- [ ] Lire ce document (5 min)
- [ ] Préparer environnement (terminaux, éditeur)
- [ ] Allouer 1h30 sans interruption

**Pendant exécution :**

- [ ] Action 1: Audits sécurité (30 min)
- [ ] Action 2: Coverage tests (15 min)
- [ ] Action 3: Audit unwrap() (20 min)
- [ ] Action 4: Fix architecture (15 min)

**Après exécution :**

- [ ] Générer rapport P0
- [ ] Valider métriques (90/100)
- [ ] Commit + push résultats
- [ ] Planifier Sprint 1

---

**PRÊT À COMMENCER ?**

```bash
# Timer 1h20
echo "Actions P0 TITANE∞ v26.2.0 - START: $(date)"
# Exécuter actions 1-4
echo "Actions P0 TITANE∞ v26.2.0 - END: $(date)"
```

**BON COURAGE ! 🚀**

---

**Document créé par :** GitHub Copilot  
**Date :** 2025-12-20  
**Version :** v26.2.0  
**Référence :** AUDIT_COMPLET_v26.2.0_2025-12-20.md
