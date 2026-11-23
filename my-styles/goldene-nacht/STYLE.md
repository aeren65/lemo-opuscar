# Golden Night Explainer · Goldene Nacht · 金夜讲解 — Style Prompt

Based on Stick-figure Explainer (stick-explainer) from Lemo-Opuscar; the gilded verse lettering borrows from Gilded Illumination (gilded-illumination).
Default size: 1080×1920 (vertical, 30 fps delivery).

> Night, gold and one thin line. Calm stick figures drawn in glowing cream lines act out a story on a black ground; between the scenes a golden pen writes the Arabic text of a verse or hadith word by word, its German meaning grows line by line beneath it, and every statement carries its source in small type. The tone is quiet, serious and warm, like a lamp in a dark room.
> References (grammar only): faith explainers on short-video platforms that pair recitation with minimalist line animation; illuminated manuscripts (gold on dark, a pen that writes); night-time documentary title design. Copy no channel's name, watermark, handle, logo, layout or end card, and never name one in the film.

## 1. Essence, and what it is not

- **Darkness is the page.** Near-black ground with a faint vignette, slow drifting dust motes. Light only where meaning is: a lamp, the sun, a verse, the Prophet's light.
- **The people are the story.** Stick figures with round filled heads and single curved limbs, one even weight, no faces, no hands, no clothing (a scarf or a sword is a prop, not a costume). They act out scenes plainly: walking, falling, kneeling, raising a sword, giving an envelope.
- **The word is written, not typed.** Arabic text (a verse, a hadith phrase) appears in gold, written stroke by stroke by a small golden quill pen that travels along the line. The reference label sits above it, the translation grows beneath it.
- **Every claim has a source on screen.** A small grey source line (sura:verse, hadith collection and number, reciter) sits above the subtitles whenever content from a source is shown. "Sinngemäß" (by meaning) is labelled as such; invented illustrative scenes are labelled as such.
- **The Prophet ﷺ and the prophets are never drawn.** They are a light: a small eight-pointed star in a glowing ring, labelled DER PROPHET ﷺ. Angels and Allah are never depicted in any form; their acts are shown only by their effect (light, a sky folding, the earth held).
- **One warm accent with one meaning per film.** Gold is the voice of revelation and truth. A second, deliberate meaning colour is allowed at most once per film (glowing red-orange for violence, falsehood or a text torn out of context; a cool blue for night, earth or rain).

Not Stick-figure Explainer (no paper, no holding-hands chains as the signature, no geometric sans titles), not a lyric video (the subtitles are not the image), not Gilded Illumination (no ornament borders, no manuscript page as the frame), not a slideshow (one idea per screen, but the camera moves and scenes are acted).

## 2. Materials & rendering

- **Ground**: #050506 to #0A0908 black with a radial vignette; a warm bloom (gold, ≈ 15–25 % opacity) behind the active subject. A field of sparse dust/star points that drift slowly and twinkle subtly (seeded, deterministic).
- **Figures**: Canvas 2D strokes with round caps, the stick-explainer skeleton (curved limbs, joint as control point). Line colour cream #EDE6D3 with a soft outer glow (shadowBlur ≈ 6–10 px at 1080 width). Head: a filled disc in the line colour. Secondary/hostile figures in grey #8A877F; a whole crowd at reduced opacity so it reads as texture. Weight ≈ 3.5–4.5 px at a 300 px figure.
- **Line-art sets**: thin (1.5–2 px) single-weight outlines in gold or warm grey: mountains, the Kaaba and Mecca skyline, mosque arches, a hanging lantern with a cone of light, a sun with rays, a moon, a gate with lit doorways, a camel, a trough, a donation box. No fills except a dim tint inside a lit object.
- **Gold text and objects**: gradient gold (#F3D58C → #C99A45) with bloom; Arabic verse in gold with a slight inner highlight.
- **Close-up line portraits**: a face in profile or frontal eyes drawn with a single gold line and a warm glow (a tear in white). Used for emotional beats, never for a prophet or companion named in the story.
- **Paper and objects of evidence**: a mushaf page as a thin gold frame with dim Arabic lines; a single line can tear out as a jagged paper strip that glows red-orange (the out-of-context quote).
- **Rosary / counter scenes**: beads as small shaded spheres (brown wood, turning gold when counted) on a closed curve; a big gold number counting up in the centre.
- **Post**: bloom, vignette, very fine static grain. No chromatic aberration, no film damage.

## 3. Colour logic

- Black is the ground; brightness is meaning.
- **Gold** (#E0C070, light #F3D58C, deep #B8893C): verses, key words in titles and subtitles, the Prophet's light, sources' dot, call-to-action hand.
- **Cream** (#EDE6D3): figures, primary titles, active subtitle words.
- **Greys** (#9A968C, #6E6B64, #3A3833): secondary words, hostile figures, crowds, set outlines, source lines.
- **Red-orange** (#E2573A with glow #FF7A45): only for violence, oppression or distortion; at most one such thing per frame.
- **Night blue** (#0E1A33 → #1E3566 gradient sky), **earth brown** (#2A2016), **green** (#5C7A3A) for gardens and life, **water blue** (#7FA7C9): only when a scene needs a sky, earth or growth (e.g. a dua video under a night sky).
- Never more than gold + one other meaning colour in a frame.

## 4. Type & subtitles

- **Titles & quotes**: a classical serif (EB Garamond or Cormorant Garamond, OFL), 64–110 px at 1080 width, sentence case, centred or left-aligned on a 72 px margin; the key words in gold, the rest in cream. German quotes with „…“.
- **Translations under a verse**: the same serif in italic, 34–40 px, cream, centred, growing line by line as the recitation goes.
- **Arabic**: an Uthmani/naskh Qur'an font (Amiri Quran or Scheherazade New, OFL) in gold, 70–130 px, with full tashkeel; written on by the quill.
- **Reference label**: small caps sans (Inter 600), 22–26 px, tracked +3, gold: "AL-BAQARA 2:190", "ṬĀ-HĀ 20:108", "MUSLIM 2788a". Place names the same way in grey-gold ("MEKKA").
- **Source line**: Inter 400, 18–20 px, grey #8A877F, a small gold dot before it, just above the subtitles: "al-Baqara 2:190 · Rezitation: …", "Ṣaḥīḥ Muslim 2940a". A second, smaller line for a caveat ("Wann genau …: in keinem gesicherten Hadith genannt").
- **Subtitles**: Inter 700, 40–44 px, centred in the lower third (y ≈ 1380–1460 at 1920 height), no box, 1–2 lines, karaoke: the spoken word turns cream/white, emphasis words turn gold, words not yet spoken are grey #6E6B64. Honorifics as the glyph ﷺ.
- **Series variant** (optional per series): a tiny tracked header top-left ("AN-NAWAWIS 40 HADITHE") with a number top-right, a section kicker above a left-aligned serif headline ("DIE GESCHICHTE" / "WAS DAS FÜR UNS BEDEUTET" / "DEIN NÄCHSTER SCHRITT"), and a tiny footer at the bottom.
- Keep the bottom 300 px and the right 140 px free of important content (platform UI).

## 5. Motion quality

- Calm and continuous: slow push-ins, gentle drift, figures moved by springs (stick-explainer rig). No bounce, no cartoon squash.
- **Quill write-on**: the Arabic is revealed right-to-left along the baseline by a mask that follows a small golden pen; the pen dips slightly on each word; ≈ 0.25–0.45 s per word, synced to the recitation.
- **Translation grows**: each new line fades and rises 10 px into place under the last.
- **Titles**: words fade in with a slight blur-to-sharp and a 12 px rise, staggered per word; the gold word arrives last.
- **Glow pulses** for emphasis (the Prophet's light breathes; a lit word swells once).
- **Transitions**: dissolve through black, a slow cross-dissolve, or a match move (the torn strip flies from the page to a phone). No wipes, no page flips.
- **Engagement cues** (optional, small, gold line-art): a pointing hand with a word ("FOLGEN", "TEILEN", "LIKEN") pressing a ring; at most three per film, never over a verse.

## 6. Camera grammar

| Move | What it expresses | Can serve |
|---|---|---|
| Locked frame, slow drift | contemplation; reading time | a verse being written; a counter |
| Slow push in | focus, gravity | a key word; a face; the Prophet's words |
| Pull back | one becomes many | one figure → a crowd; one phone → many phones |
| Pan across a line-art set | place and time | Mecca, a battlefield, a mosque |
| Dissolve through black | a change of time or truth | "but the verse before…" |
| Tilt up/down between sky and ground | heaven and earth | rain falling, the sky folding |

Keep subjects in the upper two thirds; text above or below the scene, never on figures.

## 7. Sound palette

- **Voice**: a calm, warm German narrator (male in the references), ≈ 2.3–2.7 words/s, short sentences, a pause before every verse. Loud enough to carry the film; −14 LUFS, true peak ≤ −1 dB.
- **Recitation**: the Arabic is heard as recitation when a verse is written. Use only a recording the user owns or has permission for; name the reciter in the source line.
- **Music**: none or very sparse: a low drone, soft pads, a distant wind; no melodic instruments over a recitation. (Many viewers prefer no instruments; ask the user once and write the answer here.)
- **Sound effects**: soft, low: a pen scratch for the quill, a deep boom for a revelation or a turning point, wind, footsteps in sand, a bead click for a counter, a soft chime for "Geschafft".
- Silence before the climax line.

## 8. Native moves

- **The quill writes.** Reference label, Arabic written on word by word, translation grows below. *Fits:* every verse or hadith quote.
- **Torn out of context.** A mushaf page; one line tears out as a glowing red strip; it flies to phones that spread it; later the camera returns to the page and reveals the verse before and after. *Fits:* misquotes, misconceptions, "what they don't show you".
- **The light of the Prophet ﷺ.** A glowing star in a ring with its label; companions kneel or gather toward it; his words appear as a gold serif quote. *Fits:* any hadith told as a scene.
- **The counter.** A closed string of beads or marks; a big gold number counts up, each bead lighting as it is counted, the sky slowly brightening; ends on "Geschafft". *Fits:* dhikr, istighfar, repeating a dua.
- **The many rise.** A field of identical figures lying or standing in rows; they rise or turn together on a cue; a crowd as texture. *Fits:* the Day of Judgement, the ummah, a nation.
- **The acted parable.** One lit set (an arch, a lantern cone) and one figure doing an everyday deed, replayed with a single change (with / without the phone). *Fits:* intentions, manners, everyday ethics.

## 9. Pitfalls

- **Depicting the prophets, angels or Allah.** Never: only light and label for prophets; effects only for the unseen.
- **Unsourced claims.** Every verse and hadith gets its exact reference; weak narrations are labelled or left out; ask the user when a source is unsure. Translations must be faithful; paraphrase is marked "sinngemäß".
- **Wrong Arabic.** Copy Arabic text from a verified Qur'an text (Tanzil Uthmani), never retype from memory; check right-to-left shaping and tashkeel in the render.
- **Too bright.** A full-frame light or many glowing things flattens the night. One light source per scene.
- **Lyric-video drift.** The big subtitles must not become the image; keep a scene behind them.
- **Busy accents.** Gold everywhere loses meaning; red used for anything but distortion/violence loses its charge.
- **Copying the reference channel.** No handle, watermark, platform end card, or the reference's exact scenes.
- **Platform UI.** Captions, sources and CTA must stay clear of the right-side icons and bottom caption area.

## 10. Engine

- Figures, springs and camera: `$LIB/styles/stick-explainer/demo/full.js` (skeleton `wJ`, figure drawing, springs, world camera), restyled: dark ground, cream glowing strokes, filled heads.
- Text, Arabic shaping and quill: Canvas 2D `fillText` with a loaded Qur'an font (the browser shapes Arabic), revealed by a clip mask advancing right-to-left; the quill is a small gold line-art path following the mask edge.
- Bloom and grain: `$LIB/core/post`; voice and mix: `$LIB/core/tts`, `$LIB/core/audio` (TECHNIQUE.md).
- This style will get its own `demo/` once the first film is made.

## 11. Variation space

The agent decides the structure, the scenes, which native moves to use, and the pacing. Keep the black night, gold-as-revelation, the glowing line figures, the written Arabic with its source, and the no-depiction rule.

- **Structures**: myth vs. context (claim → reveal → history → resolution); a story told as a scene, then the lesson ("Die Geschichte / Was das für uns bedeutet / Dein nächster Schritt"); a guided practice (counter, dua) ending in the promised reward; an eschatological sequence (one event after another, each a verse).
- **Openings**: a provocative quote in big serif; a question to the viewer ("Weißt du, …?"); a single lit scene with no words.
- **Endings**: a verse written in full with its translation; a short gold line ("Vor der Tat: die Absicht."); a dua the viewer can say.
