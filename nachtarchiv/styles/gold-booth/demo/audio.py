"""NACHTARCHIV Akte 001 · audio: voice processing, laugh, drone score, foley, mix -> out/mix.wav,
and the per-frame voice waveforms that draw the gold lines -> waves.json.
Run from anywhere: LIB must point at the Lemo-Opuscar library (for core/audio/sfx.py)."""
import json, os, sys
import numpy as np
import soundfile as sf
from scipy.signal import lfilter, fftconvolve, resample_poly
from scipy.linalg import solve_toeplitz

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../../..'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, creak, thump, heartbeat, rumble, limit, add  # noqa: E402

OUT = os.environ.get('OUT') or os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
DUR, FPS = 62.0, 30
rng = np.random.default_rng(317)
N = int(DUR * SR)

def load(i):
    x, sr = sf.read(os.path.join(HERE, 'voice', 'raw', i + '.wav'), dtype='float32')
    assert sr == SR, sr
    return x.astype(np.float64)

def fade(x, a=.01, b=.03):
    x = x.copy(); na, nb = int(a * SR), int(b * SR)
    if na: x[:na] *= np.linspace(0, 1, na)
    if nb: x[-nb:] *= np.linspace(1, 0, nb)
    return x

def ir(d, decay, lo=200, hi=6000, seed=1):
    r = np.random.default_rng(seed); n = int(d * SR)
    y = r.standard_normal(n) * np.exp(-np.arange(n) / SR / decay)
    y = bp(y, lo, hi); y[:int(.004 * SR)] *= 0
    return y / np.sqrt(np.sum(y ** 2))

def verb(x, d, decay, wet, **k):
    w = fftconvolve(x, ir(d, decay, **k))[:len(x) + int(d * SR)]
    dry = np.pad(x, (0, len(w) - len(x)))
    return dry * (1 - wet) + w * wet * 3

def whisper(x, order=20, fl=.025, hop=.0125, seed=5):
    """LPC whisper: keep the vocal tract of each frame, replace the voice by noise."""
    r = np.random.default_rng(seed); n, h = int(fl * SR), int(hop * SR)
    win = np.hanning(n); y = np.zeros(len(x) + n); xp = np.pad(x, (0, n))
    pre = lfilter([1, -.9], [1], xp)
    for s in range(0, len(x), h):
        f = pre[s:s + n] * win
        e = np.sqrt(np.mean(f ** 2))
        if e < 1e-5: continue
        ac = np.correlate(f, f, 'full')[n - 1:n + order]
        ac[0] *= 1.0001
        try: a = solve_toeplitz(ac[:order], -ac[1:order + 1])
        except Exception: continue
        exc = r.standard_normal(n)
        o = lfilter([1], np.r_[1, a], exc)
        o *= e / max(np.sqrt(np.mean(o ** 2)), 1e-9)
        y[s:s + n] += o * win
    y = lfilter([1], [1, -.9], y)[:len(x)]
    y = hp(y, 350)
    return y * (np.sqrt(np.mean(x ** 2)) / max(np.sqrt(np.mean(y ** 2)), 1e-9))

def pitch(x, f):   # resample: f > 1 raises pitch and shortens
    from fractions import Fraction
    q = Fraction(f).limit_denominator(60)
    return resample_poly(x, q.denominator, q.numerator)

# ── voice ──────────────────────────────────────────────────────────────────────────
L = {l['id']: l for l in json.load(open(os.path.join(HERE, 'voice', 'lines.json')))}
voice = np.zeros((N + SR, 2))
vbus = np.zeros(N + SR)          # mono voice bus for the lines (what the wall "hears")

def place(x, at, gain=1.0, pan=0.0, lines=1.0):
    add(voice, x, at, gain, pan)
    s = int(at * SR); e = min(len(vbus), s + len(x)); vbus[s:e] += x[:e - s] * gain * lines

booth = dict(d=.35, decay=.05, wet=.10, lo=150, hi=7000, seed=2)
for k, l in L.items():
    if l['t'] < 0: continue
    x = load(k); who = l['who']
    if who == 'ERZ':
        y = verb(hp(x, 70), **booth); place(fade(y), l['t'], .95, -.05)
    elif who == 'ERZS':     # last line: the end ("um drei Uhr siebzehn hören") drops into a whisper
        sp = int(len(x) * .52); w = whisper(x)
        m = np.clip((np.arange(len(x)) - sp) / (.25 * SR), 0, 1)
        y = x * (1 - m) + w * m * 1.15
        place(fade(verb(hp(y, 70), **booth)), l['t'], .95)
    elif who == 'ERZW':     # "Mama…?" involuntary, breathy
        y = whisper(x) * .9 + lp(x, 2500) * .25
        place(fade(verb(y, .3, .05, .06)), l['t'], .85, -.1)
    elif who == 'MUT':      # the mother's voice from the courtyard: too clean, far, wide
        y = lp(hp(x, 220), 6500)
        y = verb(y, 1.6, .45, .45, lo=250, hi=5000, seed=7)
        place(fade(y, .01, .2), l['t'], .46, .35)
    elif who == 'OMAW':     # grandmother's whisper, very close
        y = whisper(x) * 1.1 + lp(x, 1200) * .12
        place(fade(y), l['t'], 1.05, -.2)

# The laugh: grandmother's own voice (her held "Haaa"), cut into syllables, falling, from the courtyard
a = load('oma_a'); a = a[int(.06 * SR):int(.06 * SR) + int(.2 * SR)]
LAUGH_T0, LAUGH_T1 = 44.8, 48.6
lg = np.zeros(int((LAUGH_T1 - LAUGH_T0 + .3) * SR)); tt = 0.0; i = 0
while tt < LAUGH_T1 - LAUGH_T0 - .25:
    f = 1.08 - .022 * i + rng.uniform(-.02, .02)
    syl = pitch(a, f)[:int(.17 * SR)]
    breath = whisper(syl, seed=11 + i)
    e = np.minimum(1, t_(len(syl) / SR) / .012) * np.exp(-t_(len(syl) / SR) / .09)
    s = (syl * .75 + breath * .6) * e[:len(syl)]
    s *= .55 + .45 * min(1, i / 5)                          # grows
    add2 = int(tt * SR); lg[add2:add2 + len(s)] += s[:len(lg) - add2]
    tt += .24 + .012 * i + rng.uniform(-.02, .02); i += 1
low = pitch(lg, .5)[:len(lg)] * .14                         # an octave under, faint
lg = lg * .95 + np.pad(low, (0, len(lg) - len(low)))
lg = verb(lp(lg, 7000), 1.8, .5, .5, lo=200, hi=5000, seed=9)
lg = lg[:int((LAUGH_T1 - LAUGH_T0) * SR)]
lg[-int(.01 * SR):] *= np.linspace(1, 0, int(.01 * SR))    # cut dead at 48.6
place(lg, LAUGH_T0, .66, .3, lines=1.9)

# ── score and foley ────────────────────────────────────────────────────────────────
mus = np.zeros((N + SR, 2)); fx = np.zeros((N + SR, 2))
T = np.arange(N + SR) / SR

def curve(keys):
    k = np.array(keys, float); return np.interp(T, k[:, 0], k[:, 1])

# drone in D: sub, fifth, a slow beating pair; level curve follows the cue map
dr = (np.sin(2 * np.pi * 36.71 * T) * .9 + np.sin(2 * np.pi * 73.42 * T + .3) * .45 + np.sin(2 * np.pi * 110.0 * T) * .18
      + np.sin(2 * np.pi * 146.83 * T) * .08 * (1 + np.sin(2 * np.pi * .13 * T)))
dr *= 1 + .15 * np.sin(2 * np.pi * .07 * T)
dlev = curve([[0, .18], [3, .2], [3.05, .05], [3.5, .2], [13.4, .2], [14, .12], [14.3, .25], [17.2, .08], [18, .2], [22.6, .12], [25.6, .04],
              [29.2, .05], [29.4, .32], [36, .3], [38.8, .3], [38.95, 0], [41.5, 0], [42.3, .3], [46.8, .45], [48.58, .5], [48.6, 0],
              [49.2, .2], [55.6, .62], [55.7, .62], [55.72, 0], [56.4, 0], [56.45, .25], [61.6, .2], [62, 0]])
d2 = lp(dr, 300) * dlev
mus[:, 0] += d2; mus[:, 1] += d2

# low strings (detuned saws through a soft lowpass), swelling with the tension curve
def saw(f): return 2 * ((T * f) % 1) - 1
st = sum(saw(f * (1 + dt)) for f in (73.42, 87.31, 110.0) for dt in (-.003, .0, .004)) / 9
st = lp(lp(st, 900), 1400)
slev = curve([[0, .05], [7, .06], [14, .03], [22, .02], [25.6, 0], [29.3, 0], [33, .18], [38.85, .2], [38.95, 0], [42.3, .1], [48.5, .32], [48.6, 0],
              [49.2, .05], [55.7, .3], [55.72, 0], [62, 0]])
stl = st * slev
mus[:, 0] += stl * 1.0; mus[:, 1] += np.roll(stl, 240) * 1.0

def pluck(f, d=2.5, bright=.6, seed=0):     # Karplus-Strong with a little buzz: a single long-neck lute string
    r = np.random.default_rng(seed); n = int(SR / f); buf = r.uniform(-1, 1, n); out = np.zeros(int(d * SR))
    for i in range(len(out)):
        j = i % n; v = buf[j]; out[i] = v; buf[j] = .5 * (v + buf[(j + 1) % n]) * .996
    out = np.tanh(out * 1.8) * .6 + out * .4
    return lp(out, 2000 + 4000 * bright) * env_exp(d, .9)

for at, f, g in [(0.0, 146.83 * .992, .5), (0.45, 220 * .99, .25), (29.3, 146.83 * .99, .4), (56.45, 146.83 * .992, .5), (56.9, 155.56 * .99, .3)]:
    add(mus, pluck(f, seed=int(at * 10)), at, g, -.25)

# bass pulse 14.3–22 (night) and heartbeat 25.6–29
for k, at in enumerate(np.arange(14.3, 21.9, 1.1)):
    add(mus, thump(1, 48), at, .22 + .02 * k, 0)
hb_t = 25.75
for k in range(6):
    add(fx, heartbeat(1), hb_t, .55 + .05 * k, 0); hb_t += .78 - .06 * k

# beds: booth room tone, night wind
wind = lp(bp(brown(DUR + 1), 120, 1800), 900)
wl = curve([[0, .02], [7, .02], [7.1, .09], [13.4, .09], [14, .05], [29.3, .08], [35, .09], [38.9, .04], [42, .05], [48.6, .05], [48.62, 0],
            [49.2, .03], [55.7, .03], [55.72, 0], [62, 0]])
wind = wind * wl * (1 + .5 * np.sin(2 * np.pi * .21 * T)[:len(wind)])
fx[:, 0] += wind; fx[:, 1] += np.roll(wind, 900)
room = lp(noise(DUR + 1), 400) * .004
rl = curve([[0, 1], [6.9, 1], [7, 0], [56, 0], [56.1, 1], [62, 1]])
fx[:, 0] += room * rl; fx[:, 1] += room * rl

# foley
add(fx, creak(.5), 6.2, .25, .5)                         # booth chair
add(fx, hp(noise(.25), 2500) * env_exp(.25, .03), 15.1, .12, -.3)   # bedding rustle (wakes)
add(fx, bp(noise(.6), 600, 3000) * np.hanning(int(.6 * SR)), 14.6, .08, -.3)
add(fx, bp(noise(.05), 2000, 6000) * env_exp(.05, .008), 15.6, .15, .1)  # phone tap
add(fx, creak(.8), 28.6, .35, -.2)                        # bed creak, he gets up
gb = bp(noise(.55), 500, 2200) * np.hanning(int(.55 * SR))
add(fx, gb, 35.1, .18, -.1)                               # breath on the glass
add(fx, creak(.9), 36.3, .4, .4)                          # floor behind him
fl = bp(noise(1.2), 300, 1500) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 7 * t_(1.2))))
add(fx, fl * np.hanning(len(fl)), 40.8, .12, -.2)         # lamp flicker
add(fx, rumble(2.2, 1), 46.4, .55, 0)                     # under the laugh (cut at 48.6 by the mix gate)
add(fx, creak(.7), 54.0, .35, .5)                         # behind him, from the door
puff = lp(noise(.3), 900) * env_exp(.3, .05)
add(fx, puff, 55.45, .35, -.2)                            # flame out
imp = np.sin(2 * np.pi * 42 * t_(1.4) * (1 - .2 * t_(1.4))) * env_exp(1.4, .35) + lp(noise(1.4), 1500) * env_exp(1.4, .08) * .7
imp = norm(imp)
imp[int(.2 * SR):] *= np.linspace(1, 0, len(imp) - int(.2 * SR)) ** 6   # impact, tail cut short (silence from ~55.9)
add(fx, imp, 55.7, 1.0, 0)
hit = norm(np.sin(2 * np.pi * 38 * t_(2) * (1 - .15 * t_(2))) * env_exp(2, .5) + lp(noise(2), 600) * env_exp(2, .1) * .4)
add(fx, hit, 56.4, .7, 0)
mc = sum(a * np.sin(2 * np.pi * f * t_(.4)) * env_exp(.4, tau) for f, a, tau in [(1850, 1, .05), (3120, .6, .03), (640, .5, .08)])
add(fx, norm(mc + hp(noise(.4), 3000) * env_exp(.4, .004)), 57.8, .18, .3)    # metal click (a file drawer)
add(fx, whisper(load('v20'))[:int(1.2 * SR)] * .3, 59.0, .25, .6)             # unintelligible far whisper
br = bp(noise(1.0), 200, 1200) * np.hanning(int(1.0 * SR))
add(fx, br, 61.0, .12, 0)                                                     # low exhale

# ── mix ────────────────────────────────────────────────────────────────────────────
gate = curve([[0, 1], [48.58, 1], [48.6, 0], [49.15, 0], [49.2, 1], [55.9, 1], [55.95, 0], [56.35, 0], [56.4, 1], [61.98, 1], [62.0, 0]])
mix = (voice * 1.0 + mus * .55 + fx * .8) * gate[:, None]
mix = mix[:N]
for c in range(2): mix[:, c] = limit(mix[:, c], .95)
mix = mix / max(np.abs(mix).max(), 1e-9) * .89
sf.write(os.path.join(OUT, 'mix.wav'), mix.astype(np.float32), SR, subtype='PCM_24')

# ── waves for the picture: per frame, 192 points of the voice bus around the frame time ───
vb = vbus[:N] * gate[:N]
ref = np.percentile(np.abs(vb[np.abs(vb) > 1e-4]), 99.7)
frames, rms = [], []
half = int(.03 * SR)
for f in range(int(DUR * FPS)):
    c = int(f / FPS * SR)
    w = vb[max(0, c - half):c + half]
    w = np.pad(w, (0, 2 * half - len(w)))
    pts = w[::int(2 * half / 192)][:192] / ref
    frames.append([int(round(v)) for v in np.clip(pts * 100, -127, 127)])
    rms.append(round(float(np.sqrt(np.mean(w ** 2)) / ref), 4))
json.dump({'fps': FPS, 'n': 192, 'frames': frames, 'rms': rms}, open(os.path.join(HERE, 'waves.json'), 'w'), separators=(',', ':'))
print('mix:', os.path.join(OUT, 'mix.wav'), 'peak', float(np.abs(mix).max()), '| waves.json frames', len(frames))
