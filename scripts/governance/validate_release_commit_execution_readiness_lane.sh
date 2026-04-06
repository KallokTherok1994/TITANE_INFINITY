#!/usr/bin/env bash
set -euo pipefail

STATE_ANCHOR_DOC="${1:-}"
OBJECTIVE_DOC="${2:-}"
SCOPE_DOC="${3:-}"
MESSAGES_DOC="${4:-}"
RESULTS_DOC="${5:-}"
STATE_DOC="${6:-}"
PACK_PATH="${7:-}"

if [[ -z "${STATE_ANCHOR_DOC}" || -z "${OBJECTIVE_DOC}" || -z "${SCOPE_DOC}" || -z "${MESSAGES_DOC}" || -z "${RESULTS_DOC}" || -z "${STATE_DOC}" || -z "${PACK_PATH}" ]]; then
  echo "usage=validate_release_commit_execution_readiness_lane.sh <state_anchor_doc> <objective_doc> <scope_doc> <messages_doc> <results_doc> <state_doc> <pack_path>"
  exit 2
fi

required_docs=(
  "00_PLAN.md"
  "01_STATE_ANCHOR.md"
  "02_SCOPE_FREEZE.md"
  "03_RELEASE_READINESS_OBJECTIVE.md"
  "04_COMMIT_EXECUTION_SCOPE.md"
  "05_CANONICAL_MESSAGES_AND_HANDOFF.md"
  "06_RELEASE_READINESS_VALIDATORS.md"
  "07_RELEASE_READINESS_EXECUTION.md"
  "08_RELEASE_READINESS_RESULTS.md"
  "09_EXECUTION_HANDOFF_PROOF.md"
  "10_AUTOFIX_DECISION.md"
  "11_AUTOFIX_APPLIED.md"
  "12_RELEASE_EXECUTION_STATE.md"
  "13_FILES_TOUCHED.md"
  "14_COMMANDS_USED.md"
  "15_RAW_LOG_INDEX.md"
  "16_RISKS.md"
  "17_ROLLBACK.md"
  "18_FINAL_VERDICT.md"
)

pack_completeness_ok=1
for f in "${required_docs[@]}"; do
  if [[ ! -s "${PACK_PATH}/${f}" ]]; then
    pack_completeness_ok=0
  fi
done

validator_sealed_anchor_ok=FAIL
if [[ -s "${STATE_ANCHOR_DOC}" ]] && \
   rg -q "TERMINAL = PASS" "${STATE_ANCHOR_DOC}" && \
   rg -q "H2 = PASS" "${STATE_ANCHOR_DOC}" && \
   rg -q "H3 = SEALED" "${STATE_ANCHOR_DOC}" && \
   rg -q "H4-1 = PASS" "${STATE_ANCHOR_DOC}" && \
   rg -q "H4-2 = PASS" "${STATE_ANCHOR_DOC}" && \
   rg -q "H4-3 = PASS" "${STATE_ANCHOR_DOC}" && \
   rg -q "POST-SEAL CANONICALIZATION = PASS" "${STATE_ANCHOR_DOC}" && \
   rg -q "POST-SEAL GIT READINESS = PASS" "${STATE_ANCHOR_DOC}" && \
   rg -q "SEALED COMMIT / PR / HANDOFF PACKAGING = PASS" "${STATE_ANCHOR_DOC}" && \
   rg -q "TITANE = SEALED" "${STATE_ANCHOR_DOC}"; then
  validator_sealed_anchor_ok=PASS
fi

validator_commit_scope_stable_ok=FAIL
if [[ -s "${SCOPE_DOC}" ]] && \
   rg -q "MUST_COMMIT" "${SCOPE_DOC}" && \
   rg -q "MAY_COMMIT" "${SCOPE_DOC}" && \
   rg -q "LOCAL_ONLY" "${SCOPE_DOC}" && \
   rg -q "MUST_NOT_COMMIT" "${SCOPE_DOC}" && \
   rg -qi "stage|staged|staging" "${SCOPE_DOC}" && \
   [[ -s "${PACK_PATH}/raw/02_commit_scope_recompute_raw.log" ]] && \
   rg -q "command=git status --porcelain class-counts" "${PACK_PATH}/raw/02_commit_scope_recompute_raw.log"; then
  validator_commit_scope_stable_ok=PASS
fi

validator_commit_message_ok=FAIL
if [[ -s "${MESSAGES_DOC}" ]] && \
   rg -qi "commit message principal" "${MESSAGES_DOC}" && \
   rg -qi "alternative 1|alternative 2" "${MESSAGES_DOC}"; then
  validator_commit_message_ok=PASS
fi

validator_pr_summary_ok=FAIL
if [[ -s "${MESSAGES_DOC}" ]] && \
   rg -qi "PR title|PR body" "${MESSAGES_DOC}"; then
  validator_pr_summary_ok=PASS
fi

validator_release_note_ok=FAIL
if [[ -s "${MESSAGES_DOC}" ]] && \
   rg -qi "release/handoff note|note release/handoff" "${MESSAGES_DOC}"; then
  validator_release_note_ok=PASS
fi

validator_review_checklist_ok=FAIL
if [[ -s "${MESSAGES_DOC}" ]] && \
   rg -qi "review checklist" "${MESSAGES_DOC}" && \
   rg -q "\[ \]" "${MESSAGES_DOC}"; then
  validator_review_checklist_ok=PASS
fi

validator_scope_honesty_ok=FAIL
if [[ -s "${OBJECTIVE_DOC}" ]] && \
   rg -qi "no runtime modification" "${OBJECTIVE_DOC}" && \
   rg -qi "no new feature work" "${OBJECTIVE_DOC}" && \
   rg -qi "no phase reopening" "${OBJECTIVE_DOC}" && \
   rg -qi "no new cycle execution" "${OBJECTIVE_DOC}"; then
  validator_scope_honesty_ok=PASS
fi

validator_pack_completeness_ok=$([[ "${pack_completeness_ok}" -eq 1 ]] && echo PASS || echo FAIL)

validator_timestamp_ok=FAIL
if [[ -s "${PACK_PATH}/raw/09_timestamp_compliance.log" ]] && \
   rg -q "timestamp_verdict=PASS" "${PACK_PATH}/raw/09_timestamp_compliance.log"; then
  validator_timestamp_ok=PASS
fi

echo "state_anchor_doc=${STATE_ANCHOR_DOC}"
echo "objective_doc=${OBJECTIVE_DOC}"
echo "scope_doc=${SCOPE_DOC}"
echo "messages_doc=${MESSAGES_DOC}"
echo "results_doc=${RESULTS_DOC}"
echo "state_doc=${STATE_DOC}"
echo "validator_sealed_anchor_ok=${validator_sealed_anchor_ok}"
echo "validator_commit_scope_stable_ok=${validator_commit_scope_stable_ok}"
echo "validator_commit_message_ok=${validator_commit_message_ok}"
echo "validator_pr_summary_ok=${validator_pr_summary_ok}"
echo "validator_release_note_ok=${validator_release_note_ok}"
echo "validator_review_checklist_ok=${validator_review_checklist_ok}"
echo "validator_scope_honesty_ok=${validator_scope_honesty_ok}"
echo "validator_pack_completeness_ok=${validator_pack_completeness_ok}"
echo "validator_timestamp_ok=${validator_timestamp_ok}"

if [[ "${validator_sealed_anchor_ok}" == "PASS" && \
      "${validator_commit_scope_stable_ok}" == "PASS" && \
      "${validator_commit_message_ok}" == "PASS" && \
      "${validator_pr_summary_ok}" == "PASS" && \
      "${validator_release_note_ok}" == "PASS" && \
      "${validator_review_checklist_ok}" == "PASS" && \
      "${validator_scope_honesty_ok}" == "PASS" && \
      "${validator_pack_completeness_ok}" == "PASS" && \
      "${validator_timestamp_ok}" == "PASS" ]]; then
  echo "single_verdict=PASS"
else
  echo "single_verdict=FAIL"
  exit 1
fi