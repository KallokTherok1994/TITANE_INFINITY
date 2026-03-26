# 01_BOOTSTRAP

```
branch:  MAIN
HEAD:    773f2a89e
worktree: 1 fichier unstaged (src/features/chat/ThinkingPanel.tsx — en cours de session)
node:    v24.0.0
pnpm:    10.30.2
rustc:   1.94.0 (4a4ef493e 2026-03-02)
cargo:   1.94.0 (85eff7c80 2026-01-15)
```

## Cible runtime auditée
**SOURCE CODE (src/) — aucun binary lancé pendant l'audit**  
Cible = code source actif sur MAIN, compilé via `pnpm vitest` et `pnpm exec tsc --noEmit`.

## G_BOOT_TRUTH
- PASS: HEAD vérifié `773f2a89e`
- PASS: Branch = MAIN
- PASS: Node v24, pnpm 10.30.2, rustc 1.94.0
- NOTE: Worktree avait ThinkingPanel.tsx unstaged — c'est la surface cible de ce fix
