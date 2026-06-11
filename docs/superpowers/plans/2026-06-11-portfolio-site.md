# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (EN/PT), Awwwards-tier single-page portfolio for Luiz Fernando Witt that proves full-stack seniority through metrics and craft, deployed statically to GitHub Pages on `luizwitt.dev`.

**Architecture:** Astro static site with island-based interactivity. Copy lives in `src/i18n/{en,pt}.json`, structured content in `src/data/*.ts`. Animations centralized in `src/lib/` (GSAP + ScrollTrigger + Lenis). Hero uses a lazy Three.js island with a reduced-motion/no-WebGL fallback. Each section is a focused `.astro` component reading from data + the active locale.

**Tech Stack:** Astro, Tailwind CSS, GSAP (+ScrollTrigger), Lenis, Three.js, TypeScript, GitHub Actions → GitHub Pages.

**Verification note:** This is a visual static site — verification is `npm run build` passing, dev-server rendering in the browser, and Lighthouse, not unit tests. Each task ends with a concrete check + commit.

---

## File Structure

```
astro.config.mjs              # site, static output, integrations
tailwind.config.mjs           # design tokens (colors, fonts, spacing)
package.json
public/CNAME                  # luizwitt.dev
public/cv/luiz-witt-cv.pdf    # placeholder
public/og/og.png              # placeholder social image
src/styles/global.css         # base layer, grain, fonts
src/i18n/en.json              # all English copy
src/i18n/pt.json              # all Portuguese copy
src/i18n/index.ts             # locale type + helper
src/data/metrics.ts           # headline metric keys + values
src/data/experience.ts        # 3 roles, structured
src/data/stack.ts             # categorized tech
src/lib/smoothScroll.ts       # Lenis init
src/lib/animations.ts         # GSAP/ScrollTrigger reveal + counter helpers
src/lib/three-hero.ts         # Three.js hero background (lazy island)
src/layouts/Base.astro        # head, meta/OG, fonts, locale wiring
src/components/Header.astro    # nav + LangToggle
src/components/LangToggle.astro
src/components/Hero.astro
src/components/ImpactStrip.astro
src/components/TrustedBy.astro
src/components/About.astro
src/components/Experience.astro
src/components/TechStack.astro
src/components/Contact.astro
src/components/Footer.astro
src/pages/index.astro          # composes sections
src/pages/404.astro
.github/workflows/deploy.yml   # build + deploy to Pages
```

---

## Task 1: Scaffold Astro + Tailwind project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`, `src/styles/global.css`

- [ ] **Step 1: Scaffold a minimal Astro project in-place**

The repo already exists with `docs/` and `.git`. Scaffold without overwriting:

```bash
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict --yes
```

If the CLI refuses because the dir is non-empty, scaffold in a temp dir and copy:

```bash
npm create astro@latest /tmp/astro-portfolio -- --template minimal --no-install --no-git --typescript strict --yes
cp -r /tmp/astro-portfolio/{src,public,astro.config.mjs,tsconfig.json,package.json} . 2>/dev/null
rm -rf /tmp/astro-portfolio
```

- [ ] **Step 2: Install dependencies (Tailwind v4 via Vite plugin, GSAP, Lenis, Three.js)**

```bash
npm install
npm install tailwindcss @tailwindcss/vite gsap lenis three
npm install -D @types/three
```

- [ ] **Step 3: Configure `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://luizwitt.dev',
  output: 'static',
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 4: Create `src/styles/global.css`**

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0b;
  --color-surface: #131316;
  --color-fg: #f4f4f5;
  --color-muted: #a1a1aa;
  --color-accent: #5eead4;
  --font-display: "Space Grotesk", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

html { scroll-behavior: smooth; }
body { background: var(--color-bg); color: var(--color-fg); font-family: var(--font-body); }

/* subtle film grain overlay */
.grain::after {
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 50;
  opacity: 0.04; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
```

- [ ] **Step 5: Verify build + dev server**

```bash
npm run build
```
Expected: build succeeds, `dist/` produced.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold Astro + Tailwind v4 + animation deps"
```

---

## Task 2: Base layout with meta, OG, fonts

**Files:**
- Create: `src/layouts/Base.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/layouts/Base.astro`**

```astro
---
interface Props { title: string; description: string; lang?: 'en' | 'pt'; }
const { title, description, lang = 'en' } = Astro.props;
const site = 'https://luizwitt.dev';
---
<!doctype html>
<html lang={lang} class="grain">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:image" content={`${site}/og/og.png`} />
    <meta property="og:url" content={site} />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="canonical" href={site} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <import-global />
  </head>
  <body>
    <slot />
  </body>
</html>
<style is:global>@import "../styles/global.css";</style>
```

Note: replace the `<import-global />` placeholder line — fonts are loaded via the `<link>` above and CSS via the `<style is:global>` import at the bottom. Remove the placeholder tag.

- [ ] **Step 2: Replace `src/pages/index.astro` with a Base smoke test**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="Luiz Fernando Witt — Full Stack Engineer" description="Product-minded full stack engineer building scalable B2B SaaS.">
  <main class="min-h-screen grid place-items-center">
    <h1 class="font-[var(--font-display)] text-5xl">Luiz Fernando Witt</h1>
  </main>
</Base>
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```
Open the printed localhost URL. Expected: dark page, name centered, custom fonts loaded, grain overlay visible.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: base layout with meta, OG, fonts, grain"
```

---

## Task 3: i18n dictionaries + helper

**Files:**
- Create: `src/i18n/en.json`, `src/i18n/pt.json`, `src/i18n/index.ts`

- [ ] **Step 1: Create `src/i18n/en.json`** (full English copy, all sections)

```json
{
  "nav": { "about": "About", "experience": "Experience", "stack": "Stack", "contact": "Contact" },
  "hero": {
    "role": "Full Stack Engineer",
    "tagline": "I build scalable B2B SaaS and internal platforms with end-to-end ownership — from architecture to production across React/TypeScript and Python/Node.",
    "ctaContact": "Get in touch",
    "ctaCv": "Download CV"
  },
  "impact": { "title": "Impact" },
  "trusted": { "title": "Shipped for teams at" },
  "about": {
    "title": "About",
    "body": "Product-minded full stack engineer with end-to-end ownership from architecture to production. I led a backend modernization from legacy PHP to FastAPI, cutting latency 60%+ while supporting enterprise integrations processing 20k+ monthly records."
  },
  "experience": { "title": "Experience", "present": "Present" },
  "stack": { "title": "Tech Stack" },
  "contact": {
    "title": "Let's build something",
    "body": "Open to full stack roles. Reach out and let's talk.",
    "email": "Email me",
    "cert": "AWS Certified Cloud Practitioner"
  },
  "footer": { "built": "Built with Astro, GSAP & Three.js" }
}
```

- [ ] **Step 2: Create `src/i18n/pt.json`** (full Portuguese copy, same keys)

```json
{
  "nav": { "about": "Sobre", "experience": "Experiência", "stack": "Stack", "contact": "Contato" },
  "hero": {
    "role": "Engenheiro Full Stack",
    "tagline": "Construo SaaS B2B escalável e plataformas internas com ownership end-to-end — da arquitetura à produção, em React/TypeScript e Python/Node.",
    "ctaContact": "Falar comigo",
    "ctaCv": "Baixar CV"
  },
  "impact": { "title": "Impacto" },
  "trusted": { "title": "Entreguei para times de" },
  "about": {
    "title": "Sobre",
    "body": "Engenheiro full stack product-minded com ownership end-to-end, da arquitetura à produção. Liderei a modernização de um backend legado em PHP para FastAPI, reduzindo a latência em 60%+ e suportando integrações enterprise que processam 20k+ registros mensais."
  },
  "experience": { "title": "Experiência", "present": "Atual" },
  "stack": { "title": "Tecnologias" },
  "contact": {
    "title": "Vamos construir algo",
    "body": "Aberto a vagas full stack. Manda mensagem e a gente conversa.",
    "email": "Me enviar email",
    "cert": "AWS Certified Cloud Practitioner"
  },
  "footer": { "built": "Feito com Astro, GSAP & Three.js" }
}
```

- [ ] **Step 3: Create `src/i18n/index.ts`**

```ts
import en from './en.json';
import pt from './pt.json';

export type Locale = 'en' | 'pt';
export const locales: Locale[] = ['en', 'pt'];
export const dictionaries = { en, pt } as const;
export const defaultLocale: Locale = 'en';

export function t(locale: Locale) {
  return dictionaries[locale];
}
```

- [ ] **Step 4: Verify typecheck**

```bash
npx astro check || npx tsc --noEmit
```
Expected: no errors importing JSON (Astro strict allows JSON imports).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: EN/PT i18n dictionaries and helper"
```

---

## Task 4: Structured data files

**Files:**
- Create: `src/data/metrics.ts`, `src/data/experience.ts`, `src/data/stack.ts`

- [ ] **Step 1: Create `src/data/metrics.ts`**

```ts
export interface Metric { value: number; prefix?: string; suffix?: string; labelEn: string; labelPt: string; decimals?: number; }

export const metrics: Metric[] = [
  { value: 60, suffix: '%+', labelEn: 'Latency reduction', labelPt: 'Redução de latência' },
  { value: 1.5, prefix: '$', suffix: 'M+ ARR', decimals: 1, labelEn: 'Served across clients', labelPt: 'Atendido entre clientes' },
  { value: 200, suffix: '+', labelEn: 'Enterprise clients', labelPt: 'Clientes enterprise' },
  { value: 90, suffix: '%', labelEn: 'Less manual effort', labelPt: 'Menos esforço manual' },
];
```

- [ ] **Step 2: Create `src/data/experience.ts`**

```ts
export interface Role {
  company: string;
  context: { en: string; pt: string };
  title: { en: string; pt: string };
  start: string;       // "Nov 2024"
  end: string;         // "" means present
  highlights: { en: string; pt: string }[];
}

export const experience: Role[] = [
  {
    company: 'Carbon Free Brasil',
    context: {
      en: 'B2B SaaS serving 200+ enterprise clients (John Deere, Heineken, Coca-Cola, McDonald’s), $1.5M+ ARR',
      pt: 'SaaS B2B atendendo 200+ clientes enterprise (John Deere, Heineken, Coca-Cola, McDonald’s), $1.5M+ ARR',
    },
    title: { en: 'Full Stack Engineer', pt: 'Engenheiro Full Stack' },
    start: 'Nov 2024', end: '',
    highlights: [
      { en: 'Spearheaded migration from a legacy PHP monolith to modular FastAPI microservices with automated testing — 80% bug reduction, 60% faster response times, 90% shorter delivery cycles.',
        pt: 'Liderei a migração de um monólito PHP legado para microsserviços FastAPI modulares com testes automatizados — 80% menos bugs, 60% mais rápido, ciclos de entrega 90% menores.' },
      { en: 'Architected an event-driven serverless pipeline (AWS Lambda/Python) for real-time GHG calculations and PDF generation — cut document processing from 9s to <1s and manual effort by 90%.',
        pt: 'Arquitetei um pipeline serverless orientado a eventos (AWS Lambda/Python) para cálculos de GHG em tempo real e geração de PDF — reduzi o processamento de 9s para <1s e o esforço manual em 90%.' },
      { en: 'Automated complex data ingestion for enterprise integrations — cut manual input from 45 min to under 5 min per session and eliminated recurring data-entry errors.',
        pt: 'Automatizei ingestão de dados complexa para integrações enterprise — reduzi a entrada manual de 45 min para menos de 5 min por sessão, eliminando erros recorrentes.' },
    ],
  },
  {
    company: 'Manchester Investimentos',
    context: {
      en: 'Wealth management firm, $4B+ AUC and 200+ advisors, internal CRM',
      pt: 'Gestora de patrimônio, $4B+ sob custódia e 200+ assessores, CRM interno',
    },
    title: { en: 'Frontend Developer', pt: 'Desenvolvedor Frontend' },
    start: 'Sep 2023', end: 'Nov 2024',
    highlights: [
      { en: 'Unblocked $1M+ in monthly portfolio simulations and eliminated reconciliation errors by optimizing financial processing engines and real-time simulators (Node.js, React).',
        pt: 'Destravei $1M+ em simulações mensais de portfólio e eliminei erros de reconciliação otimizando engines de processamento financeiro e simuladores em tempo real (Node.js, React).' },
      { en: 'Architected a ~70 MAU partner portal with automated PIX payments (Node.js, Next.js, AWS) processing $100K+ monthly, saving ~20 hours/month for finance.',
        pt: 'Arquitetei um portal de parceiros (~70 MAU) com pagamentos PIX automatizados (Node.js, Next.js, AWS) processando $100K+ mensais, economizando ~20 horas/mês do financeiro.' },
      { en: 'Built a high-performance frontend architecture and shared component library, doubling delivery speed and adding Playwright E2E testing for a 14K+ client base.',
        pt: 'Construí uma arquitetura frontend de alta performance e biblioteca de componentes compartilhada, dobrando a velocidade de entrega e adicionando testes E2E Playwright para uma base de 14K+ clientes.' },
    ],
  },
  {
    company: 'Lize',
    context: {
      en: 'Early-stage B2B SaaS automating social media publishing, ~2,000 MAU (ceased operations late 2023)',
      pt: 'SaaS B2B early-stage automatizando publicação em redes sociais, ~2.000 MAU (encerrou operações no fim de 2023)',
    },
    title: { en: 'Frontend Developer — Founding Engineer', pt: 'Desenvolvedor Frontend — Founding Engineer' },
    start: 'Jan 2023', end: 'Aug 2023',
    highlights: [
      { en: 'Launched the MVP from 0 to 1 as founding engineer, implementing an AI-driven content engine (Vue.js, Django).',
        pt: 'Lancei o MVP do 0 ao 1 como founding engineer, implementando um motor de conteúdo orientado a IA (Vue.js, Django).' },
      { en: 'Built an auto-pilot Instagram publishing feature via the Facebook API delivering personalized scheduled content for 200+ users.',
        pt: 'Construí publicação automática no Instagram via Facebook API entregando conteúdo agendado e personalizado para 200+ usuários.' },
      { en: 'Designed an SVG-based brand template editor (Vue.js) letting the sales team generate client-branded assets in minutes instead of hours.',
        pt: 'Desenhei um editor de templates de marca baseado em SVG (Vue.js) permitindo ao time de vendas gerar peças com a marca do cliente em minutos.' },
    ],
  },
];
```

- [ ] **Step 3: Create `src/data/stack.ts`**

```ts
export interface StackGroup { titleEn: string; titlePt: string; items: string[]; }

export const stack: StackGroup[] = [
  { titleEn: 'Frontend', titlePt: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Vue', 'Storybook', 'Playwright'] },
  { titleEn: 'Backend', titlePt: 'Backend', items: ['FastAPI', 'Node.js', 'Express.js', 'Django'] },
  { titleEn: 'Architecture', titlePt: 'Arquitetura', items: ['REST APIs', 'Microservices', 'CI/CD', 'Clean Architecture', 'Test Automation'] },
  { titleEn: 'Cloud & DevOps', titlePt: 'Cloud & DevOps', items: ['AWS (Lambda, EC2, S3)', 'Docker', 'Kubernetes', 'GitHub Actions', 'ArgoCD'] },
  { titleEn: 'Databases', titlePt: 'Bancos de dados', items: ['PostgreSQL', 'MySQL', 'SQL Server'] },
  { titleEn: 'Monitoring', titlePt: 'Monitoramento', items: ['Sentry', 'PostHog', 'Metabase'] },
];
```

- [ ] **Step 4: Verify typecheck + commit**

```bash
npx astro check || npx tsc --noEmit
git add -A && git commit -m "feat: structured data for metrics, experience, stack"
```

---

## Task 5: Smooth scroll + animation library setup

**Files:**
- Create: `src/lib/smoothScroll.ts`, `src/lib/animations.ts`

- [ ] **Step 1: Create `src/lib/smoothScroll.ts`**

```ts
import Lenis from 'lenis';

export function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  return lenis;
}
```

- [ ] **Step 2: Create `src/lib/animations.ts`**

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initAnimations() {
  if (reduced()) {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => (el.style.opacity = '1'));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.fromTo(el, { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-counter]').forEach((el) => {
    const end = parseFloat(el.dataset.counter || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = obj.v.toFixed(decimals); },
    });
  });
}
```

- [ ] **Step 3: Verify typecheck + commit**

```bash
npx astro check || npx tsc --noEmit
git add -A && git commit -m "feat: Lenis smooth scroll + GSAP reveal/counter helpers"
```

---

## Task 6: Header + language toggle

**Files:**
- Create: `src/components/Header.astro`, `src/components/LangToggle.astro`

**Locale strategy:** Locale is held in `localStorage` + a `data-locale` attribute on `<html>`. The page renders BOTH languages' text into the DOM with `data-i18n` spans; a tiny inline script shows the active locale and the toggle swaps it. This keeps a single static page (no duplicate routes) and works on GitHub Pages.

- [ ] **Step 1: Create `src/components/LangToggle.astro`**

```astro
<button id="lang-toggle" class="font-[var(--font-mono)] text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors" aria-label="Toggle language">
  <span data-locale-show="en">PT</span><span data-locale-show="pt">EN</span>
</button>
<script>
  const root = document.documentElement;
  const saved = localStorage.getItem('locale') || 'en';
  function apply(loc) {
    root.setAttribute('data-locale', loc);
    root.lang = loc;
    document.querySelectorAll('[data-locale-show]').forEach((n) => {
      (n as HTMLElement).style.display = n.getAttribute('data-locale-show') === loc ? '' : 'none';
    });
    document.querySelectorAll('[data-i18n-en]').forEach((n) => {
      const el = n as HTMLElement;
      el.textContent = loc === 'pt' ? (el.dataset.i18nPt || '') : (el.dataset.i18nEn || '');
    });
    localStorage.setItem('locale', loc);
  }
  apply(saved);
  document.getElementById('lang-toggle')?.addEventListener('click', () => {
    apply(root.getAttribute('data-locale') === 'en' ? 'pt' : 'en');
  });
</script>
```

Note: components emit translatable text as `<span data-i18n-en="..." data-i18n-pt="...">en text</span>`. The script above swaps `textContent` on toggle. Static HTML ships EN by default (good for SEO).

- [ ] **Step 2: Create `src/components/Header.astro`**

```astro
---
import LangToggle from './LangToggle.astro';
import en from '../i18n/en.json';
import pt from '../i18n/pt.json';
const nav = [
  { href: '#about', en: en.nav.about, pt: pt.nav.about },
  { href: '#experience', en: en.nav.experience, pt: pt.nav.experience },
  { href: '#stack', en: en.nav.stack, pt: pt.nav.stack },
  { href: '#contact', en: en.nav.contact, pt: pt.nav.contact },
];
---
<header class="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-[var(--color-bg)]/60 border-b border-white/5">
  <nav class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
    <a href="#top" class="font-[var(--font-display)] font-bold tracking-tight">LFW</a>
    <div class="flex items-center gap-6">
      {nav.map((l) => (
        <a href={l.href} class="hidden sm:inline text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors" data-i18n-en={l.en} data-i18n-pt={l.pt}>{l.en}</a>
      ))}
      <LangToggle />
    </div>
  </nav>
</header>
```

- [ ] **Step 3: Wire into `index.astro` temporarily and verify toggle works**

Add `<Header />` at the top of the page body, run `npm run dev`, click the toggle. Expected: nav labels switch EN↔PT, the toggle letter flips, choice persists on reload.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: header nav + EN/PT language toggle"
```

---

## Task 7: Hero with Three.js background

**Files:**
- Create: `src/components/Hero.astro`, `src/lib/three-hero.ts`

- [ ] **Step 1: Create `src/lib/three-hero.ts`** (lightweight animated particle field)

```ts
import * as THREE from 'three';

export function initHero(canvas: HTMLCanvasElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 6;

  const count = 900;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) positions[i] = (Math.sin(i * 12.9898) * 43758.5453 % 1) * 10 - 5;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size: 0.02, color: 0x5eead4, transparent: true, opacity: 0.7 });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let mx = 0, my = 0;
  window.addEventListener('pointermove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let raf = 0;
  function loop() {
    points.rotation.y += 0.0009;
    points.rotation.x += (my * 0.3 - points.rotation.x) * 0.03;
    points.rotation.z += (mx * 0.3 - points.rotation.z) * 0.03;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  loop();
  return () => { cancelAnimationFrame(raf); renderer.dispose(); };
}
```

- [ ] **Step 2: Create `src/components/Hero.astro`**

```astro
---
import en from '../i18n/en.json';
import pt from '../i18n/pt.json';
---
<section id="top" class="relative min-h-screen flex items-center overflow-hidden">
  <canvas id="hero-canvas" class="absolute inset-0 w-full h-full" aria-hidden="true"></canvas>
  <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-bg)]/40 to-[var(--color-bg)]"></div>
  <div class="relative max-w-6xl mx-auto px-6 w-full" data-reveal style="opacity:0">
    <p class="font-[var(--font-mono)] text-[var(--color-accent)] mb-4" data-i18n-en={en.hero.role} data-i18n-pt={pt.hero.role}>{en.hero.role}</p>
    <h1 class="font-[var(--font-display)] font-bold text-5xl sm:text-7xl leading-[1.05] tracking-tight">Luiz Fernando<br/>Witt</h1>
    <p class="mt-6 max-w-xl text-lg text-[var(--color-muted)]" data-i18n-en={en.hero.tagline} data-i18n-pt={pt.hero.tagline}>{en.hero.tagline}</p>
    <div class="mt-8 flex flex-wrap gap-4">
      <a href="#contact" class="px-6 py-3 rounded-full bg-[var(--color-accent)] text-[var(--color-bg)] font-medium hover:scale-105 transition-transform" data-i18n-en={en.hero.ctaContact} data-i18n-pt={pt.hero.ctaContact}>{en.hero.ctaContact}</a>
      <a href="/cv/luiz-witt-cv.pdf" class="px-6 py-3 rounded-full border border-white/15 hover:border-white/40 transition-colors" data-i18n-en={en.hero.ctaCv} data-i18n-pt={pt.hero.ctaCv}>{en.hero.ctaCv}</a>
    </div>
  </div>
</section>
<script>
  import { initHero } from '../lib/three-hero';
  const c = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
  if (c) initHero(c);
</script>
```

- [ ] **Step 3: Verify in browser**

Place `<Hero />` in `index.astro`, run `npm run dev`. Expected: animated teal particle field reacting to mouse, headline + CTAs over it, gradient fade to background at the bottom.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: hero section with Three.js particle background"
```

---

## Task 8: Impact strip with animated counters

**Files:**
- Create: `src/components/ImpactStrip.astro`

- [ ] **Step 1: Create `src/components/ImpactStrip.astro`**

```astro
---
import { metrics } from '../data/metrics';
---
<section class="py-24 border-y border-white/5">
  <div class="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
    {metrics.map((m) => (
      <div data-reveal style="opacity:0">
        <p class="font-[var(--font-display)] font-bold text-4xl sm:text-5xl">
          {m.prefix}<span data-counter={m.value} data-decimals={m.decimals ?? 0}>0</span>{m.suffix}
        </p>
        <p class="mt-2 text-sm text-[var(--color-muted)]" data-i18n-en={m.labelEn} data-i18n-pt={m.labelPt}>{m.labelEn}</p>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Verify counters animate on scroll**

Add `<ImpactStrip />` to `index.astro` after Hero (animations get wired in Task 13). Temporarily verify visually after Task 13's init wiring, or eyeball static layout now. Expected layout: 4 metrics, big display numbers, muted labels.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: impact strip with animated metric counters"
```

---

## Task 9: Trusted-by (client names as text)

**Files:**
- Create: `src/components/TrustedBy.astro`

- [ ] **Step 1: Create `src/components/TrustedBy.astro`**

```astro
---
import en from '../i18n/en.json';
import pt from '../i18n/pt.json';
const clients = ['John Deere', 'Heineken', 'Coca-Cola', "McDonald's"];
---
<section class="py-16">
  <div class="max-w-6xl mx-auto px-6">
    <p class="text-center text-sm uppercase tracking-widest text-[var(--color-muted)] mb-8" data-i18n-en={en.trusted.title} data-i18n-pt={pt.trusted.title}>{en.trusted.title}</p>
    <div class="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
      {clients.map((c) => (
        <span class="font-[var(--font-display)] text-xl sm:text-2xl font-semibold text-[var(--color-fg)]/70 hover:text-[var(--color-fg)] transition-colors" data-reveal style="opacity:0">{c}</span>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify + commit**

Add `<TrustedBy />` after ImpactStrip. Expected: centered row of client names in display font. Then:

```bash
git add -A && git commit -m "feat: trusted-by client names section"
```

---

## Task 10: About section

**Files:**
- Create: `src/components/About.astro`

- [ ] **Step 1: Create `src/components/About.astro`**

```astro
---
import en from '../i18n/en.json';
import pt from '../i18n/pt.json';
---
<section id="about" class="py-32">
  <div class="max-w-3xl mx-auto px-6" data-reveal style="opacity:0">
    <h2 class="font-[var(--font-display)] text-sm uppercase tracking-widest text-[var(--color-accent)] mb-6" data-i18n-en={en.about.title} data-i18n-pt={pt.about.title}>{en.about.title}</h2>
    <p class="text-2xl sm:text-3xl leading-snug font-[var(--font-display)]" data-i18n-en={en.about.body} data-i18n-pt={pt.about.body}>{en.about.body}</p>
  </div>
</section>
```

- [ ] **Step 2: Verify + commit**

```bash
git add -A && git commit -m "feat: about section"
```

---

## Task 11: Experience timeline

**Files:**
- Create: `src/components/Experience.astro`

- [ ] **Step 1: Create `src/components/Experience.astro`**

```astro
---
import { experience } from '../data/experience';
import en from '../i18n/en.json';
import pt from '../i18n/pt.json';
---
<section id="experience" class="py-32 bg-[var(--color-surface)]">
  <div class="max-w-4xl mx-auto px-6">
    <h2 class="font-[var(--font-display)] text-sm uppercase tracking-widest text-[var(--color-accent)] mb-16" data-i18n-en={en.experience.title} data-i18n-pt={pt.experience.title}>{en.experience.title}</h2>
    <div class="space-y-16">
      {experience.map((role) => (
        <article class="grid md:grid-cols-[160px_1fr] gap-6" data-reveal style="opacity:0">
          <div class="font-[var(--font-mono)] text-sm text-[var(--color-muted)]">
            {role.start} — {role.end || ''}
            {!role.end && <span data-i18n-en={en.experience.present} data-i18n-pt={pt.experience.present}>{en.experience.present}</span>}
          </div>
          <div>
            <h3 class="font-[var(--font-display)] text-2xl font-semibold">{role.company}</h3>
            <p class="text-[var(--color-accent)] mt-1" data-i18n-en={role.title.en} data-i18n-pt={role.title.pt}>{role.title.en}</p>
            <p class="text-sm text-[var(--color-muted)] mt-1" data-i18n-en={role.context.en} data-i18n-pt={role.context.pt}>{role.context.en}</p>
            <ul class="mt-4 space-y-3">
              {role.highlights.map((h) => (
                <li class="text-[var(--color-fg)]/85 pl-5 relative before:content-['▸'] before:absolute before:left-0 before:text-[var(--color-accent)]" data-i18n-en={h.en} data-i18n-pt={h.pt}>{h.en}</li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify + commit**

Expected: 3 roles, date column on the left (desktop), company/title/context/bullets on the right; toggling locale switches all text.

```bash
git add -A && git commit -m "feat: experience timeline section"
```

---

## Task 12: Tech stack + Contact + Footer

**Files:**
- Create: `src/components/TechStack.astro`, `src/components/Contact.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Create `src/components/TechStack.astro`**

```astro
---
import { stack } from '../data/stack';
import en from '../i18n/en.json';
import pt from '../i18n/pt.json';
---
<section id="stack" class="py-32">
  <div class="max-w-5xl mx-auto px-6">
    <h2 class="font-[var(--font-display)] text-sm uppercase tracking-widest text-[var(--color-accent)] mb-16" data-i18n-en={en.stack.title} data-i18n-pt={pt.stack.title}>{en.stack.title}</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {stack.map((g) => (
        <div data-reveal style="opacity:0">
          <h3 class="font-[var(--font-mono)] text-sm text-[var(--color-muted)] mb-4" data-i18n-en={g.titleEn} data-i18n-pt={g.titlePt}>{g.titleEn}</h3>
          <ul class="flex flex-wrap gap-2">
            {g.items.map((it) => (
              <li class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)] transition-colors">{it}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Create `src/components/Contact.astro`**

```astro
---
import en from '../i18n/en.json';
import pt from '../i18n/pt.json';
---
<section id="contact" class="py-32 bg-[var(--color-surface)]">
  <div class="max-w-3xl mx-auto px-6 text-center" data-reveal style="opacity:0">
    <h2 class="font-[var(--font-display)] text-4xl sm:text-5xl font-bold" data-i18n-en={en.contact.title} data-i18n-pt={pt.contact.title}>{en.contact.title}</h2>
    <p class="mt-4 text-[var(--color-muted)]" data-i18n-en={en.contact.body} data-i18n-pt={pt.contact.body}>{en.contact.body}</p>
    <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
      <a href="mailto:luizfernandowitt00@gmail.com" class="px-6 py-3 rounded-full bg-[var(--color-accent)] text-[var(--color-bg)] font-medium hover:scale-105 transition-transform" data-i18n-en={en.contact.email} data-i18n-pt={pt.contact.email}>{en.contact.email}</a>
      <a href="https://github.com/luizferw" target="_blank" rel="noopener" class="px-6 py-3 rounded-full border border-white/15 hover:border-white/40 transition-colors">GitHub</a>
      <a href="https://www.linkedin.com/in/luizfernandowitt" target="_blank" rel="noopener" class="px-6 py-3 rounded-full border border-white/15 hover:border-white/40 transition-colors">LinkedIn</a>
    </div>
    <p class="mt-8 font-[var(--font-mono)] text-sm text-[var(--color-muted)]" data-i18n-en={en.contact.cert} data-i18n-pt={pt.contact.cert}>{en.contact.cert}</p>
  </div>
</section>
```

Note: confirm the GitHub/LinkedIn URLs with Luiz during implementation; `luizferw` and `luizfernandowitt` are best guesses.

- [ ] **Step 3: Create `src/components/Footer.astro`**

```astro
---
import en from '../i18n/en.json';
import pt from '../i18n/pt.json';
const year = 2026;
---
<footer class="py-10 border-t border-white/5">
  <div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--color-muted)]">
    <span>© {year} Luiz Fernando Witt</span>
    <span data-i18n-en={en.footer.built} data-i18n-pt={pt.footer.built}>{en.footer.built}</span>
  </div>
</footer>
```

- [ ] **Step 4: Verify + commit**

```bash
git add -A && git commit -m "feat: tech stack, contact, footer sections"
```

---

## Task 13: Compose page + wire animations + 404

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/404.astro`

- [ ] **Step 1: Final `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import ImpactStrip from '../components/ImpactStrip.astro';
import TrustedBy from '../components/TrustedBy.astro';
import About from '../components/About.astro';
import Experience from '../components/Experience.astro';
import TechStack from '../components/TechStack.astro';
import Contact from '../components/Contact.astro';
import Footer from '../components/Footer.astro';
---
<Base title="Luiz Fernando Witt — Full Stack Engineer" description="Product-minded full stack engineer building scalable B2B SaaS and internal platforms across React/TypeScript and Python/Node.">
  <Header />
  <main>
    <Hero />
    <ImpactStrip />
    <TrustedBy />
    <About />
    <Experience />
    <TechStack />
    <Contact />
  </main>
  <Footer />
  <script>
    import { initSmoothScroll } from '../lib/smoothScroll';
    import { initAnimations } from '../lib/animations';
    initSmoothScroll();
    initAnimations();
  </script>
</Base>
```

- [ ] **Step 2: Create `src/pages/404.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="404 — Luiz Fernando Witt" description="Page not found.">
  <main class="min-h-screen grid place-items-center text-center px-6">
    <div>
      <p class="font-[var(--font-display)] text-7xl font-bold">404</p>
      <a href="/" class="mt-6 inline-block text-[var(--color-accent)] underline">← Home</a>
    </div>
  </main>
</Base>
```

- [ ] **Step 3: Full verification in browser**

```bash
npm run dev
```
Check: all sections render in order; scroll reveals fire; counters animate; Lenis smooth scroll; language toggle switches the ENTIRE page; reduced-motion (DevTools → Rendering → emulate prefers-reduced-motion) disables particles/motion but keeps content visible.

- [ ] **Step 4: Production build check**

```bash
npm run build && npm run preview
```
Expected: clean build, preview serves the full site.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: compose full page, wire animations, add 404"
```

---

## Task 14: Placeholder assets + CNAME

**Files:**
- Create: `public/CNAME`, `public/cv/luiz-witt-cv.pdf` (placeholder), `public/og/og.png` (placeholder)

- [ ] **Step 1: Create `public/CNAME`**

```bash
printf 'luizwitt.dev' > public/CNAME
```

- [ ] **Step 2: Add placeholder CV + OG image**

```bash
mkdir -p public/cv public/og
# placeholder CV: copy the existing PDF if available, else a stub
cp /home/luizferw/Downloads/LUIZ_FERNANDO_WITT_EN.pdf public/cv/luiz-witt-cv.pdf 2>/dev/null || printf '%%PDF-1.4 placeholder' > public/cv/luiz-witt-cv.pdf
# placeholder OG (1200x630) — replace later with a real export
printf 'placeholder' > public/og/og.png
```

Note: replace `public/og/og.png` with a real 1200×630 image before launch (the stub prevents a 404 but is not a valid image).

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: CNAME, placeholder CV and OG image"
```

---

## Task 15: GitHub Actions deploy to Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "ci: deploy to GitHub Pages on push to main"
```

- [ ] **Step 3: Manual steps for Luiz (document, do not automate)**

1. Create a GitHub repo and push `main`:
   `git remote add origin git@github.com:<user>/<repo>.git && git push -u origin main`
2. Repo → Settings → Pages → Build and deployment → Source = **GitHub Actions**.
3. Settings → Pages → Custom domain = `luizwitt.dev` → Save → enable **Enforce HTTPS** once the cert is issued.
4. **Cloudflare DNS** for `luizwitt.dev`:
   - For apex `luizwitt.dev`: add A records to GitHub Pages IPs `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (and AAAA `2606:50c0:8000::153` … `8003::153`), **OR** a CNAME `@` → `<user>.github.io` if using Cloudflare's CNAME flattening.
   - Set these records to **DNS only** (grey cloud) initially so GitHub can validate the domain and issue TLS. Re-enable proxy (orange cloud) afterward if desired.

---

## Self-Review

**Spec coverage:**
- Hero/Impact/Trusted/About/Experience/Stack/Contact → Tasks 7–12 ✓
- Bilingual EN/PT toggle → Tasks 3, 6 (data-i18n swap) ✓
- Astro + Tailwind + GSAP + Lenis + Three.js → Tasks 1, 5, 7 ✓
- prefers-reduced-motion → Tasks 1 (CSS), 5 (anim guard), 7 (three guard) ✓
- GitHub Pages + CNAME + custom domain + DNS → Tasks 14, 15 ✓
- SEO/OG meta → Task 2 ✓
- 404 → Task 13 ✓

**Open items carried from spec (require Luiz):** real photo (design works without one — not currently used; optional add), real CV PDF (Task 14 copies the existing one), real OG image, GitHub username/repo + confirm social URLs (Tasks 12, 15).

**Type consistency:** `data-i18n-en`/`data-i18n-pt` used consistently across all components and read by `LangToggle.astro`'s script. `data-counter`/`data-decimals` emitted in Task 8, consumed in Task 5. `Metric`/`Role`/`StackGroup` interfaces defined in Task 4, consumed in Tasks 8/11/12.
