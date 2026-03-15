# 15_ROLLBACK.md — Procedures de rollback

## Rollback Fix 1 (main.rs — transcribe_audio + is_recording)
```
git restore -- src-tauri/src/main.rs
```
Impact: transcribe_audio et is_recording redeviennent non enregistres (regressent)

## Rollback Fix 2 (useVoiceMode.ts — vad_get_state)
```
git restore -- src/hooks/useVoiceMode.ts
```
Impact: get_vad_state redevient errone (regressera au comportement bugge)

## Rollback Fix 3 (UnifiedCognitivePipeline.ts — null coalescence)
```
git restore -- src/core/pipelines/UnifiedCognitivePipeline.ts
```
Impact: TypeError potentiel reetabli si tts_speak retourne null

## Rollback complet session
```
git restore -- src-tauri/src/main.rs src/hooks/useVoiceMode.ts src/core/pipelines/UnifiedCognitivePipeline.ts
```

## Note
Aucune modification de capabilities/allowlist -> rollback Tauri non necessaire.
