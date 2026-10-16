#!/usr/bin/env python3
"""Ciel infernal : soleil éclipsé, nuées de cendre, lueur de lave à l'horizon,
pics noirs et flèches de donjon.

Même format que make_sky.py (panorama 360° de 3200 x 500 px, horizon au
milieu, bords gauche et droit raccordés) ; reprend ses outils.

Usage : python3 tools/gfx/make_sky_hell.py [--preview fichier.png]
"""
import math
import os
import random
import sys

from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_sky import H, HORIZON, ROOT, S, W, lerp, ridge, wrapped  # noqa: E402

OUT = os.path.join(ROOT, 'resources', 'gfx', 'textures', 'sky_hell.png')
SUN = (2150, 110)  # centre du soleil noir, en pixels de l'image finale

rnd = random.Random(666)


def sky_gradient():
    im = Image.new('RGB', (W * S, H * S))
    d = ImageDraw.Draw(im)
    top, mid, low = (10, 1, 3), (52, 6, 8), (150, 34, 10)
    for y in range(HORIZON * S):
        t = y / (HORIZON * S)
        c = lerp(top, mid, t / 0.6) if t < 0.6 else lerp(mid, low, (t - 0.6) / 0.4)
        d.line([(0, y), (W * S, y)], fill=c)
    d.rectangle((0, HORIZON * S, W * S, H * S), fill=(8, 1, 1))
    return im


def horizon_glow(im):
    """Lueur de lave : bande orangée irrégulière juste au-dessus de l'horizon."""
    glow = Image.new('L', im.size, 0)
    d = ImageDraw.Draw(glow)
    for _ in range(40):
        x = rnd.uniform(0, W)
        w, h = rnd.uniform(120, 360), rnd.uniform(20, 50)
        a = rnd.randint(70, 150)
        wrapped(lambda px, w=w, h=h, a=a: d.ellipse((px - w * S, (HORIZON - h) * S, px + w * S, (HORIZON + h) * S), fill=a), x * S)
    glow = glow.filter(ImageFilter.GaussianBlur(30 * S))
    return Image.composite(Image.new('RGB', im.size, (255, 96, 20)), im, glow)


def black_sun(im):
    """Soleil éclipsé : disque noir, couronne rouge et halo."""
    sx, sy = SUN[0] * S, SUN[1] * S
    halo = Image.new('L', im.size, 0)
    ImageDraw.Draw(halo).ellipse((sx - 110 * S, sy - 110 * S, sx + 110 * S, sy + 110 * S), fill=110)
    halo = halo.filter(ImageFilter.GaussianBlur(45 * S))
    im = Image.composite(Image.new('RGB', im.size, (200, 40, 12)), im, halo)
    corona = Image.new('L', im.size, 0)
    cd = ImageDraw.Draw(corona)
    r = 38 * S
    cd.ellipse((sx - r - 5 * S, sy - r - 5 * S, sx + r + 5 * S, sy + r + 5 * S), fill=255)
    for k in range(48):  # rayons irréguliers
        a = 2 * math.pi * k / 48 + rnd.uniform(-0.05, 0.05)
        ln = rnd.uniform(10, 28) * S
        cd.line((sx + math.cos(a) * r, sy + math.sin(a) * r,
                 sx + math.cos(a) * (r + ln), sy + math.sin(a) * (r + ln)), fill=170, width=2 * S)
    corona = corona.filter(ImageFilter.GaussianBlur(4 * S))
    im = Image.composite(Image.new('RGB', im.size, (255, 150, 60)), im, corona)
    ImageDraw.Draw(im).ellipse((sx - r, sy - r, sx + r, sy + r), fill=(6, 0, 0))
    return im


def ash_clouds(im):
    """Nuées sombres, dessous éclairé de rouge par la lave."""
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for by in (70, 120, 165, 200):
        for _ in range(9):
            bx = rnd.uniform(0, W)
            n = rnd.randint(5, 9)
            length = rnd.uniform(200, 420)
            for i in range(n):
                x = bx + (i / (n - 1) - 0.5) * length + rnd.uniform(-20, 20)
                y = by + rnd.uniform(-10, 10)
                rx, ry = rnd.uniform(40, 80), rnd.uniform(8, 18)
                lit = int(40 + 80 * (by / HORIZON))

                def blob(px, py=y, rx=rx, ry=ry, lit=lit):
                    d.ellipse(((px - rx) * S, (py - ry + 3) * S, (px + rx) * S, (py + ry + 3) * S), fill=(lit + 60, lit // 3, 6, 190))
                    d.ellipse(((px - rx) * S, (py - ry - 1) * S, (px + rx) * S, (py + ry - 1) * S), fill=(24, 6, 8, 230))
                wrapped(lambda px: blob(px / S), x * S)
    layer = layer.filter(ImageFilter.GaussianBlur(4 * S))
    im = im.convert('RGBA')
    im.alpha_composite(layer)
    return im.convert('RGB')


def embers(im):
    d = ImageDraw.Draw(im)
    for _ in range(500):
        x, y = rnd.uniform(0, W), HORIZON - rnd.uniform(0, HORIZON) ** 1.0 * rnd.random()
        b = rnd.random() ** 2
        c = (255, int(90 + 120 * b), int(30 * b))
        r = 0.5 + 1.2 * b
        d.ellipse(((x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S), fill=c)


def peaks(im):
    """Pics noirs déchiquetés, avec quelques flèches de donjon au premier plan."""
    d = ImageDraw.Draw(im)
    layers = [
        ((40, 8, 8), 70, [(4, 26), (9, 18), (19, 10), (41, 6), (89, 3)]),
        ((18, 3, 4), 40, [(5, 18), (11, 12), (23, 8), (47, 5), (101, 2.5)]),
        ((5, 1, 1), 16, [(6, 9), (13, 7), (27, 5), (53, 3), (113, 2)]),
    ]
    for li, (color, base, waves) in enumerate(layers):
        phase = [rnd.uniform(0, 2 * math.pi) for _ in waves]
        pts = [(0, H * S)]
        for xs in range(0, W * S + 1, 2):
            y = ridge(xs / S, waves, HORIZON - base, phase)
            # crêtes pointues : on replie la sinusoïde vers le haut
            y -= abs(math.sin(xs / S / 37 + li)) * 6
            pts.append((xs, min(y, HORIZON) * S))
        pts.append((W * S, H * S))
        d.polygon(pts, fill=color)
    # flèches gothiques sur la dernière crête
    for _ in range(7):
        x = rnd.uniform(0, W)
        h, w = rnd.uniform(40, 80), rnd.uniform(6, 12)

        def spire(px, h=h, w=w):
            X, Y = px, (HORIZON - 10) * S
            d.polygon([(X - w * S, Y), (X - w * S, Y - h * 0.6 * S), (X, Y - h * S),
                       (X + w * S, Y - h * 0.6 * S), (X + w * S, Y)], fill=(4, 0, 0))
            d.rectangle((X - 1.5 * S, Y - h * 0.45 * S, X + 1.5 * S, Y - h * 0.38 * S), fill=(255, 110, 30))
        wrapped(spire, x * S)


def sky():
    im = sky_gradient()
    im = horizon_glow(im)
    im = black_sun(im)
    embers(im)
    im = ash_clouds(im)
    peaks(im)
    return im.resize((W, H), Image.LANCZOS)


def main():
    img = sky()
    if '--preview' in sys.argv:
        img.save(sys.argv[sys.argv.index('--preview') + 1])
        return
    img.save(OUT, optimize=True)
    print(os.path.relpath(OUT, ROOT))


if __name__ == '__main__':
    main()
