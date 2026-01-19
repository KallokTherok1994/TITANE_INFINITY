# 🚀 TITANE∞ TTS - COMMANDES RAPIDES

## 📦 INSTALLATION (UNE SEULE FOIS)

```bash
cd /home/titane/Documents/TITANE_INFINITY
./install_parler_tts.sh
```

---

## 🎬 DÉMARRAGE

### Option 1: Manuel (2 terminaux)

**Terminal 1 - Service TTS:**
```bash
cd /home/titane/Documents/TITANE_INFINITY/tts-service
./start_tts_service.sh
```

**Terminal 2 - TITANE∞:**
```bash
cd /home/titane/Documents/TITANE_INFINITY
pnpm run dev:tauri
```

### Option 2: Systemd (service auto)

**Première fois:**
```bash
sudo systemctl enable titane-tts.service
sudo systemctl start titane-tts.service
```

**Ensuite (démarrage auto):**
```bash
# Service démarre automatiquement au boot
# Juste lancer TITANE:
pnpm run dev:tauri
```

---

## ✅ VÉRIFICATIONS RAPIDES

### Service TTS actif ?
```bash
curl http://localhost:8765/api/v1/tts/health | jq
```

### GPU détecté ?
```bash
cd /home/titane/Documents/TITANE_INFINITY/tts-service
source venv-parler-tts/bin/activate
python3 -c "import torch; print('GPU:', torch.cuda.is_available())"
```

### Test audio rapide
```bash
curl -X POST http://localhost:8765/api/v1/tts/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"Test TITANE"}' \
  --output /tmp/test.wav && aplay /tmp/test.wav
```

---

## 🧪 PANEL DE TEST FRONTEND

**URL:** `http://localhost:5173/test/tts`

**Fonctions:**
- Synthèse TTS
- Modification style vocal
- Monitoring performance

---

## 🔧 DÉPANNAGE EXPRESS

### Service ne répond pas
```bash
# Si systemd:
sudo systemctl restart titane-tts.service
sudo systemctl status titane-tts.service

# Si manuel: relancer ./start_tts_service.sh
```

### GPU pas détecté
```bash
rocm-smi
# Si erreur: sudo reboot
```

### Nettoyer cache
```bash
rm -rf /home/titane/Documents/TITANE_INFINITY/tts-service/cache/audio/*
```

---

## 📊 LOGS

### Logs service TTS
```bash
# Si systemd:
sudo journalctl -u titane-tts.service -f

# Si manuel: voir console où start_tts_service.sh tourne
```

### Logs TITANE frontend
```bash
# Console navigateur (F12) ou terminal pnpm run dev:tauri
```

---

## 🎨 CODE QUICK SNIPPETS

### Synthèse simple
```typescript
import { hybridTTS } from '@/services/tts/hybridTTS';
await hybridTTS.speak("Bonjour TITANE");
```

### Modifier style vocal
```typescript
await hybridTTS.updateVoiceStyle(
  "voix féminine énergique et dynamique",
  true
);
```

### Vérifier provider actif
```typescript
const status = await hybridTTS.getStatus();
console.log(status.provider); // "parler-tts" ou "tauri" ou "webspeech"
```

---

## 📚 DOCUMENTATION COMPLÈTE

- **Guide installation:** `TTS_PARLER_INSTALLATION_GUIDE.md`
- **Résumé intégration:** `README_TTS_INTEGRATION.md`

---

## 🔗 URLS UTILES

- Service API: `http://localhost:8765`
- Health check: `http://localhost:8765/api/v1/tts/health`
- Panel test: `http://localhost:5173/test/tts`
- TITANE app: `http://localhost:5173`
- Réseau local: `http://192.168.2.16:8765` (remplacer IP)

---

## ⚡ PERFORMANCE

**Attendu avec RX 7600 XT:**
- Chargement modèle: 3-5s (une fois)
- Génération 10 mots: 200-300ms
- Génération 50 mots: 400-600ms
- VRAM: ~2.3 GB

**Si plus lent:**
- Vérifier GPU actif (`rocm-smi`)
- Fermer apps lourdes
- Limiter texte à 200 mots max

---

## 📞 SUPPORT RAPIDE

**Problème courant:** "Connection refused"

**Solution:**
1. Vérifier service actif: `curl localhost:8765/api/v1/tts/health`
2. Relancer service: `sudo systemctl restart titane-tts.service`
3. Vérifier firewall: `sudo ufw allow 8765`

**GPU non détecté:**
1. `rocm-smi` (doit montrer GPU)
2. Réinstaller PyTorch ROCm (voir guide complet)
3. Redémarrer machine

---

**© 2025 TITANE∞**
