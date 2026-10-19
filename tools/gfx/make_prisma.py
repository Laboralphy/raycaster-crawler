#!/usr/bin/env python3
"""Icône et image de livre du rayon prismatique : sept rayons de couleur
(rouge, orange, jaune, vert, bleu, violet, magenta) partant d'un même point en
bas de l'image et s'ouvrant vers le haut, à intervalles réguliers.

Même style que les autres sorts : fond noir, cadre gris.
- icône 48 x 48, case ICON_INDEX de resources/gfx/icons/icons.png (la planche
  est allongée si besoin) ;
- image 128 x 128, resources/gfx/books/book_spells_prisma.png.

Usage : python3 tools/gfx/make_prisma.py [--preview fichier.png]
"""
import math
import os
import sys

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ICONS = os.path.join(ROOT, 'resources', 'gfx', 'icons', 'icons.png')
BOOK = os.path.join(ROOT, 'resources', 'gfx', 'books', 'book_spells_prisma.png')
ICON_INDEX = 176  # spl_prisma dans game/data/ICONS.js
ICON_SIZE = 48

COLORS = [
    (235, 30, 30),    # rouge
    (255, 140, 0),    # orange
    (255, 230, 20),   # jaune
    (40, 210, 60),    # vert
    (40, 120, 255),   # bleu
    (150, 50, 220),   # violet
    (255, 50, 220),   # magenta
]
SPREAD = 90   # ouverture totale de l'éventail, en degrés (pas de 15°)
S = 512       # dessin en haute résolution, réduit ensuite


def rays():
    im = Image.new('RGB', (S, S), (0, 0, 0))
    ox, oy = S / 2, S * 0.9
    length = S * 0.63
    glow = Image.new('RGB', (S, S), (0, 0, 0))
    core = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    dg, dc = ImageDraw.Draw(glow), ImageDraw.Draw(core)
    step = SPREAD / (len(COLORS) - 1)
    for i, c in enumerate(COLORS):
        a = math.radians(-SPREAD / 2 + i * step)
        ex, ey = ox + math.sin(a) * length, oy - math.cos(a) * length
        # rayon en coin : fin au départ, plus large au bout
        nx, ny = math.cos(a), math.sin(a)
        w = S * 0.035
        wedge = [(ox, oy), (ex - nx * w, ey - ny * w), (ex + nx * w, ey + ny * w)]
        dg.polygon(wedge, fill=c)
        # cœur plus clair, sans perdre la teinte (le rouge ne doit pas virer au rose)
        light = tuple(int(v + (255 - v) * 0.4) for v in c)
        w2 = w * 0.35
        dc.polygon([(ox, oy), (ex - nx * w2, ey - ny * w2), (ex + nx * w2, ey + ny * w2)], fill=light + (255,))
    im = Image.blend(im, glow.filter(ImageFilter.GaussianBlur(S * 0.03)), 0.9)
    im.paste(glow, (0, 0), glow.convert('L').point(lambda v: 170 if v else 0))
    im.paste(core, (0, 0), core)
    # éclat blanc au point de départ
    spark = Image.new('L', (S, S), 0)
    r = S * 0.05
    ImageDraw.Draw(spark).ellipse((ox - r, oy - r, ox + r, oy + r), fill=255)
    spark = spark.filter(ImageFilter.GaussianBlur(S * 0.02))
    im.paste((255, 255, 255), (0, 0), spark)
    return im


def framed(im, n, aFrame):
    """Réduit à n pixels et ajoute le cadre (couleurs de l'extérieur vers l'intérieur)."""
    out = im.resize((n, n), Image.LANCZOS)
    d = ImageDraw.Draw(out)
    for k, c in enumerate(aFrame):
        d.rectangle((k, k, n - 1 - k, n - 1 - k), outline=c)
    return out


def main():
    src = rays()
    icon = framed(src, ICON_SIZE, [(117, 117, 117), (25, 25, 25)])
    book = framed(src, 128, [(130, 130, 130), (128, 128, 128), (119, 119, 119), (28, 28, 28)])
    if '--preview' in sys.argv:
        prev = Image.new('RGB', (128 + 8 + ICON_SIZE * 2, 128), (255, 0, 255))
        prev.paste(book, (0, 0))
        prev.paste(icon.resize((ICON_SIZE * 2, ICON_SIZE * 2), Image.NEAREST), (136, 0))
        prev.save(sys.argv[sys.argv.index('--preview') + 1])
        return
    book.convert('RGBA').save(BOOK, optimize=True)
    sheet = Image.open(ICONS).convert('RGB')
    w = max(sheet.size[0], (ICON_INDEX + 1) * ICON_SIZE)
    if w != sheet.size[0]:
        bigger = Image.new('RGB', (w, ICON_SIZE), (0, 0, 0))
        bigger.paste(sheet, (0, 0))
        sheet = bigger
    sheet.paste(icon, (ICON_INDEX * ICON_SIZE, 0))
    sheet.save(ICONS, optimize=True)
    print(os.path.relpath(BOOK, ROOT))
    print(os.path.relpath(ICONS, ROOT), 'case', ICON_INDEX)


if __name__ == '__main__':
    main()
