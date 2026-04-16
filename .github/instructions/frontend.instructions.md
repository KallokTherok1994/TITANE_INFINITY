---
applyTo: 'src/**'
---

# Frontend Instructions

## Invariants rappeles

- Ring impacte: Ring 4 (UI/Modules) and Ring 3 (Orchestration/Stores/Hooks).
- Zero silence: user always sees success or error.
- Local-first (marqueur de compatibilité), doctrine active: online-first gouverné avec fallback local obligatoire.

## DO

- Pour chaque dashboard agent avancé (monitoring, diagnostic, explainability, orchestrateur, sécurité), ajouter :
  - Un composant UI avec `data-testid` stable
  - Un E2E test Playwright dédié
  - Une entrée dans `UI_SURFACE_MAP.md` et `docs/CARTOGRAPHY_COMPLETE.md`
  - Un log ou une capture de preuve (alerte, rapport, screenshot)

- Use ErrorBoundary and visible errors.
- Add stable data-testid for E2E selectors.
- Keep UI changes minimal and register them.
- Update `UI_SURFACE_MAP.md` for every new page or component (Rule 15).
- Update `docs/CARTOGRAPHY_COMPLETE.md` for structural UI changes (Rule 15).
- Create unit (Vitest) + E2E test with `data-testid` for every new UI surface (Rule 16).
- Add `registry/ui-events.jsonl` entry for every UI change.
- For every frontend/UI modification, execute the full UI procedure below before claiming PASS.

## Mandatory UI Procedure

1. Reproduce the runtime truth first.

- Validate the issue on the real active surface before patching.
- Distinguish source truth from stale build/runtime truth.
- If the issue is fullscreen or zoom related, inspect the full `height/flex/min-height/overflow/safe-area` chain, not only the local component.

2. Patch the smallest layout chain that fixes the defect.

- Prefer fixing the container/shell that creates the gap or clipping.
- Avoid cosmetic-only CSS that leaves the runtime containment chain inconsistent.

3. Preserve user-visible truth.

- No silent fallback, no hidden error, no fake ready state.
- Keep input, latest message, runtime markers, and critical CTA visible under zoom in/out.

4. Add or update proof selectors and tests.

- Unit/Vitest for layout helpers or route/layout contracts.
- E2E proof for any user-facing fullscreen/zoom/scroll behavior.
- Reuse stable `data-testid` selectors; add new selectors only when necessary.

5. Update governance artifacts in the same patch.

- `UI_SURFACE_MAP.md`
- `docs/CARTOGRAPHY_COMPLETE.md`
- `registry/ui-events.jsonl`
- the canonical AutoHeal registry

6. Run mandatory validation for UI work.

- Targeted unit tests.
- Targeted E2E/browser or desktop proof for the touched surface.
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`

7. If a build is required to validate runtime truth, rebuild the latest version and verify the built surface, not only dev mode.
8. If Linux, Windows, and Android cannot all be proven locally, seal the locally provable surfaces and document the remaining runner/workflow proof path explicitly.

## DONT

- Add fetch/HTTP without explicit approval and gates.
- Hide errors or swallow exceptions.
- Ship a new UI surface without E2E test and `UI_SURFACE_MAP.md` update.

## Preuves attendues

- E2E logs + screenshots, `registry/ui-events.jsonl` entry if UI changed.
- `UI_SURFACE_MAP.md` updated with new testid and page references.

## Gates specifiques

- test:e2e or equivalent for UI/IPC changes.
- verify:registry when UI registry changes.
- Missing `UI_SURFACE_MAP.md` update for new UI surface ⇒ BLOCKED (Rule 15).
- Missing E2E test for new UI surface ⇒ BLOCKED (Rule 16).
- UI work closed without the mandatory UI procedure, proof updates, and recurrence/instruction validators ⇒ FAIL.

## Rollback

- git restore -- src registry/ui-events.jsonl
