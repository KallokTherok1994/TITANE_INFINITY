#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║         TITANE∞ CORE — ANALYSEUR DE SCRIPTS IA v1.0                         ║
# ║         Analyse automatique des scripts pour détecter obsolescence         ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
ANALYSIS_DIR="$SCRIPT_DIR/analysis"
REPORT_FILE="$ANALYSIS_DIR/script_analysis_$(date +%Y%m%d_%H%M%S).json"

# Charger les bibliothèques core
source "$SCRIPT_DIR/lib/cache.sh"
source "$SCRIPT_DIR/lib/telemetry.sh"

# Métriques d'analyse
declare -A ANALYSIS_METRICS=(
    ["total_scripts"]=0
    ["obsolete_scripts"]=0
    ["duplicate_scripts"]=0
    ["unused_scripts"]=0
)

# Patterns d'obsolescence
OBSOLESCENCE_PATTERNS=(
    "v[0-9]+\.[0-9]+\.[0-9]+"  # Versions anciennes
    "TODO|FIXME|XXX"           # Commentaires de développement
    "# DEPRECATED|# OBSOLETE"   # Marquage explicite
    "echo.*not.*implemented"   # Fonctionnalités non implémentées
)

# Patterns de duplication
DUPLICATE_PATTERNS=(
    "install.*dependencies"
    "check.*system"
    "build.*frontend"
    "build.*backend"
)

################################################################################
# ANALYSEURS SPÉCIALISÉS
################################################################################

analyze_script_version() {
    local script_path="$1"
    local script_name=$(basename "$script_path")

    # Extraire les numéros de version du script
    local version_pattern="v([0-9]+\.[0-9]+\.[0-9]+)"
    local script_versions=$(grep -o "$version_pattern" "$script_path" 2>/dev/null | sort -u || echo "")

    # Version actuelle du projet
    local current_version=$(grep '"version"' "$REPO_ROOT/package.json" | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' || echo "26.3.0")

    local obsolete=false
    local version_diff=""

    if [[ -n "$script_versions" ]]; then
        for version in $script_versions; do
            if [[ "$version" != "$current_version" ]]; then
                obsolete=true
                version_diff="$version → $current_version"
                break
            fi
        done
    fi

    echo "{\"obsolete\":$obsolete,\"version_diff\":\"$version_diff\",\"script_versions\":\"$script_versions\",\"current_version\":\"$current_version\"}"
}

analyze_script_quality() {
    local script_path="$1"

    local lines=$(wc -l < "$script_path")
    local size=$(du -h "$script_path" | cut -f1)
    local permissions=$(stat -c '%a' "$script_path" 2>/dev/null || echo "unknown")
    local executable=$([[ -x "$script_path" ]] && echo true || echo false)

    # Analyse du contenu
    local shebang=$(head -1 "$script_path" 2>/dev/null || echo "")
    local has_comments=$(grep -c '^#' "$script_path" 2>/dev/null || echo 0)
    local has_functions=$(grep -c '^function\|^[_a-zA-Z][_a-zA-Z0-9]*()' "$script_path" 2>/dev/null || echo 0)
    local has_error_handling=$(grep -c 'set -e\|trap\|try\|catch' "$script_path" 2>/dev/null || echo 0)

    # Calcul du score de qualité (0-100)
    local quality_score=0
    [[ "$shebang" == "#!/bin/bash" ]] && ((quality_score += 20))
    (( has_comments > 5 )) && ((quality_score += 20))
    (( has_functions > 0 )) && ((quality_score += 20))
    (( has_error_handling > 0 )) && ((quality_score += 20))
    [[ "$executable" == "true" ]] && ((quality_score += 20))

    echo "{\"lines\":$lines,\"size\":\"$size\",\"permissions\":\"$permissions\",\"executable\":$executable,\"quality_score\":$quality_score,\"has_comments\":$has_comments,\"has_functions\":$has_functions,\"has_error_handling\":$has_error_handling}"
}

analyze_script_usage() {
    local script_path="$1"
    local script_name=$(basename "$script_path")

    # Analyser les références dans d'autres scripts
    local references=$(grep -r "$script_name" "$REPO_ROOT/scripts/" --exclude-dir=".git" --exclude-dir="_archive" 2>/dev/null | wc -l || echo 0)

    # Analyser les références dans la documentation
    local doc_references=$(grep -r "$script_name" "$REPO_ROOT/" --include="*.md" --exclude-dir=".git" 2>/dev/null | wc -l || echo 0)

    # Dernière modification
    local last_modified=$(stat -c '%Y' "$script_path" 2>/dev/null || echo 0)
    local days_since_modified=$(( ($(date +%s) - last_modified) / 86400 ))

    local unused=false
    if [[ $references -eq 0 ]] && [[ $doc_references -eq 0 ]] && [[ $days_since_modified -gt 30 ]]; then
        unused=true
    fi

    echo "{\"references\":$references,\"doc_references\":$doc_references,\"last_modified\":$last_modified,\"days_since_modified\":$days_since_modified,\"unused\":$unused}"
}

analyze_script_duplicates() {
    local script_path="$1"

    local duplicates_found=""
    local duplicate_score=0

    # Calculer le hash du contenu pour détecter les vrais duplicatas
    local content_hash=$(sha256sum "$script_path" 2>/dev/null | cut -d' ' -f1 || echo "")

    # Chercher les scripts avec le même contenu
    local same_content=()
    while IFS= read -r -d '' other_script; do
        if [[ "$other_script" != "$script_path" ]]; then
            local other_hash=$(sha256sum "$other_script" 2>/dev/null | cut -d' ' -f1 || echo "")
            if [[ "$content_hash" == "$other_hash" ]]; then
                same_content+=("$(basename "$other_script")")
            fi
        fi
    done < <(find "$REPO_ROOT/scripts" -name "*.sh" -type f -print0 2>/dev/null)

    if [[ ${#same_content[@]} -gt 0 ]]; then
        duplicates_found="${same_content[*]}"
        duplicate_score=100
        ANALYSIS_METRICS["duplicate_scripts"]=$((ANALYSIS_METRICS["duplicate_scripts"] + 1))
    fi

    # Analyser les patterns de duplication fonctionnelle
    for pattern in "${DUPLICATE_PATTERNS[@]}"; do
        if grep -qi "$pattern" "$script_path" 2>/dev/null; then
            local similar_scripts=$(grep -rl "$pattern" "$REPO_ROOT/scripts/" --exclude-dir="_archive" 2>/dev/null | wc -l || echo 0)
            if [[ $similar_scripts -gt 1 ]]; then
                duplicate_score=$((duplicate_score + 20))
                duplicates_found="${duplicates_found:+$duplicates_found, }functional:$pattern"
            fi
        fi
    done

    echo "{\"duplicate_score\":$duplicate_score,\"duplicates_found\":\"$duplicates_found\",\"content_hash\":\"$content_hash\"}"
}

analyze_script_obsoletion() {
    local script_path="$1"

    local obsolete_markers=()
    local obsolete_score=0

    # Vérifier les patterns d'obsolescence
    for pattern in "${OBSOLESCENCE_PATTERNS[@]}"; do
        if grep -qi "$pattern" "$script_path" 2>/dev/null; then
            obsolete_markers+=("$pattern")
            obsolete_score=$((obsolete_score + 25))
        fi
    done

    # Analyser la fraîcheur du script
    local last_modified=$(stat -c '%Y' "$script_path" 2>/dev/null || echo 0)
    local days_old=$(( ($(date +%s) - last_modified) / 86400 ))

    if [[ $days_old -gt 180 ]]; then  # 6 mois
        obsolete_score=$((obsolete_score + 30))
        obsolete_markers+=("old:${days_old}days")
    fi

    # Analyser la complexité et la maintenabilité
    local lines=$(wc -l < "$script_path")
    if [[ $lines -gt 1000 ]]; then
        obsolete_score=$((obsolete_score + 20))
        obsolete_markers+=("too_large:${lines}lines")
    fi

    local obsolete=$([[ $obsolete_score -gt 50 ]] && echo true || echo false)

    if [[ "$obsolete" == "true" ]]; then
        ANALYSIS_METRICS["obsolete_scripts"]=$((ANALYSIS_METRICS["obsolete_scripts"] + 1))
    fi

    echo "{\"obsolete\":$obsolete,\"obsolete_score\":$obsolete_score,\"obsolete_markers\":\"${obsolete_markers[*]}\",\"days_old\":$days_old,\"lines\":$lines}"
}

################################################################################
# ANALYSE PRINCIPALE
################################################################################

analyze_script() {
    local script_path="$1"
    local script_name=$(basename "$script_path")

    ANALYSIS_METRICS["total_scripts"]=$((ANALYSIS_METRICS["total_scripts"] + 1))

    echo "🔍 Analyzing: $script_name"

    # Collecter toutes les métriques
    local version_analysis=$(analyze_script_version "$script_path")
    local quality_analysis=$(analyze_script_quality "$script_path")
    local usage_analysis=$(analyze_script_usage "$script_path")
    local duplicate_analysis=$(analyze_script_duplicates "$script_path")
    local obsoletion_analysis=$(analyze_script_obsoletion "$script_path")

    # Fusionner les résultats
    local analysis_result=$(jq -n \
        --arg script_name "$script_name" \
        --arg script_path "$script_path" \
        --argjson version "$version_analysis" \
        --argjson quality "$quality_analysis" \
        --argjson usage "$usage_analysis" \
        --argjson duplicates "$duplicate_analysis" \
        --argjson obsoletion "$obsoletion_analysis" \
        '{
            script_name: $script_name,
            script_path: $script_path,
            timestamp: now | strftime("%Y-%m-%dT%H:%M:%SZ"),
            version: $version,
            quality: $quality,
            usage: $usage,
            duplicates: $duplicates,
            obsoletion: $obsoletion
        }' 2>/dev/null || echo "{}")

    echo "$analysis_result"
}

################################################################################
# GÉNÉRATION DE RAPPORTS
################################################################################

generate_analysis_report() {
    local all_results="$1"

    mkdir -p "$ANALYSIS_DIR"

    # Rapport JSON complet
    jq -n \
        --arg timestamp "$(date -Iseconds)" \
        --argjson metrics "$(declare -p ANALYSIS_METRICS | sed 's/.*=(//' | sed 's/)$//' | jq -R 'split(" ") | map(split("=")) | map({(.[0]): (.[1] | tonumber)}) | add')" \
        --argjson results "$all_results" \
        '{
            timestamp: $timestamp,
            summary: $metrics,
            results: $results
        }' > "$REPORT_FILE"

    # Rapport humain
    local human_report="$ANALYSIS_DIR/analysis_summary_$(date +%Y%m%d_%H%M%S).txt"

    cat > "$human_report" << EOF
╔══════════════════════════════════════════════════════════════════════════════╗
║                     TITANE∞ SCRIPT ANALYSIS REPORT                           ║
╚══════════════════════════════════════════════════════════════════════════════╝

Generated: $(date)
Total Scripts Analyzed: ${ANALYSIS_METRICS["total_scripts"]}

┌────────────────────────────────────────────────────────────────────────────┐
│                              SUMMARY                                       │
└────────────────────────────────────────────────────────────────────────────┘

📊 Total Scripts: ${ANALYSIS_METRICS["total_scripts"]}
🗑️  Obsolete Scripts: ${ANALYSIS_METRICS["obsolete_scripts"]}
📋 Duplicate Scripts: ${ANALYSIS_METRICS["duplicate_scripts"]}
🔇 Unused Scripts: ${ANALYSIS_METRICS["unused_scripts"]}

┌────────────────────────────────────────────────────────────────────────────┐
│                         OBSOLETE SCRIPTS                                   │
└────────────────────────────────────────────────────────────────────────────┘

EOF

    # Lister les scripts obsolètes
    echo "$all_results" | jq -r '.[] | select(.obsoletion.obsolete == true) | "\(.script_name): \(.obsoletion.obsolete_markers)"' >> "$human_report"

    cat >> "$human_report" << EOF

┌────────────────────────────────────────────────────────────────────────────┐
│                         UNUSED SCRIPTS                                     │
└────────────────────────────────────────────────────────────────────────────┘

EOF

    # Lister les scripts inutilisés
    echo "$all_results" | jq -r '.[] | select(.usage.unused == true) | "\(.script_name): \(.usage.days_since_modified) days old"' >> "$human_report"

    cat >> "$human_report" << EOF

┌────────────────────────────────────────────────────────────────────────────┐
│                      DUPLICATE SCRIPTS                                     │
└────────────────────────────────────────────────────────────────────────────┘

EOF

    # Lister les scripts dupliqués
    echo "$all_results" | jq -r '.[] | select(.duplicates.duplicate_score > 0) | "\(.script_name): \(.duplicates.duplicates_found)"' >> "$human_report"

    cat >> "$human_report" << EOF

┌────────────────────────────────────────────────────────────────────────────┐
│                      QUALITY SCORES                                        │
└────────────────────────────────────────────────────────────────────────────┘

EOF

    # Lister les scores de qualité
    echo "$all_results" | jq -r '.[] | "\(.script_name): \(.quality.quality_score)/100 (\(.quality.lines) lines)"' | sort -t: -k2 -nr >> "$human_report"

    cat >> "$human_report" << EOF

┌────────────────────────────────────────────────────────────────────────────┐
│                          RECOMMENDATIONS                                   │
└────────────────────────────────────────────────────────────────────────────┘

1. Archive ${ANALYSIS_METRICS["obsolete_scripts"]} obsolete scripts to _archive/scripts/
2. Consolidate ${ANALYSIS_METRICS["duplicate_scripts"]} duplicate functionalities
3. Review ${ANALYSIS_METRICS["unused_scripts"]} unused scripts for removal
4. Improve quality scores below 60/100

Full JSON report: $REPORT_FILE
Human report: $human_report

EOF

    echo "📊 Analysis complete!"
    echo "📄 JSON Report: $REPORT_FILE"
    echo "📋 Human Report: $human_report"
}

################################################################################
# ARCHIVAGE AUTOMATIQUE
################################################################################

archive_obsolete_scripts() {
    local all_results="$1"

    local archive_count=0

    # Créer le répertoire d'archive
    mkdir -p "$REPO_ROOT/scripts/_archive"

    # Archiver les scripts obsolètes
    while IFS= read -r script_info; do
        local script_name=$(echo "$script_info" | jq -r '.script_name')
        local script_path=$(echo "$script_info" | jq -r '.script_path')
        local is_obsolete=$(echo "$script_info" | jq -r '.obsoletion.obsolete')
        local is_unused=$(echo "$script_info" | jq -r '.usage.unused')

        if [[ "$is_obsolete" == "true" || "$is_unused" == "true" ]]; then
            local archive_path="$REPO_ROOT/scripts/_archive/$script_name"

            # Créer un fichier de métadonnées
            cat > "${archive_path}.meta.json" << EOF
{
    "original_path": "$script_path",
    "archived_date": "$(date -Iseconds)",
    "reason": "$( [[ "$is_obsolete" == "true" ]] && echo "obsolete" || echo "unused" )",
    "analysis_data": $script_info
}
EOF

            # Copier le script
            cp "$script_path" "$archive_path"
            archive_count=$((archive_count + 1))

            echo "📦 Archived: $script_name"
        fi
    done < <(echo "$all_results" | jq -c '.[]')

    echo "✅ Archived $archive_count scripts to scripts/_archive/"
}

################################################################################
# FONCTION PRINCIPALE
################################################################################

main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                 TITANE∞ SCRIPT ANALYZER IA v1.0                              ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo ""

    local start_time=$(telemetry_start_timer "script_analysis")

    # Trouver tous les scripts
    local scripts=()
    while IFS= read -r -d '' script; do
        scripts+=("$script")
    done < <(find "$REPO_ROOT/scripts" -name "*.sh" -type f -not -path "*/_archive/*" -not -path "*/node_modules/*" -print0 2>/dev/null)

    echo "🔍 Found ${#scripts[@]} scripts to analyze"
    echo ""

    # Analyser chaque script
    local all_results="[]"
    for script_path in "${scripts[@]}"; do
        local result=$(analyze_script "$script_path")
        all_results=$(echo "$all_results" | jq --argjson new "$result" '. + [$new]' 2>/dev/null || echo "[$result]")
    done

    # Générer les rapports
    generate_analysis_report "$all_results"

    # Archiver automatiquement
    archive_obsolete_scripts "$all_results"

    local duration=$(telemetry_stop_timer "script_analysis" "$start_time")

    echo ""
    echo "✅ Analysis completed in ${duration}ms"
    echo ""
    echo "📈 Metrics:"
    echo "   Total scripts: ${ANALYSIS_METRICS["total_scripts"]}"
    echo "   Obsolete: ${ANALYSIS_METRICS["obsolete_scripts"]}"
    echo "   Duplicates: ${ANALYSIS_METRICS["duplicate_scripts"]}"
    echo "   Unused: ${ANALYSIS_METRICS["unused_scripts"]}"
}

################################################################################
# EXÉCUTION
################################################################################

# Vérifier les dépendances
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required for JSON processing"
    exit 1
fi

# Exécuter l'analyse
main "$@"
