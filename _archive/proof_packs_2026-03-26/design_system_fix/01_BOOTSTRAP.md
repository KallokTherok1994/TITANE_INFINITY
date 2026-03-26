# 01 BOOTSTRAP

## Commandes executees
```bash
git status --short
git rev-parse --short HEAD
git log -20 --oneline
```

## Resultat bootstrap
- HEAD: `05295f15e`
- Branche: `MAIN`
- Worktree: deja dirty (nombreux fichiers non lies preexistants) + patch design courant.

## Cible runtime et surfaces
- Runtime cible: app desktop Tauri/React.
- Ring R2: backend persistence theme (`src-tauri/src/design_center/theme_manager.rs`).
- Ring R3: commandes Tauri (`load_ui_theme`, `save_ui_theme`, `reset_ui_theme`).
- Ring R4: `UIThemeProvider`, `DesignCenterPage`, `DesignSystemTab`, CSS vars globales.

## Fichiers source de verite design localises
- Tokens TS default: `src/features/design-center/types/designCenter.types.ts`.
- Theme provider: `src/features/design-center/providers/UIThemeProvider.tsx`.
- Admin design page: `src/features/admin/AdminPage.tsx` + `src/features/design-center/DesignCenterPage.tsx`.
- CSS variables globales: `src/styles/css-vars.css`, `src/styles/unified-tokens.css`, `src/styles/a11y.css`.
- Store/IPC: `src/lib/tauriClient.ts`, `src/lib/tauriCommands.ts`.
- Persistence Rust: `src-tauri/src/design_center/theme_manager.rs`.