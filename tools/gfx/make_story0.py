#!/usr/bin/env python3
"""Image du livre de l'histoire n° 0 : un grimoire fermé, posé sur une table
dans la pénombre, un pentacle sur le plat et une gemme qui luit au centre.
En niveaux de gris, dans le cadre des images de l'histoire.

Entrée : tools/gfx/story0/grimoire.png, rendu POV-Ray de la scène
tools/gfx/story0/grimoire.pov (424 x 668, quatre fois la fenêtre du cadre) ;
--render le refait (POV-Ray 3.7 nécessaire).
Cadre : celui de resources/gfx/books/book_of_story2.png.

Sortie : resources/gfx/books/book_of_story0.png (128 x 192).
Usage : python3 tools/gfx/make_story0.py [--render] [--preview fichier.png]
"""
import os
import subprocess
import sys
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'tools', 'gfx', 'story0')
BOOKS = os.path.join(ROOT, 'resources', 'gfx', 'books')
OUT = os.path.join(BOOKS, 'book_of_story0.png')

FRAME = (11, 13, 11, 12)         # cadre des images de l'histoire : gauche, haut, droite, bas
RENDER_SCALE = 4                 # le rendu fait 4 fois la fenêtre du cadre
VIGNETTE = 0.75                  # assombrissement des bords
GLOW_THRESHOLD = 235             # pixels de la gemme (et reflets) qui rayonnent
GLOW_RADIUS = 14                 # rayon du halo, en pixels du rendu


def window_size():
    frame = Image.open(os.path.join(BOOKS, 'book_of_story2.png'))
    fl, ft, fr, fb = FRAME
    return frame.width - fl - fr, frame.height - ft - fb


def render():
    iw, ih = window_size()
    subprocess.run(['povray', '+Igrimoire.pov', '+Ogrimoire.png',
                    f'+W{iw * RENDER_SCALE}', f'+H{ih * RENDER_SCALE}',
                    '+A0.1', '+R3', '-D', '-V', '+WL0', '-GA'], cwd=SRC, check=True)


def vignette(size):
    """masque : 255 au centre, de plus en plus sombre vers les bords"""
    w, h = size
    m = Image.new('L', (w, h), 0)
    ImageDraw.Draw(m).ellipse((-w * 0.15, -h * 0.1, w * 1.15, h * 1.1), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(min(w, h) * 0.18))
    return m.point(lambda v: int(255 * (1 - VIGNETTE) + v * VIGNETTE))


def main():
    if '--render' in sys.argv:
        render()
    pic = Image.open(os.path.join(SRC, 'grimoire.png')).convert('L')
    pic = ImageChops.multiply(pic, vignette(pic.size))
    # halo de la gemme : ses pixels les plus clairs, flous, ajoutés à l'image
    glow = pic.point(lambda v: 255 if v >= GLOW_THRESHOLD else 0).filter(ImageFilter.GaussianBlur(GLOW_RADIUS))
    pic = ImageChops.add(pic, glow.point(lambda v: min(255, v * 3)))
    iw, ih = window_size()
    pic = pic.resize((iw, ih), Image.LANCZOS)
    pic = ImageEnhance.Contrast(pic).enhance(1.1)
    pic = pic.filter(ImageFilter.UnsharpMask(radius=1, percent=40, threshold=2))

    fl, ft, _, _ = FRAME
    out = Image.open(os.path.join(BOOKS, 'book_of_story2.png')).convert('RGBA')
    out.paste(Image.merge('RGBA', (pic, pic, pic, Image.new('L', pic.size, 255))), (fl, ft))
    if '--preview' in sys.argv:
        sPreview = sys.argv[sys.argv.index('--preview') + 1]
        out.resize((out.width * 3, out.height * 3), Image.NEAREST).save(sPreview)
        print('aperçu :', sPreview)
    else:
        out.save(OUT, optimize=True)
        print('écrit :', os.path.relpath(OUT, ROOT))


if __name__ == '__main__':
    main()
