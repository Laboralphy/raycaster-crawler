"""Introduction, 2e partie - L'embuscade : le sorcier et ses mycos surgissent,
le sorcier exige le Grimoire, change l'aventurier en poulet, rit, s'en va ;
le poulet s'enfuit.

Ré mineur, 120 bpm (une mesure = 2 s), 16 mesures (0:32). La cinématique
lance ce morceau à l'embuscade (eventEmbush) et passe au suivant quand
l'aventurier redevient humain (eventAdvBack), vers 28 s ; les repères
ci-dessous suivent la cinématique (le texte des bulles décale d'une seconde
au plus, en français).

 0     l'embuscade : coup d'orchestre, timbales
 0-7   le thème du Grimoire aux trombones et au tuba (motifs.THEME), menaçant,
       sous le dialogue
 8     le sortilège (17 s) : cymbale inversée, harpe, coup ; trombone qui
       s'effondre, le voilà poulet
 9-12  le rire du sorcier : tuba en flonflon, basson et hautbois qui
       caquettent, trompette « har har »
 13-15 le poulet s'enfuit (25,5 s) : xylophone et piccolo en doubles
       croches, caisse claire, on monte d'un demi-ton
"""
from compose import Piece, GM, DRUM, n
from motifs import THEME, THEME_CHORDS

pc = Piece('intro_ambush', 120, 'Give Back My Grimoire! - Intro: the ambush', seed=22)
bar = pc.bar

tbn = pc.track('Trombones', 0, GM['Trombone'], volume=108, pan=40, reverb=80)
tuba = pc.track('Tuba', 1, GM['Tuba'], volume=104, pan=56, reverb=70)
strings = pc.track('Cordes', 2, GM['TremoloStrings'], volume=92, pan=80, reverb=90)
hit = pc.track('Coups', 3, GM['OrchestraHit'], volume=84, pan=64, reverb=80)
bsn = pc.track('Basson', 4, GM['Bassoon'], volume=110, pan=36, reverb=60)
oboe = pc.track('Hautbois', 5, GM['Oboe'], volume=100, pan=88, reverb=70)
tpt = pc.track('Trompette', 6, GM['Trumpet'], volume=96, pan=72, reverb=70)
xylo = pc.track('Xylophone', 7, GM['Xylophone'], volume=104, pan=30, reverb=60)
harp = pc.track('Harpe', 8, GM['Harp'], volume=100, pan=24, reverb=100)
drums = pc.track('Batterie', 9, None, volume=90, reverb=60)
timp = pc.track('Timbales', 10, GM['Timpani'], volume=96, pan=64, reverb=80)
picc = pc.track('Piccolo', 11, GM['Piccolo'], volume=88, pan=96, reverb=70)
rcym = pc.track('Cymbale inversee', 12, GM['ReverseCymbal'], volume=110, pan=64, reverb=60)
pizz = pc.track('Pizzicato', 13, GM['Pizzicato'], volume=104, pan=64, reverb=50)
celesta = pc.track('Celesta', 14, GM['Celesta'], volume=100, pan=100, reverb=110)

# ------------------------------------------------------------ l'embuscade
hit.chord(0, ['D3', 'F3', 'Ab3', 'B3', 'D4'], 1.5, 120)
drums.note(0, DRUM['crash'], 2, 122)
timp.note(0, 'D2', 2, 124)
tbn.chord(0, ['D3', 'Ab3'], 1.5, 112)
tuba.note(0, 'D2', 1.5, 112)

# ------------------------------------------------------------ menace (0-7)
# le thème du Grimoire, grave, sous le dialogue
pc.melody(tbn, 0, THEME, vel=90, octave=-1)
tbn.cc(0, 11, 100)
pc.pad(strings, 0, THEME_CHORDS, vel=62, lo='D3', hi='D4')
pc.swell(strings, 0, 8, 70, 100)
# ostinato des cordes graves en croches : la menace qui tourne
pc.riff(pizz, 0, THEME_CHORDS, [0, None, 0, 0, None, 0, 1, 0], 'D2', step=0.5, dur=0.3, vel=82, accents=(0,), accent=12)
ROOTS = {'D': 'D2', 'B': 'Bb1', 'G': 'G1', 'A': 'A1', 'E': 'Eb2', 'C': 'C2', 'F': 'F2'}
for b, c in enumerate(THEME_CHORDS):
    if b:
        timp.note(bar(b), ROOTS[c[0]], 1, pc.hum(86))
for b in (3, 7):
    pc.roll(timp, bar(b, 2), 2, 'A1', 50, 96, rate=8)
pc.drums(drums, 1, 7, {'tom_lo2': [(0, 60)], 'tom_lo': [(2.5, 50)]})

# ------------------------------------------------------------ le sortilège (8)
rcym.note(bar(8), 'C4', 2, 110)
for k, p in enumerate(['D4', 'F4', 'A4', 'C5', 'D5', 'F5', 'A5', 'C6', 'D6', 'F6', 'A6']):
    harp.note(bar(8) + k * 2 / 11, p, 1, 70 + k * 4)
hit.chord(bar(8, 2), ['A3', 'C#4', 'E4', 'G4'], 0.6, 124)
drums.note(bar(8, 2), DRUM['crash2'], 2, 118)
celesta.chord(bar(8, 2), ['A5', 'C#6', 'E6'], 1, 96)
# le trombone s'effondre : « wah wah wah waaah », il est poulet
for k, p in enumerate(['Bb3', 'A3', 'Ab3']):
    tbn.note(bar(8, 2.5) + k * 0.5, p, 0.4, 100)
tbn.note(bar(9) - 0.0, 'G3', 1.5, 100)
tbn.bend(bar(9) + 0.2, -1.0)
tbn.bend(bar(9) + 1.6, 0.0)

# ------------------------------------------------------------ le rire (9-12)
LAUGH = ['Dm|A7', 'Dm|A7', 'Gm|D', 'Eb|A7']
pc.bass(tuba, 9, LAUGH, [(0, 0.4, 0), (1, 0.3, -5)], lo='D2', vel=96)
pc.riff(pizz, 9, LAUGH, [None, 12, None, 16], 'D3', step=0.5, dur=0.25, vel=80, intervals=(0, 3))
pc.drums(drums, 9, 4, {'woodblock_hi': [(1, 66), (3, 66)], 'woodblock_lo': [(0.5, 48), (2.5, 48)]})
# le poulet caquette : notes piquées avec appogiature
CLUCK = [
    [('A3', .25), ('A3', .25), ('A3', .25), (None, .25), ('D4', .5), (None, .5), ('C#4', .25), ('D4', .25), (None, 1.5)],
    [('A3', .25), ('A3', .25), ('Bb3', .25), (None, .25), ('A3', .5), (None, 1.5), ('E4', .25), ('D4', .25), (None, .5)],
    [('G3', .25), ('G3', .25), ('G3', .25), (None, .25), ('Bb3', .5), (None, .5), ('A3', .25), ('Bb3', .25), (None, 1.5)],
    [('A3', .25), ('A3', .25), ('A3', .25), (None, .25), ('G3', .25), ('A3', .25), ('Bb3', .25), ('C#4', .25), ('D4', 1), (None, 1)],
]
pc.melody(bsn, 9, CLUCK, vel=96, legato=0.6)
pc.melody(oboe, 10, [
    [(None, 2), ('D5', .25), ('D5', .25), ('F5', .5), (None, 1)],
    [(None, 1), ('Eb5', .25), ('D5', .25), (None, 1.5), ('A5', .5), (None, .5)],
    [(None, 4)],
], vel=88, legato=0.6)
# le rire du sorcier (bulle « Har har », vers 19-23 s)
for b, beat in ((9, 2), (10, 0.5), (11, 2)):
    for k, p in enumerate(['A4', 'F4', 'D4']):
        tpt.note(bar(b, beat) + k * 0.33, p, 0.25, 100 - k * 6)

# ------------------------------------------------------------ la fuite (13-15)
FLIGHT = ['Dm', 'A7', 'Ebm', 'Bb7']
RUN = [0, 3, 7, 12, 7, 3, 0, 3, 7, 12, 15, 12, 7, 3, 0, -2]
pc.riff(xylo, 13, FLIGHT[:1] + FLIGHT[1:2] + FLIGHT[2:3], RUN, 'D4', step=0.25, dur=0.2, vel=90, accents=(0, 8), accent=14)
pc.riff(picc, 14, FLIGHT[2:3] + FLIGHT[3:4], RUN, 'D5', step=0.25, dur=0.2, vel=80, accents=(0,), accent=12)
pc.bass(tuba, 13, ['Dm', 'A7', 'Ebm'], [(0, 0.25, 0), (0.5, 0.25, 7), (1, 0.25, 0), (1.5, 0.25, 7),
                                         (2, 0.25, 0), (2.5, 0.25, 7), (3, 0.25, 0), (3.5, 0.25, 7)], lo='D2', vel=96)
pc.drums(drums, 13, 3, {'snare': [(x / 4, 70 + (12 if x % 4 == 0 else 0)) for x in range(16)],
                        'kick': [(0, 100), (2, 96)], 'hh_closed': [(x / 2, 60) for x in range(8)]})
pc.melody(bsn, 13, [
    [('A3', .25), ('A3', .25), ('A3', .25), (None, .25)] * 4,
    [('A3', .25), ('A3', .25), ('C#4', .25), (None, .25)] * 4,
    [('Bb3', .25), ('Bb3', .25), ('Bb3', .25), (None, .25)] * 4,
], vel=90, legato=0.6)
pc.pad(strings, 13, ['Dm', 'A7', 'Ebm'], vel=80, lo='D4', hi='D5')
pc.fill(drums, bar(15, 3), ['tom_hi', 'tom_mid2', 'tom_lo', 'tom_lo2'], v0=90, v1=118)

for b, t in ((0, 'Embuscade'), (8, 'Sortilege'), (9, 'Rire'), (13, 'Fuite')):
    pc.marker(b, t)
pc.save(16)
