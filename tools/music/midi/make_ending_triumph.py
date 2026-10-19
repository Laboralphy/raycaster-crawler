"""Cinématique de fin - Le triomphe : hymne orchestral épique, dans l'esprit
du final d'« Avalon » de Mamoru Oshii (musique de Kenji Kawai) : chœur
solennel sur un ostinato de cordes graves et de tambours, couleur phrygienne
(do mineur avec ré bémol), longue montée vers un sommet. Musique originale ;
la référence n'a servi qu'à mesurer forme, tempo, tonalité et couleur
(analyse_ref.py sur un extrait gardé hors du dépôt).

Do mineur (phrygien), 130 bpm, 42 mesures (1:18), en boucle. La cinématique
de fin montre quatre tableaux de 18,7 s chacun (doré, pourpre, gris, forêt) :
une section de 10 mesures (18,5 s) par tableau.

 0-3   une voix seule sur une nappe, sans basse
 4-9   entrée en force : taikos et timbales à la noire, cordes graves en
       croches (do - ré bémol), chœur grave
 10-19 le thème du Grimoire (motifs.THEME, transposé en do mineur) au chœur
       et aux cors
 20-25 la respiration : plus de basse ni de tambours, chœur et cordes seuls
 26-29 la remontée : roulement de timbales, les tambours reviennent
 30-39 le sommet : thème en tutti, voix soprano en descant, cloches, cymbales
 40-41 accord final de do majeur, gong
"""
from compose import Piece, GM, DRUM, n, segments, bass_note
from motifs import THEME

pc = Piece('ending_triumph', 130, 'Give Back My Grimoire! - Triumph', seed=77)
bar = pc.bar


def down(melody, semitones=2):
    """Transpose une mélodie (liste par mesure de (note, durée)) vers le bas."""
    return [[(None if p is None else n(p) - semitones, d) for p, d in m] for m in melody]


THEME_C = down(THEME)
THEME_C_CHORDS = ['Cm', 'Ab', 'Fm', 'G', 'Fm', 'Cm|G', 'Db', 'Cm']
PROG = ['Cm', 'Cm', 'Db', 'Cm', 'Ab', 'Db', 'Bb', 'G']
BRIDGE = ['Db', 'G']
CALM = ['Cm', 'Ab', 'Db', 'Cm', 'Fm', 'G']
RISE = ['Ab', 'Bb', 'Db', 'G']

choir = pc.track('Choeur', 0, GM['ChoirAahs'], volume=118, pan=64, reverb=110)
oohs = pc.track('Choeur ooh', 1, GM['VoiceOohs'], volume=100, pan=40, reverb=110)
solo = pc.track('Voix soprano', 2, GM['VoiceOohs'], volume=112, pan=72, reverb=127)
horns = pc.track('Cors', 3, GM['FrenchHorn'], volume=110, pan=44, reverb=100)
tbn = pc.track('Trombones', 4, GM['Trombone'], volume=104, pan=34, reverb=90)
tuba = pc.track('Tuba', 5, GM['Tuba'], volume=118, pan=56, reverb=80)
strings = pc.track('Cordes', 6, GM['Strings1'], volume=96, pan=84, reverb=100)
low = pc.track('Cordes graves', 7, GM['Contrabass'], volume=127, pan=60, reverb=70)
cello = pc.track('Violoncelles', 8, GM['Cello'], volume=108, pan=70, reverb=80)
drums = pc.track('Batterie', 9, None, volume=100, reverb=80)
timp = pc.track('Timbales', 10, GM['Timpani'], volume=112, pan=64, reverb=90)
taiko = pc.track('Taikos', 11, GM['Taiko'], volume=127, pan=64, reverb=80)
bells = pc.track('Cloches', 12, GM['TubularBells'], volume=100, pan=76, reverb=120)
pad = pc.track('Nappe', 13, GM['WarmPad'], volume=80, pan=64, reverb=110)

FORM = (['Cm', 'Cm', 'Db', 'Cm'] + PROG[2:] + THEME_C_CHORDS + BRIDGE + CALM + RISE
        + THEME_C_CHORDS + BRIDGE + ['C', 'C'])
assert len(FORM) == 42
DRIVE = list(range(4, 20)) + list(range(26, 40))   # mesures avec tambours et basse


def at(b, prog):
    return [(b + i, s, d, c) for i, s, d, c in segments(prog)]


# ------------------------------------------------------------ la voix seule (0-3)
pc.pad(pad, 0, FORM[:4], vel=64, lo='G3', hi='G4')
pc.pad(pad, 20, CALM, vel=70, lo='G3', hi='G4')
pc.melody(solo, 0, [
    [('G5', 3), ('Ab5', 1)],
    [('G5', 2), ('F5', 1), ('Eb5', 1)],
    [('F5', 3), ('Db5', 1)],
    [('C5', 4)],
], vel=88, legato=1.0)

# ------------------------------------------------------------ l'ostinato (tambours, basse)
# cordes graves en croches : la fondamentale, le demi-ton phrygien au-dessus
OSTINATO = [0, 0, 1, 0, 0, 0, -2, 0]
for b0, prog in ((4, PROG[2:]), (10, THEME_C_CHORDS + BRIDGE), (26, RISE), (30, THEME_C_CHORDS + BRIDGE)):
    pc.riff(low, b0, prog, OSTINATO, 'C2', step=0.5, dur=0.45, vel=96, accents=(0, 4), accent=14)
    pc.riff(cello, b0, prog, OSTINATO, 'C3', step=0.5, dur=0.45, vel=84, accents=(0, 4), accent=12)
    pc.bass(tuba, b0, prog, [(0, 1.8, 0), (2, 1.8, 0)], lo='C1', vel=104)
# taikos à la noire, toms en croches, timbales sur les temps forts
GROOVE = {'kick2': [(0, 120), (2, 108)], 'kick': [(0, 110), (1, 84), (2, 100), (3, 84)], 'tom_lo2': [(1, 84), (3, 88)], 'tom_lo': [(3.5, 76)]}
for b in DRIVE:
    for beat in range(4):
        taiko.note(bar(b, beat), 'C2' if beat % 2 == 0 else 'G1', 0.5, pc.hum((120 if beat == 0 else 104) + (6 if b >= 30 else 0)))
pc.drums(drums, 4, 16, GROOVE)
pc.drums(drums, 26, 14, GROOVE)
ROOTS = {'C': 'C2', 'D': 'Db2', 'A': 'Ab1', 'B': 'Bb1', 'G': 'G1', 'F': 'F2', 'E': 'Eb2'}
for i, s, d, c in segments(FORM):
    if i in DRIVE and s == 0:
        timp.note(bar(i), ROOTS[c[0]], 1, pc.hum(104))

# ------------------------------------------------------------ entrée en force (4-9)
drums.note(bar(4), DRUM['crash'], 4, 120)
drums.note(bar(4), DRUM['gong'], 4, 110)
pc.pad(choir, 4, PROG[2:], vel=92, lo='C3', hi='C4')
pc.pad(tbn, 4, PROG[2:], vel=88, lo='C3', hi='C4')
pc.pad(strings, 4, PROG[2:], vel=78, lo='G3', hi='G4')
pc.swell(strings, 4, 10, 80, 120)

# ------------------------------------------------------------ le thème du Grimoire (10-19)
pc.melody(choir, 10, THEME_C, vel=100)
pc.melody(horns, 10, THEME_C, vel=96, octave=-1)
pc.pad(oohs, 10, THEME_C_CHORDS + BRIDGE, vel=84, lo='G3', hi='G4')
pc.pad(strings, 10, THEME_C_CHORDS + BRIDGE, vel=80, lo='G3', hi='G4')
pc.pad(choir, 18, BRIDGE, vel=104, lo='G3', hi='G4')
pc.pad(horns, 18, BRIDGE, vel=104, lo='F3', hi='F4')
pc.roll(timp, bar(19, 2), 2, 'G1', 70, 118, rate=8)

# ------------------------------------------------------------ la respiration (20-25)
pc.pad(choir, 20, CALM, vel=74, lo='G3', hi='G4')
pc.pad(strings, 20, CALM, vel=68, lo='G3', hi='G4')
pc.melody(solo, 21, [
    [('Eb5', 2), ('F5', 1), ('G5', 1)],
    [('Ab5', 3), ('G5', 1)],
    [('F5', 2), ('Eb5', 2)],
    [('D5', 3), (None, 1)],
], vel=86, legato=1.0)

# ------------------------------------------------------------ la remontée (26-29)
pc.pad(choir, 26, RISE, vel=100, lo='G3', hi='G4')
pc.pad(tbn, 26, RISE, vel=96, lo='Bb2', hi='Bb3')
pc.pad(strings, 26, RISE, vel=92, lo='C4', hi='C5')
pc.swell(strings, 26, 30, 80, 127)
pc.roll(timp, bar(28), 8, 'G1', 50, 127, rate=8)
pc.roll(drums, bar(29, 2), 2, DRUM['snare'], 60, 120, rate=8)

# ------------------------------------------------------------ le sommet (30-39)
drums.note(bar(30), DRUM['crash'], 4, 124)
drums.note(bar(30), DRUM['gong'], 4, 118)
pc.melody(choir, 30, THEME_C, vel=124)
pc.pad(choir, 30, THEME_C_CHORDS + BRIDGE, vel=108, lo='C3', hi='C4')
pc.melody(horns, 30, THEME_C, vel=124)
pc.melody(tbn, 30, THEME_C, vel=120, octave=-1)
pc.melody(strings, 30, THEME_C, vel=112)
pc.pad(oohs, 30, THEME_C_CHORDS + BRIDGE, vel=96, lo='G3', hi='G4')
# descant de la soprano, haut au-dessus du thème
pc.melody(solo, 30, [
    [('C6', 4)], [('Eb6', 4)], [('C6', 2), ('Ab5', 2)], [('B5', 4)],
    [('C6', 2), ('Ab5', 2)], [('G5', 4)], [('Ab5', 2), ('F5', 2)], [('G5', 4)],
    [('Ab5', 4)], [('B5', 4)],
], vel=96, legato=1.0)
for b in (30, 34, 38):
    bells.chord(bar(b), ['C5', 'G4'], 3.5, 104)
for b in range(31, 40):
    drums.note(bar(b), DRUM['crash2'], 1, 84)
pc.roll(timp, bar(39, 2), 2, 'G1', 80, 127, rate=8)

# ------------------------------------------------------------ accord final (40-41)
for tr, notes, v in ((choir, ['C4', 'E4', 'G4', 'C5'], 116), (oohs, ['G3', 'C4', 'E4'], 104),
                     (horns, ['C3', 'G3', 'E4'], 112), (tbn, ['C3', 'G3'], 110), (tuba, ['C2'], 116),
                     (strings, ['C4', 'E4', 'G4', 'C5'], 112), (low, ['C2'], 112), (cello, ['C3'], 104),
                     (solo, ['E6'], 100), (pad, ['C4', 'E4', 'G4'], 80)):
    tr.chord(bar(40), [n(p) for p in notes], 7.5, v - 14)
bells.chord(bar(40), ['C5', 'E5', 'G4'], 6, 112)
drums.note(bar(40), DRUM['gong'], 8, 124)
drums.note(bar(40), DRUM['crash'], 4, 120)
taiko.note(bar(40), 'C2', 2, 120)
pc.roll(timp, bar(40), 6, 'C2', 110, 50, rate=8)

for b, t in ((0, 'Voix seule'), (4, 'Entree'), (10, 'Theme du Grimoire'), (20, 'Respiration'),
             (26, 'Remontee'), (30, 'Sommet'), (40, 'Accord final')):
    pc.marker(b, t)
pc.save(42)
