# UI Action → Backend Matrix
<!-- AUTO-GENERATED — DO NOT EDIT MANUALLY -->
<!-- Source: src/registry/uiSurfaceRegistry.ts -->
<!-- Mission: UI_BACKEND_TRUTH_CERTIFICATION_v46 -->
<!-- Generation date: 2025-07 -->

> Actions classified as NOT_WIRED or DISPLAY_ONLY have no IPC backend connection.
> Actions classified as WIRED_LIVE require verification against IPC catalog.
> SIMULATED actions produce UI-only feedback with no backend mutation.

## Wiring Status Key

| Status | Meaning |
|---|---|
| WIRED_LIVE | Connected to verified IPC command |
| WIRED_LIVE_CONDITIONAL | Connected but conditional on provider/config |
| WIRED_WITH_FALLBACK | Connected; graceful degradation if backend fails |
| WIRED_STATIC | Reads static data only, no write |
| NOT_WIRED | No backend connection; button exists but does nothing real |
| DISPLAY_ONLY | Read-only display; no action |
| SIMULATED | UI feedback only; no IPC call |
| UNKNOWN | Not yet classified |

## /titane — Actions

| Action | Label | Wiring | IPC Commands |
|---|---|---|---|
| send_message | Envoyer message | WIRED_LIVE_CONDITIONAL | ai_get_response, ai_generate_local_stream |
| analyze_vision | Analyser image | WIRED_WITH_FALLBACK | analyze_image, analyze_image_path |
| read_memory | Lire mémoire | WIRED_LIVE | persistent_memory_read |

## /admin — Actions

| Action | Label | Wiring | IPC Commands |
|---|---|---|---|
| update_config | Mettre à jour config | WIRED_LIVE | *(write IPC)* |
| set_audio | Config audio | WIRED_LIVE | get_audio_config, set_audio_config |
| health_check | Vérifier santé | WIRED_LIVE | check_backend_health |

## /dev — Actions

| Action | Label | Wiring | IPC Commands |
|---|---|---|---|
| run_diagnostics | Lancer diagnostics | WIRED_WITH_FALLBACK | get_diagnostics |

## /cloud — Actions

| Action | Label | Wiring | IPC Commands |
|---|---|---|---|
| open_file | Ouvrir fichier | WIRED_LIVE | open_file_dialog |
| read_file | Lire fichier | WIRED_LIVE | read_file_content |

## /orchestration-intelligence — Actions (SIMULATED)

| Action | Label | Wiring | IPC Commands |
|---|---|---|---|
| trigger_orchestration | Déclencher orchestration | **SIMULATED** | *(none)* |
| view_metrics | Voir métriques | **SIMULATED** | *(none)* |

## /quantum-center — Actions (SIMULATED)

| Action | Label | Wiring | IPC Commands |
|---|---|---|---|
| toggle_monitoring | Toggle monitoring | **SIMULATED** | *(none)* |
| reset_metrics | Reset métriques | **SIMULATED** | *(none)* |

## Surfaces with no registered actions

The following surfaces have no actions registered in the registry (display-only or not yet catalogued):
`/experience`, `/time`, `/fusion`, `/optimization`, `/total-dev`, `/orchestration-center`, `/reality-center`, `/hyper-center`, `/twins`, `/memory`, `/research`, `/doc-center`, `/singularity`, `/sentinel`, `/watchdog`, `/selfheal`, `/adaptive`, `/skills`, `/knowledge`, `/creation`, `/evolution`, `/performance`, `/htf`
