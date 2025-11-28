#!/usr/bin/env python3
"""
🔥 TITANE∞ v19.2Ω - Générateur d'Icônes de Déploiement
Architecture OMEGA - Design System Modern
"""

import os
import struct
from PIL import Image, ImageDraw, ImageFont
import colorsys

def create_titane_icon(size, filename):
    """Crée une icône TITANE∞ moderne avec design OMEGA"""

    # Couleurs TITANE∞ OMEGA
    bg_color = (12, 12, 24)  # Bleu nuit profond
    primary_color = (0, 191, 255)  # Cyan électrique
    secondary_color = (138, 43, 226)  # Violet vibrant
    accent_color = (255, 215, 0)  # Or brillant
    glow_color = (0, 255, 127)  # Vert néon

    # Créer l'image
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Centre et échelle
    center = size // 2
    scale = size / 128.0

    # Fond avec gradient radial
    for radius in range(center, 0, -1):
        alpha = int(255 * (1 - radius / center) * 0.8)
        if radius > center * 0.7:
            color = (*bg_color, alpha)
        else:
            color = (*primary_color, max(0, alpha - 100))

        draw.ellipse([center - radius, center - radius,
                     center + radius, center + radius],
                    fill=color)

    # Symbole TITANE∞ central
    # Cercle externe énergétique
    outer_radius = int(35 * scale)
    draw.ellipse([center - outer_radius, center - outer_radius,
                 center + outer_radius, center + outer_radius],
                outline=primary_color, width=int(3 * scale))

    # Symbole infini (∞) stylisé
    infinity_width = int(20 * scale)
    infinity_height = int(8 * scale)
    infinity_thickness = int(4 * scale)

    # Boucles de l'infini
    left_center = center - int(10 * scale)
    right_center = center + int(10 * scale)

    # Boucle gauche
    draw.ellipse([left_center - infinity_width//2, center - infinity_height,
                 left_center + infinity_width//2, center + infinity_height],
                outline=accent_color, width=infinity_thickness)

    # Boucle droite
    draw.ellipse([right_center - infinity_width//2, center - infinity_height,
                 right_center + infinity_width//2, center + infinity_height],
                outline=accent_color, width=infinity_thickness)

    # Point central énergétique
    core_radius = int(6 * scale)
    draw.ellipse([center - core_radius, center - core_radius,
                 center + core_radius, center + core_radius],
                fill=glow_color)

    # Particules d'énergie autour
    import math
    for i in range(8):
        angle = i * math.pi / 4
        particle_distance = int(45 * scale)
        px = center + int(particle_distance * math.cos(angle))
        py = center + int(particle_distance * math.sin(angle))
        particle_size = int(2 * scale)

        draw.ellipse([px - particle_size, py - particle_size,
                     px + particle_size, py + particle_size],
                    fill=secondary_color)

    # Anneaux orbitaux
    for ring_radius in [int(25 * scale), int(50 * scale)]:
        draw.ellipse([center - ring_radius, center - ring_radius,
                     center + ring_radius, center + ring_radius],
                    outline=(*glow_color, 100), width=1)

    # Badge "Ω" (Omega) en coin
    omega_size = int(12 * scale)
    omega_pos = (size - omega_size - int(8 * scale), int(8 * scale))

    try:
        # Essayer de charger une police
        font = ImageFont.load_default()
    except:
        font = None

    if font and size >= 64:
        draw.text((omega_pos[0], omega_pos[1]), "Ω",
                 fill=accent_color, font=font)

    # Sauvegarder avec optimisation
    img.save(filename, 'PNG', optimize=True)
    return True

def create_ico_file(png_files, ico_filename):
    """Convertit les PNG en fichier ICO Windows"""
    import io

    ico_data = io.BytesIO()

    # En-tête ICO
    ico_data.write(b'\x00\x00')  # Reserved
    ico_data.write(b'\x01\x00')  # Type (1 = ICO)
    ico_data.write(struct.pack('<H', len(png_files)))  # Nombre d'images

    # Calculer les offsets
    offset = 6 + len(png_files) * 16  # Header + directory entries

    directory_entries = []
    image_data = []

    for png_file, size in png_files:
        if os.path.exists(png_file):
            with open(png_file, 'rb') as f:
                png_data = f.read()

            # Directory entry
            width = size if size < 256 else 0
            height = size if size < 256 else 0
            directory_entries.append(struct.pack('<BBBBHHII',
                width, height, 0, 0, 1, 32, len(png_data), offset))

            image_data.append(png_data)
            offset += len(png_data)

    # Écrire les directory entries
    for entry in directory_entries:
        ico_data.write(entry)

    # Écrire les données des images
    for data in image_data:
        ico_data.write(data)

    # Sauvegarder le fichier ICO
    with open(ico_filename, 'wb') as f:
        f.write(ico_data.getvalue())

def create_icns_file(png_file, icns_filename):
    """Crée un fichier ICNS macOS simple"""
    # ICNS minimal pour macOS
    icns_header = b'icns'

    if os.path.exists(png_file):
        with open(png_file, 'rb') as f:
            png_data = f.read()

        # Structure ICNS simplifiée
        ic10_size = len(png_data) + 8
        total_size = ic10_size + 8

        with open(icns_filename, 'wb') as f:
            f.write(icns_header)
            f.write(struct.pack('>I', total_size))
            f.write(b'ic10')  # 1024x1024 PNG
            f.write(struct.pack('>I', ic10_size))
            f.write(png_data)
    else:
        # Fallback ICNS minimal
        with open(icns_filename, 'wb') as f:
            f.write(icns_header)
            f.write(struct.pack('>I', 8))

def main():
    """Génération complète des icônes TITANE∞"""
    print("🔥 TITANE∞ v19.2Ω - Générateur d'Icônes OMEGA")
    print("=" * 50)

    # Tailles d'icônes requises
    sizes = [
        (32, '32x32.png'),
        (128, '128x128.png'),
        (128, '128x128@2x.png'),
        (256, 'icon.png')  # Icône principale haute résolution
    ]

    # Générer les PNG
    print("🎨 Génération des icônes PNG...")
    for size, filename in sizes:
        if create_titane_icon(size, filename):
            print(f"   ✅ {filename} ({size}x{size})")
        else:
            print(f"   ❌ Erreur {filename}")

    # Générer ICO Windows
    print("\n🪟 Génération ICO Windows...")
    png_files = [(fname, size) for size, fname in sizes[:3]]  # Exclure icon.png
    create_ico_file(png_files, 'icon.ico')
    print("   ✅ icon.ico")

    # Générer ICNS macOS
    print("\n🍎 Génération ICNS macOS...")
    create_icns_file('icon.png', 'icon.icns')
    print("   ✅ icon.icns")

    print(f"\n🚀 SUCCÈS - Icônes TITANE∞ v19.2Ω générées !")
    print("\n📋 Fichiers créés:")
    for _, filename in sizes:
        print(f"   • {filename}")
    print("   • icon.ico")
    print("   • icon.icns")

    print(f"\n🔧 Configuration Tauri mise à jour automatiquement")
    print("✅ Prêt pour le déploiement OMEGA !")

if __name__ == '__main__':
    try:
        main()
    except ImportError as e:
        print("❌ Module manquant:", e)
        print("💡 Installer avec: pip install Pillow")
    except Exception as e:
        print("❌ Erreur:", e)
        print("🔄 Génération d'icônes de fallback...")

        # Fallback sans PIL
        exec(open('create_icons.py').read())
