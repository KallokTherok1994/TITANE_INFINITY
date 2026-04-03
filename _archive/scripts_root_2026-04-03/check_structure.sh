#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

ALLOW_TOP=(
  src src-tauri docs scripts tests tools dist reports proof_packs archive
  .github .husky .clinerules e2e runtime deployment public
)

is_allowed_top() {
  local name="$1"
  for allowed in "${ALLOW_TOP[@]}"; do
    [[ "$name" == "$allowed" ]] && return 0
  done
  return 1
}

echo "CHECK_STRUCTURE_START=$(date -Iseconds)"

failures=0

# Gate 1: .md hors docs (exceptions README.md et .github/**/*.md)
mapfile -t md_outside < <(
  git -c core.quotepath=off ls-files '*.md' \
    | awk 'BEGIN{IGNORECASE=1}
      $0=="README.md" {next}
      $0 ~ /^\.github\/.+\.md$/ {next}
      $0 ~ /^docs\/.+\.md$/ {next}
      {print $0}'
)
if (( ${#md_outside[@]} > 0 )); then
  echo "GATE_MD_OUTSIDE_DOCS=FAIL:${#md_outside[@]}"
  printf '%s\n' "${md_outside[@]}"
  failures=$((failures+1))
else
  echo "GATE_MD_OUTSIDE_DOCS=PASS:0"
fi

# Gate 2: liens markdown locaux cassés (.md seulement)
mapfile -t broken_lines < <(python3 - <<'PY'
import os,re
from pathlib import Path
repo=Path('.').resolve()
pat=re.compile(r'\[[^\]]*\]\(([^)]+)\)')
broken=[]
for p in os.popen("git -c core.quotepath=off ls-files '*.md'").read().splitlines():
    p=p.strip()
    if not p:
        continue
    f=Path(p)
    try:
        txt=f.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    for t in pat.findall(txt):
        tt=t.strip()
        if not tt:
            continue
        low=tt.lower()
        if low.startswith(('http://','https://','mailto:','file://')):
            continue
        core=tt.split('#',1)[0].split('?',1)[0].strip()
        if not core.lower().endswith('.md'):
            continue
        cand=(repo/core.lstrip('/')) if core.startswith('/') else (f.parent/core)
        norm=cand.resolve(strict=False)
        try:
            norm.relative_to(repo)
        except Exception:
            broken.append(f"{f.as_posix()} -> {tt}")
            continue
        if not norm.exists():
            broken.append(f"{f.as_posix()} -> {tt}")
for item in sorted(set(broken)):
    print(item)
PY
)
broken_count="${#broken_lines[@]}"
if (( broken_count > 0 )); then
  echo "GATE_BROKEN_LOCAL_MD_LINKS=FAIL:${broken_count}"
  printf '%s\n' "${broken_lines[@]}"
  failures=$((failures+1))
else
  echo "GATE_BROKEN_LOCAL_MD_LINKS=PASS:0"
fi

# Gate 3: nouveaux dossiers racine non conformes (fichiers ajoutés dans ce diff)
mapfile -t added_paths < <(git -c core.quotepath=off diff --name-only --diff-filter=A)
declare -A added_tops=()
for path in "${added_paths[@]}"; do
  [[ -z "$path" ]] && continue
  top="${path%%/*}"
  [[ -z "$top" ]] && continue
  added_tops["$top"]=1
done

non_conforming=()
for top in "${!added_tops[@]}"; do
  if ! is_allowed_top "$top"; then
    non_conforming+=("$top")
  fi
done
if (( ${#non_conforming[@]} > 0 )); then
  echo "GATE_NEW_NON_CONFORMING_TOP_DIRS=FAIL:${#non_conforming[@]}"
  printf '%s\n' "${non_conforming[@]}" | sort -u
  failures=$((failures+1))
else
  echo "GATE_NEW_NON_CONFORMING_TOP_DIRS=PASS:0"
fi

# Gate 4: redondance archive (anti-drift sur ce cycle)
archive_variants=(archive _archive .archive .archive_cleanup)
present=()
for d in "${archive_variants[@]}"; do
  if [[ -d "$d" ]]; then
    present+=("$d")
  fi
done
added_archive_variant=0
for d in "${archive_variants[@]}"; do
  if [[ -n "${added_tops[$d]:-}" ]]; then
    added_archive_variant=1
  fi
done
if (( ${#present[@]} > 1 )) && (( added_archive_variant == 1 )); then
  echo "GATE_DUPLICATE_ARCHIVE_PATTERNS=FAIL:${#present[@]}"
  printf '%s\n' "${present[@]}"
  failures=$((failures+1))
else
  echo "GATE_DUPLICATE_ARCHIVE_PATTERNS=PASS:${#present[@]}"
fi

echo "CHECK_STRUCTURE_END=$(date -Iseconds)"
if (( failures > 0 )); then
  echo "CHECK_STRUCTURE_VERDICT=FAIL"
  exit 1
fi
echo "CHECK_STRUCTURE_VERDICT=PASS"
