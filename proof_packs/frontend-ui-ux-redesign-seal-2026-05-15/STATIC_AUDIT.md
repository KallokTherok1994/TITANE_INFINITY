# Static Audit — Frontend UI/UX Redesign Seal

## @themes/tokens grep (production)

```
Command: grep -R "@themes/tokens" src --include="*.ts,*.tsx,*.css" (excluding __tests__)
Result: CLEAN — 0 production imports found
```

Status: **PASS**

## rubis/saphir/emeraude/diamant grep

Hits found:

| File | Content | Classification |
|---|---|---|
| `src/core/hyperdepth/HYPERDEPTH_ENGINE.ts` | `DS_COLORS.diamant` | ACCEPTABLE_LEGACY — visual engine, out of redesign scope |
| `src/core/visual/DS_COLORS.ts` | diamant color definition | ACCEPTABLE_LEGACY — shared color constant |
| `src/pages/DesignSystemPage.tsx` | rubis/saphir as theme options | INTENTIONAL_EXCEPTION — design system demo page |
| `src/design-system/titane-fusion.css` | comment referencing removed palettes | ACCEPTABLE_DOC |

No new regressions introduced.

## Hardcoded gray/slate Tailwind class grep

### Regressions fixed during seal

| File | Class | Fixed to |
|---|---|---|
| `src/components/htf/HTFClientPanel.tsx` | `border-gray-300` | `border-titanium-border-default` |
| `src/components/htf/HTFEstimationResult.tsx` | `border-gray-300`, `border-gray-100` | `border-titanium-border-default`, `border-titanium-border-subtle` |
| `src/components/htf/HTFSubmissionWizard.tsx` | `border-gray-300` | `border-titanium-border-default` |
| `src/components/monitoring/PredictiveAlertsDashboard.tsx` | `text-gray-900` | `text-titanium-text-primary` |

### Remaining acceptable exceptions

| File | Class | Classification |
|---|---|---|
| `ConsoleMonitorDashboard.tsx` | `hover:border-gray-500` | INTENTIONAL_EXCEPTION — subtle hover feedback |
| `GlobalRuntimePulse.tsx` | `border-slate-500/60` | INTENTIONAL_EXCEPTION — 60% opacity overlay |
| `VoiceControlPanelWithWakeWord.tsx` | `bg-gray-200 dark:bg-titanium-*` | INTENTIONAL_EXCEPTION — explicit light/dark pair |
| `TopNav.tsx` | `border-gray-500/20` | INTENTIONAL_EXCEPTION — 20% opacity border |
| `IntrospectionDashboard.tsx` | `border-gray-500/50` | INTENTIONAL_EXCEPTION — opacity overlay |
| `CreationStudio.tsx (ui/)` | `hover:border-gray-500` | INTENTIONAL_EXCEPTION — hover modifier |
| `StatusPill.tsx` | `border-gray-500` | INTENTIONAL_EXCEPTION — neutral indicator border |
| `WakeWordIndicator.tsx` | `bg-gray-400` | INTENTIONAL_EXCEPTION — neutral indicator dot |
| `EvolutionMonitor.tsx (ui/)` | `border-gray-500/50` | INTENTIONAL_EXCEPTION — opacity overlay |

## Accessibility presence checks

| Feature | Files found | Status |
|---|---|---|
| `skip-to-content` | `src/index.css`, `src/styles/animations.css`, others | PASS |
| `prefers-reduced-motion` | `src/styles/animations.css`, `src/pages/DevPage.tsx`, TimePage, TitanePage | PASS |
| `aria-selected` | `src/pages/TitanePage.tsx`, `src/features/admin/AdminPage.tsx`, `src/pages/TimePage.tsx`, others | PASS |
| `role="tab"` | All tabbed pages confirmed | PASS |
| `focus-visible` | Multiple component files | PASS |
