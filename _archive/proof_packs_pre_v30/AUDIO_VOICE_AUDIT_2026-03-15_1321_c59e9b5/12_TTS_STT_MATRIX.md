# 12_TTS_STT_MATRIX.md — Matrice TTS/STT

## TTS: Piper
- Provider: Piper local (~/.local/bin/piper)
- Input: String
- Output: Fichier WAV temp + lecture paplay/aplay
- Mode: Synchrone (process)
- Buffer: Fichier temp /tmp/titane_tts_output.wav
- Sample rate: defini par modele Piper
- Erreur: explicite (piper non installe, modele manquant, fichier vide)
- Retry: auto_fallback=true -> espeak
- Cancel: tts_stop (arrete aplay/paplay par nom de processus)
- Verdict: PARTIAL (runtime non prouve sans Piper installe)

## TTS: espeak
- Provider: espeak systeme
- Input: String
- Output: Lecture directe espeak
- Mode: Synchrone
- Erreur: propagee
- Verdict: PARTIAL (runtime non prouve)

## TTS: hybridTTS Strategie 3 (Web Speech API)
- Provider: window.speechSynthesis
- Input: String
- Output: Audio navigateur
- Mode: Asynchrone
- I2: VIOLATION (direct browser API hors IPC)
- Verdict: DOC_ONLY / LEGACY (non recommande en production Tauri)

## STT: voice_start_listening (overdrive)
- Provider: Pas de moteur ASR reel (etat interne seulement)
- Input: N/A
- Output: "Ecoute activee" String
- Mode: Flag booleien is_listening=true
- Transcription: NON — voice_transcribe_audio lit audio_data param, appelle process whisper externe via CLI
- Verdict: STUB (infrastructure sans moteur STT reel)

## STT: Whisper streaming (commands_v21)
- Provider: AUCUN (stub)
- Input: Vec<u8> chunks
- Output: Ok(()) seulement
- Mode: Streaming chunks accumules dans Vec
- Transcription: AUCUNE — chunks jamais traites
- Verdict: STUB

## STT: useAudioChat.tsx Web Speech API
- Provider: window.SpeechRecognition / webkitSpeechRecognition
- I2: VIOLATION
- Verdict: DOC_ONLY (non supporte Linux en general)
