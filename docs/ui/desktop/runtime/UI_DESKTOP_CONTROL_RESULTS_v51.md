# UI_DESKTOP_CONTROL_RESULTS_v51

**Source**: `ui-desktop-control-inventory.wdio.test.js` — v51 full run  
**Date**: 2026-05-10 | **Spec result**: PASS (34/34 tests) | **Binary**: v33.0.11

## Control Inventory Summary

The control inventory spec performs DOM crawling across navigable routes to classify interactive elements.

| Metric | Value |
|---|---|
| L1 Static gates | PASS |
| L4 DOM crawler tests | PASS |
| Output artifact | `artifacts/run1/desktop-screenshots/` |
| Control categories | button, input, select, link, [role=button], [data-testid] |

## L1 Static Classification

All control types validated through registry-based static analysis:
- **buttons**: Clickable elements with `[data-testid]` selectors
- **inputs**: Form input fields
- **selects**: Dropdown selections
- **links**: Navigation links
- **role=button**: Aria-button elements
- **data-testid**: Registry-validated testId selectors (65 aliases in registry)

## L4 Live DOM Inventory

Live crawl performed on routes that load successfully. The crawler:
1. Navigates to each route
2. Extracts all interactive elements using `$$('button, input, select, a, [role="button"], [data-testid]')`
3. Classifies each element by tag + testId presence
4. Writes results to `docs/ui/desktop/runtime/` for this v51 run

## Known Scope

Control inventory covers the DOM as seen from the Tauri WebView (wry). Elements behind auth guards, lazy-loaded panels not yet rendered, or dynamically injected components may not appear in the initial inventory pass.

## Verdict

Control inventory: **PASS** (34/34 tests) — DOM crawl functional for all accessible routes.
