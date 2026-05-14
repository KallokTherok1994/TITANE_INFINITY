# A11Y Reduction - Quantum Center Focus + Gate Expansion - 2026-05-14

Verdict: PASS

Scope:
- `src/components/QuantumCenter/QuantumCenter.tsx`
- `src/__tests__/components/QuantumCenter/QuantumCenter.test.tsx`
- `e2e/a11y/wcag-aa-core.spec.ts`

Problem:
- `/quantum-center` etait une surface canonique visible hors gate WCAG officiel.
- Un probe Axe cible a confirme une violation sérieuse unique `scrollable-region-focusable`.

Root cause:
- `main.quantum-content` etait scrollable mais non focusable et sans nom accessible.

Fix:
- Ajout de `tabIndex=0` et `aria-label="Contenu Quantum Center"` sur la région scrollable.
- Ajout d une garde Vitest ciblée.
- Extension du gate Axe canonique de 12 a 13 routes avec ajout de `/quantum-center`.

Executable proof:
- `pnpm vitest run src/__tests__/components/QuantumCenter/QuantumCenter.test.tsx`
  - `Test Files  1 passed (1)`
  - `Tests  3 passed (3)`
- Probe Axe cible apres fix:
  - `route=/quantum-center`
  - `blocking=0`
- `TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_HOST=127.0.0.1 TITANE_E2E_PORT=4173 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --project=chromium`
  - `[a11y:quantum-center] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:aggregate] blocking=0 baseline=30`
  - `15 passed (56.9s)`

Rollback:
- `git restore -- src/components/QuantumCenter/QuantumCenter.tsx src/__tests__/components/QuantumCenter/QuantumCenter.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14_QUANTUM_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-14_QUANTUM_GATE_EXPANSION`