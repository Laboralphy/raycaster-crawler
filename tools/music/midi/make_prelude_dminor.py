"""Prélude en ré mineur pour clavecin seul, dans le style du premier prélude
du Clavier bien tempéré (BWV 846) : un accord par mesure, brisé en doubles
croches. Pièce originale, jouable sur un vrai clavecin : étendue ré2-sol4,
écarts d'une octave au plus par main, vélocité constante (le clavecin n'a
pas de nuances). Hors jeu.

66 bpm, 35 mesures (2:07), sans boucle.

 1-8   ré mineur, cadence sur la dominante
 9-16  fa majeur (relatif)
 17-27 marche d'harmonie par quintes, retour en ré mineur
 28-31 pédale de dominante
 32-35 pédale de tonique, accord final en ré majeur (tierce picarde)

Chaque mesure : main gauche basse (tenue deux temps) et ténor (tenu un
temps trois quarts), main droite trois notes en doubles croches ; le même
motif deux fois par mesure.

Écrit aussi la partition LilyPond (prelude_dminor.ly) ; la mettre en PDF :
    lilypond prelude_dminor.ly
"""
from compose import Piece, GM, n

pc = Piece('prelude_dminor', 66, 'Prelude in D minor for harpsichord', seed=1722)
bar = pc.bar

rh = pc.track('Main droite', 0, GM['Harpsichord'], volume=110, pan=64, reverb=40)
lh = pc.track('Main gauche', 1, GM['Harpsichord'], volume=110, pan=64, reverb=40)

# basse, ténor, puis les trois notes de la main droite
BARS = [
    # ré mineur
    ('D3', 'F3', 'A3', 'D4', 'F4'),     # 1  Dm
    ('D3', 'G3', 'Bb3', 'D4', 'G4'),    # 2  Gm/D
    ('C#3', 'G3', 'A3', 'E4', 'G4'),    # 3  A7/C#
    ('D3', 'F3', 'A3', 'D4', 'F4'),     # 4  Dm
    ('C3', 'F3', 'A3', 'D4', 'F4'),     # 5  Dm/C
    ('Bb2', 'G3', 'Bb3', 'D4', 'G4'),   # 6  Gm/Bb
    ('Bb2', 'E3', 'G3', 'C#4', 'E4'),   # 7  C#dim7/Bb
    ('A2', 'E3', 'A3', 'C#4', 'E4'),    # 8  A
    # fa majeur
    ('D3', 'F3', 'A3', 'D4', 'F4'),     # 9  Dm
    ('E3', 'G3', 'Bb3', 'C4', 'E4'),    # 10 C7/E
    ('F2', 'F3', 'A3', 'C4', 'F4'),     # 11 F
    ('D3', 'F3', 'Bb3', 'D4', 'F4'),    # 12 Bb/D
    ('Bb2', 'G3', 'Bb3', 'D4', 'G4'),   # 13 Gm/Bb
    ('C3', 'G3', 'Bb3', 'C4', 'E4'),    # 14 C7
    ('F2', 'F3', 'A3', 'C4', 'F4'),     # 15 F
    ('F2', 'C3', 'A3', 'C4', 'F4'),     # 16 F
    # marche par quintes
    ('Bb2', 'F3', 'A3', 'D4', 'F4'),    # 17 Bbmaj7
    ('E3', 'G3', 'Bb3', 'D4', 'G4'),    # 18 Em7b5
    ('A2', 'G3', 'A3', 'C#4', 'E4'),    # 19 A7
    ('D3', 'F3', 'A3', 'D4', 'F4'),     # 20 Dm
    ('G2', 'F3', 'Bb3', 'D4', 'G4'),    # 21 Gm7
    ('C3', 'E3', 'Bb3', 'C4', 'G4'),    # 22 C7
    ('F2', 'E3', 'A3', 'C4', 'F4'),     # 23 Fmaj7
    ('Bb2', 'D3', 'A3', 'D4', 'F4'),    # 24 Bbmaj7
    ('G#2', 'F3', 'B3', 'D4', 'F4'),    # 25 G#dim7
    ('A2', 'F3', 'A3', 'D4', 'F4'),     # 26 Dm/A (quarte et sixte de cadence)
    ('A2', 'E3', 'G3', 'C#4', 'E4'),    # 27 A7
    # pédale de dominante
    ('A2', 'D3', 'A3', 'D4', 'F4'),     # 28 Dm/A
    ('A2', 'F3', 'B3', 'D4', 'G#4'),    # 29 G#dim7/A
    ('A2', 'E3', 'G3', 'C#4', 'E4'),    # 30 A7
    ('A2', 'E3', 'A3', 'C#4', 'E4'),    # 31 A
    # pédale de tonique
    ('D2', 'C3', 'F#3', 'A3', 'C4'),    # 32 D7
    ('D2', 'Bb2', 'G3', 'Bb3', 'D4'),   # 33 Gm/D
    ('D2', 'C#3', 'G3', 'A3', 'E4'),    # 34 A7/D
]
FINAL = ('D2', 'A2', 'D3', 'F#3', 'A3', 'D4')   # 35 ré majeur, arpégé

VEL = 90
for i, (b, t, *upper) in enumerate(BARS):
    for half in (0, 2):
        t0 = bar(i, half)
        lh.note(t0, n(b), 2, pc.hum(VEL, 2))
        lh.note(t0 + 0.25, n(t), 1.75, pc.hum(VEL, 2))
        for k, p in enumerate(upper * 2):
            rh.note(t0 + 0.5 + k * 0.25, n(p), 0.25, pc.hum(VEL, 2))

# accord final arpégé de bas en haut, tenu jusqu'à la fin
t0 = bar(len(BARS))
for k, p in enumerate(FINAL):
    (lh if k < 3 else rh).note(t0 + k * 0.125, n(p), 4 - k * 0.125, VEL)

for b, txt in ((0, 'Re mineur'), (8, 'Fa majeur'), (16, 'Marche'),
               (27, 'Pedale de dominante'), (31, 'Pedale de tonique')):
    pc.marker(b, txt)
pc.save(len(BARS) + 1)


# ------------------------------------------------------------ partition
def ly(name):
    """'Bb2' -> 'bes,', 'F#4' -> "fis'" (hauteur absolue LilyPond)."""
    acc = {'#': 'is', 'b': 'es'}.get(name[1:2], '')
    octave = int(name[-1]) - 3
    return name[0].lower() + acc + ("'" * octave if octave > 0 else ',' * -octave)


rh_ly, bass_ly, tenor_ly = [], [], []
for i, (b, t, *upper) in enumerate(BARS):
    s1, s2, s3 = (ly(p) for p in upper)
    half = f'r8 {s1}16 {s2} {s3} {s1} {s2} {s3}'
    rh_ly.append(f'{half} {half} |  % {i + 1}')
    bass_ly.append(f'{ly(b)}2 {ly(b)}2 |')
    tenor_ly.append(f'r16 {ly(t)}8.~ {ly(t)}4 r16 {ly(t)}8.~ {ly(t)}4 |')
low, high = ' '.join(ly(p) for p in FINAL[:3]), ' '.join(ly(p) for p in FINAL[3:])
rh_ly.append(f'<{high}>1\\arpeggio\\fermata \\bar "|."')
bass_ly.append(f'<{low}>1\\arpeggio\\fermata')
tenor_ly.append('s1')
nl = '\n    '
with open(pc.name + '.ly', 'w') as f:
    f.write(f'''\\version "2.24.0"
\\header {{
  title = "Prélude en ré mineur"
  subtitle = "pour clavecin"
  tagline = ##f
}}
\\paper {{ #(set-paper-size "a4") }}
global = {{ \\key d \\minor \\time 4/4 \\tempo "Moderato" 4 = 66 }}
\\score {{
  \\new PianoStaff \\with {{ connectArpeggios = ##t }} <<
    \\new Staff = "rh" {{ \\global \\clef treble
    {nl.join(rh_ly)}
    }}
    \\new Staff = "lh" {{ \\global \\clef bass
      << {{ \\voiceTwo
    {nl.join(bass_ly)}
      }} \\\\ {{ \\voiceOne
    {nl.join(tenor_ly)}
      }} >>
    }}
  >>
  \\layout {{ }}
}}
''')
print(pc.name + '.ly : partition LilyPond')
