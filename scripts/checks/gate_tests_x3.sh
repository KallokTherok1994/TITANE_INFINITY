#!/usr/bin/env bash
set -euo pipefail
: "${PROOF_PACK:?missing PROOF_PACK}"
: "${TEST_CMD:?missing TEST_CMD}"
bash scripts/lib/run_x3.sh "$TEST_CMD" "$PROOF_PACK/09_TESTS_X3.log"
