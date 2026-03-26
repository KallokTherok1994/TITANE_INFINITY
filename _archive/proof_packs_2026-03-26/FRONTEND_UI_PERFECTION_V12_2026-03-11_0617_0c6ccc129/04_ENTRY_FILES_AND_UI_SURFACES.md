# 04 Entry Files And UI Surfaces

Canonical files audited:

- `index.html`: HTML boot diagnostics, theme marker, viewport, root mount
- `src/main.tsx`: React bootstrap, diagnostics, global CSS imports
- `src/App.tsx`: provider chain, shell composition, canonical routing to `/titane`
- `src/index.css`: global zoom/reset/token import layer
- `src/themes/ThemeProvider.tsx`: legacy compatibility wrapper
- `src/components/layout/AppShell.tsx`: shell frame and scroll container
- `src/components/layout/TopNav.tsx`: top navigation and stable UI ids
- `src/pages/TitanePage.tsx`: default route surface
- `src/pages/TitanePage.css`: canonical central surface styling

Runtime surface actually observed during V12:

- `nav-top-main` visible and fixed at top
- `page-titane` and `page-conversation` rendered
- `chat-input`, `chat-send`, and `chat-message-content` present
- `app-ready` and `ipc-ready` markers both reported `ready`

Temporary proof helper used for this lane only:

- `/tmp/v12_ui_visual_probe.wdio.test.js`
