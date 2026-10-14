"""Contrôle d'un rendu : durée, crête, niveau par groupes de mesures, spectre.
    python3 analyse.py morceau.wav bpm [temps_par_mesure] [mesures_par_colonne]"""
import sys, wave
import numpy as np
w = wave.open(sys.argv[1]); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(np.float32) / 32768
bpm = float(sys.argv[2]); beats = int(sys.argv[3]) if len(sys.argv) > 3 else 4
group = int(sys.argv[4]) if len(sys.argv) > 4 else 4
spb = beats * 60 / bpm
rms = lambda s: 20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-9)
print(f'{sys.argv[1]}: {len(x)/sr:.1f} s  crête {np.abs(x).max():.2f}  rms {rms(x):.1f} dB  écrêtés {(np.abs(x) > 0.999).sum()}')
nb = int(round(len(x) / sr / spb))
print('  par %d mesures :' % group, ' '.join(f'{rms(x[int(b*spb*sr):int((b+group)*spb*sr)]):.0f}' for b in range(0, nb, group)))
m = x.mean(1); X = np.abs(np.fft.rfft(m)) ** 2; f = np.fft.rfftfreq(len(m), 1 / sr)
print('  spectre :', '  '.join(f'{lo}-{hi}:{100*X[(f>=lo)&(f<hi)].sum()/X.sum():.0f}%' for lo, hi in ((20, 120), (120, 500), (500, 2000), (2000, 6000), (6000, 20000))))
print('  L/R :', f'{rms(x[:,0]):.1f} / {rms(x[:,1]):.1f} dB')
