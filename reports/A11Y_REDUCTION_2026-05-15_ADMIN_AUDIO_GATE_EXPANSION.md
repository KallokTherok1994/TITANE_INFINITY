# A11Y Reduction — 2026-05-15 — `/admin?tab=audio` contrast + form-label + WCAG gate 33→34

## Verdict
**PASS** — `AudioCenterPage.tsx` durci pour WCAG AA, gate canonique étendu de 33 à 34 routes, blocking aggregate = 0, baseline=30 inchangée, autoheal_rules.jsonl entries=1985.

## Scope (Rule 1 — minimal patch)
- `src/features/audio-center/AudioCenterPage.tsx` :
  - Onglet actif + bouton "Test" : `bg-cyan-600 text-white` → `bg-cyan-700 text-white` (~5.0:1, AA).
  - Engine badges (PIPER / ELEVENLABS / autre) : `text-purple-400`/`text-amber-400`/`text-neutral-400` → `text-purple-200`/`text-amber-200`/`text-neutral-200`.
  - Méta voix `language`/séparateur/`gender` : `text-neutral-500` → `text-neutral-400`.
  - Slider `<input type="range">` : ajout `aria-label={label}` (corrige `axe:label` critical).
- Aucun changement IPC, aucun changement de routeur, aucun ajout de surface.

## Vitest guard
`src/__tests__/features/audio-center/AudioCenterA11yContrast.test.tsx` (4 tests, 4ms) verrouille :
- `bg-cyan-700` actif + Test, et absence de `bg-cyan-600 text-white`.
- Badges `text-purple-200`/`text-amber-200`/`text-neutral-200`, absence de `-400` fautif.
- Méta `text-neutral-400` pour `voice.language` et `voice.gender`.
- `aria-label={label}` sur le `<input type="range">` du composant `Slider`.

## Gate canonique
`e2e/a11y/wcag-aa-core.spec.ts` étendu de 33 → 34 routes : ajout `{ name: 'admin-audio', url: '/admin?tab=audio' }`, header / commentaire / describe / invariant `SURFACES.length === 34` alignés. `AGGREGATE_BLOCKING_BASELINE = 30` inchangé.

```
36 passed (1.8m)
[a11y:admin-audio] blocking=0 (c=0 s=0 m=0 mn=0)
[a11y:aggregate]   blocking=0 baseline=30
```

## Probe avant/après (`/admin?tab=audio`)
- AVANT : 6 `color-contrast` (serious) + 3 `label` (critical) = 9 blocking.
- APRÈS : 0 blocking (probe ad hoc puis gate canonique).

## Governance
- `UI_SURFACE_MAP.md` : section "2026-05-15 — A11Y admin?tab=audio …" insérée en tête.
- `docs/CARTOGRAPHY_COMPLETE.md` : section "2026-05-15 — admin?tab=audio contrast/labels + WCAG inventory 34/34" insérée en tête.
- `registry/ui-events.jsonl` : event `ui-event-2026-05-15T002700Z-a11y-admin-audio-contrast-labels` appendé.
- `scripts/autoheal/autoheal_rules.jsonl` : `AH-2026-05-15-A11Y-ADMIN-AUDIO-CONTRAST-LABELS-v35_1_8` appendé. `detect_recurrence.sh` PASS, `entries=1985`.

## Rollback
`git restore -- src/features/audio-center/AudioCenterPage.tsx src/__tests__/features/audio-center/AudioCenterA11yContrast.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_ADMIN_AUDIO_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-15_ADMIN_AUDIO_GATE_EXPANSION`
