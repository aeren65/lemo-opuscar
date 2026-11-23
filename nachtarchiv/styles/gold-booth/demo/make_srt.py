"""Writes the .srt from the SUBS table in film.js (one source for burned-in and exported subtitles)."""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'film.js'), encoding='utf-8').read()
rows = re.findall(r"\[(\d+\.?\d*), (\d+\.?\d*), '((?:[^'\\]|\\.)*)'\]", src[src.index('const SUBS'):src.index('window.SUBS')])
def ts(x): ms = round(float(x) * 1000); return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
out = '\n'.join(f"{i}\n{ts(a)} --> {ts(b)}\n{t.replace(chr(92) + 'n', chr(10))}\n" for i, (a, b, t) in enumerate(rows, 1))
open(sys.argv[1], 'w', encoding='utf-8').write(out); print(len(rows), 'cues ->', sys.argv[1])
