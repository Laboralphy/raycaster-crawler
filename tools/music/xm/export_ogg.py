#!/usr/bin/env python3
"""
Convertit les modules XM en OGG Vorbis pour le jeu : resources/snd/ogg/mus_<nom>.ogg

Chaque module est rendu une fois (openmpt123), puis amené à un niveau moyen
de TARGET_DB sans que les crêtes dépassent PEAK_DB, et encodé par ffmpeg.
Le jeu boucle le fichier entier (howler, loop: true) : un module dont la
position de reprise n'est pas 0 (boss, fuite sous l'eau) rejoue donc aussi
son introduction.

Usage : python3 export_ogg.py [module.xm ...]   (défaut : tous les .xm du dossier)
"""
import glob
import os
import subprocess
import sys
import tempfile
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, '..', '..', 'resources', 'snd', 'ogg')
RATE = 32000          # les échantillons sont à 33 kHz, l'essentiel du contenu sous 8 kHz
QUALITY = 3           # libvorbis -q:a (~80-110 kbit/s en stéréo à 32 kHz)
TARGET_DB = -20.0     # niveau moyen visé (RMS)
PEAK_DB = -1.0        # crête maximale


def render(xm, tmp):
    src = os.path.join(tmp, os.path.basename(xm))
    with open(xm, 'rb') as f, open(src, 'wb') as g:
        g.write(f.read())
    subprocess.run(['openmpt123', '--render', '--no-float', '--samplerate', str(RATE), '-q', src],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return src + '.wav'


def levels(wav):
    w = wave.open(wav)
    x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(float) / 32768
    rms = 20 * np.log10(np.sqrt(np.mean(x ** 2)))
    peak = 20 * np.log10(np.max(np.abs(x)))
    return rms, peak, w.getnframes() / w.getframerate()


def export(xm, tmp):
    name = 'mus_' + os.path.splitext(os.path.basename(xm))[0]
    out = os.path.normpath(os.path.join(OUT_DIR, name + '.ogg'))
    wav = render(xm, tmp)
    rms, peak, seconds = levels(wav)
    gain = min(TARGET_DB - rms, PEAK_DB - peak)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', wav,
                    '-af', f'volume={gain:.2f}dB', '-c:a', 'libvorbis', '-q:a', str(QUALITY),
                    '-metadata', f'title={name}', out], check=True)
    os.remove(wav)
    print(f'{name + ".ogg":34s} {seconds:5.0f} s  rms {rms:6.1f} -> {rms + gain:6.1f} dB  '
          f'crête {peak + gain:5.1f} dB  {os.path.getsize(out) // 1024:5d} Ko')


if __name__ == '__main__':
    files = sys.argv[1:] or sorted(glob.glob(os.path.join(HERE, '*.xm')))
    with tempfile.TemporaryDirectory() as tmp:
        for xm in files:
            export(xm, tmp)
