"""Salle du trésor : l'or qui scintille, la richesse, l'émerveillement.

Mi majeur avec la quarte augmentée (lydien : fa dièse majeur sur mi),
96 bpm, 24 mesures (1:00), en boucle. Célesta et glockenspiel en arpèges
scintillants, harpe en glissandos, cordes, chœur, cloches, triangle.

 0-7   scintillement : célesta, glockenspiel, harpe
 8-15  thème à la flûte et au célesta, chœur
 16-23 seconde partie, plus ample, cloches ; retour au scintillement
"""
from compose import Piece, GM, n, segments, tones

pc = Piece('treasure_hoard', 96, 'Give Back My Grimoire! - Treasure hoard', seed=51)
bar = pc.bar

cel = pc.track('Celesta', 0, GM['Celesta'], volume=110, pan=40, reverb=110)
glock = pc.track('Glockenspiel', 1, GM['Glockenspiel'], volume=127, pan=90, reverb=120)
harp = pc.track('Harpe', 2, GM['Harp'], volume=104, pan=24, reverb=100)
strings = pc.track('Cordes', 3, GM['Strings2'], volume=84, pan=64, reverb=100)
choir = pc.track('Choeur', 4, GM['ChoirAahs'], volume=104, pan=80, reverb=110)
flute = pc.track('Flute', 5, GM['Flute'], volume=104, pan=70, reverb=100)
bells = pc.track('Cloches', 6, GM['TubularBells'], volume=112, pan=56, reverb=120)
bass = pc.track('Contrebasse', 7, GM['Contrabass'], volume=90, pan=64, reverb=70)
perc = pc.track('Percussions', 9, None, volume=96, reverb=110)

A = ['E', 'F#/E', 'E', 'F#/E', 'C#m', 'A', 'B7', 'B7']
B = ['A', 'B', 'G#m', 'C#m', 'A', 'F#m', 'Bsus4|B', 'E']
THEME = [
    [('B4', 2), ('G#4', 1), ('A#4', 1)],
    [('C#5', 2), ('B4', 2)],
    [('E5', 1), ('D#5', 1), ('B4', 2)],
    [('A#4', 4)],
    [('G#4', 1), ('B4', 1), ('E5', 2)],
    [('C#5', 2), ('A4', 2)],
    [('F#4', 1), ('A4', 1), ('D#5', 2)],
    [('B4', 4)],
]
HIGH = [
    [('C#5', 2), ('E5', 2)],
    [('D#5', 2), ('F#5', 2)],
    [('B4', 2), ('D#5', 2)],
    [('E5', 2), ('G#4', 2)],
    [('A4', 1), ('C#5', 1), ('E5', 2)],
    [('F#5', 2), ('C#5', 2)],
    [('E5', 1), ('C#5', 1), ('D#5', 2)],
    [('E5', 4)],
]
FORM = A + A + B

# scintillement : célesta en doubles croches, glockenspiel qui répond
pc.arp(cel, 0, FORM, [0, 1, 2, 3, 4, 3, 2, 1], 'E4', 'E6', vel=56, step=0.25, dur=0.3, accents={0}, accent=16)
pc.scatter(glock, 0, 24, [n(x) for x in ('B5', 'E6', 'G#6', 'A#6', 'B6', 'D#7')], 2, vel=(64, 100), dur=0.5)
# glissandos de harpe en début de mesure paire
for i, s, d, c in segments(FORM):
    if i % 2 == 0 and s == 0:
        for k, p in enumerate(tones(c, 'E3', 'E6')):
            harp.note(bar(i, k * 0.0625), p, 1.5, pc.hum(60 + k * 2))
pc.pad(strings, 0, FORM, vel=62, lo='G#3', hi='G#4')
pc.bass(bass, 0, FORM, [(0, 1.8, 0), (2, 1.8, 7)], lo='E1', vel=76)
pc.drums(perc, 0, 24, {'triangle': [(0, 70), (2, 50)], 'chimes': [(3.5, 44)]}, skip=(1, 3, 5, 7))
pc.drums(perc, 8, 16, {'shaker': [(x / 2, 36) for x in range(8)]})

pc.melody(flute, 8, THEME, vel=90)
pc.melody(cel, 8, THEME, vel=70, octave=1)
pc.pad(choir, 8, A, vel=62, lo='B3', hi='B4')
pc.melody(strings, 16, HIGH, vel=90)
pc.melody(flute, 16, HIGH, vel=84, octave=1)
pc.pad(choir, 16, B, vel=72, lo='C#4', hi='C#5')
pc.swell(choir, 22, 24, 110, 40)
choir.cc(bar(8) - 0.01, 11, 110)
for b in (16, 20):
    bells.chord(bar(b), ['E5', 'B4'], 3, 76)
bells.chord(bar(23), ['E5', 'G#4'], 3, 70)

for b, t in ((0, 'Scintillement'), (8, 'Theme'), (16, 'Ampleur')):
    pc.marker(b, t)
pc.save(24)
