"""Donjon 4 - La crypte : harpe en boucle, chœur sur pédale, comme Hexen.

Ré mineur, 104 bpm, 48 mesures (1:51), en boucle. La harpe tourne en
doubles croches (fa mi ré la, la sixte mineure si bémol en voisine), la
guitare étouffée tient la pédale de ré, le chœur oscille do-ré ; mi bémol
(napolitain) pour l'ombre.

 0-7   harpe, guitare étouffée, chœur
 8-15  thème aux cordes, timbales, basse
 16-23 sol mineur : le chœur chante
 24-31 thème, cors à l'octave, batterie
 32-39 creux : harpe et cloches seules, puis remontée
 40-47 tutti, la harpe reste seule pour boucler
"""
from compose import Piece, GM, n

pc = Piece('dungeon_crypt', 104, 'Give Back My Grimoire! - Crypt', seed=31)
bar = pc.bar

harp = pc.track('Harpe', 0, GM['Harp'], volume=104, pan=36, reverb=100)
gtr = pc.track('Guitare etouffee', 1, GM['MutedGuitar'], volume=96, pan=84, reverb=50)
choir = pc.track('Choeur', 2, GM['ChoirAahs'], volume=104, pan=70, reverb=110)
strings = pc.track('Cordes', 3, GM['Strings1'], volume=104, pan=50, reverb=90)
timp = pc.track('Timbales', 4, GM['Timpani'], volume=92, pan=64, reverb=80)
bass = pc.track('Basse', 5, GM['FingerBass'], volume=94, pan=64, reverb=30)
horn = pc.track('Cors', 6, GM['FrenchHorn'], volume=96, pan=80, reverb=90)
bells = pc.track('Cloches', 7, GM['TubularBells'], volume=82, pan=30, reverb=120)
drums = pc.track('Batterie', 9, None, volume=90, reverb=70)

A = ['Dm', 'Dm', 'Bb', 'Dm', 'Gm', 'Dm', 'Eb', 'A']
B = ['Gm', 'Gm', 'Bb', 'Bb', 'Eb', 'Eb', 'A', 'A']
FORM = A + A + B + A + A + A
# figure de harpe par accord, répétée en doubles croches
HARP = {'Dm': ['F4', 'E4', 'D4', 'A4'], 'Bb': ['F4', 'E4', 'D4', 'Bb4'], 'Gm': ['G4', 'F4', 'D4', 'Bb4'],
        'Eb': ['G4', 'F4', 'Eb4', 'Bb4'], 'A': ['G4', 'E4', 'C#4', 'A4']}
THEME = [
    [('D5', 2), ('E5', 1), ('F5', 1)],
    [('A5', 3), ('G5', .5), ('F5', .5)],
    [('F5', 1.5), ('E5', .5), ('D5', 2)],
    [('A4', 4)],
    [('Bb4', 1.5), ('A4', .5), ('G4', 1), ('D5', 1)],
    [('F5', 3), ('E5', 1)],
    [('Eb5', 2), ('D5', 1), ('Bb4', 1)],
    [('C#5', 2), ('E5', 1), ('A4', 1)],
]
SONG = [
    [('G5', 2), ('F5', 1), ('D5', 1)],
    [('Bb4', 4)],
    [('D5', 1.5), ('Eb5', .5), ('F5', 2)],
    [('Bb5', 4)],
    [('G5', 2), ('Eb5', 2)],
    [('Bb4', 3), ('C5', 1)],
    [('C#5', 2), ('E5', 2)],
    [('A4', 4)],
]

# harpe : toute la pièce, plus douce dans les parties chantées
for b, c in enumerate(FORM):
    fig = HARP[c]
    for k in range(16):
        accent = 10 if k % 4 == 0 else 0
        harp.note(bar(b, k / 4), fig[k % 4], 0.3, pc.hum(72 + accent, 4))
harp.cc(0, 11, 110)
pc.swell(harp, 14, 16, 110, 88)
pc.swell(harp, 30, 32, 88, 120)
pc.swell(harp, 38, 40, 120, 92)
pc.swell(harp, 44, 48, 92, 116)

# guitare étouffée : pédale de ré en croches, silencieuse dans le creux
PEDAL = [(x / 2, 0.2, 86 if x % 4 == 0 else 62) for x in range(8)]
for b0, nb in ((0, 32), (36, 12)):
    for b in range(b0, b0 + nb):
        for t, d, v in PEDAL:
            gtr.note(bar(b, t), 'D2', d, pc.hum(v, 4))

# chœur : oscillation do-ré sur la pédale (intro, creux), accords ailleurs
for b0 in (0, 32):
    for k in range(4):
        choir.chord(bar(b0 + 2 * k), ['C3', 'C4'] if k % 2 == 0 else ['D3', 'D4'], 1.75, 70)
        choir.chord(bar(b0 + 2 * k, 1.75), ['D3', 'D4'], 6.25, 76)
pc.pad(choir, 8, A, vel=64, lo='A3', hi='A4')
pc.melody(choir, 16, SONG, vel=90, accent=0)
pc.pad(choir, 24, A, vel=74, lo='A3', hi='A4')
pc.pad(choir, 40, A, vel=80, lo='A3', hi='A4')

# thème
pc.melody(strings, 8, THEME, vel=92)
pc.pad(strings, 16, B, vel=66, lo='D3', hi='D4')
pc.melody(strings, 24, THEME, vel=96)
pc.melody(horn, 24, THEME, vel=88, octave=-1)
pc.melody(strings, 40, THEME, vel=100)
pc.melody(horn, 40, THEME, vel=94, octave=-1)
pc.swell(strings, 46, 48, 110, 50)
strings.cc(bar(8) - 0.01, 11, 110)

# basse, timbales
WALK = [(0, 1.5, 0), (1.5, 0.5, 0), (2, 1.5, 0), (3.5, 0.5, 12)]
pc.bass(bass, 8, A + B + A, WALK, lo='D1', vel=90)
pc.bass(bass, 40, A, WALK, lo='D1', vel=92)
ROOTS = {'Dm': 'D2', 'Bb': 'Bb1', 'Gm': 'G1', 'Eb': 'Eb2', 'A': 'A1'}
for b, c in enumerate(FORM):
    if 8 <= b < 32 or b >= 40:
        timp.note(bar(b), ROOTS[c], 1, pc.hum(90))
        timp.note(bar(b, 2.5), ROOTS[c], 0.5, pc.hum(70))
pc.roll(timp, bar(15, 2), 2, 'A1', 40, 104)
pc.roll(timp, bar(39, 2), 2, 'A1', 40, 116)

# batterie : discrète, cymbale charleston et grosse caisse façon Hexen
KIT = {'kick2': [(0, 96), (1.5, 74), (2, 90)], 'snare': [(3, 86)],
       'hh_closed': [(x / 4, 58 if x % 2 else 70) for x in range(16)]}
LIGHT = {'kick2': [(0, 84), (2, 76)], 'hh_pedal': [(1, 60), (3, 60)]}
pc.drums(drums, 8, 8, LIGHT)
pc.drums(drums, 16, 16, KIT)
pc.drums(drums, 40, 6, KIT)
for b in (16, 24, 40):
    drums.note(bar(b), 49, 2, 104)
for b in (23, 31, 45):
    pc.fill(drums, bar(b, 3), ['snare', 'tom_hi', 'tom_mid2', 'tom_lo'])

# cloches du creux
for b in (32, 34, 36, 38):
    bells.note(bar(b), 'D5', 3, 84)
    bells.note(bar(b, 2), 'A4', 2, 66)

for b, t in ((0, 'Harpe'), (8, 'Theme'), (16, 'Choeur'), (24, 'Cors'), (32, 'Creux'), (40, 'Tutti')):
    pc.marker(b, t)
pc.save(48)
