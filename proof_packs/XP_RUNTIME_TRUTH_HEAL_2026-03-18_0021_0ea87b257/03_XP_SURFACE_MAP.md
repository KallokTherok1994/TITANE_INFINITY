# XP SURFACE MAP

| Surface | Visible? | Mounted? | Source (pre-patch) | Source (post-patch) | Backend Required? | Truth State |
|---|---|---|---|---|---|---|
| XP page shell (/experience) | YES | YES | Route OK | Route OK | NO | PROVEN_RUNTIME |
| /xp redirect | YES | YES | → /titane (BROKEN) | → /experience (FIXED) | NO | XP_ROUTE_BROKEN → FIXED |
| Current level card | YES | YES | XP_ENGINE.state.level | useExperience().level | NO | OUTDATED → FIXED |
| XP Total card | YES | YES | XP_ENGINE.state.total | useExperience().totalXp | NO | OUTDATED → FIXED |
| XP dans ce niveau | YES | YES | state.total % 500 (wrong formula) | totalXp - level²×100 (correct) | NO | XP_CONTRACT_DRIFT → FIXED |
| Vers niveau N+1 | YES | YES | XP_ENGINE.getXPToNextLevel() | xpForNextLevel - totalXp | NO | OUTDATED → FIXED |
| Progress bar | YES | YES | XP_ENGINE.getProgressToNextLevel() (0-100) | progress×100 (0-100) | NO | OUTDATED → FIXED |
| Domains section | YES | YES | useExperience().domains | useExperience().domains | YES (mock) | BLOCKED_BY_BACKEND → disclosed |
| Stats by source | YES | YES | XP_ENGINE.getStatsBySource() | computed from state.history | NO | OUTDATED → FIXED |
| History list | YES | YES | XP_ENGINE.state.history (XPEvent) | state.history (ExperienceGain) | NO | XP_CONTRACT_DRIFT → FIXED |
| Source disclosure label | NO | NO | absent | added | NO | UNKNOWN → DISCLOSED |
| Error state | YES | YES | absent | implicit (isLoading) | — | VISIBLE_ONLY |
| Backend status | — | — | NOT DISCLOSED | DISCLOSED via label | — | XP_FALLBACK_LYING → disclosed |
