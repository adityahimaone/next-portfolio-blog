# Independent contact navigation audit

Date: 2026-09-13
Repository: `/Users/adityahimawan/Development/next-portfolio-blog`
Scope: homepage contact section, `/contact`, visible contact/social links, destination reachability, SSR output, and link attributes. No forms were submitted and no external service was mutated.

## Summary

Source and local SSR checks PASS for the homepage and `/contact`: visible contact links have non-empty destinations, and external links have target and rel attributes. GitHub, X, and the resume URL returned HTTP 200 from this environment. LinkedIn returned HTTP 999, so profile reachability is NOT VERIFIED, not classified as a dead link. No WhatsApp or Telegram link is present in the audited homepage contact section or `/contact` route. No empty contact href or dead contact button was found in source or SSR output.

Browser-rendered visibility and click activation are NOT VERIFIED because no Chromium, Chrome, or Playwright executable is installed in the environment.

## Findings

### PASS: homepage contact section is present and rendered

Evidence:

- `app/page.tsx` renders `LandingPage`.
- `features/landing-page/views/landing-page.tsx` renders `Rack01LandingPage`.
- `features/landing-page/rack-01/rack-01.tsx:3283` renders `<Contact />`.
- The contact section has `id="contact"` at `rack-01.tsx:2244-2248`.
- Local SSR: `GET http://127.0.0.1:3010/` returned `200`, 134075 bytes.

### PASS: homepage contact destinations and attributes

The SSR HTML exposed these contact affordances:

| Label | href | target | rel | Result |
| --- | --- | --- | --- | --- |
| Header Contact | `mailto:adityahimaone@gmail.com` | omitted | omitted | PASS |
| Hero Resume | Google Drive resume URL | `_blank` | `noreferrer` | PASS |
| Email pad | `mailto:adityahimaone@gmail.com` | omitted | omitted | PASS |
| LinkedIn pad | `https://www.linkedin.com/in/adityahimaone` | `_blank` | `noreferrer` | PASS |
| GitHub pad | `https://github.com/adityahimaone` | `_blank` | `noreferrer` | PASS |
| Resume pad | same Google Drive resume URL | `_blank` | `noreferrer` | PASS |
| Email rail control | `mailto:adityahimaone@gmail.com` | omitted | omitted | PASS |

The homepage source defines the same four linked pads at `rack-01.tsx:2031-2045`; the audio-only pads are buttons with no href and are intentional controls, not dead links.

### PASS: `/contact` route and visible link contracts

Evidence:

- `app/contact/page.tsx:77-152` defines the route UI.
- Local SSR: `GET http://127.0.0.1:3010/contact` returned `200`, 61221 bytes.
- `/contact/` returned `308`, consistent with canonical route normalization.
- The four social links all have non-empty hrefs, `target="_blank"`, and `rel="noopener noreferrer"` at `app/contact/page.tsx:109-123`.
- The local SSR output contained GitHub, X (Twitter), LinkedIn, Email, and a `/` Back to Home link.

### PASS: direct destination checks where the server responded normally

Command result from `curl -L`:

```text
200 https://github.com/adityahimaone
999 https://www.linkedin.com/in/adityahimaone
200 https://x.com/adityahimaone
200 https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing
```

GitHub, X, and the resume URL are reachable from this environment. LinkedIn's HTTP 999 is commonly an anti-bot or automated-request response; it does not prove that the profile is dead. LinkedIn is therefore NOT VERIFIED.

### PASS: no empty or obviously dead contact hrefs found in the audited surfaces

The SSR extraction found no empty href among the homepage contact affordances or `/contact` social links. The local `/does-not-exist` control returned 404, confirming the probe can distinguish a missing local route; no audited contact route returned 404.

### NOT VERIFIED: browser-rendered visibility and clickability

No `chromium`, `chromium-browser`, `google-chrome`, or `playwright` executable was available. I did not claim visual visibility, keyboard focus behavior, popup behavior, mail-client launch, or actual click navigation.

### NOT PRESENT: WhatsApp and Telegram

No `whatsapp`, `telegram`, `wa.me`, or `t.me` contact destination was found in the homepage contact component, homepage rack, `/contact`, or shared layout contact surfaces. This is not a broken-link finding; these channels are simply not exposed in the audited UI.

### PASS with intentional repetition: duplicate destinations

Email appears in multiple homepage affordances, and the resume appears in both the hero and contact pads. These are intentional repeated entry points with distinct placement and labels. No duplicate empty or conflicting contact buttons were found.

## Verification commands

Commands executed:

```sh
rg -n -i "contact|github|linkedin|twitter|x\\.com|mailto:|resume|cv|whatsapp|telegram|wa\\.me|t\\.me" app features components lib public README.md --glob '!*.map'
nl -ba app/contact/page.tsx | sed -n '1,220p'
nl -ba features/landing-page/rack-01/rack-01.tsx | sed -n '400,450p;2015,2420p'
npm run dev -- --hostname 127.0.0.1 --port 3010
/usr/bin/curl -sS -o /tmp/contact-audit-body -w 'status=%{http_code} bytes=%{size_download}\\n' http://127.0.0.1:3010/
/usr/bin/curl -sS -o /tmp/contact-audit-body -w 'status=%{http_code} bytes=%{size_download}\\n' http://127.0.0.1:3010/contact
/usr/bin/curl -sS -o /tmp/contact-audit-body -w 'status=%{http_code} bytes=%{size_download}\\n' http://127.0.0.1:3010/contact/
/usr/bin/curl -sS -o /tmp/contact-audit-body -w 'status=%{http_code} bytes=%{size_download}\\n' http://127.0.0.1:3010/does-not-exist
npx tsc --noEmit
npm run build
/usr/bin/curl -L -sS -o /dev/null -w '%{http_code} %{url_effective}\\n' --max-time 20 <destination>
```

The SSR extraction was performed with a Node script using `http.get` against `/` and `/contact`, then matching rendered `<a>` elements and printing their text and attributes.

## Separate build evidence

`npx tsc --noEmit` PASSed with exit code 0. `npm run build` compiled successfully and reached type checking/page-data collection, then FAILed with:

```text
PageNotFoundError: Cannot find module for page: /_document
```

This is a repository build verification failure, but it did not prevent the dev-server SSR checks above. It is not evidence that any contact destination is broken.

## Final status

Contact navigation is source- and SSR-verified for the homepage and `/contact`. External reachability is PASS for GitHub, X, and the resume URL, while LinkedIn remains NOT VERIFIED because of HTTP 999. Browser visibility and click behavior remain NOT VERIFIED due to missing browser tooling. WhatsApp and Telegram are absent, and no empty href, dead contact button, or conflicting duplicate contact destination was identified.
