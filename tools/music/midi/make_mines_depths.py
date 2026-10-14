"""Mines 1 - Les profondeurs : grotte immense, gouttes, pioches lointaines.

Fa mineur, 66 bpm, 28 mesures (1:42), en boucle. Bourdon grave, gouttes
d'eau (kalimba, pizzicati très réverbérés), coups de pioche en écho, basson
solitaire, chœur lointain.

 0-7   bourdon, gouttes, pioches
 8-15  basson et chœur
 16-23 si bémol mineur : cordes en trémolo qui montent, timbales
 24-27 retour au bourdon
"""
from compose import Piece, GM, n

pc = Piece('mines_depths', 66, 'Give Back My Grimoire! - Mine depths', seed=31)
bar = pc.bar

pad = pc.track('Nappe', 0, GM['BowedPad'], volume=92, pan=64, reverb=110)
cbass = pc.track('Contrebasse', 1, GM['Contrabass'], volume=84, pan=64, reverb=80)
kal = pc.track('Gouttes', 2, GM['Kalimba'], volume=127, pan=30, reverb=127)
pizz = pc.track('Gouttes pizz', 3, GM['Pizzicato'], volume=127, pan=100, reverb=127)
bsn = pc.track('Basson', 4, GM['Bassoon'], volume=96, pan=70, reverb=100)
choir = pc.track('Choeur', 5, GM['VoiceOohs'], volume=104, pan=40, reverb=120)
trem = pc.track('Tremolo', 6, GM['TremoloStrings'], volume=96, pan=56, reverb=100)
timp = pc.track('Timbales', 7, GM['Timpani'], volume=86, pan=64, reverb=100)
picks = pc.track('Pioches', 9, None, volume=124, reverb=127)

A = ['Fm', 'Fm', 'Db', 'Db', 'Fm', 'Fm', 'Gb', 'C']
B = ['Bbm', 'Bbm', 'Fm', 'Fm', 'Db', 'Ebm', 'C', 'C']
BASSOON = [
    [('F3', 2), ('Ab3', 2)],
    [('G3', 1), ('Ab3', 1), ('C4', 2)],
    [('Db4', 3), ('C4', 1)],
    [('Bb3', 2), ('Ab3', 2)],
    [('F3', 2), ('C3', 2)],
    [('Eb3', 1), ('F3', 1), ('Ab3', 2)],
    [('Gb3', 2), ('Bb3', 2)],
    [('C4', 2), ('E3', 2)],
]
FORM = A + A + B + A[:4]

pc.pad(pad, 0, FORM, vel=70, lo='C3', hi='C4')
pc.bass(cbass, 0, FORM, [(0, 3.9, 0)], lo='C1', vel=80)
pc.swell(pad, 0, 2, 50, 110)

# gouttes : quelques notes aiguës au hasard, dans la gamme de fa mineur
DROPS = [n(x) for x in ('F5', 'Ab5', 'C6', 'Db6', 'Eb6', 'F6', 'G5')]
pc.scatter(kal, 0, 28, DROPS, 1, vel=(70, 110), dur=0.5)
pc.scatter(pizz, 0, 28, [p + 12 for p in DROPS[:4]], 1, vel=(60, 96), dur=0.25, grid=0.5)

# coups de pioche lointains, en écho, irréguliers
for b, beat in ((1, 2), (3, 0.5), (5, 3), (9, 1), (12, 2.5), (14, 0), (19, 3), (22, 1.5), (25, 2)):
    pc.echo(picks, bar(b, beat), 'claves', 96, repeats=4, delay=0.6, decay=0.5)
    pc.echo(picks, bar(b, beat + 1.2), 'claves', 70, repeats=3, delay=0.6, decay=0.5)

pc.melody(bsn, 8, BASSOON, vel=92, legato=0.9)
pc.pad(choir, 8, A, vel=62, lo='Ab3', hi='Ab4')
choir.cc(bar(8) - 0.01, 11, 100)
pc.pad(trem, 16, B, vel=70, lo='F3', hi='F4')
trem.cc(0, 11, 30)
pc.swell(trem, 16, 23, 30, 120)
trem.cc(bar(24), 11, 30)
pc.pad(choir, 16, B, vel=70, lo='Bb3', hi='Bb4')
pc.swell(choir, 22, 24, 110, 20)
for b in (16, 18, 20):
    timp.note(bar(b), 'Bb1' if b < 18 else 'F2', 2, 70)
pc.roll(timp, bar(22), 8, 'C2', 30, 104)

for b, t in ((0, 'Bourdon'), (8, 'Basson'), (16, 'Montee'), (24, 'Retour')):
    pc.marker(b, t)
pc.save(28)
