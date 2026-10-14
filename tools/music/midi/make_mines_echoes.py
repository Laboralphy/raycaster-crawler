"""Mines 2 - Les échos : galeries, marimba étouffé, pioches qui résonnent.

Si mineur, 84 bpm, 32 mesures (1:31), en boucle. Ostinato de marimba en
3+3+2, bloc de bois, clarinette basse sur le thème, vibraphone et kalimba
en échos ; do majeur (napolitain) pour la descente.

 0-7   marimba, bloc de bois, basse
 8-15  thème à la clarinette
 16-23 seconde partie : vibraphone, kalimba, toms
 24-31 thème et échos, puis retour à l'ostinato
"""
from compose import Piece, GM, n

pc = Piece('mines_echoes', 84, 'Give Back My Grimoire! - Mine echoes', seed=32)
bar = pc.bar

mar = pc.track('Marimba', 0, GM['Marimba'], volume=104, pan=40, reverb=90)
bass = pc.track('Basse fretless', 1, GM['Fretless'], volume=100, pan=64, reverb=50)
clar = pc.track('Clarinette', 2, GM['Clarinet'], volume=108, pan=76, reverb=100)
vib = pc.track('Vibraphone', 3, GM['Vibraphone'], volume=124, pan=56, reverb=110)
kal = pc.track('Kalimba', 4, GM['Kalimba'], volume=124, pan=96, reverb=127)
pad = pc.track('Nappe', 5, GM['WarmPad'], volume=78, pan=64, reverb=100)
perc = pc.track('Percussions', 9, None, volume=100, reverb=100)

A = ['Bm', 'Bm', 'G', 'A', 'Bm', 'Bm', 'Em', 'F#']
B = ['G', 'G', 'Em', 'Em', 'C', 'C', 'F#', 'F#']
CLAR = [
    [('B3', 2), ('D4', 1), ('C#4', 1)],
    [('B3', 1), ('F#4', 3)],
    [('G4', 1.5), ('F#4', .5), ('E4', 1), ('D4', 1)],
    [('E4', 2), ('C#4', 2)],
    [('D4', 1), ('F#4', 1), ('B4', 2)],
    [('A4', 1), ('G4', 1), ('F#4', 2)],
    [('G4', 2), ('E4', 2)],
    [('F#4', 2), ('A#3', 2)],
]
HIGH = [
    [('D5', 2), ('B4', 2)],
    [('G4', 4)],
    [('E5', 2), ('B4', 2)],
    [('G4', 4)],
    [('E5', 2), ('C5', 2)],
    [('G4', 4)],
    [('F#4', 2), ('A#4', 2)],
    [('C#5', 4)],
]
FORM = A + A + B + A
SHAPE = [0, 1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1, 2, 3, 1]

pc.arp(mar, 0, FORM, SHAPE, 'B2', 'B4', vel=66, step=0.25, dur=0.2, accents={0, 3, 6, 8, 11, 14})
pc.bass(bass, 0, FORM, [(0, 1.4, 0), (1.5, 0.4, 0), (2, 1.9, 7)], lo='B0', vel=90)
pc.pad(pad, 0, FORM, vel=56, lo='D3', hi='D4')
WOOD = {'woodblock_lo': [(0, 76), (1.5, 60), (3, 66)], 'woodblock_hi': [(0.75, 44), (2.25, 48)],
        'shaker': [(x / 2, 30) for x in range(8)]}
pc.drums(perc, 0, 32, WOOD)
pc.drums(perc, 16, 8, {'tom_lo2': [(0, 84), (2.5, 70)], 'tom_lo': [(3.5, 60)]})
# pioches qui résonnent dans les galeries
for b, beat in ((2, 3), (6, 1), (13, 2), (21, 3), (27, 1)):
    pc.echo(perc, bar(b, beat), 'agogo_lo', 100, repeats=4, delay=0.75, decay=0.55)

pc.melody(clar, 8, CLAR, vel=90)
pc.melody(vib, 16, HIGH, vel=84, legato=1)
for i, notes in enumerate(HIGH):
    # la kalimba répète la note du vibraphone une croche pointée plus tard
    p, d = notes[0]
    pc.echo(kal, bar(16 + i, 0.75), p, 70, repeats=2, delay=0.75, decay=0.6)
pc.melody(clar, 24, CLAR, vel=86)
pc.melody(vib, 24, CLAR, vel=60, octave=1, legato=1)
pc.swell(clar, 30, 32, 110, 60)
clar.cc(bar(32) - 0.01, 11, 110)

for b, t in ((0, 'Ostinato'), (8, 'Clarinette'), (16, 'Echos'), (24, 'Retour')):
    pc.marker(b, t)
pc.save(32)
