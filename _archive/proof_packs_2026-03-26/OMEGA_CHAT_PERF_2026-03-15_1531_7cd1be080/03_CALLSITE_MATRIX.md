# CALLSITE MATRIX

| ID | File | Function | Ring | Status | Stream? | Retry | Timeout | Profile? | Stop Reason? |
|----|------|----------|------|--------|---------|-------|---------|----------|-------------|
| C1 | chatEngine.commands.ts | generateResponse | R3/R4 | ACTIVE | NO | 0 (secureInvoke) | 52s (BALANCED) | YES (forwarded) | YES |
| C2 | chatEngine.commands.ts | streamResponse | R3/R4 | ACTIVE | YES | 0 (secureInvoke) | 52s (BALANCED) | YES (forwarded) | YES (done-chunk) |
| C3 | chat_engine/mod.rs | generate_response | R2/R3 | ACTIVE | NO | max_retry_chain=1 | memory=3s + total=52s | YES (resolved) | YES |
| C4 | chat_engine/mod.rs | stream_response | R2/R3 | ACTIVE | YES | max_retry_chain=1 | memory=3s + total=52s | YES (resolved) | YES (done-chunk) |
| C5 | chatEngine.commands.dynamic.ts | (unknown) | R3/R4 | SUSPECT | ? | ? | ? | NO | NO |
| C6 | serviceInvoker.ts | invokeWithRetry | R3 | ACTIVE (other cmds) | NO | 3 default | 30s default | NO | NO |

Note: C5 requires follow-up audit. It is not used by the canonical chat path examined here.
