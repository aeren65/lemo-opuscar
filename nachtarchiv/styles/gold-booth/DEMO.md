# Peeling Wall & Gold Broadcast Booth — demo film

One example among many. Don't reuse its story, arc, shots, props or timings.

Demo: **NACHTARCHIV · Akte 001 „Die Stimme vor der Tür“** (62.0 s, 1080×1920, 30 fps, German) · `../../AKTE-001-film/NACHTARCHIV-AKTE-001.mp4 (in `~/lemo-my-styles`: test.mp4)` · source in [`demo/`](demo/)

A night broadcast frames a told story. The narrator in the gold booth gives the rule (never answer when your name is called at night); the gold lines cross into the grandmother's worn Anatolian house; at 3:17 a voice like his mother's calls from the courtyard; he answers "Mama…?"; the figure laughs with the grandmother's voice (the wrong waveform); the real grandmother whispers "You answered her. Now she knows you are here"; a shadow stands in the door; the lamp goes out. The ending returns to the booth, empty, while the voice keeps speaking. Fiction inspired by Anatolian folklore.

## Shots

| # | Time | Wall | Shot | Camera |
|---|---|---|---|---|
| A | 0–3.4 | gold | the microphone (the one close-up of the source), lines spike on "niemals" | push 2.30→2.45 |
| B | 3.4–7.0 | gold | wide, narrator (back three-quarter, headphones) in the lower right corner | push 1.00→1.07 |
| C | 7–14 | worn, dusk | the sitting room: Hatice on the divan with the lamp, Emre with his bag, window at blue hour; the lines enter from the left edge (the voice crosses the wall) | push 1.00→1.04, fade to black |
| D | 14–22 | worn, night | bedroom wide: he wakes, phone light; at 18.0 the mother's voice comes in through the window and the lines spread leftward | push 1.0→1.1 |
| E | 22–25.8 | worn | medium: on the bed edge with the phone, looks up | push 1.5→1.6 |
| F | 25.8–29 | worn (blurred) | the phone: 03:17, "Annem" 23:04; flat lines, heartbeat only | locked |
| G | 29–36 | worn | over his shoulder at the window: the figure in the courtyard; breath fogs the glass on "Mama…?" | push 1.75→1.95 |
| H | 36–42 | worn | the grandmother comes from the door with the lamp, grips his arm | locked |
| I | 42–49 | worn + window | through the window: the figure tilts her head, mouth opens; the lines turn spiky with the grandmother's laugh (on the glass and the wall); hard silence at 48.6 | push 3.3→3.8 |
| J | 49–55.7 | worn | the real grandmother at his side; a shadow fills the doorway; he starts to turn; the lamp goes out | push 1.30→1.42, cut to black |
| L | 56.4–62 | gold | the empty booth: chair, headphones on the desk, the mic still glowing; NACHTARCHIV · FOLGE UNS. DIE NÄCHSTE AKTE WARTET. · Neue Horrorstorys. Jede Nacht. | push 1.00→1.06, hard end |

## Palette, light, lines

- Booth: `tuftedWall()` (diamond cushions lit from the mic, brass buttons, pleats) + diagonal brush texture; a warm glow behind the mic that swells with the voice RMS.
- Rooms: `wornWall()` (bitmap, 17 % coverage; which old coat shows comes from a second noise field, so the patches never ring like contour maps; small flakes, a damp rim, a rising-damp tide line, drips, cracks) + vertical brush texture.
- Night: a multiply pass toward `#2E3A44`, a soft moon shaft from the window; figures on their own layer (`figLayer`) so the night is laid over them but not over the gold lines.
- Lines: `scopeLines()` reads `waves.json` (192 points of the voice bus per frame, computed in `audio.py`); smooth (moving average) during calm narration, raw and spiky for the mother, the whispers and the laugh; a thin dark separation under the gold core on the gold wall.

## Voice and subtitles

edge-tts: narrator de-DE-ConradNeural (−10 %, −6 Hz), mother de-DE-AmalaNeural (courtyard reverb, high-pass), grandmother de-DE-KatjaNeural (−8 %, −12 Hz) turned into a whisper by LPC noise excitation in `audio.py`. The laugh is built from the grandmother's own held "Haaa": syllables cut, pitched down step by step, breath added, an octave-under layer, a courtyard reverb, cut dead at 48.6. The speech-to-text check was not run (the Whisper model's download host was blocked); the lines are synthesised from the exact text.

Subtitles: `SUBS` in `film.js`, burned in at y 1450, centred at x 470 (TikTok right rail free), EB Garamond SemiBold / Medium Italic for dialogue, ivory with a gold rule; `make_srt.py` writes the `.srt` from the same table.

## Score and sound

Free drone in D (sub, fifth, beating pair) with low detuned strings following a tension curve; a Karplus-Strong long-neck lute pluck as motif (0.0, 29.3, 56.45); bass pulse 14.3–22; heartbeat 25.75–29; wind beds, creaks, glass breath, lamp flicker, rumble under the laugh, flame out, impact at 55.7 with its tail cut, total silences 48.6–49.2 and 55.9–56.4, a hit and a file-drawer click in the outro, abrupt end at 62.0. Master −14.1 LUFS, peak −1.3 dBFS.

## Build

`sh demo/build.sh` (set `LIB`; needs ffmpeg 7+). Files: `engine.js` (the style), `film.js` (this film), `audio.py`, `tts.py`, `make_srt.py`, `voice/` (lines and the recorded clips).
