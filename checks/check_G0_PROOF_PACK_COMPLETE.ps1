# checks/check_G0_PROOF_PACK_COMPLETE.ps1 — Gate G0: Proof pack structure complete
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G0_PROOF_PACK_COMPLETE.ps1

$ErrorActionPreference = "Stop"
$GATE = "G0_PROOF_PACK_COMPLETE"
. "$PSScriptRoot/_lib.ps1"

$ROOT = lib_repo_root

$REQUIRED_TEMPLATES = @(
  "templates/proof_pack/README.md",
  "templates/proof_pack/ROOT_CAUSE.md",
  "templates/proof_pack/NEXT_ACTION.md",
  "templates/proof_pack/VERDICT_GLOBAL.md",
  "templates/proof_pack/GATES_REPORT.md",
  "templates/proof_pack/CHANGELOG_FILES.md",
  "templates/proof_pack/ROLLBACKS.md",
  "templates/proof_pack/PATCHSET_SUMMARY.md",
  "templates/proof_pack/PHASES/P0_DISCOVERY.md",
  "templates/proof_pack/PHASES/P1_POLICY_TRUTH.md",
  "templates/proof_pack/PHASES/P2_KERNEL_GATES.md",
  "templates/proof_pack/PHASES/P3_BUILD_TESTS.md",
  "templates/proof_pack/PHASES/P4_UI_COCKPIT.md",
  "templates/proof_pack/PHASES/P5_ROUTER_TOOLS.md",
  "templates/proof_pack/PHASES/P6_EVALS_REDTTEAM.md",
  "templates/proof_pack/PHASES/P7_RAG.md",
  "templates/proof_pack/PHASES/P8_SEAL_RELEASE.md"
)

lib_log "INFO" "[$GATE] Checking proof pack template structure..."
$Failed = $false
foreach ($tpl in $REQUIRED_TEMPLATES) {
  try {
    lib_require_file $GATE (Join-Path $ROOT $tpl)
  } catch {
    $Failed = $true
  }
}
if ($Failed) {
  lib_log_jsonl $GATE "FAIL" "One or more proof pack templates missing — stop-the-line"
  throw "FAIL: [$GATE] One or more proof pack templates missing"
}
lib_pass $GATE "All proof pack templates present"
