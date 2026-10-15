#!/usr/bin/env python3
"""Panneau de magasin provisoire : un sac d'or sur un étal, dans un cadre doré.

Remplace l'ancienne image du marchand (panneau 79, le dernier, des textures
de murs `t_*.png` de 5120 px) en attendant le dessin définitif.

Usage : python3 tools/gfx/make_shop_panel.py [--preview fichier.png]
Sans option, réécrit le panneau 79 de chaque texture qui l'utilise.
"""
import glob
import math
import os
import sys

from PIL import Image, ImageDraw, ImageFilter

W, H = 64, 96
S = 8  # suréchantillonnage, réduit à la fin pour lisser les bords
PANEL = 79
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
TEXTURES = os.path.join(ROOT, 'resources', 'gfx', 'textures')


def s(*v):
    return [x * S for x in v]


def panel():
    im = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 255))
    d = ImageDraw.Draw(im)

    # fond : velours rouge sombre, plus clair au centre
    for y in range(H * S):
        for_x = 1 - abs(y / (H * S) - 0.45) * 1.2
        c = int(70 + 50 * for_x)
        d.line([(0, y), (W * S, y)], fill=(c, 12, 16, 255))
    glow = Image.new('L', (W * S, H * S), 0)
    ImageDraw.Draw(glow).ellipse(s(6, 18, 58, 78), fill=90)
    glow = glow.filter(ImageFilter.GaussianBlur(14 * S))
    im = Image.composite(Image.new('RGBA', im.size, (200, 60, 40, 255)), im, glow)
    d = ImageDraw.Draw(im)

    # étal en bois
    d.rectangle(s(4, 74, 60, 92), fill=(92, 52, 24))
    for y in (78, 83, 88):
        d.line(s(4, y, 60, y), fill=(66, 36, 16), width=S)
    d.rectangle(s(4, 72, 60, 75), fill=(140, 86, 40))

    # pièces éparses sur l'étal
    def coin(x, y, r=4.0):
        d.ellipse(s(x - r, y - r * 0.55, x + r, y + r * 0.55), fill=(150, 100, 10))
        d.ellipse(s(x - r, y - r * 0.55 - 1, x + r, y + r * 0.55 - 1), fill=(240, 196, 40))
        d.ellipse(s(x - r * 0.55, y - r * 0.3 - 1, x + r * 0.55, y + r * 0.3 - 1), outline=(190, 140, 20), width=S)

    for x, y in ((12, 73), (17, 71.5), (50, 73), (45, 71), (54, 70.5), (9, 69.5)):
        coin(x, y)

    # sac de toile
    bag = [(32, 34), (22, 40), (14, 52), (13, 63), (18, 71), (32, 74), (46, 71), (51, 63), (50, 52), (42, 40)]
    d.polygon([tuple(s(*p)) for p in bag], fill=(150, 108, 60))
    shade = [(32, 34), (42, 40), (50, 52), (51, 63), (46, 71), (36, 73.5), (40, 60), (39, 46)]
    d.polygon([tuple(s(*p)) for p in shade], fill=(116, 80, 42))
    light = [(24, 46), (19, 54), (19, 62), (23, 58), (26, 50)]
    d.polygon([tuple(s(*p)) for p in light], fill=(184, 142, 86))
    # col froncé et cordon
    d.polygon([tuple(s(*p)) for p in ((26, 26), (38, 26), (36, 35), (28, 35))], fill=(140, 98, 54))
    for x in (28.5, 31, 33.5, 36):
        d.line(s(x, 26, x + (32 - x) * 0.3, 34), fill=(104, 70, 36), width=S)
    d.polygon([tuple(s(*p)) for p in ((24, 23), (40, 23), (38, 27), (26, 27))], fill=(162, 118, 66))
    d.rounded_rectangle(s(25, 33, 39, 37), radius=2 * S, fill=(176, 40, 30))
    d.line(s(37, 35, 42, 41), fill=(176, 40, 30), width=2 * S)
    d.line(s(42, 41, 43, 45), fill=(176, 40, 30), width=2 * S)

    # pièce frappée sur le sac
    d.ellipse(s(22, 48, 42, 68), fill=(150, 100, 10))
    d.ellipse(s(22, 47, 42, 66), fill=(244, 200, 44))
    d.ellipse(s(25.5, 50.5, 38.5, 62.5), outline=(196, 142, 20), width=S)
    # étoile à cinq branches
    cx, cy, ro, ri = 32, 56.5, 5, 2.1
    star = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5
        r = ro if k % 2 == 0 else ri
        star.append(tuple(s(cx + r * math.cos(a), cy + r * math.sin(a))))
    d.polygon(star, fill=(196, 142, 20))

    # pièces qui débordent du col
    for x, y in ((27, 21.5), (33, 20), (38, 22)):
        coin(x, y, 3.5)

    # éclats
    def sparkle(x, y, r):
        d.line(s(x - r, y, x + r, y), fill=(255, 250, 210), width=S)
        d.line(s(x, y - r, x, y + r), fill=(255, 250, 210), width=S)

    for x, y, r in ((44, 18, 3), (19, 27, 2), (48, 58, 2), (15, 47, 1.5)):
        sparkle(x, y, r)

    im = im.resize((W, H), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    # cadre doré, comme les autres panneaux
    d.rectangle((0, 0, W - 1, H - 1), outline=(120, 92, 10))
    d.rectangle((1, 1, W - 2, H - 2), outline=(232, 204, 24))
    d.rectangle((2, 2, W - 3, H - 3), outline=(232, 204, 24))
    d.rectangle((3, 3, W - 4, H - 4), outline=(90, 60, 10))
    return im


def main():
    img = panel()
    if '--preview' in sys.argv:
        img.save(sys.argv[sys.argv.index('--preview') + 1])
        return
    for f in sorted(glob.glob(os.path.join(TEXTURES, 't_*.png'))):
        tex = Image.open(f)
        if tex.size != (80 * W, H):
            continue
        tex = tex.convert('RGBA')
        old = tex.crop((PANEL * W, 0, (PANEL + 1) * W, H))
        if old.getextrema()[3][1] == 0:
            continue  # panneau vide : texture sans magasin
        tex.paste(img, (PANEL * W, 0))
        tex.save(f)
        print(os.path.relpath(f, ROOT))


if __name__ == '__main__':
    main()
