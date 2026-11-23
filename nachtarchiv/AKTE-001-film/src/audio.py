"""NACHTARCHIV Akte 001 (v2) · audio: voices (processed per situation), an aggressive horror score (drones, string clusters,
risers, braams, hits, pulse, heartbeat, clock), foley, sidechain ducking under the voices, mix -> $OUT/mix.wav,
and the per-frame voice waveforms that draw the gold lines -> waves.json. Times come from timeline.json."""
import json, os, sys
from fractions import Fraction
import numpy as np
import soundfile as sf
from scipy.signal import lfilter, fftconvolve, resample_poly
from scipy.linalg import solve_toeplitz
from scipy.ndimage import maximum_filter1d, uniform_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../../..'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, creak, thump, step, limit, add  # noqa: E402

OUT = os.environ.get('OUT') or os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
DUR, FPS = TL['dur'], 30
N = int(DUR * SR) + SR
T = np.arange(N) / SR
rng = np.random.default_rng(1974)
V = TL['voice']

def load(i):
    x, sr = sf.read(os.path.join(HERE, 'voice', 'raw', i + '.wav'), dtype='float32'); assert sr == SR; return x.astype(np.float64)
def fade(x, a=.008, b=.04):
    x = x.copy(); na, nb = int(a * SR), int(b * SR); x[:na] *= np.linspace(0, 1, na); x[-nb:] *= np.linspace(1, 0, nb); return x
def ir(d, decay, lo=200, hi=6000, seed=1):
    r = np.random.default_rng(seed); n = int(d * SR); y = r.standard_normal(n) * np.exp(-np.arange(n) / SR / decay)
    y = bp(y, lo, hi); y[:int(.004 * SR)] = 0; return y / np.sqrt(np.sum(y ** 2))
def verb(x, d, decay, wet, **k):
    w = fftconvolve(x, ir(d, decay, **k))[:len(x) + int(d * SR)]; dry = np.pad(x, (0, len(w) - len(x)))
    return dry * (1 - wet) + w * wet * 3
def whisper(x, order=20, fl=.025, hop=.0125, seed=5):
    r = np.random.default_rng(seed); n, h = int(fl * SR), int(hop * SR); win = np.hanning(n); y = np.zeros(len(x) + n)
    pre = lfilter([1, -.9], [1], np.pad(x, (0, n)))
    for s in range(0, len(x), h):
        f = pre[s:s + n] * win; e = np.sqrt(np.mean(f ** 2))
        if e < 1e-5: continue
        ac = np.correlate(f, f, 'full')[n - 1:n + order]; ac[0] *= 1.0001
        try: a = solve_toeplitz(ac[:order], -ac[1:order + 1])
        except Exception: continue
        o = lfilter([1], np.r_[1, a], r.standard_normal(n)); o *= e / max(np.sqrt(np.mean(o ** 2)), 1e-9); y[s:s + n] += o * win
    y = hp(lfilter([1], [1, -.9], y)[:len(x)], 350)
    return y * (np.sqrt(np.mean(x ** 2)) / max(np.sqrt(np.mean(y ** 2)), 1e-9))
def shift(x, f):
    q = Fraction(f).limit_denominator(80); return resample_poly(x, q.denominator, q.numerator)
def curve(keys):
    k = np.array(keys, float); return np.interp(T, k[:, 0], k[:, 1])

# ── voices ─────────────────────────────────────────────────────────────────────────────
voice = np.zeros((N, 2)); vbus = np.zeros(N)
def place(x, at, gain=1.0, pan=0.0, lines=1.0):
    add(voice, x, at, gain, pan); s = int(at * SR); e = min(N, s + len(x)); vbus[s:e] += x[:e - s] * gain * lines
room = dict(d=.4, decay=.08, wet=.12, lo=150, hi=7000, seed=2)
yard = dict(d=1.6, decay=.4, wet=.28, lo=250, hi=5000, seed=7)
L = {l['id']: l for l in json.load(open(os.path.join(HERE, 'voice', 'lines.json')))}
for k, at in V.items():
    if k == 'echo':   # her rule, remembered: the end of l01 as a whisper in a long space
        x = load('l01'); x = x[int(len(x) * .62):]
        y = verb(whisper(x) * .8 + lp(x, 1500) * .25, 2.4, .7, .6, lo=300, hi=6000, seed=4); place(fade(y, .01, .3), at, .55, -.3, lines=.6); continue
    x = load(k); who = L[k]['who']
    if who == 'OMA':     y = verb(hp(x, 80), **room); place(fade(y), at, 1.0, -.05)
    elif who == 'OMAW':  y = whisper(x) * .55 + lp(hp(x, 120), 3200) * .55; place(fade(verb(y, .3, .05, .06)), at, 1.15, -.1)
    elif who == 'OMAFAKE':   # her voice from the courtyard, a little too smooth, too wide
        y = verb(lp(hp(x, 160), 7000), **yard); place(fade(y, .01, .3), at, .95, .3)
    elif who == 'ANNE74':    # 1974, from the courtyard: old, band-limited, far
        y = bp(x, 300, 3800); y = verb(y, 2.0, .55, .55, lo=300, hi=4000, seed=8); place(fade(y, .01, .4), at, .7, .35)
    elif who == 'YUSUF':
        y = shift(x, 1.16)
        if k == 'l17': y = verb(lp(y, 3000), .5, .1, .15, lo=150, hi=3500, seed=3); place(fade(y), at, 1.3, .1)   # behind the door
        else: place(fade(verb(y, .3, .05, .08)), at, .85, .1)
    elif who in ('EMRE', 'EMREX'): place(fade(verb(hp(x, 80), **room)), at, 1.0 if who == 'EMRE' else 1.1, .05)
    elif who == 'MAMA':  y = verb(lp(hp(x, 160), 7000), **yard); place(fade(y, .01, .3), at, .95, .3)
    elif who == 'MAMAX':     # from the phone and from the courtyard at once, slowed, a little wrong
        ph = np.tanh(bp(x, 350, 3500) * 2) * .7
        out = verb(lp(x, 6000), **yard)[:len(x) + int(1.2 * SR)] * .6
        low = shift(x, .5)[:len(x)] * .1
        y = np.pad(ph, (0, len(out) - len(ph))) + out * .7 + np.pad(low, (0, len(out) - len(low)))
        place(fade(y, .01, .4), at, 1.0, .2)
    elif who == 'NARR':  place(fade(verb(hp(x, 70), .3, .04, .05)), at, 1.05, 0, lines=.8)

# ── score ──────────────────────────────────────────────────────────────────────────────
mus = np.zeros((N, 2)); fx = np.zeros((N, 2))
def stereo(buf, x, gl=1.0, gr=1.0, d=0):
    buf[:, 0] += x * gl; buf[:, 1] += np.roll(x, d) * gr
def saw(f): return 2 * ((T * f) % 1) - 1

# drone: sub D with a slow downward bend, a beating minor second above
bend = 1 - .03 * (T / DUR)
drone = np.sin(2 * np.pi * np.cumsum(36.71 * bend) / SR) * .9 + np.sin(2 * np.pi * 73.42 * T) * .35 + np.sin(2 * np.pi * 77.78 * T) * .22
dl = curve([[0, .5], [3.9, .35], [8.5, .4], [8.6, .2], [19.3, .45], [27, .35], [32.5, .5], [32.6, 0], [33.0, 0], [33.1, .35], [42.1, .55], [42.2, 0], [43, .3],
            [47.2, .5], [50, .45], [56, .6], [63.3, .65], [63.4, 0], [65.2, .3], [66.7, .8], [69, .35], [74.2, .3], [74.6, 0]])
stereo(mus, lp(drone, 260) * dl, 1, 1, 300)

# string cluster D–Eb–Ab with tremolo, rising with the danger
cl = sum(saw(f * (1 + d)) for f in (146.83, 155.56, 207.65) for d in (-.004, 0, .005)) / 9
trem = .65 + .35 * np.sin(2 * np.pi * curve([[0, 4], [40, 7], [56, 11], [74.6, 11]]) * T)
cl = lp(hp(cl, 120), 2600) * trem
sl = curve([[0, .05], [8.6, .03], [13, .12], [19.3, .25], [19.5, .05], [21.6, .2], [23.3, .3], [23.4, .05], [27, .04], [30, .14], [32.6, 0], [36, .05],
            [42.1, .35], [42.2, 0], [47.2, .1], [50, .2], [56.1, .45], [56.2, .1], [59.4, .3], [63.3, .45], [63.4, 0], [65.3, .2], [66.7, .55], [67.5, 0], [74.6, 0]])
stereo(mus, cl * sl, 1, .9, 700)

# high glassy cluster (violins sul ponticello) for the worst moments
hi_ = sum(np.sin(2 * np.pi * f * T + 3 * np.sin(2 * np.pi * 5.5 * T)) for f in (1864.7, 1975.5, 2093.0)) / 3
hl = curve([[0, 0], [19.2, 0], [19.5, .05], [20.4, 0], [47.2, 0], [47.4, .06], [49.8, 0], [56.1, 0], [56.25, .09], [58.5, 0], [66.7, 0], [66.85, .1], [69, 0], [74.6, 0]])
stereo(mus, hi_ * hl, .8, 1)

def riser(d):
    tt = t_(d); f = 200 * np.exp(np.log(40) * tt / d)
    sw = bp(noise(d), 300, 6000) * (tt / d) ** 2.2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * (tt / d) ** 3 * .4
    return norm(sw + tone)
def braam(d=2.8):
    tt = t_(d); x = sum(2 * ((tt * f * (1 + dt)) % 1) - 1 for f in (36.71, 73.42, 55.0, 77.78) for dt in (-.003, .003)) / 8
    x = np.tanh(x * 3.5); env = np.minimum(1, tt / .03) * np.exp(-tt / (d * .4))
    k = np.exp(-tt / .6); y = lp(x, 300) * (1 - k) + lp(x, 1800) * k
    return norm(y * env)
def hit(v=1.0, metal=True):
    d = 2.5; tt = t_(d)
    sub = np.sin(2 * np.pi * np.cumsum(55 * np.exp(-tt * 1.2)) / SR) * np.exp(-tt / .5)
    burst = lp(noise(d), 2500) * np.exp(-tt / .07)
    ring = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / .9) for f in (311, 466, 622, 933)) * .15 if metal else 0
    return norm(sub + burst * .8 + ring) * v
def whoosh_in(d=.9):
    tt = t_(d); return norm(bp(noise(d), 400, 7000) * (tt / d) ** 3)

for at, d in [(15.9, 3.5), (20.0, 3.4), (44.2, 3.1), (53.0, 3.2), (63.6, 3.2)]:
    add(mus, riser(d), at, .35, 0)
for at, g in [(23.4, .9), (47.3, 1.0), (66.8, 1.1)]:
    add(mus, braam(), at, g, 0)
for at, g, m in [(0.0, .8, True), (6.4, .45, False), (19.4, .75, True), (20.9, .5, False), (48.3, .8, True), (56.2, 1.0, True), (66.8, 1.0, True), (74.1, .7, True)]:
    add(mus, hit(g, m), at, 1.0, 0)
for at in (8.35, 26.75):
    add(fx, whoosh_in(), at, .5, 0)

# pulse ostinato: low plucked D / Eb, accelerating 50–59.4
def pl(f, d=.25):
    tt = t_(d); x = (2 * ((tt * f) % 1) - 1); return lp(x, 900) * np.exp(-tt / .07)
t = 50.0; i = 0
while t < 59.4:
    bpm = 125 + 45 * (t - 50) / 9.4
    add(mus, pl(73.42 if i % 4 != 3 else 77.78), t, .32 + .1 * (t - 50) / 9.4, -.1 if i % 2 else .1)
    t += 60 / bpm / 2; i += 1

# heartbeat 33.3–42.2 accelerating
def beat():
    return thump(1, 52) + np.pad(thump(.7, 48), (int(.18 * SR), 0))[:len(thump(1, 52))]
t = 33.4
while t < 42.1:
    bpm = 68 + 60 * (t - 33.4) / 8.7; add(fx, beat(), t, .5 + .3 * (t - 33.4) / 8.7, 0); t += 60 / bpm

# clock 27.2–32.6 (tick, tock)
for k, t in enumerate(np.arange(27.4, 32.6, .5)):
    d = .05; tt = t_(d); x = hp(noise(d), 2500) * np.exp(-tt / .006) + np.sin(2 * np.pi * (2400 if k % 2 else 1900) * tt) * np.exp(-tt / .01) * .6
    add(fx, norm(x), t, .22, .3)
# the phone: 03:17 tick, ring ring, swipe
add(fx, norm(hp(noise(.03), 3000) * env_exp(.03, .005)), 33.8, .3, 0)
def ring(d=1.1):
    tt = t_(d); x = (np.sin(2 * np.pi * 1318 * tt) + np.sin(2 * np.pi * 1568 * tt)) * (np.sin(2 * np.pi * 16 * tt) > 0) * np.minimum(1, tt / .01) * np.minimum(1, (d - tt) / .05)
    return x * .5 + bp(noise(d), 150, 250) * (np.sin(2 * np.pi * 30 * tt) > 0) * .4
add(fx, ring(), 42.4, .55, .1); add(fx, ring(1.0), 43.75, .55, .1)
add(fx, norm(bp(noise(.18), 1500, 6000) * np.hanning(int(.18 * SR))), 44.45, .25, 0)

# beds: flashback crackle (8.6–27), night wind, room tone
crack = (rng.random(N) > .9993) * rng.standard_normal(N) * 2 + bp(rng.standard_normal(N), 1000, 5000) * .03
cl_ = curve([[0, 0], [8.6, 0], [8.7, 1], [26.9, 1], [27.0, 0], [74.6, 0]])
stereo(fx, crack * cl_ * .25)
wind = lp(bp(brown(DUR + 1), 100, 1600), 800)[:N]
wl = curve([[0, .05], [8.6, .05], [8.7, .1], [27, .1], [27.1, .05], [33, .08], [42.2, .12], [42.25, .03], [50, .05], [63.4, .05], [63.45, 0], [65.3, .12], [67.5, .02], [74.6, .02]])
stereo(fx, wind * wl * (1 + .5 * np.sin(2 * np.pi * .23 * T)), 1, 1, 900)

# foley
add(fx, norm(bp(noise(.3), 800, 4000) * env_exp(.3, .04)), 6.4, .3, -.2)               # she grabs his wrist
add(fx, creak(.6), 20.4, .35, .2)                                                      # Yusuf sits up
for k in range(4): add(fx, step(.5), 21.8 + k * .38, .2, .3)                           # small bare feet on stone
add(fx, norm(lp(noise(.5), 1200) * env_exp(.5, .1)), 34.9, .25, -.2)                   # bedding
add(fx, norm(bp(noise(.4), 300, 1500) * np.hanning(int(.4 * SR))), 41.0, .35, 0)       # his hand over his mouth
add(fx, thump(1, 60), 50.0, .7, -.2)                                                   # door flung open
for k in range(6): add(fx, step(1), 50.15 + k * .17, .45, .1 * (-1) ** k)              # running
add(fx, norm(bp(noise(.35), 600, 3000) * env_exp(.35, .06)), 56.2, .6, 0)              # the grab
def knock():
    d = .3; tt = t_(d); return norm(np.sin(2 * np.pi * 90 * tt) * np.exp(-tt / .06) + bp(noise(d), 300, 2000) * np.exp(-tt / .02) * .6)
for at in (59.6, 59.95, 60.3): add(fx, knock(), at, .9, .15)
d = .08; tt = t_(d); add(fx, norm(hp(noise(d), 2000) * np.exp(-tt / .01) + np.sin(2 * np.pi * 900 * tt) * np.exp(-tt / .02)), 65.3, .5, 0)   # the lock
for k in range(6): add(fx, creak(1), 65.45 + k * .22, .45, .1)                          # the door, slowly
add(fx, norm(lp(noise(.8), 900) * env_exp(.8, .2)), 66.6, .4, 0)                       # cold air
# Oma's whisper "Yusuf...?" gets one breath before it
add(fx, norm(bp(noise(.5), 300, 2000) * np.hanning(int(.5 * SR))), 63.05, .15, 0)

# ── mix: duck the score under the voices ───────────────────────────────────────────────────
ve = np.abs(voice[:, 0]) + np.abs(voice[:, 1])
ve = uniform_filter1d(maximum_filter1d(ve, int(.02 * SR)), int(.05 * SR))
ve = ve / max(np.percentile(ve[ve > 1e-4], 95), 1e-9)
duck = 1 - .68 * np.clip(ve, 0, 1)
duck = uniform_filter1d(duck, int(.12 * SR))
gate = curve([[0, 1], [32.58, 1], [32.6, 0], [33.0, 0], [33.02, 1], [42.18, 1], [42.2, 0], [42.38, 0], [42.4, 1], [63.38, 1], [63.4, 0.15], [63.55, .15], [63.6, 1], [74.5, 1], [74.6, 0]])
mix = voice * 1.0 + (mus * 0.62 * duck[:, None] + fx * .8) * gate[:, None]
mix = mix[:int(DUR * SR)]
for c in range(2): mix[:, c] = limit(mix[:, c], .95)
mix = mix / max(np.abs(mix).max(), 1e-9) * .89
sf.write(os.path.join(OUT, 'mix.wav'), mix.astype(np.float32), SR, subtype='PCM_24')

# ── waves for the gold lines ───────────────────────────────────────────────────────────────
vb = vbus[:int(DUR * SR)]
ref = np.percentile(np.abs(vb[np.abs(vb) > 1e-4]), 99.7)
frames, rms = [], []; half = int(.03 * SR)
for f in range(int(DUR * FPS)):
    c = int(f / FPS * SR); w = vb[max(0, c - half):c + half]; w = np.pad(w, (0, 2 * half - len(w)))
    pts = w[::int(2 * half / 192)][:192] / ref
    frames.append([int(round(v)) for v in np.clip(pts * 100, -127, 127)])
    rms.append(round(float(np.sqrt(np.mean(w ** 2)) / ref), 4))
json.dump({'fps': FPS, 'n': 192, 'frames': frames, 'rms': rms}, open(os.path.join(HERE, 'waves.json'), 'w'), separators=(',', ':'))
print('mix', os.path.join(OUT, 'mix.wav'), '| frames', len(frames))
