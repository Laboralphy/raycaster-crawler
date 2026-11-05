#!/usr/bin/env python3
"""Image du livre de l'histoire n° 1 : le donjon de la forêt
(forest[1]) la nuit, et le Sorcier qui le domine dans le ciel, derrière les
créneaux. En niveaux de gris, dans le cadre des images de l'histoire.

Entrées (tools/gfx/story1/), rendues par le jeu lui-même :
- forest1_keep.png : forest[1], graine 1 (cheat « regen 1 »), écran de
  600 x 900, joueur en (9.5, 5.5) face au nord, arme masquée ;
- forest1_keep_skymask.png : la même vue, ciel remplacé par du magenta pur
  (masque du ciel : le sorcier n'apparaît que là).
Sprite : resources/gfx/sprites/m_warlockboss.png, première vue (de face).
Cadre : celui de resources/gfx/books/book_of_story2.png.

Sortie : resources/gfx/books/book_of_story1.png (128 x 192).
Usage : python3 tools/gfx/make_story1.py [--preview fichier.png]
"""
import os
import sys
from PIL import Image, ImageChops, ImageEnhance, ImageFilter

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'tools', 'gfx', 'story1')
BOOKS = os.path.join(ROOT, 'resources', 'gfx', 'books')
SPRITE = os.path.join(ROOT, 'resources', 'gfx', 'sprites', 'm_warlockboss.png')
OUT = os.path.join(BOOKS, 'book_of_story1.png')

# cadre des images de l'histoire : bords gauche, haut, droit, bas
FRAME = (11, 13, 11, 12)
SPRITE_W, SPRITE_H = 72, 96      # une vue de la planche
WARLOCK_SCALE = 6                # le sorcier, agrandi (pixels du jeu)
WARLOCK_TOP = -60                # haut du chapeau, dans l'écran 600 x 900
WARLOCK_ALPHA = 0.85             # un peu fantomatique
SCENE_GAMMA = 1.6                # assombrit la pierre : c'est la nuit
CROP_BOTTOM = 770                # coupe une partie du sol


def sky_mask(im_mask):
    """255 là où le rendu au ciel magenta est magenta"""
    r, g, b = im_mask.convert('RGB').split()
    m = ImageChops.multiply(r.point(lambda v: 255 if v > 240 else 0),
                            b.point(lambda v: 255 if v > 240 else 0))
    return ImageChops.multiply(m, g.point(lambda v: 255 if v < 16 else 0))


def warlock(size):
    """le sorcier en gris, sur un calque de la taille de la scène ; ses yeux
    rouges, qui deviendraient gris moyen, sont rendus blancs et lumineux"""
    sheet = Image.open(SPRITE).convert('RGBA')
    w = sheet.crop((0, 0, SPRITE_W, SPRITE_H))
    r, g, b, a = w.split()
    gray = w.convert('L').point(lambda v: int(v * 0.75))
    eyes = ImageChops.multiply(r.point(lambda v: 255 if v > 150 else 0),
                               g.point(lambda v: 255 if v < 90 else 0))
    gray = Image.composite(Image.new('L', w.size, 255), gray, eyes)
    k = WARLOCK_SCALE
    gray = gray.resize((SPRITE_W * k, SPRITE_H * k), Image.NEAREST)
    a = a.resize(gray.size, Image.NEAREST)
    eyes = eyes.resize(gray.size, Image.NEAREST)
    x, y = (size[0] - gray.width) // 2, WARLOCK_TOP
    layer = Image.new('L', size, 0)
    alpha = Image.new('L', size, 0)
    glow = Image.new('L', size, 0)
    layer.paste(gray, (x, y))
    alpha.paste(a, (x, y))
    glow.paste(eyes, (x, y))
    glow = glow.filter(ImageFilter.GaussianBlur(k * 2.5))
    return layer, alpha, glow


def main():
    scene = Image.open(os.path.join(SRC, 'forest1_keep.png')).convert('L')
    scene = scene.point(lambda v: int(255 * (v / 255) ** SCENE_GAMMA))
    mask = sky_mask(Image.open(os.path.join(SRC, 'forest1_keep_skymask.png')))
    wl, wa, glow = warlock(scene.size)
    # le sorcier derrière le donjon : seulement sur le ciel
    alpha = ImageChops.multiply(wa, mask).point(lambda v: int(v * WARLOCK_ALPHA))
    scene = Image.composite(wl, scene, alpha)
    # halo des yeux, lui aussi derrière les créneaux
    scene = ImageChops.add(scene, ImageChops.multiply(glow.point(lambda v: min(255, v * 2)), mask).point(lambda v: v // 2))

    fl, ft, fr, fb = FRAME
    frame = Image.open(os.path.join(BOOKS, 'book_of_story2.png')).convert('RGBA')
    iw, ih = frame.width - fl - fr, frame.height - ft - fb
    # recadrage aux proportions de la fenêtre du cadre, centré, sans le bas du sol
    ch = CROP_BOTTOM
    cw = round(ch * iw / ih)
    x0 = (scene.width - cw) // 2
    pic = scene.crop((x0, 0, x0 + cw, ch)).resize((iw, ih), Image.LANCZOS)
    pic = ImageEnhance.Contrast(pic).enhance(1.15)
    pic = pic.filter(ImageFilter.UnsharpMask(radius=1, percent=40, threshold=2))

    out = frame.copy()
    out.paste(Image.merge('RGBA', (pic, pic, pic, Image.new('L', pic.size, 255))), (fl, ft))
    if len(sys.argv) > 2 and sys.argv[1] == '--preview':
        out.resize((out.width * 3, out.height * 3), Image.NEAREST).save(sys.argv[2])
        print('aperçu :', sys.argv[2])
    else:
        out.save(OUT, optimize=True)
        print('écrit :', os.path.relpath(OUT, ROOT))


if __name__ == '__main__':
    main()
