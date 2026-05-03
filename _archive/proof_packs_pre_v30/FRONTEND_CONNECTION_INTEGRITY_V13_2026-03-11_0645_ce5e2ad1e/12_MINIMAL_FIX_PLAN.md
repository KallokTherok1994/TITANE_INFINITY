# 12 Minimal Fix Plan

Plan:

1. Remove duplicate `Route` block for `/meta-center`.
2. Keep canonical redirect already present earlier in route list.
3. Validate with lint + typecheck + runtime probe x3.
4. Record AutoHeal and UI registry entries.

Rollback:

- `git restore -- src/App.tsx`
