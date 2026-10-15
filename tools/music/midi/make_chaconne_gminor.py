"""Chaconne en sol mineur pour clavecin seul : basse obstinée de huit mesures
(tétracorde descendant de lamento, sol-fa-mi bémol-ré, puis cadence) et sept
variations de plus en plus animées. Pièce originale, jouable sur un vrai
clavecin : main droite et main gauche sur deux pistes, une main ne dépasse
jamais l'octave, vélocité constante. Hors jeu.

3/4, 76 bpm, 64 mesures (2:32), sans boucle.

 1-8    thème : accords en rythme de sarabande (appui sur le 2e temps)
 9-16   var. 1 : mélodie en croches
 17-24  var. 2 : accords brisés en doubles croches
 25-32  var. 3 : la basse court en croches
 33-40  var. 4 : main droite en doubles croches (broderies)
 41-48  var. 5 : la basse en doubles croches, accords à la main droite
 49-56  var. 6 : arpèges sur deux octaves, basse en octaves
 57-64  var. 7 : thème final, accord de sol majeur (tierce picarde)

Écrit aussi la partition LilyPond (chaconne_gminor.ly) :
    lilypond chaconne_gminor.ly
"""
from itertools import combinations

from compose import Piece, GM, n, chord, tones

pc = Piece('chaconne_gminor', 76, 'Chaconne in G minor for harpsichord', beats=3, seed=1720)
rh_tr = pc.track('Main droite', 0, GM['Harpsichord'], volume=110, pan=64, reverb=40)
lh_tr = pc.track('Main gauche', 1, GM['Harpsichord'], volume=110, pan=64, reverb=40)

BAR = 12            # mesure en doubles croches
VEL = 88
GROUND = [('G2', 'Gm'), ('F2', 'Dm/F'), ('Eb2', 'Cm/Eb'), ('D2', 'D'),
          ('Eb2', 'Eb'), ('C2', 'Cm'), ('D2', 'D7'), ('G2', 'Gm')]
VARIATIONS = 8


# ------------------------------------------------------------ harmonie
def scale(c):
    """Sol mineur ; fa dièse quand l'accord le contient."""
    pcs = {7, 9, 10, 0, 2, 3, 5}
    return pcs - {5} | {6} if 6 in chord(c)[1] else pcs


def step(p, k, c):
    """k degrés de la gamme au-dessus (k > 0) ou au-dessous de p."""
    pcs, s = scale(c), (1 if k > 0 else -1)
    for _ in range(abs(k)):
        p += s
        while p % 12 not in pcs:
            p += s
    return p


def toward(target, frm, c):
    """Note voisine de target, prise du côté de frm (appoggiature, passage)."""
    return step(target, -1 if frm < target else 1, c)


def voicings(c):
    """Accords de trois sons pour la main droite, dans l'octave, entre fa4 et la5."""
    pcs = chord(c)[1]
    need = {(chord(c)[0] + 4) % 12, (chord(c)[0] + 10) % 12} if c.endswith('7') else pcs
    for v in combinations(tones(c, 'F4', 'A5'), 3):
        if need <= {p % 12 for p in v} and v[2] - v[0] <= 12:
            yield v


def lead(prev_v, prev_b, c, b):
    """Voicing le plus proche du précédent, sans quintes ni octaves parallèles
    entre la basse et le dessus."""
    def cost(v):
        k = sum(abs(x - y) for x, y in zip(v, prev_v))
        a, z = (prev_v[2] - prev_b) % 12, (v[2] - b) % 12
        if a == z and a in (0, 7) and v[2] != prev_v[2] and b != prev_b:
            k += 100
        return k
    return min(voicings(c), key=cost)


BASS = [n(b) for b, _ in GROUND]
CH = [c for _, c in GROUND]
VO = [(n('G4'), n('Bb4'), n('D5'))]
for i in range(1, 8):
    VO.append(lead(VO[-1], BASS[i - 1], CH[i], BASS[i]))


def above(c, b, k):
    """k-ième note de l'accord au-dessus de la basse (k = 1, 2...)."""
    return [p for p in tones(c, 'C2', 'C5') if p > b][k - 1]


# ------------------------------------------------------------ écriture
RH, LH = [], []     # (début en doubles croches, hauteurs, durée)


def put(hand, g, pos, pitches, dur):
    hand.append((g * BAR + pos, tuple(sorted(pitches)), dur))


def notes(hand, g, pos, line, dur):
    for k, p in enumerate(line):
        put(hand, g, pos + k * dur, [p], dur)


for v in range(VARIATIONS):
    for i in range(8):
        g = v * 8 + i
        b, c, vo = BASS[i], CH[i], VO[i]
        low, mid, top = vo
        last = i == 7
        ni = (i + 1) % 8
        nb, nt = BASS[ni], VO[ni][2]
        ct1, ct2 = above(c, b, 1), above(c, b, 2)

        if v in (0, 5, 7):
            # sarabande : noire, noire pointée appuyée, croche de passage
            final = v == 7 and last
            if final:
                vo, low, mid, top = (n('G4'), n('B4'), n('D5')), n('G4'), n('B4'), n('D5')
            if last:
                put(RH, g, 0, vo, 4)
                put(RH, g, 4, vo, 8)
            else:
                put(RH, g, 0, vo, 4)
                put(RH, g, 4, vo, 6)
                # note de passage vers le dessus suivant, ou anticipation
                pas = toward(nt, top, c)
                put(RH, g, 10, [nt if pas == top else pas], 2)
            if v == 0:
                put(LH, g, 0, [b], 12)
            elif v == 7:
                put(LH, g, 0, [b - 12, b] if b - 12 >= n('C2') else [b, b + 12], 12)
            else:
                # var. 5 : broderies de la basse en doubles croches
                line = []
                for t in (b, ct1, b + 12):
                    line += [t, step(t, 1, c), t, step(t, -1, c)]
                if not last:
                    line[8:] = [b + 12, step(b + 12, -1, c), step(b + 12, -2, c), step(b + 12, -3, c)]
                notes(LH, g, 0, line, 1)
        elif v == 1:
            line = [top, mid, top, low, mid, mid if last else toward(nt, mid, c)]
            notes(RH, g, 0, line, 2)
            notes(LH, g, 0, [b, ct1, b + 12], 4)
        elif v == 2:
            line = [top, mid, low, mid] * 3
            if not last:
                line[11] = toward(nt, mid, c)
            notes(RH, g, 0, line, 1)
            put(LH, g, 0, [b], 8)
            put(LH, g, 8, [b + 12], 4)
        elif v == 3:
            put(RH, g, 0, vo, 4)
            put(RH, g, 4, vo, 8)
            apr = b if last else (step(nb, 1, c) if nb < b else step(nb, -1, c) if nb > b else step(b, -1, c))
            notes(LH, g, 0, [b, ct1, ct2, ct1, b, apr], 2)
        elif v == 4:
            line = []
            for t in (top, mid, low):
                line += [t, step(t, 1, c), t, step(t, -1, c)]
            if not last:
                d = 1 if nt > low else -1
                line[8:] = [low, step(low, d, c), step(low, 2 * d, c), step(low, 3 * d, c)]
            notes(RH, g, 0, line, 1)
            notes(LH, g, 0, [b, ct1, b + 12], 4)
        elif v == 6:
            ext = [p - 12 for p in vo] + list(vo)
            notes(RH, g, 0, [ext[k] for k in (5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5, 4)], 1)
            notes(LH, g, 0, [b, b + 12] * 3, 2)


# ------------------------------------------------------------ MIDI
def play(tr, events, roll=0.03):
    for t, ps, d in events:
        for k, p in enumerate(ps):
            off = k * roll if len(ps) >= 3 else 0
            tr.note(t / 4 + off, p, d / 4 - off, pc.hum(VEL, 2))


play(rh_tr, RH)
play(lh_tr, LH)
for v, txt in enumerate(['Theme'] + ['Variation %d' % k for k in range(1, VARIATIONS)]):
    pc.marker(v * 8, txt)
pc.save(VARIATIONS * 8)


# ------------------------------------------------------------ partition
NAMES = ['c', 'cis', 'd', 'es', 'e', 'f', 'fis', 'g', 'as', 'a', 'bes', 'b']
LENGTHS = {12: '2.', 8: '2', 6: '4.', 4: '4', 3: '8.', 2: '8', 1: '16'}


def ly_pitch(p):
    o = p // 12 - 4
    return NAMES[p % 12] + ("'" * o if o > 0 else ',' * -o)


def ly_hand(events, nbars):
    by_bar = {}
    for t, ps, d in events:
        assert t % BAR + d <= BAR, 'note à cheval sur la barre'
        by_bar.setdefault(t // BAR, []).append((t % BAR, ps, d))
    out = []
    for g in range(nbars):
        bits, pos = [], 0
        if g % 8 == 0 and g:
            bits.append('\\mark \\markup \\small "Var. %d"' % (g // 8))
        for t, ps, d in sorted(by_bar.get(g, [])):
            assert t >= pos, 'notes superposées mesure %d' % (g + 1)
            if t > pos:
                bits.append('r' + LENGTHS[t - pos])
            body = ly_pitch(ps[0]) if len(ps) == 1 else '<%s>' % ' '.join(map(ly_pitch, ps))
            bits.append(body + LENGTHS[d])
            pos = t + d
        if pos < BAR:
            bits.append('r' + LENGTHS[BAR - pos])
        out.append(' '.join(bits) + ' |  %% %d' % (g + 1))
    out[-1] = out[-1].replace(' |', '\\fermata \\bar "|."', 1)
    return '\n    '.join(out)


with open(pc.name + '.ly', 'w') as f:
    f.write('''\\version "2.24.0"
\\header {
  title = "Chaconne en sol mineur"
  subtitle = "pour clavecin"
  tagline = ##f
}
\\paper { #(set-paper-size "a4") }
global = { \\key g \\minor \\time 3/4 \\tempo "Andante" 4 = 76 }
\\score {
  \\new PianoStaff <<
    \\new Staff = "rh" { \\global \\clef treble
    %s
    }
    \\new Staff = "lh" { \\global \\clef bass
    %s
    }
  >>
  \\layout { }
}
''' % (ly_hand(RH, VARIATIONS * 8), ly_hand(LH, VARIATIONS * 8)))
print(pc.name + '.ly : partition LilyPond')
