# ROLLBACK

Rollback minimal (si besoin):

- `git restore -- src/features/admin/AdminPage.tsx`
- `git restore -- src/features/system-center/hooks/useSystemDiagnostics.ts`
- `git restore -- src/pages/ConfigurationHub.tsx`
- `git restore -- e2e/features/admin-main-menu-truth.spec.ts`
- `git restore -- e2e/features/audio-center.spec.ts`

Rollback complet de session locale:

- `git restore -- .`
