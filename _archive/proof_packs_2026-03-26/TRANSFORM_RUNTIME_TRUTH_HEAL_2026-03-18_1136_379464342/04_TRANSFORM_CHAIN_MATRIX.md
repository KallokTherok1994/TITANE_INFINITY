# TRANSFORM CHAIN MATRIX

| Surface | UI source | hook/store | service | invoke | rust cmd | backend module | source authority | response shape | live/static | freshness | truth status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Roadmap cards (v25–v30) | TransformationRoadmap.tsx generateMockMilestones() | none | none | NONE | NONE | NONE | curated manual | Milestone[] hardcoded | STATIC | DISPLAY_ONLY (disclosed) | STATIC_ONLY — FIXED milestones |
| Status filters | React.useState | none | none | NONE | NONE | NONE | — | string | STATIC | n/a | PROVEN_RUNTIME |
| Milestone detail panel | React.useState | none | none | NONE | NONE | NONE | — | Milestone object | STATIC | n/a | PROVEN_RUNTIME |
| Paliers Franchis | TransformationSection.tsx JSX | none | none | NONE | NONE | NONE | curated manual | TMetric[] hardcoded | STATIC | DISPLAY_ONLY (added) | STATIC_ONLY — FIXED to v28 |
| Lignes d'Évolution | TransformationSection.tsx JSX | none | none | NONE | NONE | NONE | curated manual | hardcoded | STATIC | n/a | STATIC_ONLY |
| EvoPage cognitive milestones | EvoPage.tsx inline | none | none | NONE | NONE | NONE | curated coaching | hardcoded | STATIC | n/a | STATIC_ONLY (different domain) |

## Summary
No live IPC chain exists for Transform. All data is static/curated. This is by design (DISPLAY_ONLY). The truth issue is exclusively outdatedness of the curated data vs real code state.
