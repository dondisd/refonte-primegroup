/* PRIME — P en particules-filaments (réf. « Future-State » : objet-signature décortiqué au scroll).
   Vanilla, zéro lib. Le P s'assemble au chargement, s'éventaille en fibres au scroll,
   se reforme vers la finale, et réagit au pointeur. */
(() => {
  'use strict';

  /* ── Barre de progression + reveals ─────────────────────────────── */
  const bar = document.querySelector('.progress');
  const onScrollUI = () => {
    const h = document.documentElement;
    const f = h.scrollTop / (h.scrollHeight - h.clientHeight);
    if (bar) bar.style.width = (f * 100).toFixed(2) + '%';
  };
  addEventListener('scroll', onScrollUI, { passive: true });
  onScrollUI();

  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.2 });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  /* ── Canvas P ───────────────────────────────────────────────────── */
  const canvas = document.getElementById('pcanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, DPR = 1, particles = [], maxR = 0, CX = 0, CY = 0;
  const mouse = { x: -9999, y: -9999 };

  function sampleGlyph() {
    // Échantillonne les pixels du glyphe « P » (Archivo Black) sur un canvas hors écran.
    const mobile = W < 760;
    const size = Math.min(H * (mobile ? 0.42 : 0.62), W * (mobile ? 0.72 : 0.42));
    const off = document.createElement('canvas');
    const s = Math.ceil(size);
    off.width = s; off.height = s;
    const octx = off.getContext('2d');
    octx.fillStyle = '#fff';
    octx.font = `${s * 0.98}px 'Archivo Black', sans-serif`;
    octx.textBaseline = 'middle';
    octx.textAlign = 'center';
    octx.fillText('P', s / 2, s * 0.56);
    const data = octx.getImageData(0, 0, s, s).data;

    const cx = CX = mobile ? W * 0.5 : W * 0.66; // P centré-droit sur desktop, haut-centre sur mobile
    const cy = CY = H * (mobile ? 0.3 : 0.44);
    const step = Math.max(3, Math.round(s / (mobile ? 42 : 64)));
    const pts = [];
    for (let y = 0; y < s; y += step) {
      for (let x = 0; x < s; x += step) {
        if (data[(y * s + x) * 4 + 3] > 128) {
          const hx = cx + x - s / 2;
          const hy = cy + y - s / 2;
          const dx = hx - cx, dy = hy - cy;
          pts.push({
            hx, hy,
            ang: Math.atan2(dy, dx),
            r: Math.hypot(dx, dy),
            seed: Math.random(),
            x: hx + (Math.random() - 0.5) * W * 0.9, // départ dispersé -> assemblage
            y: hy + (Math.random() - 0.5) * H * 0.9,
          });
        }
      }
    }
    maxR = Math.max(W, H) * 0.55;
    return pts;
  }

  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    particles = sampleGlyph();
  }

  // Décorticage piloté par le scroll : assemblé (hero) -> éventail (milieu) -> reformé (finale)
  function explodeFactor() {
    const h = document.documentElement;
    const f = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    const up = Math.min(1, Math.max(0, (f - 0.06) / 0.30));   // 6%→36% : ouverture
    const down = Math.min(1, Math.max(0, (f - 0.62) / 0.28)); // 62%→90% : re-formation
    const smooth = (t) => t * t * (3 - 2 * t);
    return smooth(up) * (1 - smooth(down));
  }

  let t0 = performance.now();
  function frame(now) {
    const t = (now - t0) / 1000;
    const E = explodeFactor();
    const breath = 1 + Math.sin(t * 0.8) * 0.015;
    const swirl = E * 0.6; // légère torsade pendant le décorticage

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    for (const p of particles) {
      // Cible : position du glyphe, déplacée le long de son angle quand E monte
      const spread = E * (0.25 + p.seed * 0.75) * maxR;
      const a = p.ang + swirl * (p.seed - 0.5) * 2 + E * Math.sin(t * 0.5 + p.seed * 6.28) * 0.15;
      const tx = (p.hx - CX) * breath + CX + Math.cos(a) * spread;
      const ty = (p.hy - CY) * breath + CY + Math.sin(a) * spread;

      // Ressort vers la cible
      p.x += (tx - p.x) * 0.07;
      p.y += (ty - p.y) * 0.07;

      // Répulsion du pointeur
      const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
      const md = mdx * mdx + mdy * mdy;
      if (md < 130 * 130) {
        const f = (1 - Math.sqrt(md) / 130) * 26;
        p.x += (mdx / (Math.sqrt(md) + 0.01)) * f;
        p.y += (mdy / (Math.sqrt(md) + 0.01)) * f;
      }

      // Filament : petit segment orienté vers l'extérieur, dégradé orange->rouge
      const len = 3 + p.seed * 9 + E * 10;
      const dx = Math.cos(p.ang + swirl * (p.seed - 0.5)) * len;
      const dy = Math.sin(p.ang + swirl * (p.seed - 0.5)) * len;
      const warm = p.seed;
      const rC = Math.round(255 - warm * 23);
      const gC = Math.round(122 - warm * 54);
      const bC = Math.round(24 + warm * 18);
      // halo doux
      ctx.strokeStyle = `rgba(${rC},${gC},${bC},0.16)`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(p.x - dx, p.y - dy); ctx.lineTo(p.x + dx, p.y + dy); ctx.stroke();
      // cœur brillant
      ctx.strokeStyle = `rgba(255,${Math.round(180 - warm * 60)},120,0.85)`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x - dx * 0.5, p.y - dy * 0.5); ctx.lineTo(p.x + dx * 0.5, p.y + dy * 0.5); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }

  function staticDraw() {
    // reduced-motion : P assemblé statique, un seul rendu
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const dx = Math.cos(p.ang) * 5, dy = Math.sin(p.ang) * 5;
      ctx.strokeStyle = 'rgba(255,110,40,0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p.hx - dx, p.hy - dy); ctx.lineTo(p.hx + dx, p.hy + dy); ctx.stroke();
    }
  }

  addEventListener('resize', () => { resize(); if (reduced) staticDraw(); });
  addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });

  // Attendre la police pour échantillonner le vrai glyphe
  const start = () => { resize(); reduced ? staticDraw() : requestAnimationFrame(frame); };
  if (document.fonts && document.fonts.ready) {
    document.fonts.load("100px 'Archivo Black'").then(start).catch(start);
  } else start();
})();
