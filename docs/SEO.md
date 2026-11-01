# SEO, Search Console & Analytics

## What is already in place

| Area | Where |
| --- | --- |
| Titles, descriptions, keywords, canonical URLs | `src/app/layout.tsx`, `src/app/projects/[slug]/page.tsx`, `src/lib/site.ts` |
| Open Graph + X/Twitter cards (1200×630, pre-rendered by `npm run og`) | `src/app/opengraph-image.tsx`, `src/app/projects/[slug]/opengraph-image.tsx`, `src/lib/og.ts`, `assets-src/og/` |
| Structured data: `WebSite`, `ProfilePage`, `Person`, `BreadcrumbList`, `CreativeWork` | `src/lib/structured-data.ts` |
| `sitemap.xml`, `robots.txt`, web manifest, icons | `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/manifest.ts`, `src/app/icon.svg`, `src/app/apple-icon.png` |
| Real 404s for unknown case studies | `src/proxy.ts` |

All important text is server-rendered, so it is readable without JavaScript.

## 1. Set the site URL

Set `SITE_URL` (e.g. `https://masoodpk.dev`) in your host's environment variables
and redeploy. Every canonical link, the sitemap and structured data use it.
On Vercel, if it is unset, the production `*.vercel.app` URL is used.

## 2. Google Search Console

1. Go to <https://search.google.com/search-console> → **Add property**.
2. Prefer a **Domain** property (verify with a DNS TXT record at your domain registrar).
   For a **URL-prefix** property instead, choose **HTML tag**, copy only the
   `content="…"` value, set it as `GOOGLE_SITE_VERIFICATION`, redeploy, then click **Verify**.
3. **Sitemaps** → submit `https://<your-domain>/sitemap.xml`.
4. **URL Inspection** → inspect the home page → **Request indexing**. Repeat for each case study.
5. Check **Enhancements** after a few days for structured-data reports.

Validate structured data any time with <https://search.google.com/test/rich-results>
and <https://validator.schema.org/>.

## 3. Analytics (privacy-friendly options)

None is installed by default, so the site sets no cookies and needs no consent banner.

- **Vercel Web Analytics** (simplest on Vercel): enable it in the project's
  **Analytics** tab, then `npm i @vercel/analytics` and add `<Analytics />` from
  `@vercel/analytics/next` inside `<body>` in `src/app/layout.tsx`.
  Add **Speed Insights** the same way (`@vercel/speed-insights`) to track real-user Core Web Vitals.
- **Plausible / Umami**: add their `<Script>` tag via `next/script` in `src/app/layout.tsx`.
- **Google Analytics 4**: use `@next/third-parties/google` (`<GoogleAnalytics gaId="G-…" />`).
  GA4 sets cookies — add a consent banner if you target visitors in the EU/UK.

## 4. Keep it healthy

- Update content in `src/content/*` — titles, descriptions and JSON-LD update automatically.
- Re-run `npm run test:e2e` (includes axe accessibility checks) before deploying.
- Re-run Lighthouse on the deployed URL after big changes.
