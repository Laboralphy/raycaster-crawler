"""Donjon 5 - Le rituel : triton et guitare saturée, comme E1M1 de Heretic.

Do phrygien, 112 bpm, 48 mesures (1:43), en boucle. Les cordes alternent
do-sol et fa dièse-si bémol (le triton), la guitare saturée martèle un riff
chromatique en doubles croches, les timbales roulent sur la pédale, les
percussions grouillent (cabasa, maracas, tambourin, china).

 0-7   riff, timbales, cordes en triton
 8-15  thème aux cordes synthétiques, batterie
 16-23 la bémol : chœur et cuivres, riff transposé
 24-31 thème aux cuivres, cordes à l'octave
 32-39 cérémonie : timbales, chœur, cymbales inversées
 40-47 tutti
"""
from compose import Piece, GM, n

pc = Piece('dungeon_ritual', 112, 'Give Back My Grimoire! - Ritual', seed=37)
bar = pc.bar

gtr = pc.track('Guitare saturee', 0, GM['DistortionGuitar'], volume=92, pan=88, reverb=40)
strings = pc.track('Cordes', 1, GM['Strings1'], volume=100, pan=40, reverb=90)
timp = pc.track('Timbales', 2, GM['Timpani'], volume=96, pan=64, reverb=60)
bass = pc.track('Basse', 3, GM['FingerBass'], volume=100, pan=64, reverb=25)
lead = pc.track('Cordes synthetiques', 4, GM['SynthStrings1'], volume=100, pan=70, reverb=80)
choir = pc.track('Choeur', 5, GM['ChoirAahs'], volume=104, pan=30, reverb=110)
brass = pc.track('Cuivres', 6, GM['Brass'], volume=100, pan=60, reverb=70)
rcym = pc.track('Cymbale inversee', 7, GM['ReverseCymbal'], volume=100, pan=64, reverb=60)
drums = pc.track('Batterie', 9, None, volume=96, reverb=55)

A = ['C'] * 8
B = ['Ab', 'Ab', 'F#', 'F#', 'Db', 'Db', 'G', 'G']
FORM = A + A + B + A + A + A
# riff sur deux mesures : quinte à vide, triton, demi-ton qui retombe
RIFF = [0, 0, None, 0, 3, None, 0, None, 6, None, 5, None, 3, None, 1, None,
        0, 0, None, 0, 3, None, 0, None, 7, 6, 5, None, 3, 1, 0, None]
THEME = [
    [('C5', 1.5), ('Db5', .5), ('C5', 1), ('G4', 1)],
    [('F#4', 3), ('G4', 1)],
    [('Ab4', 1), ('G4', 1), ('F4', 1), ('Eb4', 1)],
    [('Db4', 2), ('C4', 2)],
    [('C5', 1), ('Eb5', 1), ('F#5', 2)],
    [('G5', 2), ('F5', 1), ('Eb5', 1)],
    [('Db5', 1.5), ('C5', .5), ('Bb4', 1), ('Ab4', 1)],
    [('G4', 2), ('F#4', 2)],
]
HYMN = [
    [('Ab4', 2), ('C5', 2)],
    [('Eb5', 3), ('Db5', 1)],
    [('C#5', 2), ('A#4', 2)],
    [('F#4', 4)],
    [('F4', 2), ('Ab4', 2)],
    [('Db5', 3), ('C5', 1)],
    [('B4', 2), ('D5', 2)],
    [('G4', 4)],
]

# guitare : riff partout sauf dans la cérémonie
for b0, prog in ((0, A + A + B + A), (40, A)):
    pc.riff(gtr, b0, prog, RIFF, 'C2', dur=0.22, vel=82, accents=(0, 8, 16, 24), intervals=(0, 7))
pc.swell(gtr, 0, 4, 70, 120)
pc.riff(bass, 0, A + A + B + A, RIFF, 'C1', dur=0.22, vel=90)
pc.riff(bass, 40, A, RIFF, 'C1', dur=0.22, vel=92)

# cordes en triton : do-sol / fa dièse-si bémol, deux mesures chacun
# (sous le thème, la quinte seule : le triton y heurterait le fa dièse)
for b in range(0, 48, 2):
    if 16 <= b < 24:
        continue
    theme = 8 <= b < 16 or b >= 24 and not 32 <= b < 40
    pair = ['C3', 'G3'] if b % 4 == 0 or theme else ['F#3', 'Bb3']
    strings.chord(bar(b), pair, 7.5, pc.hum(74))
pc.pad(strings, 16, B, vel=72, lo='C3', hi='C4')
pc.melody(strings, 24, THEME, vel=88, octave=1)
pc.melody(strings, 40, THEME, vel=92, octave=1)

# timbales : doubles croches sur la pédale, accent toutes les trois
TIMP = [(0 if k % 8 != 6 else 6) for k in range(16)]
pc.riff(timp, 0, A + A, TIMP, 'C2', dur=0.2, vel=64, accents=(0, 3, 6, 10, 13))
pc.riff(timp, 32, A, TIMP, 'C2', dur=0.2, vel=74, accents=(0, 3, 6, 10, 13))
pc.riff(timp, 40, A, TIMP, 'C2', dur=0.2, vel=68, accents=(0, 3, 6, 10, 13))
ROOTS = {'Ab': 'Ab1', 'F#': 'F#2', 'Db': 'Db2', 'G': 'G1'}
for b, c in enumerate(B):
    timp.note(bar(16 + b), ROOTS[c], 1, 96)
pc.roll(timp, bar(23, 2), 2, 'G1', 40, 112)
for b in range(24, 32):
    timp.note(bar(b), 'C2', 1, pc.hum(92))

# thème, hymne
pc.melody(lead, 8, THEME, vel=94)
pc.melody(brass, 16, HYMN, vel=96)
pc.melody(choir, 16, HYMN, vel=84, accent=0, octave=-1)
pc.melody(brass, 24, THEME, vel=102)
pc.melody(brass, 40, THEME, vel=106)
pc.melody(lead, 40, THEME, vel=90)
# cérémonie : chœur sur le triton, cymbales inversées vers chaque retour
for b in (32, 34, 36, 38):
    choir.chord(bar(b), ['C3', 'G3', 'C4'] if b % 4 == 0 else ['F#3', 'C4', 'F#4'], 7.5, 86)
pc.pad(choir, 24, ['C5'] * 8, vel=60, lo='G3', hi='G4')
for b in (7, 15, 23, 31, 39):
    rcym.note(bar(b, 1), 'C4', 3, 96)

# batterie : grosse caisse et caisse claire, mais surtout les petites percussions
KIT = {'kick2': [(0, 108), (1.5, 86), (2, 104), (2.75, 84)],
       'snare': [(1, 102), (3, 106)],
       'cabasa': [(x / 4, 70 if x % 2 else 50) for x in range(16)],
       'maracas': [(x / 2 + 0.25, 62) for x in range(8)],
       'tambourine': [(1, 70), (3, 74)],
       'china': [(3.5, 78)]}
RITE = {'cabasa': [(x / 4, 60 if x % 2 else 44) for x in range(16)],
        'tambourine': [(0, 74), (2, 66)], 'splash': [(0, 64)]}
pc.drums(drums, 4, 4, RITE)
pc.drums(drums, 8, 24, KIT)
pc.drums(drums, 32, 8, RITE)
pc.drums(drums, 40, 8, KIT)
for b in (8, 16, 24, 40):
    drums.note(bar(b), 49, 2, 110)
for b in (15, 23, 31, 47):
    pc.fill(drums, bar(b, 2), ['snare'] * 4 + ['tom_hi', 'tom_mid2', 'tom_lo', 'tom_lo2'])

for b, t in ((0, 'Riff'), (8, 'Theme'), (16, 'La bemol'), (24, 'Cuivres'), (32, 'Ceremonie'), (40, 'Tutti')):
    pc.marker(b, t)
pc.save(48)
