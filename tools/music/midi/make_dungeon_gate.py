"""Donjon 1 - La porte : marche lourde, à la Heretic.

Ré phrygien (mi bémol), 92 bpm, 40 mesures (1:44), en boucle. Guitare
étouffée en ostinato, taiko, cuivres sur le thème, cordes et chœur sur la
seconde partie en sol mineur.

 0-7   ostinato, taiko, basse
 8-15  thème aux cuivres
 16-23 sol mineur : cordes et chœur
 24-31 thème à pleine voix
 32-39 la marche s'éloigne : timbales et cloche
"""
from compose import Piece, GM, n

pc = Piece('dungeon_gate', 92, 'Give Back My Grimoire! - Dungeon gate', seed=21)
bar = pc.bar

gtr = pc.track('Guitare etouffee', 0, GM['MutedGuitar'], volume=104, pan=90, reverb=40)
bass = pc.track('Basse', 1, GM['FingerBass'], volume=96, pan=64, reverb=25)
strings = pc.track('Cordes', 2, GM['Strings1'], volume=100, pan=40, reverb=70)
choir = pc.track('Choeur', 3, GM['ChoirAahs'], volume=106, pan=80, reverb=90)
brass = pc.track('Cuivres', 4, GM['Brass'], volume=100, pan=56, reverb=60)
timp = pc.track('Timbales', 5, GM['Timpani'], volume=92, pan=64, reverb=60)
taiko = pc.track('Taiko', 6, GM['Taiko'], volume=96, pan=64, reverb=60)
bells = pc.track('Cloche', 7, GM['TubularBells'], volume=84, pan=70, reverb=110)
drums = pc.track('Batterie', 9, None, volume=96, reverb=50)

A = ['Dm', 'Dm', 'Eb', 'Dm', 'Bb', 'C', 'Eb', 'Dm']
B = ['Gm', 'Gm', 'Eb', 'Eb', 'Cm', 'Cm', 'A', 'A']
MEL_A = [
    [('D4', 1.5), ('Eb4', .5), ('D4', 1), ('A3', 1)],
    [('F4', 1), ('G4', 1), ('A4', 2)],
    [('Bb4', 1.5), ('A4', .5), ('G4', 2)],
    [('A4', 3), ('F4', 1)],
    [('D5', 2), ('C5', 1), ('Bb4', 1)],
    [('C5', 1.5), ('Bb4', .5), ('G4', 2)],
    [('Bb4', 1), ('G4', 1), ('Eb4', 1), ('F4', 1)],
    [('D4', 4)],
]
MEL_B = [
    [('G4', 2), ('Bb4', 2)],
    [('D5', 3), ('C5', 1)],
    [('Bb4', 2), ('G4', 2)],
    [('Eb5', 4)],
    [('C5', 2), ('Eb5', 2)],
    [('G5', 3), ('F5', 1)],
    [('E5', 2), ('C#5', 2)],
    [('A4', 4)],
]
FORM = A + A + B + A + A
GUITAR = [(t / 4, 0.2, 90 if t % 4 == 0 else 66) for t in range(16) if t % 4 != 1]

# ostinato de guitare et basse sur tout le morceau
pc.pulse(gtr, 0, FORM, GUITAR, 'D2')
pc.bass(bass, 0, FORM, [(0, 1.4, 0), (1.5, 0.45, 0), (2, 1.4, 0), (3.5, 0.45, 12)], lo='D1')
pc.swell(gtr, 0, 4, 60, 120)
pc.swell(gtr, 36, 40, 120, 60)

# taiko et batterie
TAIKO = {'kick2': [(0, 100), (2, 90)]}
MARCH = {'kick2': [(0, 100), (0.75, 80), (2, 96), (2.5, 80)],
         'snare': [(1, 96), (3, 100)],
         'hh_closed': [(x / 2, 60 if x % 2 else 74) for x in range(8)]}
for b in range(0, 40):
    taiko.note(bar(b), 'C3', 1, pc.hum(96))
    taiko.note(bar(b, 2), 'C3', 1, pc.hum(80))
    if b % 2:
        taiko.note(bar(b, 3.5), 'C3', 0.5, pc.hum(70))
pc.drums(drums, 8, 24, MARCH)
pc.drums(drums, 32, 4, TAIKO)
for b in (8, 16, 24):
    drums.note(bar(b), 49, 2, 104)
for b in (11, 15, 19, 23, 27, 31):
    pc.fill(drums, bar(b, 3), ['snare', 'tom_hi', 'tom_mid2', 'tom_lo'])

# harmonie
pc.pad(strings, 0, FORM, vel=70, lo='D3', hi='D4')
pc.pad(choir, 16, B, vel=82, lo='G3', hi='G4')
pc.pad(choir, 24, A, vel=86, lo='A3', hi='A4')
pc.swell(strings, 32, 40, 110, 60)
strings.cc(0, 11, 70)
pc.swell(strings, 0, 8, 70, 110)

# mélodies
pc.melody(brass, 8, MEL_A, vel=96)
pc.melody(strings, 16, MEL_B, vel=92, octave=0)
pc.melody(choir, 16, MEL_B, vel=86, accent=0)
pc.melody(brass, 24, MEL_A, vel=104)
pc.melody(brass, 24, MEL_A, vel=90, octave=1)

# timbales
for b, c in enumerate(FORM):
    root = 'D2' if c in ('Dm',) else {'Eb': 'Eb2', 'Bb': 'Bb1', 'C': 'C2', 'Gm': 'G1', 'Cm': 'C2', 'A': 'A1'}[c]
    timp.note(bar(b), root, 1, pc.hum(92 if 8 <= b < 32 else 76))
pc.roll(timp, bar(31, 2), 2, 'A1', 50, 118)
pc.roll(timp, bar(39, 2), 2, 'D2', 30, 90)
for b in (32, 36):
    bells.chord(bar(b), ['D5', 'D4'], 3, 80)

for b, t in ((0, 'Ostinato'), (8, 'Theme'), (16, 'Sol mineur'), (24, 'Tutti'), (32, 'Eloignement')):
    pc.marker(b, t)
pc.save(40)
