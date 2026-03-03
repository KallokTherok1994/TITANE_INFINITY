#!/usr/bin/env bash
set -euo pipefail
: "${PROOF_PACK:?missing PROOF_PACK}"
: "${BUILD_CMD:?missing BUILD_CMD}"
bash scripts/lib/run_x3.sh "$BUILD_CMD" "$PROOF_PACK/10_BUILD_X3.log"
