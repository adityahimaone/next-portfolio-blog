# Signal Archive redesign

## Delivered

- Shared Signal Archive header for Bookmarks, Blog, and Projects.
- Orange-first semantic color tokens with light and dark mode support.
- Consistent 44px controls, visible focus states, and reduced-motion handling.
- Bookmarks keeps the existing API, admin flow, filtering, sorting, grouping, list/grid views, and now uses an in-page delete confirmation instead of browser alerts.
- Blog and project cards now use the same quiet card language: semantic surfaces, restrained borders, and a small signal rail instead of decorative grids, vinyl, or equalizer effects.
- Bookmark refresh failures are announced inline while preserving the server-rendered snapshot.

## Validation

- `npx tsc --noEmit` passes.
- `git diff --check` passes.
- `npm run build` reaches Next compilation but is blocked in this environment by unavailable Google Fonts DNS (`fonts.googleapis.com`).

## Design intent

The archive pages treat saved references, writing, and shipped work as recorded signals: editorial type, compact metadata, one orange accent, and enough space for scanning. The interface remains silent; the music language is visual rather than an audio interaction.
