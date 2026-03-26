# ROLLBACK

## Command
git restore -- src/pages/Experience.tsx src/App.tsx src/components/chat/MemoryViewer.tsx src/components/chat/FileUploadButton.tsx scripts/autoheal/autoheal_rules.jsonl

## What it restores
- Experience.tsx: back to XP_ENGINE + experienceService dual-source (broken state)
- App.tsx: /xp route back to /titane redirect
- MemoryViewer.tsx: double XP.gain + awardExperience calls restored
- FileUploadButton.tsx: double XP.gain + awardExperience calls restored
- autoheal_rules.jsonl: AH-2026-03-18-XP-RUNTIME-TRUTH-HEAL entry removed

## Note
XP_BACKEND_INACTIVE (mock commands) is NOT affected by rollback — it pre-existed and was not patched in this session.
