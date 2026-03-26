# 05 Fix Plan Minimality

## Chosen Strategy

- One friction -> one fix -> rerun x3.
- Keep patch in Ring 4 CSS only, no architecture or IPC changes.

## Planned Code Change

- Target file: `src/pages/TitanePage-local.css`.
- Add one rule block:
  - `.titane-inline-tabs button:focus-visible { ... }`

## Safety Constraints

- No network/runtime capability changes.
- No Tauri allowlist/capability changes.
- No broad style refactor.
