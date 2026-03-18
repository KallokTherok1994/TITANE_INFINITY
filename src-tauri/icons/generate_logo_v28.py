#!/usr/bin/env python3
"""
TITANE∞ — Générateur d'icônes officielles v28.0.0
==================================================
Logo: T-bracket + Infinity-symbol + Chevron
Couleur: #2B3245 (dark slate) sur fond blanc/transparent

Génère toutes les tailles requises pour Tauri + système Linux.
Usage: python3 generate_logo_v28.py
"""

import os
import math
import struct
import zlib
from PIL import Image, ImageDraw, ImageFilter

# ─────────────────────────────────────────────────────────────
# PALETTE
# ─────────────────────────────────────────────────────────────
DARK   = (43, 50, 69, 255)    # #2B3245 logo mark
BG     = (242, 242, 242, 255) # #F2F2F2 light grey bg  (icon.png)
TRANS  = (0,   0,  0,  0)     # transparent

ICONS_DIR = os.path.dirname(os.path.abspath(__file__))

# ─────────────────────────────────────────────────────────────
# DRAW LOGO ON CANVAS
# ─────────────────────────────────────────────────────────────
def draw_logo(size: int, bg_transparent=False) -> Image.Image:
    """Génère le logo TITANE∞ v28 sur canvas (size × size)."""
    s = size
    bg_color = TRANS if bg_transparent else BG

    img = Image.new("RGBA", (s, s), bg_color)
    draw = ImageDraw.Draw(img)

    # ── Facteur d'échelle relatif à 512 px (base design)
    f = s / 512.0

    def sc(v):
        return int(v * f)

    dark = DARK

    # ── 1. TOP BRACKET LEFT ─────────────────────────────────
    # L-shaped: vertical bar + horizontal cap
    # Outer rect
    draw.rectangle([sc(56), sc(40), sc(180), sc(210)], fill=dark)
    # Horizontal bar
    draw.rectangle([sc(56), sc(40), sc(256), sc(110)], fill=dark)
    # Inner notch (punch hole → draw BG color)
    draw.rectangle([sc(132), sc(110), sc(256), sc(210)], fill=bg_color)

    # ── 2. TOP BRACKET RIGHT (mirrored) ─────────────────────
    draw.rectangle([sc(332), sc(40), sc(456), sc(210)], fill=dark)
    draw.rectangle([sc(256), sc(40), sc(456), sc(110)], fill=dark)
    draw.rectangle([sc(256), sc(110), sc(380), sc(210)], fill=bg_color)

    # ── 3. CENTER VERTICAL CONNECTOR (bracket to infinity) ──
    draw.rectangle([sc(224), sc(40), sc(288), sc(110)], fill=dark)
    # thin connector bar
    draw.rectangle([sc(236), sc(110), sc(276), sc(195)], fill=dark)

    # ── 4. INFINITY SYMBOL ──────────────────────────────────
    # Center: (256,310) in 512-space
    cx, cy = sc(256), sc(315)
    rx_out = sc(140)  # outer X radius of each loop
    ry_out = sc(95)
    rx_in  = sc(90)   # inner X radius (hole)
    ry_in  = sc(52)
    gap    = sc(10)   # half-gap at crossing

    # Left loop outer ellipse
    lx = cx - sc(118)
    draw.ellipse([lx - rx_out, cy - ry_out, lx + rx_out, cy + ry_out], fill=dark)
    # Left loop inner hole
    draw.ellipse([lx - rx_in,  cy - ry_in,  lx + rx_in,  cy + ry_in],  fill=bg_color)

    # Right loop outer ellipse
    rx = cx + sc(118)
    draw.ellipse([rx - rx_out, cy - ry_out, rx + rx_out, cy + ry_out], fill=dark)
    # Right loop inner hole
    draw.ellipse([rx - rx_in,  cy - ry_in,  rx + rx_in,  cy + ry_in],  fill=bg_color)

    # Crossing band at center (dark rectangle over the gap between loops)
    band_h = sc(70)
    band_w = sc(115)
    draw.rectangle([cx - band_w, cy - band_h//2,
                    cx + band_w, cy + band_h//2], fill=dark)
    # Restore the two small inner holes at center crossing
    hole_w = sc(42)
    hole_h = sc(38)
    draw.ellipse([cx - band_w + sc(4), cy - hole_h,
                  cx - band_w + hole_w*2, cy + hole_h], fill=bg_color)
    draw.ellipse([cx + band_w - hole_w*2, cy - hole_h,
                  cx + band_w - sc(4),    cy + hole_h], fill=bg_color)

    # ── 5. VERTICAL STEM from infinity to chevron ────────────
    stem_w = sc(30)
    draw.rectangle([cx - stem_w, cy + ry_out - sc(5),
                    cx + stem_w, cy + ry_out + sc(50)], fill=dark)

    # ── 6. BOTTOM CHEVRON ────────────────────────────────────
    # Outer V shape
    tip_y  = sc(490)
    base_y = cy + ry_out + sc(45)
    base_lx = sc(56)
    base_rx = sc(456)
    thick = sc(36)

    # Left wing outer
    left_outer = [
        (base_lx,  base_y),
        (base_lx + thick, base_y),
        (cx + thick, tip_y),
        (cx,         tip_y),
    ]
    # Right wing outer
    right_outer = [
        (base_rx,         base_y),
        (base_rx - thick, base_y),
        (cx - thick,      tip_y),
        (cx,              tip_y),
    ]
    draw.polygon(left_outer,  fill=dark)
    draw.polygon(right_outer, fill=dark)

    # ── 7. Smooth edges with slight blur then threshold ──────
    if size >= 64:
        img = img.filter(ImageFilter.SMOOTH_MORE)

    return img


# ─────────────────────────────────────────────────────────────
# SIZES à générer
# ─────────────────────────────────────────────────────────────
SIZES_PNG = [32, 64, 128, 256, 512]

def generate_all():
    print("TITANE∞ Icon Generator v28.0.0")
    print("=" * 46)

    # 1. PNG toutes tailles
    for sz in SIZES_PNG:
        img = draw_logo(sz, bg_transparent=False)
        name = f"{sz}x{sz}.png"
        path = os.path.join(ICONS_DIR, name)
        img.save(path, "PNG", optimize=True)
        print(f"  ✓ {name}")

    # 128@2x
    img128_2x = draw_logo(256, bg_transparent=False)
    path128_2x = os.path.join(ICONS_DIR, "128x128@2x.png")
    img128_2x.save(path128_2x, "PNG", optimize=True)
    print(f"  ✓ 128x128@2x.png")

    # icon.png — 512px with transparent bg
    icon_png = draw_logo(512, bg_transparent=False)
    icon_path = os.path.join(ICONS_DIR, "icon.png")
    icon_png.save(icon_path, "PNG", optimize=True)
    print(f"  ✓ icon.png (512px)")

    # 2. ICO (multi-size Windows)
    ico_sizes = [16, 24, 32, 48, 64, 128, 256]
    ico_frames = [draw_logo(s, bg_transparent=False).convert("RGBA") for s in ico_sizes]
    ico_path = os.path.join(ICONS_DIR, "icon.ico")
    ico_frames[0].save(
        ico_path, "ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_frames[1:]
    )
    print(f"  ✓ icon.ico (multi-size {ico_sizes})")

    # 3. ICNS (macOS) — fallback PNG renamed, real icns needs iconutil
    # On génère une copie en ICNS-compatible PNG
    icns_img = draw_logo(512, bg_transparent=True)
    icns_path = os.path.join(ICONS_DIR, "icon.icns")
    # PIL ne produit pas de .icns binaire — on sauvegarde un PNG renommé
    # Tauri accepte un PNG 512 renommé .icns en fallback sur Linux CI
    icns_img.save(icns_path.replace(".icns", "_1024.png"), "PNG", optimize=True)
    # Tentative de génération ICNS si pyicns disponible
    try:
        import icnsutil
        ic = icnsutil.IcnsFile()
        for sz in [16, 32, 64, 128, 256, 512]:
            pil_img = draw_logo(sz, bg_transparent=True)
            import io
            buf = io.BytesIO()
            pil_img.save(buf, "PNG")
            ic.add_media(file=buf.getvalue(), sizes=[(sz, sz)])
        ic.write(icns_path)
        print(f"  ✓ icon.icns (pyicns)")
    except ImportError:
        # Sauvegarde PNG 512 comme .icns (acceptable pour Linux/CI)
        icns_img.save(icns_path, "PNG", optimize=True)
        print(f"  ✓ icon.icns (PNG fallback 512px)")

    print("")
    print("Toutes les icônes générées avec succès ✓")
    print(f"Répertoire: {ICONS_DIR}")


if __name__ == "__main__":
    generate_all()
