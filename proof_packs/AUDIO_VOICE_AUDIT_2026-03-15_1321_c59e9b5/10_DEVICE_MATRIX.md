# 10_DEVICE_MATRIX.md — Matrice Dispositifs Audio

## Enumerate inputs
- doc: get_audio_input_devices -> AudioDevice[]
- code: handler complet (PipeWire/PulseAudio/ALSA/default fallback)
- runtime: UNKNOWN (pas d acces device CI)
- tests: aucun test d integration device
- verdict: PARTIAL (code present, runtime non prouve)

## Enumerate outputs
- doc: get_audio_output_devices -> AudioDevice[]
- code: handler complet identique inputs
- runtime: UNKNOWN
- tests: aucun
- verdict: PARTIAL

## Selectionner device
- doc: set_audio_output_device(device_id), set_audio_input_device(device_id)
- code: handlers presents, utilisent pactl set-default-sink/source
- runtime: UNKNOWN
- tests: aucun
- verdict: PARTIAL

## Persister selection
- code: pas de persistance explicite (pas de sauvegarde config)
- verdict: UNKNOWN / NON PROUVE

## Hot-switch
- code: appel set_audio_*_device possible, mais no event listener
- verdict: UNKNOWN

## Device indisponible
- code: retourne Err("Erreur: ...") explicite
- verdict: PARTIAL (code present, runtime non simule)

## Permission denied
- code: aucun handler explicite de permission denied audio OS
- verdict: UNKNOWN

## Default fallback
- code: si aucun device trouve, retourne AudioDevice { id: "default", name: "Default Speaker" }
- verdict: PROVEN (code) — runtime non verifie
