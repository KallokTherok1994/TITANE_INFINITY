# UI Truth Boundary

Rule: No UI-visible provider/mode/fallback/degraded truth may originate from non-canonical fields.

Current status:
- App.tsx does not directly render provider/mode labels.
- BackendDownIndicator + readiness flags exist and must be fed by canonical runtime signals.
- No proven violation in this cycle; monitor if UI truth is derived from non-canonical sources.
