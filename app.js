/* PRIME — fond vidéo « P en fibre optique » (clips IA générés, réf. Future-State) :
   3 couches crossfadées selon la position de scroll :
   hero = P assemblé -> chapitres = mèches décorticées -> avantage = braises -> finale = P reformé.
   + barre de progression et reveals. Vanilla, zéro lib. */
(() => {
  'use strict';

  /* ── Barre de progression ───────────────────────────────────────── */
  const bar = document.querySelector('.progress');

  /* ── Reveals ────────────────────────────────────────────────────── */
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.2 });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  /* ── Fond vidéo : sélection de la couche selon le scroll ───────── */
  const vids = [document.getElementById('bg1'), document.getElementById('bg2'), document.getElementById('bg3')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = 0;

  function layerFor(f) {
    if (f < 0.14) return 0;      // hero : P assemblé
    if (f < 0.56) return 1;      // eau / marques / média : mèches décorticées
    if (f < 0.80) return 2;      // avantage : braises
    return 0;                    // finale : le P se reforme au CTA
  }

  function setLayer(i) {
    if (i === active) return;
    active = i;
    vids.forEach((v, k) => {
      if (!v) return;
      v.classList.toggle('on', k === i);
      if (k === i) { v.play().catch(() => {}); }
    });
    // Pause des couches invisibles après le fondu (économie CPU/batterie)
    setTimeout(() => vids.forEach((v, k) => { if (v && k !== active) v.pause(); }), 1000);
  }

  function onScroll() {
    const h = document.documentElement;
    const f = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    if (bar) bar.style.width = (f * 100).toFixed(2) + '%';
    if (!reduced) setLayer(layerFor(f));
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Autoplay de secours (politiques mobiles) : relance au premier geste
  if (!reduced) {
    const kick = () => { const v = vids[active]; if (v && v.paused) v.play().catch(() => {}); };
    addEventListener('touchstart', kick, { once: true, passive: true });
    addEventListener('click', kick, { once: true });
  }
})();
