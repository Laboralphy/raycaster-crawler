#!/usr/bin/env python3
"""Thème gothique infernal : t_gothic.png (murs) et f_gothic.png (sol + plafond).

Pierres sombres, joints rougeoyants, inscriptions infernales. Même
chaîne que make_crypt.py (tuiles de t_gray, maçonnerie remplacée, rampe de
couleur sur les pixels gris), avec en plus un masque de lueur : joints,
runes et fissures y sont tracés, puis éclairés en rouge après la rampe
(cœur orangé + halo flou).

Tuiles 1 à 7 : bandeau de runes, pentagramme, arc brisé gravé, fissures
incandescentes, tablette d'écriture infernale, crâne cornu aux yeux
ardents, griffures. Tuile 18 (mur secret) : une pierre dont les joints
ne rougeoient pas.

Usage : python3 tools/gfx/make_gothic.py [--preview dossier]
"""
import math
import os
import random
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_crypt import (S, SECRET_TILE, TEX, TH, TW, colorize, down, gray,  # noqa: E402
                        grain, preview, prop_mask)

RAMP = [
    (0, (2, 1, 2)),
    (40, (10, 8, 10)),
    (90, (28, 22, 26)),
    (140, (50, 41, 45)),
    (190, (78, 64, 68)),
    (249, (128, 108, 108)),
]

MORTAR = 20
STONE = 150
LIGHT = 192
SHADOW = 96
GROOVE = 40

CORE = (226, 64, 18)    # cœur de la lueur
HALO = (120, 14, 4)     # halo rouge


class Canvas:
    """Image grise + masque de lueur, dessinés ensemble en suréchantillonné."""

    def __init__(self, w=TW, h=TH):
        self.im = Image.new('RGB', (w * S, h * S))
        self.glow = Image.new('L', (w * S, h * S), 0)
        self.d = ImageDraw.Draw(self.im)
        self.g = ImageDraw.Draw(self.glow)


# ---------------------------------------------------------------- maçonnerie

def courses(seed, heights, width=TW):
    """Assises de blocs de largeurs variées, raccord gauche-droite."""
    r = random.Random(seed)
    out, y = [], 0
    for h in heights:
        xs = [r.randint(0, 12)]
        while True:
            x = xs[-1] + r.choice((14, 18, 22, 26))
            if x >= xs[0] + width - 8:
                break
            xs.append(x)
        for i, x0 in enumerate(xs):
            x1 = xs[i + 1] if i + 1 < len(xs) else xs[0] + width
            out.append((x0, y, x1 - x0, h, r.randint(-12, 8)))
        y += h
    return out


WALL = courses(666, (12, 20, 16, 20, 16, 12))


def stone(c, x, y, w, h, tone, glow=255, period=TW):
    """Bloc sombre biseauté ; joints dans le masque de lueur."""
    for dx in (-period, 0, period):
        X, Y, W, H = (x + dx) * S, y * S, w * S, h * S
        c.d.rectangle([X, Y, X + W - 1, Y + H - 1], fill=gray(MORTAR))
        c.g.rectangle([X, Y, X + W - 1, Y + H - 1], fill=glow)
        m = S
        c.g.rectangle([X + m, Y + m, X + W - 1 - m, Y + H - 1 - m], fill=0)
        c.d.rectangle([X + m, Y + m, X + W - 1 - m, Y + H - 1 - m], fill=gray(SHADOW + tone))
        c.d.rectangle([X + m, Y + m, X + W - 1 - m - S, Y + H - 1 - m - S], fill=gray(LIGHT + tone))
        c.d.rectangle([X + m + S, Y + m + S, X + W - 1 - m - S, Y + H - 1 - m - S],
                      fill=gray(STONE + tone))


def wall(c=None, skip=None):
    c = c or Canvas()
    for i, b in enumerate(WALL):
        stone(c, *b, glow=0 if i == skip else 255)
    return c


# ---------------------------------------------------------------- inscriptions

SEGS = [((0, 0), (0, 4)), ((2, 0), (2, 4)), ((0, 0), (2, 1)), ((2, 0), (0, 1)),
        ((0, 2), (2, 2)), ((0, 4), (2, 3)), ((0, 1), (2, 3)), ((2, 1), (0, 3)),
        ((1, 0), (1, 4)), ((0, 3), (2, 4)), ((1, 2), (2, 0)), ((1, 2), (0, 4))]


def rune(c, x, y, size, seed, glow=255):
    """Glyphe anguleux gravé (rainure sombre + lueur), boîte 3x5 unités."""
    r = random.Random(seed)
    u = size / 4 * S
    segs = [SEGS[r.choice((0, 1, 8))]] + r.sample(SEGS, 2)
    for (ax, ay), (bx, by) in segs:
        p = [(x * S + ax * u, y * S + ay * u), (x * S + bx * u, y * S + by * u)]
        c.d.line(p, fill=gray(GROOVE), width=int(S * 1.6))
        c.g.line(p, fill=glow, width=int(S * 1.6))


def rune_line(c, x, y, n, size, seed, step=None, glow=255):
    step = step or size * 0.8
    for i in range(n):
        rune(c, x + i * step, y, size, seed * 31 + i, glow)


def pentagram(c, cx, cy, r):
    X, Y, R = cx * S, cy * S, r * S
    w = int(S * 1.7)
    for dd, val in ((c.d, gray(GROOVE)), (c.g, 255)):
        dd.ellipse([X - R, Y - R, X + R, Y + R], outline=val, width=w)
        dd.ellipse([X - R * 0.84, Y - R * 0.84, X + R * 0.84, Y + R * 0.84], outline=val, width=max(1, w // 2))
        pts = [(X + R * 0.84 * math.sin(math.radians(180 + 144 * k)),
                Y - R * 0.84 * math.cos(math.radians(180 + 144 * k))) for k in range(6)]
        dd.line(pts, fill=val, width=w)
    # runes autour du cercle
    for k in range(5):
        a = math.radians(36 + 72 * k)
        rune(c, cx + math.sin(a) * (r + 5) - 1.5, cy - math.cos(a) * (r + 5) - 2.5, 3.6, 900 + k, 200)


def crack(c, x, y, seed, steps=7):
    r = random.Random(seed)
    pts = [(x * S, y * S)]
    for _ in range(steps):
        x += r.uniform(-4, 4)
        y += r.uniform(2, 6)
        pts.append((x * S, y * S))
    c.d.line(pts, fill=gray(MORTAR), width=int(S * 1.5))
    c.g.line(pts, fill=255, width=int(S * 1.5))
    if steps > 4:
        i = r.randint(2, steps - 2)
        bx, by = pts[i]
        br = [(bx, by), (bx + r.choice((-1, 1)) * 6 * S, by + 5 * S), (bx + r.choice((-1, 1)) * 8 * S, by + 11 * S)]
        c.d.line(br, fill=gray(MORTAR), width=S)
        c.g.line(br, fill=210, width=S)


def pointed_arch(c, x, y, w, h):
    """Arc brisé gothique en creux, encadrement de pierre."""
    X, Y, W, H = x * S, y * S, w * S, h * S

    def shape(pad):
        pts = []
        cxl, cxr = X + W - pad, X + pad  # centres des deux arcs (tiers-point)
        rad = W - 2 * pad
        top = Y + pad + rad * 0.25
        for k in range(0, 31):
            a = math.radians(180 - k * 2)
            px = cxl + rad * math.cos(a)
            py = top + rad * 0.62 - rad * math.sin(a) * 0.9
            if px > X + W / 2:
                break
            pts.append((px, py))
        left = pts[:]
        right = [(2 * (X + W / 2) - px, py) for px, py in reversed(left)]
        return [(X + pad, Y + H - pad)] + left + right + [(X + W - pad, Y + H - pad)]

    c.d.polygon(shape(0), fill=gray(MORTAR))
    c.g.polygon(shape(0), fill=255)
    c.g.polygon(shape(S), fill=0)
    c.d.polygon(shape(S), fill=gray(LIGHT - 10))
    c.d.polygon(shape(3 * S), fill=gray(18))
    c.d.polygon(shape(4 * S), fill=gray(10))


def horned_skull(c, cx, cy, s):
    k = s * S / 10
    X, Y = cx * S, cy * S
    bone = gray(246)
    # médaillon creusé derrière le crâne
    c.d.ellipse([X - 13 * k, Y - 14 * k, X + 13 * k, Y + 10 * k], fill=gray(MORTAR))
    c.g.ellipse([X - 13 * k, Y - 14 * k, X + 13 * k, Y + 10 * k], fill=255)
    c.g.ellipse([X - 12 * k, Y - 13 * k, X + 12 * k, Y + 9 * k], fill=0)
    c.d.ellipse([X - 12 * k, Y - 13 * k, X + 12 * k, Y + 9 * k], fill=gray(30))
    # cornes
    for sg in (-1, 1):
        pts = [(X + sg * 3.5 * k, Y - 4 * k), (X + sg * 8 * k, Y - 6 * k), (X + sg * 10 * k, Y - 12 * k),
               (X + sg * 7.5 * k, Y - 8.5 * k), (X + sg * 4.5 * k, Y - 6.5 * k)]
        c.d.polygon(pts, fill=bone)
    c.d.ellipse([X - 5 * k, Y - 7 * k, X + 5 * k, Y + 2.5 * k], fill=bone)
    c.d.polygon([(X - 3.4 * k, Y), (X + 3.4 * k, Y), (X + 2.2 * k, Y + 6 * k), (X - 2.2 * k, Y + 6 * k)], fill=bone)
    for sg in (-1, 1):
        e = [X + sg * 2.2 * k - 1.5 * k, Y - 3 * k, X + sg * 2.2 * k + 1.5 * k, Y - 0.2 * k]
        c.d.polygon([(e[0], e[1] + k), (e[2], e[1] + (0 if sg > 0 else 2 * k)), (e[2], e[3]), (e[0], e[3])], fill=gray(8))
        c.g.ellipse([e[0] + 0.4 * k, e[1] + 0.8 * k, e[2] - 0.4 * k, e[3] - 0.2 * k], fill=255)
    c.d.polygon([(X, Y + 0.6 * k), (X - 0.8 * k, Y + 2.2 * k), (X + 0.8 * k, Y + 2.2 * k)], fill=gray(8))
    for i in range(-2, 3):
        c.d.line([X + i * 0.9 * k, Y + 3.6 * k, X + i * 0.9 * k, Y + 5.6 * k], fill=gray(50), width=max(1, int(k * 0.3)))


def claws(c, x, y):
    for i in range(3):
        p = [((x + i * 6) * S, y * S), ((x + i * 6 + 14) * S, (y + 30) * S)]
        c.d.line(p, fill=gray(MORTAR), width=int(S * 1.6))
        c.g.line(p, fill=230, width=int(S * 1.6))


# ---------------------------------------------------------------- variantes

def variant(n):
    if n == SECRET_TILE:
        # pierre centrale aux joints éteints : trahit le passage
        idx = min(range(len(WALL)), key=lambda i: abs(WALL[i][0] + WALL[i][2] / 2 - 32) + abs(WALL[i][1] - 48))
        return wall(skip=idx)
    c = wall()
    if n == 1:  # bandeau de runes
        c.d.rectangle([2 * S, 40 * S, 62 * S, 56 * S], fill=gray(STONE - 20))
        c.g.rectangle([2 * S, 40 * S, 62 * S, 56 * S], fill=0)
        rune_line(c, 5, 43, 7, 10 * 0.9, 1, step=8)
    elif n == 2:  # pentagramme
        pentagram(c, 32, 48, 17)
    elif n == 3:  # arc brisé, runes en colonne
        pointed_arch(c, 16, 18, 32, 66)
        for i in range(4):
            rune(c, 29.5, 44 + i * 9, 6, 300 + i, 230)
    elif n == 4:  # fissures incandescentes
        crack(c, 22, 4, 41)
        crack(c, 44, 30, 42, 9)
        crack(c, 10, 52, 43, 5)
    elif n == 5:  # tablette d'écriture infernale
        c.d.rectangle([9 * S, 26 * S, 55 * S, 74 * S], fill=gray(MORTAR))
        c.g.rectangle([9 * S, 26 * S, 55 * S, 74 * S], fill=0)
        c.d.rectangle([10 * S, 27 * S, 54 * S, 73 * S], fill=gray(LIGHT - 20))
        c.d.rectangle([11 * S, 28 * S, 54 * S, 73 * S], fill=gray(STONE - 30))
        for i in range(5):
            rune_line(c, 14, 31 + i * 8.5, 7, 6, 50 + i, step=5.4, glow=220)
    elif n == 6:  # crâne cornu, yeux ardents
        horned_skull(c, 32, 50, 11)
    elif n == 7:  # griffures
        claws(c, 16, 30)
    return c


# ---------------------------------------------------------------- rendu

def light(im, glow, wrap_y=False):
    """Applique la lueur : halo rouge flou + cœur orangé.
    Le halo raccorde en largeur (murs) et aussi en hauteur pour les sols."""
    w, h = glow.size
    ny = 3 if wrap_y else 1
    wide = Image.new('L', (w * 3, h * ny))
    for i in range(3):
        for j in range(ny):
            wide.paste(glow, (i * w, j * h))
    oy = h if wrap_y else 0
    halo = wide.filter(ImageFilter.GaussianBlur(2.2)).crop((w, oy, 2 * w, oy + h))
    halo = halo.point(lambda v: int(v * 0.75))
    out = im.convert('RGB')
    add = Image.new('RGB', (w, h), HALO)
    out = ImageChops.add(out, ImageChops.multiply(add, Image.merge('RGB', (halo, halo, halo))))
    core = Image.new('RGB', (w, h), CORE)
    out = Image.composite(core, out, glow.point(lambda v: int(v * 0.7)))
    out = out.convert('RGBA')
    out.putalpha(im.getchannel('A'))  # garde les zones transparentes de t_gray
    return out


def render_tile(c):
    t = grain(down(c.im).convert('RGBA'), seed=3)
    return t, down(c.glow)


def build_walls():
    src = Image.open(os.path.join(TEX, 't_gray.png')).convert('RGBA')
    n = src.size[0] // TW
    ref = src.crop((0, 0, TW, TH))
    base, base_glow = render_tile(wall())
    out = Image.new('RGBA', (n * TW, TH))
    for i in range(n):
        if 1 <= i <= 7 or i == SECRET_TILE:
            t, g = render_tile(variant(i))
        else:
            tile, m = prop_mask(src, i, ref)
            if sum(m.getdata()) > 255 * TW * TH // 2:
                t, g = tile, Image.new('L', (TW, TH), 0)
            else:
                t = Image.composite(tile, base, m)
                g = Image.composite(Image.new('L', (TW, TH), 0), base_glow, m)
        out.paste(light(colorize(t, RAMP), g), (i * TW, 0))
    return out


def build_flats():
    # sol : dalles irrégulières, joints ardents ; raccord sur les 4 bords
    fl = Canvas(64, 64)
    for b in courses(13, (14, 18, 16, 16)):
        stone(fl, *b)
    crack(fl, 40, 20, 77, 4)
    floor = light(colorize(grain(down(fl.im).convert('RGBA'), 9, seed=4), RAMP), down(fl.glow), wrap_y=True)
    # plafond : pierres sombres, lueur à peine perceptible
    ce = Canvas(64, 64)
    for x, y, w, h, tone in courses(21, (16, 16, 16, 16)):
        stone(ce, x, y, w, h, tone // 2, glow=60)
    ce.im = ce.im.point(lambda v: int(v * 0.62))
    ceil = light(colorize(grain(down(ce.im).convert('RGBA'), 3, seed=5), RAMP), down(ce.glow), wrap_y=True)
    out = Image.new('RGBA', (128, 64))
    out.paste(floor, (0, 0))
    out.paste(ceil, (64, 0))
    return out


def main():
    walls = build_walls()
    flats = build_flats()
    walls.save(os.path.join(TEX, 't_gothic.png'))
    flats.save(os.path.join(TEX, 'f_gothic.png'))
    if '--preview' in sys.argv:
        preview(walls, flats, sys.argv[sys.argv.index('--preview') + 1], 'gothic')


if __name__ == '__main__':
    main()
