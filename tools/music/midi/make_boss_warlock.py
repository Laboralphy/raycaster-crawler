"""Boss final - Le sorcier : combat épique, le thème du Grimoire en furie.

Ré mineur, 144 bpm, 56 mesures (1:33), en boucle. Guitare saturée en
galop, double grosse caisse, orgue diabolique, chœur scandé, cuivres sur
le thème du Grimoire (celui du menu), cordes, timbales, cloches.

 0-7   riff : guitare, batterie, orgue
 8-15  thème du Grimoire aux cuivres
 16-23 réponse : chœur et cordes
 24-31 riff, chœur scandé
 32-39 le sortilège : orgue seul, timbales, cloches, demi-tempo
 40-47 thème à pleine voix, cuivres et chœur à l'octave
 48-55 réponse en tutti, qui retombe sur la dominante
"""
from compose import Piece, GM, n, segments, bass_note, tones
from motifs import THEME, THEME_CHORDS, ANSWER, ANSWER_CHORDS

pc = Piece('boss_warlock', 144, 'Give Back My Grimoire! - The Warlock', seed=61)
bar = pc.bar

dgtr = pc.track('Guitare saturee', 0, GM['DistortionGuitar'], volume=106, pan=30, reverb=40)
dgtr2 = pc.track('Guitare saturee 2', 1, GM['DistortionGuitar'], volume=86, pan=98, reverb=40)
bass = pc.track('Basse', 2, GM['FingerBass'], volume=88, pan=64, reverb=25)
organ = pc.track('Orgue', 3, GM['ChurchOrgan'], volume=88, pan=64, reverb=100)
choir = pc.track('Choeur', 4, GM['ChoirAahs'], volume=118, pan=80, reverb=90)
brass = pc.track('Cuivres', 5, GM['Brass'], volume=108, pan=50, reverb=70)
strings = pc.track('Cordes', 6, GM['Strings1'], volume=104, pan=40, reverb=70)
timp = pc.track('Timbales', 7, GM['Timpani'], volume=90, pan=64, reverb=70)
bells = pc.track('Cloches', 8, GM['TubularBells'], volume=100, pan=70, reverb=110)
drums = pc.track('Batterie', 9, None, volume=84, reverb=50)
hit = pc.track('Coups', 10, GM['OrchestraHit'], volume=76, pan=64, reverb=80)

RIFF = ['Dm', 'Dm', 'Eb', 'Eb', 'Dm', 'Dm', 'C#dim', 'A']
SPELL = ['Dm', 'Gm/D', 'Dm', 'Eb', 'Dm', 'Bb', 'Gm', 'A']
FORM = RIFF + THEME_CHORDS + ANSWER_CHORDS + RIFF + SPELL + THEME_CHORDS + ANSWER_CHORDS

# guitare : galop (croche, deux doubles) sur la basse, accords de quinte
GALLOP = [(t, 0.22, 100 if t % 1 == 0 else 80) for b in range(4) for t in (b, b + 0.5, b + 0.75)]
spell = range(32, 40)
for i, s, d, c in segments(FORM):
    if i in spell:
        continue
    r = bass_note(c, 'D2')
    for t, dur, v in GALLOP:
        if s <= t < s + d:
            dgtr.chord(bar(i, t), [r, r + 7], dur, pc.hum(v, 4))
    dgtr2.chord(bar(i, s), [r + 12, r + 19, r + 24], d * 0.95, pc.hum(84))
    for x in range(int(d * 2)):
        bass.note(bar(i, s + x / 2), r - 12, 0.45, pc.hum(100 if x % 2 == 0 else 86))
dgtr2.cc(0, 11, 0)
for b0, b1 in ((24, 32), (40, 56)):
    dgtr2.cc(bar(b0), 11, 110)
    dgtr2.cc(bar(b1) - 0.01, 11, 0)

# batterie : double grosse caisse, caisse claire sur 2 et 4
KIT = {'kick': [(x / 4, 96 if x % 2 == 0 else 78) for x in range(16)],
       'snare': [(1, 110), (3, 114)],
       'ride': [(x / 2, 70) for x in range(8)]}
LIGHT = {'kick2': [(0, 104), (2.5, 90)], 'snare': [(1, 96), (3, 100)],
         'hh_closed': [(x / 2, 66) for x in range(8)]}
pc.drums(drums, 0, 8, LIGHT)
pc.drums(drums, 8, 24, KIT)
pc.drums(drums, 40, 16, KIT)
for b in (0, 8, 16, 24, 40, 48):
    drums.note(bar(b), 49, 2, 116)
    hit.chord(bar(b), [n('D4'), n('A4'), n('D5')], 1, 100)
for b in (7, 15, 23, 31, 47, 55):
    pc.fill(drums, bar(b, 2), ['snare'] * 4 + ['tom_hi', 'tom_mid2', 'tom_lo', 'tom_lo2'], v0=90, v1=124)
# demi-tempo pour le sortilège
pc.drums(drums, 32, 8, {'kick2': [(0, 96)], 'tom_lo2': [(2, 90)], 'tom_lo': [(3.5, 70)]})

# orgue : accords tenus partout, seul au premier plan pendant le sortilège
pc.pad(organ, 0, FORM, vel=70, lo='A3', hi='A4')
organ.cc(0, 11, 80)
organ.cc(bar(32), 11, 127)
organ.cc(bar(40), 11, 80)
pc.pad(organ, 32, SPELL, vel=84, lo='D3', hi='D4')

# chœur scandé : croches sur le riff
for i, s, d, c in segments(RIFF):
    for x in range(8):
        if x in (0, 1, 3, 4, 6):
            choir.chord(bar(24 + i, x / 2), tones(c, 'A3', 'A4')[:3], 0.4, pc.hum(96 if x == 0 else 82))
pc.pad(choir, 16, ANSWER_CHORDS, vel=84, lo='A3', hi='A4')
pc.pad(choir, 32, SPELL, vel=70, lo='D4', hi='D5')
pc.melody(choir, 40, THEME, vel=94, octave=1, accent=0)
pc.pad(choir, 48, ANSWER_CHORDS, vel=94, lo='A3', hi='A4')

# thème du Grimoire et réponse
pc.melody(brass, 8, THEME, vel=104)
pc.melody(strings, 16, ANSWER, vel=96)
pc.melody(strings, 16, ANSWER, vel=84, octave=-1)
pc.melody(brass, 40, THEME, vel=112)
pc.melody(brass, 48, ANSWER, vel=112)
pc.melody(strings, 48, ANSWER, vel=100, octave=1)
pc.pad(strings, 8, THEME_CHORDS, vel=66, lo='D3', hi='D4')

# timbales sur les temps forts, roulements avant les reprises
ROOTS = {'D': 'D2', 'E': 'Eb2', 'C': 'C#2', 'B': 'Bb1', 'G': 'G1', 'A': 'A1', 'F': 'F2'}
for i, s, d, c in segments(FORM):
    timp.note(bar(i, s), ROOTS[c[0]], 1, pc.hum(100 if i not in spell else 84))
pc.roll(timp, bar(38), 8, 'A1', 40, 124, rate=8)
for b in (32, 34, 36):
    bells.chord(bar(b), ['D5', 'D4'], 3.5, 96)
bells.chord(bar(40), ['D5', 'A4'], 3.5, 104)

for b, t in ((0, 'Riff'), (8, 'Theme'), (16, 'Reponse'), (24, 'Choeur scande'),
             (32, 'Sortilege'), (40, 'Theme tutti'), (48, 'Reponse tutti')):
    pc.marker(b, t)
pc.save(56)
