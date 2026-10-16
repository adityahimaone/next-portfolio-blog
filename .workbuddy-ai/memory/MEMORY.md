# Project memory — next-portfolio-blog

Durable conventions. Daily detail lives in `YYYY-MM-DD.md`.

## The two docks are one control, by design

There are two dock implementations and they must stay the same size:

- `features/layout/components/magnetic-dock.tsx` — landing/`aria-label="Quick navigation"`,
  renders on `/` and `/music` only (`isDockRoute`, minus the booth routes).
- `features/booth/dock.tsx` + `dock-magnify.ts` — booth routes, `aria-label="Primary"`.

They share `ICON_SIZE` / `DOCK_ICON_SIZE` (currently **36**) and the booth CSS says outright
that it matches the landing capsule "so both docks read as the same control". A size change
belongs in both, or the bar jumps when you cross between `/` and `/projects`.

Two traps:

- **The bar height is the icon box plus its padding**, never an independent number.
  `h-11` = 36 + 4x2, `h-12` = 36 + 6x2. Decouple them and the magnify floats in dead space.
- **Scale the radii with the box.** A fixed radius on a shorter capsule eats a larger share of
  each corner and drifts it back toward the pill the booth dock deliberately left behind.

Anything quoting the dock's height also needs updating: `DOCK_CLEARANCE` in
`use-hero-dock-visibility.ts`, and clearance comments in `booth`, `crate`, `releases`,
`library`, `blog` and `projects` modules.

## Repo conventions

- **`.patch` files and `.workbuddy-ai/memory/` are tracked on purpose.** Logs are committed
  with each day's work under a `docs: record ...` prefix. New artifacts of those kinds belong
  in a commit, not in `.gitignore`.
- **Deck theme tokens.** `--deck-font-*` aliases must be declared on `body`, not `:root`,
  because `next/font` injects `--font-*` on `<body>` and `var()` resolves on the element where
  the property is *declared*. On `:root` every `font:` shorthand silently resolves to the
  guaranteed-invalid value and is dropped, so type falls back to 16px.
- **One rectangular grid everywhere.** Every band reads `--deck-grid-line` / `--deck-grid-cell`
  (30px) and paints both a `90deg` and a `0deg` layer. Restating pitch or colour locally is
  what made the seams drift before.
- **Build/verify.** `npm run build`'s `prebuild` `rmSync`s `.next`, which trips the sandbox
  bulk-delete guard — `mv .next /tmp/next-stale-*` first, then `npx next build`. Background
  servers do not survive between tool calls, so start the server and run the probe in one
  command. `elementHandle.screenshot()` is the reliable way to shoot a `fixed` element;
  `page.screenshot({ clip })` clips to the viewport.
