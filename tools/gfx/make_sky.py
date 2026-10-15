#!/usr/bin/env python3
"""Ciel de nuit : croissant de lune, étoiles, quelques nuages, montagnes sombres.

Panorama de 360° en 3200 x 500 px : le raycaster montre 90° sur l'écran de
800 x 500, donc l'image fait 4 écrans de large, et la hauteur de l'écran
(sinon elle est redimensionnée). La ligne d'horizon est au milieu (y = 250) ;
la moitié basse est cachée par le sol. Les bords gauche et droit se
raccordent sans couture (montagnes en sinus de période entière, nuages
dessinés aussi de l'autre côté du bord).

Usage : python3 tools/gfx/make_sky.py [--preview fichier.png]
"""
import math
import os
import random
import sys

from PIL import Image, ImageDraw, ImageFilter

W, H = 3200, 500
HORIZON = H // 2
S = 2  # suréchantillonnage
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
OUT = os.path.join(ROOT, 'resources', 'gfx', 'textures', 'sky_night.png')
MOON = (1050, 95)  # centre du croissant, en pixels de l'image finale

rnd = random.Random(1987)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def wrapped(draw_fn, x, *args):
    """Dessine aussi de l'autre côté du bord, pour le raccord gauche-droite."""
    for dx in (-W * S, 0, W * S):
        draw_fn(x + dx, *args)


def sky_gradient():
    im = Image.new('RGB', (W * S, H * S))
    d = ImageDraw.Draw(im)
    top, mid, low = (4, 6, 20), (14, 22, 52), (40, 52, 88)
    for y in range(HORIZON * S):
        t = y / (HORIZON * S)
        c = lerp(top, mid, t / 0.7) if t < 0.7 else lerp(mid, low, (t - 0.7) / 0.3)
        d.line([(0, y), (W * S, y)], fill=c)
    d.rectangle((0, HORIZON * S, W * S, H * S), fill=(6, 8, 10))
    return im


def moon_glow(im):
    glow = Image.new('L', im.size, 0)
    mx, my = MOON[0] * S, MOON[1] * S
    ImageDraw.Draw(glow).ellipse((mx - 70 * S, my - 70 * S, mx + 70 * S, my + 70 * S), fill=70)
    glow = glow.filter(ImageFilter.GaussianBlur(40 * S))
    return Image.composite(Image.new('RGB', im.size, (90, 110, 150)), im, glow)


def stars(im):
    d = ImageDraw.Draw(im)
    mx, my = MOON
    for _ in range(1400):
        x, y = rnd.uniform(0, W), rnd.uniform(0, HORIZON - 8) ** 1.0
        if math.hypot(x - mx, y - my) < 60:
            continue
        # moins d'étoiles et plus pâles près de l'horizon
        if rnd.random() < y / HORIZON * 0.8:
            continue
        b = rnd.random() ** 2.5
        v = int(110 + 145 * b)
        tint = rnd.choice(((0, 0, 0), (-20, -10, 0), (0, -10, -30)))
        c = tuple(max(0, min(255, v + t)) for t in tint)
        r = 0.6 + 1.4 * b
        d.ellipse(((x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S), fill=c)
    # quelques étoiles brillantes, en croix
    for _ in range(14):
        x, y = rnd.uniform(0, W), rnd.uniform(10, HORIZON * 0.6)
        if math.hypot(x - mx, y - my) < 80:
            continue
        r = rnd.uniform(4, 7)
        for k in range(1, 4):
            a = 255 // k
            d.line(((x - r / k) * S, y * S, (x + r / k) * S, y * S), fill=(a, a, min(255, a + 20)), width=S)
            d.line((x * S, (y - r / k) * S, x * S, (y + r / k) * S), fill=(a, a, min(255, a + 20)), width=S)
        d.ellipse(((x - 1.5) * S, (y - 1.5) * S, (x + 1.5) * S, (y + 1.5) * S), fill=(255, 255, 240))


def moon(im):
    mx, my, r = MOON[0] * S, MOON[1] * S, 30 * S
    disc = Image.new('L', im.size, 0)
    ImageDraw.Draw(disc).ellipse((mx - r, my - r, mx + r, my + r), fill=255)
    # l'ombre qui découpe le croissant
    ImageDraw.Draw(disc).ellipse((mx - r + 17 * S, my - r - 7 * S, mx + r + 17 * S, my + r - 7 * S), fill=0)
    face = Image.new('RGB', im.size, (238, 232, 200))
    fd = ImageDraw.Draw(face)
    for cx, cy, cr in ((-18, 4, 5), (-12, 16, 3), (-20, -10, 3), (-6, 22, 2)):
        fd.ellipse((mx + (cx - cr) * S, my + (cy - cr) * S, mx + (cx + cr) * S, my + (cy + cr) * S), fill=(214, 206, 172))
    return Image.composite(face, im, disc)


def clouds(im):
    """Nuages bas et allongés, bord supérieur éclairé par la lune."""
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    banks = [(400, 150), (1250, 175), (1900, 120), (2550, 165), (3050, 140)]
    for bx, by in banks:
        n = rnd.randint(6, 10)
        length = rnd.uniform(220, 380)
        for i in range(n):
            x = bx + (i / (n - 1) - 0.5) * length + rnd.uniform(-15, 15)
            y = by + rnd.uniform(-6, 6)
            rx, ry = rnd.uniform(35, 70), rnd.uniform(8, 16)

            def blob(px, py=y, rx=rx, ry=ry):
                d.ellipse(((px - rx) * S, (py - ry - 2) * S, (px + rx) * S, (py + ry - 2) * S), fill=(96, 108, 140, 200))
                d.ellipse(((px - rx) * S, (py - ry + 2) * S, (px + rx) * S, (py + ry + 1) * S), fill=(34, 40, 62, 225))
            wrapped(lambda px: blob(px / S), x * S)
    layer = layer.filter(ImageFilter.GaussianBlur(3 * S))
    im = im.convert('RGBA')
    im.alpha_composite(layer)
    return im.convert('RGB')


def ridge(x, waves, base, phase):
    return base - sum(a * math.sin(2 * math.pi * (k * x / W) + p) for (k, a), p in zip(waves, phase))


def mountains(im):
    d = ImageDraw.Draw(im)
    layers = [
        # (couleur, hauteur de base au-dessus de l'horizon, [(fréquence, amplitude)])
        ((30, 38, 62), 62, [(3, 22), (7, 14), (13, 9), (29, 5), (61, 2.5)]),
        ((14, 18, 30), 34, [(4, 14), (9, 10), (17, 7), (37, 4), (83, 2)]),
        ((5, 7, 11), 14, [(5, 7), (11, 6), (23, 4), (47, 2.5), (97, 1.5)]),
    ]
    for color, base, waves in layers:
        phase = [rnd.uniform(0, 2 * math.pi) for _ in waves]
        pts = [(0, H * S)]
        for xs in range(0, W * S + 1, 2):
            y = ridge(xs / S, waves, HORIZON - base, phase)
            pts.append((xs, min(y, HORIZON) * S))
        pts.append((W * S, H * S))
        d.polygon(pts, fill=color)


def sky():
    im = sky_gradient()
    im = moon_glow(im)
    stars(im)
    im = moon(im)
    im = clouds(im)
    mountains(im)
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
