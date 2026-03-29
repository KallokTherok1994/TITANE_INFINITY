# 10_X3_RUNS

## X3 NOT EXECUTABLE

External sync is not runnable without TURSO env vars. X3 subset cannot be completed honestly.

### Would-be X3 (if config present):
1. Write test event → sync_now → verify external write
2. Readback from external → compare event id + payload
3. Repeat 3x to confirm repeatability

### Current State:
- Run 1: SKIPPED (no config)
- Run 2: SKIPPED (no config)
- Run 3: SKIPPED (no config)

## X3 Status
**BLOCKED** — cannot execute without external sync prerequisites.

## Local X3 (Backup)
Local LTM baseline was verified via cargo test (69/69 PASS). This is a local-only proof, not an external sync proof.
