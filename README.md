# Bloc MFB website

Astro 7 + TypeScript. Static HTML output (no server), self-hosted Manrope font, about 10 KB of JavaScript.
Chosen for SEO: every page is real server-rendered HTML with its own title, description, canonical, Open Graph tags and JSON-LD, and loads fast.

## Run

```bash
npm install
cp .env.example .env        # optional
npm run dev                 # http://localhost:4321
npm run build               # outputs dist/
npm run preview
python3 tools/qa.py         # needs: playwright, and `npm run preview` or any static server on :4321
```

## Where things live

| Path | What |
|---|---|
| `src/pages/*.astro` | One file per page. Frontmatter carries title, description, path, breadcrumb and FAQ data. |
| `src/layouts/Layout.astro` | Head, SEO tags, JSON-LD (BankOrCreditUnion, WebSite, BreadcrumbList, FAQPage), nav, footer, mobile menu, scripts |
| `src/components/` | `Nav` (data driven menus), `Footer`, `MobileMenu`, `PageHead`, `Icon` |
| `src/data/site.ts` | RC and CBN numbers, phone, email, address, store links, socials. Change facts here once. |
| `src/styles/site.css` | All styles (design tokens on `.pg`) |
| `src/scripts/site.js` | Motion layer: hero zoom pin, pinned phone scene, word and block reveals, glows, parallax, mobile menu. Honours `prefers-reduced-motion`. |
| `public/` | Assets, favicons, `og-default.jpg`, `robots.txt`, `_headers`, `_redirects` |

## SEO checklist (done)

- One `h1` per page, descriptive titles (30 to 70 chars) and meta descriptions, `lang="en-NG"`
- Canonical URLs with trailing slash, sitemap at `/sitemap-index.xml`, `robots.txt` pointing to it
- Open Graph and Twitter cards with a 1200x630 image
- JSON-LD: `BankOrCreditUnion` with address, phone, RC and CBN identifiers and social profiles; `FAQPage` on Personal, Business, Help and Supply chain finance; `BreadcrumbList` on inner pages
- Width and height on every image, hero image preloaded, font preloaded, CLS 0
- Lighthouse (mobile, throttled) on home, Personal, Business: SEO 100, Accessibility 100, Best Practices 100, Performance 87 to 93
- Leadership and Charges are `noindex` and left out of the sitemap until their placeholders are replaced. Remove `noindex` in their frontmatter when ready.

## Before launch

1. Replace the yellow `[bracketed]` placeholders: leadership names and bios, complaints and fraud emails, charge amounts and effective dates, CBN escalation wording, company story, exact legal name.
2. Replace the AI-generated photos in `public/assets/photo-*.webp` with real photography (keep file names, or update the pages).
3. Compliance review of the legal pages (see "Legal copy" below).
4. Set `PUBLIC_CONTACT_ENDPOINT` (form handler, e.g. an API Gateway + Lambda that emails support). Until then the form tells visitors to email.
5. Add a cookie consent banner before turning on `PUBLIC_GTM_ID`.
6. Submit `https://blocmfb.com/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.
7. Redirects from the old site (it was a single page app): `/faq`, `/compliance`, `/download-retail-app`, `/waitlist` are listed in `public/_redirects` and in `astro.config.mjs` (meta refresh fallback). Configure 301s at the host.

## Legal copy

Terms, Privacy policy and Privacy notice are copied from the live blocmfb.com on 12 Nov 2026. Items to raise with compliance:
- Contact details differ from the rest of the site: Banking.blocmfb@blocmfb.com and 07081566776, against support@blocmfb.com and 07042047811.
- The Privacy policy describes Bloc as "a technology company that provides digital trust solutions"; the Privacy notice says "technology-led microfinance bank".
- Retention of "up to 60 days after contract termination" may conflict with CBN record-keeping rules; the Notice adds "unless a longer period is required".
- The Terms cite the NDPR; the Privacy documents cite the NDPA.
- The Terms were last updated March 2026 and the privacy documents July 2026.

## Deploy

**S3 + CloudFront (static):** `npm run build`, sync `dist/` to the bucket. Cache `/_astro/*` and `/assets/*` for a year; cache HTML briefly. Add a CloudFront Function on viewer-request that rewrites `/about/` to `/about/index.html` (and `/about` to a 301 to `/about/`). Apply the headers in `public/_headers` through a response headers policy.

**Vercel / Netlify / Cloudflare Pages:** connect the repo, build command `npm run build`, output `dist`. `_headers` and `_redirects` work on Netlify and Cloudflare Pages as is. On Vercel, translate them into `vercel.json`.

## Notes

- `tools/port.py` was the one-off converter from the design export. It is kept for reference. Do not re-run it over edited pages.
- Page content is plain HTML inside `.astro` files, so edits are text edits.
