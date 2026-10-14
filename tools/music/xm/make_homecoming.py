#!/usr/bin/env python3
"""
« Le long chemin du retour » (XM, OpenMPT) : joué après la victoire sur le
boss. Plein d'espoir : le joueur sait que sa mission est accomplie. Il marche
encore vers la sortie du donjon : pas de bruits d'extérieur (oiseaux...).

Ré majeur, 76 bpm, 8 motifs : 1 min 41 s, en boucle. Reprend les timbres
chaleureux de la forêt (nappe, flûte, harpe, clochettes, basse) et
y ajoute le cor, les cordes et un tambour de marche léger.

Usage : python3 make_homecoming.py [fichier.xm]   (défaut : long_way_home.xm)
"""
import sys

from make_forest import make_bass, make_bell, make_flute, make_harp, make_pad, midi
from xm_kit import OFF, Song, drum, horn, strings, wrap


def build(path):
    s = Song(16, 6, 76)
    PAD = s.ins('Warm pad', wrap(make_pad()), env=[(0, 0), (1.0, 64), (2.0, 56)], sustain=2,
                fade=3.0)
    FLU = s.ins('Flute', wrap(make_flute()), env=[(0, 0), (0.05, 64), (0.6, 54)], sustain=2,
                fade=0.8, vib=(0, 40, 3, 6))
    HRP = s.ins('Harp', wrap(make_harp()), pan=112)
    HRN = s.ins('Horn', horn(), env=[(0, 0), (0.12, 64), (1.0, 54)], sustain=2, fade=0.8,
                vib=(0, 50, 3, 5))
    STR = s.ins('Strings', strings(), env=[(0, 0), (0.5, 64), (2, 56)], sustain=2, fade=1.5)
    BEL = s.ins('Bells', wrap(make_bell()), pan=160)
    FRM = s.ins('Frame drum', drum('frame'))
    BAS = s.ins('Bass', wrap(make_bass()))

    PAD_B = ((0, 1, 2), (3, 4, 5))
    CH_BAS, CH_HRP, CH_FLU, CH_FLU_E, CH_HRN, CH_HRN2, CH_BEL, CH_FRM, CH_STR = (
        6, (7, 8), 9, 10, 11, 12, 13, 14, 15)

    VOICING = {'D': ['D4', 'F#4', 'A4'], 'A': ['C#4', 'E4', 'A4'], 'Bm': ['D4', 'F#4', 'B4'],
               'G': ['D4', 'G4', 'B4'], 'Em': ['E4', 'G4', 'B4']}
    ROOT = {'D': 'D2', 'A': 'A2', 'Bm': 'B2', 'G': 'G2', 'Em': 'E2'}
    MINOR = ('Bm', 'Em')
    FLUTE = {
        'A': 'F#5:6 E5:2 D5:4 A4:4 | C#5:6 D5:2 E5:8 | F#5:4 E5:4 D5:4 F#5:4 | B5:8 A5:4 G5:4',
        'B': 'B5:8 A5:4 G5:4 | F#5:8 A5:8 | G5:4 F#5:4 E5:4 B4:4 | C#5:8 E5:4 A5:4',
        'C': 'D6:6 B5:2 G5:8 | C#6:6 A5:2 E5:8 | F#5:4 A5:4 D6:4 F#6:4 | E6:8 D6:4 B5:4',
        'END': 'B5:4 A5:4 G5:4 B5:4 | A5:8 C#6:4 E6:4 | D6:16 | -:16',
    }
    HORN = 'D4:8 F#4:4 B4:4 | B4:6 A4:2 G4:8 | A4:4 F#4:4 D4:4 F#4:4 | E4:12 -:4'
    HORN2 = 'A3:8 F#3:8 | E3:8 A3:8 | B3:8 D4:8 | D4:8 B3:8'
    COUNTER = 'B3:16 | B3:8 D4:8 | F#4:16 | E4:8 C#4:8'
    SONG = [
        # accords                    flûte, cor,   harpe, basse, tambour (mesures), clochettes
        (['D', 'A', 'Bm', 'G'],      None,  None,  True,  True,  [],           False),
        (['D', 'A', 'Bm', 'G'],      'A',   None,  True,  True,  [],           False),
        (['G', 'D', 'Em', 'A'],      'B',   None,  True,  True,  [],           True),
        (['Bm', 'G', 'D', 'A'],      None,  'solo', True, True,  [2, 3],       False),
        (['D', 'A', 'Bm', 'G'],      'A',   'harm', True, True,  [0, 1, 2, 3], False),
        (['G', 'A', 'D', 'Bm'],      'C',   None,  True,  True,  [0, 1, 2, 3], True),
        (['G', 'A', 'D', 'D'],       'END', None,  True,  True,  [0, 1],       True),
        (['D', 'G', 'D', 'D'],       None,  None,  True,  False, [],           True),
    ]
    for i_pat, (chords, flute, hrn, harp, bass, drums, bells) in enumerate(SONG):
        p = s.new()
        for bar, c in enumerate(chords):
            r0 = bar * 16
            s.pad(p, r0, VOICING[c], PAD, 24, PAD_B)
            if bass:
                root = midi(ROOT[c])
                p.put(r0, CH_BAS, root, BAS, 48)
                p.put(r0 + 8, CH_BAS, root + 7, BAS, 32)
            if harp:
                base = midi(ROOT[c]) + 12
                th = 3 if c in MINOR else 4
                steps = [0, 7, 12, 12 + th, 19, 12 + th, 12, 7]
                p.arp(r0, CH_HRP, [base + st for st in steps], HRP, 28, step=2,
                      pans=(0x60, 0x90), accent=38)
            if bar in drums:
                for r, v in ((0, 30), (6, 16), (8, 24), (12, 16)):
                    p.put(r0 + r, CH_FRM, 60, FRM, v)
            if bells:
                tones = [midi(n) + 12 for n in VOICING[c]]
                p.put(r0 + 6, CH_BEL, tones[2], BEL, 20, 0xB0)
                p.put(r0 + 12, CH_BEL, tones[1 + bar % 2], BEL, 14, 0xC0)
        # on relâche toutes les voix mélodiques (et l'écho) à chaque motif : sinon la
        # dernière note d'une phrase tient jusqu'à la suivante (les lignes écrites
        # ensuite remplacent ces OFF)
        for ch in (CH_FLU, CH_FLU_E, CH_HRN, CH_HRN2, CH_STR):
            p.put(0, ch, OFF)
        if flute:
            p.line(CH_FLU, FLUTE[flute], FLU, 42, pan=0x70, echo=[(CH_FLU_E, 3, 13, 0xC0)])
        if hrn == 'solo':
            p.line(CH_HRN, HORN, HRN, 40, pan=0x88)
            p.line(CH_STR, COUNTER, STR, 26, pan=0x50)
        elif hrn == 'harm':
            p.line(CH_HRN2, HORN2, HRN, 26, pan=0x98)
    s.write(path, 'The long way home', 'make_homecoming.py')


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'long_way_home.xm')
