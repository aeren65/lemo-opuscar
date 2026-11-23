# Peeling Wall & Gold Broadcast Booth · 剥落墙与金色播音间 — Style Prompt

Made from a blank page; techniques from Gilded Illumination (gilded-illumination) in Lemo-Opuscar, with moves borrowed from Impasto Oil Painting (impasto) and Oscilloscope Math (oscilloscope-math).
Default size: 1080×1920 at 30 fps.

> Painterly 2D interiors where the wall carries the image. A padded gold broadcast booth for the voice that tells the story, a worn grey-green wall for the quiet rooms it tells about, and thin gold oscilloscope lines drawn by the real sound, crossing the wall. Small figures in a corner, a lot of wall, a slow camera.
> References (grammar only): cinematographer **Danny Cohen** and production designer **Eve Stewart**, *The King's Speech* (2010): the figure pushed into a corner of a big textured wall, short lenses, off-centre framing, a single warm source. Copy no set, shot, costume or prop from the film.

## 1. Essence, and what it is not

- **The wall carries the image.** Every shot is an interior; the wall takes most of the frame and holds the mood. Outdoor subjects move into a related room with a window: the courtyard is seen through the window, the street through a door.
- **Two walls, two states.**
  - **Primary, the booth:** a diamond-tufted padded wall in gold `#C9A050` over deep brown `#3A2610`, a brass button in every tuft with a small highlight, a warm glow behind the sound source (a hanging microphone).
  - **Secondary, the quiet rooms:** a cool grey-green wall worn through to blue, pink, ochre and plaster, with damp lines and fine cracks. Patches are irregular and cover under a third of the wall.
- **Sound is drawn on the wall.** 4–8 thin gold oscilloscope lines cross the wall, computed from the actual audio: spiky while a voice is tense or harsh, smooth while it is calm, flat in silence.
- **Figures are small and in a corner**; the wall gets the space.

Not a vector illustration (the brush texture is always there), not an impasto painting (no coarse dabbed strokes), not a neon or synthwave look (the waves are gold, never bright), not a map (peeling never reads as continents), not a symmetrical stage set.

## 2. Materials & rendering

- **Clean-edged shapes under a subtle brush texture.** Every area is a flat, value-planned shape with a clean edge; on top, a field of brush strokes about 1/120 of the frame width long (9 px at 1080 wide), each varying brightness ±5 %, laid along the surface (vertical on plaster, diagonal along the tufting). The texture never breaks a silhouette.
- **Faces and small objects stay crisp**: no texture over eyes, mouths, hands, phones, buttons.
- **Tufted wall**: a diamond grid; each diamond is a padded cushion lit from the source (lighter toward the light, a dark crease along the seams), a brass button at each crossing (dark ring, warm body, one highlight dot facing the light).
- **Worn wall**: a base grey-green coat; under it, in order, a blue coat, a pink coat, ochre, then raw plaster; patches are irregular noise shapes with a darker damp rim, a few thin cracks branching from them, vertical damp streaks below. Coverage under a third of the wall.
- **Light**: one warm source per room (the glowing mic, an oil lamp, a phone screen) plus cool moonlight through a window. Light is painted as soft value gradients on the wall and figures, never as lens flares.
- **Oscilloscope lines**: 1.6–2.4 px gold lines with a faint warm glow, slightly transparent, offset from each other in phase and height; they pass behind figures and props, never over faces.

## 3. Colour logic

- Booth: gold `#C9A050`, deep brown `#3A2610`, brass highlights `#F3DDA0`, shadow `#1E1408`.
- Worn rooms: grey-green `#7E8B80` (cool), worn layers blue `#5E7F9A`, pink `#C69A94`, ochre `#C49A52`, plaster `#D8CDB8`, damp `#4E5A52`.
- Night: the worn wall sinks toward blue-grey `#2E3A44`; warm light (lamp, mic) is the only saturated colour.
- Gold lines are always gold, never neon, never white; on the cool wall they are the one warm thing.

## 4. Type & subtitles

- **EB Garamond** (OFL): SemiBold 600 for narration, Medium Italic 500 for dialogue in quotation marks. Ivory `#F2E6C8` with a soft dark shadow, a thin gold rule `#C9A050` under the cue.
- Max two lines, about 26 characters per line in vertical; placed in the lower third, inside the TikTok safe area (top 150 px, bottom 400 px, right 140 px free), and away from faces.
- The subtitles are burned in by the page and exported as `.srt`.

## 5. Motion quality

- **Slow.** Camera pushes are slow and eased; figures move little and deliberately (a head turn, a hand on an arm).
- The wall never moves; only light on it changes (a lamp flicker, moonlight, a glow that swells with the voice).
- The lines move with the sound at the frame rate; everything else moves on eased keyframes.

## 6. Camera grammar

| Move | What it expresses | Can serve |
|---|---|---|
| Slow push-in on a locked frame | attention, dread, a thought arriving | a confession; a rule told; a realisation |
| Off-centre wide, figure in a corner | loneliness, the size of the wall | waiting; listening; a small person in a big night |
| One close-up of the sound source | the voice itself | the mic at the hook or at the end |
| Through the window | the outside, kept at a distance | a courtyard; a street; a visitor |
| Cut to black on a beat | a held breath | the reveal you don't show |

No centred symmetry. No whip pans, no handheld shake. Transitions: straight cuts, a cut to black, and the lines crossing from one wall to the next.

## 7. Sound palette

- The voice in front, dry, in a padded room (very short room tone, no big reverb).
- Low drone and soft low strings under it; a single plucked string as a motif; real silence as a tool.
- Sparse foley: wood creak, a lamp flame, wind at a window, a heartbeat. No busy sound design.
- The lines are drawn from the same sound the viewer hears.
- Mix: voice first, music 14–18 dB under it, −14 LUFS, true peak −1 dBTP.

## 8. Native moves

- **The voice crosses the wall.** The gold lines leave the booth and run across the next room's wall, carrying the voice into the story. *Fits:* a narrator handing over to a scene; a phone call; a radio heard in another room.
- **The wrong waveform.** The lines take the shape of a voice that should not be there (a laugh from an empty room, a second speaker). *Fits:* a ghost; a recording that answers back; an impostor.
- **The lines go flat.** All sound stops and the lines lie straight across the wall. *Fits:* a held breath; a death; the end of a broadcast.
- **The empty booth.** The source keeps sounding with nobody at it. *Fits:* an ending; a twist; a voice that outlives its speaker.

## 9. Pitfalls of the medium

- Centred symmetry kills the style: put the figure and the source off-centre, the wall's grid at a slight angle or cut off by the frame.
- Peeling patches that are too big or too round read as maps: keep them irregular, under a third, with fine crack lines.
- Coarse texture smears faces: mask the texture off faces and small props.
- Bright, thick or saturated waves look like a music visualiser: keep them thin, gold and partly transparent.
- Small figures in a corner can fall into the TikTok UI: in vertical, keep them out of the bottom 400 px and the right 140 px.
- A drawn lip-sync on small faces reads as puppetry: narrators speak with their back or side to camera, or off screen.

## 10. Engine

In [`demo/`](demo/): `engine.js` draws the style (brush texture `makeTex`/`texture`, `tuftedWall`, `wornWall`, `glow`/`shade` light, `head`, `scopeLines` from `waves.json`, `subtitle`); `film.js` is one film's rooms and shots (`figLayer` puts figures under the room light without dimming the lines); `audio.py` processes voices (LPC whisper), builds score and foley, and writes the per-frame waveforms the lines are drawn from. Then the technique base: `$LIB/styles/gilded-illumination/demo/lib.js` (utilities) and `$LIB/styles/oscilloscope-math/` (lines).

## 11. Variation space

You decide the story, the rooms, the cast, the opening and the ending.

- Structures: a narrator in the booth framing a told story (bookends); a story told entirely in one worn room, the booth seen only at the end; two booths in dialogue across a cut.
- Openings: the mic in close-up already speaking; an empty worn room with the lines arriving from off screen; a hand switching the "on air" lamp.
- Endings: the lines go flat; the empty booth; the worn wall peeling a little further.
