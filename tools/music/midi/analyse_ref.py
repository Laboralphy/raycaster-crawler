"""Profil d'un enregistrement de référence, pour composer dans son esprit
(forme, rythme, tonalité, couleur) sans le copier.

    python3 analyse_ref.py ../samples/morceau.ogg [fenêtre en s, 10 par défaut]

Par fenêtre : niveau (dB RMS), répartition de l'énergie par bande (grave,
bas médium, médium, aigu, brillance), densité d'attaques, tempo estimé,
tonalité estimée (profils de Krumhansl) et ses trois classes de hauteur les
plus fortes. Puis le tempo et la tonalité du morceau entier.
Lit tout ce que lit FFmpeg (la piste audio d'une vidéo aussi).
"""
import subprocess
import sys

import numpy as np

SR = 22050
HOP = 512
NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
MAJOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
BANDS = [(20, 120), (120, 500), (500, 2000), (2000, 6000), (6000, 11000)]


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vn', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def stft(x, n=4096):
    win = np.hanning(n)
    frames = [x[i:i + n] * win for i in range(0, len(x) - n, HOP)]
    return np.abs(np.fft.rfft(np.array(frames), axis=1))


def key_of(chroma):
    best = None
    for k in range(12):
        for prof, mode in ((MAJOR, 'majeur'), (MINOR, 'mineur')):
            r = np.corrcoef(chroma, np.roll(prof, k))[0, 1]
            if best is None or r > best[0]:
                best = (r, NAMES[k] + ' ' + mode)
    return best


def tempo_of(flux, lo=50, hi=180):
    """Tempo par autocorrélation de la courbe d'attaques (bpm, force)."""
    f = flux - flux.mean()
    if not f.any():
        return 0, 0
    ac = np.correlate(f, f, 'full')[len(f) - 1:]
    ac /= ac[0]
    fps = SR / HOP
    lags = np.arange(int(fps * 60 / hi), int(fps * 60 / lo))
    lag = lags[np.argmax(ac[lags])]
    return 60 * fps / lag, ac[lag]


def main():
    path = sys.argv[1]
    win_s = float(sys.argv[2]) if len(sys.argv) > 2 else 10
    x = load(path)
    S = stft(x)
    freqs = np.fft.rfftfreq(4096, 1 / SR)
    power = S ** 2
    flux = np.maximum(0, np.diff(np.log1p(S), axis=0)).sum(axis=1)
    flux = np.concatenate([[0], flux])
    # chroma : énergie par classe de hauteur, de 55 Hz à 2 kHz
    sel = (freqs >= 55) & (freqs <= 2000)
    pcs = (np.round(12 * np.log2(freqs[sel] / 440)) + 9).astype(int) % 12
    chroma = np.zeros((len(S), 12))
    for k in range(12):
        chroma[:, k] = power[:, sel][:, pcs == k].sum(axis=1)
    fpw = int(win_s * SR / HOP)
    total_db = 10 * np.log10((x ** 2).mean() + 1e-12)
    print('%s : %.1f s, %.1f dB RMS' % (path, len(x) / SR, total_db))
    print('  début   dB   grave b.méd  méd  aigu brill  attaques  tempo(force)   tonalité (corr)       notes fortes')
    for i in range(0, len(S), fpw):
        sl = slice(i, i + fpw)
        seg = x[i * HOP:(i + fpw) * HOP]
        db = 10 * np.log10((seg ** 2).mean() + 1e-12)
        p = power[sl].sum(axis=0)
        tot = p.sum() + 1e-12
        bands = [p[(freqs >= a) & (freqs < b)].sum() / tot * 100 for a, b in BANDS]
        f = flux[sl]
        onsets = (f > f.mean() + 1.5 * f.std()).sum() / (len(f) * HOP / SR)
        bpm, strength = tempo_of(f)
        c = chroma[sl].sum(axis=0)
        r, key = key_of(c)
        top = ' '.join(NAMES[k] for k in np.argsort(c)[::-1][:3])
        t = i * HOP / SR
        print('  %2d:%04.1f %5.1f  %4.0f%% %4.0f%% %4.0f%% %4.0f%% %4.0f%%  %5.1f/s  %5.0f (%.2f)   %-12s (%.2f)   %s'
              % (t // 60, t % 60, db, *bands, onsets, bpm, strength, key, r, top))
    bpm, strength = tempo_of(flux)
    r, key = key_of(chroma.sum(axis=0))
    print('  morceau entier : tempo %.0f bpm (%.2f), tonalité %s (%.2f)' % (bpm, strength, key, r))


if __name__ == '__main__':
    main()
