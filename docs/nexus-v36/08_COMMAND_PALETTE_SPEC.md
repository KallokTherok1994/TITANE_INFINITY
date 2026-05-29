# GATE 8 — COMMAND PALETTE SPECIFICATION

**Project:** TITANE_INFINITY  
**Date:** 2026-05-28  
**Phase:** P1 SPEC

---

## Purpose

The Command Palette is a new overlay component for NEXUS v36 that provides quick-jump navigation across all 30 routes and their 65 aliases, with mode-aware filtering.

---

## Trigger

| Input | Action |
|-------|--------|
| `Ctrl+K` (Windows) | Open command palette |
| `Cmd+K` (Mac) | Open command palette |
| `Escape` | Close palette |
| `↑ / ↓` | Navigate results |
| `Enter` | Navigate to selected route |

---

## Data Source

The command palette reads from the Surface Decision Matrix:  
`docs/nexus-v36/07_SURFACE_DECISION_MATRIX.json`

At P2 implementation time, this data will be bundled as a static import from the manifest.

---

## Route Index (all 30 routes + 65 aliases = 95 searchable entries)

Each entry contains:
- `route`: canonical route path
- `aliases`: all alias paths
- `component`: page component name
- `decision`: KEEP_DAILY / KEEP_SYSTEM / KEEP_DEV / KEEP_SIMULATED / KEEP_DISPLAY_ONLY
- `truthClass`: badge to display
- `inDailyMode`: boolean for filtering

---

## Search Behavior

### Mode-Aware Filtering

| Current Mode | Visible Routes |
|-------------|---------------|
| DAILY | KEEP_DAILY routes only (11) |
| SYSTEM | KEEP_DAILY + KEEP_SYSTEM (25) |
| DEV | All non-SIMULATED routes (28) |
| Any mode | KEEP_SIMULATED routes visible with SIMULATED badge warning |

### Fuzzy Search

- Matches against: route path, component name, all aliases, navOwner
- Score ranking: exact match > prefix match > fuzzy match
- No minimum character threshold (full list shown on empty query)

---

## UI Specification

### Palette Container

```
width: min(640px, 90vw)
background: var(--surface-modal) or hsl(222, 20%, 12%)
border: 1px solid hsl(222, 20%, 25%)
border-radius: 12px
box-shadow: 0 24px 48px rgba(0,0,0,0.5)
position: fixed; top: 15vh; left: 50%; transform: translateX(-50%)
z-index: 9999
```

### Search Input

```
height: 48px
font-size: 16px
placeholder: "Go to route, page, or alias..."
border-bottom: 1px solid hsl(222, 20%, 20%)
```

### Result Item

```
height: 40px
layout: flex; align-items: center; gap: 12px
left: route path (monospace 13px)
center: truthClass badge (10px uppercase pill)
right: component name (gray 12px)
hover: background hsl(222, 20%, 18%)
active: background hsl(222, 20%, 22%)
```

### SIMULATED Result Item

- Route path: red text (#ef4444)
- Badge: red "SIMULATED" pill
- Warning icon prefix
- Tooltip: "Simulated surface — no live backend data"

---

## Keyboard Navigation Spec

1. On open: focus search input, select all
2. Type: filter results in real time
3. Arrow keys: move selection, scroll list
4. Enter on result: navigate, close palette
5. Escape: close, return focus to triggering element
6. Tab: close (accessibility standard)

---

## Access Control

| Route Decision | Command Palette Visibility |
|---------------|--------------------------|
| KEEP_DAILY | Always visible |
| KEEP_SYSTEM | Visible in System + Dev modes only |
| KEEP_DEV | Visible in Dev mode only |
| KEEP_SIMULATED | Always visible (with SIMULATED warning) |
| KEEP_DISPLAY_ONLY | Visible in Dev mode only |

---

## P2 Implementation File Target

```
src/components/CommandPalette/CommandPalette.tsx
src/components/CommandPalette/CommandPalette.css
src/components/CommandPalette/useCommandPalette.ts
src/components/CommandPalette/routeIndex.ts  ← static import from manifest
```

**Required IPC:** None — command palette is pure frontend routing (no Tauri IPC).

---

## Verdict

```
COMMAND_PALETTE_DEFINED=PASS
SEARCHABLE_ENTRIES=95
MODE_FILTERING=DEFINED
KEYBOARD_NAV=DEFINED
P2_FILE_TARGETS=DEFINED
COMMAND_PALETTE_SPEC=COMPLETE
```
