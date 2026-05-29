# GATE 8 — EMPTY STATES AND TRUTH BADGES

**Project:** TITANE_INFINITY  
**Date:** 2026-05-28  
**Phase:** P1 SPEC

---

## Truth Badge System

### Component: TruthBadge

A small pill indicator showing the truthClass of the current surface.  
Injected as a portal overlay (bottom-right corner of page content).

### Badge Definitions

| TruthClass | Badge Text | Color Token | Notes |
|-----------|-----------|------------|-------|
| `LIVE_TAURI` | LIVE | `--badge-live` (#22c55e) | Direct Tauri IPC, no fallback |
| `LIVE_TAURI_WITH_FALLBACK` | LIVE* | `--badge-live-fallback` (#86efac) | Live with graceful fallback |
| `LIVE_TAURI_SERVICE_BRIDGE` | BRIDGE | `--badge-bridge` (#3b82f6) | Service bridge layer |
| `LIVE_TAURI_GOVERNED` | GOVERNED | `--badge-governed` (#6366f1) | Governance-layer IPC |
| `LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI` | LIVE/LAZY | `--badge-live` | Container live, panels lazy |
| `MIXED_LIVE_AND_STATIC` | MIXED | `--badge-mixed` (#f59e0b) | Partial live data |
| `SIMULATED_UI` | SIMULATED | `--badge-simulated` (#ef4444) | **Permanent, non-dismissible** |
| `STATIC_CURATED` | STATIC | `--badge-static` (#6b7280) | No live data |
| `DISPLAY_ONLY` | VIEW | `--badge-display` (#9ca3af) | Read-only diagnostic |

### Badge Rules

1. **SIMULATED badge is mandatory:** Routes with `truthClass=SIMULATED_UI` must always show the SIMULATED badge. The badge cannot be hidden, toggled off, or overlaid.
2. **LIVE badge is informational:** Can be toggled off in Settings (user preference).
3. **MIXED badge is informational:** Can be toggled off in Settings.

### CSS Variables (P2 targets)

```css
:root {
  --badge-live: #22c55e;
  --badge-live-fallback: #86efac;
  --badge-bridge: #3b82f6;
  --badge-governed: #6366f1;
  --badge-mixed: #f59e0b;
  --badge-simulated: #ef4444;
  --badge-static: #6b7280;
  --badge-display: #9ca3af;
}
```

---

## Empty State Standards

### EmptyStateTruth Component

A standardized empty state renderer that is truthClass-aware.  
Replaces ad-hoc "no data" UIs with a consistent pattern.

### Empty State Definitions by TruthClass

| TruthClass | Message | Icon | Dismissible? |
|-----------|---------|------|-------------|
| `LIVE_TAURI` | "Connecting to runtime..." | Spinner (animated) | Auto-dismisses on connect |
| `LIVE_TAURI_WITH_FALLBACK` | "Loading... fallback active" | Spinner | Auto-dismisses |
| `LIVE_TAURI_SERVICE_BRIDGE` | "Establishing bridge..." | Spinner | Auto-dismisses |
| `LIVE_TAURI_GOVERNED` | "Waiting for governance clearance..." | Lock icon | Auto-dismisses |
| `LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI` | "Loading panels..." | Progress bars | Auto-dismisses |
| `MIXED_LIVE_AND_STATIC` | "Partial data — live sync pending" | Partial fill icon | Manual dismiss |
| `SIMULATED_UI` | "Simulated surface — no live backend" | Warning triangle | **Never dismissible** |
| `STATIC_CURATED` | "Curated content" | Info icon | Manual dismiss |
| `DISPLAY_ONLY` | "View-only — no writes available" | Eye icon | Manual dismiss |

### Fallback Policy Enforcement

The empty state must respect each route's `fallbackPolicy` from the manifest:
- Routes with `EXTERNAL_NETWORK_SKIP_WITH_PROOF`: show network-skip notice
- Routes with `REQUIRES_CONFIRMATION`: guard write actions behind a confirmation modal
- Routes with `FALLBACK_EXPECTED`: do not error on IPC unavailability

---

## SIMULATED_UI — Special Handling

The two SIMULATED_UI routes require extra constraints:

| Route | Component | Required Badge | Required Empty State |
|-------|-----------|---------------|---------------------|
| `/orchestration-intelligence` | OrchestrationIntelligenceCenter | SIMULATED (permanent) | "Simulated surface — no live backend data" (permanent overlay) |
| `/quantum-center` | QuantumCenter | SIMULATED (permanent) | "Simulated surface — no live backend data" (permanent overlay) |

The SIMULATED overlay:
- z-index: above page content
- opacity: 0.95 (readable, not blocking)
- position: top banner strip (not full-screen overlay)
- Cannot be dismissed or hidden

---

## P2 File Targets

```
src/components/TruthBadge/TruthBadge.tsx
src/components/TruthBadge/TruthBadge.css
src/components/EmptyStateTruth/EmptyStateTruth.tsx
src/components/EmptyStateTruth/EmptyStateTruth.css
```

---

## Verdict

```
TRUTH_BADGE_SYSTEM=9_CLASSES_DEFINED
EMPTY_STATE_STANDARDS=9_DEFINED
SIMULATED_ENFORCEMENT=MANDATORY_PERMANENT
P2_FILE_TARGETS=DEFINED
EMPTY_STATES_AND_TRUTH_BADGES=COMPLETE
```
