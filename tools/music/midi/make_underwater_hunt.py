"""Salles inondées - La traque : méduses et barracudas, on est la proie.

Si bémol mineur, 120 bpm, 48 mesures (1:36), en boucle. Basse fretless en
doubles croches qui ne lâche pas (comme E2M2 de Heretic), cordes
synthétiques en ostinato, taiko, cuivres sur le thème, chœur, nappe qui
balaie, gouttes en écho ; si majeur (napolitain) et mi bécarre (le triton)
pour la morsure.

 0-7   basse, taiko, nappe, gouttes
 8-15  thème aux cuivres, batterie, ostinato
 16-23 mi bémol mineur : chœur et trémolo
 24-31 thème à pleine voix
 32-39 à l'affût : basse seule, gouttes, chœur en grappe, remontée
 40-47 la traque reprend, tutti
"""
from compose import Piece, GM, n

pc = Piece('underwater_hunt', 120, 'Give Back My Grimoire! - The hunt', seed=61)
bar = pc.bar

bass = pc.track('Basse fretless', 0, GM['Fretless'], volume=110, pan=64, reverb=40)
ost = pc.track('Cordes synthetiques', 1, GM['SynthStrings1'], volume=96, pan=36, reverb=70)
brass = pc.track('Cuivres', 2, GM['Brass'], volume=102, pan=74, reverb=80)
choir = pc.track('Choeur', 3, GM['ChoirAahs'], volume=106, pan=88, reverb=110)
trem = pc.track('Tremolo', 4, GM['TremoloStrings'], volume=96, pan=44, reverb=100)
taiko = pc.track('Taiko', 5, GM['Taiko'], volume=100, pan=64, reverb=80)
timp = pc.track('Timbales', 6, GM['Timpani'], volume=92, pan=64, reverb=80)
pad = pc.track('Nappe', 7, GM['SweepPad'], volume=80, pan=64, reverb=120)
drops = pc.track('Gouttes', 8, GM['EchoDrops'], volume=84, pan=20, reverb=120)
drums = pc.track('Batterie', 9, None, volume=96, reverb=70)
rcym = pc.track('Cymbale inversee', 10, GM['ReverseCymbal'], volume=104, pan=64, reverb=60)

A = ['Bbm', 'Bbm', 'Gb', 'F', 'Bbm', 'Bbm', 'B', 'F']
B = ['Ebm', 'Ebm', 'Bbm', 'Bbm', 'Gb', 'Gb', 'F', 'F']
FORM = A + A + B + A + A + A
THEME = [
    [('Bb4', 1.5), ('C5', .5), ('Db5', 2)],
    [('F5', 3), ('E5', .5), ('F5', .5)],
    [('Gb5', 2), ('F5', 1), ('Db5', 1)],
    [('C5', 3), ('A4', 1)],
    [('Bb4', 1), ('Db5', 1), ('F5', 1), ('Bb5', 1)],
    [('A5', 2), ('Bb5', 1), ('F5', 1)],
    [('F#5', 2), ('D#5', 1), ('B4', 1)],
    [('C5', 2), ('A4', 2)],
]
SONG = [
    [('Eb5', 2), ('Gb5', 2)],
    [('Bb5', 3), ('Ab5', 1)],
    [('F5', 2), ('Db5', 2)],
    [('Bb4', 4)],
    [('Db5', 1), ('Eb5', 1), ('Gb5', 2)],
    [('Bb5', 2), ('Gb5', 2)],
    [('A5', 2), ('F5', 2)],
    [('C5', 4)],
]

# basse fretless : doubles croches syncopées, toute la pièce
LINE = [0, None, 0, 12, None, 0, 10, None, 0, None, 0, 12, None, 7, 6, 5]
pc.riff(bass, 0, FORM, LINE, 'Bb1', dur=0.22, vel=90, accents=(0, 8))
pc.swell(bass, 0, 2, 80, 120)

# ostinato de cordes synthétiques sur les notes de l'accord
OST = [0, 1, 2, 1, 0, 1, 3, 1]
pc.arp(ost, 8, FORM[8:32], OST, 'Bb3', 'Bb5', vel=70, step=0.25, dur=0.22, accents=(0, 4))
pc.arp(ost, 36, A[4:] + A, OST, 'Bb3', 'Bb5', vel=70, step=0.25, dur=0.22, accents=(0, 4))
pc.swell(ost, 36, 40, 40, 110)

# nappe et gouttes
pc.pad(pad, 0, FORM, vel=62, lo='F3', hi='F4', voices=3)
pc.scatter(drops, 0, 8, [n('F5'), n('Bb5'), n('Db6'), n('E6')], 2, vel=(40, 80), dur=1)
pc.scatter(drops, 32, 8, [n('F5'), n('Bb5'), n('E6')], 3, vel=(40, 90), dur=1)

# thème, chœur
pc.melody(brass, 8, THEME, vel=98)
pc.melody(choir, 16, SONG, vel=92, accent=0)
pc.pad(trem, 16, B, vel=80, lo='Bb3', hi='Bb4')
pc.pad(brass, 16, B, vel=70, lo='Db4', hi='Db5')
pc.melody(brass, 24, THEME, vel=106)
pc.melody(trem, 24, THEME, vel=88, octave=1)
pc.pad(choir, 24, A, vel=76, lo='Bb3', hi='Bb4')
pc.melody(brass, 40, THEME, vel=108)
pc.melody(choir, 40, THEME, vel=86, accent=0, octave=-1)
pc.pad(trem, 40, A, vel=82, lo='Bb3', hi='Bb4')
# à l'affût : grappes de chœur (triton, seconde mineure)
for b, cl in ((32, ['Bb3', 'E4']), (34, ['A3', 'Bb3', 'E4']), (36, ['Bb3', 'Db4', 'E4']), (38, ['A3', 'C4', 'F4'])):
    choir.chord(bar(b), cl, 7.75, 76)

# taiko, timbales
for b in range(48):
    if b >= 32 and b < 36:
        continue
    taiko.note(bar(b), 'C3', 1, pc.hum(100))
    taiko.note(bar(b, 1.5), 'C3', 0.5, pc.hum(72))
    taiko.note(bar(b, 2.5), 'C3', 0.5, pc.hum(80))
ROOTS = {'Bbm': 'Bb1', 'Gb': 'Gb2', 'F': 'F2', 'B': 'B1', 'Ebm': 'Eb2'}
for b, c in enumerate(FORM):
    if 8 <= b < 32 or b >= 40:
        timp.note(bar(b, 3), ROOTS[c], 1, pc.hum(84))
pc.roll(timp, bar(39, 0), 4, 'F2', 30, 118)
for b in (7, 15, 39):
    rcym.note(bar(b, 1), 'C4', 3, 100)

KIT = {'kick2': [(0, 108), (0.75, 86), (2, 104), (2.75, 86)],
       'snare': [(1, 100), (3, 104)],
       'hh_closed': [(x / 4, 70 if x % 2 == 0 else 48) for x in range(16)]}
pc.drums(drums, 8, 24, KIT)
pc.drums(drums, 40, 8, KIT)
for b in (8, 16, 24, 40):
    drums.note(bar(b), 49, 2, 110)
for b in (15, 23, 31, 47):
    pc.fill(drums, bar(b, 2), ['snare'] * 4 + ['tom_hi', 'tom_mid2', 'tom_lo', 'tom_lo2'])

for b, t in ((0, 'Basse'), (8, 'Theme'), (16, 'Mi bemol mineur'), (24, 'Tutti'), (32, 'Affut'), (40, 'Traque')):
    pc.marker(b, t)
pc.save(48)
