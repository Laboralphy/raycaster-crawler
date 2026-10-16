"""Mines - Le puits : profondeurs hostiles, comme « Deep » de Hexen.

Do mineur, 92 bpm, 40 mesures (1:44), en boucle. Guitare étouffée en
pédale grave (rythme 3+3+2 qui tourne en rond), nappe haute et froide,
violoncelles et chœur graves sur un thème lent, guitare saturée en coups
isolés ; ré bémol et fa dièse (le triton) pour ce qui rôde dans le noir.

 0-7   pédale et nappe
 8-15  thème grave aux cordes, timbales
 16-23 fa mineur, triton : chœur, coups de guitare saturée
 24-31 thème doublé à l'octave, batterie
 32-39 la pédale s'enfonce : chœur, gobelins, souffle
"""
from compose import Piece, GM, n

pc = Piece('mines_pit', 92, 'Give Back My Grimoire! - The pit', seed=53)
bar = pc.bar

gtr = pc.track('Guitare etouffee', 0, GM['MutedGuitar'], volume=110, pan=40, reverb=50)
pad = pc.track('Nappe', 1, GM['WarmPad'], volume=72, pan=90, reverb=120)
cello = pc.track('Violoncelles', 2, GM['Cello'], volume=108, pan=54, reverb=90)
choir = pc.track('Choeur', 3, GM['ChoirAahs'], volume=104, pan=76, reverb=120)
dist = pc.track('Guitare saturee', 4, GM['DistortionGuitar'], volume=86, pan=96, reverb=80)
timp = pc.track('Timbales', 5, GM['Timpani'], volume=96, pan=64, reverb=90)
bass = pc.track('Basse', 6, GM['FingerBass'], volume=96, pan=64, reverb=30)
gob = pc.track('Gobelins', 7, GM['Goblins'], volume=80, pan=20, reverb=120)
high = pc.track('Cordes aigues', 8, GM['Strings2'], volume=86, pan=100, reverb=120)
drums = pc.track('Batterie', 9, None, volume=92, reverb=80)

A = ['Cm', 'Cm', 'Cm', 'Cm', 'Ab', 'Ab', 'Db', 'Db']
B = ['Fm', 'Fm', 'F#', 'F#', 'Cm', 'Cm', 'G', 'G']
FORM = A + A + B + A + A
THEME = [
    [('C3', 3), ('Eb3', 1)],
    [('D3', 2), ('B2', 2)],
    [('C3', 4)],
    [('G2', 4)],
    [('Ab2', 2), ('C3', 2)],
    [('Eb3', 3), ('F3', 1)],
    [('Db3', 2), ('F3', 1), ('Ab3', 1)],
    [('G3', 4)],
]
CHANT = [
    [('F3', 2), ('Ab3', 2)],
    [('C4', 3), ('Bb3', 1)],
    [('A#3', 2), ('F#3', 2)],
    [('C#4', 4)],
    [('C4', 2), ('Eb4', 2)],
    [('D4', 3), ('C4', 1)],
    [('B3', 2), ('D4', 2)],
    [('G3', 4)],
]

# guitare : pédale de do, 3+3+2 en doubles croches, l'octave au bout du cycle
GROOVE = [0, 0, None, 12, 0, None, 0, None, 0, 0, None, 12, 0, None, 7, None]
PEDAL = ['C'] * 32 + ['C'] * 8
pc.riff(gtr, 0, PEDAL, GROOVE, 'C1', dur=0.18, vel=84, accents=(0, 3, 8, 11))
pc.swell(gtr, 0, 4, 64, 118)
pc.swell(gtr, 36, 40, 118, 70)

# nappe haute et froide, cordes aiguës qui tiennent une seconde mineure
pc.pad(pad, 0, FORM, vel=60, lo='G4', hi='G5', voices=2)
for b in (0, 4, 32, 36):
    high.chord(bar(b), ['G5', 'Ab5'], 15.5, 54)
pc.swell(high, 0, 8, 30, 100)

# thème grave
pc.melody(cello, 8, THEME, vel=96)
pc.melody(cello, 24, THEME, vel=104)
pc.melody(choir, 24, THEME, vel=80, accent=0, octave=1)
pc.melody(choir, 16, CHANT, vel=88, accent=0)
pc.pad(cello, 16, B, vel=72, lo='C3', hi='C4', voices=2)
# creux : le chœur tient l'harmonie, grave
pc.pad(choir, 32, A, vel=76, lo='G2', hi='G3', voices=2)
pc.swell(choir, 36, 40, 110, 50)
choir.cc(bar(16) - 0.01, 11, 110)

# guitare saturée : coups isolés qui résonnent, sur les temps faibles
for b, c in enumerate(FORM):
    if 16 <= b < 32 and b % 2 == 0:
        r = {'Fm': 'F2', 'F#': 'F#2', 'Cm': 'C2', 'G': 'G2', 'Ab': 'Ab2', 'Db': 'Db2'}[c]
        dist.chord(bar(b, 1.5), [n(r), n(r) + 7, n(r) + 12], 2, pc.hum(92))

# basse et timbales
pc.bass(bass, 8, FORM[8:32], [(0, 2.5, 0), (2.5, 0.5, 0), (3, 1, 7)], lo='C1', vel=90)
ROOTS = {'Cm': 'C2', 'Ab': 'Ab1', 'Db': 'Db2', 'Fm': 'F2', 'F#': 'F#2', 'G': 'G1'}
for b, c in enumerate(FORM):
    if 8 <= b < 32:
        timp.note(bar(b), ROOTS[c], 1.5, pc.hum(92 if b % 2 == 0 else 74))
pc.roll(timp, bar(15, 2), 2, 'G1', 40, 104)
pc.roll(timp, bar(31, 1), 3, 'G1', 40, 112)
for b in range(32, 40, 2):
    timp.note(bar(b), ROOTS[FORM[b]], 2, pc.hum(76))

# batterie : grosse caisse lourde et cerclage, sans cymbale charleston
HEAVY = {'kick': [(0, 104), (2.5, 90)], 'snare': [(3, 92)], 'stick': [(1.5, 60)], 'ride': [(0, 58), (2, 54)]}
pc.drums(drums, 24, 8, HEAVY)
pc.drums(drums, 16, 8, {'kick': [(0, 96)], 'stick': [(1.5, 56), (3.5, 56)]})
drums.note(bar(24), 49, 2, 104)

# gobelins et souffles dans le noir
for b in (6, 22, 34, 38):
    gob.note(bar(b, 1), 'C3', 3, 70)
pc.scatter(gob, 32, 8, [n('C2'), n('F#2')], 1, vel=(40, 70), dur=1.5, grid=1)

for b, t in ((0, 'Pedale'), (8, 'Theme'), (16, 'Triton'), (24, 'Octave'), (32, 'Profondeurs')):
    pc.marker(b, t)
pc.save(40)
