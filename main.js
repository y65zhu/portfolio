// Shared behaviour for every tab. Each feature checks that its elements exist.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(min-width: 901px)');
  const site = (window.site = {});

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- counters ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    if (reduced) return;
    const el = e.target, to = +el.dataset.count, t0 = performance.now();
    const step = t => {
      const p = clamp((t - t0) / 1400, 0, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox');
  site.lightbox = (src, alt) => {
    if (!lb) return;
    const img = $('img', lb);
    img.src = src; img.alt = alt || '';
    lb.hidden = false;
  };
  if (lb) {
    lb.addEventListener('click', () => { lb.hidden = true; });
    addEventListener('keydown', e => {
      if (e.key !== 'Escape' || lb.hidden) return;
      lb.hidden = true;
      e.stopImmediatePropagation(); // don't also close whatever is underneath
    });
  }

  /* ================================================================
     Home hero: a portrait drawn in calligraphy characters.
     The cursor is a camera lens that shows the real photo and
     swirls the characters out of its way.
     ================================================================ */
  const cv = $('#inkPortrait');
  let drawPortrait = () => {};
  if (cv) {
    const ctx = cv.getContext('2d');
    const photo = new Image();
    photo.src = 'me-crop.jpg';
    const mask = new Image(); // person/background matte, made offline from the same photo
    mask.src = 'me-mask.png';
    const GLYPHS = '听心光人影墨留白山水真美食舞星画看愛夢静月花雨雲誠朱硯潤';
    let W = 0, H = 0, R = 0, buckets = [], ready = false, visible = true, raw = false;
    const lens = { x: 0, y: 0, tx: 0, ty: 0, active: false, last: 0 };

    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = W * 0.17;
      const cell = W < 380 ? 8 : 10;
      const cols = Math.floor(W / cell), rows = Math.floor(H / cell);
      const sample = src => {
        const off = document.createElement('canvas');
        off.width = cols; off.height = rows;
        const o = off.getContext('2d', { willReadFrequently: true });
        o.drawImage(src, 0, 0, cols, rows);
        return o.getImageData(0, 0, cols, rows).data;
      };
      let data, mdata;
      try { data = sample(photo); mdata = sample(mask); }
      catch { raw = true; ready = true; return; } // file:// taints the canvas; show the plain photo
      // stretch contrast using only the pixels on her, not the street
      let lo = 255, hi = 0;
      for (let q = 0; q < cols * rows; q++) {
        if (mdata[q * 4] < 90) continue;
        const L = 0.299 * data[q * 4] + 0.587 * data[q * 4 + 1] + 0.114 * data[q * 4 + 2];
        lo = Math.min(lo, L); hi = Math.max(hi, L);
      }
      buckets = [cell * 0.85, cell * 1.1, cell * 1.35].map(s => ({ size: s, pts: [] }));
      let k = 0;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const p = (j * cols + i) * 4, r = data[p], g = data[p + 1], b = data[p + 2];
        if (mdata[p] < 90) continue; // only draw the person
        const L = (0.299 * r + 0.587 * g + 0.114 * b - lo) / Math.max(hi - lo, 1);
        const d = 0.1 + 0.9 * Math.pow(clamp(1 - L, 0, 1), 1.3);
        const red = r > 120 && r > g * 1.35 && r > b * 1.35;
        const hx = i * cell + cell / 2 + (Math.random() - 0.5) * 2;
        const hy = j * cell + cell / 2 + (Math.random() - 0.5) * 2;
        buckets[d > 0.66 ? 2 : d > 0.33 ? 1 : 0].pts.push({ hx, hy, x: hx, y: hy, a: 0.25 + d * 0.75, red, ch: GLYPHS[(k++ * 7 + j * 3) % GLYPHS.length] });
      }
      lens.x = lens.tx = W * 0.55; lens.y = lens.ty = H * 0.42;
      ready = true;
    };

    drawPortrait = t => {
      if (!ready || !visible) return;
      if (raw) { ctx.drawImage(photo, 0, 0, W, H); return; }
      if (!lens.active || t - lens.last > 2500) {
        // idle: the lens wanders on its own
        lens.tx = W * (0.5 + 0.26 * Math.sin(t / 2100));
        lens.ty = H * (0.45 + 0.2 * Math.sin(t / 1500 + 1));
      }
      lens.x += (lens.tx - lens.x) * 0.12;
      lens.y += (lens.ty - lens.y) * 0.12;
      ctx.clearRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const reach = R * 2.3;
      for (const b of buckets) {
        ctx.font = `${b.size}px DanXing`;
        for (const p of b.pts) {
          const dx = p.hx - lens.x, dy = p.hy - lens.y, dist = Math.hypot(dx, dy) || 1;
          let tx = p.hx, ty = p.hy;
          if (dist < reach) {
            const f = 1 - dist / reach, push = f * f * R * 1.05;
            tx += (dx / dist) * push - (dy / dist) * push * 0.7;
            ty += (dy / dist) * push + (dx / dist) * push * 0.7;
          }
          p.x += (tx - p.x) * 0.16; p.y += (ty - p.y) * 0.16;
          if (Math.hypot(p.x - lens.x, p.y - lens.y) < R * 0.98) continue;
          ctx.globalAlpha = p.a;
          ctx.fillStyle = p.red ? '#b23a2b' : '#231f1c';
          ctx.fillText(p.ch, p.x, p.y);
        }
      }
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.beginPath(); ctx.arc(lens.x, lens.y, R, 0, Math.PI * 2); ctx.clip();
      ctx.translate(lens.x, lens.y); ctx.scale(1.12, 1.12); ctx.translate(-lens.x, -lens.y);
      ctx.drawImage(photo, 0, 0, W, H);
      ctx.restore();
      ctx.strokeStyle = '#231f1c'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(lens.x, lens.y, R, 0, Math.PI * 2); ctx.stroke();
      const s = R + 10, l = 12;
      ctx.strokeStyle = '#b23a2b'; ctx.lineWidth = 1.5;
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
        const cx = lens.x + sx * s, cy = lens.y + sy * s;
        ctx.beginPath(); ctx.moveTo(cx, cy - sy * l); ctx.lineTo(cx, cy); ctx.lineTo(cx - sx * l, cy); ctx.stroke();
      });
      ctx.fillStyle = '#b23a2b';
      ctx.beginPath(); ctx.arc(lens.x - s + 4, lens.y - s - 10, 3, 0, Math.PI * 2); ctx.fill();
      ctx.font = '500 10px "IBM Plex Mono"'; ctx.textAlign = 'left';
      ctx.fillText('CCD · f/2.8', lens.x - s + 12, lens.y - s - 10);
    };

    cv.addEventListener('pointermove', e => {
      const r = cv.getBoundingClientRect();
      lens.tx = e.clientX - r.left; lens.ty = e.clientY - r.top;
      lens.active = true; lens.last = performance.now();
    });
    cv.addEventListener('pointerleave', () => { lens.active = false; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(cv);
    Promise.all([photo.decode(), mask.decode(), document.fonts.load('20px DanXing')]).then(build);
    let rz;
    addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (ready) build(); }, 200); });

    // the hero layers drift against the mouse
    const depthEls = $$('[data-depth]');
    addEventListener('pointermove', e => {
      if (reduced || !desktop.matches || scrollY > innerHeight) return;
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      depthEls.forEach(el => { const d = +el.dataset.depth; el.style.translate = `${nx * d}px ${ny * d}px`; });
    });
  }

  /* ---------- name cards flip on tap ---------- */
  $$('.char').forEach(c => c.addEventListener('click', () => c.classList.toggle('flipped')));

  /* ================================================================
     Scroll-driven motion: parallax and the horizontal origins track
     ================================================================ */
  const nav = $('.nav');
  const speedEls = $$('[data-speed]');

  function onScroll() {
    nav.classList.toggle('solid', scrollY > 30);
    if (reduced || !desktop.matches) return;
    const vh = innerHeight;
    speedEls.forEach(el => {
      if (el.dataset.dragged) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const y = (r.top + r.height / 2 - vh / 2) * +el.dataset.speed;
      el._py = y;
      el.style.translate = `0 ${y}px`;
    });
  }
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ---------- about: the origins row ----------
     A plain horizontal scroller: trackpads and phones swipe it natively,
     a mouse can drag it, the arrows step one card. It never holds the page. */
  const track = $('#track');
  if (track) {
    const bar = $('#originsBar'), prev = $('#originsPrev'), next = $('#originsNext');
    const panels = $$('.panel', track);
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? clamp(track.scrollLeft / max, 0, 1) : 1;
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft > max - 4;
    };
    const stepTo = dir => {
      const pad = parseFloat(getComputedStyle(track).paddingLeft);
      const x = track.scrollLeft + 4;
      const lefts = panels.map(p => p.offsetLeft - pad);
      const i = dir > 0 ? lefts.findIndex(l => l > x) : lefts.map(l => l < x - 8).lastIndexOf(true);
      if (i >= 0) track.scrollTo({ left: lefts[i], behavior: reduced ? 'auto' : 'smooth' });
    };
    prev && prev.addEventListener('click', () => stepTo(-1));
    next && next.addEventListener('click', () => stepTo(1));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); stepTo(e.key === 'ArrowRight' ? 1 : -1); }
    });
    track.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();

    // mouse drag (touch and trackpads already scroll natively)
    let drag = null;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, left: track.scrollLeft, moved: false };
    });
    addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 5) return;
      if (!drag.moved) { drag.moved = true; track.classList.add('dragging'); }
      track.scrollLeft = drag.left - dx;
    });
    addEventListener('pointerup', () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      if (!moved) return;
      track.classList.remove('dragging');
      // settle on the nearest card
      const pad = parseFloat(getComputedStyle(track).paddingLeft);
      const near = panels.map(p => p.offsetLeft - pad).reduce((a, b) => (Math.abs(b - track.scrollLeft) < Math.abs(a - track.scrollLeft) ? b : a));
      track.scrollTo({ left: near, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ---------- drag anything (prints, desk files) ---------- */
  let zTop = 10;
  site.draggable = (el, { onTap, enabled = () => true } = {}) => {
    let sx, sy, ox, oy, moved = false, down = false;
    el.addEventListener('pointerdown', e => {
      if (!enabled() || e.button !== 0) return;
      down = true; moved = false;
      sx = e.clientX; sy = e.clientY;
      ox = el.offsetLeft; oy = el.offsetTop + (el._py || 0);
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      if (!moved) {
        moved = true;
        el.dataset.dragged = 1; el._py = 0; el.style.translate = '0 0';
        el.classList.add('dragging');
        el.style.zIndex = ++zTop;
      }
      el.style.left = ox + dx + 'px';
      el.style.top = oy + dy + 'px';
    });
    const end = () => { if (down) { down = false; el.classList.remove('dragging'); } };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', e => {
      if (moved) { e.preventDefault(); moved = false; return; }
      onTap && onTap(e);
    });
  };

  /* ---------- lens: prints ---------- */
  $$('.stamp').forEach(s => site.draggable(s, {
    enabled: () => desktop.matches,
    onTap: () => {
      const img = $('img', s);
      site.lightbox(img.src, img.alt);
    }
  }));

  /* ---------- about: desk files open a little window ---------- */
  const win = $('#fileWindow');
  if (win) {
    const winTitle = $('#winTitle'), winBody = $('#winBody'), winImgs = $('#winImgs');
    $$('.file').forEach(f => site.draggable(f, {
      onTap: () => {
        $$('.file').forEach(o => o.classList.toggle('sel', o === f));
        winTitle.textContent = f.dataset.title;
        winBody.textContent = f.dataset.body;
        // one or more photos ("a.jpg|b.jpg"); tap one to see it large
        const imgs = (f.dataset.img || '').split('|').filter(Boolean);
        winImgs.hidden = !imgs.length;
        // up to three side by side; four or more go two by two
        winImgs.style.setProperty('--n', imgs.length >= 4 ? 2 : imgs.length);
        winImgs.classList.toggle('grid', imgs.length >= 4);
        winImgs.innerHTML = imgs.map(src => `<img src="${src}" alt="${f.dataset.title}">`).join('');
        $$('img', winImgs).forEach(im => im.addEventListener('click', () => site.lightbox(im.src, im.alt)));
        win.hidden = false;
        win.style.zIndex = ++zTop;
      }
    }));
    $('#winClose').addEventListener('click', () => { win.hidden = true; });
  }

  /* ================================================================
     About: grab the bottom-right corner and peel the cover back.
     The fold line is the perpendicular bisector between the corner
     and the pointer; whatever's past it is reflected into the flap.
     ================================================================ */
  const stage = $('#rugStage');
  if (stage) {
    const cover = $('#cover'), flap = $('#flap'), flapWrap = $('.flap-wrap'),
          corner = $('#corner'), reset = $('#rugReset');
    let peel = { x: 0, y: 0 }, peeled = false, anim = 0;

    const clipHalf = (poly, M, n, sign) => {
      const out = [], side = p => sign * ((p.x - M.x) * n.x + (p.y - M.y) * n.y);
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length], sa = side(a), sb = side(b);
        if (sa >= 0) out.push(a);
        if (sa * sb < 0) { const t = sa / (sa - sb); out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }); }
      }
      return out;
    };
    const poly = (pts, ox = 0, oy = 0) => pts.length
      ? `polygon(${pts.map(p => `${(p.x + ox).toFixed(1)}px ${(p.y + oy).toFixed(1)}px`).join(',')})`
      : 'polygon(0 0, 0 0, 0 0)';

    const render = (px, py) => {
      const w = stage.clientWidth, h = stage.clientHeight;
      peel = { x: px, y: py };
      const dx = w - px, dy = h - py, len = Math.hypot(dx, dy);
      if (len < 1) { cover.style.clipPath = ''; flap.style.clipPath = poly([]); return; }
      const n = { x: dx / len, y: dy / len }, M = { x: (w + px) / 2, y: (h + py) / 2 };
      const rect = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
      const gone = clipHalf(rect, M, n, 1);
      cover.style.clipPath = poly(clipHalf(rect, M, n, -1));
      const refl = gone.map(p => { const s = (p.x - M.x) * n.x + (p.y - M.y) * n.y; return { x: p.x - 2 * s * n.x, y: p.y - 2 * s * n.y }; });
      flap.style.clipPath = poly(refl, w, h);
      // shade the flap: darker at the fold, lighter toward its tip
      const v = { x: -n.x, y: -n.y }, ang = Math.atan2(v.x, -v.y);
      const L = Math.abs(3 * w * Math.sin(ang)) + Math.abs(3 * h * Math.cos(ang));
      const t0 = ((M.x - 0.5 * w) * v.x + (M.y - 0.5 * h) * v.y) / L + 0.5;
      const span = Math.max(...gone.map(p => (p.x - M.x) * n.x + (p.y - M.y) * n.y), 1) / L;
      flap.style.background = `linear-gradient(${ang}rad, #c9bda8 ${t0 * 100}%, #f4eee3 ${(t0 + span * 0.4) * 100}%, #fffdf8 ${(t0 + span) * 100}%)`;
    };
    const rest = () => ({ x: stage.clientWidth - 46, y: stage.clientHeight - 46 });
    const animate = (to, ms, done) => {
      cancelAnimationFrame(anim);
      const from = { ...peel }, t0 = performance.now();
      const step = t => {
        const p = reduced ? 1 : clamp((t - t0) / ms, 0, 1), e = 1 - Math.pow(1 - p, 3);
        render(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e);
        if (p < 1) anim = requestAnimationFrame(step); else done && done();
      };
      anim = requestAnimationFrame(step);
    };
    const peelAway = () => {
      peeled = true;
      animate({ x: -stage.clientWidth * 1.3, y: -stage.clientHeight * 1.3 }, 900, () => {
        cover.hidden = true; flapWrap.hidden = true; corner.hidden = true; reset.hidden = false;
      });
    };
    render(rest().x, rest().y);
    addEventListener('resize', () => { if (!peeled) render(rest().x, rest().y); });

    let peeling = false, peelMoved = false;
    corner.addEventListener('pointerenter', () => { if (!peeling && !peeled) animate({ x: stage.clientWidth - 110, y: stage.clientHeight - 90 }, 400); });
    corner.addEventListener('pointerleave', () => { if (!peeling && !peeled) animate(rest(), 400); });
    // Follow the pointer at the window level and finish on *any* way the drag
    // can end (release, cancel, lost capture, window blur), so the sheet is
    // never left hanging half-peeled.
    const follow = e => {
      if (!peeling) return;
      peelMoved = true;
      const r = stage.getBoundingClientRect();
      render(clamp(e.clientX - r.left, -r.width, r.width), clamp(e.clientY - r.top, -r.height, r.height));
    };
    const finish = () => {
      if (!peeling) return;
      peeling = false;
      removeEventListener('pointermove', follow);
      if (!peelMoved) return; // a plain click is handled below
      const w = stage.clientWidth, h = stage.clientHeight;
      // past roughly a third of the way, it comes off; otherwise it settles back
      if (Math.hypot(w - peel.x, h - peel.y) > Math.min(w, h) * 0.35) peelAway();
      else animate(rest(), 500);
    };
    corner.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault(); // no text selection or native drag to cancel the peel
      peeling = true; peelMoved = false;
      cancelAnimationFrame(anim);
      try { corner.setPointerCapture(e.pointerId); } catch {}
      addEventListener('pointermove', follow);
    });
    ['pointerup', 'pointercancel'].forEach(t => addEventListener(t, finish));
    corner.addEventListener('lostpointercapture', finish);
    addEventListener('blur', finish);
    corner.addEventListener('click', () => { if (!peelMoved && !peeled) peelAway(); peelMoved = false; });
    reset.addEventListener('click', () => {
      peeled = false; if (win) win.hidden = true;
      cover.hidden = false; flapWrap.hidden = false; corner.hidden = false; reset.hidden = true;
      animate(rest(), 800);
    });
  }

  /* ---------- footer: leave a seal ---------- */
  const zone = $('#stampZone'), hint = $('#stampHint');
  if (zone) {
    let seals = 0;
    const lines = ['One seal. Nice.', 'Two. You get it.', 'Three seals — you\'re one of us now.', 'Okay, you really like stamps.'];
    zone.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      const r = zone.getBoundingClientRect();
      const s = document.createElement('span');
      s.className = 'dropped';
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = site.sealSVG ? site.sealSVG(64) : '';
      s.style.left = e.clientX - r.left + 'px';
      s.style.top = e.clientY - r.top + 'px';
      s.style.rotate = (Math.random() * 16 - 8) + 'deg';
      zone.appendChild(s);
      seals++;
      hint.textContent = lines[Math.min(seals, lines.length) - 1];
      const all = $$('.dropped', zone);
      if (all.length > 30) all[0].remove();
    });
  }

  /* ---------- main loop ---------- */
  if (cv) {
    const loop = t => { drawPortrait(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
})();
