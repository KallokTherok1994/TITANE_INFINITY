# 11 — ALIGNEMENT DOCS ET REGISTRE
## FINAL_CONSOLIDATION_FRONTEND_BACKEND_2026-03-06_1450_29f9fe0

---

## Docs alignées (aucune modification requise)

| Doc | Statut | Raison |
|-----|--------|--------|
| `src-tauri/capabilities/chat_ai.json` | ✅ CORRIGÉ (session 3) | `chat_generate` retiré |
| `src/lib/tauriCommands.ts` | ✅ INCHANGÉ | Source canonique — correcte |
| `src/lib/ipcContract.ts` | ✅ INCHANGÉ | Contrat correct |
| `src/utils/invoke.ts` | ✅ INCHANGÉ | normalizeIpcResponse() correct |
| `src-tauri/capabilities/audio_tts.json` | ✅ INCHANGÉ — PASS | Aligné après correction audio |
| `src-tauri/capabilities/self_heal.json` | ⚠️ P2 — autonomy_* stale | À nettoyer lors d'une prochaine session |
| `src-tauri/capabilities/developer_mode.json` | ⚠️ P2 — engines_devmode_* stale | À nettoyer |
| `src-tauri/capabilities/singularity.json` | ⚠️ P2 — aliases courts stale | À nettoyer |

---

## Registres gouvernance

| Registre | Statut | Entrées |
|----------|--------|---------|
| `scripts/autoheal/autoheal_rules.jsonl` | ✅ À JOUR | 56+1 entrées (AH-0042, AH-0043, AH-0044) |
| `registry/ui-events.jsonl` | ✅ INCHANGÉ | Pas de changement UI dans cette session |
| `proof_packs/` | ✅ APPEND-ONLY | 3 nouveaux packs ajoutés |

---

## Docs stale non bloquantes

| Doc | Raison du non-alignement | Sévérité |
|-----|--------------------------|---------|
| `src-tauri/src/handlers.rs` | Macro `generate_titane_handlers!` jamais appelée | P2 — confusant seulement |
| `src/core/commands/TAURI_COMMANDS.ts` | Redéclaration partielle de tauriCommands.ts | P2 — pas de risque runtime |
| Packs historiques dégradés | Supersédés par les audits récents | HISTORIQUE |

---

## Conclusion

Les docs et registres sont alignés avec la vérité runtime pour toutes les surfaces P1.
Les surfaces P2 stale sont documentées et dans le budget toléré.
Aucune modification de doc n'est requise pour sceller ce PR.
