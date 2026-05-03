# 09_DEVICE_MATRIX

| device_label | frontend_detected | selectable | preview_opens | frame_received | stable_x3 | classification | proof_ref |
|---|---|---|---|---|---|---|---|
| [HARDWARE ABSENT] | UNKNOWN | UNKNOWN | NO | NO | NO | BLOCKED_HARDWARE | /dev/video* absent |

## Preuve
```bash
ls /dev/video* → NO_VIDEO_DEVICES
v4l2-ctl --list-devices → V4L2_NOT_AVAILABLE
```

Camera runtime certification: BLOCKED_HARDWARE.
Certification statique uniquement: PASS (honnêteté UI prouvée).
