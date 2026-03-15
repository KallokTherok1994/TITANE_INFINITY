# REGISTRE DES CORRECTIONS APPLIQUÉES

## 3 corrections appliquées — cargo check PASS, verify_instructions PASS=20 FAIL=0

---

## FIX-D04/D03 — Conditionner jauges corps/énergie (CameraPage.tsx)

**Défaut ID :** D04 + D03
**Root cause :** estimationCount===0 et landmarksDetected===false en permanence, mais jauges affichées inconditionnellement comme si des mesures réelles étaient disponibles.
**Preuve avant :** visionAffect.ts:~274 — `estimationCount: 0` (défaut). Aucun modèle ML.
**Fichier modifié :** src/pages/CameraPage.tsx
**Patch résumé :**
- Entourer jauges affect d'un `{affectEstimation.estimationCount > 0 ? <jauges/> : <disclaimer/>}`
- Entourer body stats d'un `{bodyLanguage.landmarksDetected ? <stats/> : <disclaimer/>}`
**Rollback :** `git restore -- src/pages/CameraPage.tsx`
**Preuve après :** grep confirme condition présente, cargo check PASS
**Garde recurrence :** AH-2026-03-15-VISION-001 dans autoheal_rules.jsonl

---

## FIX-D01 — send_message : stub → erreur explicite (chat.rs)

**Défaut ID :** D01
**Root cause :** `Ok(json!({ok:true, content:"response"}))` hardcodé — stub silencieux.
**Preuve avant :** chat.rs:39 — `FIXME: stub response`
**Fichier modifié :** src-tauri/src/commands/chat.rs
**Patch résumé :**
- Remplacé `Ok(json!({...}))` par `Err("send_message: not implemented — use conversation_generate")`
- Le stub ne masque plus l'échec. Toute logique frontend appelant send_message reçoit une erreur claire.
**Rollback :** `git restore -- src-tauri/src/commands/chat.rs`
**Preuve après :** grep `not implemented` chat.rs ✅, cargo check PASS
**Garde recurrence :** AH-2026-03-15-CHAT-001 dans autoheal_rules.jsonl

---

## FIX-D02 — ChatPage : monter ChatWindow (ChatPage.tsx)

**Défaut ID :** D02
**Root cause :** Zone messages vide — commentaire `{/* Chat interface will be rendered here */}`, ChatWindow jamais monté.
**Preuve avant :** ChatPage.tsx:84 — commentaire seul
**Fichiers modifiés :** src/pages/ChatPage.tsx
**Patch résumé :**
- Import `ChatWindow` depuis `@/components/ChatWindow`
- Monter `<ChatWindow />` dans la zone `flex-1 overflow-auto`
- ChatWindow gère l'état messages/input via `useChat` hook autonomement
**Rollback :** `git restore -- src/pages/ChatPage.tsx`
**Preuve après :** grep `<ChatWindow` ChatPage.tsx ✅, cargo check PASS
**Garde recurrence :** AH-2026-03-15-CHAT-002 dans autoheal_rules.jsonl

---

## Vérification finale

```
cargo check --manifest-path=src-tauri/Cargo.toml → EXIT 0
bash scripts/verify_instructions.sh → PASS=20 FAIL=0
bash scripts/autoheal/detect_recurrence.sh → no recurrence
```
