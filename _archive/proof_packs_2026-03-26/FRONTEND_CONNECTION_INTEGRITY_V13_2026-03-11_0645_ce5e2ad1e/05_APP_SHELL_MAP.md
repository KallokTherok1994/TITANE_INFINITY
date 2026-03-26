# 05 App Shell Map

Main shell path:

- `AppRouter` renders `AppShell`.
- `TopNav` receives current route and navigation callback.
- Readiness markers exposed through hidden testids:
  - `data-testid="app-ready"`
  - `data-testid="ipc-ready"`

Proof source:

- `src/App.tsx`
