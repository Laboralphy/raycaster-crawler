#!/usr/bin/env python3
"""
Boîte à outils commune aux musiques XM (dungeon, mines, menu, boss...).

Reprend la synthèse et le format de make_forest.py, et ajoute :
- des timbres entretenus additifs (chœurs à formants, vielle, orgue, cordes,
  cor, chalemie, harmonica de verre), bouclés sur un nombre entier de périodes
  (pas de cassure au raccord), avec un effet d'ensemble qui ne s'annule
  jamais (voir additive) ;
- des sons percutés (cordes pincées, cloches, percussions, pioche, gouttes...)
  dont la hauteur de base peut être autre que do4 (note relative ajustée) ;
- une petite notation des mélodies : 'E5:8 D5:4 C5:4 | A4:16', où '-'
  relâche la note et '_' la laisse sonner, et un 3e champ facultatif donne
  le volume ('E5:4:50') ;
- des enveloppes et extinctions écrites en secondes (converties en ticks
  selon le tempo du morceau).
"""
import struct
from collections import namedtuple
from functools import lru_cache

import numpy as np

from make_forest import (F_C4, PERIOD, SR, crossfade_loop, delta16, env_points, fm, midi,
                         normalize, pack_pattern, t_axis, to_int16, xm_note, KEY_OFF)

# data : échantillons (float), loop : (début, longueur) ou None,
# base : note MIDI jouée à vitesse naturelle
Snd = namedtuple('Snd', 'data loop base')

OFF = 'off'
TAU = 2 * np.pi


# ---------------------------------------------------------------- filtres

def lp(x, alpha):
    """Passe-bas du premier ordre (alpha scalaire ou tableau), en listes Python
    (bien plus rapide qu'une boucle sur un tableau numpy)."""
    xs = np.asarray(x, float).tolist()
    out = [0.0] * len(xs)
    acc = 0.0
    if np.ndim(alpha) == 0:
        a = float(alpha)
        for i, v in enumerate(xs):
            acc += a * (v - acc)
            out[i] = acc
    else:
        al = np.broadcast_to(alpha, (len(xs),)).tolist()
        for i, v in enumerate(xs):
            acc += al[i] * (v - acc)
            out[i] = acc
    return np.array(out)


def hp(x, alpha):
    return x - lp(x, alpha)


def bp(x, a_low, a_high):
    """Passe-bande grossier : passe-haut (a_low) puis passe-bas (a_high)."""
    return lp(hp(x, a_low), a_high)


def noise(n, seed):
    return np.random.default_rng(seed).standard_normal(n)


def bake_echo(x, taps, alpha=None):
    """Écho intégré à l'échantillon : taps = [(retard s, gain)] ; chaque
    répétition est un peu plus étouffée que la précédente (alpha)."""
    n = len(x) + int(max(d for d, _ in taps) * SR)
    y = np.zeros(n)
    y[:len(x)] += x
    src = x
    for d, g in taps:
        if alpha:
            src = lp(src, alpha)
        i = int(d * SR)
        y[i:i + len(src)] += g * src
    return y


def env_exp(t, tau, attack=0.002):
    return np.exp(-t / tau) * np.minimum(1, t / attack)


def f_base(base):
    return F_C4 * 2 ** ((base - 60) / 12)


# ---------------------------------------------------------------- sons entretenus

def additive(spectrum, loop_s=3.0, attack_s=0.15, voices=1, octave=0, trem=(0, 1),
             breath=0.0, lpf=None, seed=0, max_f=7500, spread=0.7):
    """Son additif bouclé. Base : do4 transposé de -octave octaves (octave=1 :
    do3). spectrum(k, f, lfo) donne le gain de l'harmonique k (f en Hz) ; lfo
    est un sinus d'une période par boucle.
    Plusieurs voix (effet d'ensemble) : chacune a la même phase de départ mais
    sa phase oscille lentement (v cycles par boucle, amplitude spread radians
    sur la fondamentale). L'écart entre voices reste borné : elles chantent
    ensemble sans jamais s'annuler, contrairement à un désaccord fixe, dont les
    voix passent en opposition de phase une fois par boucle."""
    period = int(PERIOD * 2 ** octave)
    fb = SR / period
    loop_p = max(1, round(loop_s * fb))
    att_p = max(1, round(attack_s * fb))
    n_att, n_loop = att_p * period, loop_p * period
    n = n_att + n_loop
    i = np.arange(n)
    t = i / SR
    ph = np.clip((i - n_att) / n_loop, 0, 1)
    lfo = np.sin(TAU * ph)
    rng = np.random.default_rng(seed)
    wobbles = [np.zeros(n)] if voices == 1 else [
        spread * np.sin(TAU * (v + 1) * ph + TAU * v / voices) for v in range(voices)]
    x = np.zeros(n)
    for k in range(1, 80):
        f = k * fb
        if f > max_f:
            break
        g = spectrum(k, f, lfo)
        phi = rng.uniform(0, TAU)
        for w in wobbles:
            x += g * np.sin(TAU * k * fb * t + k * w + phi)
    depth, cycles = trem
    if depth:
        x *= 1 + depth * np.sin(TAU * cycles * ph)
    if breath:
        b = normalize(bp(noise(n, seed + 1), 0.06, 0.35))     # souffle, sans grave
        b = crossfade_loop(b, n_att, min(n_att, n_loop // 4))
        x = normalize(x) + breath * b
    if lpf:
        x = lp(x, lpf)
    return Snd(normalize(x), (n_att, n_loop), 60 - 12 * octave)


def fm_loop(layers=((1, 1.0),), idx_att=3.0, idx_sus=1.5, att_s=0.08, loop_s=1.0, octave=0,
            lfo_idx=0.1, voices=1, spread=0.3, lpf=None):
    """Son FM entretenu, à la manière des cartes son FM (OPL) : porteuse à f,
    modulateur à r·f (layers = [(r, gain)], r entier : périodique). L'indice de
    modulation part de idx_att (attaque brillante, « cuivrée ») et rejoint
    idx_sus à la fin de l'attaque ; dans la boucle il ondule (lfo_idx).
    Plusieurs voix : même effet d'ensemble que additive()."""
    period = int(PERIOD * 2 ** octave)
    fb = SR / period
    loop_p = max(1, round(loop_s * fb))
    att_p = max(1, round(att_s * fb))
    n_att, n_loop = att_p * period, loop_p * period
    n = n_att + n_loop
    i = np.arange(n)
    t = i / SR
    ph = np.clip((i - n_att) / n_loop, 0, 1)
    ramp = np.clip(1 - i / n_att, 0, 1) ** 2
    idx = idx_sus * (1 + lfo_idx * np.sin(TAU * ph)) + (idx_att - idx_sus) * ramp
    wobbles = [np.zeros(n)] if voices == 1 else [
        spread * np.sin(TAU * (v + 1) * ph + TAU * v / voices) for v in range(voices)]
    x = np.zeros(n)
    for w in wobbles:
        car = TAU * fb * t + w
        for r, g in layers:
            x += g * np.sin(car + idx * np.sin(r * car))
    if lpf:
        x = lp(x, lpf)
    return Snd(normalize(x), (n_att, n_loop), 60 - 12 * octave)


@lru_cache(None)
def fm_brass():
    """Cuivre FM : attaque éclatante qui se pose ; base do4."""
    return fm_loop(((1, 1.0),), 4.0, 1.6, 0.1, 1.0, 0, 0.1, 2, 0.3, lpf=0.45)


@lru_cache(None)
def fm_reed():
    """Anche FM (modulateur à 2f : harmoniques impaires, timbre de clarinette/hautbois) ; base do5."""
    return fm_loop(((2, 1.0),), 2.2, 1.3, 0.05, 1.0, -1, 0.08, 1, lpf=0.6)


@lru_cache(None)
def fm_lead():
    """Solo FM mordant (deux étages) ; base do5."""
    return fm_loop(((1, 1.0), (2, 0.5)), 3.0, 2.2, 0.06, 1.0, -1, 0.1, 2, 0.25, lpf=0.55)


@lru_cache(None)
def fm_trumpet():
    """Trompette solo très brillante (attaque éclatante, beaucoup d'harmoniques) ; base do5."""
    return fm_loop(((1, 1.0),), 5.0, 2.6, 0.06, 1.0, -1, 0.08, 2, 0.2, lpf=0.7)


@lru_cache(None)
def piano():
    """Piano : partiels légèrement inharmoniques (raideur de la corde), les aigus
    s'éteignent plus vite, deuxième corde un peu désaccordée, marteau ; base do4."""
    t = t_axis(int(3.0 * SR))
    f0 = F_C4
    x = np.zeros(len(t))
    for k in range(1, 13):
        f = k * f0 * np.sqrt(1 + 0.0004 * k * k)
        if f > SR / 2.2:
            break
        tau = 1.6 / (1 + 0.45 * k)
        a = k ** -1.1
        x += a * (np.sin(TAU * f * t) + 0.5 * np.sin(TAU * f * 1.0008 * t + k)) * np.exp(-t / tau)
    x = normalize(x) + 0.15 * normalize(lp(noise(len(t), 38), 0.4)) * np.exp(-t / 0.006)
    return Snd(normalize(x * np.minimum(1, t / 0.001)), None, 60)


def formants(fs, tilt=0.015, depth=0.04):
    def spec(k, f, lfo):
        g = tilt / k
        for j, (fc, bw, a) in enumerate(fs):
            c = fc * (1 + depth * lfo * (1 if j % 2 == 0 else -1))
            g = g + a * np.exp(-((f - c) / bw) ** 2)
        return g
    return spec


VOWELS = {
    'ah': [(750, 110, 1.0), (1150, 140, 0.55), (2700, 260, 0.12)],
    'oh': [(470, 90, 1.0), (820, 120, 0.5), (2600, 250, 0.06)],
    'oo': [(330, 80, 1.0), (760, 140, 0.3), (2500, 250, 0.03)],
}


@lru_cache(None)
def choir(vowel='ah', octave=0, distant=True, seed=11):
    # cinq voix, écart réduit : l'énergie est sur les formants (3e, 4e harmoniques...),
    # où l'écart de phase est multiplié d'autant
    return additive(formants(VOWELS[vowel]), 3.0, 0.15, 5, octave,
                    breath=0.05, lpf=0.16 if distant else 0.35, seed=seed, spread=0.3)


@lru_cache(None)
def gurdy():
    """Vielle à roue : corde frottée (dents de scie), nasale, roue irrégulière."""
    def spec(k, f, lfo):
        return 0.8 / k * (0.4 + np.exp(-((f - 1100) / 450) ** 2))
    return additive(spec, 2.0, 0.08, 2, 0, trem=(0.07, 8), breath=0.03, lpf=0.45, seed=21)


@lru_cache(None)
def organ():
    w = {1: 1.0, 2: 0.6, 3: 0.35, 4: 0.3, 6: 0.15, 8: 0.12}
    return additive(lambda k, f, lfo: w.get(k, 0.0), 2.0, 0.05, 2, 0, lpf=0.3, seed=31)


@lru_cache(None)
def strings(tremolo=False, muffled=False):
    def spec(k, f, lfo):
        return 0.9 / k * (0.25 + 0.8 * np.exp(-((f - 700 - 80 * lfo) / 900) ** 2))
    return additive(spec, 3.0, 0.1, 3, 0, trem=(0.5, 24) if tremolo else (0, 1),
                    breath=0.015, lpf=0.07 if muffled else 0.33, seed=41)


@lru_cache(None)
def horn():
    def spec(k, f, lfo):
        return k ** -1.2 * (0.3 + np.exp(-((f - 600) / 500) ** 2))
    return additive(spec, 2.0, 0.08, 2, 0, breath=0.02, lpf=0.4, seed=51)


@lru_cache(None)
def shawm():
    """Chalemie : anche double, très nasale ; base do5."""
    def spec(k, f, lfo):
        return k ** -0.7 * (0.2 + np.exp(-((f - 1500) / 500) ** 2)
                            + 0.5 * np.exp(-((f - 3000) / 600) ** 2))
    return additive(spec, 2.0, 0.05, 1, -1, breath=0.04, seed=61, max_f=9000)


@lru_cache(None)
def glass():
    """Harmonica de verre : presque pur, pulsation lente ; base do5."""
    w = {1: 1.0, 2: 0.15, 3: 0.05}
    return additive(lambda k, f, lfo: w.get(k, 0.0), 3.0, 0.1, 2, -1, trem=(0.15, 2), seed=71,
                    spread=0.4)


@lru_cache(None)
def pressure():
    """Bourdon sous-marin : trois voix très mouvantes ; base do3."""
    w = {1: 1.0, 2: 0.5, 3: 0.3, 4: 0.1}
    return additive(lambda k, f, lfo: w.get(k, 0.0), 4.0, 0.2, 3, 1, spread=1.2,
                    trem=(0.3, 1), lpf=0.1, seed=81)


# ---------------------------------------------------------------- sons percutés

@lru_cache(None)
def pluck(kind):
    t = t_axis(int(2.6 * SR))
    f0 = F_C4
    if kind == 'lute':
        idx = 3.0 * np.exp(-t / 0.04) + 0.1
        x = fm(f0, t, 1, idx) + 0.3 * np.sin(TAU * 2 * f0 * t) * np.exp(-t / 0.3)
        decay, nz = 0.55, 0.3
    elif kind == 'dulcimer':
        idx = 1.5 * np.exp(-t / 0.1) + 0.1
        x = (fm(f0, t, 1, idx) + 0.4 * fm(f0 * 1.0025, t, 1, idx)   # 2e corde, plus faible
             + 0.25 * np.sin(TAU * 3 * f0 * t) * np.exp(-t / 0.4)
             + 0.08 * np.sin(TAU * 5.02 * f0 * t) * np.exp(-t / 0.2))
        decay, nz = 1.2, 0.2
    elif kind == 'harpsichord':
        idx = 4.0 * np.exp(-t / 0.015) + 0.6
        x = fm(f0, t, 1, idx) + 0.4 * fm(2 * f0, t, 1, idx * 0.5)
        decay, nz = 0.8, 0.2
    elif kind == 'pizz':        # cordes pincées (pizzicato)
        idx = 1.0 * np.exp(-t / 0.03) + 0.2
        x = fm(f0, t, 1, idx) + 0.3 * np.sin(TAU * 2 * f0 * t) * np.exp(-t / 0.1)
        decay, nz = 0.22, 0.15
    elif kind == 'mallet':      # lithophone : pierre frappée
        x = (np.sin(TAU * f0 * t) + 0.5 * np.sin(TAU * 3.93 * f0 * t) * np.exp(-t / 0.12)
             + 0.2 * np.sin(TAU * 9.6 * f0 * t) * np.exp(-t / 0.04))
        decay, nz = 0.5, 0.4
    else:
        raise ValueError(kind)
    click = lp(noise(len(t), 3), 0.5) * np.exp(-t / 0.004)
    x = normalize(x) + nz * normalize(click)
    return Snd(normalize(x * env_exp(t, decay)), None, 60)


@lru_cache(None)
def celesta():
    """Base do6 : modulation au rapport 4, extinction moyenne."""
    t = t_axis(int(2.2 * SR))
    f0 = f_base(84)
    idx = 1.2 * np.exp(-t / 0.03) + 0.05
    x = fm(f0, t, 4, idx) + 0.3 * np.sin(TAU * f0 * t)
    return Snd(normalize(x * env_exp(t, 0.8, 0.001)), None, 84)


@lru_cache(None)
def crystal():
    """Lame de cristal (modes d'une barre libre), avec son écho ; base do6."""
    t = t_axis(int(2.4 * SR))
    f0 = f_base(84)
    x = np.zeros(len(t))
    for r, a, tau in ((1, 1, 1.6), (2.756, 0.5, 0.6), (5.404, 0.25, 0.25), (8.93, 0.1, 0.12)):
        if r * f0 < SR / 2.2:
            x += a * np.sin(TAU * r * f0 * t) * np.exp(-t / tau)
    x = normalize(x * np.minimum(1, t / 0.001))
    x = bake_echo(x, [(0.35, 0.35), (0.7, 0.18), (1.05, 0.09)], alpha=0.5)
    return Snd(normalize(x), None, 84)


@lru_cache(None)
def sparkle():
    t = t_axis(int(0.5 * SR))
    f0 = f_base(84)
    x = np.sin(TAU * f0 * t) + 0.3 * np.sin(TAU * 2 * f0 * t) * np.exp(-t / 0.05)
    return Snd(normalize(x * env_exp(t, 0.12, 0.001)), None, 84)


@lru_cache(None)
def big_bell():
    """Grosse cloche (partiels de cloche d'église) ; base do3."""
    t = t_axis(int(6.0 * SR))
    f0 = f_base(48)
    x = np.zeros(len(t))
    for r, a, tau in ((0.5, 0.5, 4.0), (1, 1, 3.0), (1.002, 0.5, 3.0), (1.19, 0.6, 2.2),
                      (1.5, 0.35, 1.8), (2, 0.5, 1.5), (2.52, 0.25, 1.0), (3.01, 0.2, 0.7),
                      (4.17, 0.12, 0.4)):
        x += a * np.sin(TAU * r * f0 * t) * np.exp(-t / tau)
    strike = lp(noise(len(t), 5), 0.3) * np.exp(-t / 0.01)
    x = normalize(x) + 0.3 * normalize(strike)
    return Snd(normalize(x * np.minimum(1, t / 0.001)), None, 48)


@lru_cache(None)
def fm_bass(muffled=False):
    """Basse FM courte et mordante (ou étouffée, comme sous l'eau) ; base do2."""
    t = t_axis(int(0.8 * SR))
    f0 = f_base(36)
    idx = 2.5 * np.exp(-t / 0.08) + 0.6
    x = fm(f0, t, 1, idx) + 0.6 * np.sin(TAU * f0 * t)
    x = x * env_exp(t, 0.3, 0.003)
    if muffled:
        x = lp(x, 0.06)
    return Snd(normalize(x), None, 36)


def _sweep(t, f_end, f_add, tau):
    f = f_end + f_add * np.exp(-t / tau)
    return np.sin(TAU * np.cumsum(f) / SR)


@lru_cache(None)
def drum(kind):
    if kind == 'kick':
        t = t_axis(int(0.5 * SR))
        x = _sweep(t, 45, 90, 0.03) * env_exp(t, 0.18, 0.001)
        x += 0.3 * hp(noise(len(t), 1), 0.3) * np.exp(-t / 0.004)
    elif kind == 'snare':
        t = t_axis(int(0.4 * SR))
        x = 0.6 * _sweep(t, 180, 60, 0.02) * env_exp(t, 0.07, 0.001)
        x += hp(noise(len(t), 2), 0.25) * env_exp(t, 0.12, 0.001)
    elif kind == 'hat':
        t = t_axis(int(0.15 * SR))
        x = hp(noise(len(t), 3), 0.7) * env_exp(t, 0.03, 0.0005)
    elif kind == 'crash':
        t = t_axis(int(2.6 * SR))
        x = hp(noise(len(t), 4), 0.55) * env_exp(t, 0.9, 0.001)
        for r in (3410, 5120, 6770):
            x += 0.08 * np.sin(TAU * r * t) * np.exp(-t / 0.6)
    elif kind == 'tom':        # accordable : base do4
        t = t_axis(int(0.8 * SR))
        x = _sweep(t, 110, 60, 0.05) * env_exp(t, 0.3, 0.001)
        x += 0.15 * lp(noise(len(t), 5), 0.3) * np.exp(-t / 0.01)
    elif kind == 'war':        # grand tambour de guerre, avec la salle
        t = t_axis(int(1.6 * SR))
        x = _sweep(t, 42, 50, 0.06) * env_exp(t, 0.6, 0.002)
        x += 0.5 * lp(noise(len(t), 6), 0.05) * np.exp(-t / 0.04)
        x = bake_echo(normalize(x), [(0.09, 0.25), (0.19, 0.12)], alpha=0.2)
    elif kind == 'frame':      # tambour sur cadre
        t = t_axis(int(0.8 * SR))
        x = _sweep(t, 140, 60, 0.02) * env_exp(t, 0.22, 0.001)
        x += 0.4 * bp(noise(len(t), 7), 0.05, 0.4) * np.exp(-t / 0.05)
    else:
        raise ValueError(kind)
    return Snd(normalize(x), None, 60)


@lru_cache(None)
def timpani():
    """Timbale accordée : partiels de membrane, léger glissé vers le bas à l'attaque ; base do3."""
    t = t_axis(int(2.5 * SR))
    f0 = f_base(48) * (1 + 0.03 * np.exp(-t / 0.05))
    ph = TAU * np.cumsum(f0) / SR
    x = np.zeros(len(t))
    for r, a, tau in ((1, 1.0, 1.0), (1.5, 0.5, 0.5), (1.98, 0.35, 0.45), (2.44, 0.2, 0.3)):
        x += a * np.sin(r * ph) * np.exp(-t / tau)
    x += 0.3 * lp(noise(len(t), 36), 0.3) * np.exp(-t / 0.01)
    return Snd(normalize(x * np.minimum(1, t / 0.002)), None, 48)


@lru_cache(None)
def tambourine():
    t = t_axis(int(0.3 * SR))
    x = sum(np.sin(TAU * f * t) for f in (5300, 6900, 8100, 9600)) * np.exp(-t / 0.12)
    x = 0.4 * x + hp(noise(len(t), 37), 0.6) * np.exp(-t / 0.06)
    return Snd(normalize(x * np.minimum(1, t / 0.001)), None, 60)


@lru_cache(None)
def rattle():
    """Ossements qui s'entrechoquent : petits claquements de bois."""
    rng = np.random.default_rng(13)
    n = int(0.8 * SR)
    x = np.zeros(n)
    t_click = t_axis(int(0.03 * SR))
    pos = 0.0
    for k in range(14):
        pos += rng.uniform(0.015, 0.06)
        a = int(pos * SR)
        if a + len(t_click) >= n:
            break
        f = rng.uniform(900, 1900)
        c = np.sin(TAU * f * t_click) * np.exp(-t_click / 0.006)
        x[a:a + len(c)] += (1 - k / 16) * c
    x += 0.15 * hp(noise(n, 14), 0.4) * (np.abs(x) > 0.05)
    return Snd(normalize(x), None, 60)


@lru_cache(None)
def pickaxe():
    """Coup de pioche sur la roche, lointain, avec l'écho de la galerie."""
    t = t_axis(int(0.6 * SR))
    f0 = 1900
    x = np.zeros(len(t))
    for r, a, tau in ((1, 1, 0.08), (2.76, 0.6, 0.04), (5.4, 0.3, 0.02), (1.47, 0.4, 0.05)):
        x += a * np.sin(TAU * r * f0 * t) * np.exp(-t / tau)
    x += 0.8 * hp(noise(len(t), 15), 0.4) * np.exp(-t / 0.006)
    x += 0.3 * lp(noise(len(t), 16), 0.08) * np.exp(-t / 0.08)      # éclats de roche
    x = lp(normalize(x * np.minimum(1, t / 0.0005)), 0.5)
    x = bake_echo(x, [(0.28, 0.45), (0.56, 0.25), (0.84, 0.13), (1.12, 0.06)], alpha=0.3)
    return Snd(normalize(x), None, 60)


@lru_cache(None)
def drip(tunnel=False):
    """Goutte d'eau ; tunnel=True : « ploc » plus grave, long écho de galerie voûtée."""
    t = t_axis(int(0.12 * SR))
    if tunnel:
        f = 420 + 600 * np.minimum(1, t / 0.03)
        taps = [(0.3, 0.5), (0.6, 0.32), (0.9, 0.2), (1.2, 0.12), (1.5, 0.07)]
    else:
        f = 700 + 800 * np.minimum(1, t / 0.025)
        taps = [(0.18, 0.4), (0.37, 0.2), (0.55, 0.1)]
    x = np.sin(TAU * np.cumsum(f) / SR) * env_exp(t, 0.04, 0.001)
    x = bake_echo(x, taps, alpha=0.35 if tunnel else 0.4)
    return Snd(normalize(x), None, 60)


def comb(x, f, g):
    """Filtre en peigne (résonance d'un tuyau accordé sur f Hz)."""
    d = int(round(SR / f))
    xs = np.asarray(x, float).tolist()
    y = [0.0] * len(xs)
    for i, v in enumerate(xs):
        y[i] = v + (g * y[i - d] if i >= d else 0.0)
    return np.array(y)


@lru_cache(None)
def hollow(f=98.0):
    """Souffle dans une conduite : bruit qui résonne dans le tuyau (peigne), bouclé."""
    n = int(6.0 * SR)
    k = np.arange(n) / n
    x = lp(comb(bp(noise(n, 28), 0.01, 0.3), f, 0.97), 0.2)
    x *= 0.7 + 0.3 * np.sin(TAU * 2 * k + 0.5) * np.sin(TAU * 3 * k)
    start = int(1.0 * SR)
    x = crossfade_loop(x, start, int(0.9 * SR))
    return Snd(normalize(x, 0.8), (start, n - start), 60)


@lru_cache(None)
def trickle():
    """Filet d'eau qui coule dans la rigole (souffle mouillé, irrégulier), bouclé."""
    n = int(6.0 * SR)
    nz = noise(n, 29)
    flow = 0.6 * normalize(bp(nz, 0.15, 0.6)) + 0.5 * normalize(bp(nz, 0.02, 0.1))
    gurgle = normalize(lp(noise(n, 30), 0.0008))
    x = flow * (0.55 + 0.45 * gurgle)
    start = int(1.0 * SR)
    x = crossfade_loop(x, start, int(0.9 * SR))
    return Snd(normalize(x, 0.8), (start, n - start), 60)


@lru_cache(None)
def pipe():
    """Conduite métallique qui cogne et vibre au loin, avec l'écho des égouts."""
    t = t_axis(int(2.5 * SR))
    f0 = 150
    x = np.zeros(len(t))
    for r, a, tau in ((1, 1, 1.5), (2.32, 0.6, 1.0), (3.86, 0.4, 0.7), (5.51, 0.25, 0.4),
                      (7.3, 0.15, 0.25)):
        x += a * np.sin(TAU * r * f0 * t) * np.exp(-t / tau)
    x += 0.5 * lp(noise(len(t), 31), 0.2) * np.exp(-t / 0.01)
    x = lp(normalize(x * np.minimum(1, t / 0.001)), 0.3)
    x = bake_echo(x, [(0.45, 0.4), (0.9, 0.22), (1.35, 0.12), (1.8, 0.06)], alpha=0.3)
    return Snd(normalize(x), None, 60)


@lru_cache(None)
def rat():
    """Couinements de rat : deux ou trois cris brefs et aigus."""
    rng = np.random.default_rng(32)
    n = int(0.5 * SR)
    x = np.zeros(n)
    pos = 0.0
    for k in range(3):
        d = rng.uniform(0.03, 0.05)
        t = t_axis(int(d * SR))
        u = t / t[-1]
        f = rng.uniform(3000, 3800) * (1 - 0.25 * u)
        ph = TAU * np.cumsum(f) / SR
        c = (np.sin(ph) + 0.3 * np.sin(2 * ph)) * np.sin(np.pi * u)
        a = int(pos * SR)
        x[a:a + len(c)] += (1 - 0.25 * k) * c
        pos += d + rng.uniform(0.06, 0.12)
    return Snd(normalize(lp(x, 0.7)), None, 60)


@lru_cache(None)
def wind(lo=0.02, seed=25):
    """Courant d'air : rafales de bruit filtré, sans le grondement grave de
    make_forest.make_wind (lo : coupure du passe-haut)."""
    n = int(6.0 * SR)
    k = np.arange(n) / n
    gust = 0.5 + 0.5 * np.sin(TAU * 3 * k + 0.7) * np.sin(TAU * 5 * k)
    x = hp(lp(noise(n, seed), 0.015 + 0.05 * gust), lo) * (0.6 + 0.4 * gust)
    start = int(1.0 * SR)
    x = crossfade_loop(x, start, int(0.8 * SR))
    return Snd(normalize(x, 0.8), (start, n - start), 60)


@lru_cache(None)
def rumble():
    """Grondement de la roche (bruit brun), bouclé."""
    n = int(6.0 * SR)
    x = lp(noise(n, 17), 0.004)
    x = hp(x, 0.0005)
    k = np.arange(n) / n
    x *= 0.7 + 0.3 * np.sin(TAU * 2 * k) * np.sin(TAU * 3 * k + 1)
    start = int(1.0 * SR)
    x = crossfade_loop(x, start, int(0.9 * SR))
    return Snd(normalize(x, 0.8), (start, n - start), 60)


@lru_cache(None)
def skitter():
    """Pattes d'araignée : grappe de petits cliquetis secs."""
    rng = np.random.default_rng(18)
    n = int(0.7 * SR)
    x = np.zeros(n)
    m = int(0.004 * SR)
    burst = bp(noise(m * 24, 19), 0.3, 0.8)
    pos = 0.02
    for k in range(24):
        pos += rng.uniform(0.008, 0.03)
        a = int(pos * SR)
        if a + m >= n:
            break
        c = burst[k * m:(k + 1) * m] * np.hanning(m)
        x[a:a + m] += rng.uniform(0.4, 1.0) * np.sin(np.pi * k / 24) * c
    return Snd(normalize(x), None, 60)


@lru_cache(None)
def imp():
    """Ricanements de diablotin : petits cris glissés et chevrotants."""
    rng = np.random.default_rng(20)
    n = int(0.9 * SR)
    x = np.zeros(n)
    pos = 0.0
    for k in range(4):
        d = rng.uniform(0.06, 0.11)
        t = t_axis(int(d * SR))
        u = t / t[-1]
        f = (1500 + 800 * np.sin(np.pi * u) - 200 * u) * (1 + 0.04 * np.sin(TAU * 25 * t))
        ph = TAU * np.cumsum(f) / SR
        c = np.sin(ph + 0.8 * np.sin(2 * ph)) * np.sin(np.pi * u) ** 1.5
        a = int(pos * SR)
        x[a:a + len(c)] += (1 - 0.15 * k) * c
        pos += d + rng.uniform(0.03, 0.09)
    return Snd(normalize(lp(x, 0.6)), None, 60)


@lru_cache(None)
def whisper():
    """Chuchotements indistincts : bouffées de souffle filtré."""
    n = int(1.8 * SR)
    x = np.zeros(n)
    rng = np.random.default_rng(22)
    nz = noise(n, 23)
    hi, lo = bp(nz, 0.5, 0.95), bp(nz, 0.08, 0.3)
    pos = 0.05
    for k in range(5):
        d = rng.uniform(0.12, 0.3)
        a, b = int(pos * SR), int((pos + d) * SR)
        w = np.sin(np.linspace(0, np.pi, b - a)) ** 2
        src = hi if k % 2 == 0 else lo
        x[a:b] += rng.uniform(0.5, 1.0) * src[a:b] * w
        pos += d + rng.uniform(0.04, 0.15)
    return Snd(normalize(x), None, 60)


@lru_cache(None)
def bubbles():
    rng = np.random.default_rng(24)
    n = int(1.4 * SR)
    x = np.zeros(n)
    pos = 0.02
    while pos < 1.25:
        d = rng.uniform(0.02, 0.06)
        t = t_axis(int(d * SR))
        f0 = rng.uniform(300, 900)
        f = f0 * (1 + 2.0 * t / d)
        c = np.sin(TAU * np.cumsum(f) / SR) * np.exp(-t / (d / 3))
        a = int(pos * SR)
        x[a:a + len(c)] += rng.uniform(0.3, 1.0) * c
        pos += rng.uniform(0.03, 0.18)
    return Snd(normalize(lp(x, 0.4)), None, 60)


@lru_cache(None)
def moan():
    """Long gémissement grave venu des profondeurs."""
    t = t_axis(int(5.0 * SR))
    u = t / t[-1]
    f = (70 + 28 * np.sin(np.pi * u) - 12 * u) * (1 + 0.01 * np.sin(TAU * 0.7 * t))
    ph = TAU * np.cumsum(f) / SR
    x = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph) + 0.2 * np.sin(5 * ph)
    env = np.minimum(1, t / 1.2) * np.minimum(1, (t[-1] - t) / 1.8)
    return Snd(normalize(lp(x * env, 0.05)), None, 60)


@lru_cache(None)
def tick():
    """Tic sourd d'horloge (le temps qui reste avant de manquer d'air)."""
    t = t_axis(int(0.1 * SR))
    x = (bp(noise(len(t), 26), 0.2, 0.7) * np.exp(-t / 0.003)
         + 0.5 * np.sin(TAU * 1800 * t) * np.exp(-t / 0.01)
         + 0.6 * np.sin(TAU * 420 * t) * np.exp(-t / 0.02))
    return Snd(normalize(lp(x * np.minimum(1, t / 0.0005), 0.35)), None, 60)


@lru_cache(None)
def growl():
    """Grondement de monstre marin : grave, rugueux (modulation à 28 Hz), qui enfle."""
    t = t_axis(int(3.5 * SR))
    u = t / t[-1]
    f = (55 + 18 * np.sin(np.pi * u) ** 2) * (1 + 0.015 * np.sin(TAU * 3.1 * t))
    ph = TAU * np.cumsum(f) / SR
    x = sum(a * np.sin(k * ph) for k, a in ((1, 1), (2, 0.7), (3, 0.5), (4, 0.35), (6, 0.2)))
    x *= 1 + 0.6 * np.sin(TAU * 28 * t)
    x += 0.3 * normalize(lp(noise(len(t), 27), 0.03))
    env = np.minimum(1, t / 1.0) ** 2 * np.minimum(1, (t[-1] - t) / 1.2)
    return Snd(normalize(lp(x * env, 0.06)), None, 60)


@lru_cache(None)
def plunge():
    """Plongeon (ou ruée du requin) : remous dont le timbre s'assombrit, coup sourd."""
    t = t_axis(int(1.8 * SR))
    u = t / t[-1]
    x = lp(noise(len(t), 33), 0.35 * (1 - u) ** 2 + 0.01) * np.minimum(1, t / 0.02) * (1 - u) ** 1.5
    x = normalize(x) + 0.8 * _sweep(t, 40, 40, 0.1) * env_exp(t, 0.4, 0.003)
    return Snd(normalize(x), None, 60)


@lru_cache(None)
def zap():
    """Piqûre de méduse : décharge électrique grésillante qui tombe dans le grave."""
    t = t_axis(int(0.4 * SR))
    f = 400 + 2600 * np.exp(-t / 0.06)
    ph = TAU * np.cumsum(f) / SR
    x = np.sin(ph + 4.0 * np.sin(2.7 * ph))
    rng = np.random.default_rng(34)
    gate = (rng.random(len(t)) < 0.35).astype(float)
    x = x * (0.6 + 0.4 * lp(gate, 0.3)) + 0.3 * hp(noise(len(t), 35), 0.5) * np.exp(-t / 0.03)
    return Snd(normalize(lp(x * env_exp(t, 0.12, 0.002), 0.5)), None, 60)


@lru_cache(None)
def sonar():
    t = t_axis(int(0.5 * SR))
    x = np.sin(TAU * 1100 * t) * env_exp(t, 0.12, 0.003)
    x = bake_echo(x, [(0.6, 0.4), (1.2, 0.2), (1.8, 0.1)], alpha=0.3)
    return Snd(normalize(x), None, 60)


# ---------------------------------------------------------------- module

def to_note(n):
    if n == OFF:
        return KEY_OFF
    if isinstance(n, str):
        return xm_note(midi(n))
    return xm_note(n)


def parse(seq):
    """'E5:8 D5:4 | -:4 _:8' -> [(nom, durée, volume ou None)]."""
    out = []
    last = 4
    for tok in seq.split():
        if tok == '|':
            continue
        parts = tok.split(':')
        length = int(parts[1]) if len(parts) > 1 and parts[1] else last
        vol = int(parts[2]) if len(parts) > 2 else None
        last = length
        out.append((parts[0], length, vol))
    return out


def transpose(seq, semitones):
    toks = []
    for name, length, vol in parse(seq):
        if name not in ('-', '_'):
            m = midi(name) + semitones
            name = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][m % 12] + str(m // 12 - 1)
        toks.append(f'{name}:{length}' + (f':{vol}' if vol is not None else ''))
    return ' '.join(toks)


class Pat:
    def __init__(self, song, rows):
        self.song = song
        self.rows = rows
        self.cells = [[None] * song.channels for _ in range(rows)]

    def put(self, row, ch, note=None, ins=None, vol=None, pan=None, fx=0, fxp=0):
        """vol : 0..64 ; pan : 0..255 (effet 8xx)."""
        if not 0 <= row < self.rows:
            return
        if pan is not None and not fx:
            fx, fxp = 0x08, pan
        n = to_note(note) if note is not None else None
        v = 0x10 + int(round(vol)) if vol is not None else None
        self.cells[row][ch] = (n, ins, v, fx, fxp)

    def line(self, ch, seq, ins, vol, row=0, pan=None, echo=(), partial=False):
        """Écrit une mélodie ; echo = [(canal, retard en lignes, volume, pan)]."""
        for name, length, v in parse(seq):
            if name == '-':
                self.put(row, ch, OFF)
                for e_ch, e_d, _, _ in echo:
                    self.put(row + e_d, e_ch, OFF)
            elif name != '_':
                vv = vol if v is None else v
                self.put(row, ch, name, ins, vv, pan)
                for e_ch, e_d, e_v, e_pan in echo:
                    self.put(row + e_d, e_ch, name, ins, e_v * vv / vol, e_pan)
            row += length
        if not partial:
            assert row == self.rows, f'mélodie de {row} lignes au lieu de {self.rows} : {seq}'
        return row

    def arp(self, row, chans, notes, ins, vol, step=2, pans=None, accent=None):
        for k, n in enumerate(notes):
            v = accent if (accent is not None and k == 0) else vol
            self.put(row + k * step, chans[k % len(chans)], n, ins, v,
                     pans[k % len(pans)] if pans else None)


class Song:
    def __init__(self, channels, speed=6, bpm=60, rows=64):
        assert channels % 2 == 0 and channels <= 32
        self.channels = channels
        self.speed = speed
        self.bpm = bpm
        self.rows = rows
        self.patterns = []
        self.instruments = []
        self._banks = {}

    @property
    def tick(self):
        return 2.5 / self.bpm

    def new(self, rows=None):
        p = Pat(self, rows or self.rows)
        self.patterns.append(p)
        return p

    def pad(self, pat, row, notes, ins, vol, banks, pans=(0x50, 0x80, 0xB0)):
        """Accord tenu ; deux jeux de canaux en alternance : l'ancien accord
        est relâché (extinction) pendant que le nouveau monte."""
        key = tuple(banks[0])
        b = self._banks.get(key, 0)
        on, off = banks[b], banks[1 - b]
        self._banks[key] = 1 - b
        for k, ch in enumerate(on):
            if k < len(notes):
                pat.put(row, ch, notes[k], ins, vol, pans[k % len(pans)])
            else:
                pat.put(row, ch, OFF)
        for ch in off:
            pat.put(row, ch, OFF)

    def ins(self, name, snd, volume=64, pan=128, env=None, sustain=None, fade=None,
            vib=(0, 0, 0, 0), finetune=0):
        """env = [(secondes, 0..64)] ; fade = durée de l'extinction après le
        relâchement, en secondes. Renvoie le numéro de l'instrument."""
        tick = self.tick
        pts = [(int(round(s / tick)), v) for s, v in env] if env else None
        fadeout = min(4095, int(65536 / max(1, fade / tick))) if fade else 0
        self.instruments.append(instrument(name, snd, volume, pan, pts, sustain, fadeout, vib, finetune))
        return len(self.instruments)

    def write(self, path, title, tracker, restart=0, gain=1.0):
        """gain : multiplie tous les volumes de la partition (plafonnés à 64)."""
        order = list(range(len(self.patterns)))
        head = bytearray()
        head += b'Extended Module: '
        head += title.encode('ascii')[:20].ljust(20, b'\0')
        head += b'\x1a'
        head += tracker.encode('ascii')[:20].ljust(20, b'\0')
        head += struct.pack('<H', 0x0104)
        head += struct.pack('<I', 276)
        head += struct.pack('<HHHHHHHH', len(order), restart, self.channels, len(self.patterns),
                            len(self.instruments), 1, self.speed, self.bpm)
        head += bytes(order).ljust(256, b'\0')
        out = bytearray(head)
        for pat in self.patterns:
            cells = pat.cells
            if gain != 1.0:
                cells = [[c if c is None or not c[2] else
                          (c[0], c[1], 0x10 + min(64, round((c[2] - 0x10) * gain)), c[3], c[4])
                          for c in row] for row in cells]
            data = pack_pattern(cells)
            out += struct.pack('<IBHH', 9, 0, pat.rows, len(data)) + data
        for ins in self.instruments:
            out += ins
        with open(path, 'wb') as f:
            f.write(out)
        rows = sum(p.rows for p in self.patterns)
        print(f'{path} : {len(out) // 1024} Ko, {len(self.patterns)} motifs, '
              f'{rows * self.speed * self.tick:.0f} s')


def instrument(name, snd, volume=64, pan=128, vol_env=None, sustain=None, fadeout=0,
               vib=(0, 0, 0, 0), finetune=0):
    """Comme make_forest.instrument, avec la note relative tirée de snd.base."""
    s = to_int16(snd.data)
    rel = 24 + (60 - snd.base)
    n_points = len(vol_env) if vol_env else 0
    vol_type = 0
    if vol_env:
        vol_type |= 1
        if sustain is not None:
            vol_type |= 2
    head = bytearray()
    head += name.encode('ascii')[:22].ljust(22, b'\0')
    head += bytes([0])
    head += struct.pack('<H', 1)
    head += struct.pack('<I', 40)
    head += bytes(96)
    head += env_points(vol_env or [])
    head += env_points([])
    head += bytes([n_points, 0, sustain or 0, 0, 0, 0, 0, 0, vol_type, 0])
    head += bytes(vib)
    head += struct.pack('<H', fadeout)
    head += bytes(22)
    head = struct.pack('<I', 4 + len(head)) + head
    assert len(head) == 263, len(head)
    loop_start, loop_len = snd.loop if snd.loop else (0, 0)
    smp = bytearray()
    smp += struct.pack('<III', len(s) * 2, loop_start * 2, loop_len * 2)
    smp += bytes([volume, finetune & 0xFF, (1 if snd.loop else 0) | 0x10, pan])
    smp += struct.pack('<b', rel)
    smp += bytes([0])
    smp += name.encode('ascii')[:22].ljust(22, b'\0')
    return bytes(head) + bytes(smp) + delta16(s)


def wrap(data_loop, base=60):
    """Adapte les sons de make_forest / make_forest_night au format Snd."""
    if isinstance(data_loop, tuple):
        x, a, b = data_loop
        return Snd(x, (a, b), base)
    return Snd(data_loop, None, base)


# enveloppes usuelles (secondes, 0..64)
ENV_PAD = [(0, 0), (1.2, 64), (2.5, 54)]          # sustain=2
ENV_VOICE = [(0, 0), (0.6, 64), (2.0, 52)]        # sustain=2
ENV_LEAD = [(0, 0), (0.05, 64), (0.8, 50)]        # sustain=2
ENV_STAC = [(0, 0), (0.01, 64), (0.12, 34), (0.35, 0)]
ENV_STAB = [(0, 0), (0.02, 64), (0.25, 40), (0.6, 0)]
