"""Donjon 6 - Le requiem : valse funèbre à l'orgue, à trois temps.

Mi mineur, 3/4, 132 bpm, 72 mesures (1:38), en boucle. Orgue d'église,
violoncelles et contrebasses en noires, chœur, cor puis cordes sur le thème ;
fa majeur (napolitain) au cœur de la seconde partie, cloches sur les creux.

 0-7   orgue et basses
 8-15  thème au cor
 16-23 thème aux cordes, chœur
 24-39 seconde partie (do, la mineur, fa napolitain), deux fois, en montant
 40-47 creux : cloches, timbales, orgue grave
 48-63 thème à pleine voix, puis à l'octave
 64-71 retour de l'introduction
"""
from compose import Piece, GM, n, bass_note

pc = Piece('dungeon_requiem', 132, 'Give Back My Grimoire! - Requiem', beats=3, seed=43)
bar = pc.bar

organ = pc.track('Orgue', 0, GM['ChurchOrgan'], volume=84, pan=64, reverb=110)
low = pc.track('Violoncelles', 1, GM['Cello'], volume=104, pan=44, reverb=70)
cb = pc.track('Contrebasses', 2, GM['Contrabass'], volume=100, pan=54, reverb=70)
choir = pc.track('Choeur', 3, GM['ChoirAahs'], volume=104, pan=84, reverb=110)
strings = pc.track('Cordes', 4, GM['Strings1'], volume=104, pan=34, reverb=90)
horn = pc.track('Cor', 5, GM['FrenchHorn'], volume=100, pan=76, reverb=90)
timp = pc.track('Timbales', 6, GM['Timpani'], volume=94, pan=64, reverb=80)
bells = pc.track('Cloches', 7, GM['TubularBells'], volume=84, pan=96, reverb=120)
drums = pc.track('Batterie', 9, None, volume=88, reverb=80)

A = ['Em', 'Em', 'C', 'C', 'Am', 'B', 'Em', 'B']
B = ['C', 'C', 'Am', 'Am', 'F', 'F', 'B', 'B']
FORM = A * 3 + B * 2 + A + A * 2 + A
THEME = [
    [('B4', 2), ('E5', 1)],
    [('G5', 2), ('F#5', 1)],
    [('E5', 1.5), ('D5', .5), ('C5', 1)],
    [('E5', 3)],
    [('A4', 1), ('C5', 1), ('E5', 1)],
    [('D#5', 2), ('F#5', 1)],
    [('G5', 1.5), ('F#5', .5), ('E5', 1)],
    [('B4', 3)],
]
SECOND = [
    [('E5', 2), ('G5', 1)],
    [('C6', 3)],
    [('A5', 2), ('E5', 1)],
    [('C5', 3)],
    [('F5', 2), ('A5', 1)],
    [('C6', 2), ('A5', 1)],
    [('B5', 1.5), ('A5', .5), ('F#5', 1)],
    [('D#5', 3)],
]

# basses : la valse, fondamentale sur le premier temps, quinte sur les autres
for b, c in enumerate(FORM):
    if 40 <= b < 48:
        continue
    r = bass_note(c, 'E2')
    low.note(bar(b), r, 0.9, pc.hum(96))
    low.note(bar(b, 1), r + 7, 0.8, pc.hum(70))
    low.note(bar(b, 2), r + 12, 0.8, pc.hum(72))
    cb.note(bar(b), r - 12, 2.8, pc.hum(92))

# orgue : accords tenus, grave seul dans le creux
pc.pad(organ, 0, FORM[:40], vel=70, lo='E3', hi='E4', voices=4)
for b in range(40, 48):
    organ.chord(bar(b), ['E2', 'B2'] if b % 4 < 2 else ['F2', 'C3'], 3, 74)
pc.pad(organ, 48, FORM[48:], vel=74, lo='E3', hi='E4', voices=4)

# thème et seconde partie
pc.melody(horn, 8, THEME, vel=94)
pc.melody(strings, 16, THEME, vel=94)
pc.pad(choir, 16, A, vel=70, lo='G3', hi='G4')
pc.melody(strings, 24, SECOND, vel=92)
pc.pad(choir, 24, B, vel=66, lo='G3', hi='G4')
pc.melody(strings, 32, SECOND, vel=102)
pc.melody(choir, 32, SECOND, vel=90, accent=0, octave=-1)
pc.melody(horn, 32, SECOND, vel=90, octave=-1)
pc.melody(horn, 48, THEME, vel=100)
pc.melody(strings, 48, THEME, vel=96)
pc.pad(choir, 48, A, vel=80, lo='G3', hi='G4')
pc.melody(strings, 56, THEME, vel=104, octave=1)
pc.melody(horn, 56, THEME, vel=100)
pc.melody(choir, 56, THEME, vel=88, accent=0)
pc.swell(strings, 60, 64, 120, 70)
strings.cc(0, 11, 120)

# timbales et cloches
ROOTS = {'Em': 'E2', 'C': 'C2', 'Am': 'A1', 'B': 'B1', 'F': 'F2'}
for b, c in enumerate(FORM):
    if 8 <= b < 40 or 48 <= b < 64:
        timp.note(bar(b), ROOTS[c], 1, pc.hum(88 if b % 2 == 0 else 72))
for b in range(40, 48):
    timp.note(bar(b), 'E2' if b % 4 < 2 else 'F2', 1, pc.hum(80))
    if b % 2:
        timp.note(bar(b, 2), 'B1', 1, pc.hum(64))
pc.roll(timp, bar(23, 1), 2, 'B1', 40, 104)
pc.roll(timp, bar(47, 0), 3, 'B1', 30, 116)
for b in (40, 42, 44, 46):
    bells.chord(bar(b), ['E5', 'B4'] if b % 4 == 0 else ['F5', 'C5'], 5, 82)
for b in (0, 64):
    bells.note(bar(b), 'E4', 5, 70)

# batterie : grosse caisse sur le premier temps, roulements aux charnières
WALTZ = {'kick': [(0, 96)], 'ride': [(1, 54), (2, 58)]}
pc.drums(drums, 16, 24, WALTZ)
pc.drums(drums, 48, 16, WALTZ)
for b in (16, 24, 32, 48, 56):
    drums.note(bar(b), 49, 2, 100)
for b in (31, 39, 55, 63):
    pc.roll(drums, bar(b), 3, 38, 40, 100, rate=8)

for b, t in ((0, 'Orgue'), (8, 'Cor'), (16, 'Cordes'), (24, 'Seconde partie'), (40, 'Creux'),
             (48, 'Tutti'), (64, 'Retour')):
    pc.marker(b, t)
pc.save(72)
