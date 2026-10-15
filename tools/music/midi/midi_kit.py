"""Petit kit pour écrire des fichiers MIDI (format 1, General MIDI).

Pas de dépendance : les pistes sont des listes d'événements (temps en
noires, en nombres flottants) converties en ticks à l'écriture.

    song = Song(bpm=76)
    t = song.track('Choeur', channel=0, program=GM['ChoirAahs'], volume=90, pan=64)
    t.note(0, 'D4', 4, 80)          # début (noires), hauteur, durée, vélocité
    t.cc(0, 11, 40)                 # contrôleur à un instant donné
    song.save('menu.mid')
"""
import struct

PPQ = 480

# programmes General MIDI utiles (numéro 0-127)
GM = {
    'Piano': 0, 'Harpsichord': 6, 'Celesta': 8, 'Glockenspiel': 9, 'MusicBox': 10, 'TubularBells': 14,
    'ChurchOrgan': 19, 'ReedOrgan': 20,
    'NylonGuitar': 24, 'MutedGuitar': 28, 'OverdriveGuitar': 29, 'DistortionGuitar': 30,
    'AcousticBass': 32, 'FingerBass': 33, 'Fretless': 35, 'SynthBass1': 38,
    'Violin': 40, 'Viola': 41, 'Cello': 42, 'Contrabass': 43, 'TremoloStrings': 44,
    'Pizzicato': 45, 'Harp': 46, 'Timpani': 47, 'Strings1': 48, 'Strings2': 49,
    'SynthStrings1': 50, 'SynthStrings2': 51, 'ChoirAahs': 52, 'VoiceOohs': 53,
    'SynthVoice': 54, 'OrchestraHit': 55,
    'Trumpet': 56, 'Trombone': 57, 'Tuba': 58, 'FrenchHorn': 60, 'Brass': 61,
    'SynthBrass1': 62, 'Oboe': 68, 'EnglishHorn': 69, 'Bassoon': 70, 'Clarinet': 71,
    'Flute': 73, 'Recorder': 74, 'PanFlute': 75, 'Shakuhachi': 77,
    'WarmPad': 89, 'ChoirPad': 91, 'BowedPad': 92, 'HaloPad': 94, 'SweepPad': 95,
    'Atmosphere': 99, 'Goblins': 101, 'EchoDrops': 102,
    'Taiko': 116, 'ReverseCymbal': 119,
    'Vibraphone': 11, 'Marimba': 12, 'Xylophone': 13, 'Dulcimer': 15,
    'SynthBass2': 39, 'Piccolo': 72, 'Bottle': 76, 'Whistle': 78, 'Ocarina': 79,
    'Polysynth': 90, 'IceRain': 96, 'Soundtrack': 97, 'Crystal': 98, 'Brightness': 100,
    'SciFi': 103, 'Sitar': 104, 'Kalimba': 108, 'Bagpipe': 109, 'Fiddle': 110,
    'Shanai': 111, 'TinkleBell': 112, 'Agogo': 113, 'SteelDrums': 114, 'Woodblock': 115,
    'MelodicTom': 117, 'SynthDrum': 118, 'BreathNoise': 121, 'Seashore': 122, 'BirdTweet': 123,
}

# percussions General MIDI (canal 10, index 9)
DRUM = {
    'kick': 35, 'kick2': 36, 'stick': 37, 'snare': 38, 'clap': 39, 'snare2': 40,
    'tom_lo2': 41, 'hh_closed': 42, 'tom_lo': 43, 'hh_pedal': 44, 'tom_mid2': 45,
    'hh_open': 46, 'tom_mid': 47, 'tom_hi2': 48, 'crash': 49, 'tom_hi': 50,
    'ride': 51, 'china': 52, 'ride_bell': 53, 'tambourine': 54, 'splash': 55,
    'cowbell': 56, 'crash2': 57, 'vibraslap': 58, 'ride2': 59, 'cabasa': 69,
    'maracas': 70, 'gong': 52, 'bongo_hi': 60, 'bongo_lo': 61, 'conga_hi': 62,
    'conga_lo': 64, 'timbale_hi': 65, 'timbale_lo': 66, 'agogo_hi': 67, 'agogo_lo': 68,
    'whistle': 72, 'guiro': 73, 'claves': 75, 'woodblock_hi': 76, 'woodblock_lo': 77,
    'cuica': 79, 'triangle_mute': 80, 'triangle': 81, 'shaker': 82, 'jingle': 83,
    'chimes': 84, 'castanets': 85, 'surdo': 86, 'surdo_open': 87,
}

NOTE_NAMES = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def n(name):
    """'D4' -> 62, 'Bb3' -> 58, 'C#5' -> 73 ; un entier passe tel quel."""
    if isinstance(name, int):
        return name
    k = NOTE_NAMES[name[0]]
    i = 1
    while i < len(name) and name[i] in '#b':
        k += 1 if name[i] == '#' else -1
        i += 1
    return k + 12 * (int(name[i:]) + 1)


def _vlq(v):
    out = [v & 0x7F]
    v >>= 7
    while v:
        out.append(0x80 | (v & 0x7F))
        v >>= 7
    return bytes(reversed(out))


class Track:
    def __init__(self, name, channel, program=None):
        self.name = name
        self.channel = channel
        self.program = program
        self.events = []   # (temps en noires, ordre, octets)

    def _add(self, t, order, data):
        self.events.append((t, order, bytes(data)))

    def setup(self, program=None, volume=100, pan=64, reverb=40, chorus=0, expression=127):
        c = self.channel
        if program is not None:
            self._add(0, 0, [0xC0 | c, program])
        for ctl, val in ((7, volume), (10, pan), (91, reverb), (93, chorus), (11, expression)):
            self._add(0, 0, [0xB0 | c, ctl, val])
        return self

    def program_change(self, t, program):
        self._add(t, 1, [0xC0 | self.channel, program])

    def cc(self, t, ctl, val):
        self._add(t, 1, [0xB0 | self.channel, ctl, max(0, min(127, int(val)))])

    def bend(self, t, semitones, bend_range=2):
        """Pitch bend (portée par défaut du General MIDI : ±2 demi-tons)."""
        v = int(8192 + max(-1.0, min(1.0, semitones / bend_range)) * 8191)
        self._add(t, 1, [0xE0 | self.channel, v & 0x7F, v >> 7])

    def ramp(self, t0, t1, ctl, v0, v1, steps=16):
        """Variation progressive d'un contrôleur (crescendo par l'expression 11...)."""
        for i in range(steps + 1):
            f = i / steps
            self.cc(t0 + (t1 - t0) * f, ctl, v0 + (v1 - v0) * f)

    def note(self, t, pitch, dur, vel=90):
        p = n(pitch)
        vel = max(1, min(127, int(vel)))
        self._add(t, 2, [0x90 | self.channel, p, vel])
        # la fin de note passe avant un début au même instant (ordre 0 < 2)
        self._add(t + dur, 0, [0x80 | self.channel, p, 0])

    def chord(self, t, pitches, dur, vel=90):
        for p in pitches:
            self.note(t, p, dur, vel)

    def encode(self):
        out = bytearray()
        name = self.name.encode('latin-1')
        out += b'\x00\xff\x03' + _vlq(len(name)) + name
        last = 0
        for t, _, data in sorted(self.events, key=lambda e: (e[0], e[1])):
            tick = int(round(t * PPQ))
            out += _vlq(tick - last) + data
            last = tick
        out += b'\x00\xff\x2f\x00'
        return b'MTrk' + struct.pack('>I', len(out)) + bytes(out)


class Song:
    def __init__(self, bpm=120, beats_per_bar=4, title=''):
        self.bpm = bpm
        self.beats_per_bar = beats_per_bar
        self.title = title
        self.tracks = []
        self.tempo_changes = [(0, bpm)]
        self.markers = []

    def track(self, name, channel, program=None, **setup):
        t = Track(name, channel, program)
        t.setup(program=program, **setup)
        self.tracks.append(t)
        return t

    def tempo(self, t, bpm):
        self.tempo_changes.append((t, bpm))

    def marker(self, t, text):
        self.markers.append((t, text))

    def bar(self, i, beat=0):
        """Début de la mesure i (0 = première) en noires."""
        return i * self.beats_per_bar + beat

    def save(self, path, end=None):
        conductor = Track(self.title or 'conductor', 0)
        if self.title:
            pass
        conductor._add(0, 0, [0xFF, 0x58, 0x04, self.beats_per_bar, 2, 24, 8])
        for t, bpm in self.tempo_changes:
            us = int(round(60e6 / bpm))
            conductor._add(t, 0, [0xFF, 0x51, 0x03, (us >> 16) & 255, (us >> 8) & 255, us & 255])
        for t, text in self.markers:
            b = text.encode('latin-1')
            conductor._add(t, 1, bytes([0xFF, 0x06]) + _vlq(len(b)) + b)
        if end is not None:
            # meta "texte" vide pour fixer la longueur exacte (boucle sans trou)
            conductor._add(end, 9, [0xFF, 0x01, 0x00])
        chunks = [conductor] + self.tracks
        data = b'MThd' + struct.pack('>IHHH', 6, 1, len(chunks), PPQ)
        for tr in chunks:
            data += tr.encode()
        with open(path, 'wb') as f:
            f.write(data)
