# 02 DESIGN CHAIN MAP

## Chaine reelle
1. Admin tab `design` (`src/features/admin/AdminPage.tsx`) charge `DesignCenterPage`.
2. `DesignCenterPage` utilise `UIThemeProvider` (ou contexte global deja present).
3. `UIThemeProvider.loadTokens()` lit runtime via `tauriClient.loadUiTheme()`.
4. `tauriClient` invoque Tauri command `load_ui_theme`.
5. Rust `theme_manager::load_ui_theme` lit `ui_theme.json` (dev/prod/app_data fallback).
6. Tokens en memoire React (`uiThemeReducer`) -> `applyTokensToDOM()`.
7. `document.documentElement.style.setProperty('--*', ...)` pousse vars CSS globales.
8. Composants UI lisent `var(--...)` et changent visuellement en runtime.
9. Sauvegarde: `saveTokens()` -> `save_ui_theme` -> persistence JSON.
10. Reload: nouveau `load_ui_theme` restaure les valeurs.

## Ruptures identifiees avant fix
- Provider global absent (`ThemeProvider` legacy no-op): propagation incomplete au boot.
- Aliases CSS canoniques manquants: composants branchés sur `--text-primary/--background` non connectes.
- Contraste non contraint: tokens invalides pouvaient produire white-on-white.

## Etat apres fix
- Provider global branche dans `src/App.tsx`.
- Design page evite provider imbrique.
- Aliases CSS canoniques et legacy alimentes depuis la meme source tokens.
- Contraste auto-corrige au moment de l'application DOM.