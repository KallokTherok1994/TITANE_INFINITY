# UI_SURFACE_MAP

## TopNav — Navigation & Global Controls (top-right)

- TopNav zoom controls container test id: `topnav-zoom-controls`
- TopNav zoom-out button test id: `topnav-zoom-out`
- TopNav zoom-in button test id: `topnav-zoom-in`
- File: `src/components/layout/TopNav.tsx`
- Zoom range: 50% – 200%, persisted to localStorage key `titane_zoom_level`
- Keyboard equivalents: Ctrl+- (zoom out), Ctrl++ (zoom in), Ctrl+0 (reset)

## Primary Chat Surface (ConversationSection)

- Input textarea test id: `chat-input`
- Send button test id: `chat-send`
- Assistant message container test id: `chat-message-assistant`
- Assistant content test id: `chat-message-content`
- Runtime panel test id: `chat-runtime-state`
- Runtime summary test id: `chat-runtime-summary`
- Ready marker test id: `chat-ready`
- Loading marker test id: `chat-loading`
- Error marker test id: `chat-error`

## Runtime Telemetry Attributes on Assistant Row

- `data-provider-used`
- `data-network-used`
- `data-provider-reason`
- `data-provider-mode`
- `data-memory-state`
- `data-provider-cache-hit`

## Runtime Telemetry Attributes on Runtime Panel

- `data-provider-used`
- `data-network-used`
- `data-provider-reason`
- `data-orchestrator-state`
- `data-memory-state`

## Fallback/Legacy Surfaces Covered by Tests

- Chat bubble selectors (`chat-bubble-*`)
- Legacy selectors (`#chat-window-textarea`, `#chat-input-textarea`, `.send-button`, `.chat-send-btn.chat-send-omega`)

## Observed Active Surface in latest desktop proof

- `chat-input` and `chat-send` resolved.
- Assistant response rendered under `chat-message-assistant` + `chat-message-content`.
- Runtime panel aligned with assistant provider metadata (`provider=Ollama`, `network=false`, `reason=OK`).
