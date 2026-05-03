# CHAT_ZOOM_RUNTIME_CHAIN

Timestamp: 2026-04-17 20:47 America/Toronto

## Canonical Chain

1. TopNav zoom control
   `src/components/layout/TopNav.tsx`
   `data-testid="topnav-zoom-out"` / `data-testid="topnav-zoom-in"`
2. Zoom state persistence and DOM application
   `src/hooks/zoomScale.ts`
   `applyZoomScale()` writes both `document.documentElement.style.zoom` and `--titane-ui-scale`
3. App shell compensation
   `src/components/layout/AppShell.tsx`
   Root shell inversely scales width and height with `calc(100% / var(--titane-ui-scale, 1))`
4. Route and page shell
   `src/App.tsx` mounts `TitanePage` on `/titane`
   `src/pages/TitanePage.tsx` conversation tab sets `data-layout="chat-fullscreen"`
5. Fullscreen page chain
   `src/pages/TitanePage-local.css`
   `.titane-page--conversation`
   `.titane-page-shell--conversation`
   `.titane-content--conversation`
   `.titane-section-conversation--fullscreen`
6. Conversation container
   `src/components/sections/ConversationSection.tsx`
   inline `--conversation-vh`, `data-density`, `data-fullscreen`
   `src/pages/TitanePage.css`
   `.conversation-container`
7. Message scroll region
   `src/pages/TitanePage.css`
   `.conversation-messages`
   `data-testid="chat-messages-scroll-region"`
8. Composer and send button
   `src/pages/TitanePage.css`
   `.conversation-input-container`
   `data-testid="chat-input"`
   `data-testid="chat-send"`

## Desktop / Browser Runtime Truth

- Browser lane:
  `playwright.config.ts` launches the canonical browser lane through the local Vite E2E server at `http://127.0.0.1:5173` unless an external server is explicitly provided.
- Desktop lane:
  `wdio.desktop.conf.cjs` launches the canonical WRY artifact through `scripts/e2e/tauri-wrapper.sh`, using the native binary selected by `scripts/e2e/native-binary-policy.cjs`.
- Route under test:
  `/titane?tab=conversation`
- Reproduction control path:
  TopNav `+` / `-` buttons, not pinch zoom and not browser menu zoom.

## Known Certification Gap Before This Run

- The existing Playwright lane only proves `100% -> 110% -> 100%`.
- The existing WDIO lane only proves `100% -> 110% -> 100%`.
- Neither lane drives the user-reported risky state `100% -> 90%` or lower.
- Result: the canonical runtime chain exists, but the exact failing zoom-out state remains unproven until those tests are expanded.
