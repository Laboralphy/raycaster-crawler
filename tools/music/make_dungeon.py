#!/usr/bin/env python3
"""
Quatre ambiances de donjon (XM, OpenMPT) : instruments anciens, chœurs
lointains, inquiétant. Esprit « dungeon synth ».

1. dungeon_crypt.xm      La crypte oubliée — la mineur, 60 bpm, vielle à roue,
                         luth, flûte à bec en écho, chœur lointain.
2. dungeon_catacombs.xm  Les catacombes — ré phrygien, 50 bpm, plain-chant
                         d'hommes en organum (quartes parallèles), orgue
                         étouffé, cloche, chuchotements.
3. dungeon_halls.xm      Les salles des anciens rois — do mineur, 72 bpm,
                         ostinato de tympanon, cordes, cor, tambour de guerre.
4. dungeon_ossuary.xm    L'ossuaire — si locrien, 48 bpm, grappes de chœur
                         dissonantes, voix seule, os, battements de cœur.

Usage : python3 make_dungeon.py [1 2 3 4]   (défaut : les quatre)
"""
import sys

import numpy as np

from make_forest import make_flute
from make_forest_night import make_choir, make_drone, make_heartbeat
from xm_kit import (ENV_PAD, ENV_VOICE, OFF, Song, big_bell, choir, drip, drum, gurdy, horn,
                    organ, pluck, rattle, strings, transpose, whisper, wind, wrap)

THIRD = {'m': 3, '': 4, 'dim': 3}


def quality(chord):
    return 'm' if chord.endswith('m') else ''


def drips(pat, ch, ins, rng, count=(1, 4), vol=(14, 26)):
    for _ in range(int(rng.integers(*count))):
        pat.put(int(rng.integers(0, pat.rows)), ch, int(rng.choice([55, 58, 60, 63, 65])), ins,
                int(rng.integers(*vol)), int(rng.choice([0x30, 0x50, 0xB0, 0xD0])))


# ---------------------------------------------------------------- 1. la crypte

def crypt(path):
    s = Song(20, 6, 60)
    STR = s.ins('Strings', strings(), env=ENV_PAD, sustain=2, fade=4.0)
    CHO = s.ins('Distant choir', choir('ah'), env=ENV_VOICE, sustain=2, fade=3.0, vib=(0, 60, 4, 5))
    GUR = s.ins('Hurdy-gurdy', gurdy(), env=[(0, 0), (0.4, 64)], sustain=1, fade=3.0)
    LUT = s.ins('Lute', pluck('lute'), pan=110)
    REC = s.ins('Recorder', wrap(make_flute()), env=[(0, 0), (0.05, 64), (0.8, 52)], sustain=2,
                fade=1.2, vib=(0, 40, 3, 6))
    DRM = s.ins('Frame drum', drum('frame'))
    BEL = s.ins('Bell', big_bell())
    WND = s.ins('Wind', wind())
    DRP = s.ins('Drip', drip())

    STR_B = ((0, 1, 2), (3, 4, 5))
    CHO_B = ((6, 7), (8, 9))
    CH_GUR, CH_LUT, CH_REC, CH_ECHO, CH_DRM, CH_BEL, CH_WND, CH_DRP = (10, 11), (12, 13), 14, 15, 16, 17, 18, 19

    VOICING = {'Am': ['A3', 'C4', 'E4'], 'F': ['A3', 'C4', 'F4'], 'G': ['B3', 'D4', 'G4'],
               'Em': ['B3', 'E4', 'G4'], 'Dm': ['A3', 'D4', 'F4'], 'E': ['B3', 'E4', 'G#4']}
    CHOIR = {'Am': ['A3', 'E4'], 'F': ['C4', 'F4'], 'G': ['B3', 'G4'], 'Em': ['B3', 'G4'],
             'Dm': ['A3', 'F4'], 'E': ['B3', 'G#4']}
    ROOT = {'Am': 45, 'F': 41, 'G': 43, 'Em': 40, 'Dm': 38, 'E': 40}
    MEL = {
        'A': 'E5:8 D5:4 C5:4 | A4:6 C5:2 F5:8 | E5:4 F5:4 D5:4 A4:4 | B4:8 G#4:4 E4:4',
        'B': 'A5:6 G5:2 E5:8 | G5:4 F5:4 D5:8 | C5:4 D5:4 E5:4 F5:4 | E5:12 -:4',
        'A2': 'E5:8 D5:4 C5:4 | A4:6 C5:2 F5:8 | G5:4 F5:4 E5:4 D5:4 | B4:12 -:4',
        'END': 'F5:8 E5:4 D5:4 | B4:8 G#4:8 | A4:16 | -:16',
    }
    CHOIR_LINE = ('A4:8 F4:8 | E4:8 C5:8 | D5:12 C5:4 | B4:16',
                  'D4:16 | C4:16 | A3:16 | G#3:16')
    SONG = [
        # accords,                  luth,  flûte, chœur,  tambour, cloche
        (['Am', 'Am', 'F', 'Em'],   False, None,  None,   False,   True),
        (['Am', 'F', 'G', 'Em'],    True,  None,  None,   True,    False),
        (['Am', 'F', 'Dm', 'E'],    True,  'A',   None,   True,    False),
        (['Am', 'G', 'F', 'E'],     True,  'B',   'pad',  True,    True),
        (['Dm', 'Am', 'Dm', 'E'],   True,  None,  'line', False,   False),
        (['Am', 'F', 'G', 'Em'],    True,  'A2',  'pad',  True,    False),
        (['Dm', 'E', 'Am', 'Am'],   False, 'END', 'pad',  False,   True),
    ]
    rng = np.random.default_rng(101)
    for i_pat, (chords, lute, mel, cho, drm, bell) in enumerate(SONG):
        p = s.new()
        for bar, c in enumerate(chords):
            r0 = bar * 16
            s.pad(p, r0, VOICING[c], STR, 22, STR_B)
            if cho == 'pad':
                s.pad(p, r0, CHOIR[c], CHO, 26, CHO_B, pans=(0x40, 0xC0))
            if lute:
                b = ROOT[c] + 12
                th = THIRD[quality(c)]
                steps = [0, 7, 12, 12 + th, 12, 7]
                for k, (r, st) in enumerate(zip((0, 3, 6, 8, 11, 14), steps)):
                    p.put(r0 + r, CH_LUT[k % 2], b + st, LUT, 34 if k == 0 else 24,
                          0x60 if k % 2 == 0 else 0xA0)
            if drm:
                p.put(r0, CH_DRM, 60, DRM, 36)
                p.put(r0 + 10, CH_DRM, 57, DRM, 22)
        if cho == 'line':
            for ch, line in zip(CHO_B[0], CHOIR_LINE):
                p.line(ch, line, CHO, 32, pan=0x50 if ch == CHO_B[0][0] else 0xB0)
            for ch in CHO_B[1]:
                p.put(0, ch, OFF)
        elif cho is None:
            for ch in CHO_B[0] + CHO_B[1]:
                p.put(0, ch, OFF)
        if mel:
            p.line(CH_REC, MEL[mel], REC, 40, pan=0x70, echo=[(CH_ECHO, 3, 13, 0xC0)])
        if i_pat == 0:
            p.put(0, CH_WND, 60, WND, 22)
        if i_pat in (0, 5):
            p.put(0, CH_GUR[0], 'A2', GUR, 20, 0x60)
            p.put(0, CH_GUR[1], 'E3', GUR, 14, 0xA0)
        if i_pat == 4:
            p.put(0, CH_GUR[0], OFF)
            p.put(0, CH_GUR[1], OFF)
        if bell:
            p.put(0, CH_BEL, 'A2', BEL, 30, 0x90)
        drips(p, CH_DRP, DRP, rng)
    s.write(path, 'The forgotten crypt', 'make_dungeon.py')


# ---------------------------------------------------------------- 2. les catacombes

def catacombs(path):
    s = Song(14, 6, 50)
    ORG = s.ins('Muffled organ', organ(), env=[(0, 0), (1.5, 64), (3, 56)], sustain=2, fade=4.0)
    CHM = s.ins('Monks', choir('oh', octave=1, distant=False), env=[(0, 0), (0.25, 64), (1.5, 56)],
                sustain=2, fade=1.0, vib=(0, 40, 3, 5))
    DRN = s.ins('Drone', wrap(make_drone()), env=[(0, 0), (1.0, 64)], sustain=1, fade=4.0)
    BEL = s.ins('Bell', big_bell())
    DRP = s.ins('Drip', drip())
    WSP = s.ins('Whispers', whisper())
    WND = s.ins('Wind', wind())

    ORG_B = ((0, 1, 2), (3, 4, 5))
    CH_DRN, CH_CHANT, CH_ORGANUM, CH_ECHO, CH_BEL, CH_DRP, CH_WSP, CH_WND = range(6, 14)

    VOICING = {'Dm': ['D3', 'F3', 'A3'], 'Eb': ['Eb3', 'G3', 'Bb3'], 'Gm': ['D3', 'G3', 'Bb3'],
               'Cm': ['C3', 'Eb3', 'G3'], 'Bb': ['D3', 'F3', 'Bb3'], 'Adim': ['C3', 'Eb3', 'A3']}
    CHANT = {
        1: 'D3:4 Eb3:4 F3:8 | G3:4 F3:4 Eb3:4 F3:4 | G3:6 A3:2 Bb3:4 A3:4 | G3:4 F3:4 Eb3:4 D3:4',
        2: 'A3:8 Bb3:4 A3:4 | G3:4 A3:4 G3:4 F3:4 | Eb3:8 F3:4 G3:4 | F3:4 Eb3:4 D3:8',
        3: 'D4:6 C4:2 Bb3:4 A3:4 | Bb3:8 G3:4 A3:4 | Bb3:4 C4:4 Bb3:4 G3:4 | A3:12 -:4',
        4: 'D3:4 Eb3:4 F3:8 | G3:4 F3:4 Eb3:4 F3:4 | Eb3:8 D3:4 Eb3:4 | D3:12 -:4',
    }
    SONG = [
        # accords                         chant, cloche, chuchotements
        (['Dm', 'Dm', 'Eb', 'Dm'],        None,  True,   [40]),
        (['Dm', 'Dm', 'Eb', 'Dm'],        1,     False,  []),
        (['Gm', 'Eb', 'Cm', 'Dm'],        2,     False,  []),
        (['Gm', 'Eb', 'Adim', 'Dm'],      None,  True,   [8, 36]),
        (['Dm', 'Bb', 'Eb', 'Cm'],        3,     False,  []),
        (['Dm', 'Dm', 'Eb', 'Dm'],        4,     True,   [52]),
    ]
    rng = np.random.default_rng(202)
    for i_pat, (chords, chant, bell, wsp) in enumerate(SONG):
        p = s.new()
        for bar, c in enumerate(chords):
            if bar > 0 and c == chords[bar - 1]:
                continue                 # même accord : on le laisse tenir
            s.pad(p, bar * 16, VOICING[c], ORG, 20, ORG_B)
        if chant:
            line = CHANT[chant]
            p.line(CH_CHANT, line, CHM, 44, pan=0x78, echo=[(CH_ECHO, 4, 16, 0xC8)])
            p.line(CH_ORGANUM, transpose(line, -5), CHM, 30, pan=0x58)
        else:
            for ch in (CH_CHANT, CH_ORGANUM, CH_ECHO):
                p.put(0, ch, OFF)
        if i_pat == 0:
            p.put(0, CH_DRN, 'D2', DRN, 26)
            p.put(0, CH_WND, 60, WND, 18)
        if bell:
            p.put(0, CH_BEL, 'D2', BEL, 28, 0x70)
        for k, r in enumerate(wsp):
            p.put(r, CH_WSP, 60, WSP, 18, 0x30 if k % 2 == 0 else 0xD0)
        drips(p, CH_DRP, DRP, rng)
    s.write(path, 'The catacombs', 'make_dungeon.py')


# ---------------------------------------------------------------- 3. les salles des rois

def halls(path):
    s = Song(20, 6, 72)
    STR = s.ins('Strings', strings(), env=ENV_PAD, sustain=2, fade=3.0)
    DUL = s.ins('Dulcimer', pluck('dulcimer'))
    HRN = s.ins('Horn', horn(), env=[(0, 0), (0.15, 64), (1.0, 54)], sustain=2, fade=1.0,
                vib=(0, 50, 3, 5))
    CHO = s.ins('Distant choir', choir('ah'), env=ENV_VOICE, sustain=2, fade=3.0, vib=(0, 60, 4, 5))
    WAR = s.ins('War drum', drum('war'))
    BEL = s.ins('Bell', big_bell())
    WND = s.ins('Wind', wind())
    DRP = s.ins('Drip', drip())

    STR_B = ((0, 1, 2), (3, 4, 5))
    CHO_B = ((10, 11), (12, 13))
    BASS_B = ((17,), (18,))
    CH_DUL, CH_HRN, CH_ECHO, CH_WAR, CH_BEL, CH_WND, CH_DRP = (6, 7), 8, 9, 14, 15, 16, 19

    VOICING = {'Cm': ['G3', 'C4', 'Eb4'], 'Ab': ['Ab3', 'C4', 'Eb4'], 'Bb': ['F3', 'Bb3', 'D4'],
               'G': ['G3', 'B3', 'D4'], 'Fm': ['F3', 'Ab3', 'C4']}
    CHOIR = {'Cm': ['G4', 'Eb5'], 'Ab': ['Ab4', 'C5'], 'Bb': ['F4', 'D5'], 'G': ['G4', 'D5'],
             'Fm': ['F4', 'C5']}
    ROOT = {'Cm': 60, 'Ab': 56, 'Bb': 58, 'G': 55, 'Fm': 53}
    MEL = {
        'A': 'G4:8 Eb4:4 G4:4 | C5:8 Bb4:4 Ab4:4 | Bb4:6 Ab4:2 G4:4 F4:4 | G4:12 -:4',
        'B': 'Ab4:8 C5:4 F5:4 | Eb5:8 D5:4 C5:4 | C5:6 Bb4:2 Ab4:4 Eb4:4 | D4:8 B3:4 D4:4',
        'A2': 'Eb5:8 C5:4 Ab4:4 | F5:8 D5:4 Bb4:4 | G5:6 F5:2 Eb5:4 D5:4 | C5:12 -:4',
        'END': 'C5:8 Ab4:4 F4:4 | G4:6 B4:2 D5:8 | C5:16 | -:16',
    }
    SONG = [
        # accords                     cor,   chœur, tambour, basse
        (['Cm', 'Ab', 'Bb', 'Cm'],    None,  False, False,   False),
        (['Cm', 'Ab', 'Bb', 'Cm'],    None,  False, True,    True),
        (['Cm', 'Ab', 'Bb', 'G'],     'A',   False, True,    True),
        (['Fm', 'Cm', 'Ab', 'G'],     'B',   False, True,    True),
        (['Ab', 'Bb', 'Cm', 'Cm'],    'A2',  True,  True,    True),
        (['Fm', 'Ab', 'Bb', 'G'],     None,  True,  False,   True),
        (['Cm', 'Ab', 'Bb', 'Cm'],    'A',   True,  True,    True),
        (['Fm', 'G', 'Cm', 'Cm'],     'END', True,  False,   True),
    ]
    rng = np.random.default_rng(303)
    for i_pat, (chords, mel, cho, war, bass) in enumerate(SONG):
        p = s.new()
        for bar, c in enumerate(chords):
            r0 = bar * 16
            s.pad(p, r0, VOICING[c], STR, 20, STR_B)
            if cho:
                s.pad(p, r0, CHOIR[c], CHO, 22, CHO_B, pans=(0x40, 0xC0))
            if bass:
                s.pad(p, r0, [ROOT[c] - 24], STR, 30, BASS_B, pans=(0x80,))
            # ostinato de tympanon en croches
            th = THIRD[quality(c)]
            steps = [0, 7, 12, 7, 12 + th, 12, 7, 12]
            p.arp(r0, CH_DUL, [ROOT[c] + st for st in steps], DUL, 22, step=2,
                  pans=(0x60, 0xA0), accent=30)
            if war:
                p.put(r0, CH_WAR, 60, WAR, 44)
                p.put(r0 + 8, CH_WAR, 60, WAR, 26)
                if bar == 3:
                    p.put(r0 + 12, CH_WAR, 60, WAR, 22)
                    p.put(r0 + 14, CH_WAR, 60, WAR, 30)
        if not cho:
            for ch in CHO_B[0] + CHO_B[1]:
                p.put(0, ch, OFF)
        if not bass:
            for ch in BASS_B[0] + BASS_B[1]:
                p.put(0, ch, OFF)
        if mel:
            p.line(CH_HRN, MEL[mel], HRN, 38, pan=0x70, echo=[(CH_ECHO, 3, 12, 0xC0)])
        if i_pat == 0:
            p.put(0, CH_WND, 60, WND, 16)
        if i_pat in (0, 4, 7):
            p.put(0, CH_BEL, 'C3', BEL, 24, 0x90)
        drips(p, CH_DRP, DRP, rng, (0, 2))
    s.write(path, 'Halls of the old kings', 'make_dungeon.py')


# ---------------------------------------------------------------- 4. l'ossuaire

def ossuary(path):
    s = Song(16, 6, 48)
    DRN = s.ins('Drone', wrap(make_drone()), env=[(0, 0), (1.5, 64)], sustain=1, fade=5.0)
    CLU = s.ins('Ghost choir', wrap(make_choir()), env=[(0, 0), (2.0, 64), (4, 50)], sustain=2,
                fade=4.0, vib=(0, 80, 6, 4))
    VOX = s.ins('Lost voice', choir('ah'), env=ENV_VOICE, sustain=2, fade=2.5, vib=(0, 60, 5, 5))
    RAT = s.ins('Bones', rattle())
    WSP = s.ins('Whispers', whisper())
    BEL = s.ins('Bell', big_bell())
    HRT = s.ins('Heartbeat', wrap(make_heartbeat()))
    DRP = s.ins('Drip', drip())
    WND = s.ins('Wind', wind())

    CLU_B = ((2, 3, 4), (5, 6, 7))
    CH_DRN, CH_DRN2, CH_VOX, CH_ECHO, CH_RAT, CH_WSP, CH_BEL, CH_HRT, CH_DRP, CH_WND = (
        0, 1, 8, 9, 10, 11, 12, 13, 14, 15)

    CLUSTER = {1: ['B3', 'C4', 'F4'], 2: ['A3', 'C4', 'D4'], 3: ['G3', 'C4', 'F4'],
               4: ['B3', 'D4', 'F4'], 5: ['Bb3', 'B3', 'E4']}
    VOICE = {
        1: 'F4:16 | E4:12 D4:4 | C4:16 | B3:12 -:4',
        2: 'D5:8 C5:8 | B4:16 | F4:16 | -:16',
        3: '-:32 C5:8 B4:8 | -:16',
    }
    SONG = [
        # grappes,       voix, os,          cœur (mesures), chuchot., cloche
        ([1, None, 4, None], None, [],           [],           [],       0),
        ([1, 2, 4, 1],   None, [10, 42],      [2, 3],       [],       None),
        ([1, 3, 2, 4],   1,    [26],          [],           [],       None),
        ([4, 5, 4, 1],   2,    [6, 50],       [0, 1, 2, 3], [20, 44], None),
        ([None] * 4,     3,    [14, 30, 58],  [],           [],       32),
        ([1, 2, 3, 4],   1,    [38],          [2, 3],       [56],     None),
    ]
    rng = np.random.default_rng(404)
    for i_pat, (clusters, voice, bones, hearts, wsp, bell) in enumerate(SONG):
        p = s.new()
        if all(c is None for c in clusters):
            for ch in CLU_B[0] + CLU_B[1]:
                p.put(0, ch, OFF)
        for bar, c in enumerate(clusters):
            r0 = bar * 16
            if c is not None:
                s.pad(p, r0, CLUSTER[c], CLU, 20, CLU_B, pans=(0x30, 0x80, 0xD0))
            if bar in hearts:
                for r in (0, 4, 8, 12):
                    p.put(r0 + r, CH_HRT, 60, HRT, 26)
        if voice:
            p.line(CH_VOX, VOICE[voice], VOX, 30, pan=0x60, echo=[(CH_ECHO, 4, 12, 0xC0)])
        else:
            p.put(0, CH_VOX, OFF)
        for k, r in enumerate(bones):
            p.put(r, CH_RAT, int(rng.choice([55, 60, 62])), RAT, 22, 0x30 if k % 2 == 0 else 0xD0)
        for k, r in enumerate(wsp):
            p.put(r, CH_WSP, 60, WSP, 16, 0xC0 if k % 2 == 0 else 0x40)
        if bell is not None:
            p.put(bell, CH_BEL, 'B1', BEL, 26, 0x80)
        if i_pat == 0:
            p.put(0, CH_DRN, 'B1', DRN, 30)
            p.put(0, CH_DRN2, 'F2', DRN, 12)
            p.put(0, CH_WND, 60, WND, 20)
        drips(p, CH_DRP, DRP, rng)
    s.write(path, 'The ossuary', 'make_dungeon.py')


TRACKS = {'1': (crypt, 'dungeon_crypt.xm'), '2': (catacombs, 'dungeon_catacombs.xm'),
          '3': (halls, 'dungeon_halls.xm'), '4': (ossuary, 'dungeon_ossuary.xm')}

if __name__ == '__main__':
    for key in sys.argv[1:] or sorted(TRACKS):
        fn, path = TRACKS[key]
        fn(path)
