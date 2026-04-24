# 🎯 PROMPTS RAPIDES PAR PHASE

**Guide d'utilisation:** Copiez le prompt de la phase à exécuter dans GitHub Copilot Chat (VS Code)

---

## 📝 PHASE 1 (P0) - PROMPT RAPIDE

```markdown
Execute Phase 1 (P0) - Corrections Critiques TITANE∞

Context: Repository TITANE_INFINITY needs TypeScript fix + test validation

Tasks:

1. Fix 29,128 TypeScript errors:
   - Try Solution A: rm -rf node_modules pnpm-lock.yaml && pnpm install && npx tsc --noEmit
   - If fails, try Solution B: Downgrade React 19 → 18 in package.json
   - If fails, try Solution C: Fix tsconfig.json JSX configuration
2. Run complete test suite:
   - npm test (frontend)
   - cd src-tauri && cargo test (backend)
   - npm run test:e2e (E2E)
   - npm run test:coverage (measure)

3. Document results in RAPPORT_TESTS_VALIDATION_2026-01-03.md

Success criteria:

- TypeScript errors: 0
- Tests: 100% passed
- Coverage: measured (baseline)
- Target score: 8.5/10

Reference: PLAN_CORRECTION_PERFECTIONNEMENT_2026-01-03.md section P0
```

---

## 📝 PHASE 2 (P1) - PROMPT RAPIDE

```markdown
Execute Phase 2 (P1) - Améliorations Importantes TITANE∞

Prerequisites: Phase 1 complete (TypeScript fixed, tests passing)

Tasks:

1. Security audits:
   - pnpm audit --audit-level=moderate
   - cargo audit
   - Fix critical/high vulnerabilities only

2. Rust Clippy:
   - cargo clippy --all -- -W clippy::all
   - Target: 0 warnings

3. TypeScript strict mode (progressive):
   - Enable exactOptionalPropertyTypes
   - Enable noPropertyAccessFromIndexSignature
   - Enable noUnusedLocals
   - Enable noUnusedParameters
   - Fix errors after each

4. ESLint strict:
   - Upgrade @typescript-eslint/no-explicit-any to 'error'
   - Eliminate 'any' in src/engines/_ and src/types/_

5. Test coverage:
   - npm run test:coverage
   - Write missing tests for <80% modules
   - Target: >80% global coverage

Success criteria:

- Vulnerabilities: 0 critical/high
- Clippy: 0 warnings
- TypeScript strict: 4 options enabled
- ESLint: 0 'any' in core
- Coverage: >80%
- Target score: 9.2/10

Reference: PLAN_CORRECTION_PERFECTIONNEMENT_2026-01-03.md section P1
```

---

## 📝 PHASE 3 (P2) - PROMPT RAPIDE

```markdown
Execute Phase 3 (P2) - Excellence & Optimisations TITANE∞

Prerequisites: Phase 2 complete (security hardened, strict types, high coverage)

Tasks:

1. Bundle optimization:
   - npm run build && npx vite-bundle-visualizer
   - Implement dynamic imports for heavy features
   - Target: -15% bundle size (<6 MB)

2. Documentation:
   - Archive old audits to archives/audits/
   - Create docs/INDEX.md (table of contents)
   - Update README.md

3. CI/CD optimization:
   - Configure pnpm/cargo caching in .github/workflows/ci.yml
   - Parallelize independent jobs
   - Target: -30% CI time (<12 min)

4. E2E test expansion:
   - Write 10+ new Playwright scenarios
   - Add accessibility tests (axe-core)
   - Add performance tests (Lighthouse CI)
   - Target: 15+ total scenarios

5. Architecture 100%:
   - npm run test:architecture
   - Fix remaining 5% violations
   - Target: 100% 4-Ring compliance

Success criteria:

- Bundle: <6 MB
- CI/CD: <12 min
- E2E: 15+ scenarios
- Architecture: 100% compliance
- Documentation: consolidated
- Target score: 10.0/10 ✨

Reference: PLAN_CORRECTION_PERFECTIONNEMENT_2026-01-03.md section P2
```

---

## 🔍 PROMPT DIAGNOSTIC

```markdown
Diagnose current TITANE∞ project status

Run diagnostics:

1. TypeScript: npx tsc --noEmit | wc -l
2. Tests: npm test
3. Coverage: npm run test:coverage
4. Security: pnpm audit && cargo audit
5. Clippy: cargo clippy --all
6. ESLint: npm run lint
7. Bundle: npm run build && du -h dist/
8. Architecture: npm run test:architecture

Generate report with:

- Current score /10
- Blockers identified
- Next recommended actions
- Estimated timeline to 10/10

Reference: RAPPORT_AUDIT_VERIFICATION_COMPLET_2026-01-03.md
```

---

## 🛠️ PROMPT SETUP ENVIRONNEMENT

```markdown
Setup TITANE∞ development environment

Steps:

1. Install pnpm globally:
   npm install -g pnpm@9.0.0

2. Install dependencies:
   cd /path/to/TITANE_INFINITY
   pnpm install

3. Verify Rust toolchain:
   rustc --version
   cargo --version

4. Install Tauri CLI:
   cargo install tauri-cli

5. Verify setup:
   npm run dev (should start without errors)
   npm test (should run tests)

6. Document environment:
   - Node version: node --version
   - pnpm version: pnpm --version
   - Rust version: rustc --version
   - OS: uname -a

Success: Ready to execute Phase 1 (P0)

Reference: SYNTHESE_FINALE_2026-01-03.md section "Immediate Actions"
```

---

## ✅ PROMPT VALIDATION FINALE

```markdown
Validate TITANE∞ perfection (10/10)

Run complete validation suite:

1. TypeScript: npx tsc --noEmit
   Expected: Found 0 errors

2. ESLint: npm run lint
   Expected: 0 errors, 0 warnings

3. Clippy: cargo clippy --all
   Expected: 0 warnings

4. Tests: npm test && cd src-tauri && cargo test
   Expected: 100% passed

5. Coverage: npm run test:coverage
   Expected: >80% all modules

6. Security: pnpm audit --audit-level=high && cargo audit
   Expected: 0 critical/high vulnerabilities

7. Bundle: npm run build && du -sh dist/
   Expected: <6 MB

8. Architecture: npm run test:architecture
   Expected: 100% compliance

9. E2E: npm run test:e2e
   Expected: 15+ scenarios passed

Generate final report:
✅ All metrics green
✅ Score: 10.0/10
✅ ✅ Tech-Ready (Dev) | Production: ⛔ EN ATTENTE (autorisation requise) (pending RÈGLE CRITIQUE #1 authorization)

Reference: ROADMAP_VERS_PERFECTION_2026-01-03.md section "Perfection Criteria"
```

---

## 📊 PROMPT MESURE PROGRESSION

```markdown
Measure TITANE∞ progression toward 10/10

Calculate current score based on:

1. Architecture: (violations / total) \* 10
2. Code Quality: (ts_errors / 29128) \* 10 (inverse)
3. Security: (vulns_critical / baseline) \* 10 (inverse)
4. Tests: (pass_rate) \* 10
5. Documentation: (completeness) \* 10
6. Performance: (bundle_size / 6MB) \* 10 (inverse)
7. Chat IA: 10 (already perfect)

Average = Score /10

Generate progress report:

- Current score: X.X/10
- Previous score: 7.2/10
- Improvement: +X.X points
- Remaining to 10/10: X.X points
- Estimated time: X weeks
- Phase recommendation: P[0/1/2]
- Next action: [specific task]

Reference: SYNTHESE_FINALE_2026-01-03.md section "Métriques Globales"
```

---

## 🚨 PROMPT URGENCE (TYPESCRIPT FIX)

````markdown
URGENT: Fix 29,128 TypeScript errors TITANE∞

Priority: P0-1 (Critical blocker)

Execute solutions in order until success:

Solution A (Recommended - 2 min):

```bash
rm -rf node_modules pnpm-lock.yaml .vite
pnpm install
npx tsc --noEmit
```
````

If still errors, Solution B (5 min):

1. Edit package.json:
   - "react": "^18.3.1" (from ^19.x)
   - "react-dom": "^18.3.1"
   - "@types/react": "^18.3.12"
   - "@types/react-dom": "^18.3.1"
2. pnpm install
3. npx tsc --noEmit

If still errors, Solution C (10 min):

1. Edit tsconfig.json:
   - "jsx": "react-jsx"
   - "jsxImportSource": "react"
   - "skipLibCheck": true (temporary)
2. npx tsc --noEmit

Document which solution worked and commit:
git commit -m "fix(typescript): resolve 29k errors - Solution [A/B/C]"

Reference: PLAN_CORRECTION_PERFECTIONNEMENT_2026-01-03.md section P0-1

```

---

**USAGE:**
1. Choisir le prompt approprié pour votre étape actuelle
2. Copier dans GitHub Copilot Chat (VS Code)
3. Suivre les instructions générées
4. Documenter résultats
5. Passer au prompt suivant

**ORDRE RECOMMANDÉ:**
1. Setup Environnement
2. Diagnostic
3. Phase 1 (P0)
4. Phase 2 (P1)
5. Phase 3 (P2)
6. Validation Finale

**AIDE:**
Si bloqué, utiliser "Prompt Diagnostic" pour identifier le problème
```
