#!/usr/bin/env python3
"""
Niveau secret (XM, OpenMPT) : on marche dans une géode d'améthyste géante.
Mystérieux, scintillant, cristallin.

La lydien (ré dièse : la quarte augmentée qui « flotte »), 60 bpm, 7 motifs :
1 min 52 s, en boucle. Harmonica de verre (doublé, désaccordé), arpèges de
célesta, lames de cristal en écho, étincelles aiguës, chœur céleste lointain,
gouttes d'eau claire.

Usage : python3 make_secret.py [fichier.xm]   (défaut : secret_geode.xm)
"""
import sys

import numpy as np

from make_forest import midi
from xm_kit import OFF, Song, celesta, choir, crystal, drip, glass, sparkle


def build(path):
    s = Song(18, 6, 60)
    GLS = s.ins('Glass harmonica', glass(), env=[(0, 0), (1.5, 64), (3, 56)], sustain=2, fade=3.0)
    GL2 = s.ins('Glass (detuned)', glass(), env=[(0, 0), (2.0, 64)], sustain=1, fade=3.0,
                finetune=10)
    SUB = s.ins('Deep glass', glass(), env=[(0, 0), (2.5, 64)], sustain=1, fade=4.0)
    CEL = s.ins('Celesta', celesta())
    CRY = s.ins('Crystal', crystal())
    SPK = s.ins('Sparkle', sparkle())
    CHO = s.ins('Celestial choir', choir('ah'), env=[(0, 0), (1.0, 64), (3, 50)], sustain=2,
                fade=3.0, vib=(0, 60, 4, 5))
    DRP = s.ins('Clear drip', drip())

    GLS_B = ((0, 1, 2), (3, 4, 5))
    GL2_B = ((6,), (17,))
    SUB_B = ((7,), (16,))
    CH_CEL, CH_DRP, CH_MEL, CH_MEL_E, CH_SPK, CH_CHO, CH_CHO_E = (8, 9), 10, 11, 12, 13, 14, 15

    VOICING = {'Amaj7': ['E4', 'G#4', 'C#5'], 'B/A': ['D#4', 'F#4', 'B4'],
               'F#m7': ['E4', 'A4', 'C#5'], 'Emaj7': ['D#4', 'G#4', 'B4'],
               'C#m': ['E4', 'G#4', 'C#5'], 'D#m7b5': ['C#4', 'F#4', 'A4']}
    ROOT = {'Amaj7': 'A2', 'B/A': 'A2', 'F#m7': 'F#2', 'Emaj7': 'E2', 'C#m': 'C#3',
            'D#m7b5': 'D#2'}
    MELODY = {
        'crystal': 'C#6:6 A5:2 E6:8 | F#6:6 D#6:2 A5:8 | G#5:6 B5:2 D#6:8 | F#6:16',
        'celesta': 'E6:4 D#6:4 C#6:4 B5:4 | D#6:8 F#6:4 D#6:4 | C#6:4 A5:4 E5:4 C#6:4 | B5:12 -:4',
        'end': 'E6:8 C#6:8 | D#6:8 B5:8 | C#6:8 G#5:8 | A5:16',
    }
    CHOIR = 'E5:16 | D#5:16 | C#5:8 E5:8 | D#5:16'
    LYDIAN_HIGH = ['A6', 'B6', 'C#7', 'D#7', 'E7', 'F#7', 'G#7']
    SONG = [
        # accords                                 arpèges, mélodie,   chœur, étincelles
        (['Amaj7', 'B/A', 'Amaj7', 'B/A'],        None,    None,      False, 4),
        (['Amaj7', 'B/A', 'F#m7', 'Emaj7'],       2,       None,      False, 3),
        (['Amaj7', 'B/A', 'C#m', 'Emaj7'],        2,       None,      True,  2),
        (['F#m7', 'D#m7b5', 'Emaj7', 'B/A'],      4,       'crystal', False, 3),
        (['Amaj7', 'B/A', 'F#m7', 'Emaj7'],       2,       'celesta', False, 2),
        (['D#m7b5', 'B/A', 'D#m7b5', 'B/A'],      None,    None,      False, 6),
        (['Amaj7', 'B/A', 'Amaj7', 'B/A'],        4,       'end',     False, 4),
    ]
    rng = np.random.default_rng(909)
    for i_pat, (chords, arp, mel, cho, sparks) in enumerate(SONG):
        p = s.new()
        for bar, c in enumerate(chords):
            r0 = bar * 16
            v = VOICING[c]
            s.pad(p, r0, v, GLS, 22, GLS_B)
            s.pad(p, r0, [v[2]], GL2, 12, GL2_B, pans=(0xC8,))
            if bar == 0 or ROOT[c] != ROOT[chords[bar - 1]]:
                s.pad(p, r0, [ROOT[c]], SUB, 18, SUB_B, pans=(0x80,))
            if arp:
                tones = [midi(n) + 12 for n in v]
                order = [0, 1, 2, 1, 0, 1, 2, 1][::arp // 2]
                p.arp(r0, CH_CEL, [tones[k] for k in order], CEL, 16, step=arp,
                      pans=(0x48, 0xB8), accent=22)
        if mel:
            p.line(CH_MEL, MELODY[mel], CRY if mel != 'celesta' else CEL, 30, pan=0x70,
                   echo=[(CH_MEL_E, 3, 12, 0xB0)])
        if cho:
            p.line(CH_CHO, CHOIR, CHO, 22, pan=0x90, echo=[(CH_CHO_E, 4, 8, 0x50)])
        else:
            p.put(0, CH_CHO, OFF)
            p.put(0, CH_CHO_E, OFF)
        for _ in range(sparks):
            p.put(int(rng.integers(0, 64)), CH_SPK, str(rng.choice(LYDIAN_HIGH)), SPK,
                  int(rng.integers(8, 16)), int(rng.choice([0x20, 0x50, 0xB0, 0xE0])))
        if i_pat == 5:
            for _ in range(3):
                p.put(int(rng.integers(0, 64)), CH_DRP, int(rng.choice([67, 69, 72])), DRP,
                      int(rng.integers(10, 18)), int(rng.choice([0x40, 0xC0])))
    s.write(path, 'Amethyst geode', 'make_secret.py')


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'secret_geode.xm')
