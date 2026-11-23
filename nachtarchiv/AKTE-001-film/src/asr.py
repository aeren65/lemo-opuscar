"""Speech check: Whisper (small, German) on every clip; prints the transcript next to the intended text."""
import json, os, sys, re
from faster_whisper import WhisperModel
import soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(os.path.join(HERE, 'voice', 'lines.json')))
m = WhisperModel(os.environ.get('WHISPER_MODEL', 'small'), device='cpu', compute_type='int8')
only = sys.argv[1:]
def norm(s): return re.sub(r'[^a-zäöüßğışç0-9 ]', '', s.lower().replace('’', "'")).split()
for l in L:
    if not l.get('asr', l['text']) or (only and l['id'] not in only): continue
    f = os.path.join(HERE, 'voice', 'raw', l['id'] + '.wav')
    segs, _ = m.transcribe(f, language='de', beam_size=5)
    got = ' '.join(s.text.strip() for s in segs)
    w, g = norm(l.get('asr', l['text'])), norm(got); ok = sum(1 for x in w if x in g) / max(1, len(w))
    print(f"{l['id']:5s} {sf.info(f).duration:4.1f}s {ok:4.0%} | {got}")
