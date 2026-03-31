# 07_ROLLBACK.md — POST_AUDIT_CANON_VALIDATION
# Date: 2026-03-15T14:08:00Z | SHA: c59e9b5b3

## Rollback Commands

### Undo all docs/canon/ corrections (revert to overclaimed state)

```bash
git restore -- docs/canon/
```

### Undo autoheal entry only

```bash
# Remove last line of autoheal_rules.jsonl
head -n -1 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_backup.jsonl
mv /tmp/ah_backup.jsonl scripts/autoheal/autoheal_rules.jsonl
```

### Undo registry fix

```bash
git restore -- registry/canon-events.jsonl
```

### Undo all session changes (canon docs + registry)

```bash
git restore -- docs/canon/ registry/canon-events.jsonl
# Note: proof_packs/ and docs/canon/ are untracked — use rm -rf if needed
```

### Undo AUDIO_VOICE_AUDIT patches (if desired)

```bash
git restore -- src-tauri/src/main.rs src/hooks/useVoiceMode.ts src/core/pipelines/UnifiedCognitivePipeline.ts src/lib/security.ts src/lib/tauriClient.ts src/lib/tauriCommands.ts
```

## WARNING

Rollback does NOT restore "378" as correct — 378 was a proven error.
Rollback only removes the correction patches if needed for other reasons.
