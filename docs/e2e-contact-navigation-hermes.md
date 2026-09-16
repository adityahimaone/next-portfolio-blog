# E2E Contact Navigation Audit (Hermes Direct Executor)

Date: 2026-09-12 (Asia/Jakarta)
Workspace: `/Users/adityahimawan/Development/next-portfolio-blog`
Scope: homepage contact section (`#contact`) and `/contact` route.
Executor: Hermes direct executor. Codex was not invoked.

## Final summary

Scoped source and SSR link checks: PASS.
Local route HTTP checks: PASS.
External read-only destination checks: PASS.
Browser pixel visibility/clickability: NOT VERIFIED; browser executor blocked loopback URL.
Repository lint: FAIL.
Repository tests: FAIL; existing Jest/Next `TextEncoder` runtime issue.
Production build: FAIL; Google Fonts fetch timed out/reset in current runtime.

Overall audit status: FAIL / NOT VERIFIED.

No email, API form, external link activation, or external-service mutation was performed.

## Findings matrix

| Check | Result | Evidence |
|---|---|---|
| Homepage contact source inventory | PASS | Live path is `features/landing-page/rack-01/rack-01.tsx`; contact section lines 2079-2417 |
| `/contact` source inventory | PASS | `app/contact/page.tsx` lines 9-145 |
| Non-empty hrefs | PASS | All scoped anchors have literal or populated href values |
| Invalid `href` values (`""`, `javascript:`, `undefined`, `null`) | PASS | No scoped match found during source/SSR inspection |
| Homepage GitHub | PASS | `https://github.com/adityahimaone`, `_blank`, `noreferrer` |
| Homepage LinkedIn | PASS | `https://www.linkedin.com/in/adityahimaone`, `_blank`, `noreferrer` |
| Homepage X | NOT PRESENT | No X link rendered in homepage contact UI |
| Homepage email | PASS | `mailto:adityahimaone@gmail.com`; same context |
| Homepage CV/resume | PASS | Google Drive URL; `_blank`, `noreferrer` |
| Homepage WhatsApp/Telegram | NOT PRESENT | No visible scoped link present |
| `/contact` GitHub | PASS | `https://github.com/adityahimaone`, `_blank`, `noopener noreferrer` |
| `/contact` LinkedIn | PASS | `https://linkedin.com/in/adityahimaone`, `_blank`, `noopener noreferrer` |
| `/contact` X | PASS | `https://x.com/adityahimaone`, `_blank`, `noopener noreferrer` |
| `/contact` email | PASS with UX note | Valid `mailto:`; currently `_blank` plus `noopener noreferrer` |
| `/contact` CV/resume | NOT PRESENT | No resume anchor rendered |
| `/contact` WhatsApp/Telegram | NOT PRESENT | No visible scoped link present |
| Duplicate/dead contact buttons | PASS | Homepage pads 01-04 are links; pads 05-16 and controls are intentional audio/state buttons. `/contact` has one each of four social/contact links plus Back to Home |
| Homepage SSR | PASS | HTTP 200; exactly one `id="contact"` |
| `/contact` SSR | PASS | HTTP 200; expected five user-facing hrefs |
| Local route status | PASS | `/` 200, `/contact` 200, `/favicon.ico` 200 |
| Local sampled CSS/font status | NOT VERIFIED / FAIL SAMPLE | Dev server returned 400 for sampled `/_next/static/css/...` and font paths; image `/memoji-1.png` returned 200 |
| External destination status | PASS | GitHub, LinkedIn, X, Drive returned HTTP 200 with redirect-following GET |
| Browser pixel visibility/clickability | NOT VERIFIED | Browser executor rejected `http://127.0.0.1:3215/contact` as private/internal |

## Exact commands and results

Commands ran from:

```text
/Users/adityahimawan/Development/next-portfolio-blog
```

### Repository state

```sh
git status --short --branch
git log --oneline -3
```

Observed:

```text
## main...origin/main
?? .codegraph/
?? docs/e2e-contact-navigation-codex.md
?? docs/e2e-contact-navigation-hermes.md
?? docs/e2e-contact-navigation.md
c500a46 fix(mobile): hero rail collision, footer spacing, navbar pinned bottom
367c5d0 Merge pull request #25 from adityahimaone/feat/riddim-hardware-redesign
c86f271 feat: update navbar
```

No source files were modified. Existing untracked audit/report files were preserved.

### Source inspection

```sh
grep -n "href" features/landing-page/rack-01/rack-01.tsx | head -n 50
grep -n "href" app/contact/page.tsx
grep -n "href" features/layout/constants/index.ts
```

Homepage scoped anchors include:

- Hero Contact: `mailto:adityahimaone@gmail.com`
- Hero Resume: `https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing`
- Contact pads: Email, LinkedIn, GitHub, Resume
- Output email icon: `mailto:adityahimaone@gmail.com`
- Back to top: `#home`

`CONTACT_PADS` confirms pads 05-16 are audio controls without hrefs. They are buttons, not dead navigation links.

`/contact` anchors:

- GitHub: `https://github.com/adityahimaone`
- X: `https://x.com/adityahimaone`
- LinkedIn: `https://linkedin.com/in/adityahimaone`
- Email: `mailto:adityahimaone@gmail.com`
- Back to Home: `/`

No scoped WhatsApp, Telegram, or CV/resume anchor exists on `/contact`. No empty or `javascript:` href was found in the inspected source.

### Dev server and local SSR

```sh
pnpm dev -H 127.0.0.1 -p 3215
```

Server started and responded.

```sh
curl -s -o /tmp/hermes-dev-root.html -w '%{http_code}' --max-time 10 http://127.0.0.1:3215/
curl -s -o /tmp/hermes-dev-contact.html -w 'contact_code=%{http_code} contact_size=%{size_download}\\n' --max-time 10 http://127.0.0.1:3215/contact
grep -c 'id="contact"' /tmp/hermes-dev-root.html
grep -o 'href="[^"]*"' /tmp/hermes-dev-root.html | sort | uniq -c
grep -o 'href="[^"]*"' /tmp/hermes-dev-contact.html | sort | uniq -c
```

Observed:

```text
homepage 200, 112800 bytes
contact 200, 38798 bytes
homepage id="contact" count: 1
```

Homepage SSR contained three email href occurrences and two resume URL occurrences. These are intentional reuse across hero/contact surfaces. `/contact` SSR contained one each of GitHub, LinkedIn, X, mailto, and `/`.

### Local routes and sampled assets

```sh
for p in / /contact /favicon.ico /_next/static/css/0a63a26f36fb0494.css /_next/static/media/22a5144ee8d83bca-s.p.woff2 /memoji-1.png; do curl -s -o /dev/null -w "$p %{http_code} %{size_download}\\n" --max-time 10 "http://127.0.0.1:3215$p"; done
```

Observed:

```text
/ 200 112800
/contact 200 38798
/favicon.ico 200 15086
/_next/static/css/0a63a26f36fb0494.css 400 1999
/_next/static/media/22a5144ee8d83bca-s.p.woff2 400 1999
/memoji-1.png 200 103837
```

Route responses pass. Sampled dev static CSS/font paths returned 400, so static asset verification is not a full PASS in this dev-runtime check. No production asset conclusion is made.

### External read-only destination checks

```sh
for url in https://github.com/adityahimaone https://linkedin.com/in/adityahimaone https://x.com/adityahimaone 'https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing'; do curl -L -s -o /dev/null -w "$url %{http_code}\\n" --max-time 15 "$url"; done
```

Observed: all four returned HTTP 200. This verifies HTTP reachability at audit time only. It does not verify account ownership, content, or resume contents. `mailto:` was not opened.

### Browser attempt

```text
browser_exec session=hermes-contact-audit
new_tab('http://127.0.0.1:3215/contact')
wait_for_load()
```

Result:

```text
Blocked: URL targets a private or internal address
```

Therefore pixel-level visibility, overlap, hit areas, focus behavior, and actual click navigation are NOT VERIFIED. No link was clicked.

### Lint

```sh
pnpm run lint > /tmp/hermes-contact-lint.log 2>&1; status=$?; printf 'lint_exit=%s\\n' "$status"
```

Result: `lint_exit=1`.

Relevant scoped error:

```text
./app/contact/page.tsx
105:77 Error: apostrophe must be escaped: react/no-unescaped-entities
```

Other lint errors are repo-wide and unrelated to contact href behavior.

### Tests

```sh
pnpm run test > /tmp/hermes-contact-test.log 2>&1; status=$?; printf 'test_exit=%s\\n' "$status"
```

Result: `test_exit=1`.

```text
FAIL tests/performance-preservation.test.ts
ReferenceError: TextEncoder is not defined
4 tests passed; 1 suite failed before execution
```

No contact-specific test failed. Failure is existing Jest/Next test-runtime incompatibility in blog performance coverage.

### Production build

```sh
pnpm run build > /tmp/hermes-contact-build.log 2>&1; status=$?; printf 'build_exit=%s\\n' "$status"
```

Result: `build_exit=1`.

Build failed while `next/font` fetched Google Fonts:

```text
Failed to fetch `Space Grotesk` from Google Fonts.
Failed to fetch `Syne` from Google Fonts.
code: ETIMEDOUT
code: ECONNRESET
```

This is a runtime network limitation, not a contact-link compile error. Build output does not prove production HTML generation in this run.

## Runtime limitations

1. Browser executor cannot navigate loopback/private URLs in current runtime.
2. No externally reachable preview URL was provided; pixel-level visibility and clickability remain NOT VERIFIED.
3. `pnpm run lint` fails repo-wide; `/contact` also has one apostrophe lint error unrelated to href behavior.
4. `pnpm run test` fails before one performance suite executes because `TextEncoder` is missing in Jest/jsdom runtime.
5. `pnpm run build` cannot fetch Google Fonts because network requests reset/time out.
6. Dev server sampled static CSS/font paths returned 400; production asset status was not verified.
7. No email, form, API, external-link activation, or external-service mutation was performed.

## PASS summary

Contact/social/CV/email href inventory: PASS.
Source destination and target semantics: PASS, with `/contact` email `_blank` noted as minor UX issue.
SSR route and homepage contact marker: PASS.
Local `/` and `/contact` HTTP response: PASS.
External read-only destination HTTP reachability: PASS.
Browser-rendered visibility/clickability: NOT VERIFIED.
Full repository quality gates: FAIL due existing/runtime limitations.

No source fix was requested or applied. Report written to `docs/e2e-contact-navigation-hermes.md`.
