"""Introduction, 3e partie - La vengeance : l'aventurier redevient humain,
chasse le myco, et jure de reprendre le Grimoire. « THIS IS WAR !!! »

Ré mineur, 120 bpm (une mesure = 2 s), 10 mesures (0:20). La cinématique
lance ce morceau quand l'aventurier redevient humain (eventAdvBack) ; elle
finit vers 18 s, sur l'accord final. Repères :

 0     il redevient humain : harpe qui monte, accord de ré majeur, fanfare
 1     le myco détale : pizzicati qui dégringolent
 2-5   la colère monte : thème de l'aventurier en mineur aux cors
       (motifs.HERO_MINOR), trémolo grave, timbales comme un cœur
 6     tout se tend ; « THIS IS WAR !!! » (13,5 s, 4e temps) : coup d'orchestre
 7-8   tutti : le thème aux trompettes, chœur, batterie
 9     accord final de ré mineur, roulement de timbales
"""
from compose import Piece, GM, DRUM, n
from motifs import HERO_MINOR, HERO_MINOR_CHORDS

pc = Piece('intro_revenge', 120, 'Give Back My Grimoire! - Intro: revenge', seed=23)
bar = pc.bar

horns = pc.track('Cors', 0, GM['FrenchHorn'], volume=110, pan=44, reverb=90)
tpt = pc.track('Trompettes', 1, GM['Trumpet'], volume=104, pan=72, reverb=80)
tbn = pc.track('Trombones', 2, GM['Trombone'], volume=104, pan=36, reverb=80)
strings = pc.track('Cordes', 3, GM['Strings1'], volume=104, pan=84, reverb=90)
trem = pc.track('Tremolo', 4, GM['TremoloStrings'], volume=96, pan=60, reverb=90)
choir = pc.track('Choeur', 5, GM['ChoirAahs'], volume=108, pan=64, reverb=100)
harp = pc.track('Harpe', 6, GM['Harp'], volume=104, pan=24, reverb=100)
pizz = pc.track('Pizzicato', 7, GM['Pizzicato'], volume=100, pan=64, reverb=60)
hit = pc.track('Coups', 8, GM['OrchestraHit'], volume=84, pan=64, reverb=80)
drums = pc.track('Batterie', 9, None, volume=96, reverb=60)
timp = pc.track('Timbales', 10, GM['Timpani'], volume=100, pan=64, reverb=80)
tuba = pc.track('Tuba', 11, GM['Tuba'], volume=100, pan=56, reverb=70)

# ------------------------------------------------------------ humain (0)
for k, p in enumerate(['D3', 'F#3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5']):
    harp.note(k * 1.5 / 9, p, 2, 72 + k * 4)
strings.chord(bar(0, 1.5), ['D4', 'F#4', 'A4', 'D5'], 2.5, 96)
pc.melody(tpt, 0, [[(None, 1.5), ('A4', .5), ('D5', .5), ('F#5', .5), ('A5', 1)]], vel=104)
timp.note(bar(0, 1.5), 'D2', 1, 100)

# ------------------------------------------------------------ le myco détale (1)
for k, p in enumerate(['A4', 'G4', 'F4', 'E4', 'D4', 'C#4', 'Bb3', 'A3']):
    pizz.note(bar(1) + k * 0.25, p, 0.2, 96 - k * 3)
pc.drums(drums, 1, 1, {'woodblock_hi': [(0, 70), (0.5, 64), (1, 70), (1.5, 64)], 'woodblock_lo': [(2, 80)]})
pizz.note(bar(1, 2.5), 'D3', 0.3, 100)

# ------------------------------------------------------------ la colère (2-5)
pc.pad(trem, 2, HERO_MINOR_CHORDS, vel=70, lo='D2', hi='D3')
pc.swell(trem, 2, 7, 60, 127)
pc.melody(horns, 2, HERO_MINOR, vel=96)
pc.pad(strings, 2, HERO_MINOR_CHORDS, vel=60, lo='F3', hi='F4')
pc.swell(strings, 2, 6, 70, 110)
for b in range(2, 6):
    timp.note(bar(b), 'D2', 0.5, pc.hum(80 + 4 * (b - 2)))
    timp.note(bar(b, 0.5), 'D2', 0.5, pc.hum(64 + 4 * (b - 2)))
pc.drums(drums, 4, 2, {'snare': [(x / 2, 46 + 6 * x) for x in range(8)]})

# ------------------------------------------------------------ tout se tend (6)
pc.pad(tbn, 6, ['Bb|C'], vel=96, lo='Bb2', hi='Bb3')
pc.pad(horns, 6, ['Bb|C'], vel=96, lo='F3', hi='F4')
pc.roll(drums, bar(6), 3, DRUM['snare'], 50, 118, rate=8)
pc.roll(timp, bar(6), 3, 'A1', 60, 120, rate=8)
# « THIS IS WAR !!! »
hit.chord(bar(6, 3), ['D3', 'A3', 'D4', 'F4'], 1, 126)
drums.note(bar(6, 3), DRUM['crash'], 2, 124)
tuba.note(bar(6, 3), 'D2', 1, 120)

# ------------------------------------------------------------ tutti (7-8)
pc.melody(tpt, 7, HERO_MINOR[:2], vel=114)
pc.melody(strings, 7, HERO_MINOR[:2], vel=104, octave=1)
pc.melody(tbn, 7, HERO_MINOR[:2], vel=104, octave=-1)
pc.pad(horns, 7, HERO_MINOR_CHORDS[:2], vel=100, lo='F3', hi='F4')
pc.pad(choir, 7, HERO_MINOR_CHORDS[:2], vel=104, lo='A3', hi='A4')
pc.bass(tuba, 7, HERO_MINOR_CHORDS[:2], [(0, 0.5, 0), (1, 0.5, 0), (2, 0.5, 0), (3, 0.5, 0)], lo='D2', vel=104)
KIT = {'kick': [(0, 110), (1, 96), (2, 110), (3, 96)], 'snare': [(1, 112), (3, 116)],
       'crash': [(0, 110)]}
pc.drums(drums, 7, 2, KIT)
pc.fill(drums, bar(8, 2), ['snare'] * 4 + ['tom_hi', 'tom_mid2', 'tom_lo', 'tom_lo2'], step=0.25, v0=96, v1=126)

# ------------------------------------------------------------ accord final (9)
for tr, notes, v in ((tpt, ['D5', 'F5', 'A5'], 118), (horns, ['D4', 'F4', 'A4'], 112), (tbn, ['D3', 'A3'], 114),
                     (strings, ['D4', 'F4', 'A4', 'D5'], 112), (choir, ['D4', 'F4', 'A4'], 112), (tuba, ['D2'], 118)):
    tr.chord(bar(9), [n(p) for p in notes], 3.5, v)
hit.chord(bar(9), ['D3', 'F3', 'A3', 'D4'], 1, 120)
drums.note(bar(9), DRUM['crash2'], 4, 124)
pc.roll(timp, bar(9), 3.5, 'D2', 120, 70, rate=8)

for b, t in ((0, 'Humain'), (1, 'Le myco detale'), (2, 'La colere'), (6, 'This is war'), (7, 'Tutti'), (9, 'Accord final')):
    pc.marker(b, t)
pc.save(10)
