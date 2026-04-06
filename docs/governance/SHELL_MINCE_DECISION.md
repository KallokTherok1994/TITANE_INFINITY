# SHELL MINCE DECISION

## 1. Purpose and scope
Define a thin, non-doctrinal shell boundary for TITANE. This is a governance convergence artifact, not a release seal.

## 2. What the shell is allowed to do
- Wire top-level providers (ThemeProvider, UIThemeProvider, AnimationProvider, TitanStateProvider, ToastProvider).
- Own the top-level layout frame (AppShell + TopNav).
- Compose the active router if no dedicated router module exists (BrowserRouter + Routes).
- Provide global error boundaries (AutoHealErrorBoundary + ErrorBoundary wrappers).
- Emit minimal boot diagnostics and non-blocking watchdogs (SplashWatchdog, boot markers).
- Publish non-visual readiness flags from canonical signals (app-ready, ipc-ready).
- Render global notifications container.

## 3. What the shell must not do
- Feature workflows or state orchestration (onboarding, living engines logic, module context publishing).
- Environment/policy declarations or mode claims.
- Performance/marketing banners embedded in code.
- Provider/mode/fallback truth derived from non-canonical fields.
- Dev-only dashboards inside the production shell (should live behind dev route/ops boundary).
- Feature-level layout or page-specific UI logic.

## 4. Current shell map (App.tsx)
| Responsibility | Location | Classification | Notes |
| --- | --- | --- | --- |
| Version/perf banner comments | App.tsx header | REMOVE_FROM_SHELL | Doctrinal/historical text in shell code |
| Environment policy logging | App.tsx top block | MOVE_TO_OPS | Policy/claims should be outside shell |
| Boot markers + diagnostics | App.tsx (BOOT markers) | MOVE_TO_OPS | Keep minimal boot signals in ops/bootstrap |
| Providers (Theme/UI/Animation/TitanState/Toast) | App.tsx | KEEP_IN_SHELL | Top-level provider wiring |
| AppShell + TopNav layout | App.tsx | KEEP_IN_SHELL | Shell frame and navigation |
| Router + route table | AppRouter (Routes) | MOVE_TO_ROUTER | Shell should not own full routing table |
| Onboarding gating | AppRouter | MOVE_TO_FEATURE | Feature workflow logic |
| Living engines init/logs | AppRouter | MOVE_TO_PROVIDER | Orchestration belongs to provider |
| publishActiveModuleContext | AppRouter | MOVE_TO_FEATURE | Chat-specific context |
| Dev dashboards | App.tsx (DEV-only) | MOVE_TO_OPS | Dev surfaces out of prod shell |
| AuraConnectedParticles | App.tsx | MOVE_TO_FEATURE | Visual system, not shell duty |
| BackendDownIndicator + readiness flags | AppRouter | KEEP_IN_SHELL | Allowed if fed by canonical truth |

## 5. Conflict register summary
- Doctrinal/perf header + environment policy claims: CONFLICT_MAJOR
- Feature workflow in shell (onboarding + module context): CONFLICT_MAJOR
- Route overload in shell: CONFLICT_MAJOR
- Dev-only dashboards in shell: CONFLICT_MINOR
- Living engines orchestration in shell: CONFLICT_MINOR

## 6. Allowed shell truth sources
- Backend canonical meta (ProviderDecisionMeta) surfaced via approved providers/hooks.
- IPC readiness via `isTauriRuntimeAvailable()`.
- Proof-pack lineage for any UI-visible truth claims.

## 7. Boundaries (Shell vs Backend/Feature/Labs/Ops)
- Shell: composition + boundaries + global layout + minimal diagnostics.
- Backend: source of truth for provider/mode/fallback/runtime state.
- Feature: onboarding, module context, living engines behavior.
- Ops: environment policy, dev dashboards, boot pipelines.
- Labs: experimental flows must not land in shell by default.

## 8. Minimal refactor rules
- Only shell-adjacent scope (App.tsx + entry router composition) without feature logic changes.
- No provider/router internals.
- No version bumps.
- Rollback must be trivial.

## 9. Rollback rule
- Revert this doc with: `git restore -- docs/governance/SHELL_MINCE_DECISION.md`
- Supersession allowed only by a new bounded shell convergence cycle or a proven product trigger.
