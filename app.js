/* PRIME v3 — hero vidéo + menu mobile + progression + reveals. Vanilla, zéro lib. */
(() => {
  'use strict';

  /* Progression */
  const bar = document.querySelector('.progress');
  const onScroll = () => {
    const h = document.documentElement;
    const f = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    if (bar) bar.style.width = (f * 100).toFixed(2) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Reveals */
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.2 });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  /* Menu mobile plein écran */
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.menu');
  if (burger && menu) {
    const toggle = (open) => {
      menu.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', () => toggle(menu.hidden));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggle(false)));
  }

  /* Vidéos de fond : lecture après window.load (les posters légers portent le LCP) */
  const vids = [...document.querySelectorAll('.hero-bg, .foot-bg')];
  if (vids.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const boot = () => vids.forEach((v) => { v.load(); v.play().catch(() => {}); });
    if (document.readyState === 'complete') boot();
    else addEventListener('load', boot, { once: true });
    const kick = () => vids.forEach((v) => { if (v.paused) v.play().catch(() => {}); });
    addEventListener('touchstart', kick, { once: true, passive: true });
    addEventListener('click', kick, { once: true });
  }
})();
