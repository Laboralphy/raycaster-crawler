#!/usr/bin/env python3
"""
Musique du menu principal (XM, OpenMPT) : thème lourd de fantasy médiévale
sombre, pendant que l'écran montre un bout du labyrinthe.

Ré mineur, 66 bpm, 8 motifs : 1 min 56 s, en boucle.
Tambours de guerre, ostinato de cordes en croches, cor (puis deux cors en
tierces), grand chœur, chant de moines, cloche, cymbale.

Usage : python3 make_menu.py [fichier.xm]   (défaut : main_menu.xm)
"""
import sys

from xm_kit import (ENV_PAD, ENV_STAC, OFF, Song, big_bell, choir, drum, horn, strings,
                    transpose)


def build(path):
    s = Song(18, 6, 66)
    CHO = s.ins('Choir', choir('ah', distant=False), env=[(0, 0), (0.8, 64), (2.5, 54)],
                sustain=2, fade=2.5, vib=(0, 60, 4, 5))
    MCH = s.ins('Monks', choir('oh', octave=1, distant=False), env=[(0, 0), (0.25, 64), (1.5, 56)],
                sustain=2, fade=1.0, vib=(0, 40, 3, 5))
    STR = s.ins('Low strings', strings(), env=ENV_PAD, sustain=2, fade=2.0)
    STA = s.ins('Staccato strings', strings(), env=ENV_STAC)
    HRN = s.ins('Horn', horn(), env=[(0, 0), (0.12, 64), (1.0, 54)], sustain=2, fade=0.8,
                vib=(0, 50, 3, 5))
    WAR = s.ins('War drum', drum('war'))
    FRM = s.ins('Frame drum', drum('frame'))
    BEL = s.ins('Bell', big_bell())
    CRS = s.ins('Cymbal', drum('crash'))

    CHO_B = ((0, 1, 2), (3, 4, 5))
    BAS_B = ((8,), (9,))
    CH_STA, CH_HRN, CH_HRN2, CH_WAR, CH_FRM, CH_BEL, CH_CRS, CH_MCH, CH_MCH2 = (
        (6, 7), 10, 11, 12, 13, 14, 15, 16, 17)

    VOICING = {'Dm': ['D4', 'F4', 'A4'], 'Bb': ['D4', 'F4', 'Bb4'], 'C': ['E4', 'G4', 'C5'],
               'Gm': ['D4', 'G4', 'Bb4'], 'A': ['C#4', 'E4', 'A4'], 'F': ['C4', 'F4', 'A4']}
    ROOT = {'Dm': 50, 'Bb': 46, 'C': 48, 'Gm': 43, 'A': 45, 'F': 41}
    THIRD = {'Dm': 3, 'Gm': 3}
    HORN = {
        'A': 'D4:8 F4:4 A4:4 | Bb4:8 A4:4 F4:4 | G4:6 A4:2 Bb4:4 D5:4 | C#5:12 -:4',
        'B': 'D5:8 C5:4 Bb4:4 | A4:8 F4:4 A4:4 | G4:4 A4:4 C5:4 E5:4 | D5:12 -:4',
        'C': 'G5:8 F5:4 D5:4 | F5:8 E5:4 D5:4 | D5:6 C5:2 Bb4:4 F4:4 | E4:8 A4:8',
    }
    HORN2 = 'A3:8 D4:4 F4:4 | F4:8 F4:4 D4:4 | D4:6 F4:2 G4:4 Bb4:4 | A4:12 -:4'
    CHANT = 'D3:8 D3:4 F3:4 | A3:8 G3:4 F3:4 | F3:8 D3:4 F3:4 | E3:16'
    SONG = [
        # accords                    ostinato, cor, 2e cor, chœur, moines, tambours, cloche, cymbale
        (['Dm', 'Dm', 'Bb', 'A'],    False, None, False, True,  False, 'intro', True,  False),
        (['Dm', 'Bb', 'C', 'Dm'],    True,  None, False, True,  False, 'full',  False, False),
        (['Dm', 'Bb', 'Gm', 'A'],    True,  'A',  False, False, False, 'full',  False, False),
        (['Bb', 'F', 'C', 'Dm'],     True,  'B',  False, True,  False, 'full',  False, False),
        (['Dm', 'Dm', 'Bb', 'A'],    True,  None, False, False, True,  'heavy', True,  False),
        (['Dm', 'Bb', 'Gm', 'A'],    True,  'A',  True,  True,  False, 'full',  False, True),
        (['Gm', 'Dm', 'Bb', 'A'],    True,  'C',  False, True,  False, 'full',  False, True),
        (['Dm', 'Bb', 'A', 'Dm'],    False, None, False, True,  False, 'intro', True,  False),
    ]
    for i_pat, (chords, ost, mel, mel2, cho, monks, drums, bell, crash) in enumerate(SONG):
        p = s.new()
        for bar, c in enumerate(chords):
            r0 = bar * 16
            if cho:
                s.pad(p, r0, VOICING[c], CHO, 24, CHO_B)
            s.pad(p, r0, [ROOT[c] - 12], STR, 34, BAS_B, pans=(0x80,))
            if ost:
                th = THIRD.get(c, 4)
                steps = [0, 0, 12, 0, th, 0, 7, 12]
                p.arp(r0, CH_STA, [ROOT[c] + st for st in steps], STA, 26, step=2,
                      pans=(0x60, 0xA0), accent=34)
            if drums == 'intro':
                p.put(r0, CH_WAR, 60, WAR, 48)
            else:
                heavy = drums == 'heavy'
                for r, v in ((0, 56), (6, 34), (8, 48), (14, 30)):
                    p.put(r0 + r, CH_WAR, 60, WAR, v + (6 if heavy else 0))
                for r, v in ((4, 26), (12, 34)):
                    p.put(r0 + r, CH_FRM, 60, FRM, v)
                if heavy:
                    p.put(r0 + 10, CH_FRM, 62, FRM, 20)
                    p.put(r0 + 11, CH_FRM, 62, FRM, 24)
        if not cho:
            for ch in CHO_B[0] + CHO_B[1]:
                p.put(0, ch, OFF)
        # on relâche les cors à chaque motif (la mélodie écrite ensuite remplace ce OFF)
        for ch in CH_HRN, CH_HRN2:
            p.put(0, ch, OFF)
        if mel:
            echo = [] if mel2 else [(CH_HRN2, 3, 12, 0xC0)]
            p.line(CH_HRN, HORN[mel], HRN, 42, pan=0x68, echo=echo)
            if mel2:
                p.line(CH_HRN2, HORN2, HRN, 30, pan=0x98)
        if monks:
            p.line(CH_MCH, CHANT, MCH, 46, pan=0x70)
            p.line(CH_MCH2, transpose(CHANT, -7), MCH, 30, pan=0x90)
        else:
            p.put(0, CH_MCH, OFF)
            p.put(0, CH_MCH2, OFF)
        if bell:
            p.put(0, CH_BEL, 'D2', BEL, 34, 0x80)
        if crash:
            p.put(0, CH_CRS, 60, CRS, 26, 0xA0)
    s.write(path, 'Throne of ashes', 'make_menu.py')


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'main_menu.xm')
