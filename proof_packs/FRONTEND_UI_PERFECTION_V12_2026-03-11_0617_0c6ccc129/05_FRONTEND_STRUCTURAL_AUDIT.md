# 05 Frontend Structural Audit

E-1 Entrées

- PASS: `src/main.tsx` mounts `App` and imports the global frontend stack once.
- PASS: `src/App.tsx` composes providers and the shell before route rendering.
- PASS: `index.html` provides the root mount, theme marker, and boot guards.

E-2 CSS global

- PASS: token imports and design layers are centralized in `src/index.css`.
- PASS: body overflow is constrained and shell runtime remained free of white screens and clipping in canonical runs.
- FINDING: the shipped 75% baseline zoom is intentional in the current runtime, but interaction code around that baseline was inconsistent.

E-3 Theme/design system

- PASS: runtime remained coherent with `data-theme="dark"` and tokenized shell colors.
- QUALIFIED: `ThemeProvider` is legacy/no-op, but this did not break runtime theme coherence because the active theme is CSS-token driven.

E-4 Layout

- PASS: `AppShell` filled the screen and kept TopNav fixed while the main surface remained scrollable.
- PASS: TopNav height remained stable at 64px across successful reruns.
- PASS: central interaction area remained visible and usable.

E-5 Dashboard/surface canonique

- PASS: canonical runtime surface is `/titane`, not a detached dashboard route.
- PASS: the conversation panel, CTA/input area, and response list rendered in the central surface.

Dominant structural defect retained for fix:

- `FAIL_INTERACTABILITY` caused by zoom state inconsistency across hooks and storage.
