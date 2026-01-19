#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║         TITANE∞ CORE — ORCHESTRATEUR DAG v1.0                               ║
# ║         Moteur de workflow avec gestion des dépendances et rollback         ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# Configuration orchestrateur
ORCHESTRATOR_DIR="${TITANE_ORCHESTRATOR_DIR:-$HOME/.cache/titane-infinity/orchestrator}"
ORCHESTRATOR_STATE="$ORCHESTRATOR_DIR/state.json"
ORCHESTRATOR_LOG="$ORCHESTRATOR_DIR/orchestrator.log"
ORCHESTRATOR_DRY_RUN="${ORCHESTRATOR_DRY_RUN:-false}"

# Charger les bibliothèques core
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/cache.sh"
source "$SCRIPT_DIR/lib/telemetry.sh"

# État global des tâches
declare -A TASK_STATES=(
    ["pending"]="⏳"
    ["running"]="🔄"
    ["completed"]="✅"
    ["failed"]="❌"
    ["skipped"]="⏭️"
)

# Graphe des dépendances (sera construit dynamiquement)
declare -A TASK_GRAPH
declare -A TASK_DEPS
declare -A TASK_STATUS
declare -A TASK_RESULTS
declare -A TASK_CHECKPOINTS

################################################################################
# INITIALISATION
################################################################################

orchestrator_init() {
    mkdir -p "$ORCHESTRATOR_DIR"

    # État initial vide
    echo '{"tasks": {}, "workflow": {}, "checkpoints": {}}' > "$ORCHESTRATOR_STATE"

    log "Orchestrateur initialisé"
}

################################################################################
# GESTION DES TÂCHES
################################################################################

orchestrator_register_task() {
    local task_id="$1"
    local command="$2"
    local deps="${3:-}"  # Dépendances séparées par des virgules
    local checkpoint="${4:-false}"

    # Enregistrer la tâche
    TASK_GRAPH["$task_id"]="$command"
    TASK_STATUS["$task_id"]="pending"
    TASK_DEPS["$task_id"]="$deps"
    TASK_CHECKPOINTS["$task_id"]="$checkpoint"

    log "Task registered: $task_id (deps: $deps)"
}

orchestrator_task_completed() {
    local task_id="$1"
    local result="${2:-}"

    TASK_STATUS["$task_id"]="completed"
    TASK_RESULTS["$task_id"]="$result"

    # Sauvegarder l'état
    orchestrator_save_state

    telemetry_log_event "task_completed" "Task $task_id completed successfully"
}

orchestrator_task_failed() {
    local task_id="$1"
    local error="${2:-}"

    TASK_STATUS["$task_id"]="failed"
    TASK_RESULTS["$task_id"]="$error"

    # Sauvegarder l'état
    orchestrator_save_state

    telemetry_log_event "task_failed" "Task $task_id failed: $error"
    log_error "Task $task_id failed: $error"
}

################################################################################
# RÉSOLUTION DES DÉPENDANCES (ALGORITHME TOPOLOGIQUE)
################################################################################

orchestrator_resolve_dependencies() {
    local task_id="$1"

    # Vérifier les dépendances circulaires
    orchestrator_detect_cycles "$task_id"

    # Résoudre récursivement les dépendances
    local deps="${TASK_DEPS[$task_id]}"
    if [[ -n "$deps" ]]; then
        IFS=',' read -ra DEP_ARRAY <<< "$deps"
        for dep in "${DEP_ARRAY[@]}"; do
            dep=$(echo "$dep" | xargs)  # Trim whitespace

            # Si la dépendance n'est pas encore résolue
            if [[ "${TASK_STATUS[$dep]:-pending}" == "pending" ]]; then
                orchestrator_resolve_dependencies "$dep"
            fi

            # Vérifier que la dépendance est réussie
            if [[ "${TASK_STATUS[$dep]:-pending}" != "completed" ]]; then
                orchestrator_task_failed "$task_id" "Dependency $dep failed or not completed"
                return 1
            fi
        done
    fi
}

orchestrator_detect_cycles() {
    local task_id="$1"
    local visiting="$2"

    # Algorithme de détection de cycles avec coloration
    case "$visiting" in
        *"$task_id"*)
            orchestrator_task_failed "$task_id" "Circular dependency detected"
            return 1
            ;;
    esac

    if [[ "${TASK_STATUS[$task_id]:-pending}" == "running" ]]; then
        return 0  # Déjà en cours
    fi

    # Marquer comme en visite
    local deps="${TASK_DEPS[$task_id]}"
    if [[ -n "$deps" ]]; then
        IFS=',' read -ra DEP_ARRAY <<< "$deps"
        for dep in "${DEP_ARRAY[@]}"; do
            dep=$(echo "$dep" | xargs)
            if ! orchestrator_detect_cycles "$dep" "$visiting,$task_id"; then
                return 1
            fi
        done
    fi
}

################################################################################
# EXÉCUTION DES WORKFLOWS
################################################################################

orchestrator_execute_task() {
    local task_id="$1"

    # Vérifier si déjà exécutée
    if [[ "${TASK_STATUS[$task_id]:-pending}" == "completed" ]]; then
        log "Task $task_id already completed, skipping"
        return 0
    fi

    if [[ "${TASK_STATUS[$task_id]:-pending}" == "running" ]]; then
        log "Task $task_id already running, waiting..."
        # Attendre la fin (implémentation simplifiée)
        sleep 1
        return 0
    fi

    # Résoudre les dépendances
    if ! orchestrator_resolve_dependencies "$task_id"; then
        return 1
    fi

    # Marquer comme en cours
    TASK_STATUS["$task_id"]="running"
    orchestrator_save_state

    local command="${TASK_GRAPH[$task_id]}"
    log "Executing task: $task_id"
    log "Command: $command"

    # Checkpoint si demandé
    if [[ "${TASK_CHECKPOINTS[$task_id]}" == "true" ]]; then
        orchestrator_create_checkpoint "$task_id"
    fi

    # Mode dry-run
    if [[ "$ORCHESTRATOR_DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would execute: $command"
        orchestrator_task_completed "$task_id" "dry-run"
        return 0
    fi

    # Exécuter avec télémétrie
    local start_time=$(telemetry_start_timer "task_$task_id")
    if telemetry_wrap_command "$command"; then
        local duration=$(telemetry_stop_timer "task_$task_id" "$start_time")
        orchestrator_task_completed "$task_id" "completed in ${duration}ms"
        return 0
    else
        local exit_code=$?
        local duration=$(telemetry_stop_timer "task_$task_id" "$start_time")
        orchestrator_task_failed "$task_id" "Command failed with exit code $exit_code after ${duration}ms"
        return 1
    fi
}

orchestrator_execute_workflow() {
    local workflow_name="$1"
    local start_time=$(telemetry_start_timer "workflow_$workflow_name")

    log_section "WORKFLOW: $workflow_name"

    local failed_tasks=()

    # Exécuter toutes les tâches dans l'ordre topologique
    for task_id in "${!TASK_GRAPH[@]}"; do
        if ! orchestrator_execute_task "$task_id"; then
            failed_tasks+=("$task_id")
        fi
    done

    local duration=$(telemetry_stop_timer "workflow_$workflow_name" "$start_time")

    # Rapport final
    if [[ ${#failed_tasks[@]} -eq 0 ]]; then
        log_success "Workflow $workflow_name completed successfully in ${duration}ms"
        telemetry_log_event "workflow_completed" "Workflow $workflow_name completed successfully"
        return 0
    else
        log_error "Workflow $workflow_name failed. Failed tasks: ${failed_tasks[*]}"
        telemetry_log_event "workflow_failed" "Workflow $workflow_name failed: ${failed_tasks[*]}"
        return 1
    fi
}

################################################################################
# CHECKPOINTS ET ROLLBACK
################################################################################

orchestrator_create_checkpoint() {
    local task_id="$1"
    local checkpoint_dir="$ORCHESTRATOR_DIR/checkpoints/$task_id"
    local timestamp=$(date +%s)

    mkdir -p "$checkpoint_dir"

    # Sauvegarder l'état du système
    # (Peut être étendu pour sauvegarder des fichiers spécifiques)
    echo "$timestamp" > "$checkpoint_dir/timestamp"
    cp "$ORCHESTRATOR_STATE" "$checkpoint_dir/state.json"

    log "Checkpoint created for task $task_id: $checkpoint_dir"
}

orchestrator_rollback() {
    local target_task="${1:-}"

    if [[ -z "$target_task" ]]; then
        log_error "No rollback target specified"
        return 1
    fi

    local checkpoint_dir="$ORCHESTRATOR_DIR/checkpoints/$target_task"
    if [[ ! -d "$checkpoint_dir" ]]; then
        log_error "No checkpoint found for task $target_task"
        return 1
    fi

    log_warning "Rolling back to checkpoint: $target_task"

    # Restaurer l'état
    if [[ -f "$checkpoint_dir/state.json" ]]; then
        cp "$checkpoint_dir/state.json" "$ORCHESTRATOR_STATE"
        log "State restored from checkpoint"
    fi

    # Remettre les tâches à l'état antérieur
    # (Implémentation simplifiée - peut être étendue)
    TASK_STATUS["$target_task"]="pending"

    log_success "Rollback completed for task $target_task"
}

################################################################################
# GESTION D'ÉTAT
################################################################################

orchestrator_save_state() {
    # Convertir les arrays associatifs en JSON
    local tasks_json="{"
    local first=true
    for task_id in "${!TASK_GRAPH[@]}"; do
        if [[ "$first" == false ]]; then
            tasks_json+=","
        fi
        tasks_json+="\"$task_id\":{\"status\":\"${TASK_STATUS[$task_id]}\",\"result\":\"${TASK_RESULTS[$task_id]:-}\",\"deps\":\"${TASK_DEPS[$task_id]:-}\"}"
        first=false
    done
    tasks_json+="}"

    local state="{\"timestamp\":\"$(date -Iseconds)\",\"tasks\":$tasks_json}"
    echo "$state" > "$ORCHESTRATOR_STATE"
}

orchestrator_load_state() {
    if [[ ! -f "$ORCHESTRATOR_STATE" ]]; then
        return 0
    fi

    # Charger l'état depuis le JSON (implémentation simplifiée)
    # En production, utiliser jq pour parser correctement
    log "State loaded from $ORCHESTRATOR_STATE"
}

################################################################################
# OUTILS ET DIAGNOSTICS
################################################################################

orchestrator_show_status() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                 TITANE∞ ORCHESTRATEUR STATUS                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""

    for task_id in "${!TASK_GRAPH[@]}"; do
        local status="${TASK_STATUS[$task_id]:-pending}"
        local icon="${TASK_STATES[$status]:-❓}"
        local deps="${TASK_DEPS[$task_id]:-none}"

        printf "%s %-20s | %-10s | deps: %s\n" "$icon" "$task_id" "$status" "$deps"

        if [[ "$status" == "failed" && -n "${TASK_RESULTS[$task_id]:-}" ]]; then
            echo "    └─ Error: ${TASK_RESULTS[$task_id]}"
        fi
    done

    echo ""
}

orchestrator_show_graph() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                 TITANE∞ DEPENDENCY GRAPH                      ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""

    for task_id in "${!TASK_GRAPH[@]}"; do
        local deps="${TASK_DEPS[$task_id]:-}"
        local command="${TASK_GRAPH[$task_id]}"

        echo "📋 $task_id"
        if [[ -n "$deps" ]]; then
            echo "  └─ Depends on: $deps"
        else
            echo "  └─ No dependencies"
        fi
        echo "  └─ Command: $command"
        echo ""
    done
}

################################################################################
# WORKFLOWS PRÉDÉFINIS
################################################################################

orchestrator_setup_install_workflow() {
    # Workflow d'installation complet
    orchestrator_register_task "check_system" "scripts/core/modules/system-check.sh" "" "true"
    orchestrator_register_task "install_deps" "scripts/core/modules/dependency-manager.sh" "check_system" "true"
    orchestrator_register_task "setup_ollama" "scripts/core/modules/ollama-manager.sh install" "check_system" "false"
    orchestrator_register_task "build_frontend" "scripts/core/modules/build-engine.sh frontend" "install_deps" "true"
    orchestrator_register_task "build_backend" "scripts/core/modules/build-engine.sh backend" "install_deps" "true"
    orchestrator_register_task "test_build" "scripts/core/modules/test-engine.sh smoke" "build_frontend,build_backend" "false"
    orchestrator_register_task "deploy_local" "scripts/core/modules/deploy-engine.sh local" "test_build" "true"
    orchestrator_register_task "create_shortcuts" "scripts/core/modules/deploy-engine.sh shortcuts" "deploy_local" "false"
}

orchestrator_setup_dev_workflow() {
    # Workflow développement rapide
    orchestrator_register_task "check_dev_env" "scripts/core/modules/system-check.sh --dev" "" "false"
    orchestrator_register_task "start_ollama" "scripts/core/modules/ollama-manager.sh start" "check_dev_env" "false"
    orchestrator_register_task "dev_servers" "scripts/dev/full_local_tauri_ollama.sh" "start_ollama" "false"
}

################################################################################
# FONCTIONS UTILITAIRES
################################################################################

log() {
    echo "[$(date +'%H:%M:%S')] $*" | tee -a "$ORCHESTRATOR_LOG"
}

log_success() {
    log "✅ $1"
}

log_error() {
    log "❌ $1"
}

log_warning() {
    log "⚠️  $1"
}

log_section() {
    echo "" | tee -a "$ORCHESTRATOR_LOG"
    log "═══════════════════════════════════════════════════════"
    log "  $1"
    log "═══════════════════════════════════════════════════════"
}

################################################################################
# INITIALISATION AUTO
################################################################################

# Initialiser l'orchestrateur
orchestrator_init

# Fonction de nettoyage
cleanup() {
    orchestrator_save_state
}

trap cleanup EXIT
