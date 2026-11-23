#!/bin/sh
# One command: NACHTARCHIV · Akte 001 „Die Stimme vor der Tür“ (Peeling Wall & Gold Broadcast Booth), 62 s, 1080×1920, 30 fps
#   sh build.sh                 voices (only if missing; needs network + the voice tier), audio + waves, subtitles, picture, master
#   VOICE=1 sh build.sh         record the voices again
#   OUT=/some/dir sh build.sh   where everything is written (default: ./out next to this folder's parent)
# Needs ffmpeg 7+ on PATH, Node 20+, and the library's .venv (sh $LIB/plugin/skills/lemo-opuscar/scripts/setup.sh deps voice).
set -e
LIB=${LIB:-/home/user/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
OUT=${OUT:-"$HERE/../out"}
export LIB OUT
PY="$LIB/.venv/bin/python"
mkdir -p "$OUT"
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the Lemo-Opuscar library folder"; exit 1; }
if [ "${VOICE:-0}" = "1" ] || [ ! -f "$HERE/voice/raw/v22.wav" ]; then "$PY" "$HERE/tts.py" ${VOICE:+--force}; fi
"$PY" "$HERE/audio.py"                                  # → $OUT/mix.wav and $HERE/waves.json (the lines are drawn from it)
"$PY" "$HERE/make_srt.py" "$OUT/NACHTARCHIV-AKTE-001.srt"
cd "$LIB"
node core/render/video.mjs "$HERE" --fps 30 --workers "${WORKERS:-3}" --size 1080x1920 --out "$OUT/video.mp4"
rm -f "$OUT/NACHTARCHIV-AKTE-001.mp4"
sh core/render/mux.sh "$OUT/video.mp4" "$OUT/mix.wav" "$OUT/NACHTARCHIV-AKTE-001.mp4" 30 1
node core/render/readcheck.mjs "$HERE" --size 1080x1920 > "$OUT/readcheck.txt" && echo "readcheck ok" || tail -5 "$OUT/readcheck.txt"
ffmpeg -v error -y -ss 46 -i "$OUT/NACHTARCHIV-AKTE-001.mp4" -frames:v 1 -q:v 3 "$OUT/poster.jpg"
echo "done: $OUT/NACHTARCHIV-AKTE-001.mp4"
