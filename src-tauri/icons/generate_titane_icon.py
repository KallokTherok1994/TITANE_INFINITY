#!/usr/bin/env python3
"""
TITANE INFINITY — Générateur d'Icône Officielle
================================================

Crée l'icône officielle de TITANE INFINITY avec:
- Logo ∞ stylisé (symbole d'infini)
- Dégradé bleu titanium vers cyan électrique
- Effet holographique/futuriste
- Toutes les tailles requises pour Tauri

Auteur: Kevin Thibault (TITANE∞)
Version: v26.4.0
Date: 2026-01-26
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import sys

def create_infinity_symbol(size, bg_color, gradient_start, gradient_end, glow=True):
    """
    Crée le symbole ∞ (infini) stylisé pour TITANE INFINITY
    
    Args:
        size: Taille du canvas (carré)
        bg_color: Couleur de fond
        gradient_start: Début du dégradé (tuple RGB)
        gradient_end: Fin du dégradé (tuple RGB)
        glow: Ajouter effet de lueur
    """
    img = Image.new('RGBA', (size, size), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Calcul des dimensions
    center_x = size // 2
    center_y = size // 2
    loop_width = size * 0.3  # Largeur de chaque boucle
    thickness = max(size // 16, 3)  # Épaisseur du trait
    
    # Créer le symbole infini avec deux ellipses qui se croisent
    # Boucle gauche
    left_bbox = [
        center_x - loop_width - loop_width // 4,
        center_y - loop_width // 2,
        center_x - loop_width // 4,
        center_y + loop_width // 2
    ]
    
    # Boucle droite
    right_bbox = [
        center_x + loop_width // 4,
        center_y - loop_width // 2,
        center_x + loop_width + loop_width // 4,
        center_y + loop_width // 2
    ]
    
    # Créer une image temporaire pour le dégradé
    gradient_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    gradient_draw = ImageDraw.Draw(gradient_img)
    
    # Dessiner avec effet de lueur si demandé
    if glow and size >= 128:
        # Lueur externe (plus large, plus transparente)
        for i in range(3, 0, -1):
            alpha = 30 * i
            glow_thickness = thickness + i * 2
            gradient_draw.ellipse(
                [x + y for x, y in zip(left_bbox, [-i*2, -i*2, i*2, i*2])],
                outline=gradient_start + (alpha,),
                width=glow_thickness
            )
            gradient_draw.ellipse(
                [x + y for x, y in zip(right_bbox, [-i*2, -i*2, i*2, i*2])],
                outline=gradient_end + (alpha,),
                width=glow_thickness
            )
    
    # Dessiner le symbole principal
    gradient_draw.ellipse(left_bbox, outline=gradient_start + (255,), width=thickness)
    gradient_draw.ellipse(right_bbox, outline=gradient_end + (255,), width=thickness)
    
    # Remplir les boucles avec dégradé
    if size >= 64:
        # Créer un dégradé horizontal
        for x in range(size):
            ratio = x / size
            r = int(gradient_start[0] * (1 - ratio) + gradient_end[0] * ratio)
            g = int(gradient_start[1] * (1 - ratio) + gradient_end[1] * ratio)
            b = int(gradient_start[2] * (1 - ratio) + gradient_end[2] * ratio)
            
            gradient_draw.line([(x, 0), (x, size)], fill=(r, g, b, 180), width=1)
    
    # Composite avec masque pour garder seulement le symbole
    img = Image.alpha_composite(img, gradient_img)
    
    return img

def create_icon_set():
    """Génère toutes les tailles d'icônes requises pour Tauri"""
    
    # Couleurs TITANE INFINITY
    BG_COLOR = (10, 15, 35, 255)  # Bleu très sombre (presque noir)
    GRADIENT_START = (0, 150, 255)  # Bleu titanium électrique
    GRADIENT_END = (0, 255, 200)  # Cyan holographique
    
    sizes = {
        'icon.png': 512,  # Icône principale haute résolution
        '32x32.png': 32,
        '64x64.png': 64,
        '128x128.png': 128,
        '128x128@2x.png': 256,
        '256x256.png': 256,
    }
    
    print("🎨 Génération de l'icône TITANE INFINITY...")
    print(f"   Couleurs: {GRADIENT_START} → {GRADIENT_END}")
    print(f"   Fond: {BG_COLOR[:3]}")
    
    for filename, size in sizes.items():
        print(f"\n📦 Création de {filename} ({size}x{size})...")
        
        # Créer l'icône avec effet de lueur pour grandes tailles
        icon = create_infinity_symbol(
            size=size,
            bg_color=BG_COLOR,
            gradient_start=GRADIENT_START,
            gradient_end=GRADIENT_END,
            glow=(size >= 128)
        )
        
        # Appliquer un léger flou gaussien pour effet holographique sur grandes tailles
        if size >= 128:
            # Ne flouter que les bords lumineux
            icon = icon.filter(ImageFilter.SMOOTH)
        
        # Sauvegarder
        output_path = os.path.join(os.path.dirname(__file__), filename)
        icon.save(output_path, 'PNG', optimize=True)
        print(f"   ✅ Sauvegardé: {output_path}")
    
    print("\n" + "="*60)
    print("✨ Icônes TITANE INFINITY générées avec succès !")
    print("="*60)
    
    # Générer aussi les icônes Windows Store (Square*Logo.png)
    print("\n📱 Génération des icônes Windows Store...")
    windows_sizes = {
        'Square30x30Logo.png': 30,
        'Square44x44Logo.png': 44,
        'Square71x71Logo.png': 71,
        'Square89x89Logo.png': 89,
        'Square107x107Logo.png': 107,
        'Square142x142Logo.png': 142,
        'Square150x150Logo.png': 150,
        'Square284x284Logo.png': 284,
        'Square310x310Logo.png': 310,
        'StoreLogo.png': 50,
    }
    
    for filename, size in windows_sizes.items():
        icon = create_infinity_symbol(
            size=size,
            bg_color=BG_COLOR,
            gradient_start=GRADIENT_START,
            gradient_end=GRADIENT_END,
            glow=(size >= 128)
        )
        output_path = os.path.join(os.path.dirname(__file__), filename)
        icon.save(output_path, 'PNG', optimize=True)
        print(f"   ✅ {filename}")
    
    print("\n🎉 Toutes les icônes ont été générées !")
    print("\n📋 Prochaines étapes:")
    print("   1. Vérifiez les icônes générées dans src-tauri/icons/")
    print("   2. Générez icon.ico avec: convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico")
    print("   3. Générez icon.icns avec: png2icns icon.icns icon.png")
    print("   4. Rebuild l'application: pnpm tauri build")

if __name__ == '__main__':
    try:
        create_icon_set()
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erreur: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
