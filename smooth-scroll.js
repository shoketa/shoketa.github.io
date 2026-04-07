import Lenis from 'lenis';

export const lenis = new Lenis({
  duration: 1.4,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

export function smoothScrollToEl(container, target, offset = 0) {
  lenis.scrollTo(target, { offset: -offset });
}

export function smoothScrollTo(container, targetY) {
  lenis.scrollTo(targetY);
}
