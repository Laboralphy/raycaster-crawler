"""Mines 3 - Le terrier : araignées et diablotins, ça grouille.

Mi mineur, 112 bpm, 40 mesures (1:26), en boucle. Pizzicati chromatiques en
doubles croches qui courent, xylophone d'os, basson staccato, nappe
« goblins », bloc de bois et toms.

 0-7   les pizzicati grouillent
 8-15  xylophone
 16-23 seconde partie : basson staccato, nappe
 24-31 xylophone et basson ensemble
 32-39 ça se calme... un peu
"""
from compose import Piece, GM, n, bass_note, segments

pc = Piece('mines_burrow', 112, 'Give Back My Grimoire! - Burrow', seed=33)
bar = pc.bar

pizz = pc.track('Pizzicati', 0, GM['Pizzicato'], volume=100, pan=36, reverb=60)
xylo = pc.track('Xylophone', 1, GM['Xylophone'], volume=127, pan=80, reverb=70)
bsn = pc.track('Basson', 2, GM['Bassoon'], volume=112, pan=60, reverb=60)
gob = pc.track('Goblins', 3, GM['Goblins'], volume=80, pan=64, reverb=100)
cbass = pc.track('Contrebasse pizz', 4, GM['Pizzicato'], volume=92, pan=64, reverb=40)
strings = pc.track('Cordes', 5, GM['Strings1'], volume=84, pan=90, reverb=80)
perc = pc.track('Percussions', 9, None, volume=100, reverb=60)

A = ['Em', 'Em', 'F', 'Em', 'Am', 'B7', 'Em', 'B7']
B = ['C', 'C', 'B', 'B', 'Am', 'Am', 'F', 'B7']
XYLO = [
    [('E5', .5), (None, .5), ('G5', .5), ('F#5', .5), ('E5', .5), (None, .5), ('B4', 1)],
    [('E5', .5), ('F5', .5), ('E5', .5), ('D#5', .5), ('E5', 2)],
    [('F5', .5), (None, .5), ('A5', .5), ('G5', .5), ('F5', .5), ('E5', .5), ('C5', 1)],
    [('B4', 2), ('E5', 2)],
    [('A4', .5), ('C5', .5), ('E5', .5), ('A5', .5), ('G5', 1), ('E5', 1)],
    [('F#5', .5), ('D#5', .5), ('B4', .5), ('A4', .5), ('F#4', 2)],
    [('G4', .5), ('B4', .5), ('E5', .5), ('G5', .5), ('F#5', 1), ('E5', 1)],
    [('D#5', 1), ('F#5', 1), ('B5', 2)],
]
BASSOON = [
    [('C3', .5), (None, .5), ('E3', .5), (None, .5), ('G3', 1), ('E3', 1)],
    [('C3', .5), ('D3', .5), ('E3', .5), ('F3', .5), ('G3', 2)],
    [('B2', .5), (None, .5), ('D#3', .5), (None, .5), ('F#3', 1), ('D#3', 1)],
    [('B2', .5), ('C3', .5), ('D#3', .5), ('E3', .5), ('F#3', 2)],
    [('A2', 1), ('C3', 1), ('E3', 1), ('A3', 1)],
    [('G3', 1), ('E3', 1), ('C3', 1), ('A2', 1)],
    [('F2', 1), ('A2', 1), ('C3', 1), ('F3', 1)],
    [('D#3', 1), ('F#3', 1), ('A3', 1), ('B3', 1)],
]
FORM = A + A + B + A + A

# pizzicati : motif chromatique autour de la fondamentale (pattes d'araignée)
CRAWL = [0, 1, 0, 3, 0, 1, 0, 7, 0, 1, 3, 4, 7, 6, 3, 1]
for i, s, d, c in segments(FORM):
    r = bass_note(c, 'E3')
    for k in range(16):
        v = 84 if k % 4 == 0 else 60
        pizz.note(bar(i, k / 4), r + CRAWL[k], 0.2, pc.hum(v, 6))
pizz.cc(0, 11, 80)
pc.swell(pizz, 32, 40, 120, 80)
pizz.cc(bar(8), 11, 120)
pc.bass(cbass, 0, FORM, [(0, 0.4, 0), (1, 0.4, 7), (2, 0.4, 0), (3, 0.4, 7)], lo='E1', vel=96)

KIT = {'woodblock_lo': [(0, 84), (2, 76)], 'woodblock_hi': [(1, 54), (3, 58), (3.5, 46)],
       'shaker': [(x / 4, 34 if x % 2 else 48) for x in range(16)]}
pc.drums(perc, 0, 40, KIT)
pc.drums(perc, 16, 16, {'tom_lo2': [(0, 92), (0.75, 70)], 'tom_mid2': [(2.5, 76)]})
for b in (7, 15, 23, 31):
    pc.fill(perc, bar(b, 3), ['tom_hi', 'tom_mid2', 'tom_lo', 'tom_lo2'], v0=70, v1=100)

pc.melody(xylo, 8, XYLO, vel=110, legato=0.5)
pc.melody(bsn, 16, BASSOON, vel=94, legato=0.55)
pc.pad(gob, 16, B, vel=64, lo='E3', hi='E4')
pc.pad(strings, 16, B, vel=60, lo='B3', hi='B4')
pc.melody(xylo, 24, XYLO, vel=112, legato=0.5)
pc.melody(bsn, 24, [[(p if p is None else n(p) - 24 + 12, d) for p, d in bar_] for bar_ in XYLO],
          vel=88, legato=0.55)
pc.pad(gob, 32, A, vel=50, lo='E3', hi='E4')

for b, t in ((0, 'Grouillement'), (8, 'Xylophone'), (16, 'Basson'), (24, 'Ensemble'), (32, 'Accalmie')):
    pc.marker(b, t)
pc.save(40)
