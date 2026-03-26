# HYPOTHESES H1-H8

H1 Payload shape mismatch on active chat path: PASS
- Confirmed by pre-fix targeted unit failure (`wraps conversation_generate payload under args`).

H2 Rust command signature drift: FAIL
- Rust expectation for `args` is consistent with contract.

H3 IPC contract schema drift: FAIL
- Schema already enforces `{ args: ... }`.

H4 Wrong callsite in active chat route: FAIL
- Active call chain was correctly identified and patched at canonical wrapper boundary.

H5 Runtime target divergence impacted diagnosis: PASS
- Confirmed by debug-target asset-not-found vs embedded default path.

H6 Multiple callsites causing re-break: FAIL
- No additional `tauriClient.conversationGenerate(...)` usages in `src/**`.

H7 Protector fallback masks root issue: PASS
- Error classification (`IPC_INVALID_ARGS` / clamped reason) is consistent with payload mismatch.

H8 Regression risk after fix remains high: FAIL
- Dedicated unit assertion now passes; wrapper normalization centralizes protection.

Overall hypothesis verdict: PASS
