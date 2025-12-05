#!/usr/bin/env python3
"""
TITANE∞ TTS API Server v1.0
Service FastAPI pour Parler-TTS Mini Multilingual v1.1
Optimisé pour AMD Radeon RX 7600 XT + Pop!_OS
"""

import os
import json
import hashlib
import time
from pathlib import Path
from typing import Optional, Dict, Any
from io import BytesIO

import torch
import soundfile as sf
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer

# ========== CONFIGURATION ==========

# Chemins
BASE_DIR = Path(__file__).parent
CACHE_DIR = BASE_DIR / "cache" / "audio"
CONFIG_FILE = BASE_DIR / "tts_config.json"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Style vocal par défaut (équivalent Adina)
DEFAULT_STYLE = (
    "Une voix féminine française, chaleureuse et claire, "
    "avec une articulation précise et un rythme modéré, "
    "légèrement expressive et bienveillante."
)

# Modèle Parler-TTS
MODEL_NAME = "parler-tts/parler-tts-mini-multilingual-v1.1"

# ========== MODÈLES PYDANTIC ==========

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Texte à synthétiser")
    style_description: Optional[str] = Field(None, description="Description style vocal")
    format: str = Field("wav", pattern="^(wav|mp3)$")
    cache_key: Optional[str] = Field(None, description="Clé de cache (hash du texte)")

class TTSResponse(BaseModel):
    success: bool
    audio_base64: Optional[str] = None
    duration_seconds: float
    generation_time_ms: int
    cached: bool
    device: str

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    device: str
    gpu_name: Optional[str] = None
    vram_used_gb: Optional[float] = None
    cache_size_mb: float
    uptime_seconds: float

class StyleUpdateRequest(BaseModel):
    style_description: str = Field(..., min_length=10, max_length=500)
    save_as_default: bool = False

# ========== SERVICE TTS ==========

class ParlerTTSService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_loaded = False
        self.current_style = DEFAULT_STYLE
        self.start_time = time.time()
        self.load_config()

    def load_config(self):
        """Charge configuration personnalisée"""
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)
                self.current_style = config.get('style_description', DEFAULT_STYLE)
                print(f"✅ Config chargée: style personnalisé")

    def save_config(self):
        """Sauvegarde configuration"""
        config = {'style_description': self.current_style}
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        print(f"✅ Config sauvegardée")

    def load_model(self):
        """Charge le modèle Parler-TTS"""
        if self.model_loaded:
            return

        print(f"📦 Chargement modèle: {MODEL_NAME}")
        print(f"   Device: {self.device}")

        start = time.time()
        self.model = ParlerTTSForConditionalGeneration.from_pretrained(MODEL_NAME).to(self.device)
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        load_time = time.time() - start

        self.model_loaded = True
        print(f"✅ Modèle chargé en {load_time:.2f}s")

        if self.device == "cuda":
            gpu_name = torch.cuda.get_device_name(0)
            print(f"   GPU: {gpu_name}")

    def get_cache_key(self, text: str, style: str) -> str:
        """Génère clé de cache"""
        content = f"{text}|{style}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]

    def get_cached_audio(self, cache_key: str) -> Optional[bytes]:
        """Récupère audio depuis cache"""
        cache_path = CACHE_DIR / f"{cache_key}.wav"
        if cache_path.exists():
            with open(cache_path, 'rb') as f:
                return f.read()
        return None

    def save_to_cache(self, cache_key: str, audio_bytes: bytes):
        """Sauvegarde audio dans cache"""
        cache_path = CACHE_DIR / f"{cache_key}.wav"
        with open(cache_path, 'wb') as f:
            f.write(audio_bytes)

    def synthesize(self, text: str, style: Optional[str] = None, use_cache: bool = True) -> Dict[str, Any]:
        """Synthétise audio"""
        if not self.model_loaded:
            self.load_model()

        # Style vocal
        style_desc = style or self.current_style

        # Vérifier cache
        cache_key = self.get_cache_key(text, style_desc)
        if use_cache:
            cached_audio = self.get_cached_audio(cache_key)
            if cached_audio:
                return {
                    'audio_bytes': cached_audio,
                    'cached': True,
                    'generation_time_ms': 0,
                    'duration_seconds': 0  # Calculé côté client si besoin
                }

        # Générer audio
        start = time.time()

        input_ids = self.tokenizer(style_desc, return_tensors="pt").input_ids.to(self.device)
        prompt_input_ids = self.tokenizer(text, return_tensors="pt").input_ids.to(self.device)

        with torch.no_grad():
            generation = self.model.generate(
                input_ids=input_ids,
                prompt_input_ids=prompt_input_ids,
                attention_mask=torch.ones_like(input_ids),
                prompt_attention_mask=torch.ones_like(prompt_input_ids),
            )

        audio_arr = generation.cpu().numpy().squeeze()
        gen_time_ms = int((time.time() - start) * 1000)

        # Convertir en bytes WAV
        buffer = BytesIO()
        sf.write(buffer, audio_arr, samplerate=self.model.config.sampling_rate, format='WAV')
        audio_bytes = buffer.getvalue()

        # Sauvegarder en cache
        if use_cache:
            self.save_to_cache(cache_key, audio_bytes)

        duration = len(audio_arr) / self.model.config.sampling_rate

        return {
            'audio_bytes': audio_bytes,
            'cached': False,
            'generation_time_ms': gen_time_ms,
            'duration_seconds': duration
        }

    def get_health(self) -> Dict[str, Any]:
        """Retourne statut santé"""
        health = {
            'status': 'healthy' if self.model_loaded else 'initializing',
            'model_loaded': self.model_loaded,
            'device': self.device,
            'uptime_seconds': time.time() - self.start_time
        }

        if self.device == "cuda" and torch.cuda.is_available():
            health['gpu_name'] = torch.cuda.get_device_name(0)
            health['vram_used_gb'] = torch.cuda.memory_allocated(0) / 1e9

        # Taille cache
        cache_size = sum(f.stat().st_size for f in CACHE_DIR.glob("*.wav"))
        health['cache_size_mb'] = cache_size / 1e6

        return health

    def update_style(self, new_style: str, save_default: bool = False):
        """Met à jour le style vocal"""
        self.current_style = new_style
        if save_default:
            self.save_config()

# ========== API FASTAPI ==========

app = FastAPI(
    title="TITANE∞ TTS API",
    description="Service TTS local avec Parler-TTS Mini Multilingual v1.1",
    version="1.0.0"
)

# CORS pour frontend Tauri
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://192.168.2.16:5173", "http://192.168.2.13:5173", "tauri://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instance service
tts_service = ParlerTTSService()

# ========== ENDPOINTS ==========

@app.on_event("startup")
async def startup_event():
    """Précharge le modèle au démarrage"""
    print("🚀 TITANE∞ TTS API Server starting...")
    tts_service.load_model()
    print("✅ Server ready")

@app.get("/api/v1/tts/health", response_model=HealthResponse)
async def health_check():
    """Vérification santé du service"""
    return tts_service.get_health()

@app.post("/api/v1/tts/synthesize")
async def synthesize_speech(request: TTSRequest):
    """Synthèse TTS"""
    try:
        result = tts_service.synthesize(
            text=request.text,
            style=request.style_description,
            use_cache=True
        )

        # Retourner audio binaire directement
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")

@app.post("/api/v1/tts/update-style")
async def update_voice_style(request: StyleUpdateRequest):
    """Modification style vocal (pour TITANE IA)"""
    try:
        tts_service.update_style(request.style_description, request.save_as_default)
        return {
            "success": True,
            "message": "Style vocal mis à jour",
            "new_style": request.style_description,
            "saved_as_default": request.save_as_default
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update error: {str(e)}")

@app.get("/")
async def root():
    """Page d'accueil"""
    return {
        "service": "TITANE∞ TTS API",
        "version": "1.0.0",
        "model": MODEL_NAME,
        "status": "operational",
        "endpoints": {
            "health": "/api/v1/tts/health",
            "synthesize": "POST /api/v1/tts/synthesize",
            "update_style": "POST /api/v1/tts/update-style"
        }
    }

if __name__ == "__main__":
    import uvicorn

    # Configuration serveur
    HOST = "0.0.0.0"  # Accessible sur réseau local
    PORT = 8765

    print(f"""
╔══════════════════════════════════════════════════════════════╗
║              TITANE∞ TTS API SERVER v1.0                    ║
║              Parler-TTS Mini Multilingual v1.1              ║
╚══════════════════════════════════════════════════════════════╝

🌐 Serveur: http://{HOST}:{PORT}
📡 Réseau local: http://192.168.2.X:{PORT}
🎤 Modèle: {MODEL_NAME}
🔧 Device: {'GPU (AMD ROCm)' if torch.cuda.is_available() else 'CPU'}
    """)

    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        log_level="info",
        access_log=True
    )
