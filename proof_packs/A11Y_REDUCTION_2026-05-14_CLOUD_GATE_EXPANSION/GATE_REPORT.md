# Gate Report — A11Y Cloud Gate Expansion 2026-05-14

## Vitest focused

```
 RUN  v4.1.4 /home/titane-os/Documents/GitHub/TITANE_INFINITY

 ✓  core  src/__tests__/pages/CloudCenterA11yContrast.test.tsx (1 test) 3ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Duration  464ms
```

## Playwright canonical (chromium)

```
[a11y:cloud] blocking=0 (c=0 s=0 m=0 mn=0)
  ✓  23 [chromium] › e2e/a11y/wcag-aa-core.spec.ts:71:5 › v34.0.7 A11y WCAG 2.1 AA (23 critical routes) › a11y cloud (2.8s)
[a11y:aggregate] blocking=0 baseline=30
  ✓  24 [chromium] › e2e/a11y/wcag-aa-core.spec.ts:120:1 › v34.0.7 a11y aggregate baseline regression guard (1ms)
  ✓  25 [chromium] › e2e/a11y/wcag-aa-core.spec.ts:157:1 › v34.0.7 a11y inventory invariant (1ms)

  25 passed (1.3m)
```

## Bundle freshness

```
$ grep -o "\.cloud-center \.btn-primary[^}]*}" dist/assets/style-*.css
.cloud-center .btn-primary,.cc-container .btn-primary{background:var(--accent-primary,#1d4ed8)}
```

## Governance validators

- `pnpm verify:registry` → PASS
- `bash scripts/autoheal/detect_recurrence.sh` → PASS
- `bash scripts/verify_instructions.sh` → PASS
