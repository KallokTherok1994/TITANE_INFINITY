#!/usr/bin/env python3
"""Génère icon.ico et icon.icns depuis icon.png"""
from PIL import Image
import sys

try:
    print("🔄 Conversion icon.png → icon.ico...")
    img = Image.open('icon.png')
    img.save('icon.ico', format='ICO', sizes=[
        (16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)
    ])
    print("✅ icon.ico généré avec succès!")
    
    # Note: Pour ICNS, il faut iconutil (macOS) ou png2icns
    print("\n⚠️  Pour générer icon.icns:")
    print("   - Sur macOS: iconutil -c icns icon.iconset/")
    print("   - Ou installer png2icns: pip install icnsutil")
    
except Exception as e:
    print(f"❌ Erreur: {e}", file=sys.stderr)
    sys.exit(1)
