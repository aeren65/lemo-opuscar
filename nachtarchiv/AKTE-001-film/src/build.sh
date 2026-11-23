#!/bin/sh
# NACHTARCHIV · Akte 001 (v2): 74.6 s, 1080×1920, 30 fps. LIB = the Lemo-Opuscar library (ffmpeg 7+, Node, .venv with the voice tier).
#   VOICE=1 sh build.sh   records the voices again (edge-tts, online) and checks them with Whisper
set -e
LIB=${LIB:-$(cd "$(dirname "$0")/../../.." && pwd)}; HERE=$(cd "$(dirname "$0")" && pwd); OUT=${OUT:-"$HERE/../out"}; export LIB OUT
PY="$LIB/.venv/bin/python"; mkdir -p "$OUT"
if [ "${VOICE:-0}" = "1" ]; then "$PY" "$HERE/tts.py" --force; "$PY" "$HERE/asr.py"; fi
"$PY" "$HERE/audio.py"
"$PY" "$HERE/make_subs.py" "$OUT/NACHTARCHIV-AKTE-001-v2.srt"
cd "$LIB"
node core/render/video.mjs "$HERE" --fps 30 --workers "${WORKERS:-3}" --size 1080x1920 --out "$OUT/video.mp4"
rm -f "$OUT/NACHTARCHIV-AKTE-001-v2.mp4"; sh core/render/mux.sh "$OUT/video.mp4" "$OUT/mix.wav" "$OUT/NACHTARCHIV-AKTE-001-v2.mp4" 30 1
echo "done: $OUT/NACHTARCHIV-AKTE-001-v2.mp4"
