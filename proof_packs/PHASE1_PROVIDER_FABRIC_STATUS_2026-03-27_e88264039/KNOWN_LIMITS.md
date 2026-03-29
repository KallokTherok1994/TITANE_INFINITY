# KNOWN_LIMITS

1. This lock does not change provider execution order, fallback order, or request routing logic.
2. Cloud provider availability remains `null` in the new fabric status surface until those providers are actually loaded; this is intentional truthfulness, not a missing implementation bug.
3. The adapter registry is still not the single runtime execution surface for the orchestrator.
4. Doctrine conflict remains unresolved outside this technical lock.
