// NACHTARCHIV · Akte 001 (v2) „Die Stimme vor der Tür“ · Peeling Wall & Gold Broadcast Booth · 1080×1920, 30 fps
// Oma tells → 1974 is shown (sepia) → Emre lives it in the same room → cliffhanger.
'use strict';
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
let TL, SUBS, VOICE_DUR, SIT_WALL, BED_WALL, HALL_WALL, FL, FLg, TMP, TMPg, BLUR_SIT, BLUR_BED;
window.DUR = 74.6;

// ── helpers ────────────────────────────────────────────────────────────────────────────
function rectPath(r, pad = 0) { return P2(q => q.rect(r.x0 - pad, r.y0 - pad, r.x1 - r.x0 + 2 * pad, r.y1 - r.y0 + 2 * pad)); }
function cam(g, cx, cy, s, sh = [0, 0]) { g.setTransform(s, 0, 0, s, W / 2 - cx * s + sh[0], H / 2 - cy * s + sh[1]); }
// shocks: [time, strength]; shake and punch-in decay after each
const SHOCKS = [[0.0, .6], [6.4, .5], [19.4, .6], [23.4, .7], [47.3, .8], [48.3, .7], [50.0, .6], [56.2, 1.0], [59.6, .55], [59.95, .6], [60.3, .7], [66.8, 1.0]];
function shake(t) { let x = 0, y = 0; for (const [a, k] of SHOCKS) { const d = t - a; if (d < 0 || d > .8) continue; const e = k * Math.exp(-d * 6) * 26; x += Math.sin(d * 71 + a) * e; y += Math.cos(d * 59 + a * 3) * e; } return [x, y]; }
function punch(t) { let p = 1; for (const [a, k] of SHOCKS) { const d = t - a; if (d < 0 || d > 1.2) continue; p += k * .09 * Math.exp(-d * 4); } return p; }
const speaking = (id, t) => { const a = TL.voice[id]; return a !== undefined && t >= a && t <= a + (VOICE_DUR[id] || 0) * (id === 'l17' || id === 'l07' ? 1 / 1.16 : 1); };
const mouthFor = (ids, t) => ids.some(i => speaking(i, t)) ? clamp(rmsAt(t) * 2.2) * .55 : 0;
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
const linesCore = '236,206,140';
function lines(g, t, o) { scopeLines(g, t, Object.assign({ n: 6, amp: 70, smooth: o.smooth ?? (o.spiky ? 1 : 3), alpha: .8, core: linesCore, sep: .25 }, o)); }

// ── sets ───────────────────────────────────────────────────────────────────────────────
const WIN = { x0: 760, y0: 380, x1: 1040, y1: 1000 };       // bedroom window (to the courtyard)
const SWIN = { x0: 650, y0: 330, x1: 960, y1: 880 };        // Oma's room window
const DOOR = { x0: 70, y0: 560, x1: 300, y1: 1600 };
const FRONT = { x0: 300, y0: 520, x1: 780, y1: 1620 };      // the front door
const SWEATER = '#3b3d40', TROUSERS = '#1b1c1e', CARDIGAN = '#1c1a19', SKIRT = '#2b2520', SCARF = '#5a3a22';

function windowFrame(g, r) {
  const fw = 22, col = '#6f8ea3';
  g.fillStyle = '#3c4e5a'; g.fillRect(r.x0 - fw - 6, r.y0 - fw - 6, r.x1 - r.x0 + 2 * fw + 12, 8);
  g.strokeStyle = col; g.lineWidth = fw; g.strokeRect(r.x0 - fw / 2, r.y0 - fw / 2, r.x1 - r.x0 + fw, r.y1 - r.y0 + fw);
  const mx = (r.x0 + r.x1) / 2, my = lerp(r.y0, r.y1, .42);
  g.lineWidth = 12; g.beginPath(); g.moveTo(mx, r.y0); g.lineTo(mx, r.y1); g.moveTo(r.x0, my); g.lineTo(r.x1, my); g.stroke();
  g.fillStyle = '#5c7484'; g.fillRect(r.x0 - fw - 14, r.y1 + fw - 4, r.x1 - r.x0 + 2 * fw + 28, 18);
}
function lace(g, r, open, a = .4) {
  const w = (r.x1 - r.x0) * lerp(.48, .16, open), x = r.x0;
  const p = P2(q => { q.moveTo(x, r.y0); q.lineTo(x + w, r.y0); for (let i = 0; i <= 12; i++) q.lineTo(x + w + Math.sin(i * 1.7) * 6 - open * 20 * (i / 12), lerp(r.y0, r.y1 + 30, i / 12)); q.lineTo(x, r.y1 + 30); q.closePath(); });
  g.fillStyle = `rgba(232,230,222,${a * .55})`; g.fill(p);
  g.save(); g.clip(p); g.strokeStyle = `rgba(250,248,240,${a * .5})`; g.lineWidth = 1.5;
  for (let y = r.y0 + 10; y < r.y1 + 30; y += 22) for (let xx = x + 8; xx < x + w; xx += 22) { g.beginPath(); g.arc(xx + (y / 22 % 2) * 11, y, 6, 0, TAU); g.stroke(); }
  g.restore();
}
function floor(g, y) { g.fillStyle = '#2a1d14'; g.fillRect(-400, y, W + 800, 900); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(-400, y + 18 + k * k * 9); g.lineTo(W + 400, y + 18 + k * k * 9); g.stroke(); } g.fillStyle = '#1c130c'; g.fillRect(-400, y - 14, W + 800, 16); }
function oilLamp(g, x, y, s, k, t) {
  g.fillStyle = '#8a6a34'; g.beginPath(); g.ellipse(x, y + s * .55, s * .5, s * .2, 0, 0, TAU); g.fill();
  g.fillStyle = '#b08a46'; g.fill(P2(q => curve(q, [[x - s * .45, y + s * .5], [x - s * .5, y + s * .1], [x, y - s * .1], [x + s * .5, y + s * .1], [x + s * .45, y + s * .5]])));
  g.fillStyle = 'rgba(220,230,235,.18)'; g.fill(P2(q => curve(q, [[x - s * .18, y - s * .05], [x - s * .32, y - s * .5], [x - s * .14, y - s * 1.2], [x + s * .14, y - s * 1.2], [x + s * .32, y - s * .5], [x + s * .18, y - s * .05]])));
  if (k > .01) { const f = k * (1 + .12 * Math.sin(t * 31) + .08 * Math.sin(t * 17.3));
    glow(g, x, y - s * .45, s * 6 * k, '#ffb24a', .55 * k);
    g.fillStyle = '#ffd27a'; g.beginPath(); g.ellipse(x, y - s * .42, s * .09 * f, s * .28 * f, 0, 0, TAU); g.fill();
    g.fillStyle = '#fff4d0'; g.beginPath(); g.ellipse(x, y - s * .36, s * .04 * f, s * .12 * f, 0, 0, TAU); g.fill(); }
}
function wallClock(g, x, y, r, hh, mm) {
  g.fillStyle = '#3a2716'; g.beginPath(); g.arc(x, y, r * 1.12, 0, TAU); g.fill();
  g.fillStyle = '#d8ccb0'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.strokeStyle = '#2a1d12'; g.lineWidth = r * .04; for (let k = 0; k < 12; k++) { const a = k * TAU / 12; g.beginPath(); g.moveTo(x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8); g.lineTo(x + Math.cos(a) * r * .92, y + Math.sin(a) * r * .92); g.stroke(); }
  const ha = (hh % 12 + mm / 60) / 12 * TAU - Math.PI / 2, ma = mm / 60 * TAU - Math.PI / 2;
  g.lineCap = 'round'; g.lineWidth = r * .07; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ha) * r * .5, y + Math.sin(ha) * r * .5); g.stroke();
  g.lineWidth = r * .045; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ma) * r * .78, y + Math.sin(ma) * r * .78); g.stroke();
}

// the courtyard, seen through a window; CK world units per courtyard unit
const CK = .55, FIGX = 655;
function courtyard(g, t, o) {
  const day = o.day || 0;
  const sky = g.createLinearGradient(0, -400, 0, 400); sky.addColorStop(0, day ? '#8fa6b4' : '#0b1220'); sky.addColorStop(1, day ? '#c9cfc8' : '#22303e');
  g.fillStyle = sky; g.fillRect(-600, -600, 2400, 1100);
  if (!day) { glow(g, 260, 60, 320, '#9fb6c8', .35); g.fillStyle = '#d9e2e4'; g.beginPath(); g.arc(260, 60, 26, 0, TAU); g.fill(); }
  g.fillStyle = day ? '#6d7472' : '#1a2026'; g.fill(P2(q => poly(q, [[-600, 300], [150, 280], [150, 240], [420, 240], [420, 270], [1800, 250], [1800, 420], [-600, 420]])));
  g.fillStyle = day ? '#8f9692' : '#3e4a52'; g.fillRect(-600, 330, 2400, 330);
  for (let i = -12; i < 40; i++) for (let j = 0; j < 7; j++) { g.fillStyle = `rgba(${h2(i, j) < .5 ? '40,48,54' : '78,90,96'},${.12 + .1 * h2(j, i)})`; g.fillRect(i * 52 + (j % 2) * 26, 334 + j * 46, 48, 42); }
  g.fillStyle = day ? '#4a382a' : '#231a14'; g.fillRect(660, 420, 190, 240);
  const gr = g.createLinearGradient(0, 660, 0, 1400); gr.addColorStop(0, day ? '#8d918b' : '#47535a'); gr.addColorStop(1, day ? '#6b6e69' : '#262e33');
  g.fillStyle = gr; g.fillRect(-600, 660, 2400, 900);
  g.strokeStyle = 'rgba(15,20,22,.45)'; g.lineWidth = 3;
  for (let j = 0; j < 9; j++) { const y = 660 + j * j * 10 + j * 30; g.beginPath(); g.moveTo(-600, y); g.lineTo(1800, y); g.stroke(); }
  // mulberry
  g.fillStyle = day ? '#3a3a33' : '#16191a'; g.fill(P2(q => poly(q, [[1010, 1000], [1040, 600], [1000, 420], [1060, 430], [1080, 620], [1070, 1000]])));
  g.fillStyle = day ? '#4d5a40' : '#121618'; g.fill(P2(q => curve(q, [[820, 380], [880, 120], [1100, 40], [1320, 140], [1300, 420], [1080, 500], [900, 470]])));
  // well
  g.fillStyle = day ? '#9a9c94' : '#56636a'; g.beginPath(); g.ellipse(340, 900, 130, 42, 0, 0, TAU); g.fill();
  g.fillStyle = day ? '#7c7e77' : '#3d474d'; g.fillRect(210, 900, 260, 110); g.beginPath(); g.ellipse(340, 1010, 130, 42, 0, 0, Math.PI); g.fill();
  g.fillStyle = '#0a0d0f'; g.beginPath(); g.ellipse(340, 900, 100, 30, 0, 0, TAU); g.fill();
  if (o.prints) {     // wet footprints from the house to the well; they end there
    g.fillStyle = 'rgba(30,34,36,.55)'; for (let k = 0; k < 9; k++) { const u = k / 8, x = lerp(560, 400, u) + (k % 2 ? 14 : -14), y = lerp(1380, 1050, u); g.beginPath(); g.ellipse(x, y, 14, 22, .2, 0, TAU); g.fill(); }
  }
  if (o.shoes) shoes(g, 430, 1060, 1.9, o.wet || 0);
  if (o.yusuf !== undefined) childBack(g, lerp(560, 480, o.yusuf), lerp(1330, 1080, o.yusuf), 22);
  if (o.figure) figureCourt(g, t, o);
  for (let k = 0; k < 7; k++) {   // mist
    const x = ((k * 330 + t * (14 + k * 3)) % 2200) - 500, y = 860 + k * 32;
    const m = g.createRadialGradient(x, y, 0, x, y, 420); m.addColorStop(0, `rgba(190,205,212,${(.16 + .04 * (k % 3)) * (day ? .4 : 1)})`); m.addColorStop(1, 'rgba(190,205,212,0)');
    g.fillStyle = m; g.fillRect(x - 420, y - 140, 840, 280);
  }
}
function shoes(g, x, y, s, wet) {     // a pair of small black rubber shoes
  for (const dx of [-20, 22]) {
    g.fillStyle = '#0d0e10'; g.fill(P2(q => curve(q, [[x + dx * s - 16 * s, y], [x + dx * s - 14 * s, y - 14 * s], [x + dx * s + 4 * s, y - 18 * s], [x + dx * s + 18 * s, y - 8 * s], [x + dx * s + 16 * s, y + 4 * s]])));
    g.fillStyle = 'rgba(200,215,225,.35)'; g.beginPath(); g.ellipse(x + dx * s - 2 * s, y - 13 * s, 6 * s, 2 * s, 0, 0, TAU); g.fill();
    if (wet) { g.fillStyle = `rgba(30,40,46,${.5 * wet})`; g.beginPath(); g.ellipse(x + dx * s, y + 6 * s, 26 * s, 6 * s, 0, 0, TAU); g.fill(); }
  }
}
function childBack(g, x, feet, r) {   // little Yusuf from behind, striped pajamas
  const y = feet - r * 6.2;
  limb(g, [x - r * .35, y + r * 4], [x - r * .4, feet], r * .5, '#c8c0b0'); limb(g, [x + r * .35, y + r * 4], [x + r * .4, feet], r * .5, '#c8c0b0');
  torso(g, [[x - r * .9, y + r * 1.4], [x + r * .9, y + r * 1.4], [x + r * 1, y + r * 4.3], [x - r * 1, y + r * 4.3]], '#d8d0c0');
  g.strokeStyle = 'rgba(90,80,70,.5)'; g.lineWidth = r * .15; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(x - r * .9, y + r * (1.8 + k * .55)); g.lineTo(x + r * .95, y + r * (1.8 + k * .55)); g.stroke(); }
  head(g, { x, y, r, yaw: -1.6, hair: 'buzz', hairCol: '#2a2018' });
}
// the thing at the well; look: 'anne74' (white scarf, pale dress) | 'mama' (long black hair, dark coat) | 'oma' (brown scarf)
function figureCourt(g, t, o) {
  const x = o.fx ?? FIGX, feet = 1000, r = 27, hy = feet - 460 + r, look = o.look || 'mama';
  const dress = look === 'anne74' ? '#b9b2a4' : look === 'oma' ? '#1c1a19' : '#1b1a1d';
  g.save();
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x - 30, feet + 4, 70, 14, 0, 0, TAU); g.fill();
  g.fillStyle = dress; g.fill(P2(q => curve(q, [[x - 44, hy + 58], [x + 44, hy + 58], [x + 58, hy + 200], [x + 74, feet - 30], [x + 40, feet - 8], [x - 40, feet - 8], [x - 74, feet - 30], [x - 58, hy + 200]])));
  g.fillStyle = 'rgba(160,180,190,.14)'; g.fill(P2(q => curve(q, [[x - 44, hy + 58], [x - 8, hy + 60], [x - 20, feet - 10], [x - 74, feet - 30], [x - 58, hy + 200]])));
  for (const s of [-1, 1]) { g.fillStyle = dress; g.fill(P2(q => poly(q, [[x + s * 40, hy + 62], [x + s * 56, hy + 66], [x + s * 60, hy + 230], [x + s * 44, hy + 230]]))); g.fillStyle = C.skinPale; g.beginPath(); g.ellipse(x + s * 52, hy + 244, 9, 16, 0, 0, TAU); g.fill(); }
  g.fillStyle = C.skinPale; g.beginPath(); g.ellipse(x - 18, feet - 4, 13, 6, 0, 0, TAU); g.ellipse(x + 18, feet - 4, 13, 6, 0, 0, TAU); g.fill();
  g.translate(x, hy + 40); g.rotate(o.tilt || 0); g.translate(-x, -(hy + 40));
  glow(g, x, hy, r * 3, '#c8d6e0', .2);
  const hair = look === 'mama' ? 'long' : look === 'anne74' ? 'scarfW' : 'scarf';
  head(g, { x, y: hy + (o.down || 0) * 10, r, yaw: o.yaw || 0, tilt: (o.down || 0) * .5, hair, hairLen: r * 7.2, scarf: look === 'oma' ? SCARF : undefined, skin: '#d6c4b6', eyes: 'shadow', mouth: o.mouth || 0, mole: look === 'mama', light: -Math.PI * .75, lightA: .75, age: look === 'oma' });
  g.restore();
}

// ── figures ──────────────────────────────────────────────────────────────────────────────
function torso(g, pts, col) { g.fillStyle = col; g.fill(P2(q => curve(q, pts))); }
function limb(g, a, b, w, col) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
function hand(g, x, y, r, skin = C.skin) { g.fillStyle = skin; g.beginPath(); g.ellipse(x, y, r, r * 1.25, 0, 0, TAU); g.fill(); }
function emreBack(g, x, y, r, o = {}) {
  const sh = r * 2.6;
  limb(g, [x - r * .7, y + r * 9.5], [x - r * .65, y + r * 14], r * .8, TROUSERS); limb(g, [x + r * .7, y + r * 9.5], [x + r * .65, y + r * 14], r * .8, TROUSERS);
  torso(g, [[x - sh / 2, y + r * 1.9], [x + sh / 2, y + r * 1.9], [x + sh / 2 + r * .2, y + r * 4], [x + r * 1.15, y + r * 6.6], [x + r * 1.2, y + r * 10], [x - r * 1.2, y + r * 10], [x - r * 1.15, y + r * 6.6], [x - sh / 2 - r * .2, y + r * 4]], SWEATER);
  if (o.armL) { limb(g, [x - sh / 2 + r * .15, y + r * 2.4], o.armL, r * .78, SWEATER); hand(g, o.armL[0], o.armL[1], r * .3); } else limb(g, [x - sh / 2 + r * .15, y + r * 2.4], [x - sh / 2, y + r * 6.6], r * .78, SWEATER);
  if (o.armR) { limb(g, [x + sh / 2 - r * .15, y + r * 2.4], o.armR, r * .78, SWEATER); hand(g, o.armR[0], o.armR[1], r * .3); } else limb(g, [x + sh / 2 - r * .15, y + r * 2.4], [x + sh / 2 + r * .1, y + r * 6.6], r * .78, SWEATER);
  head(g, { x, y, r, yaw: o.turn ? lerp(-1.6, -.75, o.turn) : -1.6, hair: 'short', beard: true, eyes: 'wide', light: o.light ?? 0, lightA: .65 });
}
function emreSitFloor(g, x, y, r, o = {}) {   // cross-legged on a floor cushion, turned toward Oma (viewer's left)
  g.fillStyle = '#6a3a24'; g.fill(P2(q => q.roundRect(x - r * 2.2, y + r * 6.6, r * 4.4, r * 1.4, r * .5)));
  torso(g, [[x - r * 2.2, y + r * 6.4], [x + r * 2.2, y + r * 6.4], [x + r * 2.4, y + r * 7.4], [x - r * 2.4, y + r * 7.4]], TROUSERS);
  torso(g, [[x - r * 1.2, y + r * 1.8], [x + r * 1.25, y + r * 1.8], [x + r * 1.3, y + r * 4], [x + r * 1.1, y + r * 6.8], [x - r * 1.1, y + r * 6.8], [x - r * 1.3, y + r * 4]], SWEATER);
  const wr = o.wrist || [x - r * 1.4, y + r * 5.2];
  limb(g, [x - r * 1.0, y + r * 2.2], [x - r * 1.5, y + r * 4.4], r * .7, SWEATER); limb(g, [x - r * 1.5, y + r * 4.4], wr, r * .62, SWEATER); hand(g, wr[0], wr[1], r * .27);
  limb(g, [x + r * 1.0, y + r * 2.2], [x + r * 1.4, y + r * 4.6], r * .7, SWEATER); limb(g, [x + r * 1.4, y + r * 4.6], [x + r * .6, y + r * 5.4], r * .62, SWEATER);
  g.fillStyle = '#0d0e10'; g.fillRect(x + r * .3, y + r * 5.0, r * .5, r * .8); hand(g, x + r * .55, y + r * 5.6, r * .25);
  head(g, { x, y, r, yaw: o.yaw ?? -.5, hair: 'short', beard: true, eyes: o.eyes || 'open', smile: o.smile || 0, mouth: o.mouth || 0, light: Math.PI * .95, lightA: .6 });
}
function emreBed(g, t, o) {
  const up = o.up || 0, x = 520 + up * 30, y = 1300 - up * 95, r = 44;
  if (up > .05) torso(g, [[x - r * 1.0, y + r * 1.4], [x + r * 1.3, y + r * 1.6], [x + r * 1.6, y + r * 3.4], [x - r * .6, y + r * 3.4]], SWEATER);
  head(g, { x, y, r, yaw: o.yaw ?? .55, tilt: lerp(-1.25, -.1, ss(up)), hair: o.hair || 'short', hairCol: o.hairCol, beard: o.beard ?? true, eyes: o.eyes || 'closed', light: 0, lightA: .7, skin: o.skin });
}
function hatice(g, x, y, r, o = {}) {   // Oma standing/sitting body with headscarf
  g.save();
  torso(g, [[x - r * 1.2, y + r * 5.5], [x + r * 1.2, y + r * 5.5], [x + r * 1.5, y + r * (o.sit ? 9 : 13)], [x - r * 1.5, y + r * (o.sit ? 9 : 13)]], SKIRT);
  torso(g, [[x - r * 1.05, y + r * 1.6], [x + r * 1.05, y + r * 1.6], [x + r * 1.25, y + r * 4], [x + r * 1.3, y + r * 7], [x - r * 1.3, y + r * 7], [x - r * 1.25, y + r * 4]], CARDIGAN);
  const g1 = o.grip || [x - r * .6, y + r * 6];
  limb(g, [x + r * .9, y + r * 2.2], [lerp(x + r * .9, g1[0], .5), lerp(y + r * 4, g1[1], .5)], r * .6, CARDIGAN); limb(g, [lerp(x + r * .9, g1[0], .5), lerp(y + r * 4, g1[1], .5)], g1, r * .55, CARDIGAN); hand(g, g1[0], g1[1], r * .26, C.skinOld);
  g.fillStyle = '#2a1a10'; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(g1[0] - r * .3 + k * r * .1, g1[1] + r * .32 + Math.sin(k) * r * .05, r * .05, 0, TAU); g.fill(); }
  limb(g, [x - r * .9, y + r * 2.2], [x - r * 1.1, y + r * 5.6], r * .6, CARDIGAN); hand(g, x - r * 1.0, y + r * 5.9, r * .24, C.skinOld);
  head(g, { x, y, r, yaw: o.yaw ?? .5, hair: 'scarf', scarf: SCARF, skin: C.skinOld, age: true, eyes: o.eyes || 'open', mouth: o.mouth || 0, light: o.light ?? Math.PI * .8, lightA: .7, brow: o.brow ?? 1, look: o.look || 0 });
  g.restore();
}

// ── rooms ────────────────────────────────────────────────────────────────────────────────
function omaRoom(g, t, o) {   // night; divan left (where she tells the story), her iron bed right, lamp, clock
  drawBitmap(g, SIT_WALL);
  g.save(); g.clip(rectPath(SWIN));
  if (o.yard) { g.translate((SWIN.x0 + SWIN.x1) / 2, (SWIN.y0 + SWIN.y1) / 2); g.scale(CK * .9, CK * .9); g.translate(-500, -760); courtyard(g, t, o.yard); }
  else { const sky = g.createLinearGradient(0, SWIN.y0, 0, SWIN.y1); sky.addColorStop(0, '#0c1424'); sky.addColorStop(1, '#1f2a3a'); g.fillStyle = sky; g.fillRect(SWIN.x0, SWIN.y0, 400, 600); }
  g.restore();
  g.save(); g.filter = 'brightness(0.6)'; windowFrame(g, SWIN); g.restore(); lace(g, SWIN, .1, .35);
  wallClock(g, 250, 560, 64, 11, 58 + (t > 27 ? 1 : 0));
  floor(g, 1560);
  g.fillStyle = '#5b2a1e'; g.fillRect(30, 1240, 440, 130); g.fillStyle = '#3a1a12'; g.fillRect(30, 1370, 440, 190);
  g.strokeStyle = 'rgba(205,160,90,.5)'; g.lineWidth = 4; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(50 + i * 62, 1250); g.lineTo(80 + i * 62, 1290); g.lineTo(50 + i * 62, 1330); g.stroke(); }
  g.fillStyle = '#6a3a24'; g.fill(P2(q => q.roundRect(40, 1110, 170, 150, 30)));
  // iron bed
  g.strokeStyle = '#1c1c1e'; g.lineWidth = 10; g.beginPath(); g.moveTo(700, 1560); g.lineTo(700, 1180); g.moveTo(1070, 1560); g.lineTo(1070, 1240); g.stroke();
  for (let k = 0; k < 6; k++) { g.lineWidth = 4; g.beginPath(); g.moveTo(712 + k * 9, 1200); g.lineTo(712 + k * 9, 1330); g.stroke(); }
  g.fillStyle = '#d9d4c8'; g.fillRect(700, 1330, 380, 60);
  if (o.empty) { g.fillStyle = '#e6e0d2'; g.fill(P2(q => curve(q, [[760, 1335], [900, 1290], [1060, 1330], [1050, 1400], [770, 1400]]))); g.fillStyle = '#2a1a10'; for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(760 + k * 9, 1325 + Math.sin(k) * 4, 4, 0, TAU); g.fill(); } }
  else { g.fillStyle = '#e6e0d2'; g.fillRect(760, 1320, 310, 60); }
  g.fillStyle = 'rgba(0,0,0,.85)'; g.fillRect(700, 1390, 380, 170);      // the dark under the bed
  texture(g, P2(q => q.rect(30, 1110, 1050, 450)), TEXV, .8);
}
function bedroomWall(g, t, o) {
  drawBitmap(g, BED_WALL);
  g.fillStyle = '#0d1115'; g.fillRect(DOOR.x0, DOOR.y0, DOOR.x1 - DOOR.x0, DOOR.y1 - DOOR.y0);
  const hall = g.createLinearGradient(DOOR.x0, 0, DOOR.x1, 0); hall.addColorStop(0, 'rgba(70,86,100,.4)'); hall.addColorStop(1, 'rgba(110,128,140,.7)');
  g.fillStyle = hall; g.fillRect(DOOR.x0, DOOR.y0, DOOR.x1 - DOOR.x0, DOOR.y1 - DOOR.y0);
  g.strokeStyle = '#2b1e14'; g.lineWidth = 20; g.strokeRect(DOOR.x0 - 10, DOOR.y0 - 10, DOOR.x1 - DOOR.x0 + 20, DOOR.y1 - DOOR.y0 + 10);
  floor(g, 1600);
  g.fillStyle = '#3a2716'; g.fillRect(330, 1300, 90, 300); g.fillStyle = '#4c341d'; g.fillRect(325, 1292, 100, 14);
}
function bedroomWindow(g, t, o) {
  g.save(); g.clip(rectPath(WIN));
  g.translate((WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2); g.scale(CK, CK); g.translate(-560, -700);
  courtyard(g, t, o); g.restore();
  if (o.glass) for (const [a, b] of [[WIN.y0 + 20, 520], [880, WIN.y1 - 10]]) lines(g, t, { x0: WIN.x0, x1: WIN.x1, y0: a, y1: b, n: 3, amp: 40, alpha: o.glass, clip: rectPath(WIN), ls: o.ls, spiky: true });
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
}
function floorBed(g, t) {   // 1974: the mattress on the floor where little Hatice sleeps next to Anne
  g.fillStyle = '#cfc8b8'; g.fill(P2(q => q.roundRect(110, 1470, 640, 90, 20)));
  head(g, { x: 230, y: 1478, r: 30, yaw: .4, tilt: -1.3, hair: 'braid', eyes: 'wide', light: 0 });
  head(g, { x: 430, y: 1472, r: 34, yaw: .2, tilt: -1.4, hair: 'scarfW', eyes: 'closed', light: 0 });
  g.fillStyle = '#e1d9c8'; g.fill(P2(q => curve(q, [[260, 1490], [400, 1470], [560, 1480], [740, 1490], [740, 1560], [260, 1560]])));
}
function nightLight(g, t, o) {
  shade(g, C.night, o.dark ?? .7);
  g.save(); g.globalCompositeOperation = 'screen';
  const mp = P2(q => poly(q, [[WIN.x0, WIN.y0], [WIN.x1, WIN.y0], [WIN.x1 - 120, 1600], [WIN.x0 - 520, 1600]]));
  const mg = g.createLinearGradient(WIN.x0, WIN.y0, WIN.x0 - 300, 1600); mg.addColorStop(0, 'rgba(110,135,160,.2)'); mg.addColorStop(1, 'rgba(110,135,160,0)');
  g.fillStyle = mg; g.fill(mp); g.restore();
  if (o.lamp) glow(g, o.lamp[0], o.lamp[1], 620 * o.lamp[2], '#ffa64a', .42 * o.lamp[2]);
}
function hallWall(g, t, o) {
  drawBitmap(g, HALL_WALL);
  floor(g, 1620);
  const open = o.open || 0, kn = o.knock || 0;
  const dx = Math.sin(t * 90) * kn * 3;
  // outside, through the opening door: night mist, the threshold
  g.fillStyle = '#0b1016'; g.fillRect(FRONT.x0, FRONT.y0, FRONT.x1 - FRONT.x0, FRONT.y1 - FRONT.y0);
  if (open > 0) {
    const m = g.createLinearGradient(0, FRONT.y0, 0, FRONT.y1); m.addColorStop(0, '#16202a'); m.addColorStop(1, '#3b4852'); g.fillStyle = m; g.fillRect(FRONT.x0, FRONT.y0, FRONT.x1 - FRONT.x0, FRONT.y1 - FRONT.y0);
    if (o.legs) {   // tall, thin, grey feet and the wet hem of a pale dress: not a child
      g.fillStyle = '#8d8a86'; for (const lx of [600, 680]) { g.fill(P2(q => poly(q, [[lx - 9, 1150], [lx + 9, 1150], [lx + 11, 1470], [lx + 30, 1480], [lx - 10, 1480], [lx - 10, 1470]]))); }
      g.fillStyle = '#7f7a70'; g.fill(P2(q => poly(q, [[575, 400], [715, 400], [770, 1150], [748, 1172], [730, 1150], [705, 1186], [680, 1152], [650, 1190], [626, 1150], [598, 1182], [575, 1150], [552, 1178], [530, 1150]])));

      g.strokeStyle = 'rgba(160,180,190,.5)'; g.lineWidth = 2; for (let k = 0; k < 6; k++) { const x = 560 + k * 38, y0 = 1180 + (t * 300 + k * 90) % 300; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + 18); g.stroke(); }
    }
    shoes(g, 600, 1590, 2.8, 1);
    glow(g, 540, 1300, 500, '#9fb6c8', .15);
  }
  // the door: heavy planks, opening inward (it narrows toward the hinge on the left)
  const w = (FRONT.x1 - FRONT.x0) * (1 - open * .82);
  const door = P2(q => poly(q, [[FRONT.x0 + dx, FRONT.y0 - open * 30], [FRONT.x0 + w + dx, FRONT.y0], [FRONT.x0 + w + dx, FRONT.y1], [FRONT.x0 + dx, FRONT.y1 + open * 30]]));
  g.fillStyle = '#3a2716'; g.fill(door);
  g.save(); g.clip(door); g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 4; for (let k = 1; k < 6; k++) { const x = FRONT.x0 + w * k / 6 + dx; g.beginPath(); g.moveTo(x, FRONT.y0 - 40); g.lineTo(x, FRONT.y1 + 40); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(FRONT.x0 - 10, 820, 1000, 26); g.fillRect(FRONT.x0 - 10, 1320, 1000, 26); g.restore();
  if (open < .3) { g.fillStyle = '#7a6a4a'; g.beginPath(); g.arc(FRONT.x0 + w - 60 + dx, 1090, 16, 0, TAU); g.fill(); g.fillStyle = '#0a0a0a'; g.fillRect(FRONT.x0 + w - 66 + dx, 1120, 12, 30); }
  g.strokeStyle = '#2b1e14'; g.lineWidth = 26; g.strokeRect(FRONT.x0 - 13, FRONT.y0 - 13, FRONT.x1 - FRONT.x0 + 26, FRONT.y1 - FRONT.y0 + 13);
  // moonlight under the door; two small feet cut the light
  if (open < .02) { g.fillStyle = 'rgba(160,185,200,.55)'; g.fillRect(FRONT.x0, FRONT.y1 - 8, FRONT.x1 - FRONT.x0, 8);
    if (o.feet) { g.fillStyle = `rgba(0,0,0,${o.feet})`; g.fillRect(500, FRONT.y1 - 8, 40, 8); g.fillRect(560, FRONT.y1 - 8, 40, 8); } }
  if (kn > 0) for (let k = 0; k < 14; k++) { g.fillStyle = `rgba(200,190,170,${.5 * kn})`; g.fillRect(FRONT.x0 + h2(k, 1) * 480, FRONT.y0 + (t * 600 * (.5 + h2(k, 2))) % 900, 3, 3); }   // dust
  texture(g, door, TEXV, .6);
}

// ── close-ups ──────────────────────────────────────────────────────────────────────────────
function cuBack(g, bmp, cx, cy, s, dark, warm) {   // the room's wall behind a close-up, soft
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(W / 2, H / 2); g.scale(s, s); g.translate(-cx, -cy); g.drawImage(bmp, 0, 0); g.restore();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); shade(g, C.night, dark); if (warm) glow(g, warm[0], warm[1], warm[2], '#ffa64a', warm[3]); g.restore();
}
function omaCU(g, t, o) {
  cuBack(g, BLUR_SIT, 300, 900, 1.6, .55, [80, 1500, 1300, .55]);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (o.lines) lines(g, t, { x0: -40, x1: W + 40, y0: 180, y1: 470, amp: 70, alpha: .75, spiky: o.spiky });
  const s = o.s || 1, sh = o.sh || [0, 0];
  g.setTransform(s, 0, 0, s, W / 2 - 540 * s + sh[0], H / 2 - 960 * s + sh[1]);
  torso(g, [[180, 1150], [900, 1150], [1080, 1500], [1100, 2100], [0, 2100], [20, 1500]], CARDIGAN);
  head(g, { x: 540 + (o.dx || 0), y: 830, r: 215, yaw: o.yaw ?? .22, hair: 'scarf', scarf: SCARF, skin: C.skinOld, age: true, eyes: o.eyes || 'open', look: o.look || 0, mouth: o.mouth || 0, light: Math.PI * .85, lightA: .78, brow: o.brow ?? .5, tears: o.tears || 0, noNeck: true });
  g.setTransform(1, 0, 0, 1, 0, 0); glow(g, 120, 1600, 900, '#ffa64a', .25 + .04 * Math.sin(t * 23));
}
function emreCU(g, t, o) {
  cuBack(g, o.bg || BLUR_SIT, o.bx || 300, o.by || 700, 1.6, o.dark ?? .55, o.warm);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (o.clock) { g.save(); g.translate(250, 420); g.scale(1.7, 1.7); g.filter = 'blur(2px)'; wallClock(g, 0, 0, 64, 11, 59); g.restore(); }
  if (o.lines) lines(g, t, { x0: -40, x1: W + 40, y0: 160, y1: 460, amp: 80, alpha: .8, spiky: o.spiky });
  const s = o.s || 1, sh = o.sh || [0, 0];
  g.setTransform(s, 0, 0, s, W / 2 - 540 * s + sh[0], H / 2 - 960 * s + sh[1]);
  torso(g, [[200, 1160], [880, 1160], [1060, 1500], [1100, 2100], [0, 2100], [30, 1500]], SWEATER);
  head(g, { x: 540, y: 850, r: 200, yaw: o.yaw ?? -.25, hair: 'short', beard: true, eyes: o.eyes || 'open', look: o.look || 0, mouth: o.mouth || 0, smile: o.smile || 0, light: o.light ?? Math.PI * .9, lightA: .75, brow: o.brow || 0, noNeck: true });
  if (o.phone) { g.fillStyle = '#0d0e10'; g.save(); g.translate(240, 860); g.rotate(-.25); g.fill(P2(q => q.roundRect(-60, -170, 120, 300, 18))); g.restore(); hand(g, 250, 960, 62); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (o.glowCol) glow(g, o.glowX || 200, o.glowY || 900, 700, o.glowCol, o.glowA || .3);
}
function phone(g, t, mode) {   // inserts: 'time' (03:16 → 03:17) | 'call' (Annem calling)
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(BLUR_BED, 0, 0); shade(g, C.night, .6);
  lines(g, t, { x0: -40, x1: W + 40, y0: 220, y1: 460, n: 5, amp: 60, alpha: .55, smooth: 3 });
  const sh = shake(t); g.save(); g.translate(540 + sh[0], 960 + sh[1]); g.rotate(-.06); g.scale(punch(t), punch(t));
  glow(g, 0, 0, 700, mode === 'call' ? '#9fe0b0' : '#9fc0ff', .22);
  g.fillStyle = C.skin; g.fill(P2(q => curve(q, [[-260, 520], [-230, 260], [-150, 330], [190, 300], [260, 420], [200, 700], [-200, 760]])));
  g.fillStyle = '#0d0e10'; g.fill(P2(q => q.roundRect(-205, -400, 410, 800, 54)));
  const sc = g.createLinearGradient(0, -380, 0, 380); sc.addColorStop(0, '#1d2740'); sc.addColorStop(1, '#0b0f1a'); g.fillStyle = sc; g.fill(P2(q => q.roundRect(-190, -384, 380, 768, 44)));
  g.textAlign = 'center'; g.fillStyle = '#eef2f8';
  if (mode === 'time') {
    const flip = t >= 33.8; g.font = '200 132px DejaVuS'; g.fillText(flip ? '03:17' : '03:16', 0, -210);
    g.font = '28px DejaVuS'; g.fillStyle = 'rgba(238,242,248,.8)'; g.fillText('Dienstag, 18. Juli', 0, -150);
  } else {
    g.font = '30px DejaVuS'; g.fillStyle = 'rgba(238,242,248,.75)'; g.fillText('Eingehender Anruf', 0, -250);
    g.save(); g.beginPath(); g.arc(0, -110, 90, 0, TAU); g.clip(); g.fillStyle = '#8fa9c0'; g.fillRect(-100, -210, 200, 200);
    head(g, { x: 0, y: -90, r: 56, yaw: .1, hair: 'long', hairLen: 90, skin: C.skin, eyes: 'open', mole: true, smile: .4, light: -Math.PI * .7, lightA: .3, noNeck: false });
    g.restore();
    g.fillStyle = '#ffffff'; g.font = 'bold 54px DejaVuS'; g.fillText('Annem', 0, 50);
    g.font = '26px DejaVuS'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('Mobil', 0, 92);
    const sw = ss(seg(t, 44.3, 44.7));
    g.fillStyle = '#c0392b'; g.beginPath(); g.arc(-100, 270, 46, 0, TAU); g.fill();
    g.fillStyle = '#2ecc71'; g.beginPath(); g.arc(100 - sw * 0, 270, 46 + 6 * Math.abs(Math.sin(t * 8)) * (1 - sw), 0, TAU); g.fill();
    g.fillStyle = C.skin; g.fill(P2(q => curve(q, [[150 - sw * 50, 470], [110 - sw * 40, 300], [150 - sw * 40, 290], [230, 470]])));
  }
  for (let k = 0; k < 4; k++) { const y = 40 + k * 92; g.fillStyle = C.skin; g.fill(P2(q => q.roundRect(-238, y, 62, 70, 30))); }
  g.restore();
}

// ── shots ────────────────────────────────────────────────────────────────────────────────
const SH = {};
SH.A = (g, t) => { omaCU(g, t, { s: lerp(1.0, 1.14, ss(seg(t, 0, 3.9))) * punch(t), sh: shake(t), mouth: mouthFor(['l01'], t), lines: true, eyes: 'open', look: 0, brow: .8 }); };
SH.B = (g, t) => {
  const s = (t < 6.4 ? lerp(1.22, 1.3, ss(seg(t, 3.9, 6.4))) : lerp(1.45, 1.55, ss(seg(t, 6.4, 8.6)))) * punch(t), sh = shake(t);
  cam(g, t < 6.4 ? 430 : 360, t < 6.4 ? 1130 : 1150, s, sh);
  omaRoom(g, t, {}); nightLight(g, t, { dark: .62, lamp: [420, 1190, .95 + .05 * Math.sin(t * 23)] });
  lines(g, t, { x0: -60, x1: SWIN.x0 - 30, y0: 300, y1: 820, amp: 60, ls: s, spiky: speaking('l03', t) });
  const grab = ss(seg(t, 6.3, 6.5));
  figLayer(g, q => {
    emreSitFloor(q, 560, 1040, 40, { yaw: -.55, smile: t < 6.4 ? .55 : 0, mouth: mouthFor(['l02'], t), eyes: t < 6.4 ? 'open' : 'wide', wrist: [lerp(504, 470, grab), lerp(1248, 1240, grab)] });
    hatice(q, 260, 1010, 40, { sit: true, yaw: .55, eyes: 'open', look: .6, mouth: mouthFor(['l03'], t), grip: grab > 0 ? [lerp(240, 470, grab), lerp(1250, 1240, grab)] : null, brow: 1.2 });
  }, { dark: .3, glows: [[420, 1190, 420, '#ffb060', .22]] });
  oilLamp(g, 420, 1225, 36, 1, t);
};
// 1974, sepia (applied in render)
SH.C = (g, t) => {
  const s = lerp(1.0, 1.08, ss(seg(t, 8.6, 13.1)));
  cam(g, 560, 1150, s, shake(t));
  bedroomWall(g, t, {}); nightLight(g, t, { dark: .66 }); bedroomWindow(g, t, { figure: t > 12.2, look: 'anne74', fx: 600 });
  lines(g, t, { x0: DOOR.x1 + 20, x1: WIN.x0 - 34, y0: 430, y1: 900, amp: 60, ls: s });
  figLayer(g, q => { bed(q, t, { inBed: { up: 0, eyes: 'closed', hair: 'buzz', hairCol: '#2a2018', beard: false } }); floorBed(q, t); }, { dark: .45 });
};
SH.D = (g, t) => {
  const s = lerp(2.3, 2.75, ss(seg(t, 13.1, 16.5))), f = [(WIN.x0 + WIN.x1) / 2 + (600 - 560) * CK, (WIN.y0 + WIN.y1) / 2 + (640 - 700) * CK];
  cam(g, f[0], f[1], s, shake(t));
  bedroomWall(g, t, {}); nightLight(g, t, { dark: .6 });
  bedroomWindow(g, t, { figure: true, look: 'anne74', fx: 600, mouth: mouthFor(['l05'], t) * .6, glass: .35, ls: s, lace: .3 });
};
SH.E = (g, t) => {   // top-down on the floor mattress: little Hatice, wide awake; Anne asleep beside her
  g.setTransform(1, 0, 0, 1, 0, 0);
  const s = lerp(1.0, 1.1, ss(seg(t, 16.5, 20.2))) * punch(t), sh = shake(t);
  g.setTransform(s, 0, 0, s, W / 2 - 540 * s + sh[0], H / 2 - 960 * s + sh[1]);
  g.fillStyle = '#cfc8b8'; g.fillRect(-200, -200, 1500, 2400);
  g.fillStyle = '#e6dfcf'; g.fill(P2(q => q.roundRect(80, 560, 920, 520, 60)));     // the pillow
  const turn = ss(seg(t, 17.6, 18.4));
  head(g, { x: 340, y: 800, r: 140, yaw: lerp(-.3, .55, turn), hair: 'braid', eyes: 'wide', look: lerp(0, 1, turn), brow: 1.2, light: -Math.PI / 2, lightA: .5, noNeck: true });
  head(g, { x: 740, y: 840, r: 160, yaw: -.35, hair: 'scarfW', eyes: 'closed', light: -Math.PI / 2, lightA: .5, noNeck: true, age: false });
  g.fillStyle = '#e1d9c8'; g.fill(P2(q => curve(q, [[-100, 1060], [300, 1000], [700, 1040], [1200, 1000], [1200, 2300], [-100, 2300]])));
  g.strokeStyle = 'rgba(150,40,40,.35)'; g.lineWidth = 6; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(80 + i * 120, 1300 + (i % 2) * 40, 22, 0, TAU); g.stroke(); }
  g.setTransform(1, 0, 0, 1, 0, 0); shade(g, '#1c2028', .45); glow(g, 900, 300, 900, '#9fb6c8', .2);
};
SH.F = (g, t) => {   // Yusuf sits up: "Anne?"
  cuBack(g, BLUR_BED, 760, 700, 1.4, .6, null);
  g.setTransform(1, 0, 0, 1, 0, 0); glow(g, 1000, 600, 800, '#9fb6c8', .25);
  const s = lerp(1.0, 1.08, ss(seg(t, 20.2, 21.6))), sh = shake(t);
  g.setTransform(s, 0, 0, s, W / 2 - 540 * s + sh[0], H / 2 - 960 * s + sh[1]);
  torso(g, [[260, 1150], [820, 1150], [960, 1500], [980, 2100], [100, 2100], [120, 1500]], '#d8d0c0');
  g.strokeStyle = 'rgba(90,80,70,.5)'; g.lineWidth = 16; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(120, 1220 + k * 95); g.lineTo(960, 1220 + k * 95); g.stroke(); }
  head(g, { x: 540, y: 860, r: 175, yaw: .35, hair: 'buzz', hairCol: '#2a2018', eyes: 'open', look: .7, mouth: mouthFor(['l07'], t) * 1.4 + (t > 20.6 && t < 20.9 ? .25 : 0), light: 0, lightA: .7, noNeck: true });
};
SH.G = (g, t) => {
  const s = lerp(1.9, 2.1, ss(seg(t, 21.6, 23.4))), f = [(WIN.x0 + WIN.x1) / 2 + (540 - 560) * CK, (WIN.y0 + WIN.y1) / 2 + (800 - 700) * CK];
  cam(g, f[0], f[1], s, shake(t));
  bedroomWall(g, t, {}); nightLight(g, t, { dark: .6 });
  bedroomWindow(g, t, { figure: true, look: 'anne74', fx: 600, yaw: -.6 * ss(seg(t, 22.3, 23.0)), yusuf: ss(seg(t, 21.6, 23.4)), lace: .3 });
};
SH.H = (g, t) => {   // the next morning
  const s = lerp(2.0, 2.6, ss(seg(t, 23.4, 27.0))), f = [(WIN.x0 + WIN.x1) / 2 + (450 - 560) * CK, (WIN.y0 + WIN.y1) / 2 + (1000 - 700) * CK];
  cam(g, f[0] + 30, f[1] - 60, s * punch(t), shake(t));
  bedroomWall(g, t, {}); glow(g, 900, 700, 900, '#fff2d8', .35);
  bedroomWindow(g, t, { day: 1, prints: true, shoes: true, wet: 1, lace: .3 });
  lines(g, t, { x0: WIN.x0 - 300, x1: WIN.x0 - 26, y0: 400, y1: 1000, amp: 40, ls: s });
};
SH.I = (g, t) => { omaCU(g, t, { s: lerp(1.05, 1.18, ss(seg(t, 27.0, 30.4))), sh: shake(t), mouth: mouthFor(['l09'], t), lines: true, look: -.5, brow: 1.4, yaw: .3 }); };
SH.J = (g, t) => { emreCU(g, t, { s: lerp(1.0, 1.12, ss(seg(t, 30.4, 33.0))), sh: shake(t), clock: true, smile: lerp(.4, 0, ss(seg(t, 30.6, 31.6))), eyes: t > 31.8 ? 'wide' : 'open', look: -.6, brow: t > 31.8 ? 1.2 : 0, warm: [100, 1400, 1100, .45], lines: true }); };
SH.K = (g, t) => phone(g, t, 'time');
SH.L = (g, t) => {   // Emre in Yusuf's old bed; his mother's voice outside
  const s = lerp(1.05, 1.3, ss(seg(t, 34.6, 40.2))), up = ss(seg(t, 36.7, 37.7)), turn = ss(seg(t, 37.6, 38.4));
  cam(g, lerp(560, 700, ss(seg(t, 36, 40.2))), lerp(1150, 1000, ss(seg(t, 36, 40.2))), s, shake(t));
  bedroomWall(g, t, {}); nightLight(g, t, { dark: .72 }); bedroomWindow(g, t, { figure: t > 36, look: 'mama' });
  const reach = WIN.x0 - 34 - 1000 * ss(seg(t, 36.05, 37.0));
  if (t > 36.05) lines(g, t, { x0: -60, x1: WIN.x0 - 34, y0: 430, y1: 900, amp: 75, ls: s, spiky: true, clip: P2(q => q.rect(reach, -200, 2000, 2400)) });
  figLayer(g, q => bed(q, t, { inBed: { up, yaw: lerp(.4, .95, turn), eyes: 'wide' } }), { dark: .55 });
};
SH.M = (g, t) => {   // over his shoulder: the figure; he covers his mouth; the phone rings
  const s = lerp(1.8, 2.0, ss(seg(t, 40.2, 43.0))) * punch(t);
  cam(g, 870, 760, s, shake(t));
  bedroomWall(g, t, {}); nightLight(g, t, { dark: .62 });
  bedroomWindow(g, t, { figure: true, look: 'mama', lace: 1 });
  lines(g, t, { x0: 300, x1: WIN.x0 - 30, y0: 480, y1: 900, n: 5, amp: 50, ls: s });
  const cover = ss(seg(t, 40.8, 41.2)), ring = t > 42.4 ? .6 + .4 * Math.abs(Math.sin(t * 9)) : 0;
  figLayer(g, q => emreBack(q, 830, 800, 46, { armL: [lerp(740, 812, cover), lerp(1100, 860, cover)], armR: [920, 1080] }),
    { dark: .5, glows: ring ? [[930, 1080, 300, '#cfe0ff', .5 * ring]] : [] });
  if (ring) glow(g, 930, 1090, 220, '#bcd4ff', .35 * ring);
};
SH.N = (g, t) => phone(g, t, 'call');
SH.O = (g, t) => {
  const froze = t > 47.3;
  emreCU(g, t, { bg: BLUR_BED, bx: 760, by: 800, s: (froze ? lerp(1.1, 1.3, ss(seg(t, 47.3, 48.3))) : lerp(1.0, 1.06, ss(seg(t, 45, 47.3)))) * punch(t), sh: shake(t), phone: true,
    eyes: froze ? 'wide' : 'open', smile: froze ? 0 : .35, mouth: mouthFor(['l12'], t) + (froze ? .12 : 0), brow: froze ? 1.4 : -.3, yaw: .2, look: froze ? .9 : 0, light: 0,
    dark: .62, glowCol: '#bcd4ff', glowX: 180, glowY: 900, glowA: .35, lines: true, spiky: true });
};
SH.P = (g, t) => {   // it lifts its head and speaks with him
  const s = lerp(3.3, 3.7, ss(seg(t, 48.3, 50.0))) * punch(t), f = [(WIN.x0 + WIN.x1) / 2 + (FIGX - 560) * CK, (WIN.y0 + WIN.y1) / 2 + (600 - 700) * CK];
  cam(g, f[0] - 20, f[1] + 40, s, shake(t));
  bedroomWall(g, t, {}); nightLight(g, t, { dark: .55 });
  bedroomWindow(g, t, { figure: true, look: 'mama', down: 1 - ss(seg(t, 48.3, 49.2)), tilt: -.2, mouth: mouthFor(['l13'], t) * 1.5, lace: 1, glass: .5, ls: s });
};
SH.Q = (g, t) => {   // Oma's room: the bed is empty
  const s = lerp(1.25, 1.35, ss(seg(t, 50, 52.2))) * punch(t), run = ss(seg(t, 50.0, 51.0));
  cam(g, 700, 1150, s, shake(t));
  omaRoom(g, t, { empty: true }); nightLight(g, t, { dark: .6, lamp: [420, 1190, 1] });
  lines(g, t, { x0: -60, x1: SWIN.x0 - 30, y0: 300, y1: 820, amp: 70, ls: s, spiky: true });
  figLayer(g, q => emreBack(q, lerp(1100, 860, run), 860, 44, { turn: .6, armR: [lerp(1100, 860, run) + 70, 1100] }), { dark: .35, glows: [[420, 1190, 420, '#ffb060', .22]] });
  oilLamp(g, 420, 1225, 36, 1, t);
};
SH.R = (g, t) => {   // her voice from the courtyard: through her window, the thing wears her scarf
  const s = lerp(1.6, 2.2, ss(seg(t, 52.2, 56.2)));
  cam(g, 800, 800, s, shake(t));
  omaRoom(g, t, { empty: true, yard: { figure: true, look: 'oma', fx: 560, mouth: mouthFor(['l15'], t), tilt: .1 } }); nightLight(g, t, { dark: .6, lamp: [420, 1190, 1] });
  lines(g, t, { x0: 200, x1: SWIN.x0 - 30, y0: 300, y1: 820, amp: 70, ls: s, spiky: true });
  figLayer(g, q => emreBack(q, lerp(860, 780, ss(seg(t, 53.5, 56))), 860, 44, { armR: [900, 1100] }), { dark: .35, glows: [[420, 1190, 420, '#ffb060', .2]] });
};
SH.S = (g, t) => {   // a hand grabs his ankle: Oma, hidden under her bed
  g.setTransform(1, 0, 0, 1, 0, 0);
  const s = (t < 57 ? 1.0 : lerp(1.0, 1.12, ss(seg(t, 57, 59.5)))) * punch(t), sh = shake(t);
  g.setTransform(s, 0, 0, s, W / 2 - 540 * s + sh[0], H / 2 - 960 * s + sh[1]);
  g.fillStyle = '#05070a'; g.fillRect(-200, -200, 1500, 2400);
  g.fillStyle = '#1c1a18'; g.fillRect(-200, 400, 1500, 70); g.strokeStyle = '#111'; g.lineWidth = 14; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(-100 + k * 240, 470); g.lineTo(-100 + k * 240, 380); g.stroke(); }
  const fl = g.createLinearGradient(0, 1300, 0, 2000); fl.addColorStop(0, '#1a120c'); fl.addColorStop(1, '#3a2818'); g.fillStyle = fl; g.fillRect(-200, 1300, 1500, 900);
  g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 4; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(-200, 1330 + k * k * 12); g.lineTo(1300, 1330 + k * k * 12); g.stroke(); }
  // his leg and bare foot on the right (trouser hem, heel, toes)
  g.fillStyle = TROUSERS; g.fill(P2(q => poly(q, [[800, 200], [960, 200], [950, 1360], [810, 1360]])));
  g.fillStyle = '#121214'; g.fillRect(806, 1330, 150, 34);
  g.fillStyle = C.skin; g.fill(P2(q => curve(q, [[818, 1360], [945, 1360], [960, 1420], [1080, 1470], [1090, 1510], [820, 1515], [800, 1440]])));
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fill(P2(q => curve(q, [[818, 1360], [870, 1362], [860, 1510], [820, 1515], [800, 1440]])));
  for (let k = 0; k < 5; k++) { g.fillStyle = C.skin; g.beginPath(); g.ellipse(1040 + k * 11, 1480 - k * 6 + 22, 10 - k, 13 - k, 0, 0, TAU); g.fill(); }
  // her face in the dark under the bed, lit cold from his phone
  const peek = ss(seg(t, 56.4, 57.2));
  g.save(); g.globalAlpha = .25 + .75 * peek;
  head(g, { x: 380, y: 1000, r: 175, yaw: .35, hair: 'scarf', scarf: SCARF, skin: C.skinOld, age: true, eyes: 'wide', look: .8, mouth: mouthFor(['l16'], t), light: -Math.PI * .1, lightA: .85, brow: 1.4, noNeck: true });
  g.restore();
  // her arm out of the dark, the hand closing round his ankle
  const reach = ss(seg(t, 56.15, 56.3)), hx = lerp(600, 830, reach), hy = lerp(1330, 1410, reach);
  g.fillStyle = CARDIGAN; g.fill(P2(q => poly(q, [[470, 1190], [530, 1160], [hx - 10, hy - 40], [hx - 30, hy + 30]])));
  g.fillStyle = C.skinOld; g.fill(P2(q => curve(q, [[hx - 40, hy - 30], [hx + 20, hy - 46], [hx + 60, hy - 20], [hx + 60, hy + 30], [hx, hy + 44], [hx - 40, hy + 20]])));
  for (let k = 0; k < 4; k++) { const fy = hy - 30 + k * 20; g.strokeStyle = C.skinOld; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx + 40, fy); g.quadraticCurveTo(hx + 100 * reach + 30, fy - 10, hx + 120 * reach + 20, fy + 14); g.stroke();
    g.strokeStyle = 'rgba(60,30,20,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(hx + 40, fy + 7); g.lineTo(hx + 90 * reach + 30, fy + 5); g.stroke(); }
  g.setTransform(1, 0, 0, 1, 0, 0); glow(g, 900, 1100, 900, '#bcd4ff', .25); shade(g, '#000', .2);
};
SH.T = (g, t) => {   // the front door: three knocks, a child's voice
  const s = lerp(1.15, 1.35, ss(seg(t, 59.5, 63.4))) * punch(t);
  cam(g, 540, 1150, s, shake(t));
  const kn = Math.max(...[59.6, 59.95, 60.3].map(a => t >= a && t < a + .25 ? 1 - (t - a) / .25 : 0));
  hallWall(g, t, { knock: kn, feet: ss(seg(t, 61.0, 61.6)) });
  shade(g, C.night, .55);
  lines(g, t, { x0: FRONT.x1 + 40, x1: W + 60, y0: 600, y1: 1100, amp: 50, ls: s, spiky: true });
  lines(g, t, { x0: -60, x1: FRONT.x0 - 40, y0: 600, y1: 1100, amp: 50, ls: s, spiky: true });
};
SH.U = (g, t) => {
  if (t < 64.3) omaCU(g, t, { s: lerp(1.15, 1.25, ss(seg(t, 63.4, 64.3))), sh: shake(t), eyes: 'open', look: .7, tears: 1, mouth: mouthFor(['l18'], t) * 1.3, brow: 1.6, yaw: .35 });
  else emreCU(g, t, { bg: BLUR_SIT, s: lerp(1.15, 1.25, ss(seg(t, 64.3, 65.3))), sh: shake(t), eyes: 'wide', mouth: mouthFor(['l19'], t) * 1.6 + .1, brow: 1.6, yaw: -.4, look: -.8, warm: [100, 1500, 1000, .35] });
};
SH.V = (g, t) => {   // the door opens by itself
  const s = lerp(1.3, 1.55, ss(seg(t, 65.3, 67.5))) * punch(t), open = ss(seg(t, 65.45, 66.7)) * .85;
  cam(g, 600, 1330, s, shake(t));
  hallWall(g, t, { open, legs: open > .2 });
  shade(g, C.night, .5);
  if (t > 66.8 && t < 66.9) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(0, 0, W, H); }
};
SH.X = (g, t) => {   // black; the door faintly; PART 2
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const a = .35 * ss(seg(t, 68.4, 70.0));
  if (a > 0) { g.save(); g.globalAlpha = a; cam(g, 560, 1380, 1.55); hallWall(g, t, { open: .85, legs: true }); g.restore(); g.setTransform(1, 0, 0, 1, 0, 0); shade(g, '#000', .35); }
  const b = ss(seg(t, 70.1, 70.6));
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.textAlign = 'center'; g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 20;
  g.globalAlpha = b; g.fillStyle = C.brass; g.font = '600 150px EBG'; g.letterSpacing = '10px'; g.fillText('PART 2', 470, 760);
  g.letterSpacing = '2px'; g.fillStyle = C.ivory; g.font = 'italic 500 46px EBG'; g.fillText('Schreib „PART 2“ in die Kommentare', 470, 850);
  g.globalAlpha = ss(seg(t, 70.6, 71.1)) * .9; g.letterSpacing = '6px'; g.font = '600 40px EBG'; g.fillStyle = C.gold; g.fillText('NACHTARCHIV · AKTE 001', 470, 960);
  g.restore();
};

// ── render ───────────────────────────────────────────────────────────────────────────────
const SEPIA = [8.6, 27.0];
function oldFilm(g, t) {   // 1974: sepia, flicker, scratches, dust (on top of the frame)
  TMPg.setTransform(1, 0, 0, 1, 0, 0); TMPg.filter = 'none'; TMPg.clearRect(0, 0, W, H); TMPg.drawImage(cv, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `sepia(.88) contrast(1.12) brightness(${.86 + .05 * Math.sin(t * 37) * Math.sin(t * 13)})`; g.drawImage(TMP, 0, 0); g.filter = 'none';
  const f = Math.floor(t * 12);
  for (let k = 0; k < 3; k++) { if (h2(f, k) < .5) continue; const x = h2(f, k + 9) * W; g.strokeStyle = `rgba(230,220,200,${.25 + .2 * h2(k, f)})`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (h2(f, k + 3) - .5) * 30, H); g.stroke(); }
  for (let k = 0; k < 16; k++) { g.fillStyle = `rgba(20,14,8,${.5 * h2(f, k + 40)})`; g.beginPath(); g.arc(h2(f, k + 20) * W, h2(f, k + 60) * H, 1 + 2.5 * h2(k, f), 0, TAU); g.fill(); }
  const v = g.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, H * .72); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(30,18,8,.6)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.restore();
}
window.render = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const sh = TL.shots.find(s => t >= s[1] && t < s[2]) || TL.shots[TL.shots.length - 1];
  ctx.save(); SH[sh[0]](ctx, t); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'none';
  if (t >= SEPIA[0] && t < SEPIA[1]) oldFilm(ctx, t);
  const v = ctx.createRadialGradient(W * .45, H * .45, H * .3, W / 2, H / 2, H * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // white flashes into and out of 1974; black drops
  const fl = Math.max(1 - Math.abs(t - 8.62) / .12, 1 - Math.abs(t - 27.02) / .12, 0);
  if (fl > 0) { ctx.fillStyle = `rgba(255,250,240,${fl})`; ctx.fillRect(0, 0, W, H); }
  if (t >= 32.6 && t < 33.0) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
  if (t >= 67.5 && t < 67.6) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
  for (const [a, b, s] of SUBS) if (t >= a && t < b) subtitle(ctx, s, Math.min(1, (t - a) / .08, (b - t) / .08), 1450);
};
window.TEXTS = function (t) {
  const out = [];
  if (t >= 33.0 && t < 34.6) out.push({ id: 'clock', text: t >= 33.8 ? '03:17' : '03:16', x0: 330, y0: 620, x1: 750, y1: 760, pass: true });
  if (t >= 43.0 && t < 45.0) out.push({ id: 'caller', text: 'Annem', x0: 400, y0: 950, x1: 680, y1: 1020 });
  if (t >= 70.6 && t < 74.6) out.push({ id: 'part2', text: 'PART 2', x0: 170, y0: 620, x1: 770, y1: 780 }, { id: 'cta', text: 'Schreib „PART 2“ in die Kommentare', x0: 120, y0: 810, x1: 820, y1: 870, pass: true });
  return out;
};

(async function () {
  await Promise.all([...document.fonts].map(f => f.load()));
  TL = await (await fetch('timeline.json')).json();
  SUBS = await (await fetch('subs.json')).json();
  WAVES = await (await fetch('waves.json')).json();
  VOICE_DUR = await (await fetch('voice/raw/dur.json')).json();
  TEXV = makeTex(Math.PI / 2, 11, .25); TEXD = makeTex(Math.PI / 3.4, 12, .3);
  SIT_WALL = wornWall([-150, -150, W + 150, 1600], 3, { S: 1.1, cover: .17, floor: 1560, bias: (X, Y) => (Y > 1250 ? .05 : 0) + (X < 200 ? .03 : 0), cracks: 12 });
  BED_WALL = wornWall([-150, -150, 1250, 1620], 7, { S: 1.35, cover: .18, floor: 1600, bias: (X, Y) => (Y > 1200 ? .04 : 0) + (Math.hypot(X - 520, Y - 420) < 260 ? .06 : 0), cracks: 16 });
  HALL_WALL = wornWall([-150, -150, W + 150, 1640], 9, { S: 1.1, cover: .2, floor: 1620, bias: (X, Y) => (Y > 1300 ? .06 : 0), cracks: 14 });
  const blurOf = (b, sx, sy, s) => { const c = cnv(W, H), g = c.getContext('2d'); g.filter = 'blur(12px)'; g.setTransform(s, 0, 0, s, W / 2 - sx * s, H / 2 - sy * s); drawBitmap(g, b); return c; };
  BLUR_SIT = blurOf(SIT_WALL, 400, 800, 1.4); BLUR_BED = blurOf(BED_WALL, 500, 700, 1.8);
  // cuBack draws these canvases in screen space: give them world-like placement
  FL = cnv(W, H); FLg = FL.getContext('2d'); TMP = cnv(W, H); TMPg = TMP.getContext('2d');
  window.READY = true;
})();
