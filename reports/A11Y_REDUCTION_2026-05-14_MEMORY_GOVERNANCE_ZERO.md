# A11Y Reduction - Memory / Governance / Zero Blocking - 2026-05-14

Verdict: PASS

Scope:
- `src/components/sections/MemorySection.tsx`
- `src/components/chat/MemoryDashboard.tsx`
- `src/features/memory/MemoryTreeViewer.tsx`
- `src/features/memory/MemorySearchPanel.tsx`
- `src/features/governance-center/GovernanceCenterPage.tsx`
- `src/__tests__/components/sections/MemorySection.test.tsx`
- `src/__tests__/components/chat/MemoryDashboard.test.tsx`
- `src/__tests__/features/memory/MemoryVisualization.test.tsx`
- `src/__tests__/features/memory/MemorySearch.test.tsx`
- `src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap`
- `src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap`
- `src/features/governance-center/__tests__/GovernanceCenterPage.test.tsx`

Symptoms closed:
- `/memory` conservait encore des combobox sans nom accessible sur les surfaces mémoire réelles.
- `/memory` conservait une région scrollable non atteignable au clavier.
- `/governance-center` conservait un bouton refresh sous le seuil de contraste Axe.

Applied fix:
- Nommage accessible explicite de `knowledge-topic-filter` dans MemorySection.
- Nommage accessible des quatre filtres dashboard dans MemoryDashboard.
- Nommage accessible de `memory-tree-filter` dans MemoryTreeViewer.
- Nommage accessible des deux filtres de MemorySearchPanel et focus clavier de `memory-results`.
- Relèvement du contraste de l action `Actualiser toutes les données` dans GovernanceCenterPage.
- Ajout des gardes Vitest ciblées et mise à jour des snapshots mémoire impactés.

Executable proof:
- `pnpm vitest run src/__tests__/features/memory/MemorySearch.test.tsx src/__tests__/features/memory/MemoryVisualization.test.tsx src/__tests__/components/chat/MemoryDashboard.test.tsx src/__tests__/components/sections/MemorySection.test.tsx src/features/governance-center/__tests__/GovernanceCenterPage.test.tsx -u`
  - `Snapshots  2 updated`
  - `Test Files  5 passed (5)`
  - `Tests  42 passed (42)`
- Targeted Axe diagnostic:
  - `ROUTE memory blocking=0`
  - `ROUTE governance-center blocking=0`
- `pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts`
  - `[a11y:memory] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:governance-center] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:aggregate] blocking=0 baseline=30`
  - `12 passed (1.0m)`
- `pnpm verify:registry`
  - `✅ registry-integrity: PASS`
  - `✅ registry-quality: PASS`
- `bash scripts/autoheal/detect_recurrence.sh`
  - `PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`
  - `PASS: G_AH_RECURRENCE_GUARD_PASS`
- `bash scripts/verify_instructions.sh`
  - `SUMMARY: PASS=52 FAIL=0`

Residual repo state:
- Le gate canonique `e2e/a11y/wcag-aa-core.spec.ts` publie maintenant un agrégat bloquant nul sur les 10 routes critiques couvertes.

Rollback:
- `git restore -- src/components/sections/MemorySection.tsx src/components/chat/MemoryDashboard.tsx src/features/memory/MemoryTreeViewer.tsx src/features/memory/MemorySearchPanel.tsx src/features/governance-center/GovernanceCenterPage.tsx src/__tests__/components/sections/MemorySection.test.tsx src/__tests__/components/chat/MemoryDashboard.test.tsx src/__tests__/features/memory/MemoryVisualization.test.tsx src/__tests__/features/memory/MemorySearch.test.tsx src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap src/features/governance-center/__tests__/GovernanceCenterPage.test.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14_MEMORY_GOVERNANCE_ZERO.md proof_packs/A11Y_REDUCTION_2026-05-14_MEMORY_GOVERNANCE_ZERO`