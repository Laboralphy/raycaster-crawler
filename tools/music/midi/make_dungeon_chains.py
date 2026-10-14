"""Donjon 3 - Les chaînes : pédale de do, guitare saturée, comme E1M1.

Do mineur, 100 bpm, 40 mesures (1:36), en boucle. Ré bémol (napolitain)
pour l'oppression, trombones sur le thème, cordes en seconde partie, coups
métalliques comme des chaînes qu'on traîne.

 0-7   pédale, guitare, toms
 8-15  thème aux trombones
 16-23 fa mineur : cordes et chœur
 24-31 thème, guitare saturée
 32-39 retombée : chaînes, timbales
"""
from compose import Piece, GM, n

pc = Piece('dungeon_chains', 100, 'Give Back My Grimoire! - Chains', seed=23)
bar = pc.bar

mgtr = pc.track('Guitare etouffee', 0, GM['MutedGuitar'], volume=108, pan=30, reverb=40)
dgtr = pc.track('Guitare saturee', 1, GM['DistortionGuitar'], volume=84, pan=96, reverb=40)
bass = pc.track('Basse', 2, GM['FingerBass'], volume=98, pan=64, reverb=25)
bone = pc.track('Trombones', 3, GM['Trombone'], volume=92, pan=70, reverb=70)
strings = pc.track('Cordes', 4, GM['Strings1'], volume=100, pan=44, reverb=80)
choir = pc.track('Choeur', 5, GM['ChoirAahs'], volume=104, pan=84, reverb=100)
timp = pc.track('Timbales', 6, GM['Timpani'], volume=90, pan=64, reverb=70)
drums = pc.track('Batterie', 9, None, volume=98, reverb=60)

A = ['Cm', 'Cm', 'Ab', 'G', 'Cm', 'Cm', 'Db', 'G']
B = ['Fm', 'Fm', 'Cm', 'Cm', 'Ab', 'Bb', 'G', 'G']
BONE = [
    [('C4', 1), ('C4', .5), ('Eb4', .5), ('G4', 2)],
    [('F4', 1), ('Eb4', 1), ('D4', 1), ('C4', 1)],
    [('Eb4', 2), ('C4', 2)],
    [('D4', 3), ('B3', 1)],
    [('C4', 1), ('G3', 1), ('C4', 1), ('Eb4', 1)],
    [('G4', 3), ('F4', 1)],
    [('F4', 2), ('Ab4', 1), ('F4', 1)],
    [('G4', 4)],
]
HIGH = [
    [('Ab4', 2), ('C5', 2)],
    [('F5', 4)],
    [('Eb5', 2), ('G4', 2)],
    [('C5', 4)],
    [('Eb5', 2), ('C5', 2)],
    [('D5', 2), ('F5', 2)],
    [('D5', 2), ('B4', 2)],
    [('G4', 4)],
]
FORM = A + A + B + A + A

# guitare étouffée : croches pointées sur la pédale, comme une machine
RIFF = [(0, 0.2, 96), (0.75, 0.2, 70), (1.5, 0.2, 84), (2, 0.2, 92), (2.75, 0.2, 70), (3.5, 0.2, 80)]
pc.pulse(mgtr, 0, FORM, RIFF, 'C2')
pc.bass(bass, 0, FORM, [(0, 0.7, 0), (0.75, 0.6, 0), (1.5, 0.45, 0), (2, 0.7, 0), (2.75, 0.6, 0), (3.5, 0.45, 12)],
        lo='C1', vel=92)
pc.swell(mgtr, 32, 40, 120, 70)
mgtr.cc(0, 11, 70)
pc.swell(mgtr, 0, 4, 70, 120)
# guitare saturée : accords de quinte sur les temps forts
pc.pulse(dgtr, 24, A + A, [(0, 1.4, 96), (2, 1.4, 88)], 'C3', intervals=(0, 7, 12))

KIT = {'kick2': [(0, 104), (0.75, 84), (2, 100), (2.75, 84)],
       'snare': [(1, 100), (3, 104)],
       'hh_closed': [(x / 2, 70 if x % 2 == 0 else 52) for x in range(8)]}
TOMS = {'tom_lo2': [(0, 96), (2, 84)], 'tom_lo': [(3.5, 70)]}
pc.drums(drums, 0, 8, TOMS)
pc.drums(drums, 8, 24, KIT)
pc.drums(drums, 32, 8, TOMS)
for b in (8, 16, 24):
    drums.note(bar(b), 49, 2, 108)
for b in (15, 23, 31):
    pc.fill(drums, bar(b, 2), ['snare'] * 4 + ['tom_hi', 'tom_mid2', 'tom_lo', 'tom_lo2'])
# chaînes : coups métalliques avec écho
for b in (2, 6, 34, 38):
    pc.echo(drums, bar(b, 3), 'ride_bell', 100, repeats=3, delay=0.5)
    pc.echo(drums, bar(b, 3.25), 'agogo_lo', 80, repeats=2, delay=0.5)

pc.melody(bone, 8, BONE, vel=96)
pc.melody(bone, 24, BONE, vel=104)
pc.melody(strings, 16, HIGH, vel=94)
pc.pad(choir, 16, B, vel=80, lo='G3', hi='G4')
pc.pad(strings, 24, A + A, vel=70, lo='C4', hi='C5')
pc.pad(choir, 32, A, vel=60, lo='G3', hi='G4')
pc.swell(choir, 32, 40, 100, 30)
choir.cc(bar(16) - 0.01, 11, 110)

ROOTS = {'Cm': 'C2', 'Ab': 'Ab1', 'G': 'G1', 'Db': 'Db2', 'Fm': 'F2', 'Bb': 'Bb1'}
for b, c in enumerate(FORM):
    timp.note(bar(b), ROOTS[c], 1, pc.hum(96 if 8 <= b < 32 else 80))
pc.roll(timp, bar(7, 2), 2, 'G1', 50, 110)
pc.roll(timp, bar(39, 2), 2, 'G1', 40, 100)

for b, t in ((0, 'Pedale'), (8, 'Trombones'), (16, 'Fa mineur'), (24, 'Saturee'), (32, 'Chaines')):
    pc.marker(b, t)
pc.save(40)
