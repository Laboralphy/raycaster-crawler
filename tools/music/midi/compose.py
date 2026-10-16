"""Outils de composition communs aux morceaux MIDI (au-dessus de midi_kit).

Accords notés en clair ('Dm', 'Bb', 'C#dim', 'Fmaj7', 'Gm/D', 'E5'...),
progressions en listes d'une entrée par mesure ; 'Dm|A' partage la mesure
en parts égales. Mélodies : une liste par mesure de (hauteur, durée en
temps), hauteur None pour un silence.
"""
import random

from midi_kit import Song, GM, DRUM, n

PC = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
QUALITIES = {
    '': [0, 4, 7], 'm': [0, 3, 7], 'dim': [0, 3, 6], 'aug': [0, 4, 8],
    'sus2': [0, 2, 7], 'sus4': [0, 5, 7], '5': [0, 7],
    '7': [0, 4, 7, 10], 'm7': [0, 3, 7, 10], 'maj7': [0, 4, 7, 11],
    'm6': [0, 3, 7, 9], '6': [0, 4, 7, 9], 'add9': [0, 4, 7, 2], 'madd9': [0, 3, 7, 2],
    'dim7': [0, 3, 6, 9], 'm7b5': [0, 3, 6, 10], 'mmaj7': [0, 3, 7, 11],
}


def _pc(s):
    k = PC[s[0]]
    for c in s[1:]:
        k += 1 if c == '#' else -1
    return k % 12


def chord(name):
    """'Gm/D' -> (fondamentale, {classes de hauteur}, basse)."""
    name, _, slash = name.partition('/')
    i = 1
    while i < len(name) and name[i] in '#b':
        i += 1
    r = _pc(name[:i])
    pcs = {(r + x) % 12 for x in QUALITIES[name[i:]]}
    bass = _pc(slash) if slash else r
    return r, pcs, bass


def tones(name, lo, hi):
    """Notes de l'accord entre lo et hi, de bas en haut."""
    pcs = chord(name)[1]
    return [p for p in range(n(lo), n(hi) + 1) if p % 12 in pcs]


def bass_note(name, lo):
    """Basse de l'accord, dans l'octave qui commence à lo."""
    b = chord(name)[2]
    p = n(lo)
    while p % 12 != b:
        p += 1
    return p


def segments(prog, beats=4):
    """[(mesure, début, durée, accord)] pour une progression."""
    out = []
    for i, c in enumerate(prog):
        parts = c.split('|')
        d = beats / len(parts)
        for k, p in enumerate(parts):
            out.append((i, k * d, d, p))
    return out


class Piece:
    def __init__(self, name, bpm, title, beats=4, seed=1995):
        self.name = name
        self.song = Song(bpm=bpm, beats_per_bar=beats, title=title)
        self.bpm = bpm
        self.beats = beats
        self.rnd = random.Random(seed)

    def bar(self, i, beat=0):
        return self.song.bar(i, beat)

    def track(self, name, channel, program, **kw):
        return self.song.track(name, channel, program, **kw)

    def hum(self, v, d=5):
        return v + self.rnd.randint(-d, d)

    def marker(self, b, text):
        self.song.marker(self.bar(b), text)

    # ------------------------------------------------------------ mélodie
    def melody(self, tr, b0, bars, vel=90, octave=0, legato=0.95, accent=8):
        for i, notes in enumerate(bars):
            t = self.bar(b0 + i)
            for k, (p, d) in enumerate(notes):
                if p is not None:
                    v = vel + (accent if k == 0 else 0)
                    tr.note(t, n(p) + 12 * octave, d * legato, self.hum(v, 4))
                t += d

    # ------------------------------------------------------------ harmonie
    def pad(self, tr, b0, prog, vel=70, lo='A3', hi='A4', voices=3, legato=1.0):
        for i, s, d, c in segments(prog, self.beats):
            tr.chord(self.bar(b0 + i, s), tones(c, lo, hi)[:voices], d * legato, self.hum(vel, 3))

    def bass(self, tr, b0, prog, pattern, lo='D1', vel=95):
        """pattern : [(temps dans le segment, durée, décalage en demi-tons)]."""
        for i, s, d, c in segments(prog, self.beats):
            r = bass_note(c, lo)
            for t, dur, off in pattern:
                if t < d:
                    tr.note(self.bar(b0 + i, s + t), r + off, dur, self.hum(vel, 5))

    def arp(self, tr, b0, prog, shape, lo, hi, vel=70, step=0.25, dur=0.5, accents=(), accent=12):
        """Arpège : shape donne l'indice de la note de l'accord à chaque pas."""
        for i, s, d, c in segments(prog, self.beats):
            pool = tones(c, lo, hi)
            for k in range(int(round(d / step))):
                pos = int(round((s + k * step) / step))
                p = pool[shape[pos % len(shape)] % len(pool)]
                v = vel + (accent if pos % len(shape) in accents else 0)
                tr.note(self.bar(b0 + i, s + k * step), p, dur, self.hum(v, 5))

    def pulse(self, tr, b0, prog, rhythm, lo, intervals=(0,), vel=90):
        """Ostinato sur la basse de l'accord : rhythm [(temps, durée, vélocité)]."""
        for i, s, d, c in segments(prog, self.beats):
            r = bass_note(c, lo)
            for t, dur, v in rhythm:
                if t < d:
                    tr.chord(self.bar(b0 + i, s + t), [r + x for x in intervals], dur, self.hum(v, 4))

    def riff(self, tr, b0, prog, pattern, lo, step=0.25, dur=0.2, vel=90, accents=(), accent=14, intervals=(0,)):
        """Motif en pas réguliers sur la basse de chaque accord (riff de guitare,
        timbales en doubles croches...) : pattern donne le décalage en demi-tons
        à chaque pas (None = silence), compté depuis b0, donc un motif peut
        couvrir plusieurs mesures."""
        for i, s, d, c in segments(prog, self.beats):
            r = bass_note(c, lo)
            for k in range(int(round(d / step))):
                pos = int(round(((i * self.beats) + s) / step)) + k
                off = pattern[pos % len(pattern)]
                if off is None:
                    continue
                v = vel + (accent if pos % len(pattern) in accents else 0)
                tr.chord(self.bar(b0 + i, s + k * step), [r + off + x for x in intervals], dur, self.hum(v, 4))

    # ------------------------------------------------------------ rythme
    def drums(self, tr, b0, nbars, pattern, skip=()):
        """pattern : {nom de percussion: [(temps, vélocité)]}, répété à chaque mesure."""
        for i in range(nbars):
            if i in skip:
                continue
            for name, hits in pattern.items():
                key = DRUM[name] if isinstance(name, str) else name
                for t, v in hits:
                    tr.note(self.bar(b0 + i, t), key, 0.25, self.hum(v, 6))

    def fill(self, tr, t0, names, step=0.25, v0=80, v1=110):
        for k, name in enumerate(names):
            if name:
                v = v0 + (v1 - v0) * k / max(1, len(names) - 1)
                tr.note(t0 + k * step, DRUM[name] if isinstance(name, str) else name, step, self.hum(v, 3))

    def roll(self, tr, t0, beats, pitch, v0, v1, rate=6):
        k = int(beats * rate)
        for i in range(k):
            tr.note(t0 + i / rate, pitch, 1 / rate, v0 + (v1 - v0) * i / max(1, k - 1))

    def scatter(self, tr, b0, nbars, pitches, per_bar, vel=(40, 80), dur=0.5, grid=0.25):
        """Notes éparses au hasard (gouttes, étincelles, échos)."""
        slots = int(self.beats / grid)
        for i in range(nbars):
            for _ in range(per_bar):
                t = self.bar(b0 + i, self.rnd.randrange(slots) * grid)
                tr.note(t, self.rnd.choice(pitches), dur, self.rnd.randint(*vel))

    def echo(self, tr, t, pitch, vel, repeats=3, delay=0.75, decay=0.55, dur=0.25):
        """Note répétée en s'éteignant (écho d'un coup de pioche...)."""
        pitch = DRUM.get(pitch, pitch) if isinstance(pitch, str) else pitch
        for k in range(repeats + 1):
            tr.note(t + k * delay, pitch, dur, max(1, int(vel * decay ** k)))

    def swell(self, tr, b0, b1, v0, v1, ctl=11):
        tr.ramp(self.bar(b0), self.bar(b1), ctl, v0, v1)

    def save(self, nbars):
        path = self.name + '.mid'
        end = self.bar(nbars)
        self.song.save(path, end=end)
        print('%s : %d mesures, %d:%02d' % (path, nbars, *divmod(round(end * 60 / self.bpm), 60)))


__all__ = ['Piece', 'GM', 'DRUM', 'n', 'chord', 'tones', 'bass_note', 'segments']
