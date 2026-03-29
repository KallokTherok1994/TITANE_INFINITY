# Rollback (Archive Resolution)

Original untracked cluster content is not recoverable from current proof packs.

Available context-only source (if present):
- recovered_frontend_supervision_context.md (plan document)

External recovery requirement:
- A backup or copy of the original untracked frontend supervision/telemetry files.

Rehydrate guidance (if external backup exists):
- Store recovered files in a future proof pack only (do not restore into src/ or src-tauri/ during post-seal state).
