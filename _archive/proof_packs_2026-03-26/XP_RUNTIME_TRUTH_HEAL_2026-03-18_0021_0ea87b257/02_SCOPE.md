# SCOPE

Files patched:
1. src/App.tsx — Route fix: /xp → /experience
2. src/pages/Experience.tsx — Remove XP_ENGINE; use experienceService exclusively
3. src/components/chat/MemoryViewer.tsx — Remove double XP.gain() + import
4. src/components/chat/FileUploadButton.tsx — Remove double XP.gain() + import

Files read (investigation):
- src/core/experience/XP_ENGINE.ts
- src/types/experience.ts
- src/services/experienceService.ts
- src/hooks/useExperience.ts
- src/cognitive/progression/xpEngine.ts
- src/components/experience/ExpPanel.tsx
- src-tauri/src/mock_commands.rs (experience_get_state / experience_update_state)
- src-tauri/src/handlers.rs

Canonical XP model: src/types/experience.ts + src/services/experienceService.ts (v24)
