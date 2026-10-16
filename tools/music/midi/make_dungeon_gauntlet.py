"""Donjon 7 - Le défilé : poursuite rapide, cordes synthétiques et guitare
à l'unisson en doubles croches, comme E2M3 de Heretic.

La mineur, 126 bpm, 48 mesures (1:31), en boucle. Le riff reste sur la
pédale de la (puis de ré dans la seconde partie) pendant que l'harmonie
tourne au-dessus ; si bémol (napolitain) et mi majeur pour la tension.

 0-3   riff seul
 4-7   batterie
 8-15  thème aux cuivres
 16-23 ré mineur : chœur et cordes
 24-31 thème, cordes à l'octave
 32-39 coupure : toms, timbales, cymbales inversées
 40-47 tutti
"""
from compose import Piece, GM, n

pc = Piece('dungeon_gauntlet', 126, 'Give Back My Grimoire! - Gauntlet', seed=47)
bar = pc.bar

synth = pc.track('Cordes synthetiques', 0, GM['SynthStrings1'], volume=100, pan=34, reverb=50)
gtr = pc.track('Guitare saturee', 1, GM['DistortionGuitar'], volume=84, pan=94, reverb=40)
bass = pc.track('Basse', 2, GM['Fretless'], volume=104, pan=64, reverb=25)
brass = pc.track('Cuivres', 3, GM['Brass'], volume=102, pan=70, reverb=70)
choir = pc.track('Choeur', 4, GM['ChoirAahs'], volume=104, pan=84, reverb=100)
strings = pc.track('Cordes', 5, GM['Strings1'], volume=102, pan=44, reverb=90)
timp = pc.track('Timbales', 6, GM['Timpani'], volume=94, pan=64, reverb=70)
rcym = pc.track('Cymbale inversee', 7, GM['ReverseCymbal'], volume=104, pan=64, reverb=60)
drums = pc.track('Batterie', 9, None, volume=100, reverb=50)

A = ['Am', 'Am', 'F', 'E', 'Am', 'Am', 'Bb', 'E']
B = ['Dm', 'Dm', 'Bb', 'Bb', 'Gm', 'Gm', 'A', 'A']
FORM = A + A + B + A + A + A
# riff de pédale : octave, septième, quinte, sixte mineure qui tire vers la quinte
RIFF = [0, 12, 0, 10, 0, 7, 0, 8, 0, 12, 0, 10, 0, 7, 8, 7]
PEDAL_A, PEDAL_B = ['A'] * 8, ['D'] * 8
THEME = [
    [('A4', 1), ('C5', 1), ('E5', 2)],
    [('D5', 1.5), ('C5', .5), ('B4', 1), ('C5', 1)],
    [('A4', 2), ('F5', 2)],
    [('E5', 3), ('G#4', 1)],
    [('A4', 1), ('B4', 1), ('C5', 1), ('E5', 1)],
    [('A5', 3), ('G5', 1)],
    [('F5', 1.5), ('D5', .5), ('Bb4', 2)],
    [('G#4', 2), ('B4', 2)],
]
SECOND = [
    [('D5', 2), ('F5', 2)],
    [('A5', 3), ('G5', 1)],
    [('F5', 2), ('D5', 2)],
    [('Bb4', 4)],
    [('G4', 1), ('Bb4', 1), ('D5', 1), ('G5', 1)],
    [('F5', 2), ('D5', 2)],
    [('E5', 2), ('C#5', 2)],
    [('A4', 4)],
]

# riff à l'unisson : cordes synthétiques et guitare, sauf dans la coupure
PED = PEDAL_A * 2 + PEDAL_B + PEDAL_A
pc.riff(synth, 0, PED, RIFF, 'A3', dur=0.22, vel=80, accents=(0, 8))
pc.riff(synth, 40, PEDAL_A, RIFF, 'A3', dur=0.22, vel=84, accents=(0, 8))
pc.riff(gtr, 4, PED[4:], RIFF, 'A2', dur=0.22, vel=78, accents=(0, 8))
pc.riff(gtr, 40, PEDAL_A, RIFF, 'A2', dur=0.22, vel=82, accents=(0, 8))
pc.swell(synth, 0, 4, 80, 116)

# basse : croches sur la fondamentale de l'harmonie
EIGHTHS = [(x / 2, 0.4, 12 if x in (3, 7) else 0) for x in range(8)]
pc.bass(bass, 4, FORM[4:32], EIGHTHS, lo='A1', vel=92)
pc.bass(bass, 32, A, [(0, 3.5, 0)], lo='A1', vel=96)
pc.bass(bass, 40, A, EIGHTHS, lo='A1', vel=96)

# thème et seconde partie
pc.melody(brass, 8, THEME, vel=98)
pc.melody(strings, 16, SECOND, vel=96)
pc.melody(choir, 16, SECOND, vel=82, accent=0, octave=-1)
pc.pad(brass, 16, B, vel=72, lo='D4', hi='D5')
pc.melody(brass, 24, THEME, vel=104)
pc.melody(strings, 24, THEME, vel=92, octave=1)
pc.pad(choir, 32, A, vel=78, lo='A3', hi='A4')
pc.melody(brass, 40, THEME, vel=108)
pc.melody(strings, 40, THEME, vel=96, octave=1)
pc.pad(choir, 40, A, vel=74, lo='A3', hi='A4')
choir.cc(0, 11, 110)

# timbales sur chaque mesure du thème
ROOTS = {'Am': 'A1', 'F': 'F2', 'E': 'E2', 'Bb': 'Bb1', 'Dm': 'D2', 'Gm': 'G1', 'A': 'A1'}
for b, c in enumerate(FORM):
    if 8 <= b < 32 or b >= 40:
        timp.note(bar(b), ROOTS[c], 1, pc.hum(92))
for b in range(32, 40):
    for t in (0, 0.75, 1.5, 2.5, 3):
        timp.note(bar(b, t), 'A1' if t != 2.5 else 'E2', 0.5, pc.hum(96 if t == 0 else 76))
pc.roll(timp, bar(39, 2), 2, 'E2', 50, 118)
for b in (7, 31, 39):
    rcym.note(bar(b, 1), 'C4', 3, 100)

KIT = {'kick2': [(0, 110), (0.75, 88), (2, 106), (2.5, 88)],
       'snare': [(1, 104), (3, 108)],
       'hh_closed': [(x / 4, 74 if x % 2 == 0 else 54) for x in range(16)]}
TOMS = {'tom_lo2': [(0, 104), (0.75, 84), (2, 98)], 'tom_lo': [(1.5, 86), (3.5, 80)],
        'tom_mid2': [(3, 90)], 'hh_pedal': [(1, 60), (3, 60)]}
pc.drums(drums, 4, 28, KIT)
pc.drums(drums, 32, 8, TOMS)
pc.drums(drums, 40, 8, KIT)
for b in (8, 16, 24, 40):
    drums.note(bar(b), 49, 2, 112)
for b in (15, 23, 31, 47):
    pc.fill(drums, bar(b, 2), ['snare'] * 4 + ['tom_hi', 'tom_mid2', 'tom_lo', 'tom_lo2'])

for b, t in ((0, 'Riff'), (8, 'Theme'), (16, 'Re mineur'), (24, 'Octave'), (32, 'Coupure'), (40, 'Tutti')):
    pc.marker(b, t)
pc.save(48)
