#!/usr/bin/env python3
"""
Musique d'ambiance de la forêt, au format FastTracker 2 (.xm), ouvrable dans
OpenMPT. Instruments synthétisés (FM, bruit filtré), partition écrite ici.

Ré dorien, 80 bpm (vitesse 6, BPM tracker 80 : une ligne = 0,1875 s),
8 motifs de 64 lignes (4 mesures de 16 doubles-croches) : 1 min 36 s,
la fin enchaîne sur le début (boucle).

Usage : python3 make_forest.py [fichier.xm]   (défaut : forest_ambience.xm)
"""
import struct
import sys

import numpy as np

SR = 8363 * 4          # fréquence des échantillons : joués tels quels sur un C-4
REL_NOTE = 24          # ... grâce à une note relative de +24 demi-tons
PERIOD = 128           # sons bouclés : une période = 128 échantillons
F_LOOP = SR / PERIOD   # 261,34 Hz, à 2 cents du do4
F_C4 = 261.6256
TICKS_PER_ROW = 6
BPM = 80
ROWS = 64
BAR = 16
CHANNELS = 16

rng = np.random.default_rng(1234)


# ---------------------------------------------------------------- synthèse

def t_axis(n):
    return np.arange(n) / SR


def fm(f, t, ratio, index):
    """Porteuse sinusoïdale modulée en fréquence (index scalaire ou tableau)."""
    return np.sin(2 * np.pi * f * t + index * np.sin(2 * np.pi * f * ratio * t))


def normalize(x, peak=0.9):
    return x * (peak / max(1e-9, np.max(np.abs(x))))


def lowpass(x, alpha):
    """Filtre passe-bas du premier ordre (alpha scalaire ou tableau, 0..1)."""
    y = np.empty_like(x)
    acc = 0.0
    a = np.broadcast_to(alpha, x.shape)
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def crossfade_loop(x, loop_start, fade):
    """Rend la boucle [loop_start, fin[ continue : la fin rejoint le début."""
    x = x.copy()
    end = len(x)
    w = np.linspace(0, 1, fade)
    x[end - fade:end] = x[end - fade:end] * (1 - w) + x[loop_start - fade:loop_start] * w
    return x


def looped(attack_periods, loop_periods, render):
    """Son entretenu : attaque, puis boucle d'un nombre entier de périodes.
    render(t, phase) reçoit l'axe des temps et la position (0..1) dans la
    boucle, pour faire évoluer le timbre sans cassure au raccord."""
    n_att = attack_periods * PERIOD
    n_loop = loop_periods * PERIOD
    t = t_axis(n_att + n_loop)
    phase = np.clip((np.arange(n_att + n_loop) - n_att) / n_loop, 0, 1)
    return render(t, phase), n_att, n_loop


def make_pad():
    def render(t, ph):
        lfo = np.sin(2 * np.pi * ph)
        lfo2 = np.sin(4 * np.pi * ph + 1.0)
        a = fm(F_LOOP, t, 1, 0.9 + 0.4 * lfo)
        b = 0.35 * fm(2 * F_LOOP, t, 1, 0.5 + 0.3 * lfo2)
        c = 0.15 * np.sin(2 * np.pi * 3 * F_LOOP * t)
        return a + b + c
    x, n_att, n_loop = looped(60, 520, render)
    return normalize(x), n_att, n_loop


def make_flute():
    def render(t, ph):
        lfo = np.sin(2 * np.pi * ph)
        return fm(F_LOOP, t, 1, 0.35 + 0.08 * lfo) + 0.12 * np.sin(2 * np.pi * 2 * F_LOOP * t)
    x, n_att, n_loop = looped(40, 260, render)
    # souffle à l'attaque (bruit filtré qui s'éteint)
    breath = lowpass(rng.standard_normal(n_att), 0.35)
    env = np.exp(-np.arange(n_att) / (0.025 * SR))
    x[:n_att] += 0.6 * normalize(breath) * env
    return normalize(x), n_att, n_loop


def make_harp():
    n = int(2.6 * SR)
    t = t_axis(n)
    index = 2.4 * np.exp(-t / 0.08) + 0.15
    x = fm(F_C4, t, 1, index) + 0.25 * fm(2 * F_C4, t, 1, index * 0.5)
    env = np.exp(-t / 0.9) * np.minimum(1, t / 0.002)
    return normalize(x * env)


def make_bell():
    n = int(3.2 * SR)
    t = t_axis(n)
    index = 3.5 * np.exp(-t / 0.25) + 0.3
    x = fm(F_C4, t, 3.5, index) + 0.4 * fm(2 * F_C4, t, 2.01, index * 0.5)
    env = np.exp(-t / 1.1) * np.minimum(1, t / 0.001)
    return normalize(x * env)


def make_bass():
    n = int(3.0 * SR)
    t = t_axis(n)
    index = 1.4 * np.exp(-t / 0.15) + 0.25
    x = fm(F_C4, t, 1, index) + 0.5 * np.sin(2 * np.pi * F_C4 * t)
    env = np.exp(-t / 1.4) * np.minimum(1, t / 0.006)
    return normalize(x * env)


def make_wind():
    n = int(6.0 * SR)
    # bruit filtré dont la coupure varie lentement (rafales)
    gust = 0.5 + 0.5 * np.sin(2 * np.pi * np.arange(n) / n * 3 + 0.7) * np.sin(2 * np.pi * np.arange(n) / n * 5)
    alpha = 0.015 + 0.05 * gust
    x = lowpass(rng.standard_normal(n), alpha)
    x = x - lowpass(x, 0.002)            # retire le grondement très grave
    x = x * (0.6 + 0.4 * gust)
    loop_start = int(1.0 * SR)
    x = crossfade_loop(x, loop_start, int(0.8 * SR))
    return normalize(x, 0.8), loop_start, n - loop_start


def make_birds():
    """Deux pépiements (« tui-tui ») : glissando montant puis descendant."""
    one = int(0.09 * SR)
    gap = int(0.06 * SR)
    t = t_axis(one)
    u = t / t[-1]
    f = 2600 * (1 + 0.35 * np.sin(np.pi * u)) * (1 + 0.15 * u)
    phase = 2 * np.cumsum(np.pi * f / SR)
    chirp = np.sin(phase + 0.8 * np.sin(phase * 2)) * np.sin(np.pi * u) ** 2
    x = np.concatenate([chirp, np.zeros(gap), 0.8 * chirp, np.zeros(int(0.05 * SR))])
    return normalize(x)


# ---------------------------------------------------------------- partition

NOTE_NAMES = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def midi(name):
    """'D4', 'C#5', 'Bb3' -> numéro MIDI (do4 = 60)."""
    n = NOTE_NAMES[name[0]]
    i = 1
    if name[i] == '#':
        n += 1
        i += 1
    elif name[i] == 'b':
        n -= 1
        i += 1
    return n + 12 * (int(name[i:]) + 1)


def xm_note(m):
    return m - 11          # note XM 49 (C-4) = do4 MIDI 60


KEY_OFF = 97

# instruments (numérotés à partir de 1)
PAD, FLUTE, HARP, BELL, BASS, WIND, BIRDS = range(1, 8)

# canaux
CH_PAD_A = (0, 1, 2)
CH_PAD_B = (3, 4, 5)
CH_BASS = 6
CH_HARP = (7, 8)
CH_FLUTE = 9
CH_ECHO = 10
CH_BELL = 11
CH_WIND = 12
CH_BIRDS = 13

CHORDS = {
    'Dm': ['D4', 'F4', 'A4'], 'G': ['D4', 'G4', 'B4'], 'Am': ['C4', 'E4', 'A4'],
    'C': ['C4', 'E4', 'G4'], 'F': ['C4', 'F4', 'A4'], 'A': ['C#4', 'E4', 'A4'],
    'Asus': ['D4', 'E4', 'A4'],
}
ROOTS = {'Dm': 'D2', 'G': 'G2', 'Am': 'A2', 'C': 'C3', 'F': 'F2', 'A': 'A2', 'Asus': 'A2'}

# 8 motifs de 4 mesures ; pour chaque motif : accords, et quelles parties jouent
SONG = [
    # accords                     harpe  flûte  cloches basse
    (['Dm', 'Dm', 'G', 'Dm'],      False, None,  False,  False),   # intro
    (['Dm', 'G', 'Am', 'C'],       True,  None,  True,   True),
    (['Dm', 'G', 'F', 'C'],        True,  'A',   False,  True),
    (['Dm', 'G', 'Am', 'Am'],      True,  'B',   True,   True),
    (['F', 'C', 'G', 'A'],         False, 'C',   True,   True),    # pont
    (['Dm', 'G', 'F', 'C'],        True,  'D',   False,  True),
    (['Dm', 'G', 'Am', 'Dm'],      True,  None,  True,   True),
    (['Dm', 'G', 'Dm', 'Asus'],    False, 'E',   False,  False),   # retour au début
]

# mélodies de flûte : (note, durée en lignes), None = silence
MELODIES = {
    'A': [('F5', 6), ('E5', 2), ('D5', 4), ('A4', 4),
          ('B4', 6), ('D5', 2), ('G5', 8),
          ('A5', 6), ('G5', 2), ('F5', 4), ('E5', 4),
          ('E5', 8), ('D5', 4), ('C5', 4)],
    'B': [('D5', 12), ('A4', 4),
          ('B4', 4), ('D5', 4), ('E5', 4), ('F5', 4),
          ('E5', 8), ('C5', 4), ('A4', 4),
          ('A4', 12), (None, 4)],
    'C': [('A5', 16),
          ('G5', 16),
          ('B5', 8), ('A5', 8),
          ('C#5', 8), ('E5', 8)],
    'D': [('F5', 6), ('E5', 2), ('D5', 4), ('A4', 4),
          ('B4', 6), ('D5', 2), ('G5', 8),
          ('A5', 4), ('C6', 4), ('A5', 4), ('F5', 4),
          ('G5', 8), ('E5', 4), ('C5', 4)],
    'E': [(None, 16),
          ('D5', 12), ('E5', 4),
          ('F5', 8), ('E5', 8),
          ('D5', 12), (None, 4)],
}


def new_pattern():
    return [[None] * CHANNELS for _ in range(ROWS)]


def put(pat, row, ch, note=None, ins=None, vol=None, fx=0, fxp=0):
    if 0 <= row < ROWS:
        pat[row][ch] = (note, ins, vol, fx, fxp)


def write_melody(pat, ch, melody, vol, echo_ch=None, echo_delay=3, echo_vol=None):
    row = 0
    for name, length in melody:
        if name is None:
            put(pat, row, ch, KEY_OFF)
        else:
            put(pat, row, ch, xm_note(midi(name)), FLUTE, vol, 0x08, 0x80)
        if echo_ch is not None:
            r = row + echo_delay
            if name is None:
                put(pat, r, echo_ch, KEY_OFF)
            else:
                put(pat, r, echo_ch, xm_note(midi(name)), FLUTE, echo_vol, 0x08, 0xC8)
        row += length


def build_patterns():
    patterns = []
    birds = np.random.default_rng(7)
    for i_pat, (chords, harp, melody, bells, bass) in enumerate(SONG):
        pat = new_pattern()
        for bar, chord in enumerate(chords):
            r0 = bar * BAR
            # nappes : deux jeux de canaux en alternance, l'ancien est relâché
            # (fondu) pendant que le nouveau monte
            on, off = (CH_PAD_A, CH_PAD_B) if (i_pat * 4 + bar) % 2 == 0 else (CH_PAD_B, CH_PAD_A)
            for k, (ch_on, ch_off) in enumerate(zip(on, off)):
                pan = (0x50, 0x80, 0xB0)[k]
                put(pat, r0, ch_on, xm_note(midi(CHORDS[chord][k])), PAD, 0x10 + 26, 0x08, pan)
                put(pat, r0, ch_off, KEY_OFF)
            if bass:
                root = midi(ROOTS[chord])
                put(pat, r0, CH_BASS, xm_note(root), BASS, 0x10 + 52)
                put(pat, r0 + 10, CH_BASS, xm_note(root + 7), BASS, 0x10 + 34)
            if harp:
                # arpège en croches : fondamentale, quinte, octave, tierce...
                base = midi(ROOTS[chord]) + 12
                third = 3 if chord in ('Dm', 'Am') else 4
                steps = [0, 7, 12, 12 + third, 19, 12 + third, 12, 7]
                for k, s in enumerate(steps):
                    put(pat, r0 + 2 * k, CH_HARP[k % 2], xm_note(base + s), HARP,
                        0x10 + (40 if k == 0 else 30), 0x08, 0x60 if k % 2 == 0 else 0x90)
            if bells:
                tones = [midi(n) + 12 for n in CHORDS[chord]]
                put(pat, r0 + 6, CH_BELL, xm_note(tones[2]), BELL, 0x10 + 22, 0x08, 0xB0)
                put(pat, r0 + 12, CH_BELL, xm_note(tones[1 + bar % 2]), BELL, 0x10 + 16, 0x08, 0xC0)
        if melody:
            write_melody(pat, CH_FLUTE, MELODIES[melody], 0x10 + 44, CH_ECHO, 3, 0x10 + 14)
        else:
            put(pat, 0, CH_FLUTE, KEY_OFF)
        if i_pat == 0:
            put(pat, 0, CH_WIND, xm_note(60), WIND, 0x10 + 40)
        # quelques oiseaux, à des moments irréguliers
        for _ in range(int(birds.integers(1, 4))):
            r = int(birds.integers(0, ROWS - 4))
            n = int(birds.choice([60, 62, 64, 65, 67]))
            put(pat, r, CH_BIRDS, xm_note(n), BIRDS, 0x10 + int(birds.integers(10, 22)),
                0x08, int(birds.choice([0x30, 0x50, 0xB0, 0xD0])))
        patterns.append(pat)
    return patterns


# ---------------------------------------------------------------- fichier XM

def pack_pattern(pat):
    out = bytearray()
    for row in pat:
        for cell in row:
            if cell is None:
                out.append(0x80)
                continue
            note, ins, vol, fx, fxp = cell
            mask = 0x80
            data = bytearray()
            if note:
                mask |= 1
                data.append(note)
            if ins:
                mask |= 2
                data.append(ins)
            if vol:
                mask |= 4
                data.append(vol)
            if fx:
                mask |= 8
                data.append(fx)
            if fxp:
                mask |= 16
                data.append(fxp)
            out.append(mask)
            out += data
    return bytes(out)


def to_int16(x):
    return np.clip(np.round(x * 32767), -32768, 32767).astype(np.int16)


def delta16(samples):
    d = np.diff(samples.astype(np.int32), prepend=0)
    return ((d + 32768) % 65536 - 32768).astype('<i2').tobytes()


def env_points(points):
    b = bytearray()
    for x, y in points[:12]:
        b += struct.pack('<HH', x, y)
    return bytes(b) + bytes(48 - len(b))


def instrument(name, data, loop=None, volume=64, pan=128, vol_env=None, sustain=None,
               fadeout=0, vib=(0, 0, 0, 0), finetune=0):
    """loop = (début, longueur) en échantillons ; vol_env = [(tick, 0..64)] ;
    finetune en 1/128 de demi-ton."""
    s = to_int16(data)
    n_points = len(vol_env) if vol_env else 0
    vol_type = 0
    if vol_env:
        vol_type |= 1
        if sustain is not None:
            vol_type |= 2
    head = bytearray()
    head += name.encode('ascii')[:22].ljust(22, b'\0')
    head += bytes([0])                       # type
    head += struct.pack('<H', 1)             # un échantillon
    head += struct.pack('<I', 40)            # taille de l'en-tête d'échantillon
    head += bytes(96)                        # toutes les notes -> échantillon 0
    head += env_points(vol_env or [])
    head += env_points([])
    head += bytes([n_points, 0, sustain or 0, 0, 0, 0, 0, 0, vol_type, 0])
    head += bytes(vib)                       # type, balayage, profondeur, vitesse
    head += struct.pack('<H', fadeout)
    head += bytes(22)                        # réservé
    head = struct.pack('<I', 4 + len(head)) + head
    assert len(head) == 263, len(head)
    loop_start, loop_len = loop if loop else (0, 0)
    smp = bytearray()
    smp += struct.pack('<III', len(s) * 2, loop_start * 2, loop_len * 2)
    smp += bytes([volume, finetune & 0xFF, (1 if loop else 0) | 0x10, pan])
    smp += struct.pack('<b', REL_NOTE)
    smp += bytes([0])
    smp += name.encode('ascii')[:22].ljust(22, b'\0')
    return bytes(head) + bytes(smp) + delta16(s)


def build_instruments():
    pad, pad_att, pad_loop = make_pad()
    flute, fl_att, fl_loop = make_flute()
    wind, w_start, w_len = make_wind()
    return [
        # nappe : montée lente (~1 s), longue extinction au relâchement
        instrument('Forest pad', pad, (pad_att, pad_loop), 64, 128,
                   [(0, 0), (30, 64), (60, 56)], sustain=2, fadeout=500),
        instrument('Flute', flute, (fl_att, fl_loop), 64, 128,
                   [(0, 0), (2, 64), (20, 52)], sustain=2, fadeout=1400, vib=(0, 40, 3, 6)),
        instrument('Harp', make_harp(), None, 64, 112),
        instrument('Bells', make_bell(), None, 64, 160),
        instrument('Bass', make_bass(), None, 64, 128),
        instrument('Wind', wind, (w_start, w_len), 64, 128),
        instrument('Birds', make_birds(), None, 64, 128),
    ]


def write_xm(path, title, tracker, patterns, instruments, channels, speed, bpm, rows=ROWS):
    """Écrit un module XM : motifs joués dans l'ordre, retour au début à la fin."""
    order = list(range(len(patterns)))
    head = bytearray()
    head += b'Extended Module: '
    head += title.encode('ascii')[:20].ljust(20, b'\0')
    head += b'\x1a'
    head += tracker.encode('ascii')[:20].ljust(20, b'\0')
    head += struct.pack('<H', 0x0104)
    head += struct.pack('<I', 276)
    head += struct.pack('<HHHHHHHH', len(order), 0, channels, len(patterns), len(instruments),
                        1, speed, bpm)
    head += bytes(order).ljust(256, b'\0')
    out = bytearray(head)
    for pat in patterns:
        data = pack_pattern(pat)
        out += struct.pack('<IBHH', 9, 0, rows, len(data)) + data
    for ins in instruments:
        out += ins
    with open(path, 'wb') as f:
        f.write(out)
    seconds = len(patterns) * rows * speed * 2.5 / bpm
    print(f'{path} : {len(out)} octets, {len(patterns)} motifs, {seconds:.0f} s')


def build_xm(path):
    write_xm(path, 'Forest ambience', 'make_forest.py', build_patterns(), build_instruments(),
             CHANNELS, TICKS_PER_ROW, BPM)


if __name__ == '__main__':
    build_xm(sys.argv[1] if len(sys.argv) > 1 else 'forest_ambience.xm')
