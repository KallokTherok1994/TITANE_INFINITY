# SAFE MODE

## Boot Watchdog (existing, not modified)
- scheduleBootWatchdog() fires after 20s if BOOT:READY not emitted
- Shows fatal error overlay + reload button
- Auto-reload via BOOT_RECOVERY_ONCE_KEY (once only)

## Ollama Warmup Grace (FIX-3)
- warming_up (< 30s after first failure): retry every 5s
- offline (> 30s): fallback local, cache 45s
- circuit_open (> 5 errors): fallback local, 2 min wait

## Manual safe mode trigger
```bash
localStorage.setItem('titane_ollama_enabled', '0')   # disable Ollama
localStorage.removeItem('titane_boot_recovery_once')  # reset watchdog
window.location.reload()
```
