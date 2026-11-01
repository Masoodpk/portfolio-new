# Masood PK — Portfolio

Interactive portfolio of **Masood PK**, Software Developer (Vue.js, Nuxt.js, React, Next.js).
The theme is **"Kerala to the world"**: an editorial paper-and-ink layout with one cobalt accent,
and a single particle world behind the page that changes shape as you scroll, from a seed planet
in Kozhikode to a globe with flight paths to the Gulf. Everything a recruiter needs (who, what,
experience, stack, projects, CV, contact) is readable in the first screen and works without WebGL.

## Highlights

- **One particle world, six shapes:** about 11,000 points morph per section: planet (hero) → "MPK" initials (About) → a winding road (Career) → five skill clusters (Toolkit) → a wave field (Work) → a real dotted globe with arcs from Kozhikode to Dubai, Abu Dhabi, Riyadh, Jeddah, Doha, Muscat and Manama (Contact).
- **Scroll storytelling in CSS:** masked line reveals, a lead paragraph that inks in word by word, parallax and a pinned sideways "road trip" through the career stops, all with CSS scroll-driven animations.
- **Recruiter-first:** CV download in the header, hero and contact section; current role first; case-study pages at `/projects/<slug>`.
- **Honest skills:** each skill is marked *used at work* or *studied & personal projects*, with a one-line note. No percentages. Picking a category spotlights its particle cluster.
- **Contact form** with shared validation, a honeypot, rate limiting and a mailto fallback.
- **Performance:** three.js loads only after the page is idle and never for reduced motion or Data Saver; the first paint is plain HTML and CSS.
- **Accessibility:** WCAG 2.2 AA (axe-core in the test suite), keyboard navigation, a skip link and reduced-motion fallbacks for every animation.
- **SEO:** metadata, canonical URLs, Open Graph cards, JSON-LD (`Person`, `ProfilePage`, `WebSite`, `BreadcrumbList`), sitemap and robots.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4 with design tokens in `src/app/globals.css` |
| 3D | three.js (one `Points` mesh with a custom shader; globe land data pre-computed from Natural Earth) |
| Motion | CSS scroll-driven animations, Lenis smooth scrolling (fine pointers only) |
| Icons | lucide-react |
| Email | Resend HTTP API (optional) |
| Tests | Vitest (unit) and Playwright + axe-core (end-to-end, accessibility, SEO) |

Fonts: Instrument Serif (display) and Manrope (body), self-hosted via `next/font`.
Colours: paper `#F2EEE5`, ink `#141414`, cobalt `#2340FF` (tokens in `src/app/globals.css`).

## Getting started

Requires **Node.js 20.9+** (developed on Node 24).

```bash
npm install
cp .env.example .env.local   # optional: only needed for the contact form / SEO URL
npm run dev                  # http://localhost:3000
```

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run check` | Type-check, lint, unit tests and production build |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end, accessibility and SEO tests (Playwright with your local Chrome; serves the last production build) |
| `npm run shots` | Re-capture project screenshots from the live sites |
| `npm run og` | Re-render the Open Graph share cards into `assets-src/og/` (uses local Chrome) |
| `npm run icons` | Re-draw the favicon, Apple touch icon and PWA icons |
| `npm run globe` | Rebuild the globe's land points (`public/data/land-points.bin`) |

To run end-to-end tests against a fresh production build:

```bash
npm run build
npm run test:e2e
```

## Project structure

```text
src/
  app/                    Routes, metadata, sitemap/robots/manifest, OG images, /api/contact
    projects/[slug]/      Case-study pages (statically generated)
  components/
    layout/               Header (nav, mobile menu), footer, skip link, smooth scroll
    sections/             Hero, About, Experience, Skills, Projects, Contact
    projects/             Project visuals and Easify interface schematics
    world/                Particle world: shapes, stage layouts, shader, canvas wiring, journey rail
    ui/ seo/              Browser frame, JSON-LD
  content/                ← all personal data lives here
  lib/                    Site config, structured data, contact validation, OG cards
  proxy.ts                Real 404s for unknown case studies
assets-src/               OG fonts and pre-rendered share cards — not served directly
public/                   CV, images, icons, globe land points
scripts/                  Screenshots, OG cards, icons, globe data
tests/unit, tests/e2e     Vitest and Playwright suites
docs/SEO.md               Search Console, analytics and SEO notes
```

## Updating content

All text comes from **`src/content/`**, so you never need to touch a component to update facts.

| File | Contains |
| --- | --- |
| `profile.ts` | Name, title, email, location, availability, headline, About text, social links, CV path |
| `experience.ts` | Career timeline (jobs, education, certification) |
| `skills.ts` | Skills, category, `usage: "professional" \| "learning"`, one-line note and related skills |
| `projects.ts` | Projects and case studies (role, contributions, approach, visuals, links) |
| `navigation.ts` | Header navigation order |

**Add a project:** append an object to `projects` in `src/content/projects.ts`. Its `slug`
becomes `/projects/<slug>`, and it's added to the sitemap and home page automatically (run `npm run og` for its share card).
Put images in `public/images/projects/<slug>/` (WebP, about 2000px wide for desktop shots) and
reference them in `visuals`. The first visual is used as the cover.

**Replace the CV:** overwrite `public/cv/Masood-PK-Software-Developer-CV.pdf` (or change
`profile.cv` if you rename it). Use a text-based, searchable PDF.

**Replace the portrait:** replace `src/assets/masood-pk.png` (used on the page) and
`public/images/masood-pk.jpg` (used in structured data).

## The particle world

`src/components/world/` holds the whole 3D layer:

- `shapes.ts` generates each shape as the same number of points (seed planet, initials, road, clusters, wave, globe).
- `stages.ts` sets where each shape sits per section (position, scale, tilt, spin, opacity, facing), with phone overrides.
- `ParticleWorld.ts` is the renderer: one shader blends between neighbouring shapes as the stage changes.
- `WorldCanvas.tsx` loads it when the browser is idle and maps scroll to a stage. Each section opts in with `data-world-stage="N"`; `data-world-hold` sets how far through the section the next morph starts.

It never loads for reduced-motion or Data Saver users; the page then shows a static dotted globe
(`StaticGlobe.tsx`) and every scroll animation falls back to its finished state.

## Environment variables

See `.env.example`. All are **server-only**; never prefix them with `NEXT_PUBLIC_`.

| Variable | Needed for |
| --- | --- |
| `SITE_URL` | Canonical URLs, sitemap, OG and JSON-LD (falls back to the Vercel production URL) |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Contact-form email delivery. Without them, the form shows an "email me directly" fallback |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console HTML-tag verification (optional) |

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Go to <https://vercel.com/new>, import the repository, and keep the defaults (framework: Next.js).
3. Add the environment variables above under **Settings → Environment Variables** (Production).
4. Deploy. Every push to `main` redeploys, and pull requests get preview URLs.

### Custom domain

1. Vercel project → **Settings → Domains** → add `your-domain.com` (and `www.your-domain.com`).
2. At your registrar, create the DNS records Vercel shows. Usually that's an `A` record for the apex
   domain and a `CNAME` for `www` pointing to Vercel. HTTPS is issued automatically.
3. Set `SITE_URL=https://your-domain.com` and redeploy so canonical links and the sitemap use it.
4. Follow `docs/SEO.md` to verify the domain in Google Search Console and submit the sitemap.

### Contact form email (Resend)

1. Create an account at <https://resend.com> and verify your domain (Domains → Add).
2. Create an API key and set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` (your inbox) and
   `CONTACT_FROM_EMAIL` (for example `Portfolio <hello@your-domain.com>`).
3. Redeploy, then send yourself a test message from the live site.

Other Node hosts (Netlify, Render, a VPS) also work. Run `npm run build && npm start`
with the same environment variables.

## Quality checklist

- `npm run check` passes (types, lint, unit tests, build).
- `npm run test:e2e` passes (case studies, skills, contact form, axe, SEO).
- Lighthouse on the deployed URL, both mobile and desktop.

## License

Code and personal content: all rights reserved © Masood PK. Fonts are licensed under the SIL Open Font License.
Globe land data: Natural Earth (public domain) via `world-atlas`.
