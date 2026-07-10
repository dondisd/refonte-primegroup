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

  /* Vidéo hero : lecture après window.load (le poster léger porte le LCP) */
  const vid = document.querySelector('.hero-bg');
  if (vid && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const boot = () => { vid.load(); vid.play().catch(() => {}); };
    if (document.readyState === 'complete') boot();
    else addEventListener('load', boot, { once: true });
    const kick = () => { if (vid.paused) { vid.play().catch(() => {}); } };
    addEventListener('touchstart', kick, { once: true, passive: true });
    addEventListener('click', kick, { once: true });
  }
})();
