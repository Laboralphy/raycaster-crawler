#!/usr/bin/env python3
"""
Musique de la forêt, version nuit et inquiétante, au format XM (OpenMPT).
Réutilise la synthèse et l'écriture du fichier de make_forest.py.

Mi phrygien (fa contre mi), avec des accords chromatiques (do mineur, si
bémol), 60 bpm (vitesse 6, BPM tracker 60 : une ligne = 0,25 s), 6 motifs
de 64 lignes (4 mesures de 16 doubles-croches) : 1 min 36 s, en boucle.

Bourdon grave tenu, nappes sombres, boîte à musique désaccordée (une copie
légèrement fausse la suit), chœur fantôme, grillons, vent, chouette, loup au
loin, battements de cœur.

Usage : python3 make_forest_night.py [fichier.xm]   (défaut : forest_night.xm)
"""
import sys

import numpy as np

from make_forest import (F_C4, F_LOOP, KEY_OFF, PERIOD, SR, crossfade_loop, fm, instrument,
                         looped, lowpass, make_wind, midi, normalize, t_axis, write_xm, xm_note)

SPEED = 6
BPM = 60
ROWS = 64
BAR = 16
CHANNELS = 18

rng = np.random.default_rng(666)


# ---------------------------------------------------------------- synthèse

def make_dark_pad():
    def render(t, ph):
        lfo = np.sin(2 * np.pi * ph)
        lfo2 = np.sin(6 * np.pi * ph + 2.0)
        a = fm(F_LOOP, t, 1, 0.55 + 0.25 * lfo)
        b = 0.2 * fm(2 * F_LOOP, t, 1, 0.3 + 0.2 * lfo2)
        return a + b
    x, n_att, n_loop = looped(80, 780, render)
    # passe-bas : son étouffé ; le régime établi reste périodique
    return normalize(lowpass(x, 0.12)), n_att, n_loop


def make_drone():
    def render(t, ph):
        lfo = np.sin(2 * np.pi * ph)
        return fm(F_LOOP, t, 1, 1.3 + 0.5 * lfo) + 0.3 * fm(3 * F_LOOP, t, 1, 0.4 * (1 - lfo))
    x, n_att, n_loop = looped(20, 1040, render)
    return normalize(lowpass(x, 0.2)), n_att, n_loop


def make_music_box():
    """Lame de boîte à musique : partiel inharmonique aigu qui s'éteint vite."""
    n = int(1.8 * SR)
    t = t_axis(n)
    index = 2.2 * np.exp(-t / 0.05)
    x = fm(F_C4, t, 5.0, index) + 0.18 * np.sin(2 * np.pi * F_C4 * 2.76 * t) * np.exp(-t / 0.3)
    env = np.exp(-t / 0.55) * np.minimum(1, t / 0.0015)
    return normalize(x * env)


def make_choir():
    """« Ou » : harmoniques pondérées par deux formants qui ondulent."""
    def render(t, ph):
        x = np.zeros_like(t)
        lfo = np.sin(2 * np.pi * ph)
        for k in range(1, 24):
            f = k * F_LOOP
            g = (np.exp(-((f - (330 + 40 * lfo)) / 120) ** 2)
                 + 0.5 * np.exp(-((f - (780 - 60 * lfo)) / 180) ** 2)
                 + 0.04 / k)
            x += g * np.sin(2 * np.pi * f * t + k * 1.7)
        return x
    x, n_att, n_loop = looped(40, 520, render)
    # un peu de souffle
    breath = lowpass(rng.standard_normal(len(x)), 0.08)
    x = normalize(x) + 0.05 * normalize(breath)
    x[n_att:] = crossfade_loop(x, n_att, PERIOD * 40)[n_att:]
    return normalize(x), n_att, n_loop


def make_crickets():
    """Trains de stridulations à 4,6 kHz ; la boucle commence et finit dans le silence."""
    n = int(1.6 * SR)
    t = t_axis(n)
    tone = np.sin(2 * np.pi * 4600 * t) + 0.3 * np.sin(2 * np.pi * 9200 * t)
    gate = np.zeros(n)
    for start in (0.05, 0.62, 0.95):
        for p in range(4):
            a = int((start + p * 0.028) * SR)
            b = a + int(0.016 * SR)
            gate[a:b] = np.sin(np.linspace(0, np.pi, b - a))
    return normalize(tone * gate, 0.7)


def make_owl():
    """« Hou... hou-hou » : sinus doux qui glisse vers le grave."""
    hoots = [(0.0, 0.5), (0.85, 0.28), (1.2, 0.45)]
    n = int(1.8 * SR)
    x = np.zeros(n)
    for start, length in hoots:
        m = int(length * SR)
        t = t_axis(m)
        u = t / t[-1]
        f = 390 - 45 * u
        phase = 2 * np.pi * np.cumsum(f) / SR
        env = np.sin(np.pi * u) ** 1.5
        a = int(start * SR)
        x[a:a + m] += (np.sin(phase) + 0.15 * np.sin(2 * phase)) * env
    x += 0.03 * lowpass(rng.standard_normal(n), 0.1) * (np.abs(x) > 0.05)
    return normalize(lowpass(x, 0.3))


def make_howl():
    """Hurlement lointain : glissando montant puis tombant, vibrato, voilé."""
    n = int(3.4 * SR)
    t = t_axis(n)
    u = t / t[-1]
    f = 330 + 300 * np.sin(np.pi * np.minimum(1, u * 1.6)) ** 0.7 * (1 - 0.35 * u)
    f *= 1 + 0.012 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.8)
    phase = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(phase) + 0.45 * np.sin(2 * phase) + 0.2 * np.sin(3 * phase)
    env = np.minimum(1, t / 0.35) * np.minimum(1, (t[-1] - t) / 1.2)
    return normalize(lowpass(x * env, 0.08))


def make_heartbeat():
    """Deux coups sourds (« boum-boum »)."""
    n = int(0.9 * SR)
    x = np.zeros(n)
    for start, amp in ((0.0, 1.0), (0.24, 0.7)):
        m = int(0.22 * SR)
        t = t_axis(m)
        f = 38 + 30 * np.exp(-t / 0.03)
        phase = 2 * np.pi * np.cumsum(f) / SR
        a = int(start * SR)
        x[a:a + m] += amp * np.sin(phase) * np.exp(-t / 0.06) * np.minimum(1, t / 0.003)
    return normalize(x)


# ---------------------------------------------------------------- partition

PAD, DRONE, MBOX, MBOX_OFF, CHOIR, CRICKETS, WIND, OWL, HOWL, HEART = range(1, 11)

CH_PAD_A = (0, 1, 2)
CH_PAD_B = (3, 4, 5)
CH_DRONE = 6
CH_MBOX = 7
CH_MBOX_ECHO = 8
CH_CHOIR = (9, 10)
CH_CRICKETS = (11, 12)
CH_WIND = 13
CH_OWL = 14
CH_HOWL = 15
CH_HEART = 16

CHORDS = {
    'Em': ['E3', 'G3', 'B3'], 'F': ['F3', 'A3', 'C4'], 'Cm': ['Eb3', 'G3', 'C4'],
    'Am': ['E3', 'A3', 'C4'], 'B': ['D#3', 'F#3', 'B3'], 'Dm': ['D3', 'F3', 'A3'],
    'Bb': ['D3', 'F3', 'Bb3'],
}

# accords, boîte à musique, chœur, battements de cœur (mesures), chouette, loup
SONG = [
    (['Em', 'Em', 'F', 'Em'], None, None, [], [36], None),       # intro : la nuit
    (['Em', 'F', 'Em', 'Cm'], 'A', None, [], [], None),
    (['Em', 'Cm', 'Am', 'B'], 'B', None, [2, 3], [], None),
    (['Em', 'F', 'Dm', 'Bb'], None, 'C', [0, 1, 2, 3], [], None),  # chœur
    (['Am', 'Cm', 'Em', 'F'], 'D', None, [0], [], 24),             # le loup
    (['Em', 'F', 'Em', 'Em'], 'E', None, [], [20, 52], None),      # retour au début
]

# (note, durée en lignes), None = silence
MBOX_MELODIES = {
    'A': [('E6', 4), ('B5', 4), ('G5', 4), ('B5', 4),
          ('C6', 4), ('A5', 4), ('F5', 4), ('A5', 4),
          ('B5', 4), ('G5', 4), ('E5', 4), ('D#5', 4),
          ('Eb5', 8), ('G5', 4), ('C5', 4)],
    'B': [('G5', 6), ('F#5', 2), ('E5', 8),
          ('Eb5', 6), ('D5', 2), ('C5', 8),
          ('C5', 4), ('E5', 4), ('A5', 4), ('G5', 4),
          ('F#5', 8), ('D#5', 8)],
    'D': [('A5', 4), ('C6', 4), ('E6', 4), ('C6', 4),
          ('Eb6', 4), ('C6', 4), ('G5', 4), ('Eb5', 4),
          ('E5', 4), ('G5', 4), ('B5', 4), ('E6', 4),
          ('F6', 8), ('E6', 8)],
    'E': [('E6', 4), ('B5', 4), ('G5', 8),
          ('F5', 8), (None, 8),
          ('E5', 8), (None, 8),
          (None, 16)],
}

CHOIR_LINES = {
    'C': ([('B4', 16), ('C5', 16), ('A4', 16), ('Bb4', 8), ('A4', 8)],
          [('E4', 16), ('F4', 16), ('F4', 16), ('F4', 8), ('E4', 8)]),
}


def new_pattern():
    return [[None] * CHANNELS for _ in range(ROWS)]


def put(pat, row, ch, note=None, ins=None, vol=None, fx=0, fxp=0):
    if 0 <= row < ROWS:
        pat[row][ch] = (note, ins, vol, fx, fxp)


def write_line(pat, ch, line, ins, vol, delay=0):
    row = delay
    for name, length in line:
        if name is not None:
            put(pat, row, ch, xm_note(midi(name)), ins, vol)
        row += length


def build_patterns():
    patterns = []
    for i_pat, (chords, mbox, choir, hearts, owls, howl) in enumerate(SONG):
        pat = new_pattern()
        for bar, chord in enumerate(chords):
            r0 = bar * BAR
            on, off = (CH_PAD_A, CH_PAD_B) if (i_pat * 4 + bar) % 2 == 0 else (CH_PAD_B, CH_PAD_A)
            for k, (ch_on, ch_off) in enumerate(zip(on, off)):
                pan = (0x50, 0x80, 0xB0)[k]
                put(pat, r0, ch_on, xm_note(midi(CHORDS[chord][k])), PAD, 0x10 + 16, 0x08, pan)
                put(pat, r0, ch_off, KEY_OFF)
            if bar in hearts:
                for r in (0, 4, 8, 12):
                    put(pat, r0 + r, CH_HEART, xm_note(60), HEART, 0x10 + 30)
        if mbox:
            write_line(pat, CH_MBOX, MBOX_MELODIES[mbox], MBOX, 0x10 + 60)
            # la copie fausse, un peu après, de l'autre côté
            write_line(pat, CH_MBOX_ECHO, MBOX_MELODIES[mbox], MBOX_OFF, 0x10 + 28, delay=2)
        if choir:
            for ch, line in zip(CH_CHOIR, CHOIR_LINES[choir]):
                write_line(pat, ch, line, CHOIR, 0x10 + 44)
        else:
            for ch in CH_CHOIR:
                put(pat, 0, ch, KEY_OFF)
        if i_pat == 0:
            # sons tenus pendant tout le morceau
            put(pat, 0, CH_DRONE, xm_note(midi('E2')), DRONE, 0x10 + 30)
            put(pat, 0, CH_WIND, xm_note(midi('C4')), WIND, 0x10 + 24)
            put(pat, 0, CH_CRICKETS[0], xm_note(60), CRICKETS, 0x10 + 14, 0x08, 0x40)
            # second grillon : un peu plus grave, décalé dans l'échantillon (9xx)
            put(pat, 0, CH_CRICKETS[1], xm_note(58), CRICKETS, 0x10 + 11, 0x09, 0x50)
        for k, r in enumerate(owls):
            put(pat, r, CH_OWL, xm_note(60), OWL, 0x10 + 26, 0x08, 0x30 if k % 2 == 0 else 0xD0)
        if howl is not None:
            put(pat, howl, CH_HOWL, xm_note(60), HOWL, 0x10 + 28, 0x08, 0x38)
        patterns.append(pat)
    return patterns


def build_instruments():
    pad, pad_att, pad_loop = make_dark_pad()
    drone, dr_att, dr_loop = make_drone()
    choir, ch_att, ch_loop = make_choir()
    wind, w_start, w_len = make_wind()
    crickets = make_crickets()
    mbox = make_music_box()
    return [
        instrument('Dark pad', pad, (pad_att, pad_loop), 64, 128,
                   [(0, 0), (36, 64), (80, 52)], sustain=2, fadeout=500),
        instrument('Drone', drone, (dr_att, dr_loop), 64, 128,
                   [(0, 0), (4, 64)], sustain=1),
        instrument('Music box', mbox, None, 64, 96),
        # même lame, fausse d'un sixième de demi-ton, à droite
        instrument('Music box (out of tune)', mbox, None, 64, 176, finetune=22),
        instrument('Ghost choir', choir, (ch_att, ch_loop), 64, 128,
                   [(0, 0), (24, 64), (60, 50)], sustain=2, fadeout=400, vib=(0, 80, 6, 4)),
        instrument('Crickets', crickets, (0, len(crickets)), 64, 128),
        instrument('Night wind', wind, (w_start, w_len), 64, 128),
        instrument('Owl', make_owl(), None, 64, 128),
        instrument('Distant wolf', make_howl(), None, 64, 128),
        instrument('Heartbeat', make_heartbeat(), None, 64, 128),
    ]


if __name__ == '__main__':
    write_xm(sys.argv[1] if len(sys.argv) > 1 else 'forest_night.xm', 'Forest at night',
             'make_forest_night.py', build_patterns(), build_instruments(), CHANNELS, SPEED, BPM)
