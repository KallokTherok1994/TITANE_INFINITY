# 05_ACTION_RUNTIME_MAP.md

## Source: src/ invoke() calls — discovered, not assumed

## Critical Chain: Chat/Conversation
```
UI: ConversationSection (send message button) 
  → store: chatStore.sendMessage()
  → service: conversationService.generate()
  → invoke('conversation_generate', { prompt, provider, model })
  → Tauri: conversation_generate command
  → backend: LLM provider (Ollama/cloud) 
  → response streamed back
  → UI: message displayed, TTS triggered
  → invoke('speak', { text, voice_id }) [if TTS enabled]
  → Tauri: speak command → audio output
  → UI: TTS controls (play/pause/stop/replay) update
```
Chain truth level: L2 (runtime proven — AUDIO_TTS_CONTINUE session, x3 PASS)

## Critical Chain: Memory
```
UI: Memory page / tab-memory
  → invoke('get_memories', {})
  → invoke('memory_get_active_projects', {})
  → invoke('memory_get_stats', {})
  → Tauri: memory commands
  → UI: memory list rendered
  → invoke('memory_save_chat_interaction', { interaction }) [on new chat]
  → invoke('store_memory', { key, value })
```
Chain truth level: PARTIAL (memory-conversations.wdio proved navigation; runtime IPC partially proven)

## Critical Chain: System Health
```
UI: Dev page / Admin production-health tab
  → invoke('get_system_health', {})
  → invoke('get_system_info', {})
  → invoke('get_performance_metrics', {})
  → Tauri: system commands
  → UI: health stats displayed
```
Chain truth level: PARTIAL (production-health.spec.ts tests navigation but not IPC truth)

## Critical Chain: TTS Audio
```
UI: ConversationSection per-message TTS button
  → messageSpeechController.speak(text)
  → invoke('pipeline_prepare_tts', { text })
  → invoke('speak', { text, voice_id })
  → Tauri: TTS pipeline
  → audio output via OS
  → UI: status "Préparation de la lecture..." → "En cours..." → completed
  → replay/stop buttons become active
```
Chain truth level: RUNTIME_PROVEN (audio-tts-runtime-controls x3 PASS at 16:20Z)

## Critical Chain: Persona / Identity
```
UI: Identity Center / Titane tab-identity
  → invoke('persona_get_multipliers', {})
  → invoke('sync_evolution_state', {})
  → Tauri: persona commands
  → UI: persona state rendered
```
Chain truth level: PARTIAL_CHAIN (IPC registered, UI renders; E2E not covering persona chain end-to-end)

## Critical Chain: Singularity
```
UI: /singularity page
  → invoke('singularity_get_full_state', {})
  → invoke('singularity_get_metrics', {})
  → invoke('singularity_check_integrity', {})
  → Tauri: singularity commands
  → UI: singularity dashboard
```
Chain truth level: UNKNOWN (no E2E coverage)

## Critical Chain: MetaCenter / Orchestration
```
UI: /orchestration, /meta-center, /orchestration-center
  → invoke('meta_get_state', {})
  → invoke('meta_get_monitoring_metrics', {})
  → invoke('pipeline_generate_cognitive_response', {})
  → Tauri: meta/pipeline commands
  → UI: orchestration dashboard
```
Chain truth level: PARTIAL (omega-pipeline-e2e.spec.ts covers browser, no desktop E2E)

## Critical Chain: Auto-Heal / Watchdog
```
UI: /watchdog, /selfheal
  → invoke('autoheal_detect_broken_modules', {})
  → invoke('autoheal_get_history', {})
  → invoke('crashguard_detect_threats', {})
  → Tauri: autoheal/crashguard commands
  → UI: alert panel, heal button
```
Chain truth level: PARTIAL_CHAIN (system-resilience.spec.ts covers watchdog visibility; heal action not E2E proven)

## Critical Chain: Recording / Vision
```
UI: /titane tab-vision
  → invoke('start_recording', {})
  → Tauri: camera/audio recording
  → UI: recording state
```
Chain truth level: UNKNOWN (no E2E coverage; vision tab exists but not tested)

## IPC Commands Summary (discovered)
Total discovered: ~65 invoke commands
Registered in Tauri: verified per FIX-009 through FIX-012 (previous sessions)
Key groups:
- conversation_*: 1
- memory_*: 4
- persona_*: 1
- speak, start_recording: 2 (audio/TTS)
- system_*: 3
- singularity_*: 10
- meta_*: 5
- pipeline_*: 5
- autoheal_*: 6
- autofix_*: 6
- crashguard_*: 3
- performance_*: 5
- cognitive_*, chat_*, etc.: misc

## Anti-Lie Concern Points
1. UI shows "cloud provider" — must verify network_used=true in IPC response
2. UI shows TTS "Préparation de la lecture..." — must verify speak command actually executed (NOT silent pass)
3. UI shows "available" health — must verify system_get_status returns real data
4. Orchestration UI shows "active engines" — must verify engine state from IPC, not cached/default
