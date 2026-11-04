// Work tab: a fanned stack of project cards, and a detail sheet for each.
(() => {
  const OLD = 'https://y65zhu.github.io/ProjectsPage/';
  const PROJECTS = [
    {
      id: 'dofocus', cat: 'product brand', title: 'DoFocus', tab: 'iOS app', page: 'dofocus-case.html',
      kick: 'A focus timer with a buddy.',
      cover: 'dofocus-home.jpg',
      body: [
        "An idea I started from a blank page: pick what you're focusing on, turn the dial, and a small companion studies, reads or types beside you until time's up. Finish a session, earn stars, decorate their room.",
        'I own the front end — every screen, flow and interaction — and all of the marketing. My latest redesign started with research into Forest, Finch and Focus Friend and a full UX audit of our own first-run experience.'
      ],
      stats: [['6→3', 'onboarding screens'], ['15', 'friction points fixed'], ['Opt-in', 'breaks, instead of automatic']],
      meta: [['Role', 'Front-end design · UX · Marketing'], ['Status', 'iOS · in development']],
      links: [['Read the marketing case study', 'dofocus-case.html'], ['Try the prototype', OLD + 'dofocus.html']],
      media: [
        { video: OLD + 'dofocus/walkthrough.mp4', cap: 'Full walkthrough' },
        { img: 'dofocus-session.jpg', cap: 'In session' },
        { img: 'dofocus-home.jpg', cap: 'Home' }
      ]
    },
    {
      id: 'excel', cat: 'brand', title: 'Excel Gum', tab: 'Rebrand',
      kick: 'Made for Gen Z.',
      cover: 'excel-gum.jpg',
      body: [
        'A rebrand of Excel Gum for Gen Z, made with Sofia Xu. We kept the icy blue everyone already recognizes and gave it a sleeker visual language — stronger flavor cues and higher-contrast packaging.',
        "Then we gave people a reason to be seen with it: #FreshAF, a social campaign built on streetwear collabs, AR filters and Instagram challenges that make staying fresh feel like a flex."
      ],
      meta: [['Role', 'Brand · Campaign · Social'], ['Team', 'with Sofia Xu']],
      links: [['Full presentation', 'https://new.express.adobe.com/id/urn:aaid:sc:VA6C2:8dc182b8-286a-5a15-840b-fe08ccf0c6c2?invite=true&accept=true&promoid=Z2G1FQKR&mv=other']],
      media: [
        { img: 'excel-gum.jpg', cap: 'Packaging system', wide: true },
        { yt: '6c8f2D7rC6c', cap: 'Campaign video' },
        { iframe: 'https://www.instagram.com/reel/DHCz4vQtCEI/embed', ar: '9/16', cap: 'IG reel 01' },
        { iframe: 'https://www.instagram.com/reel/DHC2AvXNkFn/embed', ar: '9/16', cap: 'IG reel 02' }
      ]
    },
    {
      id: 'biblely', cat: 'product', title: 'Biblely', tab: 'Bilingual app', page: 'biblely-brief.html',
      kick: 'Read it, then actually understand it.',
      cover: 'biblely.jpg',
      body: [
        'Biblely turns scripture reading into real understanding through plain-language explanations, guided reflection and community connection — so people engage with each chapter instead of just getting through it.',
        "It's designed bilingual from the start, to make faith accessible across languages and cultures."
      ],
      meta: [['Role', 'Product · UX · App design'], ['Format', 'Product brief + live prototype']],
      links: [['Read the product brief', 'biblely-brief.html'], ['Read the UX case study', 'biblely-ux.html'], ['Open the prototype', 'https://y65zhu.github.io/Biblely/']],
      media: [{ iframe: 'https://y65zhu.github.io/Biblely/', ar: '9/16', cap: 'Live prototype — scroll and tap inside' }]
    },
    {
      id: 'waterlooworks', cat: 'product', title: 'WaterlooWorks', tab: 'UX redesign',
      kick: 'A fairer job posting flow.',
      cover: 'waterlooworks.jpg',
      body: [
        'A full UX redesign of the employer side of WaterlooWorks. The new flow is a guided, multi-step form with transparent evaluation criteria, salary sliders, fair-hiring prompts and a live posting preview.',
        'Employers get a faster, clearer flow; students get postings that are more honest and more equitable.'
      ],
      meta: [['Role', 'UX · Interaction · Prototype']],
      links: [['Try the prototype', 'waterlooworks-prototype.html']],
      media: []
    },
    {
      id: 'tryon', cat: 'product', title: 'TryOn Buddy', tab: 'AI fashion app',
      kick: 'See it on you before you buy it.',
      type: ['TryOn', 'AI · Prototype'],
      body: [
        'An independently developed virtual try-on app for online shopping. Upload your own photo, search a brand (Lululemon, say) and instantly preview how different styles and colors look on you.',
        'An AI color-analysis engine gives each piece a compatibility score and tailored style notes.'
      ],
      meta: [['Role', 'UX · AI · Prototyping'], ['Made', 'Independently']],
      links: [],
      media: [
        { video: OLD + 'walkover.mov', cap: 'App walkthrough' },
        { iframe: 'https://embed.figma.com/proto/t6qE7RMo78vmX3G9i8gidM/TryOn-Buddy?node-id=106-2047&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&embed-host=share', ar: '9/16', cap: 'Figma prototype' }
      ]
    },
    {
      id: 'cantalk', cat: 'product', title: 'CAN Talk', tab: 'App design',
      kick: 'Canadian English, for newcomers.',
      cover: 'cantalk-story-1.jpg',
      body: [
        'An app that helps newcomers adapt to Canadian English: pronunciation practice, a guessing game for idioms and an AI chat partner — building conversational fluency, accent and a feel for Canadian culture, one lesson at a time.'
      ],
      meta: [['Role', 'UX · App design · Figma']],
      links: [
        ['View presentation', 'https://www.canva.com/design/DAGXXaes4Gg/nUxMYfspzq5fPLuXsVMQZg/view'],
        ['Figma prototype', 'https://www.figma.com/proto/dIOZMxhIneCquwTWyfRGYf/Wu_Nicole_M3Figma?node-id=6-413&starting-point-node-id=6%3A413']
      ],
      media: [
        { img: 'cantalk-story-1.jpg', cap: 'Storyboard · preparing for an interview' },
        { img: 'cantalk-story-2.jpg', cap: 'Storyboard · doing the lessons' },
        { img: 'cantalk-wire-1.jpg', cap: 'Wireframes 01' },
        { img: 'cantalk-wire-2.jpg', cap: 'Wireframes 02' },
        { img: 'cantalk-flow.jpg', cap: 'Full screen flow', wide: true }
      ]
    },
    {
      id: 'brochure', cat: 'brand', title: 'AI Certificate', tab: 'Print · 2025',
      kick: 'An eight-page brochure for WatSPEED.',
      cover: 'brochure-1.jpg',
      body: [
        "A program brochure for the University of Waterloo WatSPEED Artificial Intelligence Certificate, designed in InDesign. Eight pages carry the program's value, course structure, learning outcomes and key takeaways — clear type, bold hierarchy, built to convert curious readers into applicants."
      ],
      meta: [['Role', 'Print design · InDesign'], ['Client', 'WatSPEED, University of Waterloo'], ['Year', '2025']],
      links: [['Open the PDF', 'https://y65zhu.github.io/Personal-Website-Design/ai-certificate.pdf']],
      media: [1, 2, 3, 4].map(i => ({ img: `brochure-${i}.jpg`, cap: `Page ${i}` }))
    },
    {
      id: 'posters', cat: 'brand', title: 'Posters on the job', tab: 'Social & print',
      kick: 'A clinic, an arcade, an au-pair program, an app launch.',
      cover: 'poster-alvins-2.jpg',
      body: [
        "Most of my design work happens inside a job, on a deadline, for someone who has to sell something the next morning. This is a wall of it: treatment posters for a beauty clinic, an event poster for a VR arcade, a carousel for an au-pair exchange program, launch posters for an e-commerce app — plus a few studies in Chinese visual culture I made for myself.",
        'Different audiences every time, same habit: work out who will stop scrolling, and what they need to read first.'
      ],
      meta: [['Role', 'Graphic design · Social media'], ['For', 'Past employers & myself']],
      links: [],
      media: [
        { img: 'poster-alvins-2.jpg', cap: "E-commerce app — launch on Xiaohongshu" },
        { img: 'poster-oriental.jpg', cap: 'Oriental aesthetics — personal study' },
        { img: 'poster-literary.jpg', cap: 'Literary Gathering — personal study' },
        { img: 'poster-clinic-1.jpg', cap: 'Beauty clinic — treatment launch' },
        { img: 'poster-clinic-2.jpg', cap: 'Beauty clinic — trial offer' },
        { img: 'poster-clinic-3.jpg', cap: 'Beauty clinic — price list' },
        { img: 'poster-arcade.jpg', cap: 'VR arcade — event poster' },
        { img: 'poster-moonlight.jpg', cap: 'Whispers of Moonlight — personal study' },
        { img: 'poster-nice-1.jpg', cap: 'Au-pair program — cover' },
        { img: 'poster-nice-2.jpg', cap: 'Au-pair program — summer' },
        { img: 'poster-nice-3.jpg', cap: 'Au-pair program — Carpa' },
        { img: 'poster-nice-4.jpg', cap: 'Au-pair program — Dragone' },
        { img: 'poster-alvins-1.jpg', cap: "E-commerce app — sign-up offer" }
      ]
    },
    {
      id: 'antiques', cat: 'story', title: 'Antiques in Time', tab: 'Documentary',
      kick: 'A watchmaker, and the stories in the watches.',
      cover: 'antiques.jpg',
      body: [
        'A documentary about John Shantz, whose watch restoration business in Stratford, Ontario has looked after mechanical watches since 1977 — and the histories attached to them.',
        'Through interviews with John and his customers, the film is about tradition, preservation and why people grow so attached to intricate old machines.'
      ],
      meta: [['Role', 'Documentary · Interview · Edit']],
      links: [],
      media: [{ yt: 'KOckxR6iWkQ', cap: 'Full cut', wide: true }]
    },
    {
      id: 'jane', cat: 'story', title: 'Jane, Night Shift', tab: 'Audio doc',
      kick: 'The person who cleans the building after everyone leaves.',
      type: ['Jane', 'Audio documentary'],
      body: [
        "An audio documentary about Jane, a night-shift janitor at the University of Waterloo. She's been on the maintenance team for years, and she talks about the happiness and the loneliness of the job — and the quiet pride of keeping a school running."
      ],
      meta: [['Role', 'Audio · Interview · Storytelling']],
      links: [],
      media: [{ audio: OLD + 'Zhu_PRJ3_FINAL.mp3', cap: 'Listen' }]
    },
    {
      id: 'forget', cat: 'code story', title: 'Before I Forget', tab: 'Narrative game',
      kick: 'A game whose interface forgets with you.',
      cover: 'before-i-forget.jpg',
      body: [
        "An interactive narrative game about cognitive decline. As you play, the environment and the interface itself start to fragment, distort and fade — mirroring the protagonist's memory.",
        'I designed gameplay systems and interface elements and built them in JavaScript (p5.js), HTML/CSS and Figma.'
      ],
      meta: [['Role', 'Interaction design · Code'], ['Built with', 'p5.js · HTML/CSS · Figma · Git']],
      links: [['Play the game', 'https://qhtan1.github.io/A2_Group9B_MidTermGame/']],
      media: [{ iframe: 'https://qhtan1.github.io/A2_Group9B_MidTermGame/', ar: '16/10', cap: 'Playable demo', wide: true }]
    },
    {
      id: 'games', cat: 'code', title: 'Two small games', tab: 'p5.js',
      kick: 'My Little House & Harvest Heaven.',
      cover: 'little-house.jpg',
      body: [
        'My Little House is a cozy household sim: explore rooms, flip lights, play mini-games and check the weather from inside a digital home. Harvest Heaven, made with a teammate, is a farming sim where you plant, grow and harvest crops to earn coins and level up.',
        'Both built in JavaScript and p5.js for CS 105 and CS 106.'
      ],
      meta: [['Role', 'Game design · Code'], ['Built with', 'JavaScript · p5.js']],
      links: [],
      media: [
        { yt: 'OHXPihCHsfo', cap: 'My Little House' },
        { yt: '3ltd3IDpo70', cap: 'Harvest Heaven' }
      ]
    }
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const desktop = matchMedia('(min-width: 901px)');
  const deck = $('#deck'), detail = $('#detail');
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // the newest work sits in the middle of the fan, DoFocus raised at rest
  const ORDER = ['waterlooworks', 'tryon', 'cantalk', 'excel', 'biblely', 'dofocus', 'brochure', 'posters', 'antiques', 'jane', 'forget'];
  const rank = id => (ORDER.includes(id) ? ORDER.indexOf(id) : ORDER.length);
  PROJECTS.sort((a, b) => rank(a.id) - rank(b.id));
  const FEATURED = 'dofocus';

  /* ---------- cards ---------- */
  const coverHTML = p => p.cover
    ? `<img src="${p.cover}" alt="" loading="lazy">`
    : `<div class="type-cover"><div><span>${p.type[0]}</span><small>${p.type[1]}</small></div></div>`;
  PROJECTS.forEach((p, i) => {
    const b = document.createElement('button');
    // key work stands out: tier 1 in full vermilion, tier 2 in a lighter tint
    const TIER = { dofocus: 1, biblely: 1, brochure: 2, excel: 2 };
    b.className = 'pcard' + (TIER[p.id] ? ` tier-${TIER[p.id]}` : '');
    b.dataset.id = p.id;
    b.setAttribute('aria-label', `${p.title} — open project`);
    b.innerHTML = `
      <span class="tab"><b>${String(i + 1).padStart(2, '0')}</b>${p.tab}</span>
      <span class="cover">${coverHTML(p)}</span>
      <span class="cap"><h4>${p.title}</h4><p>${p.kick}</p></span>
      <span class="open" aria-hidden="true">↗</span>`;
    deck.appendChild(b);
  });
  const cards = $$('.pcard', deck);
  let shown = cards.slice(), hot = -1, geo = { offset: 0, step: 0, cw: 320, spread: 0 };

  // the raised card: whatever is hovered, otherwise the featured one
  const active = () => (hot >= 0 ? hot : shown.findIndex(c => c.dataset.id === FEATURED));
  const xOf = (i, a) => geo.offset + i * geo.step + (a < 0 ? 0 : i > a ? geo.spread / 2 : -geo.spread / 2);

  function layout() {
    if (!desktop.matches) { cards.forEach(c => c.style.cssText = ''); return; }
    const n = shown.length, W = deck.clientWidth;
    const cw = Math.min(320, W * 0.32);
    // leave room for the neighbours to slide apart, so the end cards never leave the frame
    const room = Math.min(260, cw * 0.8);
    const step = n > 1 ? Math.max(0, Math.min((W - cw - room) / (n - 1), cw * 0.8)) : 0;
    const offset = (W - (cw + step * (n - 1))) / 2;
    const a = active();
    geo = { offset, step, cw, spread: a >= 0 ? Math.min(cw + 18 - step, room) : 0 };
    deck.style.setProperty('--cw', cw + 'px');
    const mid = (n - 1) / 2;
    shown.forEach((c, i) => {
      const isHot = i === a;
      const y = isHot ? -38 : Math.pow(i - mid, 2) * 1.4;
      c.style.setProperty('--x', xOf(i, a) + 'px');
      c.style.setProperty('--y', y + 'px');
      c.style.setProperty('--rot', isHot ? '0deg' : (i - mid) * 1.4 + 'deg');
      c.style.setProperty('--s', isHot ? 1.04 : 1);
      c.style.zIndex = isHot ? n + 1 : i + 1;
      c.classList.toggle('hot', isHot);
    });
  }
  const setHot = i => { if (i !== hot) { hot = i; layout(); } };

  deck.addEventListener('pointermove', e => {
    if (!desktop.matches || e.pointerType === 'touch' || !shown.length) return;
    const px = e.clientX - deck.getBoundingClientRect().left;
    // hit-test against where the cards are heading, not where they are mid-animation,
    // and keep the raised card until the pointer clearly leaves it — no skipping a card
    const a = active();
    if (a >= 0) {
      const ax = xOf(a, a);
      if (px >= ax - 6 && px <= ax + geo.cw + 6) return setHot(a);
    }
    let pick = 0;
    shown.forEach((_, i) => { if (px >= xOf(i, a)) pick = i; });
    setHot(pick);
  });

  // one sideways trackpad swipe = one card, however much momentum follows
  let acc = 0, locked = false, quiet = 0;
  deck.addEventListener('wheel', e => {
    if (!desktop.matches || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    clearTimeout(quiet);
    quiet = setTimeout(() => { locked = false; acc = 0; }, 180);
    if (locked) return;
    acc += e.deltaX;
    if (Math.abs(acc) < 30) return;
    setHot(Math.max(0, Math.min(shown.length - 1, Math.max(0, active()) + (acc > 0 ? 1 : -1))));
    locked = true;
  }, { passive: false });
  deck.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = Math.max(0, Math.min(shown.length - 1, Math.max(0, active()) + (e.key === 'ArrowRight' ? 1 : -1)));
    setHot(next);
    shown[next].focus();
  });
  deck.addEventListener('pointerleave', () => setHot(-1));
  cards.forEach(c => {
    c.addEventListener('focus', () => setHot(shown.indexOf(c)));
    c.addEventListener('click', () => {
      // the hovered card if there is one (a touch tap has none: use what was tapped)
      const target = desktop.matches && hot >= 0 ? shown[hot] : c;
      open(target.dataset.id, target);
    });
  });
  addEventListener('resize', layout);
  layout();

  /* ---------- filters ---------- */
  $$('.chip').forEach(ch => ch.addEventListener('click', () => {
    $$('.chip').forEach(o => o.setAttribute('aria-pressed', o === ch));
    const f = ch.dataset.filter;
    shown = cards.filter(c => f === 'all' || PROJECTS.find(p => p.id === c.dataset.id).cat.includes(f));
    cards.forEach(c => c.classList.toggle('out', !shown.includes(c)));
    hot = -1;
    layout();
  }));

  /* ---------- detail sheet ---------- */
  const mediaHTML = m => {
    const cap = m.cap ? `<figcaption class="mono">${m.cap}</figcaption>` : '';
    const wide = m.wide ? ' class="wide"' : '';
    if (m.img) return `<figure${wide}><img src="${m.img}" alt="${esc(m.cap || '')}" loading="lazy" data-zoom>${cap}</figure>`;
    if (m.yt) return `<figure${wide}><div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/${m.yt}" title="${esc(m.cap || 'Video')}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>${cap}</figure>`;
    if (m.iframe) return `<figure${wide}><div class="embed" style="--ar:${m.ar || '16/9'}"><iframe src="${m.iframe}" title="${esc(m.cap || 'Embed')}" loading="lazy" allowfullscreen></iframe></div>${cap}</figure>`;
    if (m.video) return `<figure${wide}><video src="${m.video}" controls muted playsinline preload="metadata"></video>${cap}</figure>`;
    if (m.audio) return `<figure${wide}><audio src="${m.audio}" controls preload="none"></audio>${cap}</figure>`;
    return '';
  };

  let current = -1, fromCard = null;
  function render(idx) {
    const p = PROJECTS[idx];
    current = idx;
    const media = p.media.filter(m => m.img !== p.cover);
    detail.innerHTML = `
      <div class="d-bar">
        <button class="pill" data-close>← All work</button>
        <span class="mono">${String(idx + 1).padStart(2, '0')} / ${PROJECTS.length}</span>
        <div class="group">
          <button class="round" data-step="-1" aria-label="Previous project">←</button>
          <button class="round" data-step="1" aria-label="Next project">→</button>
        </div>
      </div>
      <article class="d-page">
        <div class="d-hero">
          <div>
            <p class="mono eyebrow">${p.tab}</p>
            <h2 id="dTitle">${p.title}</h2>
            <p class="kick">${p.kick}</p>
            <div class="body">${p.body.map(t => `<p>${esc(t)}</p>`).join('')}</div>
            ${p.links.length ? `<div class="d-links">${p.links.map(([t, u], i) => (/^https?:/.test(u) ? `<a class="pill${i ? ' ghost' : ''}" href="${u}" target="_blank" rel="noopener">${t} ↗</a>` : `<a class="pill${i ? ' ghost' : ''}" href="${u}">${t} →</a>`)).join('')}</div>` : ''}
          </div>
          <div class="d-cover">${p.cover ? `<img src="${p.cover}" alt="${esc(p.title)}" style="view-transition-name: proj-cover" data-zoom>` : coverHTML(p).replace('type-cover', 'type-cover" style="aspect-ratio:4/3')}</div>
        </div>
        <div class="d-facts">
          ${p.stats ? p.stats.map(([a, b]) => `<div><strong>${a}</strong><span>${b}</span></div>`).join('') : ''}
          ${p.meta.map(([a, b]) => `<div class="m"><span class="mono">${a}</span><b>${esc(b)}</b></div>`).join('')}
        </div>
        ${media.length ? `<p class="mono eyebrow d-gal-head">Gallery · ${media.length}</p><div class="d-gallery">${media.map(mediaHTML).join('')}</div>` : ''}
      </article>
      <button class="back-float" data-close>← All work</button>`;
    detail.scrollTop = 0;
  }

  const vt = fn => (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches)
    ? document.startViewTransition(fn) : (fn(), null);

  function open(id, card) {
    const idx = PROJECTS.findIndex(p => p.id === id);
    if (idx < 0) return;
    // projects with a full case study open it instead of the sheet
    if (PROJECTS[idx].page) { location.href = PROJECTS[idx].page; return; }
    fromCard = card || cards.find(c => c.dataset.id === id);
    const img = fromCard && $('.cover img', fromCard);
    if (img) img.style.viewTransitionName = 'proj-cover';
    const t = vt(() => {
      if (img) img.style.viewTransitionName = '';
      render(idx);
      detail.hidden = false;
      detail.classList.toggle('enter', !document.startViewTransition);
      document.body.classList.add('locked');
    });
    history.replaceState(null, '', '#' + id);
    (t ? t.finished : Promise.resolve()).then(() => $('[data-close]', detail)?.focus({ preventScroll: true }));
  }

  function close() {
    if (detail.hidden) return;
    const card = cards.find(c => c.dataset.id === PROJECTS[current].id);
    const img = card && $('.cover img', card);
    const dimg = $('.d-cover img', detail);
    const t = vt(() => {
      if (dimg) dimg.style.viewTransitionName = '';
      if (img) img.style.viewTransitionName = 'proj-cover';
      detail.hidden = true;
      detail.innerHTML = '';
      document.body.classList.remove('locked');
    });
    (t ? t.finished : Promise.resolve()).then(() => { if (img) img.style.viewTransitionName = ''; card?.focus({ preventScroll: true }); });
    history.replaceState(null, '', location.pathname);
  }

  function go(stepBy) {
    const idx = (current + stepBy + PROJECTS.length) % PROJECTS.length;
    if (PROJECTS[idx].page) { location.href = PROJECTS[idx].page; return; }
    vt(() => render(idx));
    history.replaceState(null, '', '#' + PROJECTS[idx].id);
  }

  detail.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) return close();
    const s = e.target.closest('[data-step]');
    if (s) return go(+s.dataset.step);
    const z = e.target.closest('[data-zoom]');
    if (z) window.site.lightbox(z.src, z.alt);
  });
  addEventListener('keydown', e => {
    if (detail.hidden || !$('#lightbox').hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });

  if (location.hash) open(location.hash.slice(1));
})();
