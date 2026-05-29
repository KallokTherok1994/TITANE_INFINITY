# GATE 8 — NEXUS V36 DESIGN SPECIFICATION

**Project:** TITANE_INFINITY  
**Date:** 2026-05-28  
**HEAD:** 6c6aa6e01  
**Phase:** P1 (spec only — no src mutation)  
**Status:** DESIGN_PROPOSAL — requires APPROVE_P2_GATE_10 before implementation

---

## Mission

Define the NEXUS v36 surface design: what the new navigation shell will look like, how it organizes the 30 classified routes, and what visual language it introduces — without implementing anything.

**Scope:** `docs/nexus-v36/` only. Zero `src/` changes.

---

## Design Premise

NEXUS v36 is NOT a new page. It is a **navigation shell and context layer** that:
1. Organizes the existing 30 routes into a coherent experience
2. Introduces three modes: **Daily**, **System**, **Dev** (from Gate 7 Surface Decision Matrix)
3. Provides a unified command palette and truth badge system
4. Does NOT delete, rename, or break any existing route or alias

---

## Architecture Overview

```
NEXUS v36 Shell
├── TopNav (existing, enhanced)
│   ├── Daily Mode: shows 11 KEEP_DAILY routes
│   ├── System Mode: adds 14 KEEP_SYSTEM routes to nav
│   └── Dev Mode: adds 2 KEEP_DEV routes to nav
├── Command Palette (new overlay component)
│   ├── Quick-jump to any of 30 routes by name or alias
│   └── Mode switcher
├── Truth Badge System (new component overlay)
│   ├── LIVE badge: LIVE_TAURI / LIVE_TAURI_WITH_FALLBACK
│   ├── MIXED badge: MIXED_LIVE_AND_STATIC
│   ├── SIMULATED badge: SIMULATED_UI (mandatory)
│   └── DISPLAY_ONLY badge: DISPLAY_ONLY
└── Empty State / Fallback Handlers
    └── Standardized empty state components per truthClass
```

---

## Mode Switching Design

### Daily Mode (default)
- TopNav shows: titane, experience, time, memory, twins, research, multiproject, skills, knowledge, creation, evolution
- SIMULATED routes: hidden from nav (accessible by direct URL only, with forced SIMULATED badge)
- Root `/` redirects to `/titane` (unchanged)

### System Mode
- Unlocked via Settings → "System" or keyboard shortcut
- Adds system routes to a secondary nav tier
- Includes: admin, fusion, optimization, orchestration-center, reality-center, hyper-center, cloud, doc-center, singularity, sentinel, watchdog, selfheal, adaptive, htf

### Dev Mode
- Unlocked via Settings → "Developer" or dev flag
- Adds: dev, total-dev
- Includes access to /performance (display-only diagnostic)
- Dev AI chat (/total-dev) uses qwen3.5:9b — gated as ALLOWED_DEV_SURFACE

---

## Component Catalog (P2 Implementation Targets)

### 1. NexusShell (new container — wraps existing router)
- Does NOT replace existing pages
- Provides mode state via React context
- Injects TopNav mode override
- **File target (P2):** `src/components/NexusShell/NexusShell.tsx`

### 2. CommandPalette (new overlay)
- Triggered by Cmd+K / Ctrl+K
- Fuzzy search over all 30 routes + 65 aliases
- Shows route description and truthClass badge
- **File target (P2):** `src/components/CommandPalette/CommandPalette.tsx`

### 3. TruthBadge (new status component)
- Renders per-route truthClass as visual badge
- Required on SIMULATED_UI routes (cannot be disabled)
- **File target (P2):** `src/components/TruthBadge/TruthBadge.tsx`

### 4. EmptyStateTruth (new empty state standard)
- Standardized empty state per truthClass
- LIVE_TAURI: spinner + "Connecting to runtime..."
- SIMULATED_UI: "Simulated — no live data" (permanent, not dismissible)
- **File target (P2):** `src/components/EmptyStateTruth/EmptyStateTruth.tsx`

---

## What NEXUS v36 Is NOT

| Forbidden | Reason |
|-----------|--------|
| New NexusPage replacing existing routes | Would break route invariants |
| Route deletion | Forbidden by Gate 7 invariant |
| Product model change | gemma2:2b baseline immutable |
| SIMULATED_UI in Daily nav | Forbidden by Gate 7 |
| src/ mutation before Gate 10 | P2 locked |

---

## Gate 8 Verdict

```
NEXUS_V36_DESIGN_PHASE=SPEC_ONLY
SRC_MUTATIONS=0
ROUTE_DELETIONS=0
ALIAS_DELETIONS=0
PRODUCT_MODEL_CHANGES=0
GATE_8_DESIGN_SPEC=COMPLETE
```
