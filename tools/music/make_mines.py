#!/usr/bin/env python3
"""
Deux ambiances des mines (XM, OpenMPT).

1. mines_deep.xm  Les galeries profondes — mi mineur, 66 bpm. Des mineurs
                  invisibles piochent au loin (coups réguliers, chacun à sa
                  place dans l'espace, avec l'écho de la galerie), grondement
                  de la roche, gouttes, motif de lithophone, chœur lointain.
2. mines_nest.xm  Le nid d'araignées — si mineur (do bécarre : phrygien),
                  84 bpm. Basse syncopée (3-3-2), cordes en trémolo, pattes
                  qui grattent, ricanements de diablotins, pioche lointaine.

Usage : python3 make_mines.py [1 2]   (défaut : les deux)
"""
import sys

import numpy as np

from make_forest_night import make_dark_pad, make_drone
from xm_kit import (ENV_PAD, ENV_VOICE, OFF, Song, choir, drip, drum, fm_bass, imp, pickaxe,
                    pluck, rumble, skitter, strings, wrap)


class Miners:
    """Coups de pioche réguliers qui continuent d'un motif à l'autre :
    (période en lignes, décalage, note, pan, volume)."""
    def __init__(self, crew, seed):
        self.crew = crew
        self.rng = np.random.default_rng(seed)

    def strike(self, pat, i_pat, chans, ins, level=1.0):
        for (period, offset, note, pan, vol), ch in zip(self.crew, chans):
            r0 = i_pat * pat.rows
            for r in range(pat.rows):
                if (r0 + r - offset) % period == 0:
                    jitter = int(self.rng.integers(-1, 2))
                    if self.rng.random() < 0.85:        # le mineur reprend son souffle
                        pat.put(r + jitter if 0 <= r + jitter < pat.rows else r, ch,
                                note + int(self.rng.integers(-1, 2)), ins, vol * level, pan)


def scatter(pat, ch, ins, rng, n, notes, vols, pans):
    for _ in range(n):
        pat.put(int(rng.integers(0, pat.rows)), ch, int(rng.choice(notes)), ins,
                int(rng.integers(*vols)), int(rng.choice(pans)))


# ---------------------------------------------------------------- 1. les galeries

def deep(path):
    s = Song(18, 6, 66)
    PAD = s.ins('Cave pad', wrap(make_dark_pad()), env=[(0, 0), (1.5, 64), (3, 54)], sustain=2,
                fade=4.0)
    DRN = s.ins('Drone', wrap(make_drone()), env=[(0, 0), (1.0, 64)], sustain=1, fade=4.0)
    RUM = s.ins('Rock rumble', rumble())
    MAL = s.ins('Lithophone', pluck('mallet'))
    CHO = s.ins('Distant choir', choir('oo'), env=ENV_VOICE, sustain=2, fade=3.0, vib=(0, 60, 4, 5))
    PIC = s.ins('Pickaxe', pickaxe())
    DRP = s.ins('Drip', drip())
    BAS = s.ins('Low strings', strings(), env=ENV_PAD, sustain=2, fade=3.0)

    PAD_B = ((0, 1, 2), (3, 4, 5))
    BAS_B = ((16,), (17,))
    CH_DRN, CH_RUM, CH_MAL, CH_MAL_E, CH_CHO, CH_CHO_E, CH_DRP = 6, 7, 8, 9, 10, 11, 15
    CH_PIC = (12, 13, 14)

    VOICING = {'Em': ['E3', 'B3', 'G4'], 'C': ['E3', 'C4', 'G4'], 'D': ['F#3', 'D4', 'A4'],
               'Bm': ['F#3', 'D4', 'B4'], 'Am': ['E3', 'C4', 'A4'], 'B': ['F#3', 'D#4', 'B4']}
    ROOT = {'Em': 'E2', 'C': 'C2', 'D': 'D2', 'Bm': 'B1', 'Am': 'A1', 'B': 'B1'}
    MOTIF = {
        1: 'E5:4 B4:4 _:4 G4:4 | A4:4 B4:8 _:4 | E5:4 D5:4 B4:4 A4:4 | B4:16',
        2: 'G5:4 F#5:4 E5:4 B4:4 | C5:8 B4:4 G4:4 | A4:4 B4:4 D5:4 F#5:4 | F#5:8 D5:4 B4:4',
        3: 'C5:4 B4:4 A4:4 E4:4 | E5:8 D5:4 C5:4 | B4:4 D#5:4 F#5:4 B4:4 | E4:16',
    }
    CHOIR = {'A': 'A4:16 | G4:16 | G4:8 E4:8 | F#4:16', 'B': 'B4:16 | C5:16 | A4:16 | B4:16'}
    SONG = [
        # accords (None : on garde),   motif, chœur, basse, pioches
        (['Em', None, 'C', None],      None,  None,  False, 1.0),
        (['Em', 'C', 'Am', 'Em'],      1,     None,  False, 0.8),
        (['Em', 'C', 'D', 'Bm'],       2,     None,  True,  0.8),
        (['Am', 'Em', 'C', 'B'],       None,  'A',   True,  0.7),
        (['Em', None, None, None],     1,     None,  False, 1.4),
        (['Em', 'C', 'D', 'Bm'],       2,     'B',   True,  0.8),
        (['Am', 'C', 'B', 'Em'],       3,     None,  True,  0.9),
    ]
    miners = Miners([(10, 0, 60, 0x28, 18), (14, 5, 56, 0xD8, 15), (22, 9, 64, 0x98, 11)], 505)
    rng = np.random.default_rng(506)
    for i_pat, (chords, motif, cho, bass, picks) in enumerate(SONG):
        p = s.new()
        for bar, c in enumerate(chords):
            if c is None:
                continue
            s.pad(p, bar * 16, VOICING[c], PAD, 22, PAD_B)
            if bass:
                s.pad(p, bar * 16, [ROOT[c]], BAS, 26, BAS_B, pans=(0x80,))
        if not bass:
            for ch in BAS_B[0] + BAS_B[1]:
                p.put(0, ch, OFF)
        if motif:
            p.line(CH_MAL, MOTIF[motif], MAL, 34, pan=0x60, echo=[(CH_MAL_E, 3, 12, 0xB0)])
        if cho:
            p.line(CH_CHO, CHOIR[cho], CHO, 28, pan=0x90, echo=[(CH_CHO_E, 4, 10, 0x40)])
        else:
            p.put(0, CH_CHO, OFF)
            p.put(0, CH_CHO_E, OFF)
        if i_pat == 0:
            p.put(0, CH_DRN, 'E2', DRN, 26)
            p.put(0, CH_RUM, 60, RUM, 30)
        miners.strike(p, i_pat, CH_PIC, PIC, picks)
        scatter(p, CH_DRP, DRP, rng, int(rng.integers(1, 4)), [55, 58, 60, 63, 65], (12, 24),
                [0x30, 0x50, 0xB0, 0xD0])
    s.write(path, 'The deep mines', 'make_mines.py')


# ---------------------------------------------------------------- 2. le nid

def nest(path):
    s = Song(18, 6, 84)
    PAD = s.ins('Strings', strings(), env=ENV_PAD, sustain=2, fade=2.5)
    TRM = s.ins('Tremolo strings', strings(tremolo=True), env=[(0, 0), (2.0, 64)], sustain=1,
                fade=2.0)
    BAS = s.ins('Pulse bass', fm_bass())
    TOM = s.ins('Tom', drum('tom'))
    MAL = s.ins('Lithophone', pluck('mallet'))
    SKT = s.ins('Spider legs', skitter())
    IMP = s.ins('Imp', imp())
    PIC = s.ins('Pickaxe', pickaxe())
    DRP = s.ins('Drip', drip())
    RUM = s.ins('Rock rumble', rumble())

    PAD_B = ((0, 1, 2), (3, 4, 5))
    CH_TRM, CH_BAS, CH_TOM, CH_MAL, CH_MAL_E, CH_SKT, CH_IMP, CH_PIC, CH_DRP, CH_RUM = (
        (6, 7), 8, 9, 10, 11, (12, 13), 14, 15, 16, 17)

    VOICING = {'Bm': ['B3', 'D4', 'F#4'], 'C': ['C4', 'E4', 'G4'], 'G': ['B3', 'D4', 'G4'],
               'F#': ['A#3', 'C#4', 'F#4'], 'Em': ['B3', 'E4', 'G4']}
    ROOT = {'Bm': 'B1', 'C': 'C2', 'G': 'G1', 'F#': 'F#1', 'Em': 'E2'}
    MOTIF = {
        1: 'B4:2 C5:2 _:4 F#4:4 _:4 | C5:2 B4:2 _:4 G4:4 _:4 | B4:2 D5:2 F5:4 E5:4 D5:4 | C#5:8 F#4:8',
        2: 'D5:4 C#5:2 B4:2 F#4:8 | E5:4 D5:2 C5:2 G4:8 | D5:4 B4:4 G4:4 B4:4 | A#4:8 C#5:4 F#5:4',
    }
    TREM = {'low': [('B3', 'C4')] * 4,
            'rise': [('B3', 'C4'), ('C4', 'D4'), ('D4', 'Eb4'), ('E4', 'F4')]}
    SONG = [
        # accords                    tapis, basse (mesures), motif, trémolo, diablotins, pattes
        (['Bm', 'Bm', 'C', 'Bm'],    False, [],           None,  'low',  0, 2),
        (['Bm', 'Bm', 'C', 'Bm'],    False, [0, 1, 2, 3], None,  'low',  0, 2),
        (['Bm', 'C', 'G', 'F#'],     True,  [0, 1, 2, 3], 1,     None,   0, 2),
        (['Em', 'C', 'F#', 'Bm'],    True,  [0, 1, 2, 3], None,  None,   3, 3),
        (['Bm', 'Bm', 'Bm', 'Bm'],   False, [],           None,  'rise', 1, 6),
        (['Bm', 'C', 'G', 'F#'],     True,  [0, 1, 2, 3], 2,     None,   0, 2),
        (['Em', 'G', 'C', 'F#'],     True,  [0, 1, 2, 3], 1,     None,   1, 2),
        (['Bm', 'C', 'Bm', 'C'],     True,  [0, 1, 2, 3], None,  None,   3, 3),
        (['Bm', 'Bm', 'C', 'Bm'],    False, [0, 1],       None,  'low',  1, 3),
    ]
    rng = np.random.default_rng(607)
    miners = Miners([(18, 3, 58, 0xE0, 10)], 608)
    for i_pat, (chords, pad, bass_bars, motif, trem, imps, legs) in enumerate(SONG):
        p = s.new()
        for bar, c in enumerate(chords):
            r0 = bar * 16
            if pad:
                s.pad(p, r0, VOICING[c], PAD, 18, PAD_B)
            if bar in bass_bars:
                for k, r in enumerate((0, 3, 6, 8, 11, 14)):
                    p.put(r0 + r, CH_BAS, ROOT[c], BAS, 48 if k in (0, 3) else 34)
                p.put(r0, CH_TOM, 'C4', TOM, 34)
                p.put(r0 + 8, CH_TOM, 'A3', TOM, 24)
                if bar == 3:
                    p.put(r0 + 12, CH_TOM, 'D4', TOM, 22)
                    p.put(r0 + 14, CH_TOM, 'C4', TOM, 28)
            if trem:
                lo, hi = TREM[trem][bar]
                p.put(r0, CH_TRM[0], lo, TRM, 18, 0x50)
                p.put(r0, CH_TRM[1], hi, TRM, 16, 0xB0)
        if not pad:
            for ch in PAD_B[0] + PAD_B[1]:
                p.put(0, ch, OFF)
        if not bass_bars:
            p.put(0, CH_BAS, OFF)
        if not trem:
            for ch in CH_TRM:
                p.put(0, ch, OFF)
        if motif:
            p.line(CH_MAL, MOTIF[motif], MAL, 32, pan=0x50, echo=[(CH_MAL_E, 3, 12, 0xB0)])
        if i_pat == 0:
            p.put(0, CH_RUM, 60, RUM, 26)
        for k in range(legs):
            p.put(int(rng.integers(0, 64)), CH_SKT[k % 2], int(rng.integers(56, 66)), SKT,
                  int(rng.integers(14, 26 if legs < 5 else 34)), int(rng.choice([0x20, 0x40, 0xC0, 0xE0])))
        scatter(p, CH_IMP, IMP, rng, imps, [57, 60, 62, 64], (14, 24), [0x30, 0x60, 0xA0, 0xD0])
        miners.strike(p, i_pat, (CH_PIC,), PIC, 1.0)
        scatter(p, CH_DRP, DRP, rng, int(rng.integers(0, 3)), [55, 60, 63], (10, 20), [0x40, 0xC0])
    s.write(path, 'The spider nest', 'make_mines.py', gain=1.35)


TRACKS = {'1': (deep, 'mines_deep.xm'), '2': (nest, 'mines_nest.xm')}

if __name__ == '__main__':
    for key in sys.argv[1:] or sorted(TRACKS):
        fn, path = TRACKS[key]
        fn(path)
