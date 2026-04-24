# 04 OS AUDIO TRUTH — Ubuntu PipeWire

# TITANE∞ — audio_truth_2026-03-15_1902_e91124efc

## Stack actif

- PipeWire 1.0.5 (WirePlumber orchestrateur)
- PulseAudio: NON installé (pactl commande absente)
- ALSA: disponible (arecord/aplay fonctionnels)
- État: OS_AUDIO_OK

## Devices OUTPUT (Sinks — wpctl)

| ID wpctl | Nom                                           | Default | Vol  |
| -------- | --------------------------------------------- | ------- | ---- |
| 33       | Navi 31 HDMI/DP Audio Digital Stereo (HDMI 2) | ★ OUI   | 1.00 |
| 49       | Built-in Audio Stéréo numérique (IEC958)      | non     | 1.00 |
| 51       | K66 Stéréo analogique                         | non     | 0.40 |

## Devices INPUT (Sources — wpctl)

| ID wpctl | Nom                              | Default | Vol  |
| -------- | -------------------------------- | ------- | ---- |
| 50       | Built-in Audio Stéréo analogique | non     | 1.00 |
| 52       | K66 Stéréo analogique            | ★ OUI   | 1.00 |

## Devices ALSA (aplay / arecord)

**Playback (aplay -l):**

- card 0: PCH [HDA Intel PCH] — ALC897 Analog, ALC897 Digital
- card 1: K66 [K66] — USB Audio
- card 2: HDMI [HDA ATI HDMI] — PanasonicTV0, ASUS MG28U, LG TV, U32J59x

**Capture (arecord -l):**

- card 0: PCH — ALC897 Analog, ALC897 Alt Analog
- card 1: K66 — USB Audio

## Stream actif titane-infinity

```
titane-infinity (PID 50638 / 52010)
  output_FR → LG TV:playback_FR [active]
  output_FL → LG TV:playback_FL [active]
```

## TTS engines disponibles

- espeak: NON installé (commande not found)
- espeak-ng: NON installé (commande not found)
- piper: NON installé (~/.local/bin/piper absent)
- sox: NON installé
- aplay: OUI
- pw-play: OUI (/usr/bin/pw-play)
- pw-record: OUI (/usr/bin/pw-record)
- timeout: OUI (/usr/bin/timeout, GNU coreutils 9.4)

## Conséquence sur TTS

Speaker test tentera espeak/espeak-ng/piper → échec honnête (error message retourné).
PAS de faux succès. OS_AUDIO_PARTIAL pour TTS uniquement.
Audio hardware OK — OS_AUDIO_OK pour capture/playback audio brut.
