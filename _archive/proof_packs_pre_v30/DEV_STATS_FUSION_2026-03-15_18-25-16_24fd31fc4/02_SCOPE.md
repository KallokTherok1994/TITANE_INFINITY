# SCOPE
Ring: R4 (UI/Frontend)
Risk: P1

## Files in scope
- src/pages/Stats.tsx (addition only)
- src/pages/DevPage.tsx (import + diagnostics block edit)
- src/App.tsx (3 edits: lazy comment, cognitive redirect, stats route, nav entry)
- src/ui/Menu.tsx (1 edit: route + description)

## Files NOT touched
- All store/hook files (StatsSystemPanels has its own hooks identical to Stats)
- All CSS files
- All test files
- All Tauri/IPC files
