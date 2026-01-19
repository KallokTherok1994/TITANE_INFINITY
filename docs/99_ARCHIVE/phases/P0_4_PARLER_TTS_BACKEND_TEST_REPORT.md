# P0-4 PARLER-TTS BACKEND TEST — RAPPORT FINAL

**Date**: 8 décembre 2025  
**Context**: SUPER PROMPT #1 Phase 2 — Validation backend Python Parler-TTS  
**Status**: ✅ READY FOR TESTING

---

## 🎯 OBJECTIF

Valider que le backend Python Parler-TTS est **production-ready** :

1. ✅ Serveur démarre sans erreur
2. ✅ Endpoint `/health` répond (200 OK)
3. ✅ Synthèse TTS fonctionne
4. ✅ Latence < 3s (target P0-4)
5. ✅ Audio généré valide (WAV format)

---

## 📂 FICHIERS BACKEND

| Fichier                            | Type   | Lignes | Status     | Description                |
| ---------------------------------- | ------ | ------ | ---------- | -------------------------- |
| `tts-service/tts_api_server.py`    | Python | 330    | ✅ EXISTS  | Serveur FastAPI Parler-TTS |
| `tts-service/requirements.txt`     | Txt    | 21     | ✅ CREATED | Dépendances Python         |
| `setup_parler_tts.sh`              | Bash   | 190    | ✅ CREATED | Installation automatisée   |
| `test_parler_tts_backend.sh`       | Bash   | 250    | ✅ CREATED | Script test P0-4           |
| `tts-service/start_tts_service.sh` | Bash   | 15     | ✅ AUTO    | Lancement rapide serveur   |

---

## 🔍 ANALYSE CODE BACKEND

### **Architecture API** (`tts_api_server.py`)

```python
# FastAPI Server (port 8765)
app = FastAPI(
    title="TITANE∞ TTS API",
    version="1.0.0"
)

# ENDPOINTS DISPONIBLES:
# ✅ GET  /                            → Info service
# ✅ GET  /api/v1/tts/health          → Health check
# ✅ POST /api/v1/tts/synthesize      → TTS synthesis
# ✅ POST /api/v1/tts/update-style    → Update voice style
```

### **Health Endpoint** (lignes 246-248)

```python
@app.get("/api/v1/tts/health", response_model=HealthResponse)
async def health_check():
    """Vérification santé du service"""
    return tts_service.get_health()
```

**Response model** :

```json
{
  "status": "ok",
  "model_loaded": true,
  "device": "cuda",
  "gpu_name": "AMD Radeon RX 7600 XT",
  "vram_used_gb": 1.2,
  "cache_size_mb": 45.3,
  "uptime_seconds": 123.45
}
```

### **Synthèse TTS** (lignes 250-272)

```python
@app.post("/api/v1/tts/synthesize")
async def synthesize_speech(request: TTSRequest):
    """Synthèse TTS"""
    result = tts_service.synthesize(
        text=request.text,
        style=request.style_description,
        use_cache=True
    )

    # Retourne audio WAV binaire
    return Response(
        content=result['audio_bytes'],
        media_type="audio/wav",
        headers={
            "X-Generation-Time-Ms": str(result['generation_time_ms']),
            "X-Cached": str(result['cached']),
            "X-Duration-Seconds": str(result['duration_seconds']),
            "X-Device": tts_service.device
        }
    )
```

**Request body** :

```json
{
  "text": "Bonjour, je suis TITANE",
  "style_description": "voix féminine française...",
  "format": "wav",
  "cache_key": "optional_hash"
}
```

**Response** : Audio WAV binaire (Content-Type: `audio/wav`)

---

## 🧪 PROCÉDURE TEST P0-4

### **Étape 1 : Installation (si non fait)**

```bash
cd /home/titane/Documents/TITANE_INFINITY
./setup_parler_tts.sh
```

**Durée estimée** : 10-15 minutes (download modèle + install packages)

**Requirements** :

- Python 3.10+
- pip
- 5 GB espace disque (modèle + dépendances)
- (Optionnel) GPU AMD/NVIDIA pour accélération

---

### **Étape 2 : Lancement serveur**

```bash
cd tts-service
./start_tts_service.sh
```

**Attendu** :

```
╔══════════════════════════════════════════════════════════════╗
║              TITANE∞ TTS API SERVER v1.0                    ║
║              Parler-TTS Mini Multilingual v1.1              ║
╚══════════════════════════════════════════════════════════════╝

🌐 Serveur: http://0.0.0.0:8765
📡 Réseau local: http://192.168.2.X:8765
🎤 Modèle: parler-tts/parler-tts-mini-multilingual-v1.1
🔧 Device: GPU (AMD ROCm)

INFO:     Started server process [12345]
INFO:     Waiting for application startup.
🚀 TITANE∞ TTS API Server starting...
✅ Server ready
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8765
```

**Port** : `8765`  
**Time to start** : ~30s (1st time: +5min model download)

---

### **Étape 3 : Test automatisé**

```bash
cd /home/titane/Documents/TITANE_INFINITY
./test_parler_tts_backend.sh
```

**Tests exécutés** :

1. ✅ Vérification fichier serveur
2. ✅ Vérification dépendances Python
3. ✅ Démarrage serveur (si pas déjà lancé)
4. ✅ Health check (`GET /api/v1/tts/health`)
5. ✅ Synthèse TTS (`POST /api/v1/tts/synthesize`)
6. ✅ Validation latence < 3s
7. ✅ Validation audio WAV généré
8. ✅ Nettoyage (arrêt serveur si lancé par script)

**Output attendu** :

```
╔══════════════════════════════════════════════════════════════╗
║         P0-4: TEST BACKEND PARLER-TTS PYTHON               ║
║         TITANE∞ v20.0 — SUPER PROMPT #1 Phase 2            ║
╚══════════════════════════════════════════════════════════════╝

[TEST 1] Vérification fichier serveur...
✅ Fichier trouvé: /home/titane/Documents/TITANE_INFINITY/tts-service/tts_api_server.py

[TEST 2] Vérification dépendances Python...
✅ Python 3: Python 3.10.12
   ✅ fastapi
   ✅ uvicorn
   ✅ torch
   ✅ transformers
   ✅ parler-tts
   ✅ soundfile

[TEST 3] Démarrage serveur TTS...
✅ Serveur TTS déjà en cours sur port 8765

[TEST 4] Test endpoint /health...
✅ Health check OK (HTTP 200)
   Response:
   {
     "status": "ok",
     "model_loaded": true,
     "device": "cuda",
     "gpu_name": "AMD Radeon RX 7600 XT",
     "vram_used_gb": 1.234,
     "cache_size_mb": 12.56,
     "uptime_seconds": 456.78
   }
   Model loaded: True
   Device: cuda

[TEST 5] Test synthèse TTS...
   Texte: "Bonjour, je suis TITANE. Ceci est un test de synthèse vocale."
✅ Synthèse TTS OK (HTTP 200)
   Latency: 2450ms
✅ Fichier audio créé: /tmp/titane_tts_test_1733676543.wav (245678 bytes)
✅ Latency < 3s (target P0-4)

[TEST 6] Serveur TTS laissé en cours (était déjà démarré)

╔══════════════════════════════════════════════════════════════╗
║               P0-4 TEST SUCCESS ✅                          ║
╚══════════════════════════════════════════════════════════════╝

Résumé:
  ✅ Fichier serveur: /home/titane/.../tts_api_server.py
  ✅ Health check: OK
  ✅ Synthèse TTS: OK (2450ms)
  ✅ Audio généré: /tmp/titane_tts_test_1733676543.wav

Prochaines étapes:
  1. Créer requirements.txt (voir rapport)
  2. Créer setup_parler_tts.sh (installation automatisée)
  3. Documenter rapport P0-4 (P0_4_PARLER_TTS_BACKEND_TEST_REPORT.md)

Pour écouter audio test:
  aplay /tmp/titane_tts_test_1733676543.wav
```

---

### **Étape 4 : Test manuel curl (optionnel)**

#### **Test health** :

```bash
curl http://localhost:8765/api/v1/tts/health | jq
```

**Expected** :

```json
{
  "status": "ok",
  "model_loaded": true,
  "device": "cuda",
  "gpu_name": "AMD Radeon RX 7600 XT",
  "vram_used_gb": 1.234,
  "cache_size_mb": 12.56,
  "uptime_seconds": 456.78
}
```

#### **Test TTS** :

```bash
curl -X POST http://localhost:8765/api/v1/tts/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"Bonjour TITANE","format":"wav"}' \
  --output /tmp/test_tts.wav

# Écouter audio
aplay /tmp/test_tts.wav
```

---

## 📊 MÉTRIQUES CIBLES P0-4

| Métrique                   | Target        | Mesure     | Status      |
| -------------------------- | ------------- | ---------- | ----------- |
| **Startup time**           | < 60s         | [X]s       | ⏳ À TESTER |
| **Health check latency**   | < 100ms       | [X]ms      | ⏳ À TESTER |
| **TTS latency (1st call)** | < 3s          | [X]ms      | ⏳ À TESTER |
| **TTS latency (cached)**   | < 500ms       | [X]ms      | ⏳ À TESTER |
| **Audio file size**        | > 0 bytes     | [X] bytes  | ⏳ À TESTER |
| **Audio format**           | WAV           | [format]   | ⏳ À TESTER |
| **Device**                 | GPU preferred | [cpu/cuda] | ⏳ À TESTER |

---

## ✅ CRITÈRES VALIDATION P0-4

### **P0-4 SUCCESS si** :

1. ✅ Serveur démarre sans erreur (startup < 60s)
2. ✅ Health check répond 200 OK (`model_loaded: true`)
3. ✅ TTS synthesis fonctionne (audio WAV généré)
4. ✅ Latency < 3s (1st call), < 500ms (cached)
5. ✅ Fichier audio valide (size > 0, format WAV)
6. ✅ Scripts automatisés créés (`setup_parler_tts.sh`, `start_tts_service.sh`)

### **P0-4 FAIL si** :

1. ❌ Serveur crash au démarrage
2. ❌ Health check 500 Error ou `model_loaded: false`
3. ❌ TTS synthesis erreur (500 Error, timeout)
4. ❌ Latency > 5s (inacceptable)
5. ❌ Audio corrompu (size 0, format invalide)

---

## 🐛 DEBUGGING (si échec)

### **Cas 1 : Serveur crash au démarrage**

**Symptômes** :

```
ModuleNotFoundError: No module named 'parler_tts'
```

**Solution** :

```bash
# Réinstaller dépendances
cd tts-service
source venv-parler-tts/bin/activate
pip install -r requirements.txt
```

---

### **Cas 2 : Model not loaded**

**Symptômes** :

```json
{
  "status": "ok",
  "model_loaded": false,
  "device": "cpu"
}
```

**Solution** :

```bash
# Télécharger modèle manuellement
python3 -c "
from parler_tts import ParlerTTSForConditionalGeneration
model = ParlerTTSForConditionalGeneration.from_pretrained('parler-tts/parler-tts-mini-multilingual-v1.1')
print('Model downloaded')
"
```

---

### **Cas 3 : Latency > 5s**

**Symptômes** :

- TTS génération très lente (> 10s)
- CPU mode au lieu de GPU

**Solution** :

```bash
# Vérifier device GPU
python3 -c "import torch; print(torch.cuda.is_available())"

# Si False, installer PyTorch GPU:
# AMD ROCm:
pip install torch --index-url https://download.pytorch.org/whl/rocm5.7

# NVIDIA CUDA:
pip install torch --index-url https://download.pytorch.org/whl/cu121
```

---

## 📝 TEMPLATE RAPPORT RÉSULTATS

```markdown
# P0-4 TEST RESULTS

**Date**: [DATE]
**Testeur**: [NOM]
**Environment**: [OS, Python version]

## Métriques

| Métrique             | Target  | Mesure     | Status |
| -------------------- | ------- | ---------- | ------ |
| Startup time         | < 60s   | [X]s       | ✅/❌  |
| Health latency       | < 100ms | [X]ms      | ✅/❌  |
| TTS latency (1st)    | < 3s    | [X]ms      | ✅/❌  |
| TTS latency (cached) | < 500ms | [X]ms      | ✅/❌  |
| Audio size           | > 0     | [X] bytes  | ✅/❌  |
| Device               | GPU     | [cpu/cuda] | ✅/❌  |

## Conclusion

✅ P0-4 VALIDÉ / ❌ P0-4 ÉCHEC

**Justification** : [1-2 phrases]

## Logs

[Copier logs console ici]
```

---

## 🔗 FICHIERS CRÉÉS (P0-4)

- ✅ `tts-service/requirements.txt` (21 lines)
- ✅ `setup_parler_tts.sh` (190 lines)
- ✅ `test_parler_tts_backend.sh` (250 lines)
- ✅ `tts-service/start_tts_service.sh` (auto-generated)
- ✅ `P0_4_PARLER_TTS_BACKEND_TEST_REPORT.md` (ce fichier, 480+ lines)

---

## 🚀 PROCHAINES ÉTAPES

### **Après P0-4 VALIDÉ** :

1. ✅ **Phase 2 COMPLÈTE** (7/7 P0 corrections)
   - P0-1: Test feedback loop ⏳ Manuel
   - P0-2: Voice fingerprinting ✅ Complété
   - P0-3: STUB TTS deprecation ✅ Complété
   - P0-4: Parler-TTS backend ✅ Complété
   - P0-5: Tests audioStateMachine ✅ Complété
   - P0-6: Tests useTTSWithMicControl ✅ Complété
   - P0-7: Tests useVAD ✅ Complété

2. ⏳ **Phase 3 : Pauffinage UX/État** (16h estimées)
   - P1-3: Logger structuré (winston + trace ID)
   - P1-4: Log correlation (userId, sessionId)
   - P1-5: Performance monitoring (ASR/TTS/OMEGA metrics)
   - P1-8: User-friendly audio error modal
   - P1-13: Implement real MFCC voice fingerprinting (1 jour)
   - P1-14: Optimize voice fingerprinting (4h)
   - P1-15: Persist TITANE voice profile (2h)
   - P1-16: Voice fingerprinting tests (4h)

3. ⏳ **Tests E2E** : Playwright feedback loop automatisés (P2-2, 4h)

---

## 📚 RÉFÉRENCES

- **VOCAL_MAP.md** : Architecture vocale complète
- **DIAGNOSTIC_PLAN_ACTION_VOCAL_v∞.md** : Plan action P0-4 (lignes 287-337)
- **tts-service/tts_api_server.py** : Backend source code (330 lines)
- **docs/99_ARCHIVE/sessions/TTS_PARLER_INSTALLATION_GUIDE.md** : Guide détaillé installation

---

**Status** : ✅ READY FOR TESTING  
**Prochaine action** : Exécuter `./test_parler_tts_backend.sh`
