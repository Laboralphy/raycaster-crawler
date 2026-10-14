"""Forêt de nuit : chœurs lointains et inquiétants.

Mi mineur, 60 bpm, 32 mesures (2:08), en boucle. Pédale de mi grave, vent,
boîte à musique désaccordée, accords chromatiques (do mineur, sol mineur,
si bémol : le triton) qui font glisser le chœur, une chouette.

 0-7   le vent, la pédale, le chœur qui s'approche
 8-15  berceuse de la boîte à musique (fausse d'un quart de ton)
 16-23 les chœurs se croisent, la flûte, la voix de synthèse en suraigu
 24-31 tout s'efface, il ne reste que le vent et quelques notes
"""
from compose import Piece, GM, n

pc = Piece('forest_night', 60, 'Give Back My Grimoire! - Night forest', seed=13)
bar = pc.bar

oohs = pc.track('Choeur ooh', 0, GM['VoiceOohs'], volume=112, pan=36, reverb=115)
aahs = pc.track('Choeur aah', 1, GM['ChoirAahs'], volume=104, pan=92, reverb=115)
ghost = pc.track('Voix fantome', 2, GM['SynthVoice'], volume=112, pan=64, reverb=127)
cbass = pc.track('Contrebasse', 3, GM['Contrabass'], volume=84, pan=60, reverb=70)
halo = pc.track('Nappe', 4, GM['HaloPad'], volume=66, pan=64, reverb=100)
mbox = pc.track('Boite a musique', 5, GM['MusicBox'], volume=127, pan=74, reverb=110)
harp = pc.track('Harpe', 6, GM['Harp'], volume=104, pan=28, reverb=110)
flute = pc.track('Flute', 7, GM['Flute'], volume=90, pan=84, reverb=120)
wind = pc.track('Vent', 8, GM['Seashore'], volume=86, pan=64, reverb=80)
owl = pc.track('Chouette', 10, GM['Ocarina'], volume=70, pan=100, reverb=127)
celesta = pc.track('Celesta', 12, GM['Celesta'], volume=90, pan=54, reverb=110)
timp = pc.track('Timbales', 11, GM['Timpani'], volume=84, pan=64, reverb=90)

# la boîte à musique est fausse : un tiers de demi-ton trop bas
mbox.bend(0, -0.35)
celesta.bend(0, 0.2)

P1 = ['Em', 'Em', 'Fmaj7', 'Fmaj7', 'Em', 'Em', 'Cm', 'B7']
P2 = ['Em', 'Gm/D', 'Em', 'Bb', 'Am', 'Cm', 'F#dim', 'B7']

LULLABY = [
    [('B5', 1), ('G5', 1), ('E5', 2)],
    [('F#5', 1), ('G5', 1), ('A5', 2)],
    [('C6', 2), ('B5', 1), ('A5', 1)],
    [('G5', 4)],
    [('B5', 1), ('G5', 1), ('E5', 2)],
    [('D#5', 2), ('E5', 2)],
    [('Eb5', 2), ('G5', 1), ('C6', 1)],
    [('B5', 3), (None, 1)],
]
FLUTE = [
    [('B4', 2), ('E5', 2)],
    [('D5', 2), ('Bb4', 2)],
    [('G4', 4)],
    [('F5', 3), ('D5', 1)],
    [('E5', 2), ('C5', 2)],
    [('Eb5', 4)],
    [('C5', 2), ('A4', 2)],
    [('B4', 4)],
]

# vent sur tout le morceau, en rafales
for b in range(0, 32, 8):
    wind.note(bar(b), 'C3', 32, 90)
gusts = [(0, 40), (2, 90), (4, 50), (6, 100), (8, 45), (11, 95), (14, 50), (16, 70),
         (19, 105), (22, 55), (24, 80), (27, 100), (30, 60), (32, 40)]
for (b0, v0), (b1, v1) in zip(gusts, gusts[1:]):
    pc.swell(wind, b0, b1, v0, v1)

# pédale de mi
for b in range(0, 32, 4):
    cbass.note(bar(b), 'E1', 16, pc.hum(84))
pc.swell(cbass, 0, 2, 50, 110)
pc.swell(cbass, 28, 32, 110, 50)

# 0-7
pc.pad(halo, 0, P1, vel=60, lo='E3', hi='E4')
oohs.cc(0, 11, 50)
pc.pad(oohs, 2, P1[2:], vel=70, lo='G3', hi='G4')
pc.swell(oohs, 2, 8, 50, 120)
pc.scatter(harp, 1, 7, [n(x) for x in ('E4', 'G4', 'B4', 'D5', 'E5')], 1, vel=(40, 64), dur=1)
for t in (bar(5, 1), bar(5, 1.75)):
    owl.note(t, 'A4', 0.6, 66)

# 8-15
pc.pad(halo, 8, P1, vel=56, lo='E3', hi='E4')
pc.pad(aahs, 8, P1, vel=52, lo='B3', hi='B4')
pc.melody(mbox, 8, LULLABY, vel=112, accent=8)
pc.melody(celesta, 8, LULLABY, vel=70, accent=4)
pc.pad(oohs, 8, P1, vel=60, lo='E3', hi='E4')
pc.melody(harp, 8, [[(p, d)] for p, d in [('E3', 4), ('E3', 4), ('F3', 4), ('F3', 4),
                                           ('E3', 4), ('E3', 4), ('C3', 4), ('B2', 4)]],
          vel=58, legato=0.5)
timp.note(bar(15), 'B1', 2, 60)

# 16-23
pc.pad(oohs, 16, P2, vel=78, lo='G3', hi='G4')
pc.pad(aahs, 16, P2, vel=74, lo='D4', hi='D5')
pc.pad(halo, 16, P2, vel=54, lo='E3', hi='E4')
pc.melody(flute, 16, FLUTE, vel=82, accent=4)
# la voix de synthèse frotte un demi-ton au-dessus du chœur
for b, p in ((16, 'E6'), (18, 'F6'), (20, 'E6'), (22, 'D#6')):
    ghost.note(bar(b), p, 8, 84)
pc.swell(ghost, 16, 18, 20, 100)
pc.swell(ghost, 22, 24, 100, 10)
for b in (17, 21):
    pc.roll(timp, bar(b, 2), 2, 'E2', 30, 70)
timp.note(bar(20), 'A1', 2, 70)
for t in (bar(19, 2), bar(19, 2.75)):
    owl.note(t, 'G4', 0.6, 70)

# 24-31 : retour au vent seul
pc.pad(halo, 24, P1, vel=54, lo='E3', hi='E4')
pc.pad(aahs, 24, P1[:4], vel=60, lo='B3', hi='B4')
pc.swell(aahs, 24, 28, 100, 20)
pc.melody(mbox, 24, LULLABY[:4], vel=100, accent=6)
pc.scatter(harp, 28, 3, [n(x) for x in ('E4', 'B4', 'E5')], 1, vel=(36, 52), dur=1)
oohs.cc(bar(31, 3), 11, 50)
aahs.cc(bar(31, 3), 11, 100)
ghost.cc(bar(31, 3), 11, 20)

pc.marker(0, 'Vent')
pc.marker(8, 'Berceuse')
pc.marker(16, 'Choeurs')
pc.marker(24, 'Retour')
pc.save(32)
