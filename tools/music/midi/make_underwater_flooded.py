"""Salles inondées : sous l'eau, humide, dangereux.

Do dièse mineur, 62 bpm, 28 mesures (1:48), en boucle. Nappes qui balaient,
gouttes (echo drops), basse fretless qui glisse, vibraphone lent, chœur
grave, battement de timbales ; ré majeur (napolitain) et un trémolo qui
monte d'un demi-ton comme une menace qui approche.

 0-7   nappes, gouttes, basse qui glisse
 8-15  vibraphone sur le thème, chœur grave
 16-23 la menace : trémolo grave do dièse / ré, battements plus rapides
 24-27 retour au calme (relatif)
"""
from compose import Piece, GM, n, segments, bass_note

pc = Piece('underwater_flooded', 62, 'Give Back My Grimoire! - Flooded halls', seed=41)
bar = pc.bar

sweep = pc.track('Nappe balayee', 0, GM['SweepPad'], volume=86, pan=40, reverb=110)
bowed = pc.track('Nappe frottee', 1, GM['BowedPad'], volume=84, pan=88, reverb=110)
drops = pc.track('Gouttes', 2, GM['EchoDrops'], volume=92, pan=64, reverb=120)
fretless = pc.track('Basse fretless', 3, GM['Fretless'], volume=104, pan=64, reverb=60)
vib = pc.track('Vibraphone', 4, GM['Vibraphone'], volume=118, pan=60, reverb=120)
choir = pc.track('Choeur', 5, GM['VoiceOohs'], volume=100, pan=30, reverb=120)
trem = pc.track('Tremolo grave', 6, GM['TremoloStrings'], volume=127, pan=70, reverb=90)
timp = pc.track('Timbales', 7, GM['Timpani'], volume=80, pan=64, reverb=90)
crystal = pc.track('Bulles', 8, GM['Crystal'], volume=80, pan=96, reverb=127)

A = ['C#m', 'C#m', 'A', 'A', 'F#m', 'F#m', 'G#', 'G#']
B = ['C#m', 'D', 'C#m', 'D', 'Bm', 'A', 'G#7', 'G#7']
VIB = [
    [('G#4', 2), ('E4', 2)],
    [('C#5', 3), ('B4', 1)],
    [('A4', 2), ('C#5', 2)],
    [('E5', 4)],
    [('F#4', 2), ('A4', 2)],
    [('C#5', 2), ('B4', 2)],
    [('B#4', 2), ('D#5', 2)],
    [('G#4', 4)],
]
FORM = A + A + B + A[:4]

pc.pad(sweep, 0, FORM, vel=70, lo='G#3', hi='G#4')
pc.pad(bowed, 0, FORM, vel=64, lo='C#3', hi='C#4', voices=2)
pc.swell(sweep, 0, 2, 50, 110)
pc.scatter(drops, 0, 28, [n(x) for x in ('C#5', 'E5', 'G#5', 'B5', 'C#6')], 1, vel=(50, 90), dur=1)
pc.scatter(crystal, 2, 24, [n(x) for x in ('G#5', 'C#6', 'E6')], 1, vel=(30, 60), dur=1, grid=1)

# basse fretless qui glisse (pitch bend) vers chaque nouvelle note
for i, s, d, c in segments(FORM):
    t = bar(i, s)
    p = bass_note(c, 'C#1')
    if t >= 0.25:
        for k in range(5):
            fretless.bend(t - 0.25 + k * 0.05, -1.0 + k * 0.25)
        fretless.note(t - 0.25, p, d * 0.9 + 0.25, pc.hum(86))
    else:
        fretless.note(t, p, d * 0.9, pc.hum(86))

pc.melody(vib, 8, VIB, vel=86, legato=1)
pc.pad(choir, 8, A, vel=64, lo='C#3', hi='C#4')
choir.cc(bar(8) - 0.01, 11, 110)

# la menace : trémolo do dièse / ré, timbales en battement qui accélère
for k in range(8):
    trem.note(bar(16 + k), 'C#2' if k % 2 == 0 else 'D2', 4, 80 + k * 4)
trem.cc(0, 11, 40)
pc.swell(trem, 16, 24, 40, 124)
trem.cc(bar(24), 11, 40)
pc.pad(choir, 16, B, vel=72, lo='E3', hi='E4')
for b in range(16, 24):
    beats = (0, 2) if b < 20 else (0, 1, 2, 3)
    for x in beats:
        timp.note(bar(b, x), 'C#2', 0.5, pc.hum(70 + (b - 16) * 5))
        timp.note(bar(b, x + 0.3), 'C#2', 0.5, pc.hum(50 + (b - 16) * 4))
pc.roll(timp, bar(23, 2), 2, 'G#1', 60, 116)
for b in (8, 12, 24):
    timp.note(bar(b), 'C#2', 1, 60)

for b, t in ((0, 'Nappes'), (8, 'Vibraphone'), (16, 'Menace'), (24, 'Retour')):
    pc.marker(b, t)
pc.save(28)
