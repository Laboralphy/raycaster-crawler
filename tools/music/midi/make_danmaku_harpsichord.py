"""Danmaku au clavecin : morceau original dans l'esprit des thèmes de Touhou
Project (pas une reprise). Hors jeu, pour un projet futur.

La mineur, 160 bpm, 64 mesures (1:36), en boucle. Clavecin en voix
principale (mélodie rapide, syncopée), basse en octaves, piano en accords
brisés, cordes, cuivres de synthé en coups 3+3+2 sur le refrain ; refrain
sur la « progression royale » (fa, sol, mi mineur, la mineur).

 0-7   intro : clavecin en arpèges, batterie et basse à la mesure 4
 8-23  couplet (A) : thème au clavecin
 24-31 pont (B) : montée en ré mineur, mi majeur pour lancer le refrain
 32-47 refrain : clavecin doublé par les cordes, cuivres syncopés
 48-55 envolée : traits du clavecin en doubles croches, cordes en tenues
 56-63 reprise du refrain, cadence sur mi pour reboucler
"""
from compose import Piece, GM, n, segments, tones

pc = Piece('danmaku_harpsichord', 160, 'Danmaku for harpsichord', seed=6)
bar = pc.bar

lead = pc.track('Clavecin', 0, GM['Harpsichord'], volume=127, pan=58, reverb=50)
harp2 = pc.track('Clavecin arpeges', 1, GM['Harpsichord'], volume=96, pan=84, reverb=60)
piano = pc.track('Piano', 2, GM['Piano'], volume=84, pan=40, reverb=50)
bass = pc.track('Basse', 3, GM['FingerBass'], volume=86, pan=64, reverb=20)
strings = pc.track('Cordes', 4, GM['Strings1'], volume=92, pan=76, reverb=80)
sbrass = pc.track('Cuivres synthe', 5, GM['SynthBrass1'], volume=84, pan=48, reverb=60)
violin = pc.track('Cordes melodie', 6, GM['Strings2'], volume=88, pan=70, reverb=80)
drums = pc.track('Batterie', 9, None, volume=88, reverb=40)

INTRO = ['Am', 'Am', 'F', 'G', 'Am', 'Am', 'F', 'E']
A1 = ['Am', 'F', 'G', 'Em', 'F', 'G', 'Am', 'E']
A2 = ['Am', 'F', 'G', 'Em', 'F', 'G', 'E', 'Am']
B = ['Dm', 'Em', 'F', 'G', 'Dm', 'Em', 'F', 'E']
C1 = ['F', 'G', 'Em', 'Am', 'F', 'G', 'Am', 'Am']
C2 = ['F', 'G', 'Em', 'Am', 'Dm', 'E', 'Am', 'E']
SOLO = ['Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E']
CODA = ['F', 'G', 'Em', 'Am', 'F', 'G', 'E', 'E']
FORM = INTRO + A1 + A2 + B + C1 + C2 + SOLO + CODA

THEME = [
    [('E5', .5), ('A5', .5), ('B5', .5), ('C6', 1), ('B5', .5), ('A5', .5), ('E5', .5)],
    [('F5', .75), ('E5', .25), ('F5', .5), ('A5', .5), ('C6', 1), ('A5', 1)],
    [('G5', .5), ('B5', .5), ('D6', 1), ('C6', .5), ('B5', .5), ('G5', 1)],
    [('B5', 1.5), ('A5', .5), ('G5', 1), ('E5', 1)],
    [('A5', .5), ('C6', .5), ('F6', 1), ('E6', .5), ('D6', .5), ('C6', 1)],
    [('D6', .5), ('B5', .5), ('G5', .5), ('B5', .5), ('D6', 1), ('C6', .5), ('B5', .5)],
]
VERSE = THEME + [
    [('C6', .75), ('B5', .25), ('A5', .5), ('E5', .5), ('A5', 2)],
    [('G#5', 1), ('B5', 1), ('E6', 1), ('D6', .5), ('B5', .5)],
] + THEME + [
    [('G#5', .5), ('A5', .5), ('B5', .5), ('C6', .5), ('D6', .5), ('C6', .5), ('B5', .5), ('G#5', .5)],
    [('A5', 3), (None, 1)],
]
BRIDGE = [
    [('D5', .5), ('F5', .5), ('A5', .5), ('F5', .5), ('D5', .5), ('F5', .5), ('A5', .5), ('D6', .5)],
    [('E5', .5), ('G5', .5), ('B5', .5), ('G5', .5), ('E5', .5), ('G5', .5), ('B5', .5), ('E6', .5)],
    [('F5', .5), ('A5', .5), ('C6', .5), ('A5', .5), ('F6', 1), ('E6', .5), ('C6', .5)],
    [('D6', 1.5), ('B5', .5), ('G5', 1), ('D6', 1)],
    [('F5', .5), ('A5', .5), ('D6', .5), ('A5', .5), ('F6', 1.5), ('D6', .5)],
    [('G5', .5), ('B5', .5), ('E6', .5), ('B5', .5), ('G6', 1.5), ('E6', .5)],
    [('F6', .5), ('E6', .5), ('D6', .5), ('C6', .5), ('A5', .5), ('C6', .5), ('F6', 1)],
    [('E6', 1), ('D6', .5), ('C6', .5), ('B5', .5), ('G#5', .5), ('E5', 1)],
]
HOOK = [
    [('A5', .5), ('C6', .5), ('C6', .5), ('D6', .5), ('C6', .75), ('A5', .25), ('F5', 1)],
    [('G5', .5), ('B5', .5), ('D6', .5), ('E6', 1), ('D6', .5), ('B5', 1)],
    [('E6', 1.5), ('D6', .5), ('B5', .5), ('G5', .5), ('E5', 1)],
    [('A5', .5), ('B5', .5), ('C6', .5), ('E6', 1), ('D6', .5), ('C6', .5), ('B5', .5)],
    [('C6', .5), ('A5', .5), ('C6', .5), ('F6', 1.5), ('E6', .5), ('D6', .5)],
    [('D6', .5), ('E6', .5), ('D6', .5), ('B5', .5), ('G5', 1), ('B5', .5), ('D6', .5)],
]
CHORUS = HOOK + [
    [('E6', 1.5), ('C6', .5), ('A5', 1), ('B5', .5), ('C6', .5)],
    [('A5', 3), ('E5', .5), ('G5', .5)],
] + HOOK[:2] + [
    [('G6', 1), ('E6', .5), ('D6', .5), ('B5', 1), ('G5', 1)],
    [('A5', .5), ('C6', .5), ('E6', .5), ('A6', 1.5), ('G6', .5), ('E6', .5)],
    [('F6', 1), ('E6', .5), ('D6', .5), ('A5', 1), ('D6', 1)],
    [('E6', 1), ('D6', .5), ('C6', .5), ('B5', 1), ('G#5', 1)],
    [('A5', .5), ('C6', .5), ('E6', .5), ('A6', .5), ('G6', .5), ('E6', .5), ('C6', .5), ('E6', .5)],
    [('B5', 1.5), ('G#5', .5), ('E5', 2)],
]
CODA_MEL = HOOK + [
    [('G#5', .5), ('B5', .5), ('E6', 1), ('D6', .5), ('C6', .5), ('B5', .5), ('G#5', .5)],
    [('B5', 2), ('G#5', 1), ('E5', 1)],
]
SOLO_STR = [[(p, 4)] for p in ('E5', 'D5', 'C5')] + [[('B4', 2), ('G#4', 2)]] \
    + [[(p, 4)] for p in ('A5', 'B5', 'A5')] + [[('G#5', 2), ('B5', 2)]]

# ------------------------------------------------------------ clavecin
# voix principale dans l'aigu, comme les thèmes de Touhou
pc.melody(lead, 8, VERSE, vel=104, legato=0.9)
pc.melody(lead, 24, BRIDGE, vel=106, legato=0.9)
pc.melody(lead, 32, CHORUS, vel=112, legato=0.9)
pc.melody(lead, 56, CODA_MEL, vel=112, legato=0.9)
# envolée : traits en doubles croches, montée et descente sur l'accord
pc.arp(lead, 48, SOLO, [0, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1], 'A4', 'E6',
       vel=96, step=0.25, dur=0.3, accents=(0, 8), accent=16)
# second clavecin : arpèges en croches sous la mélodie (doubles croches en intro)
pc.arp(harp2, 0, INTRO, [0, 2, 1, 3, 2, 4, 3, 5], 'A3', 'A5', vel=84, step=0.25, dur=0.3, accents=(0,))
pc.arp(harp2, 8, A1 + A2 + B, [0, 2, 4, 2], 'A3', 'A5', vel=72, step=0.5, dur=0.45, accents=(0,))
pc.arp(harp2, 32, C1 + C2, [0, 2, 4, 5, 4, 2], 'C4', 'C6', vel=76, step=0.5, dur=0.45, accents=(0,))
pc.arp(harp2, 56, CODA, [0, 2, 4, 5, 4, 2], 'C4', 'C6', vel=76, step=0.5, dur=0.45, accents=(0,))

# ------------------------------------------------------------ harmonie
# piano : accords brisés (basse, accord, accord) en croches
for i, s, d, c in segments(FORM):
    if i < 4:
        continue
    low = tones(c, 'A2', 'A3')
    mid = tones(c, 'E3', 'E4')[:3]
    for k in range(8):
        t = bar(i, k / 2)
        if k in (0, 4):
            piano.note(t, low[0], 0.45, pc.hum(80))
        elif k in (3, 7):
            piano.chord(t, mid, 0.4, pc.hum(70))
        else:
            piano.note(t, mid[k % len(mid)], 0.4, pc.hum(62))
pc.pad(strings, 0, FORM[:32], vel=64, lo='A3', hi='A4')
pc.pad(strings, 32, C1 + C2 + SOLO + CODA, vel=78, lo='E3', hi='E4', voices=4)
pc.swell(strings, 0, 8, 60, 110)
pc.swell(strings, 24, 32, 70, 120)
# cordes : doublure du refrain à l'octave inférieure, tenues pendant l'envolée
pc.melody(violin, 32, CHORUS, vel=76, octave=-1, legato=1.0, accent=0)
pc.melody(violin, 48, SOLO_STR, vel=82)
pc.melody(violin, 56, CODA_MEL, vel=80, octave=-1, legato=1.0, accent=0)
# cuivres de synthé : coups 3+3+2 sur le refrain et la reprise
for b0, prog in ((32, C1 + C2), (56, CODA)):
    for i, s, d, c in segments(prog):
        for x, dur in ((0, 1.2), (1.5, 1.2), (3, 0.8)):
            sbrass.chord(bar(b0 + i, x), tones(c, 'C4', 'C5')[:3], dur, pc.hum(88))

# ------------------------------------------------------------ basse
OCT = [(x / 2, 0.42, 12 if x % 2 else 0) for x in range(8)]
pc.bass(bass, 4, FORM[4:24], OCT, lo='E1', vel=96)
pc.bass(bass, 24, B, [(x / 2, 0.42, 0) for x in range(8)], lo='E1', vel=100)
pc.bass(bass, 32, FORM[32:], OCT, lo='E1', vel=104)

# ------------------------------------------------------------ batterie
VERSE_KIT = {'kick2': [(0, 108), (1.5, 88), (2, 104)],
             'snare': [(1, 100), (3, 106)],
             'hh_closed': [(x / 2, 78 if x % 2 == 0 else 58) for x in range(8)]}
BUILD_KIT = {'kick2': [(x, 104) for x in range(4)],
             'snare': [(1, 96), (3, 104), (3.5, 80)],
             'hh_closed': [(x / 4, 70 if x % 2 == 0 else 46) for x in range(16)]}
CHORUS_KIT = {'kick2': [(0, 112), (1, 96), (1.5, 90), (2, 108), (3, 96)],
              'snare': [(1, 108), (3, 112)],
              'hh_open': [(x + 0.5, 70) for x in range(4)],
              'hh_closed': [(x, 60) for x in range(4)]}
SOLO_KIT = {'kick2': [(0, 108), (2, 104), (2.5, 90)],
            'snare': [(1, 100), (3, 106)],
            'ride': [(x / 2, 80 if x % 2 == 0 else 60) for x in range(8)]}
pc.drums(drums, 4, 4, {'kick2': [(0, 100), (2, 96)], 'hh_closed': [(x / 2, 60) for x in range(8)]})
pc.drums(drums, 8, 16, VERSE_KIT)
pc.drums(drums, 24, 8, BUILD_KIT)
pc.drums(drums, 32, 16, CHORUS_KIT)
pc.drums(drums, 48, 8, SOLO_KIT)
pc.drums(drums, 56, 8, CHORUS_KIT)
for b in (8, 24, 32, 40, 48, 56):
    drums.note(bar(b), 49, 2, 112)
for b in (7, 15, 23, 31, 39, 47, 55, 63):
    pc.fill(drums, bar(b, 2), ['snare', 'snare', 'tom_hi', 'tom_hi2', 'tom_mid', 'tom_mid2', 'tom_lo', 'tom_lo2'])

for b, t in ((0, 'Intro'), (8, 'Couplet'), (24, 'Pont'), (32, 'Refrain'),
             (48, 'Envolee'), (56, 'Reprise')):
    pc.marker(b, t)
pc.save(64)
