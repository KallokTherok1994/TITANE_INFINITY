# 03 Frontend Canon Scope

Prioritized V12 scope:

1. App entry chain: `index.html` -> `src/main.tsx` -> `src/App.tsx`
2. Global frontend behavior: `src/index.css` and root-level zoom/layout interaction rules
3. Canonical shell: `src/components/layout/AppShell.tsx`
4. Global navigation: `src/components/layout/TopNav.tsx`
5. Canonical central surface: `src/pages/TitanePage.tsx` and `src/pages/TitanePage.css`
6. Runtime proof layer: `wdio.desktop.conf.cjs`, `e2e/desktop/online-chat-proof-ui.wdio.test.js`, and temporary V12 visual probe

Out of scope unless a critical defect depended on it:

- Secondary pages not rendered by the `/titane` route during canonical desktop startup
- Broad theme redesign or branding changes
- Historical proof packs already sealed in V9/V10/V11
