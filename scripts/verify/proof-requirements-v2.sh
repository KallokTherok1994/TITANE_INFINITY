#!/usr/bin/env bash
set -euo pipefail

ROOT="docs/_evidence/program_max_iq_20260227_151711"

if [[ ! -d "$ROOT" ]]; then
  echo "FAIL: missing proof root $ROOT"
  exit 2
fi

required_master=(
  "00_PROGRAM_PLAN.md"
  "03_PHASE_MAP.md"
  "04_GATES_MASTER_STATUS.md"
  "05_TEST_RUNS_X3_MASTER.md"
  "08_ROLLBACK_MASTER.md"
  "09_FINAL_VERDICT.md"
)

for file in "${required_master[@]}"; do
  if [[ ! -f "$ROOT/$file" ]]; then
    echo "FAIL: missing master proof file $ROOT/$file"
    exit 2
  fi
done

for phase in I J K L M N O P Q; do
  PHASE_DIR="docs/_evidence/p${phase}_20260227_151711"
  if [[ ! -d "$PHASE_DIR" ]]; then
    echo "FAIL: missing phase directory $PHASE_DIR"
    exit 2
  fi

  for base in 00_PLAN.md 04_GATES_STATUS.md 05_TEST_RUNS_X3.md 07_ROLLBACK.md 08_VERDICT.md; do
    if [[ ! -f "$PHASE_DIR/$base" ]]; then
      echo "FAIL: missing phase proof file $PHASE_DIR/$base"
      exit 2
    fi
  done
done

echo "PASS: proof requirements v2 satisfied"
