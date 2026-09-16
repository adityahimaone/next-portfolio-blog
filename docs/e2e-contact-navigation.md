# E2E Contact Navigation Audit

Date: 2026-09-11 14:23 WIB
Target workspace: `/Users/adityahimawan/Development/next-portfolio-blog`
Target app: `http://127.0.0.1:3210`
Scope: `/contact`, homepage `#contact`, and navigation items rendered on those surfaces.
Excluded: email submission/API behavior; email activation.

## Execution

- Local Next.js dev server started with `pnpm dev --hostname 127.0.0.1 --port 3210`.
- Browser-rendered automation was attempted against the local target, but Browser Use rejected private/local URLs. Production browser fallback did not provide a CDP endpoint. No browser click assertion is claimed.
- SSR HTML, source inspection, HTTP reachability, and responsive CSS inspection were used as fallback evidence.
- Remote SSH alias `mac-tailscale` was unavailable in this environment (`Could not resolve hostname mac-tailscale`). The requested workspace path exists locally and was audited there.

## `/contact` route

Source: `app/contact/page.tsx`.

| Visible item | Type | href | Result |
|---|---|---|---|
| GitHub | link | `https://github.com/adityahimaone` | PASS: non-empty label, HTTPS URL, rendered once, endpoint returned HTTP 200 |
| X (Twitter) | link | `https://x.com/adityahimaone` | PASS: non-empty label, HTTPS URL, rendered once, endpoint returned HTTP 200 |
| LinkedIn | link | `https://linkedin.com/in/adityahimaone` | PASS: non-empty label, HTTPS URL, rendered once, endpoint returned HTTP 200 |
| Email | link | `mailto:adityahimaone@gmail.com` | PASS: non-empty label, valid `mailto:` format, rendered once |
| Back to Home | link | `/` | PASS: non-empty label, valid internal route, rendered once; `/` returned HTTP 200 |

Findings:

- `/contact` contains 5 user-facing anchors: 4 contact/social links plus Back to Home.
- No CV/resume link is rendered on `/contact`.
- No header or navigation menu is mounted on `/contact`; `app/contact/page.tsx` renders no `Header`/navigation component.
- No duplicate contact/social hrefs found.
- No empty contact hrefs found.
- All social links use `target="_blank"` and `rel="noopener noreferrer"`. Email also has `_blank`; it was not activated by scope.

## Homepage `#contact` section

Source: `features/landing-page/rack-01/rack-01.tsx`.

| Visible item | Type | href | Result |
|---|---|---|---|
| Email pad | link | `mailto:adityahimaone@gmail.com` | PASS: non-empty label/detail, valid `mailto:` format |
| LinkedIn pad | link | `https://www.linkedin.com/in/adityahimaone` | PASS: non-empty label/detail, valid HTTPS URL; external target configured |
| GitHub pad | link | `https://github.com/adityahimaone` | PASS: non-empty label/detail, valid HTTPS URL; external target configured |
| Resume pad | link | `https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing` | PASS: non-empty label/detail, valid HTTPS URL; external target configured |
| Email output | link | `mailto:adityahimaone@gmail.com` | PASS: accessible label `Email Aditya`, valid `mailto:` format |
| Back to top | anchor | `#home` | PASS: non-empty label; matching `id="home"` exists |
| Bank A | button | none | PASS: non-empty visible label; audio control, not navigation |
| Bank B | button | none | PASS: non-empty visible label; audio control, not navigation |
| Pads 05–16 | buttons | none | PASS: non-empty labels/details; audio controls, not navigation |

The first four contact pads are defined in `CONTACT_PADS` and rendered as anchors. Pads 05–16 intentionally render as buttons for Web Audio interaction, not navigation.

Homepage route/navigation items present in the rendered landing page source:

| Item group | Items | Result |
|---|---|---|
| Section navigation | Home, About, Skills, Exp, Work, Contact | PASS: non-empty labels, `#home`, `#about`, `#skills`, `#experience`, `#work`, `#contact` targets are defined in `rack-01.tsx` |
| Direct route navigation | Projects `/projects`, Bookmarks `/bookmarks`, Blog `/blog`, Mixtape `/music` | PASS: non-empty labels, internal hrefs; all routes returned HTTP 200 |
| Hero actions | Selected work `#work`, Resume Drive URL | PASS: non-empty labels and valid targets |
| Hero contact | Contact `mailto:adityahimaone@gmail.com` | PASS: non-empty label and valid `mailto:` format |

## Rendered SSR and endpoint evidence

Fresh local HTTP checks:

```text
/           200
/contact    200
/blog       200
/projects   200
/music      200
/bookmarks  200
```

Fresh external endpoint checks with `curl -L`:

```text
https://github.com/adityahimaone                                                          200
https://x.com/adityahimaone                                                               200
https://linkedin.com/in/adityahimaone                                                     200
https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing        200
```

SSR inventory checks:

```text
/contact href="..." count: 10 total anchors including framework/assets
/contact contact/social href count: 4
homepage id="contact" count: 1
homepage mailto:adityahimaone@gmail.com count: 3
homepage resume ID count: 2
```

The repeated homepage email and resume destinations are expected: hero/footer/contact surfaces reuse same destinations. `/contact` social/contact destinations are unique.

## Desktop/mobile assessment

- `/contact` uses one shared semantic anchor set with `flex flex-wrap`; no desktop-only or mobile-only contact markup exists.
- Homepage contact pads use one shared markup path across viewports; no duplicate mobile-only links found.
- CSS includes shared focus-visible styles for `.root a` and `.root button`, with a 3px orange outline and 4px offset.
- Actual browser-computed visibility, hit-area geometry, overlap, and click activation at desktop/mobile viewports were NOT VERIFIED because browser access to the local target was blocked and no usable remote CDP endpoint was available.
- Treat desktop/mobile clickability as an evidence gap, not a PASS.

## Final status

- Contact route labels: PASS.
- Contact route href formats: PASS.
- Homepage contact labels and href formats: PASS.
- Internal route reachability: PASS.
- External endpoint reachability: PASS.
- Duplicate/dead contact links: PASS from source/SSR inventory.
- Desktop/mobile rendered visibility and clickability: NOT VERIFIED due browser-provider limitation.
- Email submission/API: NOT TESTED by scope.
- Production deployment state: NOT assessed.
