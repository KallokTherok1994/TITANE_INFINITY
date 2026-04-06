# 22_NEXT_LOCK_DECISION
Selected single lock for this cycle:
- ARTIFACT_ROUTE_MISSING

Why:
- Prior run already fixed save truth.
- Remaining immediate causal break: chat could detect little/nothing about file intent and had no bounded route contract from prompt -> artifact action -> manifest/blocked editor state.

Patch scope locked to:
- intent classification
- artifact action contract
- route resolution
- canonical manifest creation
- anti-lie validation
