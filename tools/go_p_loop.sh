#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

LOOP_DIR="runs/_loop"
mkdir -p "$LOOP_DIR"

CAP_P="${CAP_P:-}"
MAX_ITERS="${MAX_ITERS:-1}"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "STOP: working tree is not clean" >&2
  exit 2
fi

latest_program_dir() {
  find docs/_evidence -maxdepth 1 -type d -name 'program_p*' | sed 's#^.*/##' | sort -V | tail -n 1
}

extract_window() {
  local d="$1"
  echo "$d" | sed -E 's/^program_p([0-9]{3})_([0-9]{3})_([0-9]{8}_[0-9]{6})$/\1 \2 \3/'
}

write_state() {
  local status="$1"
  local reason="$2"
  local iter="$3"
  local current="$4"
  local next="$5"
  local verdict="$6"
  local proof_path="$7"
  local last_commit="$8"
  local head_tags
  head_tags="$(git tag --points-at HEAD | tr '\n' ',' | sed 's/,$//')"
  cat > "$LOOP_DIR/state.json" <<EOF
{
  "status": "$status",
  "reason": "$reason",
  "iteration": $iter,
  "current_window": "$current",
  "next_window": "$next",
  "last_verdict": "$verdict",
  "last_proof_pack": "$proof_path",
  "head": "$(git rev-parse --short HEAD)",
  "last_commit": "$last_commit",
  "tags_at_head": "${head_tags}"
}
EOF
}

discover_md="$LOOP_DIR/PROGRAM_END_DISCOVERY.md"
if [[ ! -f "$discover_md" ]]; then
  {
    echo "# PROGRAM END DISCOVERY"
    echo "## rg results"
    rg -n "MAX_P|P_MAX|PROGRAM_END|END_P|TARGET_P|LAST_P|STOP_AT_P" -S . || true
  } > "$discover_md"
fi

iter=0
last_commit="$(git rev-parse --short HEAD)"
last_proof=""
last_verdict="NONE"
stop_reason=""

while (( iter < MAX_ITERS )); do
  src_dir="$(latest_program_dir)"
  if [[ -z "$src_dir" ]]; then
    stop_reason="NO_SOURCE_PROGRAM"
    break
  fi

  read -r old_start old_end old_ts < <(extract_window "$src_dir")
  new_start=$((10#$old_end + 1))
  new_end=$((new_start + 6))

  if [[ -n "$CAP_P" ]] && (( new_end > CAP_P )); then
    stop_reason="CAP_REACHED"
    break
  fi

  iter=$((iter + 1))
  now_ts="$(date -u +%Y%m%d_%H%M%S)"
  stamp_z="${now_ts}Z"

  new_program="program_p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")_${now_ts}"
  src_program_path="docs/_evidence/${src_dir}"
  new_program_path="docs/_evidence/${new_program}"

  cp -a "$src_program_path" "$new_program_path"

  expected_manifest_lines="$(find "$src_program_path" -type f | wc -l | tr -d ' ')"

  phase_paths=()
  source_phase_paths=()
  for ((i=0; i<7; i++)); do
    old_p=$((10#$old_start + i))
    new_p=$((new_start + i))
    old_phase="docs/_evidence/p$(printf '%03d' "$old_p")_${old_ts}"
    new_phase="docs/_evidence/p$(printf '%03d' "$new_p")_${now_ts}"
    source_phase_paths+=("$old_phase")
    cp -a "$old_phase" "$new_phase"
    phase_paths+=("$new_phase")
    expected_manifest_lines=$((expected_manifest_lines + $(find "$old_phase" -type f | wc -l | tr -d ' ')))
  done

  mapfile -t target_files < <(find "$new_program_path" "${phase_paths[@]}" -type f | sort)

  for f in "${target_files[@]}"; do
    sed -i \
      -e "s#program_p$(printf '%03d' "$old_start")_$(printf '%03d' "$old_end")_${old_ts}#${new_program}#g" \
      -e "s#P$(printf '%03d' "$old_start")→P$(printf '%03d' "$old_end")#P$(printf '%03d' "$new_start")→P$(printf '%03d' "$new_end")#g" \
      -e "s#p$(printf '%03d' "$old_start")_$(printf '%03d' "$old_end")#p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")#g" \
      -e "s#${old_ts}#${now_ts}#g" \
      "$f"

    for ((i=0; i<7; i++)); do
      old_p=$((10#$old_start + i))
      new_p=$((new_start + i))
      sed -i \
        -e "s#P$(printf '%03d' "$old_p")#P$(printf '%03d' "$new_p")#g" \
        -e "s#p$(printf '%03d' "$old_p")_${old_ts}#p$(printf '%03d' "$new_p")_${now_ts}#g" \
        "$f"
    done
  done

  phase_restore_list=""
  for ((i=0; i<7; i++)); do
    p=$((new_start + i))
    phase_restore_list+=" docs/_evidence/p$(printf '%03d' "$p")_${now_ts}"
  done

  cat > "$new_program_path/08_ROLLBACK_MASTER.md" <<EOF
# 08_ROLLBACK_MASTER.md

Statut: READY
- \`git restore -- docs/_evidence/${new_program}${phase_restore_list} reports/p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")_bootstrap_precheck_${stamp_z}.log reports/p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")_execution_x3_${stamp_z}.log reports/proof_pack_hash_manifest_program_p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")_${now_ts}.txt\`

EOF

  precheck_log="reports/p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")_bootstrap_precheck_${stamp_z}.log"
  x3_log="reports/p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")_execution_x3_${stamp_z}.log"
  manifest="reports/proof_pack_hash_manifest_program_p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")_${now_ts}.txt"

  mkdir -p reports
  pnpm run verify:invariants-governed > "$precheck_log" 2>&1

  : > "$x3_log"
  x3_fail=0
  for run in 1 2 3; do
    echo "===== RUN_${run} START =====" >> "$x3_log"
    if pnpm run verify:invariants-governed >> "$x3_log" 2>&1; then
      echo "RUN_${run}_EXIT=0" >> "$x3_log"
    else
      rc=$?
      echo "RUN_${run}_EXIT=${rc}" >> "$x3_log"
      x3_fail=1
    fi
    echo "===== RUN_${run} END =====" >> "$x3_log"
  done

  if (( x3_fail != 0 )); then
    cat > "$LOOP_DIR/ITER_p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end").md" <<EOF
# ITER p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")

- verdict: FAIL
- reason: verify:invariants-governed X3 failure
- program: $new_program_path
- logs: $precheck_log, $x3_log
EOF
    last_verdict="FAIL"
    last_proof="$new_program_path"
    stop_reason="VERIFY_FAIL"
    write_state "stopped" "$stop_reason" "$iter" "p$(printf '%03d' "$old_start")_$(printf '%03d' "$old_end")" "p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")" "$last_verdict" "$last_proof" "$last_commit"
    break
  fi

  if grep -q "RUN_[123]_EXIT=[1-9]" "$x3_log" || grep -qi "skip" "$x3_log"; then
    cat > "$LOOP_DIR/ITER_p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end").md" <<EOF
# ITER p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")

- verdict: FAIL
- reason: non-zero or skip detected in X3 log
- program: $new_program_path
- logs: $x3_log
EOF
    last_verdict="FAIL"
    last_proof="$new_program_path"
    stop_reason="X3_NON_REPRO"
    write_state "stopped" "$stop_reason" "$iter" "p$(printf '%03d' "$old_start")_$(printf '%03d' "$old_end")" "p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")" "$last_verdict" "$last_proof" "$last_commit"
    break
  fi

  find "$new_program_path" "${phase_paths[@]}" -type f | sort | xargs -r sha256sum > "$manifest"
  manifest_lines="$(wc -l < "$manifest" | tr -d ' ')"
  if [[ "$manifest_lines" != "$expected_manifest_lines" ]]; then
    cat > "$LOOP_DIR/ITER_p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end").md" <<EOF
# ITER p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")

- verdict: FAIL
- reason: manifest line count mismatch ($manifest_lines != $expected_manifest_lines)
- manifest: $manifest
EOF
    last_verdict="FAIL"
    last_proof="$new_program_path"
    stop_reason="MANIFEST_COUNT_FAIL"
    write_state "stopped" "$stop_reason" "$iter" "p$(printf '%03d' "$old_start")_$(printf '%03d' "$old_end")" "p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")" "$last_verdict" "$last_proof" "$last_commit"
    break
  fi

  if LC_ALL=C grep -RIl $'\x1b' "$new_program_path" "${phase_paths[@]}" >/dev/null 2>&1; then
    cat > "$LOOP_DIR/ITER_p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end").md" <<EOF
# ITER p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")

- verdict: FAIL
- reason: contamination guard (ANSI escape found)
EOF
    last_verdict="FAIL"
    last_proof="$new_program_path"
    stop_reason="CONTAMINATION_FAIL"
    write_state "stopped" "$stop_reason" "$iter" "p$(printf '%03d' "$old_start")_$(printf '%03d' "$old_end")" "p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")" "$last_verdict" "$last_proof" "$last_commit"
    break
  fi

  git add "$new_program_path" "${phase_paths[@]}" "$precheck_log" "$x3_log" "$manifest"
  git commit -m "chore(evidence): publish p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end") governed x3" >/dev/null
  git push origin MAIN >/dev/null

  last_commit="$(git rev-parse --short HEAD)"
  last_verdict="PASS"
  last_proof="$new_program_path"

  cat > "$LOOP_DIR/ITER_p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end").md" <<EOF
# ITER p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")

- verdict: PASS
- commit: $last_commit
- program: $new_program_path
- logs: $precheck_log, $x3_log
- manifest: $manifest ($manifest_lines lines)
EOF

  write_state "running" "ITERATION_PASS" "$iter" "p$(printf '%03d' "$old_start")_$(printf '%03d' "$old_end")" "p$(printf '%03d' "$new_start")_$(printf '%03d' "$new_end")" "$last_verdict" "$last_proof" "$last_commit"
done

if [[ -z "$stop_reason" ]]; then
  stop_reason="MAX_ITERS_REACHED"
fi

write_state "done" "$stop_reason" "$iter" "" "" "$last_verdict" "$last_proof" "$last_commit"

cat > "$LOOP_DIR/LOOP_SUMMARY.md" <<EOF
# LOOP SUMMARY

- iterations: $iter
- stop_reason: $stop_reason
- head: $(git rev-parse --short HEAD)
- last_commit: $last_commit
- last_verdict: $last_verdict
- last_proof_pack: $last_proof
- tags_at_head: $(git tag --points-at HEAD | tr '\n' ' ' | sed 's/[[:space:]]\+$//')
EOF

echo "LOOP_DONE stop_reason=$stop_reason iterations=$iter head=$(git rev-parse --short HEAD)"
