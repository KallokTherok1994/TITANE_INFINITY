# 01 — MATRICE DE PROVENANCE

**Contexte :** Les deux commits (77735901e, 536d86574) ont déjà été effectués avant
le lancement de cet audit de discipline. La matrice ci-dessous évalue rétrospectivement
la provenance de chaque fichier.

---

## Commit HEAD~1 — 77735901e (AUDIO FIX)

| Fichier | Statut | Classe | Provenance | Sûr | Raison |
|---|---|---|---|---|---|
| src-tauri/src/main.rs | committé | C1 CODE_FIX | LOCAL — modifié dans cette session (session principale) | OUI | Mock stubs + generate_handler enregistrés localement, cargo build EXIT 0 |
| src-tauri/capabilities/audio_tts.json | committé | C1 CODE_FIX | LOCAL — ajout get_recording_status | OUI | Diff minimal, schéma JSON valide, vérifiable localement |
| scripts/autoheal/autoheal_rules.jsonl | committé | C5 REGISTRY_APPEND | LOCAL — 2 entrées ajoutées après fix et validation schéma | OUI | Schema validé python3 JSON, backup présent raw/env/ |
| proof_packs/AUDIO_VOICE_FORENSIC_*/raw/* | committé | C4 EVIDENCE_ARTIFACT | LOCAL — générés dans cette session | OUI | Artifacts de preuve directement issus des commandes locales |
| proof_packs/AUDIO_VOICE_FORENSIC_*/reports/* | committé | C4 EVIDENCE_ARTIFACT | LOCAL — rédigés dans cette session | OUI | Rapports cohérents avec les artifacts raw locaux |
| proof_packs/VISION_CHAT_SYSTEM_AUDIT_*/\*.md | committé | **C6 PARALLEL_SESSION_ARTIFACT** | PARALLÈLE — générés par audit-subagent dans session séparée | ⚠️ VOIR NOTE | Contenu factuel, non frauduleux, mais origine parallèle |

## Commit HEAD — 536d86574 (VISION+CHAT FIX)

| Fichier | Statut | Classe | Provenance | Sûr | Raison |
|---|---|---|---|---|---|
| src-tauri/src/commands/chat.rs | committé | C1 CODE_FIX | MIXTE — staged par session parallèle, revalidé localement (cargo check EXIT 0) | OUI avec réserve | Changement minimal, logique correcte (Ok→Err), aucun invoke frontend actif, cargo check PASS |
| src/pages/CameraPage.tsx | committé | C3 UI_FIX | MIXTE — staged par session parallèle, revalidé localement (estimationCount champ vérifié) | OUI avec réserve | estimationCount défini dans types/visionAffect.ts:232, VisionDebugOverlay l'utilise déjà, cargo check PASS |
| src/pages/ChatPage.tsx | committé | C3 UI_FIX | MIXTE — staged par session parallèle, revalidé localement (ChatWindow.tsx existance vérifiée) | OUI avec réserve | ChatWindow.tsx confirmé src/components/, import syntaxe correcte, cargo check PASS |
| scripts/autoheal/autoheal_rules.jsonl | committé | C5 REGISTRY_APPEND | MIXTE — 3 entrées vision+chat issues d'audit-subagent, valides JSON | OUI | JSON 266 lignes, 0 erreurs validé python3, schéma conforme |
| proof_packs/VISION_CHAT_SYSTEM_AUDIT_*/reports/* | committé | **C6 PARALLEL_SESSION_ARTIFACT** | PARALLÈLE — audit-subagent (session 14:09) | ⚠️ VOIR NOTE | Artifacts parallèles committés sans revalidation locale complète |

## Note C6 — Artifacts Parallèles
Les proof packs VISION_CHAT_SYSTEM_AUDIT_2026-03-15_1409_c59e9b5b3/ sont
des artifacts d'une session audit-subagent distincte. Leur contenu n'a pas
été intégralement revalidé localement. Ils sont factuels (rapports d'audit)
mais leur statut de preuve est PARALLEL_EVIDENCE_ONLY pour les claims runtime.
