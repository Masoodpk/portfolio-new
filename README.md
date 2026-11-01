# Masood PK — Portfolio

Interactive portfolio of **Masood PK**, Software Developer (Vue.js, Nuxt.js, React, Next.js).
The hero is a real rigged 3D hand that turns, builds tension and **snaps** as you scroll. Everything
a recruiter needs (who, what, experience, stack, projects, CV, contact) is readable in the first
screen and works without WebGL or JavaScript.

## Highlights

- **Scroll-driven 3D hero:** a Blender-rigged hand (React Three Fiber). Scrolling scrubs the build-up, the snap plays in real time, then the hand settles.
- **Recruiter summary** right under the hero, plus a one-click CV download in the header, hero and contact section.
- **Case-study pages** for each project at `/projects/<slug>`, with role, approach and interface previews.
- **Interactive skills map** that separates *used professionally* from *studied/personal*. No fake percentages.
- **Developer terminal** (`help`, `projects`, `cv` …) with a fixed command list. It never evaluates input.
- **Contact form** with shared validation, a honeypot, rate limiting and a mailto fallback.
- **Performance:** the home page scores Lighthouse 100 / 100 / 100 / 100 on mobile and desktop (local production build). three.js loads lazily and stays out of the initial bundle.
- **Accessibility:** WCAG 2.2 AA (axe-core in CI tests), keyboard navigation, a skip link and reduced-motion support.
- **SEO:** metadata, canonical URLs, generated Open Graph images, JSON-LD (`Person`, `ProfilePage`, `WebSite`, `BreadcrumbList`), sitemap and robots.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4 with design tokens in `src/app/globals.css` |
| 3D | three.js, @react-three/fiber, @react-three/drei (meshopt-compressed GLB) |
| Motion | CSS scroll-driven animations + a small rAF loop for the 3D scene |
| Icons | lucide-react |
| Email | Resend HTTP API (optional) |
| Tests | Vitest (unit) and Playwright + axe-core (end-to-end, accessibility, SEO) |

Fonts: Archivo (display), Geist (body) and Geist Mono (labels), self-hosted via `next/font`.

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
| `npm run model` | Re-compress the hand model from `assets-src/models` |
| `npm run poster` | Re-capture the static hand poster (needs `npm run dev` running) |
| `npm run shots` | Re-capture project screenshots from the live sites |

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
    layout/               Header (nav, mobile menu), footer, skip link, cursor
    sections/             Hero, About, Experience, Skills (+ map), Projects, Console, Contact
    projects/             Project visuals and Easify interface schematics
    three/                3D hand: lazy island, scene, timeline maths, error boundary
    ui/ seo/              Buttons, tags, frames, JSON-LD
  content/                ← all personal data lives here
  lib/                    Site config, structured data, contact validation, terminal, layouts
  proxy.ts                Real 404s for unknown case studies
assets-src/               Source assets (original GLB, OG fonts) — not served
public/                   CV, compressed model, images, icons
scripts/                  Poster and screenshot capture
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
becomes `/projects/<slug>`, and it's added to the sitemap, terminal and home page automatically.
Put images in `public/images/projects/<slug>/` (WebP, about 2000px wide for desktop shots) and
reference them in `visuals`. The first visual is used as the cover.

**Replace the CV:** overwrite `public/cv/Masood-PK-Software-Developer-CV.pdf` (or change
`profile.cv` if you rename it). Use a text-based, searchable PDF.

**Replace the portrait:** replace `src/assets/masood-pk.png` (used on the page) and
`public/images/masood-pk.jpg` (used in structured data).

## Replacing the 3D hand

1. Export from Blender as **glTF Binary (.glb)**, with the armature, skinning and these actions
   (names matter): `Snap` (preparation → release → hold) and `Recovery` (from the Snap end pose).
2. Save it as `assets-src/models/hand_snap_v2.glb` and run `npm run model`. This writes the compressed
   `public/models/hand.glb` (meshopt geometry, 1024px WebP textures).
3. If the timing of the snap changes, update `SNAP_CLIP` in `src/components/three/hand-timeline.ts`
   (the release is the frame where the middle finger moves fastest).
4. With `npm run dev` running, run `npm run poster` to refresh the static fallback image.

The scene is only downloaded after the page is idle (desktop) or on the first scroll or touch (phones).
It never loads for reduced-motion or Data Saver users, and it falls back to the poster if WebGL
is unavailable or the model fails to load.

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
- `npm run test:e2e` passes (hero and 3D fallbacks, case studies, terminal, form, axe, SEO).
- Lighthouse on the deployed URL, both mobile and desktop.

## License

Code and personal content: all rights reserved © Masood PK. Fonts are licensed under the SIL Open Font License.

The hand model's original mesh came from a third-party source. Confirm its license, and add any
required attribution here, before publishing.
