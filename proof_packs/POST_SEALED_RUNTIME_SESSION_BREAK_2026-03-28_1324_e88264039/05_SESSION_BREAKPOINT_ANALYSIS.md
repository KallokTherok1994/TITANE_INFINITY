# SESSION BREAKPOINT ANALYSIS

Primary breakpoint:
- BREAK_AT_SESSION_PERSIST_RUN

Evidence:
- run1 and run3: "invalid session id" while executing sync JS and during navigation.
- run2: completed with PASS_MEMORY_REAL.

Conclusion:
- session stability is the narrowest lock; provider execution is no longer the primary blocker.
