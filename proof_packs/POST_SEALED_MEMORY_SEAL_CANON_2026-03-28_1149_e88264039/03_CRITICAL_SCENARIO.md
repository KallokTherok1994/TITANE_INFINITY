# Critical Scenario (Primary)

Token: NEBULA-DELTA-7429

Steps:
1. Write memory: explicitly store token via the real memory path.
2. Persist boundary: restart app or end session to drop short-term context.
3. Recall: ask “What is my secret token?” with no other cues.
4. Inject: confirm memory envelope injection if trace available.
5. Consume: model uses token in response.
6. Answer: response must contain exact token.

Anti-false-positive guards:
- Ensure token is not in recent chat context.
- Ensure no UI label or prompt shows the token.
- Verify retrieval is from memory store, not local prompt leakage.
