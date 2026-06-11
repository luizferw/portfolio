# Portfolio Site — Design Spec

**Date:** 2026-06-11
**Owner:** Luiz Fernando Witt
**Status:** Approved (design), pending spec review

## Purpose

A single-page personal portfolio that proves, in ~10 seconds, that Luiz is a
product-minded full stack engineer who ships measurable business impact. Primary
audience: recruiters and tech leads evaluating him for full stack roles. Success
= visitor immediately grasps seniority through big metrics, recognizable
enterprise client names, and visible front-end craft.

## Goals

- Communicate impact-first: headline metrics and enterprise client names above the fold.
- Demonstrate technical craft through the quality of the site itself (Awwwards-tier).
- Be fully bilingual (EN/PT) with a header toggle.
- Load fast, score well on Lighthouse, respect accessibility.
- Deploy statically to GitHub Pages on the custom domain `luizwitt.dev`.

## Non-Goals (YAGNI)

- No CMS / blog (content is hand-authored in translation files).
- No backend, database, or contact-form server (contact = mailto + social links).
- No reproduction of third-party brand logos — client names rendered as styled text only.
- No multi-page routing — single scroll-narrative page (plus 404).

## Tech Stack

- **Astro** — static output (`output: 'static'`), SEO-friendly, island architecture.
- **Tailwind CSS** — design tokens + utility styling.
- **GSAP + ScrollTrigger** — orchestrated scroll animations.
- **Lenis** — smooth scrolling.
- **Three.js** — subtle animated hero background (shader/particles) with a lightweight
  static fallback when WebGL is unavailable or `prefers-reduced-motion` is set.
- **i18n** — Astro's content-driven i18n or simple JSON dictionaries; default EN, toggle to PT.
- Interactivity delivered via Astro islands (vanilla TS or a small framework island only where needed).

## Architecture & Structure

```
/
├── astro.config.mjs        # site: 'https://luizwitt.dev', static, tailwind/integrations
├── public/
│   ├── CNAME               # luizwitt.dev
│   ├── cv/                 # CV PDF (placeholder until provided)
│   └── og/                 # social share image
├── src/
│   ├── i18n/
│   │   ├── en.json         # all English copy
│   │   └── pt.json         # all Portuguese copy
│   ├── data/
│   │   ├── experience.ts   # 3 roles, structured
│   │   ├── metrics.ts      # headline impact numbers
│   │   └── stack.ts        # categorized tech list
│   ├── components/
│   │   ├── Hero.astro            # + ThreeBackground island
│   │   ├── ThreeBackground.ts    # WebGL hero bg (island, lazy)
│   │   ├── ImpactStrip.astro     # animated counters
│   │   ├── TrustedBy.astro       # enterprise client names (styled text)
│   │   ├── About.astro
│   │   ├── Experience.astro      # interactive timeline
│   │   ├── TechStack.astro
│   │   ├── Contact.astro
│   │   ├── LangToggle.astro      # EN/PT switch
│   │   └── Header.astro / Footer.astro
│   ├── lib/
│   │   ├── animations.ts   # GSAP/ScrollTrigger setup, reveal helpers
│   │   └── smoothScroll.ts # Lenis init
│   ├── layouts/
│   │   └── Base.astro      # head, meta/OG, fonts, global providers
│   └── pages/
│       ├── index.astro     # composes all sections
│       └── 404.astro
└── .github/workflows/deploy.yml  # build + deploy to GitHub Pages
```

**Design principle:** Each section is a self-contained component reading from `src/data/*`
and `src/i18n/*`. Copy never lives inline in components — always sourced from the active
locale dictionary so EN/PT stay in sync. Animation logic is centralized in `src/lib/` so
components stay declarative.

## Sections (scroll order)

1. **Hero** — Name "Luiz Fernando Witt", role "Full Stack Engineer", one-liner tagline,
   CTAs (Contact + Download CV). Three.js animated background.
2. **Impact strip** — Animated counters for headline metrics:
   `60%+ latency reduction`, `$1.5M+ ARR served`, `200+ enterprise clients`, `9s → <1s` processing.
3. **Trusted by** — Enterprise client names as styled text: John Deere, Heineken, Coca-Cola,
   McDonald's (no logo reproduction).
4. **About** — Short narrative: product-minded, end-to-end ownership, React/TS + Python/Node.
5. **Experience** — Interactive timeline of 3 roles, each expandable with CV highlights/metrics:
   - **Carbon Free Brasil** — Full Stack Engineer (Nov 2024–Present)
   - **Manchester Investimentos** — Frontend Developer (Sep 2023–Nov 2024)
   - **Lize** — Frontend Developer / founding engineer (Jan 2023–Aug 2023)
6. **Tech stack** — Categorized: Frontend / Backend / Architecture / Cloud & DevOps /
   Databases / Monitoring, with micro-interactions. Includes AWS Certified Cloud Practitioner.
7. **Contact** — Email (mailto), LinkedIn, GitHub, AWS cert badge. Final CTA. Footer.

## Internationalization

- Header **EN/PT toggle**; default EN (CV is English, international reach).
- All visible strings come from `en.json` / `pt.json`. A missing key in one locale is a
  build-visible warning. `<html lang>` updates with locale.
- Implementation: locale stored in URL or `localStorage`; toggling re-renders text. Given the
  site is static + single page, locale switching is client-side (swap a JSON-driven text map)
  to avoid duplicate routes — finalized during planning.

## Animation & Craft

- Scroll-triggered reveals, animated counters firing on viewport entry, magnetic CTA buttons,
  subtle grain/noise overlay.
- 60fps target; GPU-friendly transforms only.
- **Accessibility:** full `prefers-reduced-motion` support (disables Three.js + heavy motion,
  keeps content fully usable); semantic HTML; keyboard navigable; AA contrast in dark theme.

## Deployment

- **GitHub Pages** serving custom domain `luizwitt.dev` (root, no `base` path needed).
- `public/CNAME` contains `luizwitt.dev`.
- `astro.config.mjs`: `site: 'https://luizwitt.dev'`.
- `.github/workflows/deploy.yml`: build Astro → deploy to Pages on push to `main`.
- **Cloudflare DNS** (delivered as instructions at the end): point `luizwitt.dev` to GitHub
  Pages (CNAME/ALIAS to `<user>.github.io` or GH Pages A/AAAA records), set DNS-only (grey
  cloud) so GitHub can issue the TLS cert, enable "Enforce HTTPS" in repo Pages settings.

## Assets / Open Items

- **Client names:** styled text only (no logos) — legally safe, visually cohesive.
- **Photo:** placeholder until Luiz provides one (optional — design works without a photo).
- **CV PDF:** placeholder in `public/cv/` until the real file is dropped in.
- **GitHub username / repo name:** needed for the Actions workflow and DNS target — confirm
  during implementation.

## Testing / Verification

- Lighthouse: Performance / Accessibility / Best Practices / SEO ≥ 90.
- Manual: both locales render fully; reduced-motion path works; mobile + desktop layouts; CTAs work.
- Build passes with no missing-i18n-key warnings.
