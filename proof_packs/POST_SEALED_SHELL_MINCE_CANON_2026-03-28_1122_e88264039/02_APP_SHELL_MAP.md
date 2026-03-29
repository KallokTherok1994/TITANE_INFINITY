# App Shell Map

| Responsibility | Location | Classification | Notes |
| --- | --- | --- | --- |
| License/perf banners | App.tsx header | REMOVE_FROM_SHELL | Doctrinal/historical in shell |
| Environment policy logging | App.tsx | MOVE_TO_OPS | Policy claims out of shell |
| Boot markers/diagnostics | App.tsx | MOVE_TO_OPS | Keep minimal in ops/bootstrap |
| Top-level providers | App.tsx | KEEP_IN_SHELL | Theme/UI/Animation/TitanState/Toast |
| Layout frame + TopNav | App.tsx | KEEP_IN_SHELL | AppShell boundary |
| Router + routes | AppRouter | MOVE_TO_ROUTER | Should live in router module |
| Onboarding gating | AppRouter | MOVE_TO_FEATURE | Feature workflow |
| Living engines init/logs | AppRouter | MOVE_TO_PROVIDER | Orchestration provider |
| Module context publishing | AppRouter | MOVE_TO_FEATURE | Chat-specific context |
| Dev dashboards | App.tsx (DEV) | MOVE_TO_OPS | Dev-only surfaces |
| Aura background | App.tsx | MOVE_TO_FEATURE | Visual system |
| BackendDownIndicator + readiness flags | AppRouter | KEEP_IN_SHELL | Must use canonical truth |
