"""Boss - La reine Méduse : combat sous l'eau, rapide.

Fa dièse mineur, 132 bpm, 48 mesures (1:27), en boucle. Cordes en doubles
croches, taiko et batterie, basse de synthé, cuivres sur le thème, chœur en
accords frappés, harpe et vibraphone pour l'eau ; sol majeur (napolitain)
pour le venin.

 0-7   ostinato de cordes et batterie qui monte
 8-15  thème aux cuivres
 16-23 si mineur : chœur et cordes
 24-31 thème, chœur en accords frappés
 32-39 le chant de la reine : harpe, gouttes, taiko seuls, puis remontée
 40-47 seconde partie à pleine voix
"""
from compose import Piece, GM, n, segments, bass_note, tones

pc = Piece('boss_medusa', 132, 'Give Back My Grimoire! - Medusa queen', seed=42)
bar = pc.bar

ost = pc.track('Cordes ostinato', 0, GM['Strings1'], volume=127, pan=40, reverb=60)
sbass = pc.track('Basse synthe', 1, GM['SynthBass1'], volume=86, pan=64, reverb=30)
brass = pc.track('Cuivres', 2, GM['Brass'], volume=104, pan=76, reverb=70)
choir = pc.track('Choeur', 3, GM['ChoirAahs'], volume=112, pan=88, reverb=90)
harp = pc.track('Harpe', 4, GM['Harp'], volume=96, pan=20, reverb=100)
vib = pc.track('Vibraphone', 5, GM['Vibraphone'], volume=120, pan=100, reverb=110)
taiko = pc.track('Taiko', 6, GM['Taiko'], volume=100, pan=64, reverb=70)
timp = pc.track('Timbales', 7, GM['Timpani'], volume=88, pan=64, reverb=70)
drops = pc.track('Gouttes', 8, GM['EchoDrops'], volume=86, pan=64, reverb=120)
drums = pc.track('Batterie', 9, None, volume=96, reverb=60)
pad = pc.track('Nappe', 10, GM['SweepPad'], volume=76, pan=64, reverb=110)
rcym = pc.track('Cymbale inversee', 11, GM['ReverseCymbal'], volume=110, pan=64, reverb=60)

A = ['F#m', 'F#m', 'D', 'E', 'F#m', 'F#m', 'D', 'C#']
B = ['Bm', 'Bm', 'D', 'D', 'G', 'G', 'C#', 'C#']
BRASS = [
    [('F#4', 1.5), ('A4', .5), ('C#5', 2)],
    [('B4', 1), ('A4', 1), ('G#4', 1), ('A4', 1)],
    [('F#4', 1), ('A4', 1), ('D5', 2)],
    [('E5', 2), ('B4', 2)],
    [('C#5', 1.5), ('A4', .5), ('F#4', 2)],
    [('G#4', 1), ('A4', 1), ('B4', 1), ('C#5', 1)],
    [('D5', 1.5), ('C#5', .5), ('A4', 2)],
    [('C#5', 2), ('E#4', 2)],
]
HIGH = [
    [('B4', 2), ('D5', 2)],
    [('F#5', 3), ('E5', 1)],
    [('D5', 2), ('A4', 2)],
    [('F#5', 4)],
    [('G5', 2), ('D5', 2)],
    [('B4', 2), ('G4', 2)],
    [('G#4', 2), ('C#5', 2)],
    [('C#5', 4)],
]
FORM = A + A + B + A + A + B

# cordes en doubles croches : fondamentale, quinte, octave, quinte
OST = [0, 0, 7, 0, 12, 0, 7, 0, 0, 0, 7, 0, 12, 7, 3, 7]
for i, s, d, c in segments(FORM):
    if 32 <= i < 36:
        continue
    r = bass_note(c, 'F#2')
    for k in range(16):
        ost.note(bar(i, k / 4), r + OST[k], 0.2, pc.hum(100 if k % 4 == 0 else 80))
ost.cc(0, 11, 70)
pc.swell(ost, 0, 8, 70, 120)
pc.bass(sbass, 0, FORM, [(x / 2, 0.4, 12 if x == 7 else 0) for x in range(8)], lo='F#1', vel=96)

KIT = {'kick2': [(0, 108), (1.5, 90), (2, 104), (3.5, 86)],
       'snare': [(1, 104), (3, 110)],
       'hh_closed': [(x / 2, 74 if x % 2 == 0 else 54) for x in range(8)]}
INTRO = {'kick2': [(0, 100), (2, 96)], 'hh_closed': [(x / 2, 50) for x in range(8)]}
pc.drums(drums, 0, 8, INTRO)
pc.drums(drums, 8, 24, KIT)
pc.drums(drums, 36, 12, KIT)
for b in (8, 16, 24, 40):
    drums.note(bar(b), 49, 2, 110)
for b in (7, 15, 23, 31, 39, 47):
    pc.fill(drums, bar(b, 2), ['snare', 'snare', 'tom_hi', 'tom_hi2', 'tom_mid', 'tom_mid2', 'tom_lo', 'tom_lo2'])
for b in range(48):
    taiko.note(bar(b), 'C3', 1, pc.hum(100))
    if b >= 32 and b < 36 or b % 2:
        taiko.note(bar(b, 2.5), 'C3', 1, pc.hum(80))

pc.melody(brass, 8, BRASS, vel=100)
pc.melody(ost, 16, HIGH, vel=88, octave=1)
pc.pad(choir, 16, B, vel=84, lo='F#3', hi='F#4')
pc.melody(brass, 24, BRASS, vel=108)
# chœur en accords frappés sur les temps 1 et 2+
for i, s, d, c in segments(A):
    for x in (0, 1.5):
        choir.chord(bar(24 + i, x), tones(c, 'A3', 'A4')[:3], 0.6, pc.hum(96))
pc.melody(brass, 40, HIGH, vel=110)
pc.melody(choir, 40, HIGH, vel=92, accent=0)
pc.pad(pad, 0, FORM, vel=60, lo='C#4', hi='C#5')

# eau : harpe et vibraphone en reflets, gouttes
pc.arp(harp, 32, A[:4] + A[4:], [0, 2, 4, 6, 4, 2], 'F#3', 'F#5', vel=72, step=0.25, dur=0.6)
pc.scatter(drops, 32, 8, [n(x) for x in ('C#5', 'F#5', 'A5', 'C#6')], 2, vel=(50, 90), dur=1)
pc.scatter(vib, 0, 48, [n(x) for x in ('F#5', 'A5', 'C#6', 'E6')], 1, vel=(36, 64), dur=1, grid=0.5)
pc.melody(vib, 32, [[(p, d)] for p, d in (('F#5', 4), ('E5', 4), ('D5', 4), ('C#5', 4))], vel=80)

ROOTS = {'F#m': 'F#1', 'D': 'D2', 'E': 'E2', 'C#': 'C#2', 'Bm': 'B1', 'G': 'G1'}
for b, c in enumerate(FORM):
    timp.note(bar(b), ROOTS[c], 1, pc.hum(100))
pc.roll(timp, bar(36), 16, 'C#2', 24, 92, rate=8)
for b in (8, 16, 40):
    rcym.note(bar(b) - 4.5, 'C4', 4.5, 100)

for b, t in ((0, 'Ostinato'), (8, 'Theme'), (16, 'Si mineur'), (24, 'Choeur frappe'),
             (32, 'Chant de la reine'), (40, 'Tutti')):
    pc.marker(b, t)
pc.save(48)
