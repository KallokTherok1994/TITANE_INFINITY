# 01_BOOTSTRAP

STATUS: DONE

BOOTSTRAP_FACTS:
- UTC: 2026-03-07T18:09:41Z
- Branch: MAIN
- HEAD_SHORT: 0af062e88
- HEAD_SHA: 0af062e88e26d4c05cfd985b4ec5624dd44a13d4
- Active pack: proof_packs/SEAL_READINESS_2026-03-07_1309_0af062e88

CAPTURED_COMMAND_SET:
- git status --short
- git status
- git status -sb
- git status --porcelain=v1
- git rev-parse --short HEAD
- git log -20 --oneline
- git diff --name-only
- git diff --cached --name-only
- find proof_packs -maxdepth 2 -type d
- find registry scripts docs reports -maxdepth 3 -type f

RAW_FILES:
- raw/bootstrap_env.txt
- raw/bootstrap_env_clean.txt
- raw/git_status_short.txt
- raw/git_status.txt
- raw/git_status_sb.txt
- raw/git_status_porcelain.txt
- raw/git_log_20_oneline.txt
