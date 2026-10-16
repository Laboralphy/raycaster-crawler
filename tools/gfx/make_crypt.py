#!/usr/bin/env python3
"""Thème crypte / mausolée : t_crypt.png (murs) et f_crypt.png (sol + plafond),
plus une variante plus sombre t_crypt_2.png / f_crypt_2.png (même dessin,
rampe assombrie).

Même méthode que les thèmes d'origine (t_crimson, t_green, t_blue...) :
les 80 tuiles de t_gray sont reprises, la maçonnerie de fond est remplacée
par des pierres de taille de crypte, puis tous les pixels gris passent par
une rampe de couleur (os / cendre, ombres froides verdâtres). Les pixels
déjà colorés (livres, flammes, clés, vitraux...) et le blanc pur ne
changent pas.

Les tuiles 1 à 7 (variantes de mur tirées au hasard) deviennent les décors
de crypte : fissures, loculi avec crâne, dalle scellée, ossuaire, salpêtre
et mousse, crâne sculpté, toiles d'araignée.

Usage : python3 tools/gfx/make_crypt.py [--preview dossier]
"""
import os
import random
import sys

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
TEX = os.path.join(ROOT, 'resources', 'gfx', 'textures')
TW, TH = 64, 96
SECRET_TILE = 18  # BLOCK_SECRET / BLOCK_SECRET_WALL : doit trahir le passage
S = 4  # suréchantillonnage

rnd = random.Random(1347)

# rampe : niveau de gris d'origine -> couleur de crypte
RAMP = [
    (0, (4, 6, 6)),
    (40, (24, 28, 26)),
    (80, (54, 57, 50)),
    (128, (104, 102, 86)),
    (176, (158, 151, 127)),
    (208, (196, 188, 160)),
    (249, (230, 223, 196)),
]

# variante sombre : mêmes teintes, environ deux fois moins de lumière
RAMP_DARK = [
    (0, (2, 3, 3)),
    (40, (11, 14, 13)),
    (80, (26, 29, 26)),
    (128, (54, 54, 46)),
    (176, (86, 82, 70)),
    (208, (112, 107, 90)),
    (249, (140, 134, 116)),
]

# niveaux de gris de la maçonnerie (avant rampe)
MORTAR = 44
STONE = 168
LIGHT = 214
SHADOW = 112
RECESS = 26


def ramp(v, table=RAMP):
    for (a, ca), (b, cb) in zip(table, table[1:]):
        if v <= b:
            t = (v - a) / (b - a)
            return tuple(int(ca[i] + (cb[i] - ca[i]) * t) for i in range(3))
    return table[-1][1]


def colorize(im, table=RAMP):
    """Passe les pixels gris dans la rampe ; garde couleurs et blanc pur."""
    im = im.convert('RGBA')
    px = im.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b, a = px[x, y]
            if a == 0 or max(r, g, b) - min(r, g, b) > 14:
                continue
            if min(r, g, b) >= 250:
                continue
            px[x, y] = ramp((r + g + b) // 3, table) + (a,)
    return im


def gray(v):
    v = max(0, min(255, int(v)))
    return (v, v, v)


# ---------------------------------------------------------------- maçonnerie

# assises : (y, hauteur, largeur des blocs, décalage)
COURSES = [(0, 10, 64, 0), (10, 26, 32, 0), (36, 26, 32, 16), (62, 26, 32, 0), (88, 8, 64, 32)]


def blocks():
    """Liste des blocs (x, y, w, h, teinte), raccord gauche-droite."""
    out = []
    r = random.Random(77)
    for y, h, w, off in COURSES:
        x = off - w * 2
        while x < TW + w:
            out.append((x, y, w, h, r.randint(-10, 10)))
            x += w
    return out


BLOCKS = blocks()


def draw_block(d, x, y, w, h, tone, base=STONE):
    """Bloc biseauté façon ODG : joint sombre, arête claire, ombre."""
    X, Y, W, H = x * S, y * S, w * S, h * S
    d.rectangle([X, Y, X + W - 1, Y + H - 1], fill=gray(MORTAR))
    m = 1 * S  # demi-joint
    d.rectangle([X + m, Y + m, X + W - 1 - m, Y + H - 1 - m], fill=gray(SHADOW + tone))
    d.rectangle([X + m, Y + m, X + W - 1 - m - S, Y + H - 1 - m - S], fill=gray(LIGHT + tone))
    d.rectangle([X + m + S, Y + m + S, X + W - 1 - m - S, Y + H - 1 - m - S], fill=gray(base + tone))


def wall_layer():
    im = Image.new('RGB', (TW * S, TH * S))
    d = ImageDraw.Draw(im)
    for x, y, w, h, tone in BLOCKS:
        draw_block(d, x, y, w, h, tone)
    return im


def grain(im, amount=7, seed=0):
    """Grain de pierre, uniquement sur les pixels gris."""
    r = random.Random(seed)
    px = im.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            p = px[x, y]
            if max(p[:3]) - min(p[:3]) <= 2:
                v = p[0] + r.randint(-amount, amount)
                px[x, y] = gray(v) + p[3:]
    return im


def down(im):
    return im.resize((im.size[0] // S, im.size[1] // S), Image.BOX)


# ---------------------------------------------------------------- motifs

def skull(d, cx, cy, s, fill=200, dark=RECESS):
    """Crâne de face, centré en (cx, cy) en pixels finaux, taille s."""
    k = S * s / 10
    X, Y = cx * S, cy * S
    d.ellipse([X - 5 * k, Y - 6 * k, X + 5 * k, Y + 3 * k], fill=gray(fill))
    d.rounded_rectangle([X - 3.2 * k, Y + 1 * k, X + 3.2 * k, Y + 6 * k], radius=1.2 * k, fill=gray(fill))
    d.ellipse([X - 3.6 * k, Y - 2 * k, X - 0.8 * k, Y + 1.2 * k], fill=gray(dark))
    d.ellipse([X + 0.8 * k, Y - 2 * k, X + 3.6 * k, Y + 1.2 * k], fill=gray(dark))
    d.polygon([(X, Y + 1.4 * k), (X - 0.8 * k, Y + 3 * k), (X + 0.8 * k, Y + 3 * k)], fill=gray(dark))
    for i in range(-2, 3):
        tx = X + i * 1.1 * k
        d.line([tx, Y + 4 * k, tx, Y + 6 * k], fill=gray(fill - 70), width=max(1, int(k * 0.3)))
    d.line([X - 3 * k, Y + 4.4 * k, X + 3 * k, Y + 4.4 * k], fill=gray(fill - 70), width=max(1, int(k * 0.3)))
    # reflet
    d.arc([X - 4.2 * k, Y - 5.4 * k, X + 2 * k, Y + 1 * k], 200, 260, fill=gray(min(250, fill + 40)), width=max(1, int(k * 0.5)))


def bone(d, x0, y0, x1, y1, w=2.2, fill=196):
    """Os long entre deux points (pixels finaux)."""
    import math
    X0, Y0, X1, Y1 = x0 * S, y0 * S, x1 * S, y1 * S
    k = w * S
    d.line([X0, Y0, X1, Y1], fill=gray(fill), width=int(k))
    ang = math.atan2(Y1 - Y0, X1 - X0)
    nx, ny = -math.sin(ang) * k * 0.55, math.cos(ang) * k * 0.55
    for X, Y in ((X0, Y0), (X1, Y1)):
        for sgn in (-1, 1):
            r = k * 0.62
            d.ellipse([X + sgn * nx - r, Y + sgn * ny - r, X + sgn * nx + r, Y + sgn * ny + r], fill=gray(fill))


def bone_end(d, cx, cy, r, fill):
    """Tête d'os vue de bout (double bosse), pour les ossuaires."""
    X, Y, R = cx * S, cy * S, r * S
    for dx in (-0.8, 0.8):
        d.ellipse([X + dx * R - R, Y - R, X + dx * R + R, Y + R], fill=gray(fill))
    d.ellipse([X - 0.5 * R, Y + 0.1 * R, X + 0.5 * R, Y + 0.9 * R], fill=gray(fill - 60))


def niche(d, x, y, w, h):
    """Loculus : renfoncement sombre avec encadrement de pierre."""
    X, Y, W, H = x * S, y * S, w * S, h * S
    d.rectangle([X - 2 * S, Y - 2 * S, X + W + 2 * S - 1, Y + H + 2 * S - 1], fill=gray(MORTAR))
    d.rectangle([X - S, Y - S, X + W + S - 1, Y + H + S - 1], fill=gray(LIGHT))
    d.rectangle([X, Y, X + W - 1, Y + H - 1], fill=gray(SHADOW - 30))
    d.rectangle([X, Y + 2 * S, X + W - 1 - 2 * S, Y + H - 1], fill=gray(RECESS))


def cracks(d, seed, n=3):
    r = random.Random(seed)
    for _ in range(n):
        x, y = r.uniform(4, 60), r.uniform(12, 84)
        pts = [(x * S, y * S)]
        for _ in range(r.randint(4, 7)):
            x += r.uniform(-4, 4)
            y += r.uniform(1.5, 5)
            pts.append((x * S, y * S))
        d.line(pts, fill=gray(MORTAR), width=S)
        d.line([(px + S, py) for px, py in pts], fill=gray(LIGHT + 8), width=S // 2)


def cobweb(d, corner, size):
    """Toile d'araignée dans un coin : 0 haut-gauche, 1 haut-droit."""
    import math
    cx = 0 if corner == 0 else TW
    sgn = 1 if corner == 0 else -1
    C = (cx * S, 0)
    R = size * S
    col = gray(236)
    spokes = [math.radians(a) for a in (8, 30, 52, 74, 88)]
    for a in spokes:
        d.line([C, (C[0] + sgn * math.cos(a) * R, math.sin(a) * R)], fill=col, width=S // 2)
    for f in (0.3, 0.52, 0.74, 0.95):
        pts = []
        for i, a in enumerate(spokes):
            rr = R * f * (0.92 if i % 2 else 1.0)
            pts.append((C[0] + sgn * math.cos(a) * rr, math.sin(a) * rr))
        d.line(pts, fill=col, width=S // 2)


def stains(im, seed, moss=None):
    """Coulures de salpêtre depuis le haut, mousse verdâtre en bas."""
    r = random.Random(seed)
    over = Image.new('L', im.size, 0)
    d = ImageDraw.Draw(over)
    for _ in range(5):
        x = r.uniform(4, 60) * S
        length = r.uniform(25, 70) * S
        w = r.uniform(2, 5) * S
        d.rounded_rectangle([x - w / 2, 0, x + w / 2, length], radius=w / 2, fill=110)
        d.ellipse([x - w, length - w, x + w, length + w], fill=90)
    over = over.filter(ImageFilter.GaussianBlur(3 * S))
    dark = Image.new('RGB', im.size, gray(30))
    im = Image.composite(dark, im, over)
    if moss:
        mm = Image.new('L', im.size, 0)
        d = ImageDraw.Draw(mm)
        for _ in range(26):
            x, y = r.uniform(0, 64) * S, r.uniform(78, 96) * S
            rr = r.uniform(2, 6) * S
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=r.randint(120, 200))
        mm = mm.filter(ImageFilter.GaussianBlur(1.5 * S))
        green = Image.new('RGB', im.size, moss)
        im = Image.composite(green, im, mm)
    return im


def engraved_slab(d, x, y, w, h):
    """Dalle scellée : bord biseauté, croix et lignes d'épitaphe gravées."""
    draw_block(d, x, y, w, h, 6, base=STONE + 14)
    X, Y = x * S, y * S
    cx = X + w * S // 2
    d.rectangle([cx - S, Y + 4 * S, cx + S - 1, Y + 14 * S], fill=gray(MORTAR + 20))
    d.rectangle([cx - 4 * S, Y + 7 * S, cx + 4 * S - 1, Y + 8 * S + S - 1], fill=gray(MORTAR + 20))
    for i, ww in enumerate((18, 14, 16)):
        ly = Y + (18 + i * 3) * S
        d.rectangle([cx - ww * S // 2, ly, cx + ww * S // 2, ly + S - 1], fill=gray(SHADOW - 10))


# ---------------------------------------------------------------- variantes

def variant(n, moss=(62, 88, 44)):
    im = wall_layer()
    d = ImageDraw.Draw(im)
    if n == 1:  # fissures + petite toile
        cracks(d, 11, 3)
        cobweb(d, 0, 14)
    elif n == 2:  # loculus avec crâne
        niche(d, 17, 41, 30, 17)
        skull(d, 33, 50, 6.5)
        bone(d, 21, 56, 28, 55, 1.6, 170)
    elif n == 3:  # loculus scellé, épitaphe
        draw_block(d, 14, 38, 36, 28, 0, base=MORTAR + 10)
        engraved_slab(d, 16, 40, 32, 24)
    elif n == 4:  # ossuaire : rangées de têtes d'os et de crânes
        niche(d, 6, 40, 52, 44)
        for row, yy in enumerate((79, 51)):
            for j in range(6):
                bone_end(d, 11 + j * 8.4 + (4.2 if row % 2 else 0), yy, 2.1, 200 - (j % 3) * 10)
        for j, xx in enumerate((15, 32, 49)):
            skull(d, xx, 64, 6.2, 210 - (j % 2) * 16)
    elif n == 5:  # salpêtre + mousse
        cracks(d, 51, 1)
        return stains(im, 5, moss)
    elif n == 6:  # crâne et tibias sculptés en relief
        bone(d, 19, 34, 45, 62, 3.0, LIGHT - 10)
        bone(d, 45, 34, 19, 62, 3.0, LIGHT - 10)
        skull(d, 32 + 0.6, 46 + 0.6, 9, SHADOW - 20, SHADOW - 20)  # ombre portée
        skull(d, 32, 46, 9, LIGHT - 6, SHADOW - 10)
    elif n == SECRET_TILE:  # mur secret : une pierre descellée, légèrement de travers
        x, y, w, h, tone = 16, 36, 32, 26, 0
        d.rectangle([x * S, y * S, (x + w) * S - 1, (y + h) * S - 1], fill=gray(RECESS))
        draw_block(d, x + 1, y + 1, w - 1, h - 1, -16)
    elif n == 7:  # grandes toiles d'araignée
        cobweb(d, 0, 30)
        cobweb(d, 1, 22)
        cracks(d, 71, 1)
    return im


# ---------------------------------------------------------------- composition

def prop_mask(gray_strip, i, ref):
    """Pixels de la tuile i de t_gray qui ne sont pas la maçonnerie d'origine."""
    tile = gray_strip.crop((i * TW, 0, (i + 1) * TW, TH)).convert('RGBA')
    tp, rp = tile.load(), ref.load()
    m = Image.new('L', (TW, TH), 0)
    mp = m.load()
    for y in range(TH):
        for x in range(TW):
            a, b = tp[x, y], rp[x, y]
            if max(abs(a[k] - b[k]) for k in range(4)) > 6:
                mp[x, y] = 255
    # bouche les trous isolés à l'intérieur des objets (pixels égaux par hasard)
    seen = set()
    for y in range(TH):
        for x in range(TW):
            if mp[x, y] or (x, y) in seen:
                continue
            comp, stack = [], [(x, y)]
            seen.add((x, y))
            while stack:
                cx, cy = stack.pop()
                comp.append((cx, cy))
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < TW and 0 <= ny < TH and not mp[nx, ny] and (nx, ny) not in seen:
                        seen.add((nx, ny))
                        stack.append((nx, ny))
            touches = any(px in (0, TW - 1) or py in (0, TH - 1) for px, py in comp)
            if len(comp) < 40 or not touches:
                for p in comp:
                    mp[p] = 255
    return tile, m


def build_walls(table=RAMP, wall_fn=None, variant_fn=None, **variant_kw):
    """Bande de 80 tuiles. Sans rampe (table=None), rend la version grise."""
    wall_fn = wall_fn or wall_layer
    variant_fn = variant_fn or variant
    src = Image.open(os.path.join(TEX, 't_gray.png')).convert('RGBA')
    n = src.size[0] // TW
    ref = src.crop((0, 0, TW, TH))
    base = grain(down(wall_fn()).convert('RGBA'), seed=1)
    out = Image.new('RGBA', (n * TW, TH))
    for i in range(n):
        if 1 <= i <= 7 or i == SECRET_TILE:
            t = grain(down(variant_fn(i, **variant_kw)).convert('RGBA'), seed=100 + i)
        else:
            tile, m = prop_mask(src, i, ref)
            if sum(m.getdata()) > 255 * TW * TH // 2:
                t = tile  # autre style de mur (panneaux...) : tuile gardée entière
            else:
                t = Image.composite(tile, base, m)
        out.paste(t, (i * TW, 0))
    return colorize(out, table) if table else out


def build_flats(table=RAMP):
    """Sol : dalles funéraires usées ; plafond : voûte sombre peu contrastée."""
    im = Image.new('RGB', (128 * S, 64 * S))
    d = ImageDraw.Draw(im)
    r = random.Random(5)
    # sol : grandes dalles 32x32 en quinconce, raccord sur les quatre bords
    for row in range(2):
        off = 16 if row % 2 else 0
        for col in range(-1, 3):
            x = col * 32 + off
            draw_block(d, x, row * 32, 32, 32, r.randint(-14, 6), base=STONE - 18)
    # une dalle gravée d'une croix (rappel funéraire, discret)
    cx, cy = 16 * S, 16 * S
    d.rectangle([cx - S // 2, cy - 7 * S, cx + S // 2, cy + 7 * S], fill=gray(SHADOW - 6))
    d.rectangle([cx - 4 * S, cy - 3 * S, cx + 4 * S, cy - 2 * S], fill=gray(SHADOW - 6))
    floor = im.crop((0, 0, 64 * S, 64 * S))
    fd = ImageDraw.Draw(floor)
    for seed, (x, y) in ((3, (44, 6)), (9, (28, 38))):
        rr = random.Random(seed)
        pts = [(x * S, y * S)]
        for _ in range(5):
            x += rr.uniform(-4, 4)
            y += rr.uniform(2, 5)
            pts.append((x * S, y * S))
        fd.line(pts, fill=gray(MORTAR), width=S)
    # plafond : nervures de voûte, tons sombres
    ceil = Image.new('RGB', (64 * S, 64 * S), gray(70))
    cd = ImageDraw.Draw(ceil)
    for row in range(4):
        off = 8 if row % 2 else 0
        for col in range(-1, 5):
            x, y = (col * 16 + off) * S, row * 16 * S
            tone = r.randint(-5, 5)
            cd.rectangle([x, y, x + 16 * S - 1, y + 16 * S - 1], fill=gray(52))
            cd.rectangle([x + S, y + S, x + 15 * S - 1, y + 15 * S - 1], fill=gray(76 + tone))
            cd.rectangle([x + 2 * S, y + 2 * S, x + 15 * S - 1, y + 15 * S - 1], fill=gray(68 + tone))
    # nervure centrale (arc doubleau) en travers
    cd.rectangle([0, 29 * S, 64 * S, 35 * S - 1], fill=gray(56))
    cd.rectangle([0, 30 * S, 64 * S, 31 * S - 1], fill=gray(84))
    cd.rectangle([0, 31 * S, 64 * S, 34 * S - 1], fill=gray(74))
    out = Image.new('RGB', (128 * S, 64 * S))
    out.paste(floor, (0, 0))
    out.paste(ceil, (64 * S, 0))
    out = down(out).convert('RGBA')
    fl = grain(out.crop((0, 0, 64, 64)), 8, seed=7)
    ce = grain(out.crop((64, 0, 128, 64)), 3, seed=8)
    out.paste(fl, (0, 0))
    out.paste(ce, (64, 0))
    return colorize(out, table)


def preview(walls, flats, folder, name='crypt'):
    from PIL import ImageDraw as D
    n = walls.size[0] // TW
    cols = 20
    rows = (n + cols - 1) // cols
    sheet = Image.new('RGBA', (cols * 68, rows * 112), (40, 0, 40, 255))
    d = D.Draw(sheet)
    for i in range(n):
        x, y = (i % cols) * 68, (i // cols) * 112
        sheet.paste(walls.crop((i * TW, 0, i * TW + TW, TH)), (x, y + 14))
        d.text((x + 2, y + 1), str(i), fill=(255, 255, 255))
    sheet.save(os.path.join(folder, name + '_sheet.png'))
    big = walls.crop((0, 0, 8 * TW, TH)).resize((8 * TW * 3, TH * 3), Image.NEAREST)
    big.save(os.path.join(folder, name + '_variants.png'))
    flats.resize((512, 256), Image.NEAREST).save(os.path.join(folder, name + '_flats.png'))
    t = Image.new('RGBA', (128, 128))
    for i in range(2):
        for j in range(2):
            t.paste(flats.crop((0, 0, 64, 64)), (i * 64, j * 64))
    t.resize((384, 384), Image.NEAREST).save(os.path.join(folder, name + '_floor_tiled.png'))


def main():
    for name, table, moss in (('crypt', RAMP, (62, 88, 44)), ('crypt_2', RAMP_DARK, (30, 44, 22))):
        walls = build_walls(table, moss=moss)
        flats = build_flats(table)
        walls.save(os.path.join(TEX, 't_%s.png' % name))
        flats.save(os.path.join(TEX, 'f_%s.png' % name))
        if '--preview' in sys.argv:
            preview(walls, flats, sys.argv[sys.argv.index('--preview') + 1], name)


if __name__ == '__main__':
    main()
