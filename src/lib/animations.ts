import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Split an element's text into per-character spans (preserving spaces). */
function splitChars(el: HTMLElement) {
  if (el.dataset.split === 'done') return Array.from(el.querySelectorAll<HTMLElement>('.char'));
  const text = el.textContent ?? '';
  el.textContent = '';
  const frag = document.createDocumentFragment();
  const chars: HTMLElement[] = [];
  for (const ch of text) {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch === ' ' ? ' ' : ch;
    frag.appendChild(span);
    chars.push(span);
  }
  el.appendChild(frag);
  el.dataset.split = 'done';
  return chars;
}

export function initAnimations(lenis: Lenis | null) {
  gsap.registerPlugin(ScrollTrigger);

  // Drive Lenis from the GSAP ticker so ScrollTrigger stays in sync.
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  if (reduced()) {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    // still populate counters with final values
    document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
      const end = parseFloat(el.dataset.counter || '0');
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      el.textContent = end.toFixed(decimals);
    });
    return;
  }

  // --- Block reveals ------------------------------------------------------
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    const delay = parseFloat(el.dataset.revealDelay || '0');
    gsap.fromTo(
      el,
      { y: 44, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%' },
      },
    );
  });

  // --- Split-text headline reveals ---------------------------------------
  gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
    const chars = splitChars(el);
    el.style.opacity = '1';
    gsap.fromTo(
      chars,
      { yPercent: 120, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.022,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      },
    );
  });

  // --- Animated number counters ------------------------------------------
  gsap.utils.toArray<HTMLElement>('[data-counter]').forEach((el) => {
    const end = parseFloat(el.dataset.counter || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: () => {
        el.textContent = obj.v.toFixed(decimals);
      },
    });
  });

  // --- Subtle parallax on tagged elements --------------------------------
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallax || '60');
    gsap.fromTo(
      el,
      { yPercent: -amount / 10 },
      {
        yPercent: amount / 10,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });

  ScrollTrigger.refresh();
}
