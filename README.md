# Masood PK — Portfolio

Portfolio of **Masood PK**, Software Developer (Vue.js, Nuxt.js, React, Next.js), from Kozhikode, Kerala.
The whole site is **a hand-painted 3D rainforest** in the misty Western Ghats. Scrolling flies a camera through
it like a slow drone shot inside a moving painting, and the portfolio's chapters appear as the camera reaches each
place.

> **Status: all 5 stages done (painted).** The painterly look, the Ghats, the giant 3D name and the opening push
> (1); the flight over the name, gorge and canopy dive, About on painted paper (2); the ancient banyan with glowing
> skill pods, the painted river and the projects as framed canvases on the bank (3); the waterfall with the journey
> carved into the cliff, and the light moving from misty morning to monsoon night (4); the painted-leaf loader,
> the forest's sound, phone tuning, painted stills for reduced motion and no WebGL, and new share cards and
> icons (5).

**Time of day:** the light follows the scroll through four moods (morning → golden afternoon → sunset → monsoon
night). Each mood is one palette in `src/components/world/daylight.ts` (sky, sun, ambient light, fog, water, mist);
change a colour there, or move where a mood is reached in `moodScrolls()`.

**Loading, sound and fallbacks:**

- **Loader** (`components/world/Loader.tsx`): a leaf is drawn as the forest loads (scene code, canvas, the 3D
  name's font, the first frames; milestones reported through `lib/worldState.ts`), then opens and fades. Without
  JavaScript it fades out on a CSS timer, and it never waits longer than 15 s.
- **Sound** (`lib/forestSound.ts`, toggle in the header): synthesised live with Web Audio, no audio files: wind in
  the canopy, the river and the falls by day, crickets and monsoon rain at night.
  The mix follows the scroll. Off until the visitor turns it on.
- **Stills** (`components/world/Stills.tsx`): without WebGL, or with reduced motion, each chapter shows a painted
  still of the forest (landscape and portrait, `public/stills/`) that crossfades as you scroll, instead of the
  flight. Re-paint them after changing the world: `npm run stills` (see Scripts).
- **Phones:** lighter forest detail, and long panels scroll through the middle of their chapter instead of
  staying pinned, so the forest gets the screen before and after each one.

## The art style

Everything is meant to look painted rather than rendered:

- **Brush strokes in the materials** (`components/world/shaders.ts`, `paint()`): a procedurally painted stroke
  texture is projected onto every surface in world space. It varies the colour like gouache and nudges the
  normals so light breaks into strokes.
- **Kuwahara paint filter** (`components/fx/KuwaharaEffect.ts`): a post-process that turns pixels into patches of
  paint while keeping edges; its sampling grid turns across the image so strokes run in different directions.
- **Paper** (`components/fx/PaperGrain.ts`): grading (cool shadows, warm highlights), paper tooth, fibres, grain and
  a vignette.
- **Painted fog** (`components/fx/PaintedFog.ts`): distance + height fog; valleys hold mist and far ranges fade to
  sky blue. Painted mist sheets (`world/Mist.tsx`) drift between the layers.
- **Depth of field** on capable GPUs, focused where the camera looks.
- **The Ghats** (`lib/geography.ts`, `world/Terrain.tsx`): broad ridgelines from ridged noise rising north of an
  irregular escarpment; shola forest painted into the valleys and folds, pale grassland on the crests and mossy rock
  on the steepest faces.
- **The forest** (`world/Canopy.tsx`, `world/Understory.tsx`, `world/foliageCards.ts`, `world/foliage.ts`): trees
  built from painted cards (a canvas atlas of needle sprays, leaf clusters, fern fronds and grass, cut out by
  alpha): broadleaf trees with leafy crowns on buttressed trunks, tiered evergreens (whorls of drooping sprays,
  more of them on higher ground), wide umbrella emergents, lianas, palms along the river, and a forest floor of
  ferns (some dried to bronze), grass tufts, broad-leaved plants, wildflowers, mossy rocks, logs and mushrooms
  wherever the camera flies low. Cards carry "volume" normals so a crown is lit as a whole. All instanced.
- **The mountains** (`lib/geography.ts`, `world/shaders.ts`, `world/Mist.tsx`): ridged peaks with gullies carved
  down their flanks; green slopes with bare rock in streaks, pale weathered rock on the high ridges, and cloud
  caught on the highest summits.
- **The flight** (`lib/cameraPath.ts`): the camera flies over the name and down the river into the gorge
  (`GORGE` in `lib/geography.ts`), then on to the mouth of the gorge, curving left around the end of the left wall
  and down along the bank into the forest.
- **The canopy dive** (`world/CanopyDive.tsx`): giant leaves hung beside the descent sweep past the lens; soft
  shafts of sunlight and drifting pollen fill the About clearing.
- **The ancient tree** (`world/GiantTree.tsx`, `world/SkillPods.tsx`): a banyan of twisted trunks, buttress roots,
  great branches, a layered crown, aerial roots and orchids, alone in its glade (`GIANT_TREE` in `lib/scenes.ts`).
  Each skill is a glowing seed pod hung where the camera looks at its moment in the chapter; it lights and its
  serif label appears as the camera passes. Two butterflies circle the trunk.
- **The river** (`world/River.tsx`, `world/ProjectCanvases.tsx`): painted water (deep channel, jade shallows, the
  banks' green and the sky softly reflected, brush strokes drifting downstream, foam on the banks and around
  rocks). Each project is a large framed canvas on a rock by the water, with its picture painted on. Hovering a
  project card tilts its canvas and sends ripples across the river (`projectHover` in `lib/scenes.ts`).
- **Wildlife** (`world/Wildlife.tsx`): Western Ghats butterflies flapping on looping paths, rabbits hopping about and
  Malabar giant squirrels dashing between pauses.
- **No flying through trees:** `lib/forest.ts` samples the camera's whole flight path; nothing is planted where it
  would touch it, so the camera always passes through natural clearings.
- Palette: jungle `#1E3B2C` `#2F5A3C`, moss `#7FA650`, lime `#C5D86D`, ochre `#D9B26A`, sky `#BFD9DE` → `#6FA3C8`,
  orchid `#E39BB0`, flame red `#C8452F`, ochre `#F2C14E`.

## The journey

| # | Chapter | Place | Camera |
| --- | --- | --- | --- |
| 1 | Home | The misty Ghats | A wide view north to the peaks; the 3D name faces the camera, then the camera pushes past it as it turns and slides away |
| 2 | Flight | The flight | Over the name and down the river into the gorge |
| 3 | About | Through the canopy | Dives into the trees and settles under the leaves |
| 4 | Skills | The ancient tree | Spirals up around a giant tree |
| 5 | Projects | The river | Flies low over the water, upstream |
| 6 | Journey | The waterfall | Approaches the falls and rises alongside them |
| 7 | Contact | Monsoon night | The forest floor, then the final pull back to a wide view of the whole forest |

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| 3D | Three.js via React Three Fiber + drei + @react-three/postprocessing; custom GLSL for paint, fog, water and wind |
| Motion | Lenis smooth scrolling (lerp 0.06, wheel × 0.8) on GSAP's ticker; GSAP ScrollTrigger for the panels |
| Email | Resend HTTP API (optional) |
| Tests | Vitest (unit) and Playwright + axe-core (end-to-end, accessibility, SEO) |

Fonts: Cormorant Garamond (headings and the 3D name; `npm run typeface` converts it for three.js) and DM Sans
(body), self-hosted via `next/font`.

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
| `npm run typeface` | Convert Cormorant Garamond into the typeface JSON for the 3D name (`public/fonts/`) |
| `npm run stills` | Paint the chapter stills (`public/stills/`, plus PNGs in `assets-src/stills/` for the share cards) from the running site: `npm run build && npx next start -p 3100` first, or set `BASE_URL` |
| `npm run og` | Re-render the Open Graph share cards into `assets-src/og/` from the stills (uses local Chrome) |
| `npm run icons` | Re-draw the favicon, Apple touch icon and PWA icons (the leaf on forest green) |

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
    world/                The 3D world: Scene, CameraRig, Terrain, Mountains, Canopy, Understory, foliage, River,
                          Waterfall, JourneyLedges, NightForest (rain, fireflies, fungi), Mist, Sky, daylight
                          (time of day), Name3D, Effects, shaders (paint)
    fx/                   KuwaharaEffect, PaperGrain, PaintedFog
    ui/                   Nav, ChapterMarkers, ChapterPanel (masked line reveals: data-reveal), CopyEmail
    layout/               Smooth scroll (Lenis), skip link
    sections/             Contact form
    projects/ ui/ seo/    Project visuals, browser frame, JSON-LD
  data/content.ts         ← all text lives here (name, bio, skills, projects, career, links, chapters)
  lib/
    cameraPath.ts         ← every camera shot of the journey (easy to tweak)
    geography.ts          The world's shape: terrain height, the river's course, tree placement
    journey.ts            Scroll ↔ camera bookkeeping, smooth scroll handle, chapter links
    forest.ts             Clearings along the camera's path; where the understory grows
    site.ts, structured-data.ts, contact.ts, og.ts
public/                   CV, images, icons
tests/unit, tests/e2e     Vitest and Playwright suites
```

## Updating content

All text comes from **`src/data/content.ts`**: name, title, tagline and links (`profile`), the About text
(`about`), career (`timeline`), skills, projects and the journey's `chapters`.

**Add a project:** append an object to `projects`. Its `slug` becomes `/projects/<slug>` and it's added to the
sitemap and home page automatically. Put images in `public/images/projects/<slug>/` (WebP) and reference them in
`visuals`; the first visual is the cover.

**Replace the CV:** overwrite `public/cv/Masood-PK-Software-Developer-CV.pdf` (or change `profile.cv`).

**Replace the portrait:** replace `src/assets/masood-pk.png` and `public/images/masood-pk.jpg`.

**3D models:** none. The whole world is built in code.

## The camera (tweaking the film)

- **Shots:** `src/lib/cameraPath.ts` lists every shot in flight order: where the camera is (`position`), what it
  looks at (`target`), its lens (`fov`) and when it happens (`at`, a moment within its chapter's section).
  Two Catmull-Rom curves run through all positions and all targets.
- **Timing:** each chapter is a `ChapterPanel` in `src/app/page.tsx`; its `length` (in screen heights) sets how
  long that leg of the flight takes. Taller = slower.
- **Feel:** `src/components/world/CameraRig.tsx` eases between shots (so the camera lingers at each), damps toward
  the target every frame (`DAMPING = 0.06`; lower is heavier), banks into turns like a drone (`BANK`, `MAX_BANK`)
  and adds a little mouse parallax (`PARALLAX`). Portrait screens get a wider lens. With reduced motion the
  live scene is replaced by the crossfading stills.
- **The name:** `NAME` in `cameraPath.ts` places the 3D title. It opens as flat white type over the mountains
  ("Scroll to start"); as the visitor scrolls it gains its depth and bevel (`Name3D.tsx`) while the camera pushes
  in and flies over it.
- **The world:** `src/lib/geography.ts` shapes the terrain, the river's course (`river`), the cliff and plateau
  (`WORLD`) and where trees grow. Shots use `overRiver()` / `overGround()` so they stay on the map if you move
  the river.
- **Quality:** `Scene.tsx` sets forest detail per device, and drei's `PerformanceMonitor` moves between three
  tiers while it runs (resolution, Kuwahara radius, depth of field; see `Effects.tsx`).

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
