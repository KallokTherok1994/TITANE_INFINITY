# 23_PATCH_PLAN
1. Add bounded artifact intent/routing module (types + classifier + contract + manifest + anti-lie).
2. Wire ConversationSection send flow to route non-answer intents through this contract.
3. Keep save/export patch untouched.
4. Surface manifest id in runtime panel for state coherence.
5. Add unit tests for classifier, route blocking, manifest creation, anti-lie.
