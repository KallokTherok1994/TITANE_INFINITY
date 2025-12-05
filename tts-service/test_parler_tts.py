#!/usr/bin/env python3
"""
Test minimal Parler-TTS pour TITANE∞
Génère "Bonjour, je suis TITANE" avec voix féminine chaleureuse
"""

import torch
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer, AutoFeatureExtractor
import soundfile as sf
from pathlib import Path
import time

def main():
    print("🎤 [TITANE TTS Test] Initialisation...")

    # Vérifier GPU
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"   Device: {device}")
    if device == "cuda":
        print(f"   GPU: {torch.cuda.get_device_name(0)}")
        print(f"   VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")

    # Charger modèle Parler-TTS Mini Multilingual v1.1
    model_name = "parler-tts/parler-tts-mini-multilingual-v1.1"
    print(f"\n📦 Chargement du modèle: {model_name}")
    print("   (Premier lancement: téléchargement ~900MB)")

    start_load = time.time()
    model = ParlerTTSForConditionalGeneration.from_pretrained(model_name).to(device)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
    load_time = time.time() - start_load
    print(f"   ✅ Modèle chargé en {load_time:.2f}s")

    # Description voix "Adina-like" pour TITANE
    description = (
        "Une voix féminine française, chaleureuse et claire, "
        "avec une articulation précise et un rythme modéré, "
        "légèrement expressive et bienveillante."
    )

    # Texte à synthétiser
    prompt = "Bonjour, je suis TITANE, votre assistant cognitif permanent."

    print(f"\n🎯 Génération TTS:")
    print(f"   Texte: '{prompt}'")
    print(f"   Style: {description[:60]}...")

    # Générer audio
    start_gen = time.time()
    input_ids = tokenizer(description, return_tensors="pt").input_ids.to(device)
    prompt_input_ids = tokenizer(prompt, return_tensors="pt").input_ids.to(device)

    with torch.no_grad():
        generation = model.generate(
            input_ids=input_ids,
            prompt_input_ids=prompt_input_ids,
            attention_mask=torch.ones_like(input_ids),
            prompt_attention_mask=torch.ones_like(prompt_input_ids),
        )

    audio_arr = generation.cpu().numpy().squeeze()
    gen_time = time.time() - start_gen
    print(f"   ✅ Audio généré en {gen_time:.2f}s")

    # Sauvegarder
    output_dir = Path("/tmp/titane_tts_test")
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / "test_output.wav"

    # Sample rate Parler-TTS: 44100 Hz
    sf.write(output_path, audio_arr, samplerate=model.config.sampling_rate)
    print(f"\n✅ Audio sauvegardé: {output_path}")
    print(f"   Durée: {len(audio_arr) / model.config.sampling_rate:.2f}s")
    print(f"   Sample rate: {model.config.sampling_rate} Hz")
    print(f"\n🎧 Jouer avec: aplay {output_path}")

    # Stats performance
    print(f"\n📊 Performance:")
    print(f"   Chargement modèle: {load_time:.2f}s")
    print(f"   Génération audio: {gen_time:.2f}s")
    print(f"   Latence totale: {load_time + gen_time:.2f}s")
    print(f"   (Cache modèle réutilisé: latence ~{gen_time:.2f}s)")

if __name__ == "__main__":
    main()
