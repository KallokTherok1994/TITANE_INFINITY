# P1.14d — AUTOHEAL UPDATE

## NO_AUTOHEAL_UPDATE_NEEDED

Same rationale as P1.14c. An autoheal rule for absent env vars would violate S6:
> Never add an autoheal rule that hides missing env, toggle mismatch, auth mismatch, remote write failure, or coherence uncertainty.

Missing TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, OPTION1_SYNC_ENABLED cannot and should not be hidden by autoheal. The correct behavior is honest BLOCKED_ENV classification.
