# E2E Contact Navigation Audit

Date: 2026-09-11 (Asia/Jakarta)
Workspace: `/Users/adityahimawan/Development/next-portfolio-blog`
Scope: homepage contact section (`#contact`) and `/contact`.

## Overall result

**FAIL**, because `/contact` has a confirmed 390px rendered overflow/clipping defect. Source, SSR, local HTTP, asset, and destination-format checks pass. Homepage pixel visibility/clickability remains **NOT VERIFIED** because the headless fragment captures were blank.

No email, API, form, external link activation, or external-service mutation was performed.

## Exact commands run

```sh
sed -n '1,240p' /Users/adityahimawan/.codex/skills/antislop/SKILL.md
sed -n '1,220p' /Users/adityahimawan/.agents/skills/ui-skills-root/SKILL.md
rg -n -i "next-portfolio-blog|contact|resume|CV|whatsapp|telegram|landing" /Users/adityahimawan/.codex/memories/MEMORY.md
git status --short
rg -n -i "contact|linkedin|github|twitter|x\\.com|mailto:|whatsapp|telegram|resume|cv|curriculum|download" app features components lib public package.json README.md
rg --files app | sort
node -e "const p=require('./package.json'); console.log(JSON.stringify(p.scripts,null,2))"
npx tsc --noEmit
npm test -- --runInBand
npm run build
npm start -- --hostname 127.0.0.1 --port 3213
```

The production server was started at `http://127.0.0.1:3213`.

```sh
node <<'NODE'
const base='http://127.0.0.1:3213';
for (const route of ['/','/contact','/projects','/blog','/music','/bookmarks']) {
  const res=await fetch(base+route); const html=await res.text();
  const anchors=[...html.matchAll(/<a\\b[^>]*href="([^"]*)"[^>]*>([\\s\\S]*?)<\\/a>/gi)];
  console.log(route,res.status,Buffer.byteLength(html),anchors.length,(html.match(/id="contact"/g)||[]).length);
}
NODE

node <<'NODE'
const base='http://127.0.0.1:3213';
for (const path of ['/','/contact','/projects','/blog','/music','/bookmarks']) {
  const res=await fetch(base+path); console.log(path,res.status,res.headers.get('content-type'));
}
const html=await (await fetch(base+'/')).text();
const assets=[...new Set([...html.matchAll(/(?:src|href)="(\\/_next\\/static\\/[^"?#]+)/g)].map(m=>m[1]))];
for (const asset of assets.slice(0,12)) console.log(asset,(await fetch(base+asset)).status);
for (const url of ['https://github.com/adityahimaone','https://x.com/adityahimaone','https://linkedin.com/in/adityahimaone','https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing']) console.log(url,(await fetch(url,{redirect:'follow'})).status);
NODE

node <<'NODE'
const base='http://127.0.0.1:3213';
for (const path of ['/','/contact']) {
  const html=await (await fetch(base+path)).text();
  for (const m of html.matchAll(/<a\\b([^>]*)>([\\s\\S]*?)<\\/a>/gi)) {
    if (/mailto:|github|linkedin|x\\.com|drive\\.google|back to home|contact/i.test(m[0])) console.log(path,m[1]);
  }
}
NODE

CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
"$CHROME" --headless --disable-gpu --no-sandbox --virtual-time-budget=4000 --window-size=1440,1200 --screenshot=/tmp/contact-3213-desktop.png http://127.0.0.1:3213/contact
"$CHROME" --headless --disable-gpu --no-sandbox --virtual-time-budget=4000 --window-size=390,844 --screenshot=/tmp/contact-3213-mobile.png http://127.0.0.1:3213/contact
"$CHROME" --headless --disable-gpu --no-sandbox --virtual-time-budget=9000 --window-size=1440,1200 --screenshot=/tmp/home-contact-3213-desktop.png 'http://127.0.0.1:3213/#contact'
"$CHROME" --headless --disable-gpu --no-sandbox --virtual-time-budget=9000 --window-size=390,844 --screenshot=/tmp/home-contact-3213-mobile.png 'http://127.0.0.1:3213/#contact'

curl --max-time 10 -sS -o /dev/null -w "%{http_code} %{size_download}\\\\n" http://127.0.0.1:3213/
```

The final `curl` command could not run because `curl` is not installed in this shell (`zsh: command not found: curl`). Node `fetch` was used for the equivalent local and external HTTP checks.

## Source and SSR inventory

Primary homepage source: `features/landing-page/rack-01/rack-01.tsx`.
Primary route source: `app/contact/page.tsx`.

### Homepage `#contact`

| Visible item | href | target / rel | Result |
|---|---|---|---|
| Hero Contact | `mailto:adityahimaone@gmail.com` | same context | PASS, non-empty valid `mailto:` |
| Hero Resume | `https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing` | `_blank`, `noreferrer` | PASS, non-empty HTTPS destination |
| Email pad | `mailto:adityahimaone@gmail.com` | same context | PASS |
| LinkedIn pad | `https://www.linkedin.com/in/adityahimaone` | `_blank`, `noreferrer` | PASS |
| GitHub pad | `https://github.com/adityahimaone` | `_blank`, `noreferrer` | PASS |
| Resume pad | same Drive URL | `_blank`, `noreferrer` | PASS |
| Email output icon | `mailto:adityahimaone@gmail.com` | same context; `aria-label="Email Aditya"` | PASS |
| Contact navigation item | `#contact` | same context | PASS, matching `id="contact"` exists |

SSR homepage inventory returned one `id="contact"`, three email destinations, and two resume destinations. These are intentional reuse across hero and contact controls, not duplicate buttons. The icon-only email anchor has an accessible label.

The first four contact pads are anchors. Pads 05 to 16, Bank A/B, Tempo, Level, and Clear are intentional audio/state buttons and have no href. No empty, `#`, `javascript:`, `undefined`, or `null` contact href was found.

No X, WhatsApp, or Telegram link is present in the scoped homepage contact UI. No additional visible social icon is rendered there beyond LinkedIn, GitHub, and email.

### `/contact`

| Visible item | href | target / rel | Result |
|---|---|---|---|
| GitHub icon/button | `https://github.com/adityahimaone` | `_blank`, `noopener noreferrer` | PASS |
| X (Twitter) icon/button | `https://x.com/adityahimaone` | `_blank`, `noopener noreferrer` | PASS |
| LinkedIn icon/button | `https://linkedin.com/in/adityahimaone` | `_blank`, `noopener noreferrer` | PASS |
| Email icon/button | `mailto:adityahimaone@gmail.com` | `_blank`, `noopener noreferrer` | PASS, valid mailto; not activated |
| Back to Home | `/` | same context | PASS |

SSR returned exactly these five user-facing anchors on `/contact`. No CV/resume, WhatsApp, or Telegram link is rendered on this route. No empty href or duplicate contact/social anchor was found.

The `/contact` email link opens a new browsing context even though it is a `mailto:` destination. This is not a dead-link failure, but it is a minor target-behavior note for follow-up.

## Local route and asset responses

Node `fetch` returned `200 text/html` for all of these local routes:

| Route | Status | Result |
|---|---:|---|
| `/` | 200 | PASS |
| `/contact` | 200 | PASS |
| `/projects` | 200 | PASS |
| `/blog` | 200 | PASS |
| `/music` | 200 | PASS |
| `/bookmarks` | 200 | PASS |

The homepage referenced 31 unique same-origin `/_next/static/` assets. The first 12 sampled assets, including CSS and font files, returned HTTP 200. External read-only `fetch` checks returned HTTP 200 for GitHub, X, LinkedIn, and the Drive resume URL. This verifies reachability at audit time only, not account ownership or resume contents.

## Browser rendering

Chrome was available at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.

- `/contact` at 1440x1200: **PASS**. The waveform, title, intro, all four social/contact controls, Back to Home, and status text were visible in the screenshot.
- `/contact` at 390x844: **FAIL**. The intro copy extends beyond the right viewport edge, and the LinkedIn control is clipped at the right edge. GitHub, X, and Email remain visible. This is a real rendered mobile defect, not inferred from source.
- Homepage `/#contact` at 1440x1200: **NOT VERIFIED**. The screenshot was a blank background.
- Homepage `/#contact` at 390x844: **NOT VERIFIED**. The screenshot was a blank background.
- Homepage contact click activation: **NOT VERIFIED**. The homepage contact view was not reliably rendered in the available headless capture, and no contact link was clicked.
- `/contact` click activation: **NOT VERIFIED**. Links were intentionally not activated to avoid opening external destinations or a mail client.

Chrome emitted macOS headless `CVDisplayLinkCreateWithCGDisplay` warnings and other browser shutdown warnings while still producing the `/contact` screenshots. These are runtime limitations and do not change the confirmed `/contact` mobile overflow.

## Build and test evidence

- `npx tsc --noEmit`: **PASS**.
- `npm run build`: **PASS**. Next.js compiled, type-checked, and generated 32 static pages. No contact-route build error occurred.
- `npm test -- --runInBand`: **PARTIAL / NOT PASS**. 4 tests passed. `tests/performance-preservation.test.ts` failed before execution because Jest/jsdom does not define `TextEncoder` while importing `next/cache`. This is a test-environment limitation, not evidence of a contact-link defect.
- Browser pixel visibility/clickability: **PARTIAL**. `/contact` was inspected at desktop and mobile and has the confirmed mobile defect; homepage pixel visibility and all click activation remain NOT VERIFIED.

## Required follow-up

1. Fix `/contact` mobile layout so the intro copy and all four controls remain inside the viewport at 390px.
2. Re-run the desktop/mobile `/contact` captures.
3. Obtain a reliable homepage `#contact` browser capture and then manually verify clickability in a browser if the test environment permits it.
4. Optionally remove `_blank` from the `/contact` `mailto:` anchor for consistent email behavior.

