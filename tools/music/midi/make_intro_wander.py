"""Introduction, 1re partie - La promenade : l'aventurier traverse la forêt de
nuit, le Grimoire sous le bras, insouciant, puis se perd.

Ré mixolydien, 100 bpm, 16 mesures (0:38), en boucle (l'embuscade la coupe,
vers la mesure 10). Thème de l'aventurier (motifs.HERO) à la clarinette puis
à la flûte, contrebasse en pizzicato qui marche, pas au bloc de bois, harpe,
nappe de nuit ; quand il se perd, le hautbois hésite sur des accords qui
glissent (si bémol, mi bémol).

 0-1   la nuit : nappe, harpe, chouette au loin
 2-5   le thème de l'aventurier, il marche
 6-9   perdu : le hautbois regarde à gauche, à droite
 10-13 le thème repart, plus pressé ; une ombre dans les basses
 14-15 quelque chose approche : trémolo, timbales
"""
from compose import Piece, GM, n
from motifs import HERO, HERO_CHORDS

pc = Piece('intro_wander', 100, 'Give Back My Grimoire! - Intro: the walk', seed=21)
bar = pc.bar

clar = pc.track('Clarinette', 0, GM['Clarinet'], volume=104, pan=56, reverb=80)
flute = pc.track('Flute', 1, GM['Flute'], volume=96, pan=76, reverb=90)
oboe = pc.track('Hautbois', 2, GM['Oboe'], volume=96, pan=44, reverb=90)
pizz = pc.track('Pizzicato', 3, GM['Pizzicato'], volume=100, pan=64, reverb=60)
harp = pc.track('Harpe', 4, GM['Harp'], volume=96, pan=30, reverb=100)
pad = pc.track('Nappe', 5, GM['WarmPad'], volume=70, pan=64, reverb=100)
strings = pc.track('Cordes', 6, GM['TremoloStrings'], volume=80, pan=90, reverb=90)
timp = pc.track('Timbales', 7, GM['Timpani'], volume=84, pan=64, reverb=80)
owl = pc.track('Chouette', 8, GM['Ocarina'], volume=62, pan=108, reverb=127)
drums = pc.track('Pas', 9, None, volume=70, reverb=50)

INTRO = ['D', 'Am|D']
LOST = ['Bb', 'C', 'Eb', 'A']
HURRY = ['D', 'G|D', 'Bb|C', 'A']
TENSE = ['Dm', 'Eb|A']
FORM = INTRO + HERO_CHORDS + LOST + HERO_CHORDS[:2] + HURRY[2:] + TENSE

# la nuit : nappe sur tout le morceau, harpe en arpèges
pc.pad(pad, 0, FORM, vel=58, lo='F#3', hi='F#4')
pc.arp(harp, 0, FORM, [0, 1, 2, 3, 2, 1, 2, 3], 'D3', 'D5', vel=62, step=0.5, dur=1.5, accents=(0,), accent=10)
for t in (bar(0, 2), bar(1, 3), bar(8, 1)):
    owl.note(t, 'E5', 0.6, 54)
    owl.note(t + 0.75, 'C#5', 1.2, 46)

# il marche : contrebasse en pizzicato, pas au bloc de bois
WALK = [(0, 0.5, 0), (1, 0.5, 7), (2, 0.5, 12), (3, 0.5, 7)]
pc.bass(pizz, 2, HERO_CHORDS + LOST + HERO_CHORDS[:2] + HURRY[2:], WALK, lo='D2', vel=90)
pc.drums(drums, 2, 4, {'woodblock_lo': [(0, 64), (1, 52), (2, 60), (3, 52)]})
pc.drums(drums, 10, 4, {'woodblock_lo': [(0, 70), (1, 56), (2, 66), (3, 56)],
                        'woodblock_hi': [(1.5, 44), (3.5, 44)]})

# le thème de l'aventurier
pc.melody(clar, 2, HERO, vel=94)
pc.melody(flute, 10, HERO[:2], vel=92, octave=1)
pc.melody(clar, 10, HERO[:2], vel=80)
pc.melody(flute, 12, [
    [('D5', 1), ('C5', .5), ('Bb4', .5), ('C5', 2)],
    [('E5', 1.5), ('D5', .5), ('C#5', 2)],
], vel=94, octave=0)

# perdu : le hautbois hésite, à gauche, à droite, demi-tons qui ne résolvent pas
LOOK = [
    [('F4', 1), ('D4', 1), (None, 0.5), ('F4', .5), ('G4', 1)],
    [('E4', 1.5), (None, .5), ('G4', 1), ('E4', 1)],
    [('Eb4', 1), ('G4', 1), (None, 0.5), ('Bb4', .5), ('G4', 1)],
    [('A4', 2), ('G#4', 1), ('A4', 1)],
]
pc.melody(oboe, 6, LOOK, vel=88)
pc.pad(strings, 6, LOST, vel=54, lo='D3', hi='D4')
strings.cc(0, 11, 0)
pc.swell(strings, 6, 8, 40, 96)
pc.swell(strings, 8, 10, 96, 0)

# quelque chose approche : trémolo grave, timbales, retour au début
pc.pad(strings, 14, TENSE, vel=70, lo='D2', hi='D3')
pc.swell(strings, 14, 16, 30, 120)
pc.roll(timp, bar(14), 4, 'D2', 40, 84, rate=6)
pc.roll(timp, bar(15, 2), 2, 'A1', 50, 100, rate=8)
pc.melody(oboe, 14, [[('D5', 2), ('Eb5', 2)], [('D5', 3), (None, 1)]], vel=76)

for b, t in ((0, 'Nuit'), (2, 'Theme'), (6, 'Perdu'), (10, 'Il repart'), (14, 'Quelque chose approche')):
    pc.marker(b, t)
pc.save(16)
