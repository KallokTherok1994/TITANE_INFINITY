# 02_TITANE_NAV_MAP

## TopNav Structure (pre-fusion)
| # | id | label | route | visible slot | overflow |
|---|----|----|-------|---|---|
| 1 | titane | TITANE | /titane | ✅ slot 1 | - |
| 2 | time | TIME | /time | ✅ slot 2 | - |
| 3 | admin | ADMIN | /admin | ✅ slot 3 | - |
| 4 | dev | DEV | /dev | ✅ slot 4 | - |
| 5 | fusion | FUSION | /fusion | ✅ slot 5 | - |
| 6 | optimization | OPTIMIZE | /optimization | - | ✅ Plus menu |
| 7 | **twins** | **TWIN** | **/twins** | - | **✅ Plus menu** |
| 8 | total-dev | TOTAL DEV | /total-dev | - | ✅ Plus menu |

**FINDING: TWINS was in overflow Plus menu — navigation island, not under TITANE.**

## TitanePage Sections (pre-fusion)
| tab | label | testid |
|-----|-------|--------|
| conversation | 💬 Chat | tab-conversation |
| overview | 📊 Vue | tab-overview |
| vision | 📷 Vision | tab-vision |
| identity | 🧬 Identité | tab-identity |
| memory-map | 💾 Mémoire | tab-memory |
| memory-evolution | 🔄 Évolution | tab-memory-evolution |
| progression | ⚡ XP | tab-progression |
| transformation | 🌱 Transform | tab-transformation |

**No twin/symbiose section existed in TitanePage pre-fusion.**

## Post-fusion TopNav
| # | id | label | route | visible slot | overflow |
|---|----|----|-------|---|---|
| 1 | titane | TITANE | /titane | ✅ slot 1 | - |
| 2 | time | TIME | /time | ✅ slot 2 | - |
| 3 | admin | ADMIN | /admin | ✅ slot 3 | - |
| 4 | dev | DEV | /dev | ✅ slot 4 | - |
| 5 | fusion | FUSION | /fusion | ✅ slot 5 | - |
| 6 | optimization | OPTIMIZE | /optimization | - | ✅ Plus menu |
| 7 | total-dev | TOTAL DEV | /total-dev | - | ✅ Plus menu |

**TWINS removed from nav — now canonical inside TITANE > Symbiose tab.**

## Post-fusion TitanePage Sections
| tab | label | testid |
|-----|-------|--------|
| ... (all 8 above) | ... | ... |
| **symbiose** | **🔀 Symbiose** | **tab-symbiose** |
