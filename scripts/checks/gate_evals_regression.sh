#!/usr/bin/env bash
set -euo pipefail
: "${PROOF_PACK:?missing PROOF_PACK}"
: "${EVAL_CMD:?missing EVAL_CMD}"
bash scripts/lib/run_x3.sh "$EVAL_CMD" "$PROOF_PACK/11_EVALS_X3.log"
