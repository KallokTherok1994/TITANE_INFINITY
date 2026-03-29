# 07_EXTERNAL_SYNC_QUALIFICATION_SPEC

## Objective
Determine whether external sync can be runtime-proven in this environment.

## Qualification Criteria
External sync is QUALIFIED only if ALL are true:
1. TURSO_DATABASE_URL is set and valid
2. TURSO_AUTH_TOKEN is set and valid
3. External service is reachable
4. Write → readback → coherence verified
5. X3 runs confirm repeatability

## Current Qualification Result
**NOT QUALIFIED** — criterion 1 and 2 not met.

## BLOCKED_ENV Contract
When external sync config is absent, the system must:
- Classify SYNC_MISSING_CONFIG (not an error, a boundary)
- Report last_sync_ok = false
- Do NOT claim sync success
- Do NOT fake external state
- Allow manual sync via local_folder/s3_private backends

## Requalification Path
To requalify after configuration:
1. Set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
2. Restart this cycle from SCENARIO 1
3. Execute SCENARIO 3 (external write)
4. Execute SCENARIO 4 (readback)
5. Execute SCENARIO 5 (x3 subset)
6. If all pass: EXTERNAL_SYNC_RUNTIME_PROVEN
