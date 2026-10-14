"""Donjon 2 - Les voûtes : mystérieux, à la Hexen (harpe 3+3+2, orgue).

La mineur, 72 bpm, 32 mesures (1:47), en boucle. Orgue d'église discret,
harpe en ostinato, violoncelle sur le thème, hautbois et chœur ensuite.

 0-7   harpe et orgue
 8-15  thème au violoncelle
 16-23 seconde partie : hautbois, chœur, timbales
 24-31 retour du thème, violoncelle et chœur, qui s'éteint
"""
from compose import Piece, GM, n

pc = Piece('dungeon_vaults', 72, 'Give Back My Grimoire! - Vaults', seed=22)
bar = pc.bar

harp = pc.track('Harpe', 0, GM['Harp'], volume=100, pan=34, reverb=90)
organ = pc.track('Orgue', 1, GM['ChurchOrgan'], volume=70, pan=64, reverb=100)
cello = pc.track('Violoncelle', 2, GM['Cello'], volume=100, pan=80, reverb=80)
oboe = pc.track('Hautbois', 3, GM['Oboe'], volume=96, pan=56, reverb=90)
choir = pc.track('Choeur', 4, GM['VoiceOohs'], volume=112, pan=90, reverb=110)
pizz = pc.track('Pizzicati', 5, GM['Pizzicato'], volume=100, pan=50, reverb=70)
timp = pc.track('Timbales', 6, GM['Timpani'], volume=84, pan=64, reverb=80)
cbass = pc.track('Contrebasse', 7, GM['Contrabass'], volume=88, pan=64, reverb=70)
perc = pc.track('Percussions', 9, None, volume=118, reverb=90)

A = ['Am', 'Am', 'F', 'F', 'Dm', 'E', 'Am', 'E']
B = ['F', 'G', 'Em', 'Am', 'Dm', 'Bdim', 'E', 'E']
CELLO = [
    [('A3', 2), ('C4', 1), ('B3', 1)],
    [('A3', 1), ('E4', 3)],
    [('F4', 1.5), ('E4', .5), ('D4', 1), ('C4', 1)],
    [('A3', 4)],
    [('D4', 2), ('F4', 1), ('E4', 1)],
    [('E4', 1), ('G#3', 1), ('B3', 2)],
    [('C4', 1), ('B3', 1), ('A3', 1), ('E4', 1)],
    [('E4', 4)],
]
OBOE = [
    [('C5', 2), ('A4', 2)],
    [('B4', 2), ('D5', 2)],
    [('E5', 2), ('G4', 2)],
    [('A4', 4)],
    [('F4', 1), ('A4', 1), ('D5', 2)],
    [('D5', 1), ('B4', 1), ('F4', 2)],
    [('E4', 2), ('G#4', 2)],
    [('B4', 4)],
]
FORM = A + A + B + A
SHAPE = [0, 2, 4, 1, 3, 5, 2, 4, 0, 2, 4, 1, 3, 5, 4, 2]

pc.arp(harp, 0, FORM, SHAPE, 'A2', 'A4', vel=60, accents={0, 3, 6, 8, 11, 14}, accent=14)
pc.pad(organ, 0, FORM, vel=64, lo='E3', hi='E4')
pc.bass(pizz, 0, FORM, [(0, 1, 0), (2, 1, 7)], lo='E1', vel=84)
pc.bass(cbass, 0, FORM, [(0, 3.9, 0)], lo='E1', vel=72)
pc.melody(cello, 8, CELLO, vel=92)
pc.melody(oboe, 16, OBOE, vel=86)
pc.pad(choir, 16, B, vel=70, lo='G3', hi='G4')
pc.melody(cello, 24, CELLO, vel=86)
pc.pad(choir, 24, A, vel=64, lo='A3', hi='A4')
pc.swell(choir, 28, 32, 110, 50)
choir.cc(bar(16) - 0.01, 11, 110)
pc.swell(organ, 0, 4, 60, 110)
pc.swell(organ, 28, 32, 110, 60)

ROOTS = {'Am': 'A1', 'F': 'F2', 'Dm': 'D2', 'E': 'E2', 'G': 'G1', 'Em': 'E2', 'Bdim': 'B1'}
for b, c in enumerate(FORM):
    if b >= 8 and b % 2 == 0:
        timp.note(bar(b), ROOTS[c], 1, pc.hum(72))
pc.roll(timp, bar(23, 2), 2, 'E2', 40, 100)
# clochettes et tambourin, très discrets
pc.drums(perc, 16, 8, {'triangle': [(0, 70)], 'tambourine': [(1.5, 56), (3.5, 56)]})
pc.drums(perc, 8, 8, {'triangle': [(0, 64)]}, skip=(1, 3, 5, 7))

for b, t in ((0, 'Harpe'), (8, 'Violoncelle'), (16, 'Hautbois'), (24, 'Retour')):
    pc.marker(b, t)
pc.save(32)
