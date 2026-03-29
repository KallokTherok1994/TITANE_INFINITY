# KNOWN_LIMITS

1. This lock adds a compatibility layer; it does not replace existing provider runtime entrypoints.
2. The adapter registry is proven by focused tests, not by end-to-end orchestrator integration.
3. The repo worktree remains heavily dirty outside this lock.
4. Doctrine conflict remains unresolved: repo authority is still online-first governed with mandatory local fallback.
