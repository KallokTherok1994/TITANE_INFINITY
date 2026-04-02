# 11 — QUARANTAINE

## Q-001 : voice_synthesize_speech (D5-001)

**Problème :** Commande dépréciée depuis v20.0 présente dans `capabilities/audio_tts.json`.
Non enregistrée dans generate_handler![] (intentionnel). Handler = stub 16KB silence.

**Pourquoi Quarantaine :** Allowlist gelée dans ce scope. Enregistrer un stub trompeur serait une régression.

**Ce qui N'a PAS été modifié :** capabilities/audio_tts.json, overdrive/voice_engine.rs

**Condition de Déblocage :**
1. `grep -rn "voice_synthesize_speech" src/ --include="*.ts"` → si 0 résultat : retrait safe
2. PR dédiée pour retirer la ligne de capabilities/audio_tts.json

**Prochaine Action (< 30 min) :**
```bash
grep -rn "voice_synthesize_speech" src/ --include="*.ts" --include="*.tsx"
```

---

## Q-002 : get_recording_status (D2-001)

**Problème :** `audioSelfHeal.ts` appelle `secureInvoke<any>('get_recording_status', {})`.
Absent de l'allowlist ET de generate_handler![]. Handler existe dans audio/commands.rs.

**Pourquoi Quarantaine :** Double gel (allowlist + handler non enregistré). Impact gracieux (catch).

**Ce qui N'a PAS été modifié :** capabilities/audio_tts.json, main.rs (hors fix-001/002)

**Condition de Déblocage :**
1. Ajouter `"get_recording_status"` à capabilities/audio_tts.json
2. Ajouter `audio::commands::get_recording_status` + mock stub dans main.rs
3. Vérifier type de retour côté frontend

**Prochaine Action (< 30 min) :**
PR capabilities pour Q-001 + Q-002 simultanément.

---

## Q-003 : Stubs voice_play_audio / voice_calibrate_microphone / voice_detect_wake_word (D13)

**Problème :** 3 commandes enregistrées sont des stubs sans implémentation réelle.

**Pourquoi Quarantaine :** Choix d'architecture (rodio vs subprocess, Porcupine vs Snowboy) dépassant scope.

**Ce qui N'a PAS été modifié :** overdrive/voice_engine.rs

**Condition de Déblocage :**
- voice_play_audio : intégrer `rodio` ou appel `aplay` comme dans tts_speak()
- voice_calibrate_microphone : arecord + analyse RMS
- voice_detect_wake_word : Porcupine / Snowboy / impl custom

**Prochaine Action (< 30 min) :** Documenter dans CHANGELOG. Ne pas bloquer CI.

---

## Q-004 : BUILD_RISK mode mock confirmé (D4 — LEVÉ PARTIELLEMENT)

**Note :** FIX-002 a ajouté les mock stubs pour transcribe_audio et is_recording.
Le risque BUILD_RISK est résolu statiquement (STATIC_PROVEN).
**Condition de Closure Complète :**
```bash
cargo build --features "custom-protocol,mock,audio-capture" 2>&1 | grep "^error"
# Attendu : 0 erreurs
```
