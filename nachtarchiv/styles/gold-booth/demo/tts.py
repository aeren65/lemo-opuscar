"""German voices via edge-tts (Microsoft, online), one clip per line -> voice/raw/<id>.wav (48 kHz mono) + dur.json.
Speakers: ERZ narrator (Conrad), MUT mother (Amala), OMA grandmother (Katja, lower, slower). Whispers are made in audio.py."""
import asyncio, json, os, subprocess, sys
import edge_tts
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'voice', 'raw'); os.makedirs(OUT, exist_ok=True)
VO = {'ERZ': ('de-DE-ConradNeural', '-10%', '-6Hz'), 'ERZW': ('de-DE-ConradNeural', '-15%', '-4Hz'),
      'ERZS': ('de-DE-ConradNeural', '-4%', '-8Hz'),
      'MUT': ('de-DE-AmalaNeural', '-12%', '-2Hz'),
      'OMA': ('de-DE-KatjaNeural', '-22%', '-14Hz'), 'OMAW': ('de-DE-KatjaNeural', '-8%', '-12Hz')}
PROXY = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy')
FF = os.environ.get('FFMPEG', 'ffmpeg')
async def one(l, force):
    wav = os.path.join(OUT, l['id'] + '.wav')
    if os.path.exists(wav) and not force: return
    v, rate, pitch = VO[l['who']]
    mp3 = wav[:-4] + '.mp3'
    await edge_tts.Communicate(l.get('say', l['text']), v, rate=rate, pitch=pitch, proxy=PROXY).save(mp3)
    # trim leading/trailing silence, 48 kHz mono
    subprocess.run([FF, '-v', 'error', '-y', '-i', mp3, '-af',
                    'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse',
                    '-ar', '48000', '-ac', '1', wav], check=True)
    os.remove(mp3)
async def main():
    lines = json.load(open(os.path.join(HERE, 'voice', 'lines.json')))
    force = '--force' in sys.argv
    for l in lines: await one(l, force)
    import soundfile as sf
    dur = {l['id']: round(sf.info(os.path.join(OUT, l['id'] + '.wav')).duration, 3) for l in lines}
    json.dump(dur, open(os.path.join(OUT, 'dur.json'), 'w'), indent=1)
    for l in lines:
        nxt = [m['t'] for m in lines if m['t'] > l['t']]
        room = (min(nxt) - l['t']) if nxt and l['t'] >= 0 else 0
        print(f"{l['id']} {l['who']:5} t={l['t']:5.1f} dur={dur[l['id']]:.2f} room={room:.2f} {'OVER' if room and dur[l['id']] > room - .15 else ''}")
asyncio.run(main())
