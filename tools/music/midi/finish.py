"""Finit un rendu pour une lecture en boucle :
- coupe le WAV à la longueur exacte du MIDI et replie la queue (réverbération,
  notes qui s'éteignent) sur le début : la boucle s'enchaîne sans trou ;
- le met au niveau RMS visé (dB), crête limitée à -1 dB.
    python3 finish.py morceau.mid morceau.wav -20"""
import struct, sys, wave
import numpy as np


def midi_seconds(path):
    d = open(path, 'rb').read()
    div = struct.unpack('>H', d[12:14])[0]
    i, events = 14, []
    while i < len(d):
        size = struct.unpack('>I', d[i + 4:i + 8])[0]
        j, end, tick, rs = i + 8, i + 8 + size, 0, 0
        while j < end:
            v = 0
            while True:
                b = d[j]; j += 1; v = (v << 7) | (b & 0x7F)
                if b < 0x80:
                    break
            tick += v
            st = d[j]
            if st == 0xFF:
                ty = d[j + 1]; j += 2
                ln = 0
                while True:
                    b = d[j]; j += 1; ln = (ln << 7) | (b & 0x7F)
                    if b < 0x80:
                        break
                if ty == 0x51:
                    events.append((tick, int.from_bytes(d[j:j + 3], 'big')))
                elif ty != 0x2F:
                    events.append((tick, None))
                j += ln
            else:
                if st & 0x80:
                    rs = st; j += 1
                j += 1 if rs & 0xF0 in (0xC0, 0xD0) else 2
                events.append((tick, None))
        i = end
    events.sort(key=lambda e: e[0])
    us, last, t = 500000, 0, 0.0
    for tick, tempo in events:
        t += (tick - last) * us / 1e6 / div
        last = tick
        if tempo:
            us = tempo
    return t


mid, path, target = sys.argv[1], sys.argv[2], float(sys.argv[3])
w = wave.open(path); p = w.getparams()
x = np.frombuffer(w.readframes(p.nframes), '<i2').reshape(-1, 2).astype(np.float32) / 32768
L = int(round(midi_seconds(mid) * p.framerate))
if len(x) > L:
    tail = x[L:]
    y = x[:L].copy()
    y[:len(tail)] += tail[:L]
else:
    y = np.concatenate([x, np.zeros((L - len(x), 2), np.float32)])
gain = min(10 ** (target / 20) / np.sqrt((y ** 2).mean()), 0.89 / np.abs(y).max())
out = (np.clip(y * gain, -1, 1) * 32767).astype('<i2')
with wave.open(path, 'wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(p.framerate)
    o.writeframes(out.tobytes())
print(f'{L / p.framerate:.2f} s (queue repliée : {max(0, len(x) - L) / p.framerate:.2f} s), gain {20 * np.log10(gain):+.1f} dB')
