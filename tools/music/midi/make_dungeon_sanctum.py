"""Donjon 4 - Le sanctuaire : couleur orientale (mi phrygien dominant).

Mi - fa - sol dièse - la - si - do - ré, 84 bpm, 32 mesures (1:31), en
boucle. Bourdon de cordes, tympanon en arpèges, shanai sur le thème,
hautbois et chœur ensuite, percussions sur peaux.

 0-7   bourdon, tympanon, percussions
 8-15  thème au shanai
 16-23 seconde partie : hautbois et chœur
 24-31 thème doublé, puis retour au bourdon
"""
from compose import Piece, GM, n

pc = Piece('dungeon_sanctum', 84, 'Give Back My Grimoire! - Sanctum', seed=24)
bar = pc.bar

drone = pc.track('Bourdon', 0, GM['Strings1'], volume=82, pan=64, reverb=90)
dulc = pc.track('Tympanon', 1, GM['Dulcimer'], volume=122, pan=36, reverb=80)
shanai = pc.track('Shanai', 2, GM['Shanai'], volume=116, pan=74, reverb=90)
oboe = pc.track('Hautbois', 3, GM['Oboe'], volume=100, pan=56, reverb=90)
choir = pc.track('Choeur', 4, GM['ChoirAahs'], volume=104, pan=90, reverb=110)
fretless = pc.track('Basse fretless', 5, GM['Fretless'], volume=100, pan=64, reverb=40)
taiko = pc.track('Taiko', 6, GM['Taiko'], volume=88, pan=64, reverb=70)
perc = pc.track('Percussions', 9, None, volume=92, reverb=70)

A = ['E', 'F', 'E', 'F', 'Am', 'Dm', 'F', 'E']
B = ['Am', 'G', 'F', 'E', 'Dm', 'Am', 'F', 'E']
SHANAI = [
    [('B4', 1), ('C5', .5), ('B4', .5), ('G#4', 1), ('E4', 1)],
    [('F4', 1), ('A4', 1), ('C5', 2)],
    [('B4', 1.5), ('A4', .5), ('G#4', 2)],
    [('A4', 1), ('C5', 1), ('F5', 2)],
    [('E5', 1), ('D5', .5), ('C5', .5), ('A4', 2)],
    [('D5', 1), ('F5', 1), ('A4', 2)],
    [('C5', 1.5), ('A4', .5), ('F4', 2)],
    [('E4', 4)],
]
OBOE = [
    [('A4', 2), ('C5', 2)],
    [('B4', 2), ('D5', 2)],
    [('C5', 2), ('A4', 2)],
    [('G#4', 2), ('B4', 2)],
    [('A4', 1), ('F4', 1), ('D4', 2)],
    [('E4', 2), ('A4', 2)],
    [('A4', 1), ('C5', 1), ('F5', 2)],
    [('E5', 4)],
]
FORM = A + A + B + A

# bourdon mi-si sur tout le morceau
for b in range(0, 32, 8):
    drone.chord(bar(b), ['E2', 'B2', 'E3'], 32, 76)
pc.swell(drone, 0, 2, 60, 110)
pc.arp(dulc, 0, FORM, [0, 1, 2, 3, 2, 1, 0, 2], 'E3', 'E5', vel=62, step=0.5, dur=0.6, accents={0, 4})
pc.bass(fretless, 0, FORM, [(0, 1.5, 0), (1.5, 0.5, 0), (2.5, 1.4, 7)], lo='E1', vel=88)

# percussions : peaux et tambourin, rythme 3+3+2
FRAME = {'conga_lo': [(0, 90), (1.5, 76), (3, 84)], 'bongo_hi': [(0.75, 50), (2.25, 54), (3.5, 60)],
         'tambourine': [(1, 44), (3, 48)]}
pc.drums(perc, 0, 32, FRAME)
for b in range(0, 32):
    taiko.note(bar(b), 'C3', 1, pc.hum(90 if b % 2 == 0 else 72))
for b in (7, 15, 23, 31):
    pc.fill(perc, bar(b, 3), ['bongo_hi', 'bongo_lo', 'conga_hi', 'conga_lo'])

pc.melody(shanai, 8, SHANAI, vel=88)
pc.melody(oboe, 16, OBOE, vel=90)
pc.pad(choir, 16, B, vel=72, lo='G3', hi='G4')
pc.melody(shanai, 24, SHANAI, vel=82)
pc.melody(oboe, 24, SHANAI, vel=78, octave=-1)
pc.pad(choir, 24, A[:4], vel=60, lo='G3', hi='G4')
pc.swell(choir, 24, 28, 110, 40)
choir.cc(bar(16) - 0.01, 11, 110)

for b, t in ((0, 'Bourdon'), (8, 'Shanai'), (16, 'Hautbois'), (24, 'Retour')):
    pc.marker(b, t)
pc.save(32)
