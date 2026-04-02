# 06 MAP D - SHELL LAYOUT

## AppShell structure (src/components/layout/)
- Main shell: wraps all lazy-loaded pages inside BrowserRouter
- Shell provides: sidebar, header, main content area
- Observed via: raw/04_map_shell_layout.txt

## Layout integrity
- AppShell renders for all authenticated routes
- Error boundary (AutoHealErrorBoundary) wraps AppRouter
- No orphan routes detected outside AppShell

## Status: PASS
