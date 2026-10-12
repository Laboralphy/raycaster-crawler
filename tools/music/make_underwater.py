#!/usr/bin/env python3
"""
Deux ambiances du niveau englouti (XM, OpenMPT), angoissantes : il faut
trouver de l'air sans attirer l'attention du monstre marin. Le motif du
monstre est le même dans les deux : deux notes au demi-ton, de plus en plus
serrées (comme dans « Les dents de la mer »).

1. underwater.xm  Les salles noyées — do dièse mineur, 100 bpm (une ligne = 0,15 s), 12 motifs : 1 min 55 s, en
boucle. Tout est étouffé, comme entendu sous l'eau.
- l'air qui manque : un tic d'horloge sourd et des battements de cœur qui
  s'accélèrent (périodes de 8, 6 puis 4 lignes, comptées sur tout le morceau) ;
- le monstre : motif de basse au demi-ton (do dièse - ré) de plus en plus
  serré, grondements qui s'approchent et changent de côté, coups sourds ;
- l'apnée : cordes en trémolo qui montent par demi-tons, grappe aiguë
  d'harmonica de verre (seconde mineure) qui enfle ;
- se cacher : au milieu, tout se tait d'un coup, il ne reste que le cœur, le
  tic et quelques bulles, pendant que le monstre passe.
La fin redescend vers le calme relatif du début, pour boucler.

2. underwater_sewer.xm  Les égouts — mi phrygien (mi - fa pour le monstre),
84 bpm (une ligne = 0,18 s), 10 motifs : 1 min 54 s, en boucle. Humide et
caverneux, sans bulles : souffle qui résonne dans les conduites, filet d'eau
dans la rigole, gouttes au long écho de voûte, tuyaux qui cognent au loin,
rats. Un cor lointain se répète dans les galeries. Au milieu, le monstre
rôde : le motif s'espace, presque rien ne bouge.

3. underwater_escape.xm  La fuite — ré mineur (ré - mi bémol pour le requin),
132 bpm (une ligne = 0,11 s), 16 motifs : 1 min 56 s. Plongé dans une salle
noyée, il faut trouver la sortie avant de manquer d'air, en évitant le
requin et les méduses. Plongeon d'entrée (joué une fois : la boucle reprend
au motif 1), ostinato de cordes qui pousse en avant, cor pressant, tic et
tintements de cristal qui montent d'un demi-ton à chaque mesure (le temps
file). Attaques du requin : basse au galop en doubles-croches, accents, toms,
ruées. Champ de méduses : le rythme s'efface, scintillement de célesta et de
verre, piqûres électriques de part et d'autre. Puis le requin tourne autour
(cœur et tic seuls) avant la dernière poussée.

Usage : python3 make_underwater.py [1 2 3]   (défaut : les trois)
"""
import sys

import numpy as np

from make_forest_night import make_heartbeat
from xm_kit import (ENV_STAB, ENV_STAC, OFF, Song, bubbles, celesta, crystal, drip, drum, fm_bass,
                    glass, growl, hollow, horn, moan, pipe, plunge, pressure, rat, rumble, strings,
                    tick, trickle, wrap, zap)


def every(pat, i_pat, period, ch, note, ins, vol, accent=None):
    """Événement régulier compté sur tout le morceau (le rythme ne se
    recale pas au début de chaque motif quand la période change)."""
    for r in range(pat.rows):
        g = i_pat * pat.rows + r
        if g % period == 0:
            v = accent if accent is not None and g % (2 * period) == 0 else vol
            pat.put(r, ch, note, ins, v)


def drowned(path):
    s = Song(22, 6, 100)
    PAD = s.ins('Drowned strings', strings(muffled=True), env=[(0, 0), (1.5, 64), (3, 56)],
                sustain=2, fade=3.0)
    TRM = s.ins('Tremolo strings', strings(tremolo=True), env=[(0, 0), (2.0, 64)], sustain=1,
                fade=1.5)
    PRS = s.ins('Pressure', pressure(), env=[(0, 0), (3.0, 64)], sustain=1, fade=5.0)
    BAS = s.ins('Muffled bass', fm_bass(muffled=True))
    GLS = s.ins('Held breath', glass(), env=[(0, 0), (4.0, 64)], sustain=1, fade=1.5,
                vib=(0, 0, 6, 8))
    HRT = s.ins('Heartbeat', wrap(make_heartbeat()))
    TCK = s.ins('Tick', tick())
    THD = s.ins('Thud', drum('war'))
    GRL = s.ins('Sea monster', growl())
    MOA = s.ins('Distant moan', moan())
    BUB = s.ins('Air bubbles', bubbles())
    STB = s.ins('Stab', strings(muffled=True), env=ENV_STAB)
    CUR = s.ins('Current', rumble())

    PAD_B = ((0, 1, 2), (3, 4, 5))
    CH_PRS, CH_BAS, CH_TRM, CH_GLS, CH_HRT, CH_TCK, CH_THD, CH_GRL, CH_MOA, CH_BUB, CH_STB, CH_CUR = (
        6, 7, (8, 9), (10, 11), 12, 13, 14, 15, 16, 17, (18, 19), 20)

    VOICING = {'C#m': ['C#3', 'G#3', 'E4'], 'D': ['D3', 'A3', 'F#4'], 'G': ['D3', 'G3', 'B3'],
               'A': ['C#3', 'A3', 'E4'], 'G#': ['C3', 'G#3', 'D#4']}
    SONG = [
        # accords (None : on garde), basse, cœur, tic, trémolo, verre, monstre (ligne, pan, vol),
        # plaintes, coups, accents, bulles
        (['C#m', None, 'D', None],  None,      8, 8, None, None, None,             [24], None,    False, 2),
        (['C#m', None, 'D', None],  'slow',    8, 4, None, None, None,             [],   None,    False, 1),
        (['C#m', 'D', 'C#m', 'D'],  'slow',    6, 4, 0,    None, (40, 0x30, 26),   [],   'pulse', False, 1),
        (['C#m', 'D', 'G', 'G#'],   'eighths', 6, 4, 0,    14,   None,             [8],  'pulse', False, 0),
        (['C#m', 'D', 'C#m', 'D'],  'eighths', 4, 2, 4,    20,   (16, 0xD0, 36),   [],   'march', False, 1),
        (['G', 'G#', 'C#m', 'D'],   'drive',   4, 2, 4,    26,   (0, 0x80, 44),    [],   'march', True,  0),
        (['C#m', None, None, None], None,      4, 4, None, None, (32, 0x40, 30),   [],   None,    False, 3),
        (['C#m', None, 'D', None],  'slow',    6, 4, None, None, None,             [20], 'pulse', False, 1),
        (['C#m', 'D', 'G', 'G#'],   'eighths', 4, 2, 0,    18,   (48, 0xC0, 34),   [],   'march', False, 0),
        (['A', 'G', 'G#', 'G#'],    'drive',   4, 2, 4,    28,   (8, 0x80, 46),    [],   'march', True,  0),
        (['C#m', 'D', 'C#m', 'D'],  'drive',   4, 2, 8,    28,   None,             [],   'march', True,  0),
        (['C#m', None, 'D', None],  'fade',    6, 4, None, None, None,             [24], None,    False, 2),
    ]
    rng = np.random.default_rng(717)
    for i_pat, (chords, bass, heart, tck, trem, gls, monster, moans, thud, stabs, bub) in enumerate(SONG):
        p = s.new()
        hiding = bass is None and i_pat > 0
        for bar, c in enumerate(chords):
            r0 = bar * 16
            if c is not None:
                s.pad(p, r0, VOICING[c], PAD, 12 if hiding else 22, PAD_B)
            # motif du monstre : demi-ton do dièse - ré, de plus en plus serré
            if bass == 'slow' or (bass == 'fade' and bar < 2):
                for r, n, v in ((0, 'C#2', 46), (2, 'D2', 40), (8, 'C#2', 44), (10, 'D2', 38)):
                    p.put(r0 + r, CH_BAS, n, BAS, v)
            elif bass in ('eighths', 'drive'):
                for k, r in enumerate(range(0, 16, 2)):
                    p.put(r0 + r, CH_BAS, 'C#2' if k % 2 == 0 else 'D2', BAS, 48 if r % 8 == 0 else 38)
                if bass == 'drive':
                    p.put(r0 + 7, CH_BAS, 'C#2', BAS, 30)
                    p.put(r0 + 15, CH_BAS, 'D2', BAS, 34)
            # apnée : trémolo qui monte par demi-tons
            if trem is not None:
                lo = 61 + trem + bar
                p.put(r0, CH_TRM[0], lo, TRM, 20, 0x50)
                p.put(r0, CH_TRM[1], lo + 1, TRM, 18, 0xB0)
            if thud == 'pulse':
                p.put(r0, CH_THD, 60, THD, 36)
            elif thud == 'march':
                p.put(r0, CH_THD, 60, THD, 44)
                p.put(r0 + 8, CH_THD, 60, THD, 32)
                if bar == 3:
                    p.put(r0 + 12, CH_THD, 60, THD, 26)
                    p.put(r0 + 14, CH_THD, 60, THD, 34)
            if stabs:
                v = VOICING[c or chords[0]]
                for ch, n in zip(CH_STB, v[1:]):
                    p.put(r0, ch, n, STB, 40, 0x60 if ch == CH_STB[0] else 0xA0)
        if bass is None or bass == 'fade':
            p.put(0 if bass is None else 32, CH_BAS, OFF)
        if trem is None:
            for ch in CH_TRM:
                p.put(0, ch, OFF)
        if gls:
            p.put(0, CH_GLS[0], 'G#5', GLS, gls, 0x40)
            p.put(0, CH_GLS[1], 'A5', GLS, gls - 4, 0xC0)
        else:
            for ch in CH_GLS:
                p.put(0, ch, OFF)
        every(p, i_pat, heart, CH_HRT, 58, HRT, 26)
        every(p, i_pat, tck, CH_TCK, 60, TCK, 18 if tck > 2 else 14, accent=24)
        if monster:
            r, pan, vol = monster
            p.put(r, CH_GRL, int(rng.choice([55, 57, 60])), GRL, vol, pan)
        for r in moans:
            p.put(r, CH_MOA, int(rng.choice([55, 58])), MOA, 22, int(rng.choice([0x30, 0xD0])))
        for _ in range(bub):
            p.put(int(rng.integers(0, 60)), CH_BUB, int(rng.integers(58, 68)), BUB,
                  int(rng.integers(16, 26)), int(rng.choice([0x40, 0x70, 0xA0, 0xC0])))
        if i_pat == 0:
            p.put(0, CH_PRS, 'C#2', PRS, 28)
            p.put(0, CH_CUR, 55, CUR, 24)
    s.write(path, 'The drowned halls', 'make_underwater.py')


def sewer(path):
    s = Song(22, 6, 84)
    PAD = s.ins('Damp strings', strings(muffled=True), env=[(0, 0), (1.5, 64), (3, 56)],
                sustain=2, fade=3.0)
    TRM = s.ins('Tremolo strings', strings(tremolo=True), env=[(0, 0), (2.0, 64)], sustain=1,
                fade=1.5)
    BAS = s.ins('Muffled bass', fm_bass(muffled=True))
    HRN = s.ins('Distant horn', horn(), env=[(0, 0), (0.3, 64), (1.5, 52)], sustain=2, fade=1.2,
                vib=(0, 60, 3, 4))
    THD = s.ins('Thud', drum('war'))
    STB = s.ins('Stab', strings(muffled=True), env=ENV_STAB)
    GRL = s.ins('Sea monster', growl())
    HOL = s.ins('Hollow pipes', hollow())
    TRK = s.ins('Trickle', trickle())
    DRP = s.ins('Vault drip', drip(tunnel=True))
    PIP = s.ins('Metal pipe', pipe())
    RAT = s.ins('Rats', rat())

    PAD_B = ((0, 1, 2), (3, 4, 5))
    CH_BAS, CH_TRM, CH_HRN, CH_HRN_E, CH_HRN_E2, CH_THD, CH_STB, CH_GRL, CH_HOL, CH_TRK, CH_DRP, \
        CH_PIP, CH_RAT = 6, (7, 8), 9, 10, 11, 12, (13, 14), 15, 16, 17, (18, 19), 20, 21

    VOICING = {'Em': ['E3', 'B3', 'G4'], 'F': ['F3', 'C4', 'A4'], 'C': ['E3', 'C4', 'G4'],
               'Am': ['E3', 'C4', 'A4'], 'Bb': ['F3', 'Bb3', 'D4']}
    HORN = {
        1: 'B3:8 C4:4 B3:4 | A3:8 F3:8 | G3:4 A3:4 B3:4 E4:4 | E4:12 -:4',
        2: 'E4:6 F4:2 G4:8 | A4:6 G4:2 F4:8 | G4:4 F4:4 E4:4 D4:4 | E4:8 F4:4 E4:4',
    }
    SONG = [
        # accords (None : on garde), basse, cor, trémolo, coups, accents, monstre (ligne, pan, vol),
        # tuyaux, rats, gouttes
        (['Em', None, 'F', None],   None,      None, None, None,    False, None,             [20],     1, 3),
        (['Em', None, 'F', None],   'slow',    None, None, None,    False, None,             [],       0, 3),
        (['Em', 'F', 'Em', 'C'],    'slow',    1,    None, 'pulse', False, None,             [44],     1, 2),
        (['Em', 'F', 'Am', 'Bb'],   'eighths', None, 0,    'pulse', False, (24, 0x30, 30),   [],       0, 2),
        (['Em', 'F', 'Em', 'F'],    'eighths', 2,    2,    'march', False, None,             [8],      1, 1),
        (['Em', 'F', 'Bb', 'F'],    'drive',   None, 4,    'march', True,  (0, 0xC0, 42),    [],       0, 1),
        (['Em', None, None, None],  'lurk',    None, None, None,    False, (32, 0x50, 30),   [12, 40], 2, 4),
        (['Em', 'F', 'Em', 'C'],    'slow',    1,    None, 'pulse', False, None,             [],       0, 2),
        (['Am', 'Bb', 'Em', 'F'],   'drive',   2,    4,    'march', True,  (16, 0x90, 44),   [],       0, 1),
        (['Em', None, 'F', None],   'fade',    None, None, None,    False, None,             [28],     1, 3),
    ]
    rng = np.random.default_rng(818)
    for i_pat, (chords, bass, mel, trem, thud, stabs, monster, pipes, rats, drips) in enumerate(SONG):
        p = s.new()
        lurking = bass == 'lurk'
        for bar, c in enumerate(chords):
            r0 = bar * 16
            if c is not None:
                s.pad(p, r0, VOICING[c], PAD, 12 if lurking else 22, PAD_B)
            # le monstre : mi - fa
            if bass == 'slow' or (bass == 'fade' and bar < 2):
                for r, n, v in ((0, 'E2', 46), (2, 'F2', 40), (8, 'E2', 44), (10, 'F2', 38)):
                    p.put(r0 + r, CH_BAS, n, BAS, v)
            elif bass == 'lurk':
                p.put(r0, CH_BAS, 'E2', BAS, 34)
                p.put(r0 + 8, CH_BAS, 'F2', BAS, 28)
            elif bass in ('eighths', 'drive'):
                for k, r in enumerate(range(0, 16, 2)):
                    p.put(r0 + r, CH_BAS, 'E2' if k % 2 == 0 else 'F2', BAS, 48 if r % 8 == 0 else 38)
                if bass == 'drive':
                    p.put(r0 + 7, CH_BAS, 'E2', BAS, 30)
                    p.put(r0 + 15, CH_BAS, 'F2', BAS, 34)
            if trem is not None:
                lo = 64 + trem + bar
                p.put(r0, CH_TRM[0], lo, TRM, 18, 0x50)
                p.put(r0, CH_TRM[1], lo + 1, TRM, 16, 0xB0)
            if thud == 'pulse':
                p.put(r0, CH_THD, 60, THD, 34)
            elif thud == 'march':
                p.put(r0, CH_THD, 60, THD, 44)
                p.put(r0 + 8, CH_THD, 60, THD, 32)
                if bar == 3:
                    p.put(r0 + 12, CH_THD, 60, THD, 26)
                    p.put(r0 + 14, CH_THD, 60, THD, 34)
            if stabs:
                for ch, n in zip(CH_STB, VOICING[c or chords[0]][1:]):
                    p.put(r0, ch, n, STB, 40, 0x60 if ch == CH_STB[0] else 0xA0)
        if bass is None or bass == 'fade':
            p.put(0 if bass is None else 32, CH_BAS, OFF)
        if trem is None:
            for ch in CH_TRM:
                p.put(0, ch, OFF)
        if mel:
            # le cor se répète dans les galeries : deux échos, de plus en plus loin
            p.line(CH_HRN, HORN[mel], HRN, 30, pan=0x70,
                   echo=[(CH_HRN_E, 4, 14, 0xC0), (CH_HRN_E2, 8, 7, 0x40)])
        else:
            for ch in (CH_HRN, CH_HRN_E, CH_HRN_E2):
                p.put(0, ch, OFF)
        if monster:
            r, pan, vol = monster
            p.put(r, CH_GRL, int(rng.choice([55, 57, 60])), GRL, vol, pan)
        for k, r in enumerate(pipes):
            p.put(r, CH_PIP, int(rng.choice([53, 56, 60])), PIP, 20, 0x30 if k % 2 == 0 else 0xD0)
        for _ in range(rats):
            p.put(int(rng.integers(0, 60)), CH_RAT, int(rng.integers(58, 64)), RAT,
                  int(rng.integers(10, 18)), int(rng.choice([0x20, 0x40, 0xC0, 0xE0])))
        for k in range(drips):
            p.put(int(rng.integers(0, 64)), CH_DRP[k % 2], int(rng.integers(52, 63)), DRP,
                  int(rng.integers(14, 26)), int(rng.choice([0x30, 0x50, 0xB0, 0xD0])))
        if i_pat == 0:
            p.put(0, CH_HOL, 60, HOL, 26)
            p.put(0, CH_TRK, 60, TRK, 16, 0xA0)
    s.write(path, 'The sewers', 'make_underwater.py')


def escape(path):
    s = Song(28, 6, 132)
    PAD = s.ins('Drowned strings', strings(muffled=True), env=[(0, 0), (0.8, 64), (2, 56)],
                sustain=2, fade=2.0)
    STA = s.ins('Staccato strings', strings(), env=ENV_STAC)
    BAS = s.ins('Shark bass', fm_bass(muffled=True))
    HRN = s.ins('Horn', horn(), env=[(0, 0), (0.08, 64), (0.8, 54)], sustain=2, fade=0.6,
                vib=(0, 40, 3, 5))
    THD = s.ins('Thud', drum('war'))
    TOM = s.ins('Tom', drum('tom'))
    KCK = s.ins('Kick', drum('kick'))
    TCK = s.ins('Tick', tick())
    CRY = s.ins('Time ping', crystal())
    CEL = s.ins('Jellyfish shimmer', celesta())
    GLS = s.ins('Jellyfish glow', glass(), env=[(0, 0), (1.5, 64)], sustain=1, fade=1.5,
                vib=(0, 0, 8, 10))
    ZAP = s.ins('Sting', zap())
    GRL = s.ins('Shark', growl())
    PLG = s.ins('Plunge', plunge())
    STB = s.ins('Stab', strings(muffled=True), env=ENV_STAB)
    PRS = s.ins('Pressure', pressure(), env=[(0, 0), (2.0, 64)], sustain=1, fade=4.0)
    HRT = s.ins('Heartbeat', wrap(make_heartbeat()))

    PAD_B = ((0, 1, 2), (3, 4, 5))
    CH_STA, CH_BAS, CH_HRN, CH_HRN_E, CH_THD, CH_TOM, CH_KCK, CH_TCK, CH_CRY = (
        (6, 7), 8, 9, 10, 11, 12, 13, 14, 15)
    CH_CEL, CH_GLS, CH_ZAP, CH_GRL, CH_PLG, CH_STB, CH_PRS, CH_HRT = (
        (16, 17), (18, 19), (20, 21), 22, 23, (24, 25), 26, 27)

    VOICING = {'Dm': ['D3', 'A3', 'F4'], 'Eb': ['Eb3', 'Bb3', 'G4'], 'Bb': ['D3', 'Bb3', 'F4'],
               'C': ['E3', 'C4', 'G4'], 'A': ['C#3', 'A3', 'E4'], 'Gm': ['D3', 'G3', 'Bb3']}
    OST = {'Dm': 62, 'Eb': 63, 'Bb': 58, 'C': 60, 'A': 57, 'Gm': 55}
    MINOR = ('Dm', 'Gm')
    SHIMMER = {'Dm': ('A5', 'Bb5'), 'Eb': ('Bb5', 'B5'), 'Gm': ('G5', 'Ab5'), 'A': ('A5', 'Bb5')}
    HORN = {
        'A': 'D4:4 F4:4 A4:6 G4:2 | G4:4 Eb4:4 Bb4:8 | A4:4 F4:4 D4:4 F4:4 | E4:8 C#4:8',
        'B': 'F4:4 Bb4:4 D5:8 | E5:4 C5:4 G4:8 | A4:4 D5:4 F5:4 D5:4 | C#5:8 E5:8',
        'C': 'G5:6 F5:2 D5:4 Bb4:4 | Eb5:6 D5:2 Bb4:4 G4:4 | A4:4 C#5:4 E5:4 A5:4 | F5:8 D5:8',
    }
    SONG = [
        ('plunge', ['Dm', None, 'Eb', None], None),
        ('swim',   ['Dm', 'Eb', 'Dm', 'Eb'], None),      # <- reprise de la boucle
        ('drums',  ['Dm', 'Eb', 'Bb', 'A'],  None),
        ('run',    ['Dm', 'Eb', 'Dm', 'A'],  'A'),
        ('run',    ['Bb', 'C', 'Dm', 'A'],   'B'),
        ('attack', ['Dm', 'Eb', 'Dm', 'Eb'], None),
        ('attack', ['Bb', 'A', 'Dm', 'A'],   None),
        ('jelly',  ['Dm', None, 'Eb', None], None),
        ('jelly',  ['Gm', None, 'A', None],  None),
        ('run',    ['Dm', 'Eb', 'Dm', 'A'],  'A'),
        ('run',    ['Gm', 'Eb', 'A', 'Dm'],  'C'),
        ('climax', ['Dm', 'Eb', 'Bb', 'A'],  'B'),
        ('climax', ['Gm', 'Eb', 'A', 'Dm'],  'C'),
        ('circle', ['Dm', None, None, None], None),
        ('attack', ['Dm', 'Eb', 'Bb', 'A'],  None),
        ('fade',   ['Dm', None, 'Eb', None], None),
    ]
    rng = np.random.default_rng(919)
    for i_pat, (sec, chords, mel) in enumerate(SONG):
        p = s.new()
        fight = sec in ('attack', 'climax')
        drums = sec in ('drums', 'run', 'attack', 'climax')
        ost = sec in ('swim', 'drums', 'run', 'attack', 'climax') or (sec == 'fade')
        cur = chords[0]
        for bar, c in enumerate(chords):
            r0 = bar * 16
            cur = c or cur
            if c is not None:
                soft = sec in ('jelly', 'circle', 'plunge')
                s.pad(p, r0, VOICING[c], PAD, 14 if soft else 20, PAD_B)
            # le requin : ré - mi bémol, en pédale sous tous les accords
            if fight:
                for r in range(16):
                    p.put(r0 + r, CH_BAS, 'D2' if (r // 2) % 2 == 0 else 'Eb2', BAS,
                          52 if r % 4 == 0 else 36)
            elif drums:
                for k, r in enumerate(range(0, 16, 2)):
                    p.put(r0 + r, CH_BAS, 'D2' if k % 2 == 0 else 'Eb2', BAS, 50 if r % 8 == 0 else 40)
            elif sec in ('swim', 'jelly') or (sec == 'fade' and bar < 2):
                for r, n, v in ((0, 'D2', 46), (2, 'Eb2', 40), (8, 'D2', 44), (10, 'Eb2', 38)):
                    p.put(r0 + r, CH_BAS, n, BAS, v - (8 if sec == 'jelly' else 0))
            elif sec == 'circle':
                p.put(r0, CH_BAS, 'D2', BAS, 34)
            # ostinato de cordes, avec la seconde mineure du requin
            if ost and not (sec == 'fade' and bar >= 2):
                th = 3 if cur in MINOR else 4
                steps = [0, -5, 0, th, 0, -5, 1, 0]
                if fight:
                    steps = [st for st in steps for _ in (0, 1)]
                p.arp(r0, CH_STA, [OST[cur] + st for st in steps], STA, 20, step=1 if fight else 2,
                      pans=(0x58, 0xA8), accent=28)
            # batterie (étouffée)
            if drums:
                p.put(r0, CH_THD, 60, THD, 46)
                p.put(r0 + 8, CH_THD, 60, THD, 34 if not fight else 42)
                p.put(r0 + 4, CH_KCK, 60, KCK, 30)
                p.put(r0 + 12, CH_KCK, 60, KCK, 34)
                if fight or bar == 3:
                    for r, n in ((12, 'D4'), (13, 'C4'), (14, 'A3'), (15, 'G3')):
                        p.put(r0 + r, CH_TOM, n, TOM, 36)
            elif sec == 'jelly':
                p.put(r0, CH_THD, 60, THD, 30)
            if fight:
                for ch, n in zip(CH_STB, VOICING[cur][1:]):
                    p.put(r0, ch, n, STB, 42, 0x60 if ch == CH_STB[0] else 0xA0)
            # le temps file : un tintement par mesure, un demi-ton plus haut à chaque fois
            if sec in ('run', 'climax', 'drums'):
                k = (i_pat * 4 + bar) % 12
                p.put(r0 + 6, CH_CRY, 77 + k, CRY, 16, 0xC0 if bar % 2 else 0x40)
                if sec == 'climax':
                    p.put(r0 + 14, CH_CRY, 77 + k, CRY, 12, 0x40 if bar % 2 else 0xC0)
            # champ de méduses : scintillement en trémolo, lueur à la seconde mineure
            if sec == 'jelly':
                a, b = SHIMMER[cur]
                drift = (0x30, 0x60, 0x90, 0xC0)[bar]      # le banc dérive d'un côté à l'autre
                for r in range(16):
                    p.put(r0 + r, CH_CEL[r % 2], a if r % 2 == 0 else b, CEL, 12 if r % 4 else 16,
                          drift if r % 2 == 0 else 0xFF - drift)
                if c is not None:
                    p.put(r0, CH_GLS[0], 'D5', GLS, 16, 0x50)
                    p.put(r0, CH_GLS[1], 'Eb5', GLS, 14, 0xB0)
            if sec == 'circle':
                for r in (0, 4, 8, 12):
                    p.put(r0 + r, CH_HRT, 58, HRT, 28)
        # tic : toutes les 4 lignes, toutes les 2 quand le requin attaque
        period = 2 if fight else 4
        for r in range(0, 64, period):
            p.put(r, CH_TCK, 60, TCK, 22 if r % 16 == 0 else 15)
        if sec not in ('jelly',):
            for ch in CH_CEL + CH_GLS:
                p.put(0, ch, OFF)
        if not ost:
            for ch in CH_STA:
                p.put(0, ch, OFF)
        # on relâche le cor à chaque motif : sinon la dernière note d'une phrase
        # tient jusqu'à la phrase suivante (la mélodie écrite ensuite remplace ce OFF)
        for ch in CH_HRN, CH_HRN_E:
            p.put(0, ch, OFF)
        if mel:
            p.line(CH_HRN, HORN[mel], HRN, 38, pan=0x70, echo=[(CH_HRN_E, 3, 12, 0xC0)])
        if sec == 'plunge':
            p.put(0, CH_PLG, 60, PLG, 54)
            p.put(0, CH_PRS, 'D2', PRS, 26)
        if fight:
            # le requin fond sur le joueur, d'un côté puis de l'autre
            pan = int(rng.choice([0x30, 0xD0]))
            p.put(0, CH_GRL, int(rng.choice([57, 60])), GRL, 44, pan)
            p.put(32, CH_PLG, int(rng.choice([62, 65])), PLG, 34, 0xFF - pan)
        if sec == 'circle':
            p.put(16, CH_GRL, 55, GRL, 32, 0x40)
            p.put(44, CH_GRL, 57, GRL, 28, 0xC0)
        if sec == 'jelly':
            for _ in range(int(rng.integers(3, 6))):
                p.put(int(rng.integers(0, 64)), CH_ZAP[int(rng.integers(0, 2))],
                      int(rng.integers(55, 68)), ZAP, int(rng.integers(20, 32)),
                      int(rng.choice([0x20, 0x50, 0xB0, 0xE0])))
    s.write(path, 'The escape', 'make_underwater.py', restart=1)


TRACKS = {'1': (drowned, 'underwater.xm'), '2': (sewer, 'underwater_sewer.xm'),
          '3': (escape, 'underwater_escape.xm')}

if __name__ == '__main__':
    for key in sys.argv[1:] or sorted(TRACKS):
        fn, path = TRACKS[key]
        fn(path)
