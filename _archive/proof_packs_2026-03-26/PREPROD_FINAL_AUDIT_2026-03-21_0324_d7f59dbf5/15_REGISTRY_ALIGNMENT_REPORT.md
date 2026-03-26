# 15_REGISTRY_ALIGNMENT_REPORT

## registry/ui-events.jsonl
| Status | Details |
|--------|---------|
| Pre-patch last entry | 2026-03-15 (vision overlay truth fix) |
| Gap | TWINS menu fusion (2026-03-21) not recorded |
| Fix | Entry appended: id=ui-event-2026-03-21T03:10:00Z-twins-menu-fusion-symbiose |
| Post-patch | ✅ ALIGNED |

## registry/proofpack-index.jsonl
| Status | Details |
|--------|---------|
| Pre-patch last entry | 2026-03-21T03:05:20Z (PREPROD_FINAL_AUDIT at a3212d6fb) |
| Gap | TWINS_MENU_FUSION proof pack not indexed |
| Fix | Entry appended: source_pack=TITANE_TWINS_MENU_FUSION_2026-03-21_0310_a3212d6fb |
| Post-patch | ✅ ALIGNED |

## Other registries
| Registry | Status |
|----------|--------|
| registry/autoheal_rules.jsonl | ✅ AH-2026-03-21-TWINS-FUSION present |
| registry/repo-events.jsonl | Not audited (no explicit change in this session) |
| registry/chat-events.jsonl | Not audited (no chat chain change) |

## Classification: G_REGISTRY_ALIGNMENT = PASS (after fix)
