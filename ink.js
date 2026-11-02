// The site's recurring illustration and its seal.
//
// Ink painting: an abstract ink-wash landscape of the name 朱硯潤 — stone for
// 硯 (inkstone), water for 潤 (to nourish), a vermilion sun for 朱. Any element
// with data-ink gets one, painted from a seed:
//   data-ink="landscape" | "ridge"   data-seed="7"   data-sun="74,26" (x%,y%; "off" for none)
//   data-water (landscape only)      data-parallax
// Seal: site.sealSVG(height) returns 硯潤 as a carved white-text seal.
(() => {
  'use strict';
  const INK = '#231f1c', ZHU = '#b23a2b';
  const site = (window.site = window.site || {});

  /* ---------------- painting helpers ---------------- */
  const rng = a => () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const gauss = rand => { let s = 0; for (let i = 0; i < 4; i++) s += rand(); return (s - 2) / 0.58; };
  const mix = (a, b, t) => {
    const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const A = p(a), B = p(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  };

  // midpoint displacement: every pass splits each edge and nudges the new point
  function deform(pts, depth, v, rand) {
    let out = pts;
    for (let d = 0; d < depth; d++) {
      const next = [];
      for (let i = 0; i < out.length; i++) {
        const a = out[i], b = out[(i + 1) % out.length], len = Math.hypot(b.x - a.x, b.y - a.y);
        next.push(a, { x: (a.x + b.x) / 2 + gauss(rand) * v * len, y: (a.y + b.y) / 2 + gauss(rand) * v * len });
      }
      out = next; v *= 0.72;
    }
    return out;
  }
  const blob = (cx, cy, r, n, rand) => Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2, rr = r * (0.85 + rand() * 0.3);
    return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr };
  });

  function ridgeTop(W, H, base, height, rand, k) {
    const n = 90;
    const peaks = Array.from({ length: 2 + k }, () => ({ at: 0.1 + rand() * 0.8, h: 0.45 + rand() * 0.55, w: 0.05 + rand() * 0.12 }));
    const ph = [rand() * 9, rand() * 9, rand() * 9], top = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      let h = 0.1 + 0.05 * Math.sin(u * 7 + ph[0]);
      for (const p of peaks) h = Math.max(h, p.h * Math.pow(Math.exp(-Math.abs((u - p.at) / p.w)), 1.15));
      h += 0.025 * Math.sin(u * 41 + ph[1]) + 0.015 * Math.sin(u * 97 + ph[2]);
      top.push({ x: -0.08 * W + u * 1.16 * W, y: H * (base - height * h) });
    }
    return top;
  }

  // many faint, differently deformed copies of one shape (Tyler Hobbs' watercolor method)
  function wash(c, shape, color, alpha, coats, rand, v) {
    const base = deform(shape, 2, v * 1.4, rand);
    c.fillStyle = color; c.globalAlpha = alpha;
    for (let i = 0; i < coats; i++) {
      const pts = deform(base, 4, v, rand);
      c.beginPath();
      pts.forEach((p, j) => (j ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
      c.closePath(); c.fill();
    }
    c.globalAlpha = 1;
  }

  // xuan paper drinks the ink unevenly: knock tiny flecks out of what was painted
  function grain(c, W, H, rand, amount) {
    c.save(); c.globalCompositeOperation = 'destination-out';
    const n = Math.round((W * H) / 900 * amount);
    for (let i = 0; i < n; i++) {
      c.globalAlpha = 0.15 + rand() * 0.45;
      const r = 0.4 + rand() * 1.6;
      c.fillRect(rand() * W, rand() * H, r * (1 + rand() * 3), r);
    }
    c.restore();
  }

  // a loaded brush along a path: swells, tapers, and breaks into dry streaks at the tail
  function brush(c, path, width, color, alpha, rand, dry = 0.45) {
    const pts = [];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i], b = path[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 3));
      for (let j = 0; j < n; j++) pts.push({ x: a.x + ((b.x - a.x) * j) / n, y: a.y + ((b.y - a.y) * j) / n });
    }
    pts.push(path[path.length - 1]);
    const N = pts.length;
    if (N < 3) return;
    const phase = rand() * 10;
    c.fillStyle = color;
    for (let pass = 0; pass < 3; pass++) {
      c.globalAlpha = alpha * (pass ? 0.35 : 0.8);
      const L = [], R = [];
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1), a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)];
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len;
        const w = width * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05 + 0.02)), 0.5) * (0.7 + 0.45 * Math.sin(u * 11 + phase + pass)) * (pass ? 1.6 : 1);
        const j = (rand() - 0.5) * width * 0.25;
        L.push({ x: pts[i].x + nx * (w / 2 + j), y: pts[i].y + ny * (w / 2 + j) });
        R.push({ x: pts[i].x - nx * (w / 2 - j), y: pts[i].y - ny * (w / 2 - j) });
      }
      c.beginPath();
      L.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
      for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i].x, R[i].y);
      c.closePath(); c.fill();
    }
    c.save(); c.globalCompositeOperation = 'destination-out'; c.lineCap = 'round';
    const streaks = Math.round(10 * dry);
    for (let s = 0; s < streaks; s++) {
      const off = (rand() - 0.5) * width * 1.1, start = Math.floor(N * (0.3 + rand() * 0.5));
      c.globalAlpha = 0.5 + rand() * 0.5;
      c.lineWidth = 0.5 + rand() * width * 0.12;
      c.beginPath();
      for (let i = start; i < N; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)], len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const x = pts[i].x - ((b.y - a.y) / len) * off, y = pts[i].y + ((b.x - a.x) / len) * off;
        i === start ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.stroke();
    }
    c.restore(); c.globalAlpha = 1;
  }

  /* ---------------- one painting ---------------- */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const parallaxed = [];

  function paint(root) {
    const W = Math.round(root.clientWidth), H = Math.round(root.clientHeight);
    if (W < 10 || H < 10) return;
    root.querySelectorAll('canvas').forEach(c => c.remove());
    const scene = root.dataset.ink || 'landscape';
    const rand = rng(+(root.dataset.seed || 7) * 9973 + 17);
    const sunAttr = root.dataset.sun || (scene === 'ridge' ? '86,34' : '74,26');
    const sun = sunAttr === 'off' ? null : sunAttr.split(',').map(Number);
    const pad = root.hasAttribute('data-parallax') && !reduced ? 40 : 0;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const shown = root._shown || reduced;
    const layers = [];

    const layer = (depth, draw) => {
      const el = document.createElement('canvas');
      el.width = W * dpr; el.height = (H + pad * 2) * dpr;
      Object.assign(el.style, {
        position: 'absolute', left: '0', top: -pad + 'px', width: W + 'px', height: H + pad * 2 + 'px', pointerEvents: 'none',
        opacity: shown ? '1' : '0', translate: shown ? '0 0' : '0 18px',
        transition: `opacity 1.6s ease ${layers.length * 0.28}s, translate 1.8s cubic-bezier(.2,.8,.2,1) ${layers.length * 0.28}s`,
      });
      // paint on a scratch canvas so erasing (grain, dry brush) can't eat other layers
      const c = el.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, pad * dpr);
      draw(c);
      root.appendChild(el);
      layers.push({ el, depth });
    };

    if (sun) {
      const r = Math.min(W, H) * (scene === 'ridge' ? 0.16 : 0.075);
      layer(0.05, c => {
        wash(c, blob(W * sun[0] / 100, H * sun[1] / 100, r, 14, rand), ZHU, 0.02, 56, rand, 0.09);
        grain(c, W, H, rand, 0.35);
      });
    }
    const ridges = scene === 'ridge'
      ? [{ base: 0.92, height: 0.62, alpha: 0.03, depth: 0.6, color: INK }]
      : [
          { base: 0.62, height: 0.34, alpha: 0.012, depth: 0.15, color: mix(INK, '#8c949c', 0.55) },
          { base: 0.8, height: 0.36, alpha: 0.02, depth: 0.4, color: mix(INK, '#7a7f86', 0.3) },
          { base: 1.0, height: 0.3, alpha: 0.034, depth: 0.75, color: INK },
        ];
    ridges.forEach((g, k) => layer(g.depth, o => {
      const top = ridgeTop(W, H, g.base, g.height, rand, k);
      // close along a finely divided floor — one long edge would get deformed wildly
      const floor = Array.from({ length: 24 }, (_, j) => ({ x: 1.08 * W - (j / 23) * 1.16 * W, y: H * 1.3 }));
      const body = [...top, ...floor];
      wash(o, body, g.color, g.alpha, 44, rand, 0.05);
      // wet-in-wet: ink pools darker under the crests, kept inside the ridge
      o.save(); o.beginPath();
      body.forEach((p, j) => (j ? o.lineTo(p.x, p.y) : o.moveTo(p.x, p.y)));
      o.clip();
      const crest = top.reduce((m, p) => (p.y < m.y ? p : m), top[0]);
      for (let q = 0; q < 2; q++) {
        const at = q === 0 ? crest : top[Math.floor(rand() * top.length)], r = H * g.height * (0.3 + rand() * 0.2);
        wash(o, blob(at.x, at.y + r * 0.6, r, 12, rand), g.color, g.alpha * 0.3, 24, rand, 0.1);
      }
      o.restore();
      // mist: the ridge dissolves toward its foot
      o.globalCompositeOperation = 'destination-in';
      const t = H * (g.base - g.height), foot = H * g.base, grad = o.createLinearGradient(0, t, 0, foot + H * 0.04);
      grad.addColorStop(0, '#000'); grad.addColorStop(0.5, 'rgba(0,0,0,.6)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
      o.fillStyle = grad; o.fillRect(-W, -H, W * 3, H * 3);
      o.globalCompositeOperation = 'source-over';
      // a painter never outlines the whole ridge: a few broken strokes along it
      const spans = 2 + Math.floor(rand() * 3);
      for (let q = 0; q < spans; q++) {
        const a = Math.floor(rand() * top.length * 0.8), len = Math.floor(top.length * (0.12 + rand() * 0.25));
        brush(o, top.slice(a, a + len), Math.max(1.5, H * 0.011 * (0.5 + g.depth)), g.color, 0.2 + g.depth * 0.5, rand, 0.8);
      }
      grain(o, W, H, rand, 0.5);
    }));
    if (scene === 'landscape' && root.hasAttribute('data-water')) {
      layer(0.95, o => {
        for (let i = 0; i < 3; i++) {
          const y = H * (0.86 + i * 0.045), x = W * (0.08 + rand() * 0.45), len = W * (0.16 + rand() * 0.2);
          const line = Array.from({ length: 8 }, (_, j) => ({ x: x + (j / 7) * len, y: y + Math.sin(j * 0.9 + i) * H * 0.004 }));
          brush(o, line, Math.max(1.5, H * 0.006), INK, 0.55, rand, 0.75);
        }
      });
    }
    root._layers = layers;
    root._pad = pad;
    if (pad && !parallaxed.includes(root)) parallaxed.push(root);
    if (!shown) reveal.observe(root);
    drift();
  }

  const reveal = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    reveal.unobserve(e.target);
    e.target._shown = true;
    (e.target._layers || []).forEach(l => { l.el.style.opacity = '1'; l.el.style.translate = '0 0'; });
  }), { threshold: 0.25 });

  // painting takes a moment, so only paint once the picture is near the screen
  const lazy = new IntersectionObserver(entries => entries.forEach(e => {
    e.target._near = e.isIntersecting;
    if (e.isIntersecting && e.target._dirty) { e.target._dirty = false; paint(e.target); }
  }), { rootMargin: '400px 0px' });

  const resized = new ResizeObserver(entries => entries.forEach(e => {
    const el = e.target, w = Math.round(el.clientWidth), h = Math.round(el.clientHeight);
    if (Math.abs(w - (el._w || 0)) < 2 && Math.abs(h - (el._h || 0)) < 2) return;
    el._w = w; el._h = h; el._dirty = true;
    clearTimeout(el._t);
    if (el._near) el._t = setTimeout(() => { el._dirty = false; paint(el); }, 80);
  }));

  function drift() {
    const vh = innerHeight;
    for (const root of parallaxed) {
      const r = root.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
      for (const l of root._layers) l.el.style.transform = `translate3d(0, ${(p * root._pad * l.depth).toFixed(1)}px, 0)`;
    }
  }
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { drift(); ticking = false; });
  }, { passive: true });

  document.querySelectorAll('[data-ink]').forEach(el => {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el._dirty = true;
    resized.observe(el);
    lazy.observe(el);
  });

  /* ---------------- the seal ---------------- */
  // 硯潤 as a carved white-text seal: square-cut, clerical-style strokes in the
  // manner of Han seal script, worn like stone that has been inked a hundred times
  const YAN = ['M3 6H20', 'M12 6L4 17V47', 'M10 23H20V44H10Z', 'M25 3H47V30H25Z', 'M25 12H47', 'M25 21H47', 'M31 30V39L24 47', 'M40 30V45H49V39'];
  const RUN = ['M2 7L8 12', 'M1 21L8 26', 'M2 47L9 34', 'M14 3V48', 'M14 3H27V18H14', 'M14 10.5H27', 'M36 3H48V45L44 48', 'M36 3V18H48', 'M36 10.5H48', 'M21 25H42', 'M22.5 35H40.5', 'M19.5 45H43.5', 'M31.5 25V45'];
  let sealN = 0;
  site.sealSVG = (height = 80) => {
    const id = 'seal' + sealN++;
    const paths = (list, y) => `<g transform="translate(7 ${y})">${list.map(d => `<path d="${d}"/>`).join('')}</g>`;
    return `<svg class="seal-mark" viewBox="0 0 64 120" height="${height}" width="${(height * 64) / 120}" aria-hidden="true">
      <defs>
        <filter id="${id}" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" result="d"/>
          <feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="3" seed="9" result="w"/>
          <feColorMatrix in="w" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -28 19" result="worn"/>
          <feComposite in="d" in2="worn" operator="in"/>
        </filter>
        <mask id="${id}m">
          <rect width="64" height="120" fill="#fff"/>
          <g fill="none" stroke="#000" stroke-width="3.7" stroke-linecap="square">${paths(YAN, 6)}${paths(RUN, 64)}</g>
        </mask>
      </defs>
      <g filter="url(#${id})"><path d="M2.5 1.8 L61.6 2.6 L62.2 117.6 L1.8 118.3 Z" fill="${ZHU}" mask="url(#${id}m)"/></g>
    </svg>`;
  };
  document.querySelectorAll('[data-seal]').forEach(el => { el.innerHTML = site.sealSVG(+el.dataset.seal || 80); });
})();
