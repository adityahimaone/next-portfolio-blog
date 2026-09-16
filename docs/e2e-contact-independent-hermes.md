# E2E Contact Navigation — Independent Hermes Audit

Date: 2026-09-13 17:23 WIB (Asia/Jakarta)
Workspace: `/Users/adityahimawan/Development/next-portfolio-blog`
Executor: Hermes independent (no Codex/parent delegation, no reliance on prior `docs/e2e-contact-navigation*.md`)
Scope: homepage contact section (`#contact`) and `/contact` route only. No form submission, no external-service mutation.

## Commands run (exact)

```sh
# Source inventory
grep -n "href\|CONTACT_PADS\|RESUME_URL\|EMAIL" features/landing-page/rack-01/rack-01.tsx | head -n 120
sed -n '2031,2058p' features/landing-page/rack-01/rack-01.tsx
sed -n '23,24p' features/landing-page/rack-01/rack-01.tsx
grep -n "EMAIL\|SOCIAL_LINKS" features/landing-page/constants/index.ts

grep -n "href\|socialLinks\|mailto\|github\|linkedin\|x.com" app/contact/page.tsx
sed -n '9,75p' app/contact/page.tsx
sed -n '24,49p' features/layout/constants/index.ts
grep -rn "whatsapp\|wa\.me\|telegram\|t\.me" app features --include="*.tsx" --include="*.ts"

# Dev server
pnpm dev -p 3217
curl -s -o /tmp/audit_root.html -w 'ROOT %{http_code} %{size_download}\n' http://127.0.0.1:3217/
curl -s -o /tmp/audit_contact.html -w 'CONTACT %{http_code} %{size_download}\n' http://127.0.0.1:3217/contact

# SSR checks
grep -c 'id="contact"' /tmp/audit_root.html
grep -o 'href="[^"]*"' /tmp/audit_root.html | sort | uniq -c
grep -o 'href="[^"]*"' /tmp/audit_contact.html | sort | uniq -c
grep -o 'target="[^"]*"\|rel="[^"]*"' /tmp/audit_root.html | sort | uniq -c
grep -o 'target="[^"]*"\|rel="[^"]*"' /tmp/audit_contact.html | sort | uniq -c
grep -o 'mailto:[^"]*' /tmp/audit_root.html | sort | uniq -c
grep -o 'mailto:[^"]*' /tmp/audit_contact.html | sort | uniq -c
grep -o 'href=""' /tmp/audit_root.html | wc -l; grep -o 'href=""' /tmp/audit_contact.html | wc -l
grep -o 'javascript:' /tmp/audit_root.html | wc -l; grep -o 'javascript:' /tmp/audit_contact.html | wc -l

# Local routes
for path in / /contact /blog /projects /music /bookmarks; do
  curl -sS -o /dev/null -w '%{http_code} %{size_download} %s\n' --max-time 10 "http://127.0.0.1:3217$path"
done

# External destinations (read-only GET, no activation)
for url in \
  'https://github.com/adityahimaone' \
  'https://www.linkedin.com/in/adityahimaone' \
  'https://linkedin.com/in/adityahimaone' \
  'https://x.com/adityahimaone' \
  'https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing'; do
  curl -L -sS -o /dev/null -w '%{http_code} %{url_effective} %{url}\n' --max-time 20 "$url"
done

# Browser-rendered check (attempted)
# browser_exec new_tab('http://127.0.0.1:3217/contact') -> Blocked: URL targets a private or internal address
```

## Source inventory

### Homepage contact section (live path `features/landing-page/rack-01/rack-01.tsx`)

`CONTACT_PADS` (lines 2031-2058):
```ts
const CONTACT_PADS = [
  { label: 'Email', detail: EMAIL, href: `mailto:${EMAIL}`, note: 261.63 },
  { label: 'LinkedIn', detail: 'Professional profile', href: 'https://www.linkedin.com/in/adityahimaone', note: 329.63 },
  { label: 'GitHub', detail: 'Code and projects', href: 'https://github.com/adityahimaone', note: 392 },
  { label: 'Resume', detail: 'Open PDF', href: RESUME_URL, note: 523.25 },
  { label: 'Kick', detail: 'Low pulse', note: 82.41 },
  { label: 'Snare', detail: 'Short noise', note: 196 },
  { label: 'Chord', detail: 'C major', note: 261.63 },
  { label: 'Tone', detail: 'High signal', note: 659.25 },
  { label: 'Sub', detail: 'Low sine', note: 65.41 },
  { label: 'Rim', detail: 'Short click', note: 880 },
  { label: 'Fifth', detail: 'C and G', note: 392 },
  { label: 'Pluck', detail: 'Fast decay', note: 783.99 },
  { label: 'Bass', detail: 'Square bass', note: 110 },
  { label: 'Hat', detail: 'Bright noise', note: 1200 },
  { label: 'Minor', detail: 'A minor', note: 220 },
  { label: 'Bell', detail: 'Metal tone', note: 1046.5 },
] as const
```

`RESUME_URL` line 23-24:
```
https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing
```

`EMAIL` constant `features/landing-page/constants/index.ts:96`:
```
adityahimaone@gmail.com
```

Rendering (lines 2342-2394): pads with `href` render as `<a>`, pads without `href` render as `<button>`. External pads use `target="_blank"` + `rel="noreferrer"`; mailto pads have `target`/`rel` undefined. Additional homepage anchors: hero `mailto:` (line 406), hero resume `RESUME_URL` (432-434), footer out rail `mailto:` (2392), `BACK TO TOP` `#home` (2414).

### `/contact` route (`app/contact/page.tsx`)

`socialLinks` array lines 9-75:
- GitHub `https://github.com/adityahimaone`
- X (Twitter) `https://x.com/adityahimaone`
- LinkedIn `https://linkedin.com/in/adityahimaone`
- Email `mailto:adityahimaone@gmail.com`

Render lines 110-127: each mapped to `<Link href target="_blank" rel="noopener noreferrer">` plus `Back to Home` `<Link href="/">` (line 127). File has no header/navigation import and no resume/WhatsApp/Telegram links.

### WhatsApp / Telegram

- Source grep `whatsapp|wa.me|telegram|t.me` in `app` + `features`: only `features/projects/constants/index.ts:47` project title `Quick Chat WhatsApp` — no contact/social link.
- SSR grep on both pages: 0 matches.

## SSR / local HTTP evidence (dev server `http://127.0.0.1:3217`, Next 15.1.11)

```
ROOT 200 134075
CONTACT 200 61221
```

`id="contact"` in homepage HTML: `1` (correct).

Homepage href inventory (sorted uniq, `/tmp/audit_root.html`):
```
   3 href="#about"
   1 href="#contact"
   1 href="#experience"
   3 href="#home"
   1 href="#skills"
   2 href="#work"
   1 href="/blog"
   1 href="/bookmarks"
   1 href="/music"
   1 href="/projects"
   2 href="https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing"
   1 href="https://github.com/adityahimaone"
   1 href="https://www.linkedin.com/in/adityahimaone"
   3 href="mailto:adityahimaone@gmail.com"
   (+ framework/css/icon hrefs)
```

`/contact` href inventory (`/tmp/audit_contact.html`):
```
   1 href="/"
   1 href="https://github.com/adityahimaone"
   1 href="https://linkedin.com/in/adityahimaone"
   1 href="https://x.com/adityahimaone"
   1 href="mailto:adityahimaone@gmail.com"
```

`target`/`rel`:
- homepage: `10 target="_blank"`, `10 rel="noreferrer"` — external links correctly decorated; mailto links have no target/rel (per source conditional).
- `/contact`: `4 target="_blank"`, `4 rel="noopener noreferrer"` — all 4 social links carry both.

Empty/dead href checks:
```
href="" count: 0 (both pages)
javascript: count: 0 (both pages)
mailto count homepage: 3
mailto count /contact: 1
```

Local route HTTP (no activation beyond GET):
```
200 134075 /
200 61221 /contact
200 106567 /blog
200 253901 /projects
200 110618 /music
200 72629 /bookmarks
```

## External destination status (read-only GET with -L)

```
200 https://github.com/adityahimaone
999 https://www.linkedin.com/in/adityahimaone  (LinkedIn returns 999 to unauthenticated curl; page exists — see second URL below)
200 https://linkedin.com/in/adityahimaone      (same destination without www, returns 200)
200 https://x.com/adityahimaone
200 https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing
```

LinkedIn 999 is expected anti-scraping response for `www.linkedin.com` via curl; alternate canonical `linkedin.com/in/adityahimaone` (used on `/contact`) returns 200, confirming the profile exists. No link was clicked/activated beyond HTTP status fetch.

## Visible contact/social link matrix

### Homepage `#contact` (rack-01 OUTPUT ROUTING)

| Link | Label/detail non-empty | href | target | rel | Status |
|---|---|---|---|---|---|
| GitHub | GitHub / Code and projects | `https://github.com/adityahimaone` | `_blank` | `noreferrer` | PASS |
| LinkedIn | LinkedIn / Professional profile | `https://www.linkedin.com/in/adityahimaone` | `_blank` | `noreferrer` | PASS |
| X (Twitter) | — | — | — | — | NOT PRESENT (no X pad/link in homepage contact) |
| Email (pad 01 + hero + Out rail) | Email / `adityahimaone@gmail.com` | `mailto:adityahimaone@gmail.com` | — (none) | — (none) | PASS (valid mailto) |
| CV/Resume (pad 04 + hero) | Resume / Open PDF | `https://drive.google.com/.../view?usp=sharing` | `_blank` | `noreferrer` | PASS |
| WhatsApp / Telegram | — | — | — | — | NOT PRESENT |
| Back to top | BACK TO TOP ↑ | `#home` | — | — | PASS (id="home" exists in SSR) |

### `/contact` route

| Link | Label non-empty | href | target | rel | Status |
|---|---|---|---|---|---|
| GitHub | GitHub | `https://github.com/adityahimaone` | `_blank` | `noopener noreferrer` | PASS |
| X (Twitter) | X (Twitter) | `https://x.com/adityahimaone` | `_blank` | `noopener noreferrer` | PASS |
| LinkedIn | LinkedIn | `https://linkedin.com/in/adityahimaone` | `_blank` | `noopener noreferrer` | PASS |
| Email | Email | `mailto:adityahimaone@gmail.com` | `_blank` | `noopener noreferrer` | PASS (valid mailto; note: mailto with _blank is unusual but not broken) |
| Back to Home | Back to Home | `/` | — | — | PASS (200) |
| CV/Resume | — | — | — | — | NOT PRESENT |
| WhatsApp / Telegram | — | — | — | — | NOT PRESENT |

## Duplicates / dead buttons

- Homepage: duplicate hrefs across page are intentional reuse (hero + pad + out rail share same mailto/resume destinations). Within `CONTACT_PADS`, destinations are unique (1 each: mailto, linkedin, github, resume). Pads 05-16 are `<button>` audio controls with `aria-pressed` and no href — not dead navigation buttons. No duplicate contact/social href within scoped pad set. PASS.
- `/contact`: 4 social hrefs + 1 internal `/` — all unique. No empty hrefs, no `javascript:` hrefs, no duplicate social href. PASS.
- No form on either surface; no submission tested per scope.

## Browser-rendered visibility / clickability

Attempted browser automation to `http://127.0.0.1:3217/contact` via `browser_exec`:
```
Blocked: URL targets a private or internal address
```
Same for `/` with `id="contact"` scroll target. No remote CDP endpoint available. Viewport hit-testing, overlap, focus outline, and click activation at desktop/mobile were therefore **NOT VERIFIED** in a real browser engine. Source and SSR markup suggest focus-visible styles exist (`.root a:focus-visible`, `.root button:focus-visible` in `rack-01.module.css` with 3px orange outline), but this was not confirmed via computed styles in a rendered viewport.

## Overall result

| Area | Result |
|---|---|
| Source href non-empty and valid format (homepage + /contact) | PASS |
| Invalid href values (`""`, `javascript:`, `undefined`) | PASS (none found) |
| GitHub / LinkedIn / Email links present and reachable | PASS |
| X link: homepage NOT PRESENT / /contact PASS | PASS (consistent with source) |
| CV/Resume: homepage PASS / /contact NOT PRESENT | PASS (consistent with source) |
| WhatsApp / Telegram | NOT PRESENT on both surfaces (no link to audit) |
| Duplicates / dead buttons | PASS |
| target/rel attributes (external `_blank` + `noreferrer`/`noopener`) | PASS (mailto handling as designed) |
| SSR presence (`id="contact"` once, anchors rendered) | PASS |
| Local route HTTP (/, /contact, /blog, /projects, /music, /bookmarks) | PASS (all 200) |
| External destination HTTP (GitHub, X, Drive 200; LinkedIn 999→200 canonical) | PASS |
| Browser pixel visibility / clickability / hit-area at desktop+mobile | NOT VERIFIED (blocked private URL; no usable CDP) |

## Summary

Independent audit PASS for source, SSR, local HTTP, and external destination checks. All visible contact/social links on homepage `#contact` (GitHub, LinkedIn, Email, Resume) and on `/contact` (GitHub, LinkedIn, X, Email) have non-empty, correctly-formed hrefs, valid internal/external destinations, expected `target`/`rel`, no duplicates or dead navigation buttons. X is intentionally absent from homepage contact and present on `/contact`; Resume is present on homepage and absent on `/contact`; WhatsApp/Telegram are absent on both. Local routes return 200; external destinations return 200 (LinkedIn `www` returns expected 999 anti-bot, canonical `linkedin.com` returns 200). Browser-rendered visibility, overlap, and clickability were NOT VERIFIED due to browser provider blocking loopback URLs — source and SSR suggest correct markup but pixel confirmation requires a real viewport run.

No email or external link was activated beyond read-only status fetch. No form submission or mutation performed.

---
Dev server left on `:3217` (pid 85400). To stop: `kill 85400` or `lsof -ti :3217 | xargs kill`.
