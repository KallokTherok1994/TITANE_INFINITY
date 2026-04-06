# 06 — RUNTIME ERROR CAPTURE

## Reported Errors (from user runtime capture)
- "no microphone detected" — Root cause: APISupport.hasMicrophone() checked `d.label !== ''` which returns false before permission grant. **FIXED.**
- "audio conversation mode unavailable" — Same root cause. **FIXED.**
- "no camera detected" — Root cause: no /dev/video* hardware. **HONEST BLOCK — not fixable without hardware.**

## OS Device Truth
```
# Real hardware found:
arecord -l:
  card 0: PCH [HDA Intel PCH], device 0: ALC897 Analog [ALC897 Analog]
  card 1: K66 [K66], device 0: USB Audio [USB Audio]  ← subdevice 0/1 (in use)

# No video hardware:
ls /dev/video*: no video devices
```

## After Fix
- hasMicrophone() will return `true` when audioinput devices are present (regardless of label)
- hasCamera() will return `true` only if videoinput devices exist (none on this system → honest false)
- Camera controls will still show honest "no camera" toast — correct
