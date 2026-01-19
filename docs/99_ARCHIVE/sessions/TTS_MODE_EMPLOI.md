# 🎤 TITANE∞ TTS - MODE D'EMPLOI RAPIDE

## ⚡ DÉMARRAGE RAPIDE

### 1️⃣ Lancer le service TTS (Terminal 1)
```bash
cd ~/Documents/TITANE_INFINITY/tts-service
./start_tts_service.sh
```

### 2️⃣ Lancer TITANE∞ (Terminal 2)
```bash
cd ~/Documents/TITANE_INFINITY
pnpm run dev:tauri
```

### 3️⃣ Tester
**Panel de test:** `http://localhost:5173/test/tts`

**API directe:**
```bash
curl http://localhost:8765/api/v1/tts/health
```

---

## 🎨 UTILISATION DANS LE CODE

```typescript
import { hybridTTS } from '@/services/tts/hybridTTS';

// Synthèse simple
await hybridTTS.speak("Bonjour TITANE");

// Avec style personnalisé
await hybridTTS.speak("Bonjour", {
  voice: "voix féminine énergique et dynamique"
});

// Modifier style (depuis IA)
await hybridTTS.updateVoiceStyle(
  "voix féminine douce et apaisante",
  true  // Sauvegarder
);
```

---

## 📊 PERFORMANCE

**Mode CPU** (actuel): 1-3s
**Mode GPU** (avec ROCm): 200-500ms

**Pour activer GPU:** Voir `UPGRADE_GPU_ROCM.md`

---

## 🔧 DÉPANNAGE EXPRESS

### Service ne démarre pas
```bash
cd ~/Documents/TITANE_INFINITY/tts-service
source venv-parler-tts/bin/activate
python3 tts_api_server.py
# Voir erreurs dans console
```

### Erreur "Connection refused"
```bash
# Vérifier service actif
curl http://localhost:8765/api/v1/tts/health
```

---

## 📚 DOCUMENTATION COMPLÈTE

- Installation: `TTS_PARLER_INSTALLATION_GUIDE.md`
- Intégration: `README_TTS_INTEGRATION.md`
- Commandes: `TTS_QUICK_REFERENCE.md`
- GPU: `UPGRADE_GPU_ROCM.md`

---

**© 2025 TITANE∞**
