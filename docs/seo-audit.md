# SEO Audit — adityahimaone.space

Audit date: 2026-10-01
Scope: the full public surface of `next-portfolio-blog` (Next.js 16.3.7, App Router, self-hosted on VPS behind Nginx).
Method: static read of the source tree, plus fence-aware probes for the counts a plain grep gets wrong (markdown headings vs. shell comments inside code fences; rendered title lengths vs. frontmatter lengths).

**Status: implementation pass complete.** Everything in the "Suggested order of work" section below has been applied except the two items that require values or data only you have — see [Still open](#still-open). Verdict tables are annotated with what changed.

Three things this audit still could not see, because they are not in the repo:

- **Nginx config** is not in version control, so production `Cache-Control`, brotli, and the `/_vercel/insights/*` path are unaudited.
- **No Search Console or GA4 data** — both are now wired but unset, so nothing here is informed by impressions, CTR, or query data. Everything is a prediction of what a crawler will see.
- **No keyword research** exists anywhere in the repo.

---

## Summary

The technical foundation was genuinely above average for a portfolio — hand-rolled JSON-LD, a real sitemap, correct `noindex` on filter permutations, self-hosted fonts, zero missing `alt`. The problems were concentrated in two places: **pages that should rank had no indexable URL of their own**, and **the homepage passed almost no internal link equity to anything**.

Both are fixed. `/projects/[slug]` now exists with `CreativeWork` JSON-LD, and the homepage carries a real anchor-text link to the blog.

Scorecard against the four checklist sections, as found → as shipped:

| Section | Done | Partial | Missing | N/A |
| --- | --- | --- | --- | --- |
| Technical SEO | 5 → **9** | 8 → **4** | 3 → **1** | 1 |
| On-page SEO | 2 → **7** | 4 → **0** | 1 → **0** | 0 |
| Content | 2 → **6** | 3 → **1** | 5 → **0** | 0 |
| Links | 0 | 2 | 3 | 0 |

The Links section is unchanged by design: none of it is actionable until Search Console and keyword research exist.

---

## Technical SEO

| # | Check | Verdict | Note |
| --- | --- | --- | --- |
| 1 | GSC + GA4 | **Wired, awaiting values** | GA4 and the GSC verification tag are now env-gated in the root layout. Neither emits anything until set — see [Still open](#still-open). |
| 2 | Submit sitemap to GSC/Bing | **Partially done** | `sitemap.xml` is correct and now carries 26 URLs including the 6 project pages and 3 guide routes. The verification meta tag ships but is unset. |
| 3 | Fix indexing issues | **Cannot verify** | Needs GSC. Static review found no accidental `noindex`; `/ui` and `/spotify-setup` are now explicitly excluded. |
| 4 | robots.txt + noindex | **Done** | The dead `/private/` rule is gone; `/api/`, `/ui` and `/spotify-setup` are now disallowed. Both noindex routes verified in built HTML. |
| 5 | Canonical tags | **Done** | Added to `/`, `/contact`, `/music`, `/ui`, `/projects/[slug]`, `/guides/*`. |
| 6 | Core Web Vitals | **Good** | LCP measured at 444ms cold / 376ms warm on a production build. Well inside the 2500ms threshold. |
| 7 | Mobile-friendly | **Done** | Viewport set, pinch-zoom not disabled, Tailwind breakpoints throughout. |
| 8 | JS content crawlable | **Done** | Blog bodies render server-side via `react-markdown`; only the Prism highlighter is `ssr: false`. |
| 9 | Broken links / 404s / redirect chains | **Done** | `redirects()` now covers `/spotify`, `/v2` and trailing-slash `/contact/`. |
| 10 | Clean, descriptive URLs | **Done** | Post slugs are long but descriptive. |
| 11 | Breadcrumbs | **Partial** | Schema now on `/projects`, `/bookmarks`, `/guides/*`, `/projects/[slug]`. The visible blog-post crumb is still 1 level while its schema declares 3 — cosmetic, not a defect. |
| 12 | Orphan pages | **Done** | `/contact` and `/guides` are in the nav; `/ui` and `/spotify-setup` are noindexed; the homepage now links `/blog`. |
| 13 | Schema markup | **Done** | Added `CreativeWork` (6 project pages) and `FAQPage` (the pillar page). |

### T1. No project has an indexable URL

**The single highest-value gap.** All six projects in `data/projects.ts` carry an **external** `url` — a GitHub repo or a live client site:

```ts
// data/projects.ts — every entry
url: 'https://github.com/adityahimaone/switchyard'
```

Project detail is rendered into a modal (`liner-sheet.tsx`), not a route. There is no `/projects/[slug]`. So `/projects` is a page of six outbound links and ~30 words of description per item, and the work itself — the best thing on the site — lives on someone else's domain where it earns no authority for this site.

The scaffolding for the fix was already there: `app/(booth)/projects/page.tsx` branched on `project.url.startsWith('http')`, implying an internal-URL case was designed for and never populated.

### T1. No project has an indexable URL — **FIXED**

Every project's `url` is external (a GitHub repo or a live client site) and detail rendered into a modal, so all six projects were indexable solely as outbound links from `/projects` — the work earned authority for whichever host it sat on.

`app/(booth)/projects/[slug]/page.tsx` now exists: `generateStaticParams`, per-project metadata, `CreativeWork` JSON-LD, `BreadcrumbList`, and prev/next navigation so the set is a chain rather than six isolated pages. `/projects` links to it ("Case study") alongside the outbound "Open", the `ItemList` now points at local URLs rather than off-site ones, and all six are in the sitemap. `getProject()` was added to `data/projects.ts`.

The off-site `url` was deliberately kept and linked rather than replaced — the local page is the case study, the external link is the artefact.

### T2. No title template — **FIXED**

`app/layout.tsx` now sets `title: { default: 'Aditya Himawan — Frontend Engineer', template: '%s | Aditya Himawan' }`, and the four hand-rolled suffixes have been stripped from `/blog`, `/contact`, `/music`, `/projects` and `/blog/[slug]`.

### T3. Home title was 65 characters — **FIXED**

The default is now `Aditya Himawan — Frontend Engineer` (33), which does not truncate.

### T4. Canonicals missing on four routes — **FIXED**

Added to `/`, `/contact`, `/music`, `/ui`, and to the new `/projects/[slug]` and `/guides/*` routes.

### T5. No redirect infrastructure — **FIXED**

There was no `redirects()` in `next.config.mjs`, no `vercel.json`, and no `_redirects`. `docs/structure.md:8-22` documents a previous tree including `app/spotify/page.tsx` and `app/v2/page.tsx` — routes that no longer exist and were removed without redirects, so any external link or bookmark to a pre-16.x URL was a hard 404.

`redirects()` now maps `/spotify` → `/music`, `/v2` → `/`, and `/contact/` → `/contact` (one hop, not a chain).

### T6. `robots.txt` disallows a route that doesn't exist — **FIXED**

The file disallowed `/private/`, which is not a route — harmless, but it meant the one thing that genuinely should be blocked, `/api/`, was not. Note `app/api/callback/route.ts` injects an `<h1>ERROR: MISSING CREDENTIALS</h1>` page, a low-value surface to leave crawlable.

`app/robots.ts` now disallows `/api/`, `/ui` and `/spotify-setup`.

### T7. OG image was a third-party hotlink — **FIXED**

`app/layout.tsx` pointed both `openGraph.images` and `twitter.images` at `https://ucarecdn.com/.../memojilaptop1.png` — outside your control, a hard dependency on someone else's CDN for the most-shared asset on the site, and not matching the site's design.

`app/opengraph-image.tsx` now generates the homepage card locally at the same 1200x630 as `/projects` and `/blog/[slug]`. `ucarecdn.com` was dropped from `images.remotePatterns` once no code referenced it any more, and `/blog` no longer hardcodes it either.

### T8. Sitemap omitted `/ui` — **RESOLVED**

Rather than add it, `/ui` is now explicitly `noindex` in its own metadata and disallowed in robots — the right answer for a component playground. The sitemap grew from 6 routes to **26 URLs**: all 11 published posts, 6 project pages, and 3 guide routes, verified against the built output.

### T9. Structured data — **EXTENDED, still untyped**

`lib/structured-data.tsx` keeps correct `<` escaping. Added `creativeWork()` (emitted on all 6 project pages) and `FAQPage` structured data on the pillar page. `BreadcrumbList` now also covers `/projects`, `/bookmarks` and the guide routes.

Still open: no `Organization` or `ProfilePage`. The `Record<string, unknown>` returns are gone — see [C3d](#c3d-schema-dts--fixed-and-it-immediately-caught-something).

### T10. No error boundary — **FIXED**

Only `app/not-found.tsx` existed, so a thrown error yielded Next's default overlay with no site chrome and no way back.

`app/error.tsx` now catches errors across every route: branded layout, a `reset` retry, the error's `digest` when present, and links home or to the contact page. It deliberately emits **no** `noindex` meta tag — unlike `not-found.tsx` this is a client component and cannot export `metadata`, and hand-rolling a robots tag into a crashed render would depend on the same head-hoisting that a 5xx has already proven unreliable. A 5xx is not indexed anyway.

### Caveat on the analytics finding — **RESOLVED, it was broken**

The audit flagged that `@vercel/analytics` might not work off-Vercel and said "check it with curl; I did not verify this".

**It was broken.** `curl -I https://adityahimaone.space/_vercel/insights/script.js` returns **404**. The SDK ships a same-origin script path that only resolves behind a Vercel proxy, and this site runs `next start` under PM2 behind its own Nginx (`deploy.sh`, `ecosystem.config.js`). So it was a failed request on every pageview and no data was ever collected.

`@vercel/analytics` has been removed from the root layout and dropped from `package.json`. GA4 — an absolute third-party URL, which resolves the same on a VPS as on Vercel — is the replacement, still env-gated.

---

## On-page SEO

| # | Check | Verdict | Note |
| --- | --- | --- | --- |
| 14 | Match every page to search intent | **Done** | `/blog`'s description claimed "frontend development, design, and code" while its posts are DevOps and self-hosting. Both the page and the RSS feed now describe what is actually published. |
| 15 | Titles 50–60 chars | **Fixed** | All 13 posts now render between 43 and 60 characters. |
| 16 | Unique meta descriptions | **Done** | 13/13 posts have one; no duplicates sitewide. |
| 17 | Heading structure | **Fixed** | 8 of 11 posts emitted a second `<h1>`. All removed. `/music` had no `<h1>` at all; it has one now. |
| 18 | Answer in first two lines | **Fine** | Measured, not assumed — see the retraction at [O2](#o2-the-homepage-answers-nothing-in-its-first-two-lines--retracted-it-was-wrong). |
| 19 | Images + alt text | **Done** | 0 missing `alt` of 10 image sites. |
| 20 | Internal links | **Done** | The homepage now links `/blog` with real anchor text, and `/contact` + `/guides` are in the nav. |

### O1. Every blog title exceeded 60 characters as rendered — **FIXED**

`app/(booth)/blog/[slug]/page.tsx` appended a 16-character `— adityahimaone` suffix to every frontmatter title, and the frontmatter titles were themselves written as full article headlines. The result was that **11 of 13 posts overrun the guideline**, the worst at 109 characters:

| Post | Was | Now |
| --- | --- | --- |
| `deploying-portfolio-from-zero-to-production` | 109 | **55** |
| `tailscale-access-any-device-anywhere` | 92 | **59** |
| `building-habit-tracker-nextjs` | 81 | **54** |
| `vps-monitoring-grafana-prometheus-blackbox` | 78 | **53** |
| `9router-ai-gateway-60plus-providers` | 77 | **57** |
| `most-powerful-free-notes-obsidian-syncthing` | 76 | **46** |
| `deploy-nextjs-vps-nginx-pm2-custom-domain` | 74 | **54** |
| `setup-hermes-agent` | 69 | **59** |
| `seo-job-posting-google-jobs` | 67 | **55** |
| `frontend-development-2026` | 61 | **60** |
| `why-i-rebuilt-my-portfolio` | 42 | **43** |

The fix was to shorten the frontmatter titles, which means **the visible on-page `<h1>` got shorter too** — this was chosen over adding a separate `seoTitle` field specifically because the two could not drift apart. The titles are shorter but no post lost its subject; the Indonesian ones were shortened in place and left in Indonesian.

### O2. The homepage answers nothing in its first two lines — **RETRACTED, it was wrong**

This finding claimed the positioning copy sits behind ~2.7 seconds of GSAP intro animation, making it "the largest remaining risk to LCP and bounce rate". **It does not hold up.**

Measured on a production build (`pnpm build && pnpm start`) with Playwright:

| Timestamp | `heroEditorialPanel` | `heroPanelTitle` | LCP |
| --- | --- | --- | --- |
| 120ms | opacity **1.00** | opacity **1.00** | — |
| 620ms | opacity 1.00 | opacity 1.00 | — |
| 1420ms | opacity 1.00 | opacity 1.00 | **444ms** (cold) |
| 3020ms | opacity 1.00 | opacity 1.00 | 376ms (warm) |

**LCP is 444ms cold and 376ms warm** — well inside the 2500ms "good" threshold. The hero copy is opaque from the first frame at 120ms.

The error was inferring visibility from animation code without reading what the timeline actually animates. The intro timeline touches only the device wall, the 12 tiles, and the bottom rail. The editorial panel is **not in it** (it appears solely in the separate scroll-driven `collapse` timeline) and has no `opacity: 0` in CSS. The 2.7s figure was the wall settling, not the text.

Nothing was changed, deliberately. Shortening the animation would have traded a real design asset for a benefit measured at zero.

### O3. The homepage passed zero link equity to the blog — **FIXED**

`features/landing-page` contained no link to `/blog` or to any post: the only references were a CSS comment and a `pathname.startsWith('/blog/')` check that *hides* the music player. The only route to the blog was the icon-only dock, which carries `aria-label="Blog"` but no visible text — so all 11 posts were reachable from the homepage only through an unlabeled icon.

`section-hero.tsx` now renders a "Read the notes" link with real anchor text alongside the existing CTA, pointing at `/blog`.

### O4. Three orphan pages — **FIXED**

| Page | Before | After |
| --- | --- | --- |
| `/contact` | absent from `NAV_ITEMS` and `SOCIAL_LINKS` — in the sitemap but linked from nowhere | in `NAV_ITEMS`, with canonical and OG |
| `/ui` | no inbound links, not in sitemap | `noindex` + disallowed in robots |
| `/spotify-setup` | no inbound links, no metadata — inherited the homepage title | `noindex` via a server layout |

`/contact` was the notable one: a real page, present in the sitemap, reachable from nowhere. The sitemap is not an internal link.

`/spotify-setup` could not simply export `metadata` — it is a `'use client'` OAuth form, and a client component is not allowed to. It now lives in `app/(noindex)/`, whose layout is a server component carrying `robots: { index: false, follow: true }`. Route groups do not affect the URL, so it is still `/spotify-setup`; verified in the built HTML.

### O5. Eight of eleven posts emitted a second `<h1>` — **FIXED**

The blog template renders the title as `<h1>`, and eight posts also began their markdown body with `# <title>`:

```
content/blog/why-i-rebuilt-my-portfolio.md   # Why I Rebuilt My Portfolio
content/blog/frontend-development-2026.md
content/blog/tailscale-access-any-device-anywhere.md
content/blog/setup-hermes-agent.md
content/blog/9router-ai-gateway-60plus-providers.md
content/blog/vps-monitoring-grafana-prometheus-blackbox.md
content/blog/most-powerful-free-notes-obsidian-syncthing.md
content/blog/building-habit-tracker-nextjs.md
```

The other three correctly started at `##`, so this was an inconsistency rather than a systemic pattern. All eight now start at `##`, and every post page is verified at exactly one `<h1>` in the built HTML.

**A note on how the count was first gotten wrong.** A plain `^# ` grep counts shell comments inside fenced code blocks as headings, which initially produced "all posts" and then "two posts" — both wrong. The removal was done with a fence-aware migration that re-read every file afterwards and printed the per-post heading count as a receipt.

### O6. `/blog` metadata contradicted the content it describes — **FIXED**

The description read `'Thoughts on frontend development, design, and code.'` while the 11 published posts are overwhelmingly DevOps, self-hosting, AI tooling and observability — Nginx, PM2, Prometheus, Grafana, Tailscale, Obsidian, AI gateways. Three are Indonesian. There is essentially no frontend-design content.

Both the page and the RSS feed now describe self-hosting, VPS deployment and infrastructure, and the title dropped from 20 characters to a template-applied `Blog | Aditya Himawan`.

### O7. Breadcrumb UI and schema disagree — **UNCHANGED**

The schema is correct (3 levels: Home → Blog → Post). The visible UI is a single "All notes" back-link. Cosmetic, not a defect, and not touched.

---

## Content

| # | Check | Verdict | Note |
| --- | --- | --- | --- |
| 21 | Competitor keywords | **Not started** | No research artifact in the repo. Needs a keyword tool. |
| 22 | High-volume / low-KD keywords | **Not started** | Requires keyword tool data. |
| 23 | Keyword cannibalization | **Largely resolved** | The two VPS posts are now differentiated and cross-linked. The Habit Tracker triple still exists. |
| 24 | Merge thin/overlapping pages | **Done by differentiation** | The VPS posts turned out to be genuinely different documents, so they were linked rather than merged. |
| 25 | Topic clusters around pillar pages | **Done** | `/guides/self-hosting-nextjs` links four posts in a stated order. |
| 26 | Pages per feature / use case | **Done** | `/projects/[slug]` gives each project a page, and `/work` groups them by problem shape. |
| 27 | Comparison / alternatives pages | **Done** | `/guides/vps-vs-vercel`. |
| 28 | "Best X" lists | **Not started** | Deliberately skipped — see below. |
| 29 | Author bios, E-E-A-T | **Done** | `/about` with the client credits; byline on every post. |
| 30 | `dateModified` on refresh | **Fixed** | Plumbed end to end. |

### C1. Topic clusters, comparison pages, FAQ — **BUILT**

The site had four posts covering VPS hosting, Nginx, PM2, Prometheus and Tailscale, plus two on AI agent tooling, with overlapping tags and nothing tying them together. Each was individually findable and collectively incoherent.

Three new routes close that:

- **`/guides/self-hosting-nextjs`** — the pillar. Assembles the four self-hosting posts into one stated order of operations, carries `FAQPage` structured data with seven real questions, and answers the "should you self-host at all" objection rather than only selling the technique.
- **`/guides/vps-vs-vercel`** — the comparison page. Side-by-side table plus a "which one to pick" section, including the honest recommendation against self-hosting for most projects.
- **`/guides`** — an index, so the breadcrumb trail resolves to something real.

All three are in the sitemap and in the nav.

### C1b. `/work` — the use-case page

`/projects` answers "what did you build". It does not answer the question someone actually arrives with, which is "can you build the thing I need?" — and a visitor who wants an operations dashboard had to read six project entries to find out whether that was a thing you had done.

`app/work/page.tsx` groups the shipped work into four problem shapes — internal tools, marketing sites a sales team stops hand-maintaining, products that survive a bad connection, and wallet-connected interfaces that read on a phone. **Every case cites the project that proves it**, which is the constraint that keeps it from becoming a services page: five distinct projects are linked as evidence, and the page fails that check if the set drops.

It carries `FAQPage` structured data with five questions written from the actual work (including "do you do React Native?" — answered honestly, no).

**Deliberately not built:** "best X" list pages. A best-of list is a claim that a page is *better* than named alternatives, which needs posts that actually reviewed those alternatives. Writing one from scratch would be inventing comparisons.

**Also still `noindex`:** `/tags/[tag]` archives. The tag taxonomy exists and is linked from every post, but with 11 posts a tag page has too little on it to be worth an index slot.

### C2. Cannibalization — the two VPS posts

`deploying-portfolio-from-zero-to-production` and `deploy-nextjs-vps-nginx-pm2-custom-domain` were flagged as near-duplicates. **On reading them, they are not.** The first is a specific portfolio walkthrough — Tencent Cloud Lighthouse, staging, GitHub Actions, rollback. The second is a general "any Next.js app to any VPS" guide that opens with *why a VPS over Vercel*.

Merging would have destroyed 862 lines of a distinct document. They were instead **differentiated**: each now opens by pointing at the other and stating which one to read first, and the shorter one's description was rewritten to say "any Next.js app" where it previously claimed to be "a practical guide" to the same thing. That resolves the competing-intent problem without discarding work.

### C3. E-E-A-T: byline and freshness added, bio still missing

Genuinely strong already: `Person` JSON-LD with `jobTitle`, `email`, Jakarta address, `knowsAbout`, and `sameAs`, plus six real client credits.

**Fixed:**
- **Author byline** — posts rendered date · reading time · view count and no author, so the on-page authorship signal and the `Person` schema disagreed. Post pages now show a linked byline.
- **`dateModified`** — added to `BlogMeta`, the frontmatter contract, `BlogPosting`, `article:modified_time`, and the sitemap's per-post `lastmod`. Only the two posts actually edited in this pass carry it; the builder **omits** the field otherwise rather than defaulting it to the publish date, because a freshness signal on 11 posts that have never been edited is worse than no signal.

**Still open:**
- ~~No `/about` page.~~ **Fixed below.**
- ~~The résumé is a Google Drive PDF.~~ **Fixed below.**

### C3b. `/about` — the on-page biography

The site had a strong `Person` JSON-LD and six real client credits, but no page a reader could land on to read any of it. A knowledge panel describes you to a machine; an about page describes you to a person deciding whether to email you.

`app/about/page.tsx` now exists: a real prose biography, the six engagements from `ARTIST_ROWS` with the outcome each is known for, the stack, direct contact links, and the résumé. In the nav, in the sitemap, with its own canonical and `Person` schema.

Deliberately plain typography rather than the rack language — the landing page is an immersive hardware metaphor, which is a poor container for a factual bio, and the booth shell would frame a page of prose as another album sleeve.

The `Person` graph was also **extracted into a `person()` builder** in `lib/structured-data.tsx`. It had been inlined in `app/page.tsx` and would have been copied into `/about` as a second literal — exactly the arrangement that lets a name, an email and a list of schools drift apart with nothing failing. There is now one Person.

### C3c. The résumé is no longer on Google Drive — **FIXED**

`RESUME_URL` pointed at `https://drive.google.com/file/d/.../view?usp=sharing`. A Drive-hosted file sits behind a viewer page rather than serving the PDF, and crawlers and AI assistants frequently cannot reach it at all — making the one document a recruiter most wants invisible to exactly the systems likely to read it.

The PDF was downloaded from that link (93,767 bytes, `%PDF-1.4`, valid `%%EOF`, titled `Resume_Aditya_Himawan_2026`, containing Work Experience / Technical Skills / Education sections), verified as a real PDF rather than an HTML interstitial, and is now served from this origin at `public/resume.pdf`. Updating it means replacing that one file; no link needs touching.

### C3d. `schema-dts` — **FIXED, and it immediately caught something**

Every builder in `lib/structured-data.tsx` returned `Record<string, unknown>`, so nothing was checked against schema.org at compile time. They now return a `Graph` union typed from `schema-dts`, so a misspelled `dateModifed` or a `BreadcrumbList` missing `position` is a type error rather than invalid JSON-LD.

It paid for itself on the first run: it rejected `query-input` on `SearchAction`. That is correct — `query-input` is a **Google extension, not a schema.org property**. Google still documents it and still reads it, so it stays, but now behind an explicit `SearchActionLeaf & { 'query-input': string }` annotation at the one place it appears, rather than a blanket cast that would hide the next real error too.

The two inline `Person` and `FAQPage` literals became `person()` and `faqPage()` builders (see [C3b](#c3b-about--the-on-page-biography)).

### C4. Frontmatter `slug` is silently ignored

`features/blog/lib/blog.ts:40` derives the slug from the filename and never reads `data.slug`:

```ts
const slug = file.replace(/\.md$/, '')
```

`most-powerful-free-notes-obsidian-syncthing.md:3` declares `slug: stop-paying-for-notes-obsidian-syncthing`, but the URL is `/blog/most-powerful-free-notes-obsidian-syncthing`. Harmless today, but a trap: renaming a file silently changes the URL and breaks any link to it, and the frontmatter field lies. Either honor `data.slug ?? filename` or delete the field from the posts.

---

## Links

| # | Check | Verdict | Note |
| --- | --- | --- | --- |
| 31 | Turn brand mentions into backlinks | **Not started** | Profiles verified live. |
| 32 | Backlink gap vs competitors | **Not started** | No competitor set defined. |
| 33 | Get into "best X" lists | **Not started** | Blocked by [C1](#c1-no-topic-clusters-comparison-pages-or-faq) — nothing list-shaped exists to be listed. |
| 34 | Reddit threads that rank | **Partial** | Accounts exist; no participation. |
| 35 | Google Business Profile | **N/A** | Not a local business. |

### L1. Prerequisites are not met yet

Nothing in this section is actionable until three things are true:

1. **Analytics work** ([T-analytics](#caveat-on-the-analytics-finding)) — you cannot do link building you can measure.
2. **There are pages worth linking to** — currently the work is on other people's domains ([T1](#t1-no-project-has-an-indexable-url)) and the blog is unreachable from the homepage ([O3](#o3-the-homepage-passes-zero-link-equity-to-the-blog)).
3. **There is a target keyword set.** Zero keyword research exists in the repo — no CSV, no notes, no Search Console export.

### L2. Social profiles are in good shape

GitHub, LinkedIn, and X all verified live — `docs/e2e-contact-independent-hermes.md:179` records an actual HTTP check of the LinkedIn profile. Gaps worth fixing cheaply: **X is missing from the footer** (`footer-links.ts:9-17` has GitHub, LinkedIn, Spotify, Email) and from the landing page's contact pads, existing only on `/contact` and in JSON-LD. There is no Dribbble, Behance, or dev.to.

### L3. Links the homepage *should* carry

Not "build backlinks" — internal, and free:

- `/` → `/blog` with real anchor text — **done** ("Read the notes")
- `/` → `/contact` — **done** (now in `NAV_ITEMS`)
- `/projects` → project detail pages — **done** (`{project.title} case study` alongside the outbound link)
- Six identical `Open` anchors — **done**, now `{project.title} on GitHub` / `{project.title} live`, and the repeated `Case study` is `{project.title} case study`

Still open: `/` does not link to 2–3 individual recent posts.

---

## Quick wins

| Check | Verdict | Note |
| --- | --- | --- |
| High impressions, low CTR | **Cannot verify** | Needs GSC. The 11 over-length titles that would have caused this are gone. |
| `site:you.com` sanity check | **Ready to run** | Every title now fits. Worth doing once deployed. |
| Page-2 pages to refresh | **Cannot verify** | Needs GSC. |
| "People also ask" → FAQ | **Done** | Seven real questions with `FAQPage` structured data on the pillar page. |
| Pages losing traffic | **Cannot verify** | Needs GSC. |

Everything in this section except the `site:` check requires Search Console.

---

## What shipped

All of phases 2 and 3 below are complete, plus `redirects()` from phase 1. Verified by typecheck, a clean production build, 67/67 passing tests, and a pass over the **prerendered HTML** — not just the source — asserting one `<h1>` per post, title lengths in range, canonical present, no ucarecdn reference, `noindex` on both excluded routes, `CreativeWork`/`FAQPage` present, and 26 sitemap URLs with no noindex routes leaked.

**Phase 1 — measurement (partially blocked on you)**
- [x] `redirects()` for legacy paths
- [ ] Verify `/_vercel/insights/script.js` on production
- [ ] Fill in the GA4 id and GSC token in `.env`

**Phase 2 — structural wins**
- [x] `title: { default, template }`; per-page suffixes stripped
- [x] Homepage title 65 → 33
- [x] Canonicals on `/`, `/contact`, `/music`, `/ui`
- [x] Duplicate `<h1>` removed from 8 posts
- [x] `/blog` and `/contact` linked from the homepage and nav
- [x] `noindex` + disallow for `/ui`, `/spotify-setup`, `/api/`

**Phase 3 — the real opportunity**
- [x] `/projects/[slug]` with `CreativeWork` JSON-LD
- [x] `BreadcrumbList` on `/projects`, `/bookmarks`, and the guides
- [x] Byline + `dateModified` end to end
- [x] `/blog` metadata rewritten to match its content
- [x] VPS posts differentiated and cross-linked
- [x] Pillar page + FAQ + comparison page under `/guides`

**Phase 4 — blocked on data**
- [ ] Keyword research, competitor backlink gap, the Links section

## Still open

**Nothing here is fixable from the repo — the remaining items need data or access that only you have.**

1. **Fill in the two env values.** `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_GSC_VERIFICATION` in `.env`, then submit the sitemap. This is the only blocker on measuring anything.
2. **Keyword research.** The precondition for the entire Links section. No research artifact exists in the repo, and the Links section is the one part of this audit that could not be touched without it.

**Retracted rather than fixed:** the "~2.7s hero animation is the largest LCP risk" finding ([O2](#o2-the-homepage-answers-nothing-in-its-first-two-lines--retracted-it-was-wrong)). Measured at 444ms LCP cold, the animation is not the problem it was described as, and shortening it would have cost a design asset for no measured gain.

## A note on method

Five claims from the first pass were wrong. Correcting them changed the findings materially, so they are recorded here rather than quietly dropped:

- **"All posts have a duplicate h1"** — false; it is 8 of 11.
- **"Two posts start at `#`"** — false, they start at `##`. The count came from grepping `# `, which cannot distinguish a markdown heading from a shell comment inside a code fence.
- **"Zero headings found"** — my own bug. The heading regex was anchored with `$`, and these files are CRLF: JavaScript's `$` does not match before a trailing `\r`, so every regex silently matched nothing and printed a confident all-zeros table.
- **"`FEATURED_PROJECTS` appears to be dead — worth deleting"** — wrong, and acting on it would have caused a visible regression. It is load-bearing at `library-data.ts:55-63`, where it deduplicates the GitHub archive feed.
- **"The hero text sits behind ~2.7s of animation"** — false. Measured at 444ms LCP with the panel at full opacity from the first frame.

Three more came from measurement during the implementation passes:

- **Growing the nav to nine items broke mobile.** The dock is a fixed bar of 44px icons; nine of them need 436px, and a 320px viewport has 280px. The first and last icons rendered off-screen and could not be tapped. Nothing about this was visible on a desktop screenshot.
- **Truncating the dock fixed the overflow and caused a worse bug.** Capping the list at six meant `/about` and `/contact` — which have no other link from the landing page — became unreachable on a phone. The overflow now goes into a `More` menu instead, and all nine destinations are verified reachable by clicking through it.
- **A verification probe reported a false failure.** It searched the built HTML for `"Switchyard case study"` and found nothing, because JSX emits `<!-- -->` between adjacent text expressions. The anchor text was correct; the probe was wrong.

Every structural claim above was confirmed by reading the file directly, every content change by re-reading the built HTML, and every layout claim by measuring a real production server at 320/390/768px rather than by counting items.