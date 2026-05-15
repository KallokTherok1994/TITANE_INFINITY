# ROLLBACK — A11Y admin-audio + gate 33→34

```bash
git restore -- \
  src/features/audio-center/AudioCenterPage.tsx \
  src/__tests__/features/audio-center/AudioCenterA11yContrast.test.tsx \
  e2e/a11y/wcag-aa-core.spec.ts \
  UI_SURFACE_MAP.md \
  docs/CARTOGRAPHY_COMPLETE.md \
  registry/ui-events.jsonl \
  scripts/autoheal/autoheal_rules.jsonl \
  reports/A11Y_REDUCTION_2026-05-15_ADMIN_AUDIO_GATE_EXPANSION.md \
  proof_packs/A11Y_REDUCTION_2026-05-15_ADMIN_AUDIO_GATE_EXPANSION
```

Effet : retour aux tokens Tailwind antérieurs (`bg-cyan-600`, `text-purple-400`, `text-neutral-500`), aux sliders sans `aria-label`, et au gate `SURFACES.length === 33`. Le baseline aggregate reste 30.
