#!/usr/bin/env python3
"""
Combat contre le sorcier (XM, OpenMPT) : morceau rapide.

Mi mineur harmonique, avec le fa du phrygien au refrain ; 160 bpm (une
ligne = une double-croche), 13 motifs : 1 min 18 s. En boucle, le morceau
reprend au premier couplet (position de reprise 2), sans l'introduction.

Orgue du sorcier et chœur, basse FM au galop, ostinato de cordes, chalemie
en tête, cuivres en accents, batterie (grosse caisse, caisse claire,
charleston, toms, cymbale).

Usage : python3 make_boss.py [fichier.xm]   (défaut : boss_warlock.xm)
"""
import sys

from xm_kit import (ENV_STAB, ENV_STAC, OFF, Song, big_bell, choir, drum, fm_bass, horn, organ,
                    shawm, strings)


def build(path):
    s = Song(24, 6, 160)
    KCK = s.ins('Kick', drum('kick'))
    SNR = s.ins('Snare', drum('snare'))
    HAT = s.ins('Hi-hat', drum('hat'))
    TOM = s.ins('Tom', drum('tom'))
    CRS = s.ins('Crash', drum('crash'))
    BAS = s.ins('FM bass', fm_bass())
    STA = s.ins('Staccato strings', strings(), env=ENV_STAC)
    ORG = s.ins('Warlock organ', organ(), env=[(0, 0), (0.3, 64), (1.5, 56)], sustain=2, fade=1.0)
    CHO = s.ins('Choir', choir('ah', distant=False), env=[(0, 0), (0.4, 64), (2, 54)], sustain=2,
                fade=1.2, vib=(0, 50, 4, 5))
    LED = s.ins('Shawm', shawm(), env=[(0, 0), (0.03, 64), (0.6, 52)], sustain=2, fade=0.4,
                vib=(0, 30, 3, 7))
    BRS = s.ins('Brass', horn(), env=ENV_STAB)
    BEL = s.ins('Bell', big_bell())

    CH_KCK, CH_SNR, CH_HAT, CH_TOM, CH_CRS, CH_BAS = range(6)
    CH_STA = (6, 7)
    ORG_B = ((8, 9, 10), (11, 12, 13))
    CHO_B = ((14, 15), (16, 17))
    CH_LED, CH_LED_E = 18, 19
    CH_BRS = (20, 21)
    CH_BEL = 22

    ORGAN = {'Em': ['E3', 'G3', 'B3'], 'F': ['F3', 'A3', 'C4'], 'C': ['E3', 'G3', 'C4'],
             'Am': ['E3', 'A3', 'C4'], 'B': ['D#3', 'F#3', 'B3']}
    CHOIR = {'Em': ['G4', 'B4'], 'F': ['A4', 'C5'], 'C': ['G4', 'C5'], 'Am': ['A4', 'C5'],
             'B': ['F#4', 'B4']}
    BASS = {'Em': 'E2', 'F': 'F2', 'C': 'C2', 'Am': 'A1', 'B': 'B1'}
    OST = {'Em': 64, 'F': 65, 'C': 60, 'Am': 57, 'B': 59}
    STAB = {'Em': ['E4', 'B4'], 'F': ['F4', 'C5'], 'C': ['C4', 'G4'], 'Am': ['A3', 'E4'],
            'B': ['B3', 'F#4']}
    THIRD = {'Em': 3, 'Am': 3}
    LEAD = {
        'L1': 'E5:4 G5:4 B5:4 G5:4 | C6:6 B5:2 A5:4 G5:4 | A5:4 C6:4 E5:4 A5:4 | F#5:8 D#5:8',
        'L2': 'B5:2 A5:2 G5:2 F#5:2 E5:4 B4:4 | C5:4 E5:4 G5:4 C6:4 | B5:4 A5:4 G5:4 E5:4 | D#5:4 F#5:4 A5:4 B5:4',
        'L3': 'E6:8 D6:4 B5:4 | C6:8 A5:4 F5:4 | G5:4 B5:4 E6:4 G6:4 | F6:12 E6:4',
        'L4': 'G6:4 E6:4 C6:4 G5:4 | A5:4 C6:4 E6:4 A5:4 | B5:8 D#6:8 | F#6:8 B5:4 D#5:4',
    }
    SONG = [
        ('intro1', ['Em', 'Em', 'F', 'F'], None),
        ('intro2', ['Em', 'F', 'Em', 'B'], None),
        ('verse', ['Em', 'C', 'Am', 'B'], None),        # <- reprise de la boucle
        ('verse', ['Em', 'C', 'Am', 'B'], 'L1'),
        ('verse', ['Em', 'C', 'Am', 'B'], 'L2'),
        ('chorus', ['Em', 'F', 'Em', 'F'], 'L3'),
        ('chorus', ['C', 'Am', 'B', 'B'], 'L4'),
        ('break', ['Am', 'F', 'Em', 'B'], None),
        ('build', ['Am', 'F', 'B', 'B'], None),
        ('verse', ['Em', 'C', 'Am', 'B'], 'L1'),
        ('verse', ['Em', 'C', 'Am', 'B'], 'L2'),
        ('chorus', ['Em', 'F', 'Em', 'F'], 'L3'),
        ('chorus', ['C', 'Am', 'B', 'B'], 'L4'),
    ]
    prev = None
    for i_pat, (sec, chords, lead) in enumerate(SONG):
        p = s.new()
        drums = sec in ('verse', 'chorus', 'build')
        for bar, c in enumerate(chords):
            r0 = bar * 16
            # orgue et chœur : on ne relance pas un accord qui se répète
            if bar == 0 or c != chords[bar - 1]:
                s.pad(p, r0, ORGAN[c], ORG, 30 if sec.startswith('intro') or sec == 'break' else 20,
                      ORG_B)
                if sec in ('intro1', 'intro2', 'chorus', 'break'):
                    s.pad(p, r0, CHOIR[c], CHO, 30, CHO_B, pans=(0x50, 0xB0))
            # basse
            if sec in ('verse', 'chorus', 'build'):
                for r in (0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15):
                    p.put(r0 + r, CH_BAS, BASS[c], BAS, 50 if r % 4 == 0 else 36)
            elif sec in ('intro2', 'break'):
                p.put(r0, CH_BAS, BASS[c], BAS, 52)
                p.put(r0 + 8, CH_BAS, BASS[c], BAS, 40)
            # ostinato de cordes
            if sec in ('verse', 'chorus', 'build'):
                th = THIRD.get(c, 4)
                steps = [0, 7, 12, 7, 0, 7, 12, 12 + th]
                p.arp(r0, CH_STA, [OST[c] + st for st in steps], STA, 22, step=2,
                      pans=(0x58, 0xA8), accent=30)
            # batterie
            if drums and sec != 'build':
                kicks = (0, 3, 8, 11) if sec == 'chorus' else (0, 6, 8)
                for r in kicks:
                    p.put(r0 + r, CH_KCK, 60, KCK, 54)
                for r in (4, 12):
                    p.put(r0 + r, CH_SNR, 60, SNR, 44)
                step = 1 if sec == 'chorus' else 2
                for r in range(0, 16, step):
                    p.put(r0 + r, CH_HAT, 60, HAT, 20 if r % 4 == 2 else 12)
            elif sec == 'build':
                p.put(r0, CH_KCK, 60, KCK, 54)
                p.put(r0 + 8, CH_KCK, 60, KCK, 50)
                step = (4, 2, 1, 1)[bar]
                for r in range(0, 16, step):
                    p.put(r0 + r, CH_SNR, 60, SNR, 24 + 6 * bar + (r if bar >= 2 else 0))
            elif sec == 'break':
                p.put(r0, CH_KCK, 60, KCK, 50)
                if bar % 2 == 1:
                    for r, n in ((8, 'D4'), (10, 'C4'), (12, 'A3'), (14, 'G3')):
                        p.put(r0 + r, CH_TOM, n, TOM, 40)
            elif sec == 'intro1' and bar == 3:
                for r, n in ((8, 'D4'), (10, 'C4'), (12, 'A3'), (13, 'A3'), (14, 'G3'), (15, 'G3')):
                    p.put(r0 + r, CH_TOM, n, TOM, 40)
            elif sec == 'intro2':
                p.put(r0, CH_KCK, 60, KCK, 44)
                p.put(r0 + 8, CH_KCK, 60, KCK, 36)
                if bar == 3:
                    for r in range(8, 16):
                        p.put(r0 + r, CH_SNR, 60, SNR, 20 + 3 * (r - 8))
            # cuivres en accents au refrain
            if sec == 'chorus':
                for r, v in ((0, 40), (6, 30), (10, 34)):
                    for ch, n in zip(CH_BRS, STAB[c]):
                        p.put(r0 + r, ch, n, BRS, v, 0x60 if ch == CH_BRS[0] else 0xA0)
        if sec not in ('intro1', 'intro2', 'chorus', 'break'):
            for ch in CHO_B[0] + CHO_B[1]:
                p.put(0, ch, OFF)
        if sec in ('intro1', 'intro2', 'break'):
            p.put(0, CH_STA[0], OFF)
            p.put(0, CH_STA[1], OFF)
        if lead:
            p.line(CH_LED, LEAD[lead], LED, 40, pan=0x78, echo=[(CH_LED_E, 3, 12, 0xC0)])
        else:
            p.put(0, CH_LED, OFF)
            p.put(0, CH_LED_E, OFF)
        # cymbale au début des sections
        if sec != prev and sec in ('verse', 'chorus') or (sec == 'verse' and lead == 'L1'):
            p.put(0, CH_CRS, 60, CRS, 30, 0xA0)
        if sec == 'intro1' or (sec == 'break'):
            p.put(0, CH_BEL, 'E2', BEL, 36, 0x80)
        prev = sec
    s.write(path, 'The warlock', 'make_boss.py', restart=2)


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'boss_warlock.xm')
