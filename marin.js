// Scroll-linked ink reveal. Both layers use the exact user-provided monochrome artwork.
(() => {
  'use strict';
  const section = document.getElementById('marin');
  if (!section) return;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let requestId = 0;
  const clamp = n => Math.min(1, Math.max(0, n));
  const smooth = n => { const x = clamp(n); return x * x * (3 - 2 * x); };
  function update() {
    requestId = 0;
    if (media.matches) {
      section.style.setProperty('--marin-ink', '1');
      section.style.setProperty('--marin-reveal-right', '0%');
      section.style.setProperty('--marin-zoom', '1');
      section.style.setProperty('--marin-shift', '0%');
      return;
    }
    const rect = section.getBoundingClientRect();
    const progress = clamp(-rect.top / Math.max(1, rect.height - innerHeight));
    const ink = smooth((progress - .06) / .82);
    section.style.setProperty('--marin-ink', ink.toFixed(4));
    section.style.setProperty('--marin-reveal-right', ((1 - ink) * 100).toFixed(2) + '%');
    section.style.setProperty('--marin-zoom', (1.015 + .032 * progress).toFixed(4));
    section.style.setProperty('--marin-shift', ((.5 - progress) * 1.2).toFixed(3) + '%');
  }
  function schedule() { if (!requestId) requestId = requestAnimationFrame(update); }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  media.addEventListener?.('change', schedule);
  schedule();
})();
