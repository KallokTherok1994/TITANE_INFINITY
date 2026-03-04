# 02_UI_DISCOVERY
- Timestamp UTC: 2026-03-04T23:25:00Z

## Commandes exécutées (zéro oubli)
```bash
rg -n "Route\\b|createBrowserRouter|createHashRouter|react-router|/settings|/chat|/" src
find src -maxdepth 6 -type f -name "*Page*.tsx" -o -name "*Screen*.tsx" -o -name "*View*.tsx"
rg -n "<Button|onClick=|onChange=|type=\"checkbox\"|role=\"tab\"|role=\"button\"|aria-" src
rg -n "chat|conversation|omega|prompt" src
```

## Logs bruts
- `logs/ui_routes_rg.log`
- `logs/ui_pages_find.log`
- `logs/ui_interactive_rg.log`
- `logs/ui_chat_entry_rg.log`

## Résumé de découverte
- Routeur principal: `src/App.tsx` (routes React Router centralisées).
- Navigation principale UI: `src/components/layout/TopNav.tsx` (`nav-*`, `btn-nav-more`).
- Pages canoniques top-nav: `/titane`, `/time`, `/stats`, `/admin`, `/dev`, `/fusion`, `/optimization`.
- Entrées chat: `src/pages/TitanePage.tsx` + `src/components/sections/ConversationSection.tsx`.
- Sélecteurs E2E stables détectés en masse dans `src/**` (`data-testid` déjà largement présent).

## Décisions d’autorité E2E
- Autorité unique retenue: **WDIO Desktop** (runtime Tauri réel).
- Wrapper gouverné présent: `scripts/e2e/tauri-wrapper.sh`.
- Runner desktop: `scripts/e2e/run-desktop-suite.js` + `wdio.desktop.conf.cjs`.
- Playwright classé EXTENDED (non autorité desktop ici).
