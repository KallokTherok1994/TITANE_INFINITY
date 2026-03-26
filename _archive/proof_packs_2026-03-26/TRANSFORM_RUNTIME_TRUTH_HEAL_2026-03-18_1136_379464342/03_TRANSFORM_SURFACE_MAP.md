# TRANSFORM SURFACE MAP

## Mount path
- Primary: TitanePage (/titane) → tab "transformation" → TransformationSection (from src/components/sections/)
- Secondary: EvoPage (/evo or /titane section) → tab "transformation" → inline EvoPage TransformationSection (cognitive milestones, different component)

| Surface | Visible? | Mounted? | Source | Backend? | Truth State |
|---|---|---|---|---|---|
| Page shell / tab | YES | YES | TitanePage tab routing | NO | PROVEN_RUNTIME |
| DISPLAY_ONLY header label | YES | YES | hardcoded in TransformationRoadmap.tsx:98 | NO | STATIC_ONLY (correctly disclosed) |
| Roadmap de Transformation (TransformationRoadmap) | YES | YES | generateMockMilestones() — static | NO | STATIC_ONLY (disclosed) |
| Milestone cards (v25–v30) | YES | YES | static hardcoded | NO | STATIC_ONLY — post-patch: OUTDATED→FIXED for v28/v29 |
| Progress bars | YES | YES | static hardcoded | NO | STATIC_ONLY |
| Status filters (all/complété/en cours/planifié/futur) | YES | YES | local state filter | NO | PROVEN_RUNTIME (filter works) |
| Milestone detail panel | YES | YES | local state | NO | PROVEN_RUNTIME |
| Roadmap stats card | YES | YES | computed from static milestones | NO | STATIC_ONLY |
| Lignes d'Évolution (Cognitif/Social/Technique) | YES | YES | hardcoded labels | NO | STATIC_ONLY |
| Paliers Franchis | YES | YES | hardcoded TMetric list | NO | OUTDATED (v25 only) → FIXED (v25–v28) + disclosed |
| Source disclosure label (Paliers Franchis) | NO (pre-patch) | NO | absent | NO | MISSING → ADDED |
| Error / loading / empty state | NO | NO | absent | — | NOT_APPLICABLE (no backend) |
| EvoPage inline TransformationSection | YES | YES | hardcoded cognitive milestones | NO | STATIC_ONLY (different domain, not version roadmap) |

## H1: TRANSFORM_RUNTIME_FAILURE — ELIMINATED
Route mounts correctly. Tab routing works. No component crash.

## H2: TRANSFORM_STATIC_ROADMAP — CONFIRMED
Page is fully static. No backend invoke. DISPLAY_ONLY correctly marked.

## H3: TRANSFORM_SOURCE_MISMATCH — PARTIAL
EvoPage inline TransformationSection uses different static source (cognitive evolution themes vs version roadmap). Not a mismatch between live/static, but a conceptual surface mismatch. Classification: STATIC_ONLY for both, different domains.

## H4: TRANSFORM_SERVICE_OR_INVOKE_FAILURE — ELIMINATED
No service or invoke is expected. Static roadmap design confirmed.

## H5: TRANSFORM_OUTDATED_SCHEMA — ELIMINATED
No schema drift — no interface change needed.

## H6: TRANSFORM_OUTDATED_UI — CONFIRMED AND FIXED
- v28 features listed Claude (aspirational) instead of Ollama+Gemini (actual)
- v29 listed as planned/0% while audio stack is substantively implemented
- Paliers Franchis frozen at v25.3 while repo is at v28.0

## H7: TRANSFORM_FALLBACK_LYING — PARTIAL
Paliers Franchis implied "current" version truth while capped at v25.3. Fixed by adding v26–v28 and disclosure.
