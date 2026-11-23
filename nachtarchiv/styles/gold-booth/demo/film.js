// NACHTARCHIV · Akte 001 „Die Stimme vor der Tür“ · Peeling Wall & Gold Broadcast Booth · 1080×1920, 30 fps, 62 s
'use strict';
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
window.DUR = 62.0;

// ── subtitles (same table as AKTE-001.srt) ───────────────────────────────────────────
const SUBS = [
  [0.2, 3.0, 'Wenn nachts jemand\ndeinen Namen ruft …'],
  [3.5, 4.85, 'antworte niemals.'],
  [5.0, 6.9, 'Das sagte meine\nGroßmutter immer.'],
  [7.2, 11.0, 'Als ich eines Sommers in ihrem\nDorf in der Türkei übernachtete,'],
  [11.4, 13.4, 'hielt ich das\nfür Aberglauben.'],
  [14.3, 17.3, 'Um 3:17 Uhr hörte ich\ndie Stimme meiner Mutter.'],
  [18.0, 19.1, '„Emre …“'],
  [19.3, 22.5, '„Mach die Tür auf.\nIch bin’s.“'],
  [22.7, 26.0, 'Doch meine Mutter war\nhunderte Kilometer entfernt.'],
  [29.3, 30.8, 'Ich ging zum Fenster.'],
  [31.1, 34.4, 'Im Hof stand eine Frau,\ndie genauso aussah wie sie.'],
  [34.9, 35.9, '„Mama …?“'],
  [36.3, 38.7, 'Dann flüsterte meine\nGroßmutter hinter mir:'],
  [38.9, 41.0, '„Schau ihr nicht\nins Gesicht.“'],
  [42.3, 45.0, 'Die Gestalt draußen begann\nplötzlich zu lachen …'],
  [46.8, 48.6, '… mit der Stimme\nmeiner Großmutter.'],
  [49.1, 51.3, 'Und meine echte\nGroßmutter flüsterte:'],
  [51.4, 53.2, '„Du hast ihr geantwortet.“'],
  [53.3, 55.7, '„Jetzt weiß sie,\ndass du hier bist.“'],
];
window.SUBS = SUBS;

// ── sound/cue events (for events.json) ───────────────────────────────────────────────
window.EV = [{ t: 0, type: 'film' }, { t: 7, type: 'cut' }, { t: 14, type: 'cut' }, { t: 22, type: 'cut' }, { t: 25.8, type: 'cut' }, { t: 29, type: 'cut' },
  { t: 36, type: 'cut' }, { t: 42, type: 'cut' }, { t: 49, type: 'cut' }, { t: 55.7, type: 'black' }, { t: 56.4, type: 'cut' }];

// ── static layers ─────────────────────────────────────────────────────────────────────
let BED_WALL, SIT_WALL, F_BG, FL, FLg;
// figures go on their own layer, so the room's light can be laid over them without touching the gold lines
function figLayer(g, fn, light = {}) {
  FLg.setTransform(1, 0, 0, 1, 0, 0); FLg.clearRect(0, 0, W, H);
  const M = g.getTransform(); FLg.setTransform(M); fn(FLg);
  FLg.setTransform(1, 0, 0, 1, 0, 0); FLg.globalCompositeOperation = 'source-atop';
  if (light.dark) { FLg.fillStyle = rgba(light.col || '#141a22', light.dark); FLg.fillRect(0, 0, W, H); }
  for (const [x, y, r, col, a] of light.glows || []) {
    const p = M.transformPoint(new DOMPoint(x, y)), R = r * M.a, [cr, cg, cb] = hexRGB(col);
    const gr = FLg.createRadialGradient(p.x, p.y, 0, p.x, p.y, R); gr.addColorStop(0, `rgba(${cr},${cg},${cb},${a})`); gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    FLg.fillStyle = gr; FLg.fillRect(p.x - R, p.y - R, 2 * R, 2 * R);
  }
  FLg.globalCompositeOperation = 'source-over';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(FL, 0, 0); g.restore();
}
const WIN = { x0: 760, y0: 380, x1: 1040, y1: 1000 };          // bedroom window
const SWIN = { x0: 650, y0: 330, x1: 960, y1: 880 };           // sitting room window
const DOOR = { x0: 70, y0: 560, x1: 300, y1: 1600 };
const MIC = [360, 800];

function rectPath(r, pad = 0) { return P2(q => q.rect(r.x0 - pad, r.y0 - pad, r.x1 - r.x0 + 2 * pad, r.y1 - r.y0 + 2 * pad)); }
function wallClip(holes) { return P2(q => { q.rect(-400, -400, W + 800, H + 800); holes.forEach(r => { q.moveTo(r.x0, r.y0); q.lineTo(r.x0, r.y1); q.lineTo(r.x1, r.y1); q.lineTo(r.x1, r.y0); q.closePath(); }); }); }

// window frame in faded blue paint, mullions; lace curtain
function windowFrame(g, r, o = {}) {
  const fw = 22, col = '#6f8ea3';
  g.fillStyle = '#3c4e5a'; g.fillRect(r.x0 - fw - 6, r.y0 - fw - 6, r.x1 - r.x0 + 2 * fw + 12, 8);    // lintel shadow
  g.strokeStyle = col; g.lineWidth = fw; g.strokeRect(r.x0 - fw / 2, r.y0 - fw / 2, r.x1 - r.x0 + fw, r.y1 - r.y0 + fw);
  g.strokeStyle = 'rgba(216,205,184,.45)'; g.lineWidth = 3;                                              // worn paint to bare wood
  for (let k = 0; k < 7; k++) { const y = lerp(r.y0, r.y1, h2(k, 4)), x = h2(k, 8) < .5 ? r.x0 - fw + 4 : r.x1 + 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 10, y + 26 * h2(k, 2)); g.stroke(); }
  const mx = (r.x0 + r.x1) / 2, my = lerp(r.y0, r.y1, .42);
  g.strokeStyle = col; g.lineWidth = 12; g.beginPath(); g.moveTo(mx, r.y0); g.lineTo(mx, r.y1); g.moveTo(r.x0, my); g.lineTo(r.x1, my); g.stroke();
  g.fillStyle = '#5c7484'; g.fillRect(r.x0 - fw - 14, r.y1 + fw - 4, r.x1 - r.x0 + 2 * fw + 28, 18);          // sill
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(r.x0 - fw - 14, r.y1 + fw + 14, r.x1 - r.x0 + 2 * fw + 28, 10);
}
function lace(g, r, open, a = .55) {    // thin white lace on the left part of the window; open 0..1 pulls it aside
  const w = (r.x1 - r.x0) * lerp(.48, .16, open), x = r.x0;
  const p = P2(q => { q.moveTo(x, r.y0); q.lineTo(x + w, r.y0); for (let i = 0; i <= 12; i++) { const y = lerp(r.y0, r.y1 + 30, i / 12); q.lineTo(x + w + Math.sin(i * 1.7) * 6 - open * 20 * (i / 12), y); } q.lineTo(x, r.y1 + 30); q.closePath(); });
  g.fillStyle = `rgba(232,230,222,${a * .55})`; g.fill(p);
  g.save(); g.clip(p); g.strokeStyle = `rgba(250,248,240,${a * .5})`; g.lineWidth = 1.5;
  for (let y = r.y0 + 10; y < r.y1 + 30; y += 22) for (let xx = x + 8; xx < x + w; xx += 22) { g.beginPath(); g.arc(xx + (y / 22 % 2) * 11, y, 6, 0, TAU); g.stroke(); }
  for (let xx = x + 12; xx < x + w; xx += 16) { g.strokeStyle = `rgba(120,120,115,${a * .25})`; g.lineWidth = 3; g.beginPath(); g.moveTo(xx, r.y0); g.lineTo(xx + 4, r.y1 + 30); g.stroke(); }
  g.restore();
}
function floor(g, y, x0 = -400, x1 = W + 400) {
  g.fillStyle = '#2a1d14'; g.fillRect(x0, y, x1 - x0, 800);
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(x0, y + 18 + k * k * 9); g.lineTo(x1, y + 18 + k * k * 9); g.stroke(); }
  g.fillStyle = '#1c130c'; g.fillRect(x0, y - 14, x1 - x0, 16);   // skirting
}

// ── the courtyard (seen through the bedroom window), in its own units, k = .55 world per unit ──
const CK = .55;
function courtyard(g, t, o) {
  // sky and moon
  const sky = g.createLinearGradient(0, -400, 0, 400); sky.addColorStop(0, '#0b1220'); sky.addColorStop(1, '#22303e');
  g.fillStyle = sky; g.fillRect(-600, -600, 2400, 1100);
  glow(g, 260, 60, 320, '#9fb6c8', .35);
  g.fillStyle = '#d9e2e4'; g.beginPath(); g.arc(260, 60, 26, 0, TAU); g.fill();
  // back wall with a wooden gate, flat roofs beyond
  g.fillStyle = '#1a2026'; g.fill(P2(q => poly(q, [[-600, 300], [150, 280], [150, 240], [420, 240], [420, 270], [1800, 250], [1800, 420], [-600, 420]])));
  g.fillStyle = '#3e4a52'; g.fillRect(-600, 330, 2400, 330);
  for (let i = -12; i < 40; i++) for (let j = 0; j < 7; j++) { g.fillStyle = `rgba(${h2(i, j) < .5 ? '40,48,54' : '78,90,96'},${.12 + .1 * h2(j, i)})`; g.fillRect(i * 52 + (j % 2) * 26, 334 + j * 46, 48, 42); }
  g.fillStyle = '#231a14'; g.fillRect(660, 420, 190, 240); g.strokeStyle = '#120d0a'; g.lineWidth = 6; for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(660 + k * 38, 420); g.lineTo(660 + k * 38, 660); g.stroke(); }
  // ground: old stone slabs, moonlit
  const gr = g.createLinearGradient(0, 660, 0, 1400); gr.addColorStop(0, '#47535a'); gr.addColorStop(1, '#262e33');
  g.fillStyle = gr; g.fillRect(-600, 660, 2400, 900);
  g.strokeStyle = 'rgba(15,20,22,.55)'; g.lineWidth = 3;
  for (let j = 0; j < 9; j++) { const y = 660 + j * j * 10 + j * 30; g.beginPath(); g.moveTo(-600, y); g.lineTo(1800, y); g.stroke(); for (let i = -10; i < 30; i++) { const x = i * 120 + (j % 2) * 60; g.beginPath(); g.moveTo(x + (x - 500) * j * .06, y); g.lineTo(x + (x - 500) * (j + 1) * .06, y + 40 + j * 20); g.stroke(); } }
  // mulberry tree
  g.fillStyle = '#16191a'; g.fill(P2(q => poly(q, [[1010, 1000], [1040, 600], [1000, 420], [1060, 430], [1080, 620], [1070, 1000]])));
  g.fillStyle = '#121618'; g.fill(P2(q => curve(q, [[820, 380], [880, 120], [1100, 40], [1320, 140], [1300, 420], [1080, 500], [900, 470]])));
  g.fillStyle = 'rgba(70,86,90,.5)'; for (let k = 0; k < 40; k++) { g.beginPath(); g.ellipse(860 + h2(k, 1) * 420, 90 + h2(k, 2) * 330, 16, 9, h2(k, 3) * 3, 0, TAU); g.fill(); }
  // the well
  g.fillStyle = '#56636a'; g.beginPath(); g.ellipse(340, 900, 130, 42, 0, 0, TAU); g.fill();
  g.fillStyle = '#3d474d'; g.fillRect(210, 900, 260, 110); g.beginPath(); g.ellipse(340, 1010, 130, 42, 0, 0, Math.PI); g.fill();
  g.fillStyle = '#0a0d0f'; g.beginPath(); g.ellipse(340, 900, 100, 30, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(20,24,26,.6)'; g.lineWidth = 3; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(210 + k * 52, 905); g.lineTo(210 + k * 52, 1040); g.stroke(); }
  // the figure
  if (o.figure) figureCourt(g, t, o);
  // mist drifting low over the stones
  for (let k = 0; k < 7; k++) {
    const x = ((k * 330 + t * (14 + k * 3)) % 2200) - 500, y = 860 + k * 32;
    const m = g.createRadialGradient(x, y, 0, x, y, 420); m.addColorStop(0, `rgba(190,205,212,${.16 + .04 * (k % 3)})`); m.addColorStop(1, 'rgba(190,205,212,0)');
    g.fillStyle = m; g.save(); g.scale(1, .32); g.beginPath(); g.arc(x, y / .32, 420, 0, TAU); g.restore(); g.fillRect(x - 420, y - 140, 840, 280);
  }
  const lm = g.createLinearGradient(0, 860, 0, 1100); lm.addColorStop(0, 'rgba(180,196,204,0)'); lm.addColorStop(1, 'rgba(180,196,204,.22)');
  g.fillStyle = lm; g.fillRect(-600, 860, 2400, 600);
}
// the figure: Leyla's face, hair loose to the waist, a long dark wool dress, bare feet, arms straight
const FIGX = 655;
function figureCourt(g, t, o) {
  const x = FIGX, feet = 1000, r = 27, hy = feet - 460 + r;
  const tilt = o.tilt || 0, mouth = o.mouth || 0;
  g.save();
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x - 30, feet + 4, 70, 14, 0, 0, TAU); g.fill();
  // dress
  g.fillStyle = '#1b1a1d'; g.fill(P2(q => curve(q, [[x - 44, hy + 58], [x + 44, hy + 58], [x + 58, hy + 200], [x + 74, feet - 30], [x + 40, feet - 8], [x - 40, feet - 8], [x - 74, feet - 30], [x - 58, hy + 200]])));
  g.fillStyle = 'rgba(160,180,190,.12)'; g.fill(P2(q => curve(q, [[x - 44, hy + 58], [x - 8, hy + 60], [x - 20, feet - 10], [x - 74, feet - 30], [x - 58, hy + 200]])));
  // arms hanging straight, pale hands
  for (const s of [-1, 1]) { g.fillStyle = '#18171a'; g.fill(P2(q => poly(q, [[x + s * 40, hy + 62], [x + s * 56, hy + 66], [x + s * 60, hy + 230], [x + s * 44, hy + 230]]))); g.fillStyle = C.skinPale; g.beginPath(); g.ellipse(x + s * 52, hy + 244, 9, 16, 0, 0, TAU); g.fill(); }
  // bare feet
  g.fillStyle = C.skinPale; g.beginPath(); g.ellipse(x - 18, feet - 4, 13, 6, 0, 0, TAU); g.ellipse(x + 18, feet - 4, 13, 6, 0, 0, TAU); g.fill();
  // head on the neck, tilting
  g.translate(x, hy + 40); g.rotate(tilt); g.translate(-x, -(hy + 40));
  glow(g, x, hy, r * 3, '#c8d6e0', .25);
  head(g, { x, y: hy, r, yaw: 0, hair: 'long', hairLen: r * 7.2, skin: '#d6c4b6', eyes: 'shadow', mouth, mole: true, light: -Math.PI * .75, lightA: .75 });
  g.restore();
}

// ── figures in the rooms ─────────────────────────────────────────────────────────────
function torso(g, pts, col) { g.fillStyle = col; g.fill(P2(q => curve(q, pts))); }
function limb(g, a, b, w, col) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
function hand(g, x, y, r, skin = C.skin) { g.fillStyle = skin; g.beginPath(); g.ellipse(x, y, r, r * 1.25, 0, 0, TAU); g.fill(); }
const SWEATER = '#3b3d40', TROUSERS = '#1b1c1e', CARDIGAN = '#1c1a19', SKIRT = '#2b2520', SCARF = '#5a3a22';

// Emre standing, seen from behind (b = 1) or turning (turn 0..1 shows his face over his shoulder, toward the viewer's left)
function emreBack(g, x, y, r, o = {}) {
  const sh = r * 2.6;
  limb(g, [x - r * .7, y + r * 9.5], [x - r * .65, y + r * 14], r * .8, TROUSERS); limb(g, [x + r * .7, y + r * 9.5], [x + r * .65, y + r * 14], r * .8, TROUSERS);
  torso(g, [[x - sh / 2, y + r * 1.9], [x + sh / 2, y + r * 1.9], [x + sh / 2 + r * .2, y + r * 4], [x + r * 1.15, y + r * 6.6], [x + r * 1.2, y + r * 10], [x - r * 1.2, y + r * 10], [x - r * 1.15, y + r * 6.6], [x - sh / 2 - r * .2, y + r * 4]], SWEATER);
  limb(g, [x - sh / 2 + r * .15, y + r * 2.4], [x - sh / 2 + (o.armL ? r * .2 : 0), y + r * 6.6], r * .78, SWEATER);
  if (o.armR) { limb(g, [x + sh / 2 - r * .15, y + r * 2.4], o.armR, r * .78, SWEATER); hand(g, o.armR[0], o.armR[1], r * .3); }
  else limb(g, [x + sh / 2 - r * .15, y + r * 2.4], [x + sh / 2 + r * .1, y + r * 6.6], r * .78, SWEATER);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x - r * .06, y + r * 2.2, r * .12, r * 7);
  const turn = o.turn || 0;
  head(g, { x, y, r, yaw: turn > .01 ? lerp(-1.6, -.75, turn) : -1.6, hair: 'short', skin: C.skin, beard: true, eyes: o.eyes || 'wide', light: o.light ?? 0, lightA: .65 });
}
// Emre sitting on the edge of the bed, phone in both hands
function emreSitting(g, x, seat, r, o = {}) {
  const y = seat - r * 6;
  limb(g, [x - r * .5, seat], [x - r * .9, seat + r * 2.4], r * .85, TROUSERS); limb(g, [x - r * .9, seat + r * 2.4], [x - r * .8, seat + r * 5.4], r * .75, TROUSERS);
  limb(g, [x + r * .5, seat], [x + r * .3, seat + r * 2.5], r * .85, TROUSERS); limb(g, [x + r * .3, seat + r * 2.5], [x + r * .4, seat + r * 5.4], r * .75, TROUSERS);
  torso(g, [[x - r * 1.25, y + r * 1.8], [x + r * 1.25, y + r * 1.8], [x + r * 1.35, y + r * 3.6], [x + r * 1.15, seat], [x - r * 1.15, seat], [x - r * 1.35, y + r * 3.6]], SWEATER);
  const px = x + r * .1, py = y + r * 4.3;
  limb(g, [x - r * 1.1, y + r * 2.2], [x - r * .9, y + r * 4.6], r * .7, SWEATER); limb(g, [x - r * .9, y + r * 4.6], [px - r * .3, py + r * .3], r * .62, SWEATER);
  limb(g, [x + r * 1.1, y + r * 2.2], [x + r * 1.0, y + r * 4.6], r * .7, SWEATER); limb(g, [x + r * 1.0, y + r * 4.6], [px + r * .3, py + r * .3], r * .62, SWEATER);
  g.fillStyle = '#0d0e10'; g.save(); g.translate(px, py); g.rotate(-.25); g.fillRect(-r * .35, -r * .6, r * .7, r * 1.15); g.fillStyle = 'rgba(200,220,240,.9)'; g.fillRect(-r * .29, -r * .53, r * .58, r * 1.0); g.restore();
  hand(g, px - r * .3, py + r * .2, r * .26); hand(g, px + r * .3, py + r * .25, r * .26);
  head(g, { x, y, r, yaw: o.yaw ?? .25, tilt: o.tilt ?? .12, hair: 'short', beard: true, eyes: o.eyes || 'down', light: o.light ?? -Math.PI / 2, lightA: .7 });
}
// Emre in bed: lying (up 0) → propped up on an elbow (up 1)
function emreBed(g, t, o) {
  const up = o.up || 0, x = 520 + up * 30, y = 1300 - up * 95, r = 44;
  if (up > .05) torso(g, [[x - r * 1.0, y + r * 1.4], [x + r * 1.3, y + r * 1.6], [x + r * 1.6, y + r * 3.4], [x - r * .6, y + r * 3.4]], SWEATER);
  head(g, { x, y, r, yaw: o.yaw ?? .55, tilt: lerp(-1.25, -.1, ss(up)), hair: 'short', beard: true, eyes: o.eyes || 'closed', light: 0, lightA: .7 });
  if (o.phone) {   // phone lit in his hand near his face
    const px = x + 90, py = y + 70; g.fillStyle = '#0d0e10'; g.fillRect(px - 16, py - 30, 32, 58); g.fillStyle = `rgba(200,220,240,${o.phone})`; g.fillRect(px - 13, py - 26, 26, 50); hand(g, px - 4, py + 22, 13);
  }
}
// Hatice standing with the oil lamp; walk 0..1, grip: point she holds (Emre's arm), yaw, lean
function hatice(g, x, y, r, o = {}) {
  const lean = o.lean || 0;
  g.save(); g.translate(x, y + r * 13); g.rotate(lean); g.translate(-x, -(y + r * 13));
  torso(g, [[x - r * 1.2, y + r * 5.5], [x + r * 1.2, y + r * 5.5], [x + r * 1.5, y + r * 13], [x - r * 1.5, y + r * 13]], SKIRT);
  torso(g, [[x - r * 1.05, y + r * 1.6], [x + r * 1.05, y + r * 1.6], [x + r * 1.25, y + r * 4], [x + r * 1.3, y + r * 7], [x - r * 1.3, y + r * 7], [x - r * 1.25, y + r * 4]], CARDIGAN);
  // the lamp hand (viewer's left)
  const lx = o.lampAt ? o.lampAt[0] : x - r * 1.6, ly = o.lampAt ? o.lampAt[1] : y + r * 6.2;
  limb(g, [x - r * .9, y + r * 2.2], [x - r * 1.3, y + r * 4.6], r * .62, CARDIGAN); limb(g, [x - r * 1.3, y + r * 4.6], [lx + r * .2, ly - r * .3], r * .55, CARDIGAN);
  hand(g, lx + r * .2, ly - r * .5, r * .24, C.skinOld);
  // the gripping hand
  if (o.grip) { limb(g, [x + r * .9, y + r * 2.2], [lerp(x + r * .9, o.grip[0], .55), lerp(y + r * 3.5, o.grip[1], .55) + r * .5], r * .6, CARDIGAN); limb(g, [lerp(x + r * .9, o.grip[0], .55), lerp(y + r * 3.5, o.grip[1], .55) + r * .5], o.grip, r * .55, CARDIGAN); hand(g, o.grip[0], o.grip[1], r * .26, C.skinOld);
    g.fillStyle = '#2a1a10'; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(o.grip[0] - r * .3 + k * r * .1, o.grip[1] + r * .32 + Math.sin(k) * r * .05, r * .05, 0, TAU); g.fill(); } }
  else { limb(g, [x + r * .9, y + r * 2.2], [x + r * 1.2, y + r * 5.8], r * .6, CARDIGAN); hand(g, x + r * 1.2, y + r * 6.1, r * .24, C.skinOld); }
  head(g, { x, y, r, yaw: o.yaw ?? .5, tilt: o.tilt || 0, hair: 'scarf', scarf: SCARF, skin: C.skinOld, age: true, eyes: o.eyes || 'down', mouth: o.mouth || 0, light: o.light ?? Math.PI * .8, lightA: .7, brow: 1 });
  g.restore();
}
function oilLamp(g, x, y, s, k, t) {   // brass base, glass chimney, flame k (0..1)
  g.fillStyle = '#8a6a34'; g.beginPath(); g.ellipse(x, y + s * .55, s * .5, s * .2, 0, 0, TAU); g.fill();
  g.fillStyle = '#b08a46'; g.fill(P2(q => curve(q, [[x - s * .45, y + s * .5], [x - s * .5, y + s * .1], [x, y - s * .1], [x + s * .5, y + s * .1], [x + s * .45, y + s * .5]])));
  g.fillStyle = 'rgba(220,230,235,.18)'; g.fill(P2(q => curve(q, [[x - s * .18, y - s * .05], [x - s * .32, y - s * .5], [x - s * .14, y - s * 1.2], [x + s * .14, y - s * 1.2], [x + s * .32, y - s * .5], [x + s * .18, y - s * .05]])));
  if (k > .01) {
    const f = k * (1 + .12 * Math.sin(t * 31) + .08 * Math.sin(t * 17.3));
    glow(g, x, y - s * .45, s * 6 * k, '#ffb24a', .55 * k);
    g.fillStyle = '#ffd27a'; g.beginPath(); g.ellipse(x, y - s * .42, s * .09 * f, s * .28 * f, 0, 0, TAU); g.fill();
    g.fillStyle = '#fff4d0'; g.beginPath(); g.ellipse(x, y - s * .36, s * .04 * f, s * .12 * f, 0, 0, TAU); g.fill();
  }
}

// ── rooms ─────────────────────────────────────────────────────────────────────────────
function boothRoom(g, t, o) {
  const pulse = clamp(rmsAt(t) * 3.2);
  tuftedWall(g, MIC, { dw: 150, dh: 186, x0: -150 + 37, y0: -186 + 60 });
  texture(g, null, TEXD, .9);
  glow(g, MIC[0] + 30, MIC[1] - 40, 620, '#ffb85c', .38 + .22 * pulse);
  // desk far side (behind the narrator) and the "on air" brass plate
  g.fillStyle = '#21150b'; g.fillRect(380, 1250, 900, 700); g.fillStyle = '#4a3018'; g.fillRect(380, 1238, 900, 18);
  scopeLines(g, t, { x0: -60, x1: W + 60, y0: 330, y1: 1080, n: 6, amp: 95, smooth: o.smooth, alpha: .9, ls: o.ls, core: '250,232,180', sep: .45 });
  // the microphone: cord, a brass ring suspension, a capsule with a grille
  g.strokeStyle = '#120c06'; g.lineWidth = 6; g.beginPath(); g.moveTo(MIC[0] - 6, -200); g.lineTo(MIC[0] - 6, MIC[1] - 160); g.stroke();
  g.strokeStyle = '#a98545'; g.lineWidth = 9; g.beginPath(); g.ellipse(MIC[0], MIC[1], 98, 124, 0, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(255,240,200,.5)'; g.lineWidth = 3; g.beginPath(); g.ellipse(MIC[0], MIC[1], 98, 124, 0, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
  g.strokeStyle = '#2a2018'; g.lineWidth = 3; for (const [a, b] of [[-98, 0], [98, 0], [0, -124], [0, 124]]) { g.beginPath(); g.moveTo(MIC[0] + a, MIC[1] + b); g.lineTo(MIC[0] + a * .5, MIC[1] + b * .62); g.stroke(); }
  const cap = P2(q => q.roundRect(MIC[0] - 50, MIC[1] - 80, 100, 160, 46));
  const mg = g.createLinearGradient(MIC[0] - 50, 0, MIC[0] + 50, 0); mg.addColorStop(0, '#f1d9a0'); mg.addColorStop(.35, '#b9924e'); mg.addColorStop(1, '#3b2812');
  g.fillStyle = mg; g.fill(cap);
  g.save(); g.clip(cap); g.strokeStyle = 'rgba(30,20,10,.5)'; g.lineWidth = 2; for (let y = MIC[1] - 76; y < MIC[1] + 80; y += 7) { g.beginPath(); g.moveTo(MIC[0] - 50, y); g.lineTo(MIC[0] + 50, y); g.stroke(); } g.restore();
  g.fillStyle = '#6b4b22'; g.fillRect(MIC[0] - 52, MIC[1] - 6, 104, 12); g.fillStyle = 'rgba(255,240,200,.6)'; g.fillRect(MIC[0] - 40, MIC[1] - 4, 22, 3);
  glow(g, MIC[0] - 20, MIC[1] - 40, 90, '#fff0c8', .12 + .25 * pulse);
}
function narrator(g, t) {   // back three-quarter, headphones, at the desk, lower right
  const x = 820, y = 1150, r = 80;
  torso(g, [[x - r * 2.3, y + r * 2.1], [x + r * 2.0, y + r * 2.0], [x + r * 2.6, y + r * 4.5], [x + r * 2.8, y + r * 10], [x - r * 2.9, y + r * 10], [x - r * 2.6, y + r * 4.4]], '#2a2018');
  g.fillStyle = 'rgba(201,160,80,.18)'; g.fill(P2(q => curve(q, [[x - r * 2.3, y + r * 2.1], [x - r * .8, y + r * 1.9], [x - r * 1.4, y + r * 5], [x - r * 2.7, y + r * 4.6]])));
  head(g, { x, y, r, yaw: -1.5, hair: 'short', skin: C.skin, hairCol: '#1e1813' });
  g.fillStyle = 'rgba(201,160,80,.22)'; g.beginPath(); g.ellipse(x - r * .55, y - r * .2, r * .4, r * .7, -.3, 0, TAU); g.fill();   // the glow on his hair
  g.strokeStyle = '#141010'; g.lineWidth = 12; g.beginPath(); g.ellipse(x, y - r * .1, r * 1.08, r * 1.18, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  for (const s of [-1, 1]) { g.fillStyle = '#1a1512'; g.beginPath(); g.ellipse(x + s * r * 1.02, y + r * .05, r * .22, r * .36, 0, 0, TAU); g.fill(); g.fillStyle = '#a98545'; g.beginPath(); g.ellipse(x + s * r * 1.06, y + r * .05, r * .08, r * .2, 0, 0, TAU); g.fill(); }
}
function emptyChair(g) {
  g.fillStyle = '#1b1109'; g.fill(P2(q => q.roundRect(640, 1300, 420, 760, 60)));
  g.save(); g.clip(P2(q => q.roundRect(640, 1300, 420, 760, 60)));
  const cg = g.createLinearGradient(640, 0, 1060, 0); cg.addColorStop(0, 'rgba(120,80,40,.35)'); cg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = cg; g.fillRect(640, 1300, 420, 760);
  for (let j = 0; j < 6; j++) for (let i = 0; i < 5; i++) { const x = 680 + i * 90 + (j % 2) * 45, y = 1360 + j * 80; g.fillStyle = '#0a0704'; g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); g.fillStyle = 'rgba(201,160,80,.35)'; g.beginPath(); g.arc(x - 1.5, y - 1.5, 1.6, 0, TAU); g.fill(); }
  g.restore();
  g.fillStyle = 'rgba(201,160,80,.25)'; g.fillRect(650, 1306, 380, 6);
  // headphones on the desk
  g.strokeStyle = '#141010'; g.lineWidth = 9; g.beginPath(); g.ellipse(520, 1240, 70, 46, 0, Math.PI, TAU); g.stroke();
  g.fillStyle = '#1a1512'; g.beginPath(); g.ellipse(452, 1246, 22, 16, 0, 0, TAU); g.ellipse(588, 1246, 22, 16, 0, 0, TAU); g.fill();
}

function sittingRoom(g, t, o) {
  drawBitmap(g, SIT_WALL);
  // outside at blue hour
  g.save(); g.clip(rectPath(SWIN));
  const sky = g.createLinearGradient(0, SWIN.y0, 0, SWIN.y1); sky.addColorStop(0, '#1c2948'); sky.addColorStop(.6, '#5b5f86'); sky.addColorStop(1, '#c58f78');
  g.fillStyle = sky; g.fillRect(SWIN.x0, SWIN.y0, 400, 600);
  g.fillStyle = 'rgba(255,250,235,.8)'; for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(SWIN.x0 + h2(k, 1) * 310, SWIN.y0 + h2(k, 2) * 220, 1.3, 0, TAU); g.fill(); }
  g.fillStyle = '#4b4a62'; g.fill(P2(q => curve(q, [[600, 900], [600, 690], [720, 640], [820, 668], [930, 620], [1000, 650], [1000, 900]], true)));
  g.fillStyle = '#2d2c3c'; g.fill(P2(q => poly(q, [[600, 900], [600, 760], [700, 760], [700, 730], [790, 730], [790, 770], [860, 770], [860, 745], [1000, 745], [1000, 900]])));
  g.fillStyle = '#ffbf6a'; for (const [x, y] of [[730, 760], [884, 782], [705, 790]]) g.fillRect(x, y, 9, 11);
  g.fillStyle = '#1e1c26'; g.fill(P2(q => curve(q, [[905, 900], [900, 600], [916, 470], [930, 600], [926, 900]], true)));      // a poplar
  g.restore();
  windowFrame(g, SWIN); lace(g, SWIN, .2, .45);
  floor(g, 1560);
  // divan with a kilim, cushions against the wall
  g.fillStyle = '#5b2a1e'; g.fillRect(30, 1240, 560, 130); g.fillStyle = '#3a1a12'; g.fillRect(30, 1370, 560, 190);
  g.strokeStyle = 'rgba(205,160,90,.5)'; g.lineWidth = 4; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(50 + i * 62, 1250); g.lineTo(80 + i * 62, 1290); g.lineTo(50 + i * 62, 1330); g.stroke(); }
  g.fillStyle = '#7a4a2a'; g.fill(P2(q => q.roundRect(380, 1120, 190, 140, 30))); g.fillStyle = '#6a3a24'; g.fill(P2(q => q.roundRect(40, 1110, 170, 150, 30)));
  texture(g, P2(q => q.rect(30, 1110, 560, 450)), TEXV, .8);
  // duffel bag by the door
  g.fillStyle = '#2b2f29'; g.fill(P2(q => q.roundRect(880, 1460, 190, 104, 40))); g.strokeStyle = '#151714'; g.lineWidth = 5; g.beginPath(); g.moveTo(900, 1480); g.quadraticCurveTo(975, 1400, 1050, 1480); g.stroke();
  // light: dusk through the window (cool), the oil lamp (warm)
  glow(g, 800, 600, 700, '#8d93b8', .22);
  shade(g, '#55607a', .28);
}
function emreStand(g, x, y, r) {   // standing three-quarter toward the viewer's left
  limb(g, [x - r * .45, y + r * 7.4], [x - r * .55, y + r * 14.5], r * .85, TROUSERS); limb(g, [x + r * .45, y + r * 7.4], [x + r * .6, y + r * 14.5], r * .85, TROUSERS);
  torso(g, [[x - r * 1.2, y + r * 1.8], [x + r * 1.25, y + r * 1.8], [x + r * 1.3, y + r * 4], [x + r * 1.1, y + r * 7.8], [x - r * 1.1, y + r * 7.8], [x - r * 1.3, y + r * 4]], SWEATER);
  limb(g, [x - r * 1.05, y + r * 2.2], [x - r * 1.25, y + r * 7], r * .7, SWEATER); hand(g, x - r * 1.25, y + r * 7.3, r * .28);
  limb(g, [x + r * 1.05, y + r * 2.2], [x + r * 1.3, y + r * 7], r * .7, SWEATER); hand(g, x + r * 1.3, y + r * 7.3, r * .28);
  head(g, { x, y, r, yaw: -.55, hair: 'short', beard: true, eyes: 'open', light: Math.PI * .1, lightA: .6 });
}

function bedroomWall(g, t, o) {
  drawBitmap(g, BED_WALL);
  // door to the dark hallway: dim moonlit grey, so a black shape in it reads
  g.fillStyle = '#0d1115'; g.fillRect(DOOR.x0, DOOR.y0, DOOR.x1 - DOOR.x0, DOOR.y1 - DOOR.y0);
  const hall = g.createLinearGradient(DOOR.x0, 0, DOOR.x1, 0); hall.addColorStop(0, 'rgba(70,86,100,.55)'); hall.addColorStop(1, 'rgba(110,128,140,.9)');
  g.fillStyle = hall; g.fillRect(DOOR.x0, DOOR.y0, DOOR.x1 - DOOR.x0, DOOR.y1 - DOOR.y0);
  if (o.shadow) shadowFigure(g, o.shadow);
  g.strokeStyle = '#2b1e14'; g.lineWidth = 20; g.strokeRect(DOOR.x0 - 10, DOOR.y0 - 10, DOOR.x1 - DOOR.x0 + 20, DOOR.y1 - DOOR.y0 + 10);
  floor(g, 1600);
  g.fillStyle = '#3a2716'; g.fillRect(330, 1300, 90, 300); g.fillStyle = '#4c341d'; g.fillRect(325, 1292, 100, 14);
  oilLamp(g, 375, 1262, 34, 0, t);
}
function bedroomWindow(g, t, o) {
  g.save(); g.clip(rectPath(WIN));
  g.translate((WIN.x0 + WIN.x1) / 2 + (o.par || [0, 0])[0], (WIN.y0 + WIN.y1) / 2 + (o.par || [0, 0])[1]); g.scale(CK, CK); g.translate(-560, -700);
  courtyard(g, t, o);
  g.restore();
  if (o.glassLines) for (const [a, b] of [[WIN.y0 + 20, 520], [880, WIN.y1 - 10]]) scopeLines(g, t, { x0: WIN.x0, x1: WIN.x1, y0: a, y1: b, n: 3, amp: 40, smooth: o.smooth, alpha: o.glassLines, clip: rectPath(WIN), ls: o.ls, core: '236,206,140' });
  if (o.fog) { g.save(); g.globalAlpha = o.fog; glow(g, 880, 790, 80, '#dfe6ea', .6, 'source-over'); g.restore(); }
  g.save(); g.filter = 'brightness(0.55)'; windowFrame(g, WIN); g.restore();
  lace(g, WIN, o.lace ?? 0, .4);
}
function bed(g, t, o) {
  g.fillStyle = '#3a2716'; g.fillRect(430, 1250, 22, 350); g.fillRect(430, 1350, 380, 30); g.fillRect(790, 1340, 20, 260);
  g.fillStyle = '#d9d4c8'; g.fill(P2(q => q.roundRect(452, 1300, 336, 56, 12)));
  if (o.inBed) emreBed(g, t, o.inBed);
  const up = o.inBed ? (o.inBed.up || 0) : 0;
  g.fillStyle = '#e6e0d2'; g.fill(P2(q => curve(q, [[540, 1318], [620, o.inBed ? 1290 - up * 10 : 1310], [720, o.inBed ? 1296 : 1312], [800, 1318], [800, 1372], [540, 1372]])));
  g.fillStyle = 'rgba(150,40,40,.35)'; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(560 + i * 17, 1350 + (i % 2) * 8, 3, 0, TAU); g.fill(); }
  if (!o.inBed) { g.fillStyle = '#ece6da'; g.fill(P2(q => q.roundRect(460, 1284, 110, 40, 16))); }
}
function shadowFigure(g, a) {   // tall, thin, featureless, slightly taller than the door
  const x = 190, top = 548, bot = 1600;
  g.save(); g.globalAlpha = a; g.fillStyle = '#020203';
  g.fill(P2(q => curve(q, [[x - 30, top + 10], [x + 26, top + 6], [x + 50, top + 90], [x + 70, top + 240], [x + 62, top + 600], [x + 48, bot], [x - 52, bot], [x - 64, top + 600], [x - 72, top + 240], [x - 54, top + 90]])));
  g.restore();
}

// night light pass for the bedroom (multiply blue night, moon through the window, warm sources)
function nightLight(g, t, o) {
  shade(g, C.night, o.dark ?? .72);
  shade(g, '#000000', o.black ?? 0);
  g.save(); g.globalCompositeOperation = 'screen';
  const mp = P2(q => poly(q, [[WIN.x0, WIN.y0], [WIN.x1, WIN.y0], [WIN.x1 - 120, 1600], [WIN.x0 - 520, 1600]]));
  const mg = g.createLinearGradient(WIN.x0, WIN.y0, WIN.x0 - 300, 1600); mg.addColorStop(0, 'rgba(110,135,160,.2)'); mg.addColorStop(1, 'rgba(110,135,160,0)');
  g.fillStyle = mg; g.fill(mp); g.restore();
  if (o.phone) glow(g, o.phone[0], o.phone[1], 260, '#bcd4ff', .35 * o.phone[2]);
  if (o.lamp) glow(g, o.lamp[0], o.lamp[1], 620 * o.lamp[2], '#ffa64a', .42 * o.lamp[2]);
}

// ── shots ─────────────────────────────────────────────────────────────────────────────
function cam(g, cx, cy, s) { g.setTransform(s, 0, 0, s, W / 2 - cx * s, H / 2 - cy * s); }
const linesAlpha = monotone([[0, .7], [7, .7], [7.1, .55], [14, .5], [17.9, .5], [18.1, .85], [22.4, .85], [22.6, .55], [36, .55], [38.8, .85], [42, .6], [44.7, .6], [44.9, .95], [48.6, .95], [49.1, .5], [51.3, .85], [56, .7], [62, .7]]);
const smoothAt = t => (t > 3.4 && t < 4.9) || (t > 17.9 && t < 22.5) || (t > 38.8 && t < 41.2) || (t > 44.7 && t < 48.7) || (t > 51.3 && t < 55.8) ? 1 : 4;

function shotA(g, t) {   // 0–3.4 close-up of the source
  const s = lerp(2.3, 2.45, ss(seg(t, 0, 3.4)));
  cam(g, MIC[0] + 60, MIC[1] + 120, s);
  boothRoom(g, t, { smooth: smoothAt(t), ls: s });
}
function shotB(g, t) {   // 3.4–7.0 the booth wide, narrator in the corner
  const s = lerp(1.0, 1.07, ss(seg(t, 3.4, 7.0)));
  cam(g, 560, 980, s);
  boothRoom(g, t, { smooth: smoothAt(t), ls: s });
  narrator(g, t);
}
function shotC(g, t) {   // 7–14 the sitting room at blue hour; the voice crosses the wall
  const s = lerp(1.0, 1.04, ss(seg(t, 7, 14)));
  cam(g, 540, 960, s);
  sittingRoom(g, t, {});
  const reach = -80 + 1300 * ss(seg(t, 7.0, 8.4));
  scopeLines(g, t, { x0: -60, x1: W + 60, y0: 300, y1: 900, n: 6, amp: 80, smooth: smoothAt(t), alpha: linesAlpha(t), ls: s, core: '236,206,140', sep: .2,
    clip: P2(q => { q.rect(-100, -100, reach + 100, 1100); q.rect(SWIN.x0 - 24, SWIN.y0 - 24, SWIN.x1 - SWIN.x0 + 48, SWIN.y1 - SWIN.y0 + 48); }), rule: 'evenodd' });
  oilLamp(g, 480, 1225, 36, 1, t);
  hatice(g, 250, 1028, 40, { yaw: .45, eyes: 'open', lampAt: [215, 1262], grip: null, light: 0 });
  emreStand(g, 800, 938, 42);
}
const wallLines = (g, t, s, o = {}) => scopeLines(g, t, { x0: o.x0 ?? DOOR.x1 + 20, x1: o.x1 ?? WIN.x0 - 34, y0: o.y0 ?? 430, y1: o.y1 ?? 900, n: o.n || 6, amp: o.amp || 70,
  smooth: smoothAt(t), alpha: linesAlpha(t) * (o.la ?? 1), ls: s, clip: o.clip, core: '236,206,140', sep: .25 });
function shotD(g, t) {   // 14–22 bedroom at night, he wakes, the voice outside
  const s = lerp(1.0, 1.1, ss(seg(t, 14, 22)));
  const up = ss(seg(t, 15.0, 16.3)), turn = ss(seg(t, 17.2, 18.4)), ph = t > 15.6 ? clamp((t - 15.6) * 4) : 0;
  cam(g, lerp(560, 640, ss(seg(t, 14, 22))), lerp(1010, 980, ss(seg(t, 14, 22))), s);
  bedroomWall(g, t, {}); nightLight(g, t, {}); bedroomWindow(g, t, { figure: false });
  const reach = WIN.x0 - 34 - 1000 * ss(seg(t, 17.95, 18.9));      // the mother's voice comes in through the window, leftward
  if (t > 17.95) wallLines(g, t, s, { x0: -60, clip: P2(q => q.rect(reach, -200, 2000, 2400)) });
  const py = 1290 - up * 95;
  figLayer(g, q => bed(q, t, { inBed: { up, yaw: lerp(.55, .95, turn), eyes: t < 15.0 ? 'closed' : 'wide', phone: ph } }),
    { dark: .55, glows: ph ? [[610, py, 160, '#cfe0ff', .45 * ph]] : [] });
  if (ph) glow(g, 610, py + 70, 200, '#bcd4ff', .25 * ph);
}
function shotE(g, t) {   // 22–25.8 sitting on the bed edge, the realisation
  const s = lerp(1.5, 1.6, ss(seg(t, 22, 25.8))), look = ss(seg(t, 24.3, 25.3));
  cam(g, 600, 1120, s);
  bedroomWall(g, t, {}); nightLight(g, t, {}); bedroomWindow(g, t, { figure: false });
  wallLines(g, t, s, { x0: 150, y0: 700, y1: 960, n: 5, amp: 55 });
  figLayer(g, q => { bed(q, t, {}); emreSitting(q, 560, 1330, 46, { yaw: lerp(.2, .85, look), tilt: lerp(.14, -.04, look), eyes: look > .5 ? 'wide' : 'down', light: lerp(Math.PI / 2, 0, look) }); },
    { dark: .5, glows: [[575, 1110, 170, '#d8e6ff', .5]] });
  glow(g, 575, 1180, 160, '#bcd4ff', .22);
}
function shotF(g, t) {   // 25.8–29 the phone: 03:17, Annem — and silence
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(F_BG, 0, 0);
  scopeLines(g, t, { x0: -40, x1: W + 40, y0: 240, y1: 500, n: 5, amp: 60, smooth: 4, alpha: .6, ls: 1 });
  shade(g, C.night, .5);
  const k = ss(seg(t, 25.8, 29)), y = lerp(10, -10, k);
  g.save(); g.translate(540, 940 + y); g.rotate(-.06);
  glow(g, 0, 0, 700, '#9fc0ff', .25);
  // hand under the phone
  g.fillStyle = C.skin; g.fill(P2(q => curve(q, [[-260, 520], [-230, 260], [-150, 330], [190, 300], [260, 420], [200, 700], [-200, 760]])));
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fill(P2(q => curve(q, [[-260, 520], [-230, 260], [-180, 380], [-210, 700]])));
  g.fillStyle = '#0d0e10'; g.fill(P2(q => q.roundRect(-205, -400, 410, 800, 54)));
  const sc = g.createLinearGradient(0, -380, 0, 380); sc.addColorStop(0, '#1d2740'); sc.addColorStop(1, '#0b0f1a');
  g.fillStyle = sc; g.fill(P2(q => q.roundRect(-190, -384, 380, 768, 44)));
  g.fillStyle = '#eef2f8'; g.textAlign = 'center'; g.font = '200 132px DejaVuS'; g.fillText('03:17', 0, -210);
  g.font = '28px DejaVuS'; g.fillStyle = 'rgba(238,242,248,.8)'; g.fillText('Dienstag, 18. Juli', 0, -150);
  // notification from Annem with her photo
  g.fillStyle = 'rgba(230,235,245,.16)'; g.fill(P2(q => q.roundRect(-170, -70, 340, 150, 26)));
  g.save(); g.beginPath(); g.arc(-110, 5, 44, 0, TAU); g.clip(); g.fillStyle = '#8fa9c0'; g.fillRect(-160, -45, 100, 100);
  head(g, { x: -110, y: 16, r: 26, yaw: .1, hair: 'long', hairLen: 40, skin: C.skin, eyes: 'open', mouth: 0, mole: true, light: -Math.PI * .7, lightA: .3 });
  g.restore();
  g.textAlign = 'left'; g.fillStyle = '#ffffff'; g.font = 'bold 30px DejaVuS'; g.fillText('Annem', -50, -14);
  g.font = '24px DejaVuS'; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText('İyi geceler oğlum.', -50, 22); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillText('23:04', -50, 54);
  // fingers round the left edge, thumb on the right
  for (let k = 0; k < 4; k++) { const y = 40 + k * 92; g.fillStyle = C.skin; g.fill(P2(q => q.roundRect(-238, y, 62, 70, 30))); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-238, y + 58, 50, 8); }
  g.fillStyle = C.skin; g.fill(P2(q => curve(q, [[160, 430], [214, 250], [250, 262], [236, 470]])));
  g.restore();
}
function shotG(g, t) {   // 29–36 at the window, over his shoulder
  const s = lerp(1.75, 1.95, ss(seg(t, 29, 36)));
  const cx = lerp(860, 885, ss(seg(t, 29, 36))), cy = lerp(780, 745, ss(seg(t, 29, 36)));
  cam(g, cx, cy, s);
  bedroomWall(g, t, {}); nightLight(g, t, { dark: .62 });
  bedroomWindow(g, t, { figure: true, lace: ss(seg(t, 29.3, 30.6)), fog: clamp(seg(t, 34.95, 35.25)) * (1 - seg(t, 35.4, 35.95)), par: [(cx - 900) * -.1, 0] });
  wallLines(g, t, s, { x0: 300, y0: 480, y1: 900, n: 5, amp: 55 });
  figLayer(g, q => emreBack(q, 830, 800, 46, { armR: [WIN.x0 + 16, lerp(960, 860, ss(seg(t, 29.3, 30.6)))] }), { dark: .5, glows: [[900, 700, 260, '#9fb6c8', .25]] });
}
function shotH(g, t) {   // 36–42 grandmother from the door: "Schau ihr nicht ins Gesicht."
  const s = 1.3, walk = ss(seg(t, 36.3, 37.9)), grip = ss(seg(t, 37.7, 38.3));
  cam(g, 580, 1060, s);
  const hx = lerp(200, 700, walk), fl = .9 + .1 * Math.sin(t * 23) * (t > 40.6 && t < 41.4 ? 3 : 1), lamp = [hx - 70, 1180];
  bedroomWall(g, t, {}); nightLight(g, t, { dark: .72, lamp: [lamp[0], lamp[1], fl] }); bedroomWindow(g, t, { figure: true, lace: 1 });
  wallLines(g, t, s, { y0: 420, y1: 800 });
  figLayer(g, q => { bed(q, t, {}); emreBack(q, 860, 800, 46, { armR: [WIN.x0 + 16, 860] });
    hatice(q, hx, 935, 44, { yaw: .6, eyes: 'down', lampAt: [hx - 70, 1210], grip: grip > .02 ? [lerp(hx + 60, 790, grip), lerp(1070, 1010, grip)] : null, mouth: t > 38.9 && t < 40.9 ? .12 + .1 * Math.abs(Math.sin(t * 19)) : 0, light: Math.PI }); },
    { dark: .55, glows: [[lamp[0], lamp[1], 520, '#ffb060', .5 * fl]] });
  oilLamp(g, hx - 70, 1210, 40, fl, t);
}
function shotI(g, t) {   // 42–49 through the window: the wrong waveform
  const s = lerp(3.3, 3.8, ss(seg(t, 42, 49)));
  const fig = [(WIN.x0 + WIN.x1) / 2 + (FIGX - 560) * CK, (WIN.y0 + WIN.y1) / 2 + (600 - 700) * CK];
  cam(g, fig[0] - 20, fig[1] + 40, s);
  const tilt = -.5 * ss(seg(t, 42.6, 45.6)), mouth = ss(seg(t, 44.6, 46.2)) * (.75 + .25 * Math.sin(t * 22)) * (t < 48.6 ? 1 : 0);
  bedroomWall(g, t, {}); nightLight(g, t, { dark: .55 });
  bedroomWindow(g, t, { figure: true, tilt, mouth, lace: 1, glassLines: t > 44.7 && t < 48.6 ? .6 : .2, smooth: smoothAt(t), ls: s });
  wallLines(g, t, s, { x0: WIN.x1 + 26, x1: WIN.x1 + 300, y0: 380, y1: 1000, amp: 40 });
  wallLines(g, t, s, { x0: WIN.x0 - 300, x1: WIN.x0 - 26, y0: 380, y1: 1000, amp: 40 });
}
function shotJ(g, t) {   // 49–55.7 the real grandmother at his side, the shadow in the door, the lamp goes out
  const s = lerp(1.3, 1.42, ss(seg(t, 49, 55.7)));
  cam(g, lerp(540, 500, ss(seg(t, 49, 55.7))), 1040, s);
  const sh = .25 + .75 * ss(seg(t, 50.4, 52.4)), turn = ss(seg(t, 54.2, 55.6)), lampK = 1 - ss(seg(t, 54.7, 55.5));
  const fl = lampK * (.95 + .05 * Math.sin(t * 29));
  bedroomWall(g, t, { shadow: sh }); nightLight(g, t, { dark: .74, lamp: [700, 1170, fl] }); bedroomWindow(g, t, { figure: false, lace: 1 });
  wallLines(g, t, s, { y0: 420, y1: 800 });
  figLayer(g, q => { bed(q, t, {}); emreBack(q, 860, 800, 46, { turn, eyes: 'wide', light: Math.PI });
    hatice(q, 765, 905, 44, { yaw: .95, eyes: 'open', tilt: -.12, lean: -.06, lampAt: [700, 1200], mouth: t > 51.4 && t < 55.4 ? .12 + .1 * Math.abs(Math.sin(t * 17)) : 0, light: Math.PI * .9 }); },
    { dark: .55, glows: [[700, 1170, 520, '#ffb060', .5 * fl]] });
  oilLamp(g, 700, 1200, 40, fl, t);
  shade(g, '#000000', .6 * ss(seg(t, 55.0, 55.7)));
}
function shotL(g, t) {   // 56.4–62 the empty booth
  const s = lerp(1.0, 1.06, ss(seg(t, 56.4, 62)));
  cam(g, 560, 960, s);
  boothRoom(g, t, { smooth: 4, ls: s });
  emptyChair(g);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const a1 = ss(seg(t, 56.7, 57.5)), a2 = ss(seg(t, 57.3, 57.8)), a3 = ss(seg(t, 58.0, 58.5));
  g.save(); g.textAlign = 'left'; g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 18;
  g.globalAlpha = a1; g.fillStyle = C.brass; g.font = '600 112px EBG'; g.letterSpacing = '6px'; g.fillText('NACHTARCHIV', 90, 1130);
  g.globalAlpha = a1; g.strokeStyle = rgba(C.gold, .9); g.lineWidth = 2; g.beginPath(); g.moveTo(94, 1162); g.lineTo(94 + 760 * a1, 1162); g.stroke();
  g.letterSpacing = '3px'; g.globalAlpha = a2; g.fillStyle = C.ivory; g.font = '600 48px EBG'; g.fillText('FOLGE UNS.', 94, 1236); g.fillText('DIE NÄCHSTE AKTE WARTET.', 94, 1296);
  g.letterSpacing = '0px'; g.globalAlpha = a3 * .85; g.font = 'italic 500 40px EBG'; g.fillText('Neue Horrorstorys. Jede Nacht.', 94, 1366);
  g.restore();
}

const SHOTS = [[0, 3.4, shotA], [3.4, 7.0, shotB], [7.0, 14.0, shotC], [14.0, 22.0, shotD], [22.0, 25.8, shotE], [25.8, 29.0, shotF],
  [29.0, 36.0, shotG], [36.0, 42.0, shotH], [42.0, 49.0, shotI], [49.0, 55.7, shotJ], [55.7, 56.4, null], [56.4, 62.01, shotL]];

window.render = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const sh = SHOTS.find(s => t >= s[0] && t < s[1]);
  if (sh && sh[2]) { ctx.save(); sh[2](ctx, t); ctx.restore(); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // vignette
  const v = ctx.createRadialGradient(W * .45, H * .45, H * .3, W / 2, H / 2, H * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // fades
  const fade = Math.max(seg(t, 13.6, 14.0) * (t < 14 ? 1 : 0), t >= 14 && t < 14.3 ? 1 - seg(t, 14, 14.3) : 0, t >= 56.4 && t < 56.7 ? 1 - seg(t, 56.4, 56.7) : 0);
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
  // subtitles
  for (const [a, b, s] of SUBS) if (t >= a && t < b) subtitle(ctx, s, Math.min(1, (t - a) / .12, (b - t) / .12), 1450);
};
window.TEXTS = function (t) {
  const out = [];
  if (t >= 25.8 && t < 29) { out.push({ id: 'time', text: '03:17', x0: 330, y0: 620, x1: 750, y1: 760 }, { id: 'name', text: 'Annem', x0: 480, y0: 840, x1: 640, y1: 880 },
    { id: 'msg', text: 'İyi geceler oğlum. 23:04', x0: 480, y0: 880, x1: 760, y1: 1000, pass: true }, { id: 'date', text: 'Dienstag, 18. Juli', x0: 400, y0: 760, x1: 700, y1: 800, pass: true }); }
  if (t >= 57.5 && t < 62) out.push({ id: 'title', text: 'NACHTARCHIV', x0: 90, y0: 1030, x1: 880, y1: 1170 });
  if (t >= 57.8 && t < 62) out.push({ id: 'follow', text: 'FOLGE UNS. DIE NÄCHSTE AKTE WARTET.', x0: 90, y0: 1190, x1: 800, y1: 1310 });
  if (t >= 58.5 && t < 62) out.push({ id: 'tag', text: 'Neue Horrorstorys. Jede Nacht.', x0: 90, y0: 1330, x1: 700, y1: 1380 });
  return out;
};

// ── load ──────────────────────────────────────────────────────────────────────────────
(async function () {
  await Promise.all([...document.fonts].map(f => f.load()));
  WAVES = await (await fetch('waves.json')).json();
  TEXV = makeTex(Math.PI / 2, 11, .25); TEXD = makeTex(Math.PI / 3.4, 12, .3);
  const sitBias = (X, Y) => (Y > 1250 ? .05 : 0) + (X < 200 ? .03 : 0) + (Math.hypot(X - 800, Y - 300) < 300 ? .03 : 0);
  SIT_WALL = wornWall([-150, -150, W + 150, 1600], 3, { S: 1.1, cover: .2, floor: 1560, bias: sitBias, cracks: 12 });
  const bedBias = (X, Y) => (Y > 1200 ? .04 : 0) + (Math.hypot(X - 520, Y - 420) < 260 ? .06 : 0) + (X > 1050 ? .04 : 0);
  BED_WALL = wornWall([-150, -150, 1250, 1620], 7, { S: 1.35, cover: .22, floor: 1600, bias: bedBias, cracks: 16 });
  // blurred wall for the phone insert
  F_BG = cnv(W, H); { const g = F_BG.getContext('2d'); g.filter = 'blur(10px)'; g.setTransform(2.2, 0, 0, 2.2, W / 2 - 400 * 2.2, H / 2 - 700 * 2.2); drawBitmap(g, BED_WALL); }
  FL = cnv(W, H); FLg = FL.getContext('2d');
  window.READY = true;
})();
