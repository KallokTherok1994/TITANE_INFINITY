# DIFF FILES

## 1. src/App.tsx (1 line)
- Route /xp: Navigate to="/titane" → Navigate to="/experience"

## 2. src/pages/Experience.tsx (major state section rewrite)
- REMOVED: import { XP } from '../core/experience/XP_ENGINE'
- REMOVED: import { useEffect } from 'react' (no longer needed)
- REMOVED: const [state, setState] = useState(XP.state)
- REMOVED: useEffect setInterval polling XP.state every second
- REMOVED: const stats = XP.getStatsBySource()
- REMOVED: const progress = XP.getProgressToNextLevel() (returned 0-100, old formula)
- REMOVED: const xpToNext = XP.getXPToNextLevel() (old formula)
- REMOVED: const xpInLevel = state.total % 500 (old linear formula)
- REMOVED: JSX refs to state.level, state.total, state.history
- REMOVED: event.description conditional (not in ExperienceGain type)
- ADDED: full destructure from useExperience(): { state, domains, isLoading, totalXp, level, xpForNextLevel, progress }
- ADDED: xpInLevel = totalXp - level*level*100 (correct quadratic formula)
- ADDED: xpPerLevel = xpForNextLevel - level*level*100
- ADDED: xpToNext = xpForNextLevel - totalXp
- ADDED: progressPct = progress * 100
- ADDED: stats computed via useMemo from state.history
- ADDED: source disclosure label in header ("Données locales — backend mock")
- ADDED: event.domainId display in history (replaces event.description)
- FIXED: stat cards now show correct values with correct formula

## 3. src/components/chat/MemoryViewer.tsx
- REMOVED: import { XP } from '../../core/experience/XP_ENGINE'
- REMOVED: XP.gain(XP_REWARDS.MEMORY_INGESTION, 'memory_promote', ...) in handlePromote
- REMOVED: XP.gain(20, 'memory_archive', ...) in handleArchive

## 4. src/components/chat/FileUploadButton.tsx
- REMOVED: import { XP } from '../../core/experience/XP_ENGINE'
- REMOVED: XP.gain(XP_REWARDS.FILE_IMPORT, 'file_import', ...) in file import success path
- REMOVED: XP.gain(10, 'file_analysis', ...) in file analysis local fallback path

## 5. scripts/autoheal/autoheal_rules.jsonl
- ADDED: AH-2026-03-18-XP-RUNTIME-TRUTH-HEAL entry (full compliant format)
