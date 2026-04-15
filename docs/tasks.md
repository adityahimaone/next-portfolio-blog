
# Refactoring Tasks

## Phase 1: Stack Cleanup & Structure

### 1.1 Tailwind v4 Full Migration
- [ ] Remove `tailwind.config.js` — migrate all config to `globals.css` using `@theme` directive
- [ ] Remove `tailwindcss-animate` plugin — use native v4 animations or CSS keyframes
- [ ] Clean up duplicate CSS — `:root` vars in globals.css already mirror tailwind.config.js
- [ ] Verify `@tailwindcss/postcss` is the only PostCSS plugin needed
- [ ] Remove unused `tailwind-merge` if shadcn/ui not actively used (check components/ui/)
- [ ] Test dark mode still works with v4 class-based approach

**Why:** Currently running Tailwind v4 but still using v3-era config file. The `@config "../tailwind.config.js"` in globals.css is a compatibility shim — we should go fully native.

### 1.2 File Structure Refactor — Feature-Based
- [x] **DELETE** ~30 dead component files (see [[structure]] for full list)
- [x] Create `features/ and `_shared/` folders
- [x] Move active components to `features/landing-page/sections/`:
  - `hero-2025-v2.tsx` → `features/landing-page/sections/hero.tsx`
  - `about-2025-v2.tsx` → `features/landing-page/sections/about.tsx`
  - `skills-mixer.tsx` → `features/landing-page/sections/skills.tsx`
  - `experience-2025.tsx` → `features/landing-page/sections/experience.tsx`
  - `contact-launchpad.tsx` → `features/landing-page/sections/contact.tsx`
- [x] Move Spotify stuff → `features/landing-page/spotify/`
- [x] Move `preloader.tsx` → `features/landing-page/animations/`
- [x] Move header/footer → `features/layout/`
- [x] Move shared UI → `_shared/components/` (aurora, magnetic, spotlight, etc.)
- [x] Move shared hooks to `_shared/hooks/`
- [x] Move utils/constants to `_shared/lib/`
- [x] Split `data.ts` → `features/landing-page/data.ts`
- [x] Create `landing-page.tsx` composition file
- [x] Create `index.ts` barrel exports for each feature
- [x] Update `app/page.tsx` → `import { LandingPage } from '@/features/landing-page'`
- [x] Update `tsconfig.json` — add `@shared/*` path
- [x] Delete dead pages: `app/v2/page.tsx`, `app/spotify/page.tsx`, `app/spotify-setup/page.tsx`
- [x] Verify build passes

### 1.3 Data Layer Cleanup
- [ ] Move `data.ts` content → `features/landing-page/data.ts`:
  - Work experience data
  - Social links
  - Email (update placeholder `your@email.com`)
- [x] Update email placeholder (`your@email.com`) with real email
- [x] Update social links to point to adityahimaone accounts (currently pointing to ibelick)

### 1.4 Config Cleanup
- [ ] Update `next.config.mjs` — remove deprecated `images.domains`, use `remotePatterns`
- [ ] Update `package.json` name from `nim` to `portfolio-2025`
- [ ] Clean up `components.json` (shadcn config) if not actively using shadcn CLI
- [ ] Remove `INSTALLATION.md` and `SPOTIFY_SETUP.md` from root (move to docs/ or delete)

### 1.5 Component Organization — Feature-Based
- [x] Each feature folder has `index.ts` barrel export
- [x] `app/page.tsx` imports: `import { LandingPage } from '@/features/landing-page'`
- [x] Audit `_shared/components/` — only keep components used by 2+ features


## Phase 3: Projects Page

### 3.1 Static Projects Data
- [x] Create `features/projects/data.ts` with real projects:
  - Portfolio itself
  - habbit-tracking-next
  - Any other repos worth showcasing
- [ ] Each project: name, description, repo URL, demo URL (optional), tech stack, image/preview

### 3.2 Dynamic GitHub Integration (Optional)
- [x] Create `features/projects/github.ts` — fetch repo data from GitHub API
- [ ] Create API route or Server Component to fetch pinned/featured repos
- [ ] Cache with `unstable_cache` or `revalidate` tags

### 3.3 Projects UI
- [x] Create `features/projects/components/projects-section.tsx`
- [x] Create `features/projects/components/project-card.tsx`
- [x] Create `features/projects/components/project-card-mini.tsx`
- [x] Consider dedicated `/projects` page if too many for homepage section

**Design notes:** See [[projects]] for full design spec.


## ✅ Completed

All phases completed on 2026-04-15
