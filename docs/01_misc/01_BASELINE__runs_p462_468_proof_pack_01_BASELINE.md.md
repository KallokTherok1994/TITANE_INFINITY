]633;E;{   echo '# BASELINE PRECHECK'\x3b   echo '## git status --porcelain'\x3b   git status --porcelain\x3b   echo '## git rev-parse --abbrev-ref HEAD'\x3b   git rev-parse --abbrev-ref HEAD\x3b   echo '## git rev-parse HEAD'\x3b   git rev-parse HEAD\x3b   echo '## git log -1 --oneline --decorate'\x3b   git log -1 --oneline --decorate\x3b   echo '## git tag --points-at HEAD'\x3b   git tag --points-at HEAD\x3b } > runs/current/01_BASELINE.md;e99512ee-eb41-47ad-ba70-e987d0e9646e]633;C# BASELINE PRECHECK
## git status --porcelain
 M runs/current/00_VERDICT.md
 M runs/current/01_BASELINE.md
 M runs/current/SANITATION_BEFORE.md
 M runs/current/SCANS_ALLOWLIST.md
 M runs/current/SCANS_INDEX.md
 M runs/current/SCANS_NETWORK_UI.md
 M runs/current/SCANS_SECRETS.md
 M runs/current/WINDOW_TARGET.md
 M runs/p462_468/proof_pack/00_VERDICT.md
?? runs/current/.baseline_scope
?? runs/current/.status_lines
?? runs/current/02_DISCOVER_SUMMARY.md
?? runs/current/triage_secrets/
## git rev-parse --abbrev-ref HEAD
MAIN
## git rev-parse HEAD
41d77156bfdebe48f9c2dc9d2897a3b2dfc0ff29
## git log -1 --oneline --decorate
41d77156 (HEAD -> MAIN, origin/MAIN, origin/HEAD) docs(evidence): bootstrap and finalize p469-475 x3
## git tag --points-at HEAD
