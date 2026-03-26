# 01 Frontend Real State Discovery

Frontend entry reality discovered from the repository state:

- `src/main.tsx`: canonical React entry. Boots diagnostics, imports `App`, `index.css`, responsive tokens/utilities, and page styles.
- `src/App.tsx`: canonical app composition. Uses `BrowserRouter`, `ThemeProvider`, `TitanStateProvider`, `AppShell`, `TopNav`, and routes `/` and `/dashboard` to `/titane`.
- `index.html`: canonical HTML entry. Carries boot diagnostics, `data-theme="dark"`, viewport meta, and `#root` mount point.
- `src/index.css`: canonical global stylesheet. Imports token/theme layers and applies root-level behavior including the 75% baseline zoom.
- `src/themes/ThemeProvider.tsx`: legacy no-op compatibility provider. Theme is effectively CSS-token driven in the current runtime.
- `src/components/layout/AppShell.tsx`: canonical shell container (`h-screen`, `w-screen`, fixed top nav, scrollable main area).
- `src/components/layout/TopNav.tsx`: global navigation bar with stable test ids (`nav-top-main`, `nav-*`).
- `src/pages/TitanePage.tsx` + `src/pages/TitanePage.css`: canonical central surface rendered by the shell; exposes conversation, overview, vision, identity, memory, evolution, progression, and transformation tabs.

Test reality discovered:

- `wdio.desktop.conf.cjs`: canonical Desktop/WebDriverIO configuration for WRY/Tauri runtime.
- `e2e/desktop/online-chat-proof-ui.wdio.test.js`: canonical interaction proof driver.
- `/tmp/v12_ui_visual_probe.wdio.test.js`: temporary V12 visual probe created for this lane to capture screenshots and runtime JSON audits.

Proof reality at lane open:

- Prior chain-of-truth packs V9/V10/V11 were already sealed for earlier UI lanes.
- V12 intentionally opened a new frontend/UI perfection lane without reopening historical seals.
