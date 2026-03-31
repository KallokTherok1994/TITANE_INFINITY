# XP CHAIN MATRIX

| Surface | UI source (post-patch) | hook/store | service | invoke | rust command | backend module | response shape | live/static | freshness status | truth status |
|---|---|---|---|---|---|---|---|---|---|---|
| Global level | useExperience().level | useExperience | experienceService | safeInvoke('experience_get_state') | mock_commands.rs::experience_get_state | MOCK | ExperienceState { totalXp, level, ... } | localStorage (browser) / MOCK (Tauri) | Session-persistent | DEGRADED (mock) — disclosed |
| XP Total | useExperience().totalXp | useExperience | experienceService | same | same | MOCK | same | same | same | DEGRADED — disclosed |
| Progress | useExperience().progress | useExperience | getProgressToNextLevel() | — | — | — | 0-1 float | computed | accurate for current session | PROVEN_RUNTIME |
| Domains | useExperience().domains | useExperience | getAllDomains() | safeInvoke('experience_get_state') | mock | MOCK | Record<string, ExperienceDomain> | localStorage / MOCK | session | DEGRADED — disclosed |
| History | useExperience().state.history | useExperience | experienceService.history | save on each award | mock (save no-op in Tauri) | MOCK | ExperienceGain[] | localStorage / MOCK | session | DEGRADED — disclosed |
| XP award (chat) | useChat.ts | useChat | awardExperience() | safeInvoke('experience_update_state') | mock | MOCK | ok/error | live in session | session | DEGRADED — no persistence in Tauri |
| XP award (memory) | MemoryViewer.tsx | — | awardExperience() only (XP.gain removed) | same | mock | MOCK | same | live in session | session | FIXED (double-award removed) |
| XP award (file) | FileUploadButton.tsx | — | awardExperience() only (XP.gain removed) | same | mock | MOCK | same | live in session | session | FIXED (double-award removed) |

## Backend status
experience_get_state: MOCK (src-tauri/src/mock_commands.rs:846) — returns hardcoded zeros (level:1, all XP:0)
experience_update_state: MOCK (src-tauri/src/mock_commands.rs:919) — accepts state but does NOT persist
→ XP_BACKEND_INACTIVE: classification confirmed, NOT fixed (requires real backend impl)
→ Disclosure: added to Experience page header
