#!/usr/bin/env python3
"""
Quatre musiques de donjon plus dynamiques, dans l'esprit des musiques de
Heretic (1994) : mineur harmonique (la sensible qui tire vers la tonique),
ostinatos de cordes et galops, batterie de marche, timbales, mélodies de
cuivres et d'anches FM qu'on retient, chœur dans les refrains. Les timbres FM
rappellent les cartes son de l'époque.

1. dungeon_siege.xm    Le siège du donjon de fer — mi mineur, 112 bpm. Marche :
                       galop de cordes, caisse claire, timbales, cuivres en tierces.
2. dungeon_torment.xm  Les salles du tourment — ré mineur (mi bémol phrygien),
                       96 bpm. Toms tribaux, riff de basse syncopé, clavecin,
                       anche, chant d'hommes en quintes.
3. dungeon_serpent.xm  Le rite du serpent — do mineur, 126 bpm. Batterie plus
                       rock, basse en doubles-croches, orgue, solo FM, cuivres
                       en accents syncopés, ré bémol napolitain au pont.
4. dungeon_cursed.xm   Les cryptes maudites — la mineur, en 12/8 (danse macabre),
                       100 bpm. Pizzicati, tambourin, timbales, anche puis
                       cuivres doublés à l'octave, chœur.

Chaque morceau boucle sur son motif 1 : l'introduction n'est jouée qu'une fois.

Usage : python3 make_dungeon2.py [1 2 3 4]   (défaut : les quatre)
"""
import sys

from make_forest import midi
from xm_kit import (ENV_PAD, ENV_STAB, ENV_STAC, OFF, Song, big_bell, choir, drum, fm_bass,
                    fm_brass, fm_lead, fm_reed, organ, pluck, strings, tambourine, timpani,
                    transpose)

ENV_CHOIR = [(0, 0), (0.5, 64), (2, 54)]
ENV_BRASS = [(0, 0), (0.03, 64), (0.6, 52)]
ENV_REED = [(0, 0), (0.02, 64), (0.5, 54)]


def beat(p, r0, ch, ins, pattern, vols=None, note=60, pan=None):
    """Rythme écrit en caractères : 'X' accent, 'x' normal, 'o' fantôme, '.' rien."""
    vols = vols or {'X': 48, 'x': 34, 'o': 18}
    for i, c in enumerate(pattern):
        if c in vols:
            p.put(r0 + i, ch, note, ins, vols[c], pan)


def riff(p, r0, ch, ins, root, steps):
    """steps = [(ligne, demi-tons au-dessus de root, volume)]."""
    for r, st, v in steps:
        p.put(r0 + r, ch, root + st, ins, v)


def roll(p, r0, ch, ins, rows, v0, v1, note=60):
    """Roulement : une frappe par ligne, du volume v0 à v1."""
    for k, r in enumerate(rows):
        p.put(r0 + r, ch, note, ins, v0 + (v1 - v0) * k / max(1, len(rows) - 1))


def release(p, *chans):
    """Relâche les voix mélodiques au début de chaque motif (la mélodie écrite
    ensuite remplace ce OFF) : sinon une note tient jusqu'à la phrase suivante."""
    for ch in chans:
        p.put(0, ch, OFF)


def third(chord):
    return 3 if chord.endswith('m') else 4


# ---------------------------------------------------------------- 1. le siège

def siege(path):
    s = Song(24, 6, 112)
    BD = s.ins('Bass drum', drum('war'))
    SNR = s.ins('Snare', drum('snare'))
    TIM = s.ins('Timpani', timpani())
    CRS = s.ins('Crash', drum('crash'))
    BAS = s.ins('FM bass', fm_bass())
    OST = s.ins('Staccato strings', strings(), env=ENV_STAC)
    CHO = s.ins('Choir', choir('ah', distant=False), env=ENV_CHOIR, sustain=2, fade=1.5,
                vib=(0, 50, 4, 5))
    ORG = s.ins('Organ', organ(), env=[(0, 0), (0.6, 64), (2, 56)], sustain=2, fade=1.5)
    PAD = s.ins('Strings', strings(), env=ENV_PAD, sustain=2, fade=2.0)
    BRS = s.ins('FM brass', fm_brass(), env=ENV_BRASS, sustain=2, fade=0.4, vib=(0, 40, 3, 5))

    CH_BD, CH_SNR, CH_TIM, CH_CRS, CH_BAS = range(5)
    CH_OST = (5, 6)
    CHO_B = ((7, 8, 9), (10, 11, 12))
    LOW_B = ((15, 16, 17), (18, 19, 20))        # orgue (intro, fin) ou cordes (pont)
    CH_BRS, CH_BR2, CH_BRS_E = 21, 22, 23

    VOICING = {'Em': ['E4', 'G4', 'B4'], 'C': ['E4', 'G4', 'C5'], 'D': ['D4', 'F#4', 'A4'],
               'B': ['D#4', 'F#4', 'B4'], 'Am': ['E4', 'A4', 'C5']}
    ROOT = {'Em': 'E2', 'C': 'C2', 'D': 'D2', 'B': 'B1', 'Am': 'A1'}
    OSTR = {'Em': 64, 'C': 60, 'D': 62, 'B': 59, 'Am': 57}
    GALLOP = [(0, 0), (2, 0), (3, 0), (4, 7), (6, 0), (7, 0), (8, 12), (10, 0), (11, 0), (12, 7),
              (14, 0), (15, 0)]
    MEL = {
        'M1': 'E4:6 F#4:2 G4:4 B4:4 | C5:6 B4:2 A4:4 G4:4 | A4:4 F#4:4 D4:4 F#4:4 | D#4:8 B3:8',
        'M2': 'A4:4 C5:4 E5:6 D5:2 | B4:4 G4:4 E4:8 | F#4:4 A4:4 B4:4 D#5:4 | E5:12 -:4',
        'M3': 'G5:8 E5:4 C5:4 | A5:8 F#5:4 D5:4 | B5:6 A5:2 G5:4 F#5:4 | E5:12 B4:4',
        'M4': 'E5:4 G5:4 C6:4 B5:4 | A5:4 F#5:4 D5:4 A5:4 | B5:8 F#5:8 | D#5:8 F#5:4 B5:4',
        'BR': 'E4:16 | G4:16 | C4:8 E4:8 | D#4:16',
    }
    HARM = {
        'M3': 'E5:8 C5:4 G4:4 | F#5:8 D5:4 A4:4 | G5:6 F#5:2 E5:4 D#5:4 | B4:12 G4:4',
        'M4': 'C5:4 E5:4 G5:4 G5:4 | F#5:4 D5:4 A4:4 F#5:4 | F#5:8 D#5:8 | B4:8 D#5:4 F#5:4',
    }
    SONG = [
        ('intro',  ['Em', 'Em', 'C', 'B'],  None),
        ('march',  ['Em', 'C', 'D', 'B'],   None),        # <- reprise de la boucle
        ('march',  ['Em', 'C', 'D', 'B'],   'M1'),
        ('verse',  ['Am', 'Em', 'B', 'Em'], 'M2'),
        ('chorus', ['C', 'D', 'Em', 'Em'],  'M3'),
        ('chorus', ['C', 'D', 'B', 'B'],    'M4'),
        ('bridge', ['Am', 'Em', 'C', 'B'],  'BR'),
        ('build',  ['Am', 'C', 'B', 'B'],   None),
        ('march',  ['Em', 'C', 'D', 'B'],   'M1'),
        ('verse',  ['Am', 'Em', 'B', 'Em'], 'M2'),
        ('chorus', ['C', 'D', 'Em', 'Em'],  'M3'),
        ('chorus', ['C', 'D', 'B', 'B'],    'M4'),
        ('outro',  ['Em', 'C', 'B', 'B'],   None),
    ]
    prev = None
    for i_pat, (sec, chords, mel) in enumerate(SONG):
        p = s.new()
        release(p, CH_BRS, CH_BR2, CH_BRS_E)
        band = sec in ('march', 'verse', 'chorus', 'build')
        for bar, c in enumerate(chords):
            r0 = bar * 16
            root = midi(ROOT[c])
            # nappes : orgue (intro, fin), cordes (pont), chœur (couplet, refrain)
            if sec in ('intro', 'outro'):
                s.pad(p, r0, [midi(n) - 12 for n in VOICING[c]], ORG, 26, LOW_B)
            elif sec == 'bridge':
                s.pad(p, r0, VOICING[c], PAD, 24, LOW_B)
            if sec in ('verse', 'chorus'):
                s.pad(p, r0, VOICING[c], CHO, 20 if sec == 'verse' else 28, CHO_B)
            # basse
            if band and sec != 'build':
                for r in range(0, 16, 2):
                    p.put(r0 + r, CH_BAS, root, BAS, 46 if r % 8 == 0 else 36)
            elif sec == 'build':
                for r in range(16):
                    p.put(r0 + r, CH_BAS, root, BAS, 40 if r % 4 == 0 else 30)
            elif sec in ('bridge', 'outro', 'intro') and bar % 2 == 0:
                p.put(r0, CH_BAS, root, BAS, 44)
            # galop des cordes
            if band:
                for r, st in GALLOP:
                    p.put(r0 + r, CH_OST[r % 2], OSTR[c] + st, OST, 30 if r % 4 == 0 else 22,
                          0x58 if r % 2 == 0 else 0xA8)
            # batterie de marche
            if band and sec != 'build':
                beat(p, r0, CH_BD, BD, 'X.......x.....x.' if sec == 'chorus' else 'X.......x.......')
                beat(p, r0, CH_SNR, SNR, '....X.......X.ox' if bar < 3 else '....X.......Xxxx')
            elif sec == 'build':
                beat(p, r0, CH_BD, BD, 'X...x...X...x...')
                step = (4, 2, 1, 1)[bar]
                roll(p, r0, CH_SNR, SNR, range(0, 16, step), 22 + 8 * bar, 30 + 10 * bar)
            elif sec == 'bridge':
                p.put(r0, CH_BD, 60, BD, 40)
            # timbales
            if sec in ('intro', 'outro'):
                p.put(r0, CH_TIM, root + 12, TIM, 44)
                if bar == 3:
                    roll(p, r0, CH_TIM, TIM, range(8, 16), 20, 48, root + 12)
            elif sec == 'chorus':
                p.put(r0, CH_TIM, root + 12, TIM, 40)
                p.put(r0 + 8, CH_TIM, root + 19, TIM, 32)
            elif bar % 2 == 0 and sec in ('march', 'verse', 'bridge'):
                p.put(r0, CH_TIM, root + 12, TIM, 34)
            elif sec == 'build' and bar == 3:
                roll(p, r0, CH_TIM, TIM, range(16), 24, 50, root + 12)
        if sec not in ('verse', 'chorus'):
            for ch in CHO_B[0] + CHO_B[1]:
                p.put(0, ch, OFF)
        if not band:
            release(p, *CH_OST)
        if sec not in ('intro', 'outro', 'bridge'):
            for ch in LOW_B[0] + LOW_B[1]:
                p.put(0, ch, OFF)
        if mel:
            if mel in HARM:
                p.line(CH_BRS, MEL[mel], BRS, 42, pan=0x68)
                p.line(CH_BR2, HARM[mel], BRS, 30, pan=0x98)
            else:
                p.line(CH_BRS, MEL[mel], BRS, 26 if mel == 'BR' else 42, pan=0x70,
                       echo=[(CH_BRS_E, 3, 12, 0xC0)])
        if sec != prev and sec in ('march', 'chorus') or (sec == 'march' and mel):
            p.put(0, CH_CRS, 60, CRS, 30, 0xA0)
        prev = sec
    s.write(path, 'Siege of the iron keep', 'make_dungeon2.py', restart=1)


# ---------------------------------------------------------------- 2. le tourment

def torment(path):
    s = Song(22, 6, 96)
    BD = s.ins('Bass drum', drum('war'))
    TOM = s.ins('Tom', drum('tom'))
    FRM = s.ins('Frame drum', drum('frame'))
    TMB = s.ins('Tambourine', tambourine())
    BAS = s.ins('FM bass', fm_bass())
    HPS = s.ins('Harpsichord', pluck('harpsichord'))
    LED = s.ins('FM reed', fm_reed(), env=ENV_REED, sustain=2, fade=0.4, vib=(0, 40, 3, 6))
    MCH = s.ins('Monks', choir('oh', octave=1, distant=False), env=[(0, 0), (0.2, 64), (1.5, 56)],
                sustain=2, fade=0.8, vib=(0, 40, 3, 5))
    STR = s.ins('Strings', strings(), env=ENV_PAD, sustain=2, fade=2.0)
    STB = s.ins('Stab', strings(), env=ENV_STAB)
    BEL = s.ins('Bell', big_bell())
    TIM = s.ins('Timpani', timpani())

    CH_BD, CH_TOM, CH_FRM, CH_TMB, CH_BAS = range(5)
    CH_HPS, CH_LED, CH_LED_E, CH_MCH = (5, 6), 7, 8, (9, 10)
    STR_B = ((11, 12, 13), (14, 15, 16))
    CH_STB, CH_BEL, CH_TIM = (17, 18), 19, 20

    VOICING = {'Dm': ['D4', 'F4', 'A4'], 'Bb': ['D4', 'F4', 'Bb4'], 'A': ['C#4', 'E4', 'A4'],
               'Gm': ['D4', 'G4', 'Bb4'], 'Eb': ['Eb4', 'G4', 'Bb4'], 'C': ['E4', 'G4', 'C5']}
    ROOT = {'Dm': 'D2', 'Bb': 'Bb1', 'A': 'A1', 'Gm': 'G1', 'Eb': 'Eb2', 'C': 'C2'}
    RIFF = [(0, 0, 50), (3, 0, 40), (6, 12, 44), (8, 0, 48), (10, 3, 40), (11, 5, 40), (14, 1, 44)]
    TOMS = [62, 57, 55]
    MEL = {
        'L1': 'D5:4 A4:2 D5:2 F5:4 E5:2 D5:2 | C#5:4 D5:4 E5:4 A4:4 | Bb4:4 D5:4 F5:6 E5:2 | E5:8 C#5:4 A4:4',
        'L2': 'G5:6 F5:2 D5:4 Bb4:4 | A4:4 D5:4 F5:4 A5:4 | G5:4 Eb5:4 Bb4:4 G4:4 | A4:8 C#5:4 E5:4',
        'L3': 'F5:4 D5:4 Bb4:4 D5:4 | E5:4 C5:4 G4:4 C5:4 | D5:4 F5:4 A5:4 D6:4 | C#6:8 A5:8',
        'L4': 'A5:6 G5:2 F5:4 D5:4 | F5:6 E5:2 D5:4 Bb4:4 | D5:4 Bb4:4 G4:4 Bb4:4 | A4:12 -:4',
    }
    CHANT = 'D3:8 F3:4 E3:4 | D3:8 Bb2:8 | G2:8 Bb2:4 D3:4 | C#3:8 A2:8'
    SONG = [
        ('intro',  ['Dm', 'Dm', 'Bb', 'A'],  None),
        ('groove', ['Dm', 'Dm', 'Bb', 'A'],  None),       # <- reprise de la boucle
        ('groove', ['Dm', 'Dm', 'Bb', 'A'],  'L1'),
        ('groove', ['Gm', 'Dm', 'Eb', 'A'],  'L2'),
        ('chant',  ['Dm', 'Bb', 'Gm', 'A'],  None),
        ('break',  ['Gm', 'Eb', 'Dm', 'A'],  None),
        ('full',   ['Dm', 'Dm', 'Bb', 'A'],  'L1'),
        ('full',   ['Bb', 'C', 'Dm', 'A'],   'L3'),
        ('full',   ['Gm', 'Dm', 'Eb', 'A'],  'L2'),
        ('chant',  ['Dm', 'Bb', 'Gm', 'A'],  'L4'),
        ('outro',  ['Dm', 'Dm', 'Bb', 'A'],  None),
    ]
    for i_pat, (sec, chords, mel) in enumerate(SONG):
        p = s.new()
        release(p, CH_LED, CH_LED_E, *CH_MCH)
        drums = sec in ('groove', 'chant', 'full', 'outro')
        for bar, c in enumerate(chords):
            r0 = bar * 16
            root = midi(ROOT[c])
            # toms tribaux, toujours là
            k = 0
            for r, ch in enumerate('x..x..x.....x.xx' if sec != 'break' else 'x.......x.......'):
                if ch == 'x':
                    p.put(r0 + r, CH_TOM, TOMS[k % 3], TOM, 34 if r % 8 == 0 else 26)
                    k += 1
            if drums:
                beat(p, r0, CH_BD, BD, 'X.....x...X.....')
                beat(p, r0, CH_FRM, FRM, '....X.......X..x', {'X': 36, 'x': 22})
            beat(p, r0, CH_TMB, TMB, '.o.o.o.o.o.o.o.o', {'o': 14 if sec != 'intro' else 10})
            # riff de basse
            if sec == 'break':
                p.put(r0, CH_BAS, root, BAS, 44)
            else:
                riff(p, r0, CH_BAS, BAS, root,
                     [(r, st, v - (10 if sec == 'intro' else 0)) for r, st, v in RIFF])
            # clavecin en doubles-croches
            if sec in ('groove', 'break', 'full'):
                tones = [midi(n) for n in VOICING[c]] + [midi(VOICING[c][0]) + 12]
                order = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 1]
                p.arp(r0, CH_HPS, [tones[o] for o in order], HPS, 14, step=1, pans=(0x50, 0xB0),
                      accent=20)
            if sec in ('full', 'break'):
                s.pad(p, r0, VOICING[c], STR, 18 if sec == 'full' else 22, STR_B)
            if sec in ('chant', 'full') and bar == 0 or sec == 'chant':
                for ch, n in zip(CH_STB, VOICING[c][:2]):
                    p.put(r0, ch, n, STB, 36, 0x60 if ch == CH_STB[0] else 0xA0)
                p.put(r0, CH_TIM, root + 12, TIM, 40)
        if sec not in ('full', 'break'):
            for ch in STR_B[0] + STR_B[1]:
                p.put(0, ch, OFF)
        if sec not in ('groove', 'break', 'full'):
            release(p, *CH_HPS)
        if sec == 'chant':
            p.line(CH_MCH[0], CHANT, MCH, 46, pan=0x70)
            p.line(CH_MCH[1], transpose(CHANT, 7), MCH, 30, pan=0x90)
        if mel:
            p.line(CH_LED, MEL[mel], LED, 40, pan=0x78, echo=[(CH_LED_E, 3, 12, 0xC0)])
        if sec in ('intro', 'break', 'outro'):
            p.put(0, CH_BEL, 'D2', BEL, 30, 0x80)
    s.write(path, 'Halls of torment', 'make_dungeon2.py', restart=1)


# ---------------------------------------------------------------- 3. le rite du serpent

def serpent(path):
    s = Song(22, 6, 126)
    KCK = s.ins('Kick', drum('kick'))
    SNR = s.ins('Snare', drum('snare'))
    HAT = s.ins('Hi-hat', drum('hat'))
    TMB = s.ins('Tambourine', tambourine())
    CRS = s.ins('Crash', drum('crash'))
    TIM = s.ins('Timpani', timpani())
    BAS = s.ins('FM bass', fm_bass())
    ORG = s.ins('Organ', organ(), env=[(0, 0), (0.3, 64), (1.5, 56)], sustain=2, fade=1.0)
    CHO = s.ins('Choir', choir('ah', distant=False), env=ENV_CHOIR, sustain=2, fade=1.2,
                vib=(0, 50, 4, 5))
    LED = s.ins('FM lead', fm_lead(), env=ENV_REED, sustain=2, fade=0.3, vib=(0, 30, 3, 7))
    BRS = s.ins('FM brass stab', fm_brass(), env=ENV_STAB)

    CH_KCK, CH_SNR, CH_HAT, CH_TMB, CH_CRS, CH_TIM, CH_BAS = range(7)
    ORG_B = ((7, 8, 9), (10, 11, 12))
    CHO_B = ((13, 14), (15, 16))
    CH_LED, CH_LED_E = 17, 18
    CH_BRS = (19, 20, 21)

    ORGAN = {'Cm': ['G3', 'C4', 'Eb4'], 'Ab': ['Ab3', 'C4', 'Eb4'], 'Bb': ['F3', 'Bb3', 'D4'],
             'G': ['G3', 'B3', 'D4'], 'Fm': ['F3', 'Ab3', 'C4'], 'Db': ['F3', 'Ab3', 'Db4']}
    CHOIR = {'Cm': ['Eb4', 'G4'], 'Ab': ['Eb4', 'Ab4'], 'Bb': ['F4', 'Bb4'], 'G': ['D4', 'B4'],
             'Fm': ['F4', 'Ab4'], 'Db': ['F4', 'Ab4']}
    ROOT = {'Cm': 'C2', 'Ab': 'Ab1', 'Bb': 'Bb1', 'G': 'G1', 'Fm': 'F1', 'Db': 'Db2'}
    BASS16 = [0, 0, 12, 0, 0, 0, 12, 0, 0, 0, 12, 0, 10, 0, 7, 0]
    MEL = {
        'A': 'C5:3 C5:1 Eb5:4 G5:4 F5:2 Eb5:2 | Ab5:4 G5:2 F5:2 Eb5:4 C5:4 | D5:4 F5:4 Bb5:4 Ab5:4 | G5:8 B4:4 D5:4',
        'B': 'G5:4 Eb5:4 C5:4 Eb5:4 | F5:4 Eb5:2 C5:2 Ab4:8 | Ab4:4 C5:4 F5:4 Ab5:4 | G5:12 -:4',
        'C': 'Eb6:8 C6:4 Ab5:4 | D6:8 Bb5:4 F5:4 | G5:4 C6:4 Eb6:4 G6:4 | F6:4 Eb6:4 D6:4 B5:4',
        'D': 'F6:8 Ab5:4 C6:4 | Db6:8 F5:4 Ab5:4 | B5:8 D6:8 | G6:12 -:4',
    }
    SONG = [
        ('intro',  ['Cm', 'Ab', 'Bb', 'G'],  None),
        ('groove', ['Cm', 'Ab', 'Bb', 'G'],  None),       # <- reprise de la boucle
        ('groove', ['Cm', 'Ab', 'Bb', 'G'],  'A'),
        ('groove', ['Cm', 'Ab', 'Fm', 'G'],  'B'),
        ('chorus', ['Ab', 'Bb', 'Cm', 'Cm'], 'C'),
        ('chorus', ['Fm', 'Db', 'G', 'G'],   'D'),
        ('break',  ['Fm', 'Db', 'G', 'G'],   None),
        ('build',  ['Fm', 'Db', 'G', 'G'],   None),
        ('groove', ['Cm', 'Ab', 'Bb', 'G'],  'A'),
        ('groove', ['Cm', 'Ab', 'Fm', 'G'],  'B'),
        ('chorus', ['Ab', 'Bb', 'Cm', 'Cm'], 'C'),
        ('chorus', ['Fm', 'Db', 'G', 'G'],   'D'),
        ('outro',  ['Cm', 'Ab', 'Bb', 'G'],  None),
    ]
    prev = None
    for i_pat, (sec, chords, mel) in enumerate(SONG):
        p = s.new()
        release(p, CH_LED, CH_LED_E)
        for bar, c in enumerate(chords):
            r0 = bar * 16
            root = midi(ROOT[c])
            if bar == 0 or c != chords[bar - 1]:
                s.pad(p, r0, ORGAN[c], ORG, 26 if sec in ('intro', 'break') else 18, ORG_B)
                if sec in ('intro', 'chorus', 'break'):
                    s.pad(p, r0, CHOIR[c], CHO, 28, CHO_B, pans=(0x50, 0xB0))
            if sec in ('groove', 'chorus', 'build', 'outro'):
                for r, st in enumerate(BASS16):
                    p.put(r0 + r, CH_BAS, root + st, BAS, 46 if r % 4 == 0 else 32)
            elif sec == 'break':
                p.put(r0, CH_BAS, root, BAS, 46)
                p.put(r0 + 8, CH_BAS, root, BAS, 36)
            if sec in ('groove', 'outro'):
                beat(p, r0, CH_KCK, KCK, 'X.....x.X.x.....', {'X': 54, 'x': 44})
                beat(p, r0, CH_SNR, SNR, '....X.......X...', {'X': 44})
                beat(p, r0, CH_HAT, HAT, 'x.x.x.x.x.x.x.x.', {'x': 14})
                beat(p, r0, CH_TMB, TMB, '....x.......x...', {'x': 18})
            elif sec == 'chorus':
                beat(p, r0, CH_KCK, KCK, 'X..x..x.X..x..x.', {'X': 54, 'x': 44})
                beat(p, r0, CH_SNR, SNR, '....X.......X..o', {'X': 46, 'o': 22})
                beat(p, r0, CH_HAT, HAT, 'xoxoxoxoxoxoxoxo', {'x': 16, 'o': 9})
                beat(p, r0, CH_TMB, TMB, '..x...x...x...x.', {'x': 16})
                # cuivres en accents syncopés
                for r, v in ((0, 40), (3, 32), (6, 36)):
                    for ch, n in zip(CH_BRS, ORGAN[c]):
                        p.put(r0 + r, ch, midi(n) + 12, BRS, v, (0x50, 0x80, 0xB0)[CH_BRS.index(ch)])
            elif sec == 'break':
                p.put(r0, CH_KCK, 60, KCK, 48)
                beat(p, r0, CH_TMB, TMB, 'x.o.x.o.x.o.x.o.', {'x': 20, 'o': 10})
            elif sec == 'build':
                beat(p, r0, CH_KCK, KCK, 'X...X...X...X...', {'X': 52})
                step = (4, 2, 1, 1)[bar]
                roll(p, r0, CH_SNR, SNR, range(0, 16, step), 22 + 8 * bar, 30 + 10 * bar)
            if sec == 'intro':
                p.put(r0, CH_TIM, root + 12, TIM, 44)
                if bar == 3:
                    roll(p, r0, CH_TIM, TIM, range(8, 16), 22, 50, root + 12)
            elif sec == 'chorus' and bar % 2 == 0:
                p.put(r0, CH_TIM, root + 12, TIM, 38)
        if sec not in ('intro', 'chorus', 'break'):
            for ch in CHO_B[0] + CHO_B[1]:
                p.put(0, ch, OFF)
        if mel:
            p.line(CH_LED, MEL[mel], LED, 38, pan=0x78, echo=[(CH_LED_E, 3, 12, 0xC0)])
        if sec != prev and sec in ('groove', 'chorus') or (sec == 'groove' and mel == 'A'):
            p.put(0, CH_CRS, 60, CRS, 30, 0xA0)
        prev = sec
    s.write(path, 'Rite of the serpent', 'make_dungeon2.py', restart=1)


# ---------------------------------------------------------------- 4. les cryptes maudites

def cursed(path):
    bar_rows = 12                     # 12/8 : une ligne = une croche de triolet
    s = Song(24, 6, 100, rows=4 * bar_rows)
    BD = s.ins('Bass drum', drum('war'))
    FRM = s.ins('Frame drum', drum('frame'))
    TMB = s.ins('Tambourine', tambourine())
    TIM = s.ins('Timpani', timpani())
    BAS = s.ins('FM bass', fm_bass())
    PZ = s.ins('Pizzicato', pluck('pizz'))
    LED = s.ins('FM reed', fm_reed(), env=ENV_REED, sustain=2, fade=0.4, vib=(0, 40, 3, 6))
    BRS = s.ins('FM brass', fm_brass(), env=ENV_BRASS, sustain=2, fade=0.4, vib=(0, 40, 3, 5))
    CHO = s.ins('Choir', choir('ah', distant=False), env=ENV_CHOIR, sustain=2, fade=1.5,
                vib=(0, 50, 4, 5))
    STR = s.ins('Strings', strings(), env=ENV_PAD, sustain=2, fade=2.0)
    CRS = s.ins('Crash', drum('crash'))

    CH_BD, CH_FRM, CH_TMB, CH_TIM, CH_BAS = range(5)
    CH_PZ, CH_LED, CH_LED_E, CH_BRS, CH_BRS_E = (5, 6), 7, 8, 9, 10
    CHO_B = ((11, 12, 13), (14, 15, 16))
    STR_B = ((17, 18, 19), (20, 21, 22))
    CH_CRS = 23

    VOICING = {'Am': ['A3', 'C4', 'E4'], 'G': ['G3', 'B3', 'D4'], 'F': ['F3', 'A3', 'C4'],
               'E': ['E3', 'G#3', 'B3'], 'Dm': ['D3', 'F3', 'A3']}
    ROOT = {'Am': 'A1', 'G': 'G1', 'F': 'F1', 'E': 'E2', 'Dm': 'D2'}
    MEL = {
        'T1': 'A4:3 C5:2 B4:1 A4:3 E4:3 | G4:2 A4:1 B4:3 D5:6 | C5:3 A4:2 F4:1 A4:3 C5:3 | B4:6 G#4:6',
        'T2': 'E5:3 D5:2 C5:1 B4:3 A4:3 | F5:3 E5:2 D5:1 A4:6 | G#4:2 A4:1 B4:3 E5:3 D5:3 | C5:3 B4:2 G#4:1 A4:6',
        'T3': 'A5:6 G5:3 F5:3 | G5:6 F5:3 E5:3 | E5:3 C5:2 E5:1 A5:6 | G#5:6 B5:6',
    }
    SONG = [
        ('intro',  ['Am', 'G', 'F', 'E'],   None),
        ('groove', ['Am', 'G', 'F', 'E'],   None),        # <- reprise de la boucle
        ('groove', ['Am', 'G', 'F', 'E'],   'T1'),
        ('groove', ['Am', 'Dm', 'E', 'Am'], 'T2'),
        ('big',    ['F', 'G', 'Am', 'E'],   'T3'),
        ('groove', ['Am', 'Dm', 'E', 'Am'], 'T2'),
        ('break',  ['Dm', 'Am', 'E', 'E'],  None),
        ('build',  ['Dm', 'Am', 'E', 'E'],  None),
        ('big',    ['Am', 'G', 'F', 'E'],   'T1'),
        ('big',    ['F', 'G', 'Am', 'E'],   'T3'),
        ('groove', ['Am', 'Dm', 'E', 'Am'], 'T2'),
        ('outro',  ['Am', 'G', 'F', 'E'],   None),
    ]
    prev = None
    for i_pat, (sec, chords, mel) in enumerate(SONG):
        p = s.new()
        release(p, CH_LED, CH_LED_E, CH_BRS, CH_BRS_E)
        drums = sec in ('groove', 'big', 'outro')
        for bar, c in enumerate(chords):
            r0 = bar * bar_rows
            root = midi(ROOT[c])
            # pizzicati : arpège montant et descendant, une croche de triolet par ligne
            tones = [midi(n) for n in VOICING[c]] + [midi(VOICING[c][0]) + 12]
            order = [0, 1, 2, 3, 2, 1] * 2
            p.arp(r0, CH_PZ, [tones[o] for o in order], PZ, 16, step=1, pans=(0x48, 0xB8),
                  accent=24)
            if sec != 'intro':
                for r, st, v in ((0, 0, 46), (6, 7, 36), (9, 12, 30)):
                    if sec != 'break' or r == 0:
                        p.put(r0 + r, CH_BAS, root + st, BAS, v)
            if drums:
                beat(p, r0, CH_BD, BD, 'X.....x.....', {'X': 48, 'x': 36})
                beat(p, r0, CH_FRM, FRM, '...x.....X..', {'X': 36, 'x': 24})
            if sec != 'intro':
                beat(p, r0, CH_TMB, TMB, 'x.o.o.x.o.o.' if sec != 'big' else 'xoooxoxoooxo',
                     {'x': 20, 'o': 10})
            if sec in ('intro', 'break') or (drums and bar % 2 == 0):
                p.put(r0, CH_TIM, root + 12, TIM, 40)
                if sec != 'intro':
                    p.put(r0 + 9, CH_TIM, root + 19, TIM, 28)
            if sec == 'build':
                beat(p, r0, CH_BD, BD, 'X.....X.....', {'X': 44})
                if bar >= 2:
                    roll(p, r0, CH_FRM, FRM, range(12), 18 + 10 * (bar - 2), 34 + 12 * (bar - 2))
                if bar == 3:
                    roll(p, r0, CH_TIM, TIM, range(12), 24, 50, root + 12)
            if sec == 'big':
                s.pad(p, r0, [midi(n) + 12 for n in VOICING[c]], CHO, 28, CHO_B)
            elif sec == 'break':
                s.pad(p, r0, [midi(n) + 12 for n in VOICING[c]], CHO, 18, CHO_B)
            if mel == 'T2':
                s.pad(p, r0, VOICING[c], STR, 18, STR_B)
        if sec not in ('big', 'break'):
            for ch in CHO_B[0] + CHO_B[1]:
                p.put(0, ch, OFF)
        if mel != 'T2':
            for ch in STR_B[0] + STR_B[1]:
                p.put(0, ch, OFF)
        if mel and sec == 'big':
            # anche en haut, cuivres doublés une octave plus bas
            p.line(CH_LED, MEL[mel], LED, 40, pan=0x68)
            p.line(CH_BRS, transpose(MEL[mel], -12), BRS, 36, pan=0x98)
        elif mel:
            p.line(CH_LED, MEL[mel], LED, 40, pan=0x78, echo=[(CH_LED_E, 3, 12, 0xC0)])
        if sec == 'big' and sec != prev:
            p.put(0, CH_CRS, 60, CRS, 28, 0xA0)
        prev = sec
    s.write(path, 'The cursed crypts', 'make_dungeon2.py', restart=1)


TRACKS = {'1': (siege, 'dungeon_siege.xm'), '2': (torment, 'dungeon_torment.xm'),
          '3': (serpent, 'dungeon_serpent.xm'), '4': (cursed, 'dungeon_cursed.xm')}

if __name__ == '__main__':
    for key in sys.argv[1:] or sorted(TRACKS):
        fn, path = TRACKS[key]
        fn(path)
