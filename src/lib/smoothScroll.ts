import Lenis from 'lenis';

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Creates a Lenis instance with autoRaf disabled so the GSAP ticker can
 * drive it (keeps ScrollTrigger perfectly in sync). Returns null when the
 * user prefers reduced motion — native scrolling takes over.
 */
export function initSmoothScroll(): Lenis | null {
  if (prefersReduced()) return null;
  return new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    autoRaf: false,
  });
}
