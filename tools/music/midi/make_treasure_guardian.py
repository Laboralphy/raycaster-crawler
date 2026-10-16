"""Salle du trésor - Le gardien : l'or est là, mais quelque chose veille.

Mi phrygien, 108 bpm, 40 mesures (1:29), en boucle. Harpe en doubles
croches, cordes en trémolo, éclats de célesta en mineur pour l'or, thème
lourd aux trombones et au tuba (le gardien), timbales et taiko ; la
seconde partie monte aux cordes sur fa majeur (napolitain).

 0-7   harpe, trémolo, éclats d'or
 8-15  le gardien : trombones, timbales
 16-23 la mineur : cordes et chœur, taiko
 24-31 thème du gardien à pleine voix, batterie
 32-39 il se rendort : harpe, éclats, trombones lointains
"""
from compose import Piece, GM, n, tones

pc = Piece('treasure_guardian', 108, 'Give Back My Grimoire! - Guardian', seed=59)
bar = pc.bar

harp = pc.track('Harpe', 0, GM['Harp'], volume=100, pan=30, reverb=100)
trem = pc.track('Tremolo', 1, GM['TremoloStrings'], volume=88, pan=70, reverb=100)
cel = pc.track('Celesta', 2, GM['Celesta'], volume=88, pan=100, reverb=120)
bone = pc.track('Trombones', 3, GM['Trombone'], volume=104, pan=56, reverb=80)
tuba = pc.track('Tuba', 4, GM['Tuba'], volume=100, pan=64, reverb=70)
strings = pc.track('Cordes', 5, GM['Strings1'], volume=104, pan=40, reverb=90)
choir = pc.track('Choeur', 6, GM['ChoirAahs'], volume=104, pan=84, reverb=110)
timp = pc.track('Timbales', 7, GM['Timpani'], volume=96, pan=64, reverb=80)
taiko = pc.track('Taiko', 8, GM['Taiko'], volume=96, pan=64, reverb=80)
drums = pc.track('Batterie', 9, None, volume=92, reverb=70)
horn = pc.track('Cors', 10, GM['FrenchHorn'], volume=94, pan=76, reverb=90)

A = ['Em', 'F', 'Em', 'Em', 'C', 'B', 'Em', 'B']
B = ['Am', 'Am', 'F', 'F', 'Dm', 'Dm', 'B', 'B']
FORM = A + A + B + A + A
GUARD = [
    [('E3', 2), ('G3', 1), ('B3', 1)],
    [('A3', 2), ('C4', 1), ('A3', 1)],
    [('G3', 1.5), ('F#3', .5), ('E3', 2)],
    [('B2', 4)],
    [('C3', 2), ('E3', 1), ('G3', 1)],
    [('F#3', 2), ('D#3', 2)],
    [('E3', 1), ('G3', 1), ('B3', 1), ('E4', 1)],
    [('D#4', 3), ('B3', 1)],
]
RISE = [
    [('A4', 2), ('C5', 2)],
    [('E5', 3), ('D5', 1)],
    [('C5', 2), ('A4', 2)],
    [('F5', 4)],
    [('D5', 1), ('F5', 1), ('A5', 2)],
    [('G5', 1.5), ('F5', .5), ('D5', 2)],
    [('D#5', 2), ('F#5', 2)],
    [('B4', 4)],
]

# harpe : arpège montant et descendant sur l'accord, toute la pièce
pc.arp(harp, 0, FORM, [0, 1, 2, 3, 4, 3, 2, 1], 'E3', 'E5', vel=70, step=0.25, dur=0.3, accents=(0,))
harp.cc(0, 11, 112)
pc.swell(harp, 22, 24, 112, 90)
pc.swell(harp, 30, 32, 90, 116)

# trémolo grave, inquiet, qui enfle à chaque fin de phrase
pc.pad(trem, 0, FORM, vel=66, lo='B2', hi='B3', voices=3)
for b in range(0, 40, 4):
    pc.swell(trem, b, b + 4, 70, 118)

# l'or : éclats de célesta épars sur les notes de l'accord (jamais un air)
for b, c in enumerate(FORM):
    if b < 8 or b >= 32:
        pool = tones(c, 'E5', 'E7')
        for _ in range(2):
            t = bar(b, pc.rnd.randrange(16) / 4)
            p = pc.rnd.choice(pool)
            cel.note(t, p, 0.5, pc.rnd.randint(50, 80))
            cel.note(t + 0.75, p, 0.5, 30)

# le gardien
pc.melody(bone, 8, GUARD, vel=96)
pc.melody(tuba, 8, GUARD, vel=88, octave=-1)
pc.melody(bone, 24, GUARD, vel=106)
pc.melody(tuba, 24, GUARD, vel=96, octave=-1)
pc.melody(horn, 24, GUARD, vel=96, octave=1)
pc.melody(bone, 32, GUARD[:4], vel=70)
pc.melody(horn, 36, GUARD[4:], vel=64)

# seconde partie
pc.melody(strings, 16, RISE, vel=96)
pc.pad(choir, 16, B, vel=78, lo='A3', hi='A4')
pc.pad(choir, 24, A, vel=74, lo='G3', hi='G4')
pc.pad(horn, 16, B, vel=64, lo='D3', hi='D4')
strings.cc(0, 11, 110)

# timbales, taiko
ROOTS = {'Em': 'E2', 'F': 'F2', 'C': 'C2', 'B': 'B1', 'Am': 'A1', 'Dm': 'D2'}
for b, c in enumerate(FORM):
    if 8 <= b < 32:
        timp.note(bar(b), ROOTS[c], 1, pc.hum(94))
        timp.note(bar(b, 1.5), ROOTS[c], 0.5, pc.hum(70))
pc.roll(timp, bar(15, 2), 2, 'B1', 40, 110)
pc.roll(timp, bar(31, 2), 2, 'B1', 40, 100)
for b in range(16, 32):
    taiko.note(bar(b), 'C3', 1, pc.hum(98))
    taiko.note(bar(b, 2.5), 'C3', 0.5, pc.hum(76))
    if b % 2:
        taiko.note(bar(b, 3), 'C3', 0.5, pc.hum(84))
for b in (32, 36):
    timp.note(bar(b), 'E2', 2, 70)

# batterie : seulement sur le thème à pleine voix
KIT = {'kick2': [(0, 104), (1.5, 82), (2, 98)], 'snare': [(1, 92), (3, 100)],
       'hh_closed': [(x / 2, 66 if x % 2 == 0 else 50) for x in range(8)]}
pc.drums(drums, 24, 8, KIT)
for b in (16, 24):
    drums.note(bar(b), 49, 2, 106)
pc.fill(drums, bar(31, 3), ['snare', 'tom_hi', 'tom_mid2', 'tom_lo'])

for b, t in ((0, 'Or'), (8, 'Gardien'), (16, 'La mineur'), (24, 'Tutti'), (32, 'Sommeil')):
    pc.marker(b, t)
pc.save(40)
