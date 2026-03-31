# 01 — BOOTSTRAP

## Versions
- node: v18.19.1
- pnpm: 10.30.2
- cargo: 1.94.0 (85eff7c80 2026-01-15)
- rustc: 1.94.0 (4a4ef493e 2026-03-02)

## Git
- SHA: 68085d2be (HEAD -> MAIN)
- Branch: MAIN
- Status: clean (no uncommitted changes before patches)

## OS Device Truth
```
arecord -l:
  card 0: PCH [HDA Intel PCH] ALC897 Analog — CAPTURE present
  card 1: K66 [K66] USB Audio — CAPTURE subdevice 0/1 (IN USE = app using it)
  
ls /dev/video*: no video devices found
pactl list short sources: no output (PipeWire/PulseAudio session not bound to this shell)
```

## Audio truth: HARDWARE EXISTS
K66 USB Audio is a real microphone device (subdevice 0/1 — in use).
ALC897 Analog also has capture capability.

## Camera truth: NO HARDWARE
No /dev/video* devices found. Camera features BLOCKED_BY_OS.
