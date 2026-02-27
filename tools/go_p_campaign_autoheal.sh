#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BATCH_ITERS="${BATCH_ITERS:-10}"
CAMPAIGN_MAX_BATCHES="${CAMPAIGN_MAX_BATCHES:-50}"
AUTOHEAL_ENABLED="${AUTOHEAL_ENABLED:-1}"
AUTOHEAL_MAX_ATTEMPTS_PER_WINDOW="${AUTOHEAL_MAX_ATTEMPTS_PER_WINDOW:-2}"
STOP_AT_P_END="${STOP_AT_P_END:-}"
RESUME_MODE=1
FROM_WINDOW=""
MAX_WINDOWS=""
DRY_RUN=0

LOOP_DIR="runs/_loop"
AUTOHEAL_ROOT="$LOOP_DIR/autoheal"
mkdir -p "$LOOP_DIR" "$AUTOHEAL_ROOT"

CURRENT_STEP="init"
LAST_WINDOW=""
CHECKPOINT_FILE="$LOOP_DIR/checkpoint.json"
INTERRUPT_LOG="$LOOP_DIR/interrupt.log"
RUNTIME_DIR="${TMPDIR:-/tmp}/titane_go_p_campaign"
mkdir -p "$RUNTIME_DIR"
CHECKPOINT_FILE="$RUNTIME_DIR/checkpoint_${USER:-user}.json"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --resume)
      RESUME_MODE=1
      shift
      ;;
    --from)
      FROM_WINDOW="${2:-}"
      shift 2
      ;;
    --max-windows)
      MAX_WINDOWS="${2:-}"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 64
      ;;
  esac
done

atomic_write() {
  local target="$1"
  local tmp
  tmp="${target}.tmp.$$"
  cat > "$tmp"
  mv "$tmp" "$target"
}

checkpoint_write() {
  local step="$1"
  local window="$2"
  CURRENT_STEP="$step"
  LAST_WINDOW="$window"
  atomic_write "$CHECKPOINT_FILE" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "pid": $$,
  "step": "$CURRENT_STEP",
  "last_window": "$LAST_WINDOW",
  "head": "$(git rev-parse --short HEAD)"
}
EOF
}

handle_interrupt() {
  local sig="$1"
  {
    echo "ts=$(date -u +%Y-%m-%dT%H:%M:%SZ) sig=$sig pid=$$ step=$CURRENT_STEP window=$LAST_WINDOW caller=${FUNCNAME[1]:-main}"
  } >> "$INTERRUPT_LOG"
  checkpoint_write "interrupted_${sig}" "$LAST_WINDOW"
  exit 130
}

trap 'handle_interrupt SIGINT' INT
trap 'handle_interrupt SIGTERM' TERM

latest_program_dir() {
  find docs/_evidence -maxdepth 1 -type d -name 'program_p*' | sed 's#^.*/##' | sort -V | tail -n1
}

next_window_from_latest() {
  local latest
  latest="$(latest_program_dir)"
  python3 - "$latest" <<'PY'
import re,sys
latest=sys.argv[1]
m=re.match(r'^program_p([0-9]+)_([0-9]+)_([0-9_]+)$',latest)
if not m:
    print('')
    raise SystemExit(0)
ns=int(m.group(2))+1
ne=ns+6
print(f"p{ns}_{ne}")
PY
}

if ! git diff --quiet || ! git diff --cached --quiet; then
  changed="$(git status --porcelain | awk '{print $2}')"
  if [[ -n "$changed" ]] && echo "$changed" | rg -vq '^runs/_loop/'; then
    echo "STOP: dirty tree at campaign start" >&2
    exit 2
  fi
fi

now_utc() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

latest_iter_slug_from_state() {
  python3 - <<'PY'
import json, pathlib
p=pathlib.Path('runs/_loop/state.json')
if not p.exists():
    print('')
    raise SystemExit(0)
obj=json.loads(p.read_text(encoding='utf-8'))
slug=(obj.get('next_window') or obj.get('current_window') or '').strip()
print(slug)
PY
}

latest_iter_file() {
  find "$LOOP_DIR" -maxdepth 1 -type f -name 'ITER_p*.md' | sort -V | tail -n 1
}

latest_iter_slug() {
  local f
  f="$(latest_iter_file)"
  if [[ -n "$f" ]]; then
    basename "$f" | sed -E 's/^ITER_(p[0-9]+_[0-9]+)\.md$/\1/'
  else
    echo ""
  fi
}

read_stop_reason() {
  awk -F': ' '/^- stop_reason:/ {print $2; exit}' "$LOOP_DIR/LOOP_SUMMARY.md" 2>/dev/null || true
}

read_last_proof_pack() {
  awk -F': ' '/^- last_proof_pack:/ {print $2; exit}' "$LOOP_DIR/LOOP_SUMMARY.md" 2>/dev/null || true
}

is_stop_the_line() {
  local r="$1"
  [[ "$r" == STOP_THE_LINE_* || "$r" == *FAIL* || "$r" == *BLOCKED* ]]
}

batch_range_from_new_iters() {
  local files="$1"
  local first last
  first="$(echo "$files" | head -n1 | sed -E 's#.*ITER_(p[0-9]+_[0-9]+)\.md#\1#')"
  last="$(echo "$files" | tail -n1 | sed -E 's#.*ITER_(p[0-9]+_[0-9]+)\.md#\1#')"
  if [[ -n "$first" && -n "$last" ]]; then
    echo "${first#p}-${last#p}"
  else
    echo "unknown"
  fi
}

seal_loop_artifacts() {
  local mode="$1"
  local extra_msg="$2"

  local new_iters changed
  new_iters="$(git status --porcelain | awk '/\?\? runs\/\_loop\/ITER_p[0-9]+_[0-9]+\.md/{print $2}')"
  changed="$(git status --porcelain | awk '/runs\/\_loop\//{print $2}')"

  if [[ -z "$changed" ]]; then
    return 0
  fi

  local add_list=()
  while IFS= read -r f; do
    [[ -n "$f" ]] && add_list+=("$f")
  done < <(echo "$changed" | sort -u)

  git add "${add_list[@]}"

  local msg
  if [[ "$mode" == "autoheal" ]]; then
    msg="docs(autoheal): heal ${extra_msg}"
  else
    local range
    range="$(batch_range_from_new_iters "$new_iters")"
    msg="docs(loop): record batch ${range}"
  fi

  git commit -m "$msg" >/dev/null
  git push origin MAIN >/dev/null

  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "STOP: tree not clean after sealing" >&2
    exit 3
  fi
}

recover_pending_loop_artifacts() {
  if git diff --quiet && git diff --cached --quiet; then
    return 0
  fi
  local changed
  changed="$(git status --porcelain | awk '{print $2}')"
  if [[ -z "$changed" ]]; then
    return 0
  fi
  if echo "$changed" | rg -vq '^runs/_loop/'; then
    echo "STOP: dirty tree contains non runs/_loop files" >&2
    return 1
  fi
  seal_loop_artifacts "batch" "resume-recovery"
}

make_autoheal_dirs() {
  local slug="$1"
  local ts="$2"
  local dir="$AUTOHEAL_ROOT/${slug}_${ts}"
  mkdir -p "$dir"
  echo "$dir"
}

capture_autoheal_baseline() {
  local dir="$1"
  {
    echo "# AUTOHEAL BASELINE"
    echo "timestamp: $(now_utc)"
    echo "head: $(git rev-parse --short HEAD)"
    echo "status:"
    git status --porcelain
  } > "$dir/00_BASELINE.md"
  cp -f "$LOOP_DIR/state.json" "$dir/state_before.json" 2>/dev/null || true
  cp -f "$LOOP_DIR/LOOP_SUMMARY.md" "$dir/loop_summary_before.md" 2>/dev/null || true
}

write_rollback_note() {
  local dir="$1"
  {
    echo "# ROLLBACK"
    echo "- git restore -- runs/_loop runs/current"
    echo "- git reset --hard HEAD~1 (si commit autoheal local non poussé)"
  } > "$dir/ROLLBACK.md"
}

apply_fix_contamination() {
  local dir="$1"
  local changed=0

  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    python3 - "$f" <<'PY'
import re,sys,pathlib
p=pathlib.Path(sys.argv[1])
try:
    txt=p.read_text(encoding='utf-8',errors='ignore')
except Exception:
    raise SystemExit(0)
new=txt
new=re.sub(r'\x1b\[[0-9;?]*[ -/]*[@-~]','',new)
new=re.sub(r'\x1b\].*?(\x07|\x1b\\)','',new,flags=re.S)
new=new.replace('\r','')
if new!=txt:
    p.write_text(new,encoding='utf-8')
    print('CHANGED')
PY
    if git diff --quiet -- "$f"; then
      :
    else
      changed=1
    fi
  done < <(find runs/current "$LOOP_DIR" -type f \( -name '*.md' -o -name '*.log' -o -name '*.txt' -o -name '*.json' \) 2>/dev/null)

  echo "$changed" > "$dir/fix_changed.flag"
}

apply_fix_window_target() {
  local dir="$1"
  mkdir -p runs/current
  local latest
  latest="$(find docs/_evidence -maxdepth 1 -type d -name 'program_p*' | sed 's#^.*/##' | sort -V | tail -n1)"
  if [[ -z "$latest" ]]; then
    return 1
  fi
  python3 - "$latest" <<'PY'
import re,sys,pathlib
latest=sys.argv[1]
m=re.match(r'^program_p([0-9]+)_([0-9]+)_([0-9_]+)$',latest)
if not m:
    raise SystemExit(1)
ns=int(m.group(2))+1
ne=ns+6
meta=pathlib.Path('runs/current/.window_meta')
meta.write_text(f"NS={ns}\nNE={ne}\nSOURCE={latest}\n",encoding='utf-8')
wt=pathlib.Path('runs/current/WINDOW_TARGET.md')
wt.write_text("# WINDOW TARGET\n\n"+f"- source: {latest}\n- next_window: p{ns:03d}_{ne:03d}\n",encoding='utf-8')
PY
  cp -f runs/current/.window_meta "$dir/window_meta_after.txt"
  cp -f runs/current/WINDOW_TARGET.md "$dir/WINDOW_TARGET_after.md"
}

apply_fix_secret_tuning() {
  local dir="$1"
  mkdir -p "$dir"
  local hitfile="$dir/secret_hits_raw.txt"
  rg -n "sk-[A-Za-z0-9]{16,}" -S . > "$hitfile" || true

  if [[ ! -s "$hitfile" ]]; then
    echo "NO_HITS" > "$dir/secret_tuning_decision.txt"
    return 0
  fi

  local unsafe
  unsafe="$(awk -F: '{print $1}' "$hitfile" | sort -u | rg '^(src/|src-tauri/|runtime/|package\.json|\.env|config/)' || true)"
  if [[ -n "$unsafe" ]]; then
    echo "REAL_SECRET_SUSPECT" > "$dir/secret_tuning_decision.txt"
    printf '%s\n' "$unsafe" > "$dir/unsafe_paths.txt"
    return 2
  fi

  {
    echo "# SCAN_TUNING"
    echo "- Scope proof-only/docs-only hits"
    echo "- Suggested exclusion candidates: runs/** docs/**"
    echo "- src/ and config/ kept in scope"
  } > "$dir/SCAN_TUNING.md"
  echo "FALSE_POSITIVE_DOCS_ONLY" > "$dir/secret_tuning_decision.txt"
}

apply_fix_real_secret_redact() {
  local dir="$1"
  local hitfile="$dir/secret_hits_raw.txt"
  [[ -f "$hitfile" ]] || rg -n "sk-[A-Za-z0-9]{16,}" -S . > "$hitfile" || true

  local targets
  targets="$(awk -F: '{print $1}' "$hitfile" | sort -u | rg '^(src/|src-tauri/|runtime/|config/|package\.json|.*\.env(\.example)?$)' || true)"
  if [[ -z "$targets" ]]; then
    return 1
  fi

  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    sed -E -i 's/sk-[A-Za-z0-9]{16,}/sk-REDACTED/g' "$f"
  done < <(echo "$targets")

  {
    echo "# ROTATE NOTE"
    echo "Un secret réel a été détecté puis redacted dans le dépôt."
    echo "Action humaine requise: rotation/révocation immédiate des credentials concernés."
  } > "$dir/ROTATE_NOTE.md"
}

apply_fix_nondeterministic_normalized() {
  local dir="$1"
  local x3
  x3="$(find reports -maxdepth 1 -type f -name 'p*_execution_x3_*.log' | sort -V | tail -n1)"
  [[ -n "$x3" ]] || return 1

  grep -q 'RUN_1_EXIT=0' "$x3" || return 1
  grep -q 'RUN_2_EXIT=0' "$x3" || return 1
  grep -q 'RUN_3_EXIT=0' "$x3" || return 1

  sed -E '/[0-9]{8}_[0-9]{6}Z?/d;/^Time /d;/timestamp:/Id' "$x3" > "$dir/x3_normalized.log"
  sha256sum "$x3" > "$dir/raw_hash.txt"
  sha256sum "$dir/x3_normalized.log" > "$dir/normalized_hash.txt"
  {
    echo "# NONDETERMINISM_NOTE"
    echo "- Raw hash and normalized hash recorded."
    echo "- No gate weakening performed; evidence-only normalization note."
  } > "$dir/NONDETERMINISM_NOTE.md"
}

rerun_x3() {
  local dir="$1"
  local x3log="$dir/x3_rerun.log"
  : > "$x3log"
  local fail=0
  for r in 1 2 3; do
    echo "===== RUN_${r} START =====" >> "$x3log"
    if pnpm run verify:invariants-governed >> "$x3log" 2>&1; then
      echo "RUN_${r}_EXIT=0" >> "$x3log"
    else
      echo "RUN_${r}_EXIT=$?" >> "$x3log"
      fail=1
    fi
    echo "===== RUN_${r} END =====" >> "$x3log"
  done
  if (( fail != 0 )); then
    return 1
  fi
  if grep -qi "skip" "$x3log"; then
    return 2
  fi
  return 0
}

autoheal_window() {
  local slug="$1"
  local cause="$2"

  if [[ "$AUTOHEAL_ENABLED" != "1" ]]; then
    return 1
  fi

  local attempt
  for ((attempt=1; attempt<=AUTOHEAL_MAX_ATTEMPTS_PER_WINDOW; attempt++)); do
    local ts dir
    ts="$(date -u +%Y%m%dT%H%M%SZ)"
    dir="$(make_autoheal_dirs "$slug" "$ts")"

    capture_autoheal_baseline "$dir"
    write_rollback_note "$dir"
    {
      echo "# ATTEMPT"
      echo "slug: $slug"
      echo "attempt: $attempt"
      echo "cause: $cause"
      echo "head_before: $(git rev-parse --short HEAD)"
    } > "$dir/01_ATTEMPT.md"

    local fix_kind=""
    local rc=1

    if [[ "$cause" == *CONTAMINATION* ]]; then
      fix_kind="A_CONTAMINATION"
      apply_fix_contamination "$dir" || true
    elif [[ "$cause" == *PARSE_WINDOW* || "$cause" == *WINDOW* ]]; then
      fix_kind="B_WINDOW_DERIVATION"
      apply_fix_window_target "$dir" || true
    elif [[ "$cause" == *SECRET* || "$cause" == *SCAN* ]]; then
      fix_kind="C_OR_D_SECRET"
      if apply_fix_secret_tuning "$dir"; then
        :
      else
        apply_fix_real_secret_redact "$dir" || true
      fi
    elif [[ "$cause" == *X3_NON_REPRO* ]]; then
      fix_kind="E_NON_DETERMINISTIC"
      apply_fix_nondeterministic_normalized "$dir" || true
    else
      fix_kind="A_CONTAMINATION_FALLBACK"
      apply_fix_contamination "$dir" || true
    fi

    if rerun_x3 "$dir"; then
      rc=0
    else
      rc=$?
    fi

    {
      echo "# VERDICT"
      if [[ "$rc" == "0" ]]; then
        echo "result: PASS"
      elif [[ "$rc" == "2" ]]; then
        echo "result: BLOCKED"
        echo "reason: skip detected"
      else
        echo "result: FAIL"
      fi
      echo "fix_kind: $fix_kind"
      echo "head_after: $(git rev-parse --short HEAD)"
    } > "$dir/00_VERDICT.md"

    if [[ "$rc" == "0" ]]; then
      seal_loop_artifacts "autoheal" "${slug} (${fix_kind})"
      return 0
    fi
  done

  return 1
}

campaign_verdict="SAFETY_CAP_REACHED"
campaign_stop_reason="CAMPAIGN_MAX_BATCHES_REACHED"
batches_executed=0
windows_done_total=0
last_window=""
last_commit="$(git rev-parse --short HEAD)"
last_proof=""
autoheal_summary="none"

checkpoint_write "campaign_start" ""

if (( DRY_RUN == 1 )); then
  checkpoint_write "dry_run" ""
  next_candidate="$(next_window_from_latest)"
  atomic_write "$LOOP_DIR/dry_run_plan.md" <<EOF
# DRY RUN PLAN

- timestamp: $(now_utc)
- head: $(git rev-parse --short HEAD)
- next_candidate: ${next_candidate}
- from_window: ${FROM_WINDOW}
- batch_iters: ${BATCH_ITERS}
- max_windows: ${MAX_WINDOWS}
- resume: ${RESUME_MODE}
EOF
  echo "CAMPAIGN_DONE verdict=PASS_DRY_RUN batches=0 stop_reason=DRY_RUN head=$(git rev-parse --short HEAD)"
  exit 0
fi

for ((batch=1; batch<=CAMPAIGN_MAX_BATCHES; batch++)); do
  checkpoint_write "batch_${batch}_start" "$LAST_WINDOW"

  if ! recover_pending_loop_artifacts; then
    campaign_verdict="STOP-THE-LINE"
    campaign_stop_reason="DIRTY_TREE_AT_BATCH_START"
    break
  fi

  if [[ -n "$MAX_WINDOWS" ]]; then
    if (( windows_done_total >= MAX_WINDOWS )); then
      campaign_verdict="DONE"
      campaign_stop_reason="DONE_MAX_WINDOWS"
      break
    fi
  fi

  batches_executed=$batch

  before_iters="$(find "$LOOP_DIR" -maxdepth 1 -type f -name 'ITER_p*.md' | wc -l | tr -d ' ')"

  run_iters="$BATCH_ITERS"
  if [[ -n "$MAX_WINDOWS" ]]; then
    remaining=$((MAX_WINDOWS - windows_done_total))
    if (( remaining < run_iters )); then
      run_iters=$remaining
    fi
  fi
  if (( run_iters <= 0 )); then
    campaign_verdict="DONE"
    campaign_stop_reason="DONE_MAX_WINDOWS"
    break
  fi

  checkpoint_write "batch_${batch}_run" "$LAST_WINDOW"

  if [[ -n "$STOP_AT_P_END" ]]; then
    STOP_AT_P_END="$STOP_AT_P_END" MAX_ITERS="$run_iters" bash tools/go_p_loop.sh
  else
    MAX_ITERS="$run_iters" bash tools/go_p_loop.sh
  fi

  after_iters="$(find "$LOOP_DIR" -maxdepth 1 -type f -name 'ITER_p*.md' | wc -l | tr -d ' ')"
  if (( after_iters >= before_iters )); then
    windows_done_total=$((windows_done_total + after_iters - before_iters))
  fi

  local_reason="$(read_stop_reason)"
  last_proof="$(read_last_proof_pack)"
  last_window="$(latest_iter_slug_from_state)"
  if [[ -z "$last_window" ]]; then
    last_window="$(latest_iter_slug)"
  fi
  checkpoint_write "batch_${batch}_after_run" "$last_window"
  last_commit="$(git rev-parse --short HEAD)"

  if [[ -n "$FROM_WINDOW" ]]; then
    from_end="$(echo "$FROM_WINDOW" | sed -E 's/^p[0-9]+_([0-9]+)$/\1/')"
    cur_end="$(echo "$last_window" | sed -E 's/^p[0-9]+_([0-9]+)$/\1/')"
    if [[ -n "$from_end" && -n "$cur_end" ]] && (( cur_end < from_end )); then
      checkpoint_write "batch_${batch}_skip_before_from" "$last_window"
      continue
    fi
  fi

  if is_stop_the_line "$local_reason"; then
    if [[ "$AUTOHEAL_ENABLED" == "1" ]]; then
      if autoheal_window "$last_window" "$local_reason"; then
        autoheal_summary="healed:${last_window}"
        seal_loop_artifacts "batch" ""
        continue
      fi
      autoheal_summary="failed:${last_window}"
      campaign_verdict="STOP-THE-LINE"
      campaign_stop_reason="BLOCKED_AUTOHEAL_EXHAUSTED"
      break
    fi
    campaign_verdict="STOP-THE-LINE"
    campaign_stop_reason="$local_reason"
    break
  fi

  seal_loop_artifacts "batch" ""
  checkpoint_write "batch_${batch}_sealed" "$last_window"

  if [[ "$local_reason" == "DONE_CAP_REACHED" ]]; then
    campaign_verdict="DONE"
    campaign_stop_reason="DONE_CAP_REACHED"
    break
  fi

  if [[ "$local_reason" == "MAX_ITERS_REACHED" ]]; then
    campaign_verdict="SAFETY_CAP_REACHED"
    campaign_stop_reason="MAX_ITERS_REACHED"
  fi
done

{
  echo "# CAMPAIGN FINAL REPORT"
  echo "- verdict: $campaign_verdict"
  echo "- batches_executed: $batches_executed"
  echo "- stop_reason: $campaign_stop_reason"
  echo "- last_window: $last_window"
  echo "- last_commit: $last_commit"
  echo "- last_proof_pack: $last_proof"
  echo "- autoheal: $autoheal_summary"
  echo "- windows_done_total: $windows_done_total"
  echo "- from_window: $FROM_WINDOW"
  echo "- max_windows: $MAX_WINDOWS"
  echo "- resume_mode: $RESUME_MODE"
  echo "- head_final: $(git rev-parse --short HEAD)"
  echo "- tree_clean: $(if git diff --quiet && git diff --cached --quiet; then echo yes; else echo no; fi)"
} > "$LOOP_DIR/CAMPAIGN_FINAL_REPORT.md"

echo "CAMPAIGN_DONE verdict=$campaign_verdict batches=$batches_executed stop_reason=$campaign_stop_reason head=$(git rev-parse --short HEAD)"
