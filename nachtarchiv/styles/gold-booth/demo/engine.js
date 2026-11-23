// Peeling Wall & Gold Broadcast Booth · engine (canvas 2D)
// Brush texture field, tufted gold wall, worn grey-green wall, light helpers, figures' heads,
// oscilloscope lines from waves.json, subtitles. Utilities after Lemo-Opuscar gilded-illumination/demo/lib.js (MIT).
'use strict';
const W = 1080, H = 1920;
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function h2(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vn(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(lerp(h2(xi, yi), h2(xi + 1, yi), u), lerp(h2(xi, yi + 1), h2(xi + 1, yi + 1), u), v); }
function fbm(x, y, o = 5) { let s = 0, a = .5, n = 0; for (let i = 0; i < o; i++) { s += a * vn(x, y); n += a; x = x * 2.03 + 17.1; y = y * 2.03 + 3.7; a *= .5; } return s / n; }
const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };
const hexRGB = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const rgba = (h, a) => { const [r, g, b] = hexRGB(h); return `rgba(${r},${g},${b},${a})`; };
const mixRGB = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function P2(fn) { const p = new Path2D(); fn(p); return p; }
function poly(p, pts, close = true) { pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); if (close) p.closePath(); }
// smooth closed/open curve through points (Catmull-Rom → Bézier)
function curve(p, pts, close = true) {
  const n = pts.length, P = i => close ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  p.moveTo(pts[0][0], pts[0][1]);
  const last = close ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const a = P(i - 1), b = P(i), c = P(i + 1), d = P(i + 2);
    p.bezierCurveTo(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6, c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, c[0], c[1]);
  }
  if (close) p.closePath();
}
function monotone(keys) {   // [[t, v], …] → f(t), eased between keys (smoothstep), held outside
  return t => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, v0] = keys[i - 1], [t1, v1] = keys[i]; return lerp(v0, v1, ss((t - t0) / (t1 - t0))); } return keys[keys.length - 1][1]; };
}

// ── palette ───────────────────────────────────────────────────────────────────────
const C = {
  gold: '#C9A050', brown: '#3A2610', brass: '#F3DDA0', shadow: '#1E1408',
  green: '#7E8B80', blue: '#5E7F9A', pink: '#C69A94', ochre: '#C49A52', plaster: '#D8CDB8', damp: '#4E5A52',
  night: '#2E3A44', ivory: '#F2E6C8', ink: '#141210', skin: '#C9A184', skinOld: '#C7A58E', skinPale: '#D8C3B4',
};

// ── brush texture: short strokes ~1/120 of the frame width, ±5 % brightness, along the surface ───────────
function makeTex(angle, seed, spread = .2) {
  const S = 512, c = cnv(S, S), g = c.getContext('2d'), r = mulberry(seed);
  g.fillStyle = 'rgb(128,128,128)'; g.fillRect(0, 0, S, S);
  g.lineCap = 'round';
  for (let i = 0; i < 9000; i++) {
    const x = r() * S, y = r() * S, a = angle + (r() - .5) * spread, l = 9 * (.7 + r() * .6), v = Math.round(128 + (r() - .5) * 2 * 13);
    g.strokeStyle = `rgba(${v},${v},${v},${.55 + r() * .4})`; g.lineWidth = 1.6 + r() * 1.6;
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      const X = x + ox, Y = y + oy; if (X < -20 || X > S + 20 || Y < -20 || Y > S + 20) continue;
      g.beginPath(); g.moveTo(X - Math.cos(a) * l / 2, Y - Math.sin(a) * l / 2); g.lineTo(X + Math.cos(a) * l / 2, Y + Math.sin(a) * l / 2); g.stroke();
    }
  }
  return c;
}
let TEXV, TEXD;
function texture(g, path, tex, alpha = 1) {     // soft-light the stroke field into a path (world space)
  g.save(); if (path) g.clip(path);
  g.globalCompositeOperation = 'soft-light'; g.globalAlpha = alpha;
  if (!tex.__p) tex.__p = {};
  const p = g.createPattern(tex, 'repeat'); g.fillStyle = p; g.fillRect(-400, -400, W + 800, H + 800);
  g.restore();
}

// ── tufted gold wall (booth) ──────────────────────────────────────────────────────
// light: [x, y] of the glow in world space
function tuftedWall(g, light, o = {}) {
  const dw = o.dw || 150, dh = o.dh || 186, x0 = o.x0 ?? -dw, y0 = o.y0 ?? -dh, x1 = o.x1 ?? W + dw, y1 = o.y1 ?? H + dh;
  g.fillStyle = C.shadow; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  const gold = hexRGB(C.gold), br = hexRGB(C.brown);
  const lit = (x, y) => clamp(1.25 - Math.hypot(x - light[0], (y - light[1]) * .8) / 1500, .18, 1.2);
  for (let j = 0; j * dh / 2 + y0 < y1 + dh; j++) for (let i = 0; i * dw + x0 < x1 + dw; i++) {
    const cx = x0 + i * dw + (j % 2 ? dw / 2 : 0), cy = y0 + j * dh / 2;
    const L = lit(cx, cy), k = .9 + .1 * h2(i, j);
    const dx = light[0] - cx, dy = light[1] - cy, dd = Math.hypot(dx, dy) || 1, ux = dx / dd, uy = dy / dd;
    // the cushion: a puffed diamond
    const p = P2(q => curve(q, [[cx, cy - dh / 2 + 9], [cx + dw * .28, cy - dh * .22], [cx + dw / 2 - 9, cy], [cx + dw * .28, cy + dh * .23], [cx, cy + dh / 2 - 9], [cx - dw * .28, cy + dh * .23], [cx - dw / 2 + 9, cy], [cx - dw * .28, cy - dh * .22]]));
    const gr = g.createRadialGradient(cx + ux * dw * .18, cy + uy * dh * .18, 4, cx, cy, dw * .62);
    const c0 = mixRGB(br, gold, clamp(L * 1.08 * k)), c1 = mixRGB(br, gold, clamp(L * .72 * k)), c2 = mixRGB(br, gold, clamp(L * .28));
    gr.addColorStop(0, `rgb(${c0.map(Math.round)})`); gr.addColorStop(.62, `rgb(${c1.map(Math.round)})`); gr.addColorStop(1, `rgb(${c2.map(Math.round)})`);
    g.fillStyle = gr; g.fill(p);
    // a soft highlight on the side facing the light
    g.save(); g.clip(p);
    g.strokeStyle = `rgba(243,221,160,${.22 * clamp(L)})`; g.lineWidth = 5;
    g.beginPath(); g.ellipse(cx + ux * 10, cy + uy * 10, dw * .3, dh * .3, 0, Math.atan2(uy, ux) - .9, Math.atan2(uy, ux) + .9); g.stroke();
    g.restore();
  }
  // buttons at the crossings
  for (let j = 0; j * dh / 2 + y0 < y1 + dh; j++) for (let i = 0; i * dw + x0 < x1 + dw; i++) {
    const bx = x0 + i * dw + (j % 2 ? 0 : dw / 2), by = y0 + j * dh / 2;
    const L = clamp(lit(bx, by)), dx = light[0] - bx, dy = light[1] - by, dd = Math.hypot(dx, dy) || 1;
    // pleats: short dark folds from the button along the diamond edges
    g.strokeStyle = `rgba(30,20,8,${.55})`; g.lineWidth = 3; g.lineCap = 'round';
    for (const [ax, ay] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { g.beginPath(); g.moveTo(bx + ax * 6, by + ay * 7); g.lineTo(bx + ax * dw * .16, by + ay * dh * .16); g.stroke(); }
    g.fillStyle = 'rgba(20,12,4,.8)'; g.beginPath(); g.arc(bx, by, 12, 0, TAU); g.fill();
    const bg = g.createRadialGradient(bx + dx / dd * 3, by + dy / dd * 3, 1, bx, by, 9);
    const b0 = mixRGB(br, hexRGB(C.brass), clamp(L * 1.1)), b1 = mixRGB(br, gold, clamp(L * .6));
    bg.addColorStop(0, `rgb(${b0.map(Math.round)})`); bg.addColorStop(1, `rgb(${b1.map(Math.round)})`);
    g.fillStyle = bg; g.beginPath(); g.arc(bx, by, 8.5, 0, TAU); g.fill();
    g.fillStyle = `rgba(255,246,214,${.9 * L})`; g.beginPath(); g.arc(bx + dx / dd * 3.5, by + dy / dd * 3.5, 2.2, 0, TAU); g.fill();
  }
}

// ── worn grey-green wall ──────────────────────────────────────────────────────────
// bitmap at scale S of the world rect [x0,y0,x1,y1]; returns {c, x0, y0, S}
function wornWall(rect, seed, o = {}) {
  const [x0, y0, x1, y1] = rect, S = o.S || 1.3, w = Math.ceil((x1 - x0) * S), h = Math.ceil((y1 - y0) * S);
  const c = cnv(w, h), g = c.getContext('2d'), id = g.createImageData(w, h), d = id.data;
  const base = hexRGB(C.green), blue = hexRGB(C.blue), pink = hexRGB(C.pink), ochre = hexRGB(C.ochre), plaster = hexRGB(C.plaster), damp = hexRGB(C.damp);
  const bias = o.bias || (() => 0);
  const sx = seed * 13.7, sy = seed * 7.3;
  // threshold for < 1/3 coverage, from a coarse pass
  const field = (X, Y) => fbm(X / 140 + sx, Y / 140 + sy, 5) * .7 + fbm(X / 32 + sx, Y / 32 + sy, 3) * .3 + bias(X, Y);
  const vals = [];
  for (let y = 0; y < h; y += 20) for (let x = 0; x < w; x += 20) vals.push(field(x0 + x / S, y0 + y / S));
  vals.sort((a, b) => a - b); const th = vals[Math.floor(vals.length * (1 - (o.cover || .17)))];
  const soft = (c, k) => mixRGB(c, base, k);
  const L = [soft(plaster, .1), soft(blue, .28), soft(pink, .32), soft(ochre, .3)];
  const edges = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const X = x0 + x / S, Y = y0 + y / S;
    const P = field(X, Y);
    let col = base;
    const big = fbm(X / 900 + sy, Y / 900, 2);
    let v = .93 + .1 * big + .025 * (vn(X / 14, Y / 40) - .5);
    if (P > th) {
      // which old coat shows is a separate field: no concentric rings
      const q = fbm(X / 85 + 50 + sx, Y / 85 + sy, 3);
      col = q < .34 ? L[0] : q < .56 ? L[1] : q < .68 ? L[2] : L[3];
      v = .96 + .05 * (vn(X / 10, Y / 10) - .5);
      if (P - th < .005) v *= 1.07;                                // the lip of the paint catching light
    } else if (th - P < .02 && vn(X / 7 + sx, Y / 7) > .82) {     // small flakes around the patches
      col = L[1]; v = .97;
    } else if (th - P < .01) { col = mixRGB(base, damp, .3); v *= .95; if (h2(x, y) < .0005) edges.push([X, Y]); }   // a faint damp rim
    // rising damp near the floor with an irregular tide line
    const tide = (o.floor || 1700) - 120 - 90 * fbm(X / 160 + 3, 1.3, 3);
    if (Y > tide) { const m = clamp((Y - tide) / 60) * .45; col = mixRGB(col, damp, m); v *= 1 - .12 * m; }
    const i = (y * w + x) * 4;
    d[i] = col[0] * v; d[i + 1] = col[1] * v; d[i + 2] = col[2] * v; d[i + 3] = 255;
  }
  g.putImageData(id, 0, 0);
  g.setTransform(S, 0, 0, S, -x0 * S, -y0 * S);
  const r = mulberry(seed * 31 + 7);
  // drips: thin damp streaks running down
  for (let k = 0; k < 9; k++) {
    let x = x0 + r() * (x1 - x0), y = y0 + 200 + r() * (y1 - y0 - 700); const len = 150 + r() * 380;
    const gr = g.createLinearGradient(x, y, x, y + len); gr.addColorStop(0, 'rgba(60,72,66,.28)'); gr.addColorStop(1, 'rgba(60,72,66,0)');
    g.strokeStyle = gr; g.lineWidth = 3 + r() * 5; g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < len; s += 20) { x += (r() - .5) * 3; g.lineTo(x, y + s); } g.stroke();
  }
  // fine cracks branching from patch edges
  g.lineCap = 'round';
  const crack = (x, y, a, n, w) => {
    g.strokeStyle = `rgba(36,40,36,${.55})`; g.lineWidth = w; g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < n; s++) { a += (r() - .5) * .9; x += Math.cos(a) * 7; y += Math.sin(a) * 7; g.lineTo(x, y); if (r() < .05 && w > .6) { g.stroke(); crack(x, y, a + (r() - .5) * 2, n * .5 | 0, w * .7); g.beginPath(); g.moveTo(x, y); } }
    g.stroke();
  };
  edges.sort(() => r() - .5).slice(0, o.cracks || 12).forEach(([x, y]) => crack(x, y, r() * TAU, 10 + r() * 22 | 0, 1.3));
  texture(g, null, TEXV, .9);
  return { c, x0, y0, S };
}
function drawBitmap(g, b) { g.drawImage(b.c, b.x0, b.y0, b.c.width / b.S, b.c.height / b.S); }
function prerender(rect, S, fn) {     // any static drawing → bitmap at scale S
  const [x0, y0, x1, y1] = rect, c = cnv((x1 - x0) * S, (y1 - y0) * S), g = c.getContext('2d');
  g.setTransform(S, 0, 0, S, -x0 * S, -y0 * S); fn(g); return { c, x0, y0, S };
}

// ── light helpers ─────────────────────────────────────────────────────────────────
function glow(g, x, y, r, col, a, op = 'screen') {
  g.save(); g.globalCompositeOperation = op;
  const gr = g.createRadialGradient(x, y, 0, x, y, r); const [R, G, B] = hexRGB(col);
  gr.addColorStop(0, `rgba(${R},${G},${B},${a})`); gr.addColorStop(.45, `rgba(${R},${G},${B},${a * .35})`); gr.addColorStop(1, `rgba(${R},${G},${B},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore();
}
function shade(g, col, a, rect = [-400, -400, W + 800, H + 800]) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = rgba(col, a); g.fillRect(...rect); g.restore(); }

// ── heads ─────────────────────────────────────────────────────────────────────────
// o: x, y (centre of the skull), r, yaw (-1 looks to the viewer's left … 0 front … 1 right; |yaw| > 1.2 = back of the head),
// tilt, skin, hair ('short' | 'scarf' | 'long' | 'none'), eyes ('open'|'wide'|'down'|'shadow'|'closed'), mouth (0..1), beard, mole,
// light (angle the light comes from), lightA (0..1 contrast)
function head(g, o) {
  const { x, y, r } = o, yaw = o.yaw || 0, back = Math.abs(yaw) > 1.2, s = Math.sign(yaw) || 1;
  g.save(); g.translate(x, y); g.rotate(o.tilt || 0);
  const skin = o.skin || C.skin, hair = o.hairCol || '#17120f';
  // neck
  g.fillStyle = rgba(skin, 1); g.fill(P2(q => { q.moveTo(-r * .3, r * .7); q.lineTo(r * .3, r * .7); q.lineTo(r * .34, r * 1.45); q.lineTo(-r * .34, r * 1.45); q.closePath(); }));
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-r * .34, r * .75, r * .68, r * .22);
  if (o.hair === 'long') {   // hair hanging behind, to the waist
    const L = o.hairLen || r * 6;
    g.fillStyle = hair; g.fill(P2(q => curve(q, [[-r * 1.02, -r * .2], [-r * 1.05, r * 1.2], [-r * 1.18, L * .55], [-r * .9, L], [r * .9, L], [r * 1.18, L * .55], [r * 1.05, r * 1.2], [r * 1.02, -r * .2], [0, -r * 1.12]])));
  }
  if (o.hair === 'scarf') {   // headscarf: a hood around the face, tied under the chin
    g.fillStyle = o.scarf || '#5a3a22';
    g.fill(P2(q => curve(q, [[0, -r * 1.25], [r * 1.12, -r * .55], [r * 1.12 + yaw * r * .2, r * .55], [r * .55, r * 1.25], [0, r * 1.42], [-r * .55, r * 1.25], [-r * 1.12 + yaw * r * .2, r * .55], [-r * 1.12, -r * .55]])));
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = r * .05;
    g.beginPath(); g.moveTo(-r * .9, -r * .7); g.quadraticCurveTo(0, -r * 1.15, r * .9, -r * .7); g.stroke();
  }
  if (back) {   // back of the head: hair, ears
    g.fillStyle = rgba(skin, 1); g.beginPath(); g.ellipse(-r * .98, r * .05, r * .14, r * .24, 0, 0, TAU); g.ellipse(r * .98, r * .05, r * .14, r * .24, 0, 0, TAU); g.fill();
    if (o.hair !== 'scarf') { g.fillStyle = hair; g.beginPath(); g.ellipse(0, -r * .05, r, r * 1.12, 0, 0, TAU); g.fill(); }
    g.restore(); return;
  }
  // face
  const fx = yaw * r * .5;
  const face = P2(q => curve(q, [[fx * .2, -r * 1.08], [r * .92 + fx * .25, -r * .45], [r * .86 + fx * .35, r * .3], [r * .45 + fx * .6, r * .9], [fx * .75, r * 1.08], [-r * .45 + fx * .6, r * .9], [-r * .86 + fx * .35, r * .3], [-r * .92 + fx * .25, -r * .45]]));
  g.fillStyle = skin; g.fill(face);
  // light and shadow side
  g.save(); g.clip(face);
  const la = o.light ?? Math.PI, lx = Math.cos(la), ly = Math.sin(la), A = o.lightA ?? .55;
  const gr = g.createLinearGradient(lx * r, ly * r, -lx * r, -ly * r);
  gr.addColorStop(0, 'rgba(255,240,215,.12)'); gr.addColorStop(.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(20,12,10,${A})`);
  g.fillStyle = gr; g.fillRect(-r * 2, -r * 2, r * 4, r * 4);
  if (o.age) { g.strokeStyle = 'rgba(70,40,30,.28)'; g.lineWidth = r * .03;     // wrinkles
    for (const [a, b, c2, d2] of [[-.55, .25, -.35, .62], [.55, .25, .35, .62], [-.4, -.6, .4, -.62], [-.62, -.05, -.5, .02], [.62, -.05, .5, .02]]) { g.beginPath(); g.moveTo(a * r + fx, b * r); g.quadraticCurveTo((a + c2) / 2 * r + fx, (b + d2) / 2 * r + r * .04, c2 * r + fx, d2 * r); g.stroke(); } }
  if (o.beard) { g.fillStyle = 'rgba(25,18,14,.33)'; g.fill(P2(q => curve(q, [[-r * .8 + fx * .4, r * .25], [-r * .4 + fx * .6, r * .95], [fx * .75, r * 1.1], [r * .4 + fx * .6, r * .95], [r * .8 + fx * .4, r * .25], [fx * .7, r * .62]]))); }
  g.restore();
  // ear on the far side when turned
  if (Math.abs(yaw) > .25) { g.fillStyle = skin; g.beginPath(); g.ellipse(-s * r * (.9 - Math.abs(yaw) * .2), r * .05, r * .13, r * .22, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(-s * r * (.9 - Math.abs(yaw) * .2), r * .05, r * .06, r * .12, 0, 0, TAU); g.fill(); }
  // hair
  if (o.hair === 'short') {
    g.fillStyle = hair;
    g.fill(P2(q => curve(q, [[-r * .98 + fx * .2, -r * .05], [-r * .95, -r * .78], [-r * .35, -r * 1.16], [r * .35, -r * 1.16], [r * .95, -r * .78], [r * .98 + fx * .2, -r * .05], [r * .82 + fx * .3, -r * .5], [fx * .3, -r * .72], [-r * .82 + fx * .3, -r * .5]])));
    if (Math.abs(yaw) > .3) { g.beginPath(); g.ellipse(-s * r * .7, -r * .25, r * .35, r * .55, 0, 0, TAU); g.fill(); }
  }
  if (o.hair === 'long') {
    g.fillStyle = hair;
    g.fill(P2(q => curve(q, [[-r * 1.02, r * .6], [-r * 1.0, -r * .7], [-r * .3, -r * 1.16], [r * .3, -r * 1.16], [r * 1.0, -r * .7], [r * 1.02, r * .6], [r * .8 + fx * .3, -r * .2], [r * .2 + fx * .3, -r * .82], [-r * .2 + fx * .3, -r * .82], [-r * .8 + fx * .3, -r * .2]])));
  }
  // features
  const ex = r * .36 * (1 - Math.abs(yaw) * .35), ey = -r * .05, ecx = fx * 1.15;
  const eyesVis = [[-1, 1], [1, 1]].filter(([k]) => !(Math.abs(yaw) > .6 && k === -s));
  for (const [k] of eyesVis) {
    const X = ecx + k * ex, sc = 1 - (k === -s ? Math.abs(yaw) * .4 : 0);
    if (o.eyes === 'shadow') { g.fillStyle = 'rgba(10,8,8,.82)'; g.beginPath(); g.ellipse(X, ey, r * .19 * sc, r * .13, 0, 0, TAU); g.fill(); continue; }
    if (o.eyes === 'closed') { g.strokeStyle = 'rgba(25,15,12,.85)'; g.lineWidth = r * .045; g.beginPath(); g.moveTo(X - r * .13 * sc, ey + r * .02); g.lineTo(X + r * .13 * sc, ey + r * .02); g.stroke(); }
    else if (o.eyes === 'down') { g.fillStyle = '#1b1410'; g.beginPath(); g.ellipse(X, ey + r * .04, r * .09 * sc, r * .035, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(25,15,12,.85)'; g.lineWidth = r * .05; g.beginPath(); g.moveTo(X - r * .14 * sc, ey + r * .01); g.lineTo(X + r * .14 * sc, ey + r * .01); g.stroke(); }
    else {
      const wide = o.eyes === 'wide';
      if (wide) { g.fillStyle = '#e6ddd0'; g.beginPath(); g.ellipse(X, ey, r * .14 * sc, r * .08, 0, 0, TAU); g.fill(); }
      g.fillStyle = '#1b1410'; g.beginPath(); g.ellipse(X + yaw * r * .03, ey, r * (wide ? .06 : .1) * sc, r * (wide ? .06 : .05), 0, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(25,15,12,.7)'; g.lineWidth = r * .035; g.beginPath(); g.moveTo(X - r * .15 * sc, ey - r * .05); g.quadraticCurveTo(X, ey - r * .11, X + r * .15 * sc, ey - r * .04); g.stroke();
    }
    // brow
    g.strokeStyle = o.hair === 'scarf' ? 'rgba(120,110,100,.8)' : 'rgba(20,14,10,.85)'; g.lineWidth = r * .06; g.lineCap = 'round';
    g.beginPath(); g.moveTo(X - r * .17 * sc, ey - r * .2 + (o.brow || 0) * r * .05 * k); g.lineTo(X + r * .15 * sc, ey - r * .24 - (o.brow || 0) * r * .05 * k); g.stroke();
  }
  // nose
  g.strokeStyle = 'rgba(60,35,25,.55)'; g.lineWidth = r * .045;
  g.beginPath(); g.moveTo(ecx + yaw * r * .12, ey + r * .05); g.lineTo(ecx + yaw * r * .3, ey + r * .38); g.lineTo(ecx + yaw * r * .1, ey + r * .42); g.stroke();
  // mouth
  const my = r * .58, mw = r * .26 * (1 - Math.abs(yaw) * .3), mx = ecx + yaw * r * .1, m = o.mouth || 0;
  if (m > .05) { g.fillStyle = '#1a0e0c'; g.beginPath(); g.ellipse(mx, my + m * r * .08, mw * (1 + m * .4), r * (.04 + m * .2), 0, 0, TAU); g.fill(); }
  else { g.strokeStyle = 'rgba(70,30,25,.75)'; g.lineWidth = r * .045; g.beginPath(); g.moveTo(mx - mw, my); g.quadraticCurveTo(mx, my - r * .015, mx + mw, my + r * .01); g.stroke(); }
  if (o.mole) { g.fillStyle = '#3a2219'; g.beginPath(); g.arc(ecx + r * .42, r * .22, r * .045, 0, TAU); g.fill(); }
  g.restore();
}

// ── oscilloscope lines ────────────────────────────────────────────────────────────
let WAVES = null;
// o: x0, x1, y0, y1 (band), n (4–8), amp, smooth (points of moving average; 1 = raw, spiky), alpha, clip (Path2D or null)
function scopeLines(g, t, o) {
  if (!WAVES) return;
  const F = WAVES.frames, n = o.n || 6, f = clamp(Math.round(t * WAVES.fps), 0, F.length - 1);
  g.save(); if (o.clip) g.clip(o.clip, o.rule || 'nonzero');
  g.lineJoin = 'round'; g.lineCap = 'round';
  for (let k = 0; k < n; k++) {
    const fr = F[clamp(f - k * 2, 0, F.length - 1)], m = fr.length;
    const sm = Math.max(1, Math.round((o.smooth || 1) * (1 + k * .15)));
    const pts = [];
    const yb = lerp(o.y0, o.y1, (k + .5) / n) + Math.sin(t * .4 + k * 1.7) * 8;
    const amp = (o.amp || 90) * (.55 + .45 * h2(k, 3));
    const ph = Math.floor(h2(k, 9) * m), rep = o.rep || 2;
    for (let i = 0; i <= 120; i++) {
      const u = i / 120, idx = (ph + Math.floor(u * m * rep)) % m;
      let v = 0; for (let j = -sm + 1; j < sm; j++) v += fr[(idx + j + m) % m]; v /= (2 * sm - 1);
      const edge = Math.sin(Math.PI * u) ** .35;                     // the line eases to its baseline at the edges
      pts.push([lerp(o.x0, o.x1, u), yb - v / 100 * amp * edge + Math.sin(u * 37 + t * 3 + k) * .8]);
    }
    const a = (o.alpha ?? .78) * (.7 + .3 * h2(k, 5));
    g.strokeStyle = `rgba(201,160,80,${a * .16})`; g.lineWidth = 7 / (o.ls || 1); g.beginPath(); poly(g, pts, false); g.stroke();
    const lw = (1.6 + .8 * h2(k, 7)) / (o.ls || 1);
    if (o.sep) { g.strokeStyle = `rgba(30,20,8,${a * o.sep})`; g.lineWidth = lw + 2.4 / (o.ls || 1); g.beginPath(); poly(g, pts, false); g.stroke(); }
    g.strokeStyle = o.core ? `rgba(${o.core},${a})` : `rgba(214,176,98,${a})`; g.lineWidth = lw; g.beginPath(); poly(g, pts, false); g.stroke();
  }
  g.restore();
}
const rmsAt = t => WAVES ? WAVES.rms[clamp(Math.round(t * WAVES.fps), 0, WAVES.rms.length - 1)] : 0;

// ── subtitles ─────────────────────────────────────────────────────────────────────
function wrap(g, text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
function subtitle(g, text, a, y = 1440) {
  if (!text || a <= 0) return;
  const lines = text.split('\n'), dlg = /^[„"»]/.test(text) || /^„/.test(lines[0]);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a;
  g.font = dlg ? 'italic 500 56px EBG' : '600 54px EBG'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const lh = 66, x = 470, top = y - (lines.length - 1) * lh;
  g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = 14; g.shadowOffsetY = 2;
  g.fillStyle = C.ivory;
  lines.forEach((l, i) => g.fillText(l, x, top + i * lh));
  g.shadowBlur = 0; g.shadowOffsetY = 0;
  const wmax = Math.max(...lines.map(l => g.measureText(l).width));
  g.strokeStyle = rgba(C.gold, .9); g.lineWidth = 2; g.beginPath(); g.moveTo(x - Math.min(wmax, 420) / 2, y + 26); g.lineTo(x + Math.min(wmax, 420) / 2, y + 26); g.stroke();
  g.restore();
}
