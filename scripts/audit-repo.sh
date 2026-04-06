#!/usr/bin/env bash
# scripts/audit-repo.sh — Audit de la taille et composition du dépôt Git
# Usage: bash scripts/audit-repo.sh [--full]
# Sortie: rapport texte dans stdout, optionnellement dans reports/audit-repo-$(date +%Y%m%d).txt
#
# Ce script est reproductible et ne modifie rien dans le dépôt.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

FULL=false
if [[ "${1:-}" == "--full" ]]; then
  FULL=true
fi

REPORT_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
DIVIDER="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║    TITANE_INFINITY — Audit du dépôt Git              ║"
echo "║    $REPORT_DATE                    ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Statistiques globales ───────────────────────────────
echo "$DIVIDER"
echo "1. STATISTIQUES GLOBALES"
echo "$DIVIDER"
TRACKED_FILES=$(git ls-files | wc -l)
echo "  Fichiers trackés (git ls-files)  : $TRACKED_FILES"
REPO_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo "  Taille disque totale             : $REPO_SIZE"
GIT_OBJECTS=$(git count-objects -vH 2>/dev/null | grep 'size-pack' | awk '{print $2" "$3}')
echo "  Taille objets Git (packés)       : $GIT_OBJECTS"
echo ""

# ─── 2. Top dossiers par nombre de fichiers trackés ─────────
echo "$DIVIDER"
echo "2. TOP DOSSIERS (fichiers trackés)"
echo "$DIVIDER"
git ls-files | awk -F'/' '{print $1}' | sort | uniq -c | sort -rn | head -20 | \
  awk '{printf "  %6d fichiers  %s\n", $1, $2}'
echo ""

# ─── 3. Top dossiers par taille disque ──────────────────────
echo "$DIVIDER"
echo "3. TOP DOSSIERS (taille disque)"
echo "$DIVIDER"
du -sh -- */ .tools/ .github/ 2>/dev/null | sort -rh | head -15 | \
  awk '{printf "  %-10s  %s\n", $1, $2}'
echo ""

# ─── 4. Répartition par extension ───────────────────────────
echo "$DIVIDER"
echo "4. RÉPARTITION PAR EXTENSION (top 20)"
echo "$DIVIDER"
git ls-files | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20 | \
  awk '{printf "  %6d  .%s\n", $1, $2}'
echo ""

# ─── 5. Plus gros fichiers trackés ──────────────────────────
echo "$DIVIDER"
echo "5. PLUS GROS FICHIERS TRACKÉS (top 20)"
echo "$DIVIDER"
git ls-files -z | xargs -0 du -sk 2>/dev/null | sort -rn | head -20 | \
  awk '{size=$1; file=$2; if(size>=1024) printf "  %8.1f Mo  %s\n", size/1024, file; else printf "  %8d Ko  %s\n", size, file}'
echo ""

# ─── 6. Fichiers binaires/archives trackés ──────────────────
echo "$DIVIDER"
echo "6. ARTEFACTS BINAIRES/ARCHIVES TRACKÉS"
echo "$DIVIDER"
BINARIES=$(git ls-files | grep -E '\.(AppImage|deb|rpm|exe|dmg|tar|xz|gz|bz2|zip|7z|war|jar|bin|elf|so|dylib|dll|a|o|pyc|wav|mp3|ogg|flac)$' 2>/dev/null || true)
if [[ -n "$BINARIES" ]]; then
  echo "$BINARIES" | while read -r f; do
    SIZE=$(du -sk "$f" 2>/dev/null | cut -f1)
    printf "  %8.1f Mo  %s\n" "$(awk "BEGIN{printf \"%.1f\", $SIZE/1024}")" "$f"
  done
else
  echo "  (aucun artefact binaire/archive détecté)"
fi
echo ""

# ─── 7. Fichiers trackés malgré .gitignore ──────────────────
echo "$DIVIDER"
echo "7. DOSSIERS TRACKÉS MALGRÉ UNE RÈGLE .GITIGNORE"
echo "$DIVIDER"
SUSPECTS=(
  ".tools/node/_extract"
  ".tools/node/_tmp"
  "TITANE_INFINITY-main.zip"
)
for path in "${SUSPECTS[@]}"; do
  COUNT=$(git ls-files "$path" 2>/dev/null | wc -l)
  if [[ "$COUNT" -gt 0 ]]; then
    IGNORE_CHECK=$(git check-ignore -v "$path" 2>/dev/null || echo "  (pas ignoré)")
    printf "  %-45s %d fichiers encore trackés\n" "$path" "$COUNT"
    printf "    .gitignore: %s\n" "$IGNORE_CHECK"
  fi
done
echo ""

# ─── 8. Extensions C/C++ (impact Linguist) ──────────────────
echo "$DIVIDER"
echo "8. FICHIERS C/C++ TRACKÉS (impact GitHub Linguist)"
echo "$DIVIDER"
C_HEADERS=$(git ls-files | grep -E '\.(h|c|cpp|cc|cxx|hh|hpp)$' | wc -l)
C_IN_TOOLS=$(git ls-files .tools/ | grep -E '\.(h|c|cpp|cc|cxx|hh|hpp)$' | wc -l)
C_IN_SRC=$(git ls-files src-tauri/ | grep -E '\.(h|c|cpp|cc|cxx|hh|hpp)$' | wc -l)
echo "  Fichiers C/C++ trackés total     : $C_HEADERS"
echo "  dont dans .tools/ (vendorisé)    : $C_IN_TOOLS  ← cause principale du 59% C"
echo "  dont dans src-tauri/ (légitime)  : $C_IN_SRC"
echo ""

# ─── 9. Plus gros blobs dans l'historique ───────────────────
if [[ "$FULL" == "true" ]]; then
  echo "$DIVIDER"
  echo "9. PLUS GROS BLOBS DANS L'HISTORIQUE GIT (--full mode)"
  echo "$DIVIDER"
  echo "  (analyse en cours, peut prendre quelques secondes...)"
  git rev-list --objects --all 2>/dev/null \
    | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' 2>/dev/null \
    | sed -n 's/^blob //p' \
    | sort -k2 -nr \
    | head -20 \
    | awk '{
        size=$2; path=$3;
        if(size>=1048576) printf "  %8.1f Mo  %s\n", size/1048576, path;
        else if(size>=1024) printf "  %8.1f Ko  %s\n", size/1024, path;
        else printf "  %8d o   %s\n", size, path;
      }'
  echo ""
fi

# ─── 10. Recommandations ────────────────────────────────────
echo "$DIVIDER"
echo "10. RECOMMANDATIONS"
echo "$DIVIDER"
echo ""
echo "  [CRITIQUE] Retirer .tools/node/_extract/ de l'index Git :"
echo "    → git rm -r --cached .tools/node/_extract/ && git commit -m 'chore: remove vendored node'"
echo "    → Cela corrigera la prédominance du C (~59%) dans les stats GitHub"
echo ""
echo "  [ÉLEVÉ] Retirer les binaires de release de l'index Git :"
echo "    → git rm --cached deployment/latest/*.AppImage deployment/latest/*.deb"
echo "    → Utiliser GitHub Releases pour distribuer les binaires"
echo ""
echo "  [MOYEN] Ajouter .gitattributes pour Linguist :"
echo "    → .tools/** linguist-vendored=true"
echo "    → deployment/** linguist-vendored=true"
echo ""
echo "  [INFO] Voir docs/repo-audit.md pour le rapport complet et les procédures détaillées."
echo ""
echo "$DIVIDER"
echo "Audit terminé — $REPORT_DATE"
echo "$DIVIDER"
echo ""
