"""Voices via edge-tts (online): natural multilingual voices speaking German, with Turkish words (Nene, Anne, Abla, oğlum). Clips -> voice/raw/<id>.wav (48 kHz mono), dur.json.
Processing (whisper, distance, child pitch, distortion) happens in audio.py."""
import asyncio, json, os, subprocess, sys
import edge_tts
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'voice', 'raw'); os.makedirs(OUT, exist_ok=True)
VO = {
 'OMA':     ('fr-FR-VivienneMultilingualNeural', '-8%', '-14Hz'),
 'OMAW':    ('fr-FR-VivienneMultilingualNeural', '-4%', '-12Hz'),
 'OMAFAKE': ('fr-FR-VivienneMultilingualNeural', '+8%', '-10Hz'),
 'ANNE74':  ('en-US-EmmaMultilingualNeural', '-14%', '-6Hz'),
 'YUSUF':   ('en-US-EmmaMultilingualNeural', '+0%', '+20Hz'),
 'EMRE':    ('en-US-BrianMultilingualNeural', '+4%', '+0Hz'),
 'EMREX':   ('en-US-BrianMultilingualNeural', '+14%', '+8Hz'),
 'MAMA':    ('en-US-AvaMultilingualNeural', '-10%', '-2Hz'),
 'MAMAX':   ('en-US-AvaMultilingualNeural', '-24%', '-16Hz'),
 'NARR':    ('en-US-AndrewMultilingualNeural', '+4%', '-4Hz'),
}
PROXY = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy')
FF = os.environ.get('FFMPEG', 'ffmpeg')
async def one(l, force):
    wav = os.path.join(OUT, l['id'] + '.wav')
    if os.path.exists(wav) and not force: return
    v, rate, pitch = VO[l['who']]; mp3 = wav[:-4] + '.mp3'
    for k in range(4):
        try: await edge_tts.Communicate(l.get('say', l['text']), v, rate=rate, pitch=pitch, proxy=PROXY).save(mp3); break
        except edge_tts.exceptions.NoAudioReceived:
            if k == 3: raise
            await asyncio.sleep(2 + k * 2)
    subprocess.run([FF, '-v', 'error', '-y', '-i', mp3, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse',
                    '-ar', '48000', '-ac', '1', wav], check=True)
    os.remove(mp3)
async def main():
    lines = json.load(open(os.path.join(HERE, 'voice', 'lines.json')))
    only = [a for a in sys.argv[1:] if not a.startswith('-')]
    for l in lines:
        if not only or l['id'] in only: await one(l, '--force' in sys.argv or bool(only))
    import soundfile as sf
    dur = {l['id']: round(sf.info(os.path.join(OUT, l['id'] + '.wav')).duration, 3) for l in lines}
    json.dump(dur, open(os.path.join(OUT, 'dur.json'), 'w'), indent=1)
    print('total voice s', round(sum(dur.values()), 1))
asyncio.run(main())
