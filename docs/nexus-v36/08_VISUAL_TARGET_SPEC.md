# GATE 8 — VISUAL TARGET SPECIFICATION

**Project:** TITANE_INFINITY  
**Date:** 2026-05-28  
**Phase:** P1 SPEC (no src mutation)

---

## Design Language for NEXUS v36

### Color & Badge System

| TruthClass | Badge Label | Badge Color | Behavior |
|-----------|------------|------------|---------|
| LIVE_TAURI | LIVE | Green (#22c55e) | Shown when IPC connected |
| LIVE_TAURI_WITH_FALLBACK | LIVE* | Green + asterisk | Green with fallback indicator |
| LIVE_TAURI_SERVICE_BRIDGE | BRIDGE | Blue (#3b82f6) | Service bridge active |
| LIVE_TAURI_GOVERNED | GOVERNED | Indigo (#6366f1) | Governance layer active |
| LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI | LIVE | Green, lazy note | Container live, panels lazy |
| MIXED_LIVE_AND_STATIC | MIXED | Amber (#f59e0b) | Mix of live and static |
| SIMULATED_UI | SIMULATED | Red (#ef4444) | **Always visible, not dismissible** |
| STATIC_CURATED | STATIC | Gray (#6b7280) | Curated static content |
| DISPLAY_ONLY | VIEW | Gray (#9ca3af) | Read-only display |
| TEMPLATE_ONLY | TEMPLATE | Gray (#d1d5db) | Template wiring only |

### Typography

- **Mode indicator**: 11px uppercase, letter-spacing 0.1em, low-opacity
- **Route title**: 16px semibold
- **Truth badge**: 10px uppercase monospace, pill-shaped, 4px border-radius
- **Tab labels**: 14px medium, underline on active

### Layout Targets

```
┌─────────────────────────────────────────────────────────┐
│  NEXUS v36 TopNav                           [mode: DAILY]│
│  titane  experience  time  memory  twins  …             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Page Content — unchanged from existing pages]         │
│                                              [LIVE*]    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Truth badge: bottom-right corner of page content area
- Mode indicator: top-right of TopNav
- Command palette: full-overlay, centered, appears on Ctrl+K

### Command Palette Layout

```
┌──────────────────────────────────────────┐
│  > Search routes...                      │
├──────────────────────────────────────────┤
│  /titane        LIVE*   Core AI chat     │
│  /time          MIXED   Agenda & time    │
│  /memory        BRIDGE  Persistent mem  │
│  /admin         LIVE    System config   │
│  /dev           LIVE*   Developer tools │
│  /quantum-center SIMULATED Quantum sim  │
│  …                                       │
└──────────────────────────────────────────┘
```

---

## Empty State Visual Standards

| TruthClass | Empty State Message | Icon |
|-----------|--------------------|----|
| LIVE_TAURI | "Connecting to runtime..." | Spinner |
| LIVE_TAURI_WITH_FALLBACK | "Loading... (fallback ready)" | Spinner |
| SIMULATED_UI | "Simulated — no live data available" | Warning badge (permanent) |
| MIXED_LIVE_AND_STATIC | "Partial data available" | Info badge |
| DISPLAY_ONLY | "Display-only view" | Eye icon |

---

## Existing Pages — Preserved Visuals

All 30 existing pages preserve their current visual design.  
NEXUS v36 adds:
- TopNav mode context (injected above existing nav)
- Truth badge (injected as overlay, bottom-right, z-index below modal)
- Command palette (new overlay, does not modify page content)

**No existing page layout changes in v36.** That is v37 territory.

---

## Verdict

```
VISUAL_DESIGN_DEFINED=PASS
BADGE_SYSTEM=10_TRUTH_CLASSES
EMPTY_STATES=5_STANDARDS
SRC_MUTATIONS=0
VISUAL_TARGET_SPEC=COMPLETE
```
