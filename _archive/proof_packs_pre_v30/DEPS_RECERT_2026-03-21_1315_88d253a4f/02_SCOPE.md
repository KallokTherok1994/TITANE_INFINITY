# Scope Definition

**Session type:** Governed Recertification + Major Migration Gate Analysis  
**Branch:** MAIN  
**Date:** 2026-03-21  

## Scope

### Dep Update Rounds Recertified
- **Round 1** (commit e9ee8efb8): vitest 4.x, @vitest/browser/coverage/ui, @types/node 25.x
- **Round 2** (commit e9ee8efb8): storybook 10.3, eslint-plugin-react-refresh 0.4.26
- **Round 3** (commit 60c11fdf1): jsdom 29.0.1, eslint 9.39.4

### Major Migration Candidates Evaluated
- eslint 10.x (from current 9.39.4)
- vite 8.x (from current 7.3.1)
- @vitejs/plugin-react 6.x (from current 5.1.4)

### Gates In Scope
- vitest run (3399 tests)
- tsc --noEmit
- eslint src
- pnpm build (vite build)
- verify_instructions.sh
- detect_recurrence.sh

### Out of Scope
- E2E WDIO (infrastructure-dependent)
- Tauri native build
- Storybook build
- New package installations
