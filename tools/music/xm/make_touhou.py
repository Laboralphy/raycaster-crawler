#!/usr/bin/env python3
"""
« Danmaku sous la lune des cerisiers » : morceau original à la manière des
musiques des jeux Touhou Project (pas pour le jeu, pour le plaisir).

Ce qu'on reprend du style : tempo rapide (160 bpm), trompette solo très
brillante pleine de traits en doubles-croches, arpèges de piano qui
cascadent, basse qui saute d'octave en octave, batterie pop, l'enchaînement
« royal road » (IV-V-iii-vi) cher à la pop japonaise, et le refrain qui
monte d'un ton (la mineur -> si mineur) pour le grand moment.

La mineur, 160 bpm (une ligne = une double-croche), 16 motifs : 1 min 36 s ;
la boucle reprend au motif 1, l'introduction n'est jouée qu'une fois.

Usage : python3 make_touhou.py [fichier.xm]   (défaut : touhou_cherry_moon.xm)
"""
import sys

from xm_kit import (ENV_PAD, OFF, Song, celesta, drum, fm_bass, fm_trumpet, piano, strings,
                    transpose)

# accord -> (fondamentale MIDI pour le piano, tierce)
CHORDS = {'Am': (57, 3), 'F': (53, 4), 'G': (55, 4), 'E': (52, 4), 'Em': (52, 3), 'Dm': (50, 3),
          'Bm': (59, 3), 'F#m': (54, 3), 'A': (57, 4), 'D': (50, 4)}

MEL = {
    'A':  'A5:2 E5:2 A5:2 B5:2 C6:4 B5:2 A5:2 | B5:2 G5:2 D5:2 G5:2 B5:4 A5:2 G5:2 | '
          'A5:2 F5:2 C5:2 F5:2 A5:3 G5:1 F5:2 E5:2 | G#5:6 E5:2 B5:8',
    'A2': 'A5:2 E5:2 A5:2 B5:2 C6:4 D6:2 E6:2 | D6:2 B5:2 G5:2 B5:2 D6:4 C6:2 B5:2 | '
          'C6:2 A5:2 F5:2 A5:2 C6:2 B5:2 A5:2 G5:2 | '
          'G#5:1 A5:1 B5:1 C6:1 D6:1 E6:1 F6:1 G#6:1 A6:8',
    'B':  'A5:4 C6:4 F6:6 E6:2 | D6:4 B5:4 G5:6 D6:2 | E6:4 B5:4 G5:4 E5:4 | A5:6 B5:2 C6:8',
    'B2': 'F6:4 E6:4 C6:4 A5:4 | D6:4 C6:4 B5:4 G5:4 | G#5:4 B5:4 E6:4 G#6:4 | '
          'B6:2 A6:2 G#6:2 F#6:2 E6:2 D6:2 C6:2 B5:2',
    # refrain, un ton plus haut (si mineur)
    'C':  'B5:6 A5:2 B5:4 D6:4 | C#6:6 B5:2 A5:4 E6:4 | F#6:4 E6:4 C#6:4 A5:4 | B5:6 C#6:2 D6:8',
    'C2': 'G6:4 F#6:4 D6:4 B5:4 | A5:4 C#6:4 E6:4 A6:4 | F#6:6 E6:2 C#6:4 A5:4 | '
          'G#5:2 B5:2 E6:2 G#6:2 B6:8',
}

SONG = [
    ('intro',  ['Am', 'F', 'G', 'E'],    None),
    ('intro2', ['Am', 'F', 'G', 'E'],    None),      # <- reprise de la boucle
    ('verse',  ['Am', 'G', 'F', 'E'],    'A'),
    ('verse',  ['Am', 'G', 'F', 'E'],    'A2'),
    ('pre',    ['F', 'G', 'Em', 'Am'],   'B'),
    ('pre',    ['F', 'G', 'E', 'E'],     'B2'),
    ('chorus', ['G', 'A', 'F#m', 'Bm'],  'C'),
    ('chorus', ['G', 'A', 'F#m', 'E'],   'C2'),
    ('inter',  ['Am', 'F', 'G', 'E'],    None),
    ('verse',  ['Am', 'G', 'F', 'E'],    'A'),
    ('verse',  ['Am', 'G', 'F', 'E'],    'A2'),
    ('pre',    ['F', 'G', 'Em', 'Am'],   'B'),
    ('pre',    ['F', 'G', 'E', 'E'],     'B2'),
    ('chorus', ['G', 'A', 'F#m', 'Bm'],  'C'),
    ('chorus', ['G', 'A', 'F#m', 'E'],   'C2'),
    ('outro',  ['Am', 'F', 'G', 'E'],    None),
]


def build(path):
    s = Song(20, 6, 160)
    KCK = s.ins('Kick', drum('kick'))
    SNR = s.ins('Snare', drum('snare'))
    HAT = s.ins('Hi-hat', drum('hat'))
    CRS = s.ins('Crash', drum('crash'))
    TOM = s.ins('Tom', drum('tom'))
    BAS = s.ins('Bass', fm_bass())
    PNO = s.ins('Piano', piano())
    TRP = s.ins('Trumpet', fm_trumpet(), env=[(0, 0), (0.02, 64), (0.5, 54)], sustain=2,
                fade=0.25, vib=(0, 90, 4, 7))
    CEL = s.ins('Celesta', celesta())
    STR = s.ins('Strings', strings(), env=ENV_PAD, sustain=2, fade=1.5)

    CH_KCK, CH_SNR, CH_HAT, CH_CRS, CH_TOM, CH_BAS = range(6)
    CH_ARP = (6, 7)
    CH_STAB = (8, 9, 10)
    CH_TRP, CH_TRP2, CH_CEL = 11, 12, 13
    STR_B = ((14, 15, 16), (17, 18, 19))

    prev = None
    for i_pat, (sec, chords, mel) in enumerate(SONG):
        p = s.new()
        for ch in (CH_TRP, CH_TRP2):
            p.put(0, ch, OFF)
        drums = sec in ('intro2', 'verse', 'pre', 'chorus', 'inter')
        for bar, c in enumerate(chords):
            r0 = bar * 16
            root, th = CHORDS[c]
            triad = [root + 12, root + 12 + th, root + 19]
            # piano : arpèges qui cascadent (intro, refrain, interlude, fin) ;
            # accords syncopés sur les couplets
            tones = [root, root + 7, root + 12, root + 12 + th, root + 19]
            if sec in ('intro', 'chorus', 'inter', 'outro', 'pre'):
                order = [0, 1, 2, 3, 4, 3, 2, 1] * 2
                p.arp(r0, CH_ARP, [tones[o] for o in order], PNO,
                      26 if sec in ('intro', 'inter', 'outro') else 18, step=1,
                      pans=(0x58, 0xA8), accent=32)
            if sec in ('verse', 'intro2'):
                for r, v in ((0, 26), (3, 20), (6, 22), (10, 20), (12, 24)):
                    for ch, n in zip(CH_STAB, triad):
                        p.put(r0 + r, ch, n, PNO, v, (0x60, 0x80, 0xA0)[CH_STAB.index(ch)])
            # nappes de cordes
            if sec in ('intro', 'pre', 'chorus', 'inter', 'outro'):
                s.pad(p, r0, triad, STR, 16 if sec == 'pre' else 22, STR_B)
            # basse en octaves
            if sec != 'intro':
                for r in range(0, 16, 2):
                    p.put(r0 + r, CH_BAS, root - 24 + (12 if (r // 2) % 2 else 0), BAS,
                          46 if r % 8 == 0 else 36)
            # batterie
            if drums:
                beat = 'X...x...X...x...' if sec != 'chorus' else 'X..xX...X..xX...'
                for r, ch_ in enumerate(beat):
                    if ch_ in 'Xx':
                        p.put(r0 + r, CH_KCK, 60, KCK, 54 if ch_ == 'X' else 46)
                fill = bar == 3 and sec in ('pre', 'verse', 'intro2', 'inter')
                for r in (4, 12):
                    if not (fill and r == 12):
                        p.put(r0 + r, CH_SNR, 60, SNR, 44)
                if fill:
                    for r, n in ((12, 'D4'), (13, 'C4'), (14, 'A3'), (15, 'G3')):
                        p.put(r0 + r, CH_TOM, n, TOM, 40)
                step = 1 if sec == 'chorus' else 2
                for r in range(0, 16, step):
                    p.put(r0 + r, CH_HAT, 60, HAT, 18 if r % 4 == 2 else 11)
            elif sec == 'outro':
                p.put(r0, CH_KCK, 60, KCK, 46)
        if sec not in ('intro', 'pre', 'chorus', 'inter', 'outro'):
            for ch in STR_B[0] + STR_B[1]:
                p.put(0, ch, OFF)
        if mel:
            if sec == 'chorus':
                # refrain : trompette doublée à l'octave grave, célesta à l'octave aiguë
                p.line(CH_TRP, MEL[mel], TRP, 44, pan=0x70)
                p.line(CH_TRP2, transpose(MEL[mel], -12), TRP, 26, pan=0x90)
                p.line(CH_CEL, transpose(MEL[mel], 12), CEL, 14, pan=0xB0)
            else:
                p.line(CH_TRP, MEL[mel], TRP, 42, pan=0x78, echo=[(CH_TRP2, 3, 12, 0xC0)])
        if sec != prev and sec in ('intro2', 'verse', 'chorus', 'inter'):
            p.put(0, CH_CRS, 60, CRS, 32, 0xA0)
        prev = sec
    s.write(path, 'Cherry moon danmaku', 'make_touhou.py', restart=1)


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'touhou_cherry_moon.xm')
