# 04_UI_SURFACE_MAP (Affected Surfaces)

## TopNav (post-fusion)
| # | Entry | Route | Visible | Runtime | Notes |
|---|-------|-------|---------|---------|-------|
| 1 | TITANE | /titane | ✅ browser (unproven desktop) | ✅ TitanePage | Slot 1 |
| 2 | TIME | /time | ✅ | ✅ | Slot 2 |
| 3 | ADMIN | /admin | ✅ | ✅ | Slot 3 |
| 4 | DEV | /dev | ✅ | ✅ | Slot 4 |
| 5 | FUSION | /fusion | ✅ | ✅ | Slot 5 |
| 6+ | OPTIMIZE, TOTAL DEV | overflow | ✅ Plus menu | ✅ | Overflow |
| ~~TWIN~~ | ~~removed~~ | ~~/twins~~ | ~~overflow~~ | — | REMOVED — redirects to /titane |

## TitanePage Sections (post-fusion)
| Tab | TestId | Mounted | Notes |
|-----|--------|---------|-------|
| 💬 Chat | tab-conversation | ConversationSection | Unchanged |
| 📊 Vue | tab-overview | OverviewSection | Unchanged |
| 📷 Vision | tab-vision | VisionSection | Unchanged |
| 🧬 Identité | tab-identity | IdentitySection | Unchanged |
| 💾 Mémoire | tab-memory | MemorySection | Unchanged |
| 🔄 Évolution | tab-memory-evolution | MemoryEvolutionSection | Unchanged |
| ⚡ XP | tab-progression | ProgressionSection | Unchanged |
| 🌱 Transform | tab-transformation | TransformationSection | Unchanged |
| **🔀 Symbiose** | **tab-symbiose** | **TwinEvolutionPanel** | **NEW — TWINS fusion** |

## Routes
| Route | Target | Status |
|-------|--------|--------|
| /titane | TitanePage | ✅ |
| /twins | → /titane redirect | ✅ Safe |
| /twin | → /titane redirect | ✅ Safe |

## Classification
- TITANE + Symbiose tab: PROVEN_VISIBLE_ONLY (TypeScript clean; no live runtime run this session)
- IPC chain: PROVEN_RUNTIME (unchanged, prior sessions certified)
- Desktop: DESKTOP_UNPROVEN (no Tauri binary in env)
