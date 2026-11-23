"""Subtitles from the voices: Whisper word timings for each clip, split at punctuation into cues of at most two lines
(about 26 characters each), placed at the clip's start in timeline.json -> subs.json (read by film.js) and the .srt."""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, 'timeline.json'))); L = {l['id']: l for l in json.load(open(os.path.join(HERE, 'voice', 'lines.json')))}
def chunks(text):   # split the written line into cue texts at sentence ends, keep each ≤ ~52 chars
    parts = re.split(r'(?<=[.!?…“])\s+(?=[A-ZÄÖÜ„])', text.strip()); out = []
    for p in parts:
        if out and len(out[-1]) + len(p) < 44: out[-1] += ' ' + p
        else: out.append(p)
    res = []
    for p in out:     # long cues split once more at an ellipsis or a comma
        if len(p) > 52:
            k = p.find(' … ') if ' … ' in p else p.find(', ') + 1
            res += [p[:k].strip(), p[k:].strip()]
        else: res.append(p)
    # keep quotation marks balanced across cues
    for i in range(len(res)):
        if res[i].count('„') > res[i].count('“'): res[i] += '“'
        if res[i].count('“') > res[i].count('„'): res[i] = '„' + res[i]
    return res
def wrap(s, n=27):
    if len(s) <= n: return s
    words = s.split(); best = None
    for i in range(1, len(words)):
        a, b = ' '.join(words[:i]), ' '.join(words[i:]); sc = max(len(a), len(b))
        if best is None or sc < best[0]: best = (sc, a + '\n' + b)
    return best[1]
from faster_whisper import WhisperModel
m = WhisperModel('small', device='cpu', compute_type='int8')
cues = []
for k, at in sorted(TL['voice'].items(), key=lambda x: x[1]):
    if k == 'echo' or not L[k]['text']: continue
    text = L[k]['text']; parts = chunks(text)
    f = os.path.join(HERE, 'voice', 'raw', k + '.wav'); import soundfile as sf; dur = sf.info(f).duration
    shift = 1 / 1.16 if L[k]['who'] == 'YUSUF' else 1.0
    if len(parts) == 1: bounds = [(0, dur * shift)]
    else:
        segs, _ = m.transcribe(f, language='de', word_timestamps=True); words = [w for s in segs for w in s.words]
        n = [len(p.split()) for p in parts]; bounds = []; i = 0
        for j, c in enumerate(n):
            a = words[min(i, len(words) - 1)].start if j else 0; i += c
            b = words[min(i, len(words)) - 1].end if j < len(n) - 1 else dur
            bounds.append((a * shift, b * shift))
    for p, (a, b) in zip(parts, bounds):
        cues.append([round(float(at + a), 2), round(float(at + b + .2), 2), wrap(p)])
for i in range(len(cues) - 1):     # no overlaps, at least 1.0 s on screen where possible
    cues[i][1] = round(min(max(cues[i][1], cues[i][0] + 1.0), cues[i + 1][0] - .02), 2)
json.dump(cues, open(os.path.join(HERE, 'subs.json'), 'w'), ensure_ascii=False, indent=0)
def ts(x): ms = round(x * 1000); return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
if len(sys.argv) > 1:
    open(sys.argv[1], 'w', encoding='utf-8').write('\n'.join(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n" for i, (a, b, t) in enumerate(cues, 1)))
for c in cues: print(c)
