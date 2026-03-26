# RUNTIME TARGET TRUTH

Observed runtime divergence evidence:
- Forced debug-target run previously showed `asset not found: index.html` at `tauri://localhost/#/chat` (surface failure unrelated to IPC shape).
- Default desktop proof run used embedded assets path (`sourceMode: embedded`) and mounted chat UI.

Important distinction:
- Missing selector failures in debug-target run were tied to missing asset surface, not to payload contract shape.
- Active product path with mounted chat UI was separately validated post-fix.

Status: PASS
