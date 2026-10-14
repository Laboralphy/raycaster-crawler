"""Fin - Le chemin du retour : joyeux, le thème du Grimoire en majeur.

Ré majeur, 116 bpm, 40 mesures (1:23), en boucle. Flûte et piccolo sur le
thème du Grimoire (celui du menu, passé en majeur), cordes, pizzicati, cors,
harpe, caisse claire de marche, tambourin, triangle, glockenspiel.

 0-3   introduction : cordes, harpe, roulement de caisse claire
 4-11  thème du Grimoire en majeur, à la flûte
 12-19 réponse, flûte et cordes
 20-27 seconde partie aux cors, plus large
 28-35 thème en tutti, trompettes
 36-39 cadence qui relance la boucle
"""
from compose import Piece, GM, n, segments, tones
from motifs import THEME_MAJOR, THEME_MAJOR_CHORDS, ANSWER_MAJOR, ANSWER_MAJOR_CHORDS

pc = Piece('ending_homeward', 116, 'Give Back My Grimoire! - Homeward', seed=71)
bar = pc.bar

flute = pc.track('Flute', 0, GM['Flute'], volume=110, pan=70, reverb=80)
picc = pc.track('Piccolo', 1, GM['Piccolo'], volume=80, pan=76, reverb=80)
strings = pc.track('Cordes', 2, GM['Strings1'], volume=96, pan=44, reverb=80)
pizz = pc.track('Pizzicati', 3, GM['Pizzicato'], volume=100, pan=30, reverb=60)
horns = pc.track('Cors', 4, GM['FrenchHorn'], volume=104, pan=84, reverb=80)
tpt = pc.track('Trompettes', 5, GM['Trumpet'], volume=96, pan=56, reverb=70)
harp = pc.track('Harpe', 6, GM['Harp'], volume=96, pan=20, reverb=80)
bass = pc.track('Contrebasse', 7, GM['Contrabass'], volume=96, pan=64, reverb=50)
glock = pc.track('Glockenspiel', 8, GM['Glockenspiel'], volume=124, pan=100, reverb=90)
drums = pc.track('Batterie', 9, None, volume=92, reverb=60)
timp = pc.track('Timbales', 10, GM['Timpani'], volume=86, pan=64, reverb=70)

INTRO = ['D', 'G', 'A', 'A']
B = ['G', 'A', 'F#m', 'Bm', 'G', 'A', 'D', 'D']
HORNS = [
    [('B4', 2), ('D5', 2)],
    [('C#5', 2), ('E5', 2)],
    [('C#5', 1), ('A4', 1), ('F#4', 2)],
    [('D5', 4)],
    [('B4', 1), ('G4', 1), ('D5', 2)],
    [('E5', 2), ('C#5', 2)],
    [('D5', 1), ('F#5', 1), ('A5', 2)],
    [('F#5', 4)],
]
CADENCE = ['G', 'Em|A', 'D', 'A']
FORM = INTRO + THEME_MAJOR_CHORDS + ANSWER_MAJOR_CHORDS + B + THEME_MAJOR_CHORDS + CADENCE

# accompagnement : pizzicati en croches, basse, harpe qui arpège, cordes tenues
for i, s, d, c in segments(FORM):
    pool = tones(c, 'D4', 'D5')
    for x in range(int(d * 2)):
        pizz.note(bar(i, s + x / 2), pool[(x * 2) % len(pool)] if x % 2 else pool[0], 0.3,
                  pc.hum(80 if x % 2 == 0 else 62))
pc.bass(bass, 0, FORM, [(0, 0.9, 0), (1, 0.9, 7), (2, 0.9, 0), (3, 0.9, 7)], lo='D1', vel=88)
pc.arp(harp, 0, FORM, [0, 1, 2, 3, 4, 3, 2, 1], 'D3', 'D5', vel=58, step=0.5, dur=0.8, accents={0})
pc.pad(strings, 0, FORM, vel=64, lo='F#3', hi='F#4')

# marche : caisse claire, tambourin, triangle
MARCH = {'kick2': [(0, 90), (2, 84)], 'snare': [(1, 76), (3, 80), (3.5, 56)],
         'tambourine': [(x / 2, 50 if x % 2 else 64) for x in range(8)]}
pc.roll(drums, bar(3), 4, 38, 30, 96, rate=8)
pc.drums(drums, 4, 32, MARCH)
pc.drums(drums, 4, 32, {'triangle': [(0, 60)]}, skip=range(1, 32, 2))
for b in (4, 20, 28):
    drums.note(bar(b), 49, 2, 100)
for b in (11, 19, 27, 35):
    pc.fill(drums, bar(b, 3), ['snare', 'snare', 'tom_mid', 'tom_lo'], v0=70, v1=96)

# thème du Grimoire en majeur
pc.melody(flute, 4, THEME_MAJOR, vel=96, octave=1)
pc.melody(flute, 12, ANSWER_MAJOR, vel=96)
pc.melody(picc, 12, ANSWER_MAJOR, vel=70, octave=1)
pc.melody(strings, 12, ANSWER_MAJOR, vel=80, octave=-1)
pc.melody(horns, 20, HORNS, vel=98, octave=-1)
pc.melody(strings, 20, HORNS, vel=86)
pc.melody(tpt, 28, THEME_MAJOR, vel=100, octave=1)
pc.melody(flute, 28, THEME_MAJOR, vel=92, octave=1)
pc.melody(horns, 28, THEME_MAJOR, vel=90)
pc.melody(flute, 36, [[('B5', 2), ('A5', 2)], [('G5', 2), ('A5', 2)], [('F#5', 4)], [('E5', 2), ('C#5', 2)]], vel=90)
pc.scatter(glock, 4, 32, [n(x) for x in ('D6', 'F#6', 'A6', 'D7')], 1, vel=(50, 80), dur=0.5, grid=0.5)

ROOTS = {'D': 'D2', 'G': 'G1', 'A': 'A1', 'B': 'B1', 'E': 'E2', 'F': 'F#2'}
for i, s, d, c in segments(FORM):
    if s == 0 and i >= 4:
        timp.note(bar(i), ROOTS[c[0]], 1, pc.hum(84))
pc.roll(timp, bar(39, 2), 2, 'A1', 50, 100)

for b, t in ((0, 'Introduction'), (4, 'Theme'), (12, 'Reponse'), (20, 'Cors'), (28, 'Tutti'), (36, 'Cadence')):
    pc.marker(b, t)
pc.save(40)
