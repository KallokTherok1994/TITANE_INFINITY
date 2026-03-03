#!/usr/bin/env bash
set -euo pipefail
: "${PROOF_PACK:?missing PROOF_PACK}"
bash scripts/lib/run_x3.sh "bash scripts/checks/check_no_real_writes.sh" "$PROOF_PACK/12_REDTTEAM_X3.log"
