"""Musique du menu principal, en MIDI General MIDI, dans l'esprit de Heretic
et Hexen : pédale de ré, timbales, cordes, chœur, harpe en ostinato, cor,
couleurs phrygiennes (mi bémol) et mineur harmonique (do dièse).

    python3 make_main_menu.py   ->  main_menu.mid

Ré mineur, 80 bpm, 4/4, 60 mesures (3:00), en boucle : la fin retombe sur
la pédale de ré de l'introduction.

 mesures  partie        contenu
  0-7     Glas          cloches, cordes graves, chœur qui monte, roulement
  8-23    Procession    harpe, basse, timbales ; thème au cor puis réponse
 24-39    Marche        batterie, guitare étouffée, cuivres : thème et réponse
 40-47    Courroux      guitare saturée, cuivres et chœur à pleine voix
 48-55    Crypte        harpe seule, chœur lointain, cor anglais
 56-59    Retour        roulement, glas, decrescendo vers le début
"""
import random

from midi_kit import Song, GM, DRUM, n

random.seed(1995)
BPM = 80
song = Song(bpm=BPM, title='Give Back My Grimoire! - Main menu')
bar = song.bar

# accords : fondamentale + notes (classes de hauteur)
CHORDS = {
    'Dm': ('D', ['D', 'F', 'A']),
    'Bb': ('Bb', ['Bb', 'D', 'F']),
    'Gm': ('G', ['G', 'Bb', 'D']),
    'A': ('A', ['A', 'C#', 'E']),
    'F': ('F', ['F', 'A', 'C']),
    'Eb': ('Eb', ['Eb', 'G', 'Bb']),
    'C': ('C', ['C', 'E', 'G']),
}
PC = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'Eb': 3, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6,
      'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'Bb': 10, 'A#': 10, 'B': 11}


def tones(chord, lo, hi):
    """Notes de l'accord entre lo et hi (hauteurs MIDI), dans l'ordre."""
    pcs = {PC[x] for x in CHORDS[chord][1]}
    return [p for p in range(n(lo), n(hi) + 1) if p % 12 in pcs]


def root(chord, octave):
    return PC[CHORDS[chord][0]] + 12 * (octave + 1)


def hum(v, d=6):
    return v + random.randint(-d, d)


# progressions, une entrée par mesure ; '|' coupe la mesure en deux
THEME_CH = ['Dm', 'Bb', 'Gm', 'A', 'Gm', 'Dm|A', 'Eb', 'Dm']
ANSWER_CH = ['Dm', 'F', 'Gm', 'A', 'Bb', 'A', 'Gm', 'A']
WRATH_CH = ['Dm', 'Eb', 'C', 'Bb', 'Gm', 'Eb', 'Bb', 'A']
CRYPT_CH = ['Dm', 'Dm', 'Bb', 'Bb', 'Gm', 'Eb', 'A', 'A']

THEME = [
    [('D4', 2), ('A4', 1.5), ('G4', .5)],
    [('F4', 1), ('E4', .5), ('F4', .5), ('D4', 2)],
    [('A3', 1), ('D4', 1), ('F4', 1), ('G4', 1)],
    [('A4', 3), ('Bb4', .5), ('A4', .5)],
    [('G4', 2), ('F4', 1), ('E4', 1)],
    [('F4', 1.5), ('E4', .5), ('D4', 1), ('C#4', 1)],
    [('Bb3', 1), ('Eb4', 1), ('G4', 1), ('F4', .5), ('Eb4', .5)],
    [('D4', 4)],
]
ANSWER = [
    [('A4', 2), ('D5', 2)],
    [('C5', 1.5), ('Bb4', .5), ('A4', 2)],
    [('Bb4', 1), ('A4', 1), ('G4', 1), ('F4', 1)],
    [('E4', 3), ('A4', 1)],
    [('D5', 1.5), ('E5', .5), ('F5', 2)],
    [('E5', 1), ('D5', 1), ('C#5', 2)],
    [('D5', 1), ('C5', 1), ('Bb4', 1), ('G4', 1)],
    [('A4', 4)],
]
WRATH = [
    [('D5', 3), ('F5', 1)],
    [('Eb5', 4)],
    [('E5', 2), ('G5', 2)],
    [('F5', 3), ('D5', 1)],
    [('D5', 2), ('Bb4', 2)],
    [('Eb5', 3), ('G5', 1)],
    [('F5', 2), ('D5', 1), ('Bb4', 1)],
    [('C#5', 2), ('E5', 2)],
]
CRYPT = [
    [('D4', 2), ('F4', 2)],
    [('E4', 4)],
    [('D4', 2), ('Bb3', 2)],
    [('A3', 4)],
    [('G3', 2), ('Bb3', 2)],
    [('Eb4', 4)],
    [('C#4', 4)],
    [('E4', 3), ('A3', 1)],
]


def halves(prog):
    """[(début en temps dans la mesure, durée, accord)] pour chaque mesure."""
    out = []
    for c in prog:
        if '|' in c:
            a, b = c.split('|')
            out.append([(0, 2, a), (2, 2, b)])
        else:
            out.append([(0, 4, c)])
    return out


def play_melody(track, b0, melody, vel=90, octave=0, legato=0.95, accent=True):
    for i, bar_notes in enumerate(melody):
        t = bar(b0 + i)
        for k, (p, d) in enumerate(bar_notes):
            v = vel + (8 if accent and k == 0 else 0)
            track.note(t, n(p) + 12 * octave, d * legato, hum(v, 4))
            t += d


# ------------------------------------------------------------------ pistes
choir = song.track('Choeur', 0, GM['ChoirAahs'], volume=124, pan=56, reverb=90)
lowstr = song.track('Cordes graves', 1, GM['Strings1'], volume=104, pan=74, reverb=70)
trem = song.track('Cordes tremolo', 2, GM['TremoloStrings'], volume=100, pan=38, reverb=70)
harp = song.track('Harpe', 3, GM['Harp'], volume=92, pan=30, reverb=70)
timp = song.track('Timbales', 4, GM['Timpani'], volume=88, pan=64, reverb=60)
bass = song.track('Basse', 5, GM['FingerBass'], volume=100, pan=64, reverb=20)
horn = song.track('Cor', 6, GM['FrenchHorn'], volume=106, pan=82, reverb=70)
brass = song.track('Cuivres', 7, GM['Brass'], volume=92, pan=48, reverb=60)
mgtr = song.track('Guitare etouffee', 8, GM['MutedGuitar'], volume=104, pan=96, reverb=30)
drums = song.track('Batterie', 9, None, volume=100, pan=64, reverb=50)
dgtr = song.track('Guitare saturee', 10, GM['DistortionGuitar'], volume=92, pan=24, reverb=35)
bells = song.track('Cloches', 11, GM['TubularBells'], volume=92, pan=70, reverb=110)
ehorn = song.track('Cor anglais', 12, GM['EnglishHorn'], volume=96, pan=60, reverb=90)
rcym = song.track('Cymbale inversee', 13, GM['ReverseCymbal'], volume=118, pan=64, reverb=60)

REV_CYM_BEATS = 2.06 * BPM / 60      # durée de l'échantillon, en temps


def reverse_cymbal(b):
    rcym.note(bar(b) - REV_CYM_BEATS, 'C4', REV_CYM_BEATS, 100)


def timp_roll(t0, beats, v0, v1, pitch='D2', rate=6):
    k = int(beats * rate)
    for i in range(k):
        timp.note(t0 + i / rate, pitch, 1 / rate, v0 + (v1 - v0) * i / max(1, k - 1))


def bed(b0, prog, vel=70, octave=2, pad=lowstr):
    """Accords tenus des cordes graves : fondamentale + quinte + tierce."""
    for i, segs in enumerate(halves(prog)):
        for s, d, c in segs:
            r = root(c, octave)
            if r % 12 > PC['A']:        # pas trop haut : Bb, B -> octave en dessous
                r -= 12
            notes = [r, r + 7] + [p for p in tones(c, r + 10, r + 19)][:1]
            pad.chord(bar(b0 + i) + s, notes, d, hum(vel, 3))


def choir_chords(b0, prog, vel=70, lo='A3', hi='A4'):
    for i, segs in enumerate(halves(prog)):
        for s, d, c in segs:
            choir.chord(bar(b0 + i) + s, tones(c, lo, hi)[:3], d, hum(vel, 3))


def harp_ostinato(b0, prog, vel=70, lo='D3', hi='D5'):
    # groupes 3+3+2 sur des doubles croches, comme dans les morceaux de Hexen
    shape = [0, 2, 4, 1, 3, 5, 2, 4, 0, 2, 4, 1, 3, 5, 4, 2]
    accents = {0, 3, 6, 8, 11, 14}
    for i, segs in enumerate(halves(prog)):
        for s, d, c in segs:
            pool = tones(c, lo, hi)
            for k in range(int(d * 4)):
                step = int(s * 4) + k
                p = pool[shape[step % 16] % len(pool)]
                v = vel + (14 if step in accents else 0)
                harp.note(bar(b0 + i) + step / 4, p, 0.5, hum(v, 5))


def bass_line(b0, prog, pattern, vel=95, octave=1):
    """pattern : [(temps, durée, décalage en demi-tons)] par mesure."""
    for i, segs in enumerate(halves(prog)):
        for s, d, c in segs:
            r = root(c, octave)
            if r % 12 < PC['D']:            # garder la basse entre D1 et C#2
                r += 12
            for t, dur, off in pattern:
                if s <= t < s + d:
                    bass.note(bar(b0 + i) + t, r + off, dur, hum(vel, 5))


def timp_root(c):
    # timbales accordées entre G1 et F2
    r = root(c, 1)
    return r + 12 if r < n('G1') else r


# ------------------------------------------------------------- 0-7 Glas
for b in (0, 2, 4, 6):
    bells.chord(bar(b), ['D5', 'D4'], 3.5, hum(92 if b % 4 == 0 else 78, 3))
lowstr.chord(bar(0), ['D2', 'A2'], 32, 80)
lowstr.ramp(bar(0), bar(8), 11, 50, 120)
choir.cc(0, 11, 30)
choir.chord(bar(4), ['D4', 'A4'], 8, 74)
choir.chord(bar(6), ['F4'], 4, 66)
choir.ramp(bar(4), bar(8), 11, 30, 118)
timp.note(bar(0), 'D2', 2, 100)
timp.note(bar(4), 'D2', 2, 104)
timp.note(bar(4, 3), 'A1', 1, 80)
timp_roll(bar(6), 8, 40, 118)
reverse_cymbal(8)

# ------------------------------------------------------------- 8-23 Procession
P = 8
proc_prog = THEME_CH + ANSWER_CH
harp_ostinato(P, proc_prog, vel=66)
bed(P, proc_prog, vel=72)
bass_line(P, proc_prog, [(0, 1.9, 0), (2, 1.4, 0), (3.5, 0.45, 12)], vel=96)
for i, segs in enumerate(halves(proc_prog)):
    for s, d, c in segs:
        timp.note(bar(P + i) + s, timp_root(c), 1, hum(96 if s == 0 else 80))
    timp.note(bar(P + i, 2.5), timp_root(segs[-1][2]), 0.5, hum(62))
    drums.note(bar(P + i), DRUM['kick2'], 0.5, hum(92))
    drums.note(bar(P + i, 2.5), DRUM['tom_lo2'], 0.5, hum(70))
    for beat in (1, 3):
        drums.note(bar(P + i, beat), DRUM['tambourine'], 0.25, hum(44))
    if i % 4 == 3:
        for k, tom in enumerate(['tom_mid2', 'tom_mid2', 'tom_lo', 'tom_lo2']):
            drums.note(bar(P + i, 3 + k / 4), DRUM[tom], 0.25, hum(64 + k * 8))
play_melody(horn, P, THEME, vel=96)
play_melody(horn, P + 8, ANSWER, vel=100)
choir_chords(P + 8, ANSWER_CH, vel=78)
choir.cc(bar(P + 8), 11, 100)
timp_roll(bar(P + 15, 2), 2, 50, 112, pitch='A1')
reverse_cymbal(24)

# ------------------------------------------------------------- 24-39 Marche
M = 24
march_prog = THEME_CH + ANSWER_CH
bed(M, march_prog, vel=84)
harp_ostinato(M, march_prog, vel=54, lo='D4', hi='D6')
bass_line(M, march_prog, [(x / 2, 0.45, 12 if x == 7 else 0) for x in range(8)], vel=100)
for i, segs in enumerate(halves(march_prog)):
    for s, d, c in segs:
        r = root(c, 2)
        if r % 12 < PC['D']:
            r += 12
        for k in range(int(d * 4)):
            if k % 4 != 1:                    # doubles croches : X.XX
                mgtr.note(bar(M + i) + s + k / 4, r, 0.2, hum(86 if k % 4 == 0 else 64))
        trem.chord(bar(M + i) + s, tones(c, 'D4', 'D5')[:3], d, hum(70, 3))
        timp.note(bar(M + i) + s, timp_root(c), 1, hum(104))
    # batterie : demi-temps lourd
    t = bar(M + i)
    for x in (0, 0.75, 2.5):
        drums.note(t + x, DRUM['kick2'], 0.25, hum(100 if x == 0 else 86))
    drums.note(t + 2, DRUM['snare'], 0.25, hum(104))
    for x in range(8):
        if not (i % 4 == 3 and x >= 6):
            drums.note(t + x / 2, DRUM['hh_closed'], 0.25, hum(70 if x % 2 == 0 else 50))
    drums.note(t + 3.5, DRUM['hh_open'], 0.5, hum(60))
    if i % 8 == 0:
        drums.note(t, DRUM['crash'], 2, hum(108))
    if i % 4 == 3:
        fill = ['snare', 'snare', 'tom_hi', 'tom_hi2', 'tom_mid', 'tom_mid2', 'tom_lo', 'tom_lo2']
        for k, d_ in enumerate(fill if i % 8 == 7 else fill[4:]):
            start = 2 if i % 8 == 7 else 3
            drums.note(t + start + k / 4, DRUM[d_], 0.25, hum(80 + k * 4))
play_melody(brass, M, THEME, vel=100)
play_melody(horn, M, THEME, vel=92, octave=-1)
play_melody(brass, M + 8, ANSWER, vel=104)
play_melody(choir, M + 8, ANSWER, vel=86, legato=1.0, accent=False)
choir.cc(bar(M + 8), 11, 118)
for i, c in enumerate(ANSWER_CH):
    horn.chord(bar(M + 8 + i), [root(c, 3) - (12 if root(c, 3) > n('G3') else 0)], 2, hum(84))
timp_roll(bar(M + 7, 2), 2, 60, 118)
timp_roll(bar(M + 15), 4, 60, 124, pitch='A1', rate=8)
reverse_cymbal(40)

# ------------------------------------------------------------- 40-47 Courroux
W = 40
bed(W, WRATH_CH, vel=96)
for i, c in enumerate(WRATH_CH):
    t = bar(W + i)
    r = root(c, 2)
    if r % 12 < PC['D']:
        r += 12
    power = [r, r + 7, r + 12]
    for x, dur in ((0, 0.7), (0.75, 0.6), (1.5, 0.45), (2, 0.7), (2.75, 0.6), (3.5, 0.45)):
        dgtr.chord(t + x, power, dur, hum(100 if x in (0, 2) else 84))
    for x in range(8):
        bass.note(t + x / 2, r - 12, 0.45, hum(104 if x % 2 == 0 else 90))
    trem.chord(t, tones(c, 'F4', 'F5')[:3], 4, hum(84, 3))
    choir.chord(t, tones(c, 'D4', 'D5')[:3], 4, hum(96, 3))
    brass.chord(t, [r - 12 + 12 * 1, r + 7], 1.5, hum(96))
    timp.note(t, timp_root(c), 1, hum(116))
    timp.note(t + 2, timp_root(c), 1, hum(100))
    # batterie : croches à la grosse caisse, caisse claire sur 2 et 4
    for x in (0, 0.5, 1.5, 2, 2.5, 3.5):
        drums.note(t + x, DRUM['kick2'], 0.25, hum(104))
    for x in (1, 3):
        drums.note(t + x, DRUM['snare'], 0.25, hum(112))
    drums.note(t, DRUM['crash'], 2, hum(112 if i % 2 == 0 else 92))
    for x in range(8):
        drums.note(t + x / 2, DRUM['ride'], 0.25, hum(66))
    if i in (3, 7):
        drums.note(t + 3.5, DRUM['china'], 0.5, hum(100))
play_melody(horn, W, WRATH, vel=110, octave=-1)
play_melody(brass, W, WRATH, vel=112)
for b in (W, W + 4):
    bells.chord(bar(b), ['D5', 'A4'], 3, 96)
timp_roll(bar(W + 7, 2), 2, 70, 124, pitch='A1', rate=8)

# ------------------------------------------------------------- 48-55 Crypte
C0 = 48
harp_ostinato(C0, CRYPT_CH, vel=60, lo='A3', hi='A5')
choir.cc(bar(C0), 11, 70)
choir_chords(C0, CRYPT_CH, vel=72, lo='D4', hi='D5')
bed(C0, CRYPT_CH, vel=58)
lowstr.cc(bar(C0), 11, 96)
for i, c in enumerate(CRYPT_CH):
    t = bar(C0 + i)
    bass.note(t, root(c, 1) + (12 if root(c, 1) < n('D1') else 0), 3.8, hum(80))
    # battement de cœur
    drums.note(t, DRUM['tom_lo2'], 0.25, hum(72))
    drums.note(t + 0.33, DRUM['tom_lo2'], 0.25, hum(52))
    trem.note(t, 'D6' if c in ('Dm', 'Bb', 'Gm') else 'C#6', 4, hum(40, 3))
trem.cc(bar(C0), 7, 80)
trem.cc(bar(C0 + 8), 7, 100)
play_melody(ehorn, C0, CRYPT, vel=88)
# le triton qui rôde : sol dièse dans la harpe grave
for b in (C0 + 1, C0 + 3, C0 + 5):
    harp.note(bar(b, 3.5), 'G#2', 0.5, 70)

# ------------------------------------------------------------- 56-59 Retour
R = 56
lowstr.chord(bar(R), ['D2', 'A2'], 16, 74)
lowstr.ramp(bar(R), bar(R + 4), 11, 110, 50)
choir.chord(bar(R), ['D4', 'A4'], 8, 60)
choir.ramp(bar(R), bar(R + 2), 11, 80, 24)
choir.cc(bar(R + 4) - 0.01, 11, 30)          # comme au début de la boucle
lowstr.cc(bar(R + 4) - 0.01, 11, 50)
bells.chord(bar(R), ['D5', 'D4'], 3.5, 86)
bells.chord(bar(R + 2), ['D5', 'D4'], 3.5, 70)
bass.note(bar(R), 'D1', 8, 84)
timp_roll(bar(R), 4, 90, 40)
timp.note(bar(R + 2), 'D2', 2, 60)

END = bar(60)
song.marker(0, 'Glas')
for b, name in ((8, 'Procession'), (24, 'Marche'), (40, 'Courroux'), (48, 'Crypte'), (56, 'Retour')):
    song.marker(bar(b), name)
song.save('main_menu.mid', end=END)
print('main_menu.mid : %d mesures, %.0f s' % (END / 4, END * 60 / BPM))
