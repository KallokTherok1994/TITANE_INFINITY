# P3-4 CODE CHANGES

## Scope

Ring 4 only. IPC response extended to include ProviderDecisionMeta under `meta`.

## Notes

- No routing or fallback changes.
- Existing IPC fields preserved.
- Meta is always present (fallback to ReasonCode::Unknown if missing).
