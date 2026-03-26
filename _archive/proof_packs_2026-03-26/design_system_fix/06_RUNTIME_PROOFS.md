# 06 RUNTIME PROOFS

## P1 - Parametre Design modifie UI runtime
Preuve test:
- changement `design-color-accent` -> status dirty
- DOM root `--color-accent` devient `#112233`
- test `shows truthful runtime status and transitions to dirty state on token edit`: PASS

## P2 - Reload conserve modification
Preuve test:
- sauvegarde token primary `#334455`
- unmount/remount page
- input `design-color-primary` relit `#334455`
- `loadUiTheme` appele 2 fois
- test `restores persisted tokens after reload sequence`: PASS

## P3 - Aliases CSS canoniques propages
Preuve test:
- `--background=#101820`
- `--surface=#202830`
- `--text-primary=#f0f2f4`
- `--admin-bg-start=#101820`
- test `applies tokens to legacy/global aliases for visible shell impact`: PASS

## P4 - Contraste lisible garanti
Preuve test:
- white-on-white injecte intentionnellement
- runtime corrige `--text-primary`
- ratio >= 4.5 prouve par calcul
- test contraste: PASS

## P5 - Application globale
Preuve code:
- `src/App.tsx` contient maintenant `UIThemeProvider` autour du router/app shell.
- effet: tokens appliques au boot, pas seulement quand Design page est ouverte.

## P6 - Persistence backend
Preuve code:
- `src-tauri/src/design_center/theme_manager.rs`
  - `load_ui_theme`
  - `save_ui_theme`
  - `reset_ui_theme`
- chemin runtime: `src-tauri/data/ui_theme.json` en dev, fallback `app_data/data/ui_theme.json`.

## Etat global
- propagation runtime: PASS
- persistence reload: PASS
- contraste auto-fix: PASS