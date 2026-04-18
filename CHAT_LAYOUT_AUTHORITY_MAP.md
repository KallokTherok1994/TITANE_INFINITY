# CHAT_LAYOUT_AUTHORITY_MAP

Timestamp: 2026-04-17 20:47 America/Toronto
Scope: `/titane?tab=conversation` fullscreen desktop lane
Canonical route: `TitanePage` conversation tab rendered inside `AppShell`

## Active Authorities

| File | Selector / Function | Exact rule | Purpose | Canonical or conflicting |
| --- | --- | --- | --- | --- |
| `src/hooks/zoomScale.ts` | `applyZoomScale()` | `document.documentElement.style.zoom = formatZoomScale(normalized)` and `--titane-ui-scale` sync | Stores and applies the TopNav zoom state | Canonical zoom state |
| `src/components/layout/AppShell.tsx` | root shell inline style | `width/maxWidth/height/minHeight: calc(100% / var(--titane-ui-scale, 1))` | Keeps shell geometry parent-bound while inner content is zoomed | Canonical shell compensation |
| `src/components/layout/AppShell.tsx` | `<main>` inline style | `paddingTop: calc((4rem + env(safe-area-inset-top, 0px)) / var(--titane-ui-scale, 1))` when TopNav exists | Prevents TopNav overlap without a second sticky spacer | Canonical top offset |
| `src/pages/TitanePage-local.css` | `.titane-page--conversation` | `display:flex; flex:1 1 auto; height:100%; min-height:0; overflow:hidden; padding:0` | Makes the page root inherit height from parent instead of viewport subtraction | Canonical fullscreen page authority |
| `src/pages/TitanePage-local.css` | `.titane-page-shell--conversation` | `flex:1 1 auto; width:100%; min-width:0; min-height:0; overflow:hidden` | Propagates the parent-bound flex chain | Canonical fullscreen page authority |
| `src/pages/TitanePage-local.css` | `.titane-content--conversation` | `display:flex; flex:1 1 auto; height:100%; min-height:0; overflow:hidden` | Keeps the tabpanel as a fill-parent container | Canonical fullscreen page authority |
| `src/components/sections/ConversationSection.tsx` | `conversationContainerStyle` | `--conversation-vh: ${conversationViewportHeight}px`; fullscreen adds `height:'100%'` and `minHeight:0` | Publishes viewport telemetry and keeps fullscreen container parent-bound | Canonical helper, non-authoritative for height |
| `src/pages/TitanePage.css` | `.conversation-container` | `display:flex; flex-direction:column; flex:1 1 auto; width:100%; height:100%; min-height:0; overflow:hidden` | Main chat shell box | Canonical chat height authority |
| `src/pages/TitanePage.css` | `.conversation-messages` | `flex:1; min-height:0; overflow-y:scroll; overflow-x:hidden; scrollbar-gutter: stable both-edges` | Single scrolling region for the chat stream | Canonical scroll authority |
| `src/pages/TitanePage.css` | `.conversation-input-container[data-fullscreen='true']` | `position:sticky; bottom:0; flex:0 0 auto` | Pins composer inside the conversation container | Canonical composer authority |
| `src/components/AgentDashboardsPanel.tsx` + `src/components/AgentDashboardsPanel.css` | compact panel runtime mode | Fullscreen conversation forces `data-mode=compact`; content is collapsed by default; compact dock bottom offset scales with `--titane-ui-scale` | Prevents overlay collision with the composer | Canonical overlay mitigation |

## Conflicting Authorities Found In The Current Worktree Diff

These were identified as the user-visible defect source and are already removed in the present unstaged patch set:

| File | Selector / Function | Exact rule | Purpose | Canonical or conflicting |
| --- | --- | --- | --- | --- |
| `src/pages/TitanePage.css` | `.conversation-container` | `height: calc(var(--conversation-vh, 100dvh) - 155px); min-height: 500px;` | Old viewport-minus-offset desktop authority | Conflicting |
| `src/pages/TitanePage.css` | responsive `.conversation-container` | `height: calc(var(--conversation-vh, 100dvh) - 176px); min-height: 420px;` | Old compact desktop authority | Conflicting |
| `src/pages/TitanePage.css` | mobile `.conversation-container` | `height: calc(var(--conversation-vh, 100dvh) - 82px); min-height: 200px/260px;` | Old narrow-screen authority | Conflicting |
| `src/pages/TitanePage.css` | `.titane-page, .titane-section, .titane-section-conversation` | historical `width/max-width: 100vw !important` | Forced shell width from viewport instead of parent | Conflicting |

## Active Lane Notes

- The fullscreen desktop lane is now parent-bound through `AppShell -> page-titane -> titane-page-shell--conversation -> titane-content--conversation -> page-conversation -> conversation-container`.
- `--conversation-vh` is still active runtime telemetry, but it should no longer be the height authority for fullscreen desktop chat.
- The remaining certification risk is not another visible fixed offset in CSS; it is whether the current parent-bound lane stays correct at real zoom-out states below `100%` and on the actual desktop artifact.
