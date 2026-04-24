# 07 — QUARANTAINES

## Q3 — PRODUCT_UNPROVEN (commit 536d86574)

**Problème :** Le commit 536d86574 fixe un guard IPC (send_message→Err), branche ChatWindow,
et conditionne les jauges affect. Ces changements sont validés T3 (BUILD_LOCAL).
Cependant les messages de commit et proof packs ne mentionnent PAS explicitement
l'absence de test runtime/produit.

**Pourquoi Quarantaine :** Risque de malinterprétation future ("VISION_CHAT_AUDIT = product certified").
En réalité : T4/T5 = BLOCKED_ENV (Node.js v18 incompatible, app non lancée).

**Ce qui N'a PAS été Modifié :** Aucun fichier — quarantaine documentaire.

**Condition de Déblocage :**

- Node.js ≥20 + `pnpm dev` + test ChatWindow visible + test affect disclaimer visible = T5 PRODUCT_LOCAL
- Ajouter note "T4/T5 ABSENT — runtime not tested" aux proof packs concernés

**Prochaine Action (< 30 min) :**

```bash
node --version  # Mettre à jour vers ≥20.0.0
# Puis: pnpm dev + vérification visuelle ChatWindow + CameraPage
```

---

## Q1 — PARALLEL_PROOF_NOT_LOCAL (artifacts VISION_CHAT_SYSTEM_AUDIT)

**Problème :** proof_packs/VISION_CHAT_SYSTEM_AUDIT_2026-03-15_1409_c59e9b5b3/ committé
sans revalidation locale complète de son contenu (rapport 01_BOOTSTRAP.md = 1033 lignes,
issu d'un agent parallèle).

**Pourquoi Quarantaine :** Le contenu est factuel mais les claims runtime de ces rapports
(cargo check dans son propre contexte, etc.) sont PARALLEL_EVIDENCE_ONLY pour cet audit.

**Ce qui N'a PAS été Modifié :** Les proof packs — lecture seule dans cet audit.

**Condition de Déblocage :**

- Non critique — artifacts de documentation. Commit déjà effectué.
- Acceptable comme référence d'audit, pas comme preuve de closure locale.

---

## Q-AUDIO-001 — voice_synthesize_speech deprecated dans allowlist

**Reporté de l'audit AUDIO_VOICE_FORENSIC :** voir proof*packs/AUDIO_VOICE_FORENSIC*\*/reports/11_QUARANTINE.md Q-001.
Non résolu. Non critique. PR capabilities à ouvrir.

---

## Q-AUDIO-002 — Stubs voice_play_audio/calibrate/wake_word

**Reporté de l'audit AUDIO_VOICE_FORENSIC :** voir Q-003.
Décision architecture, backlog.
