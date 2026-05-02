---
title: "Building a Habit Tracker with Next.js 16, Tailwind v4 & shadcn/ui"
slug: building-habit-tracker-nextjs
date: 2026-05-02
description: "A deep dive into building a mobile-first habit tracker with modern Next.js, shadcn/ui components, framer-motion animations, and a localStorage-first architecture for offline-first personal tracking."
tags: [nextjs, tailwind, shadcn, typescript, side-project, productivity, localstorage]
published: true
---

# Building a Habit Tracker with Next.js 16, Tailwind v4 & shadcn/ui

I've always struggled with consistency. Whether it's coding, exercising, or reading — I start strong but fizzle out after a week. So I built a habit tracker to solve my own problem, deployed it locally with PM2, and iterated through several architectural decisions along the way.

## Why Build Your Own vs Buying?

There are plenty of habit tracking apps out there (Streaks, Habitica, Loop). But I wanted something that:
- **Zero friction** — No sign-up, no cloud sync, no permissions. Just open and use.
- **Looks good enough** — I'd actually want to open it daily on my phone.
- **Streaks-first** — Focus on consecutive days, not analytics or complex scoring.
- **Offline-first** — Works anywhere, anytime, no API keys or subscriptions.
- **Own my data** — Everything stays in browser localStorage, exportable JSON.

## The Stack (Production)

After a few iterations, this is the current stack on `main`:

| Layer | Tech |
|-------|------|
| **Framework** | Next.js 16.2 (App Router, React 19) |
| **Styling** | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| **State** | React Query (TanStack) + custom `useStorage` hook |
| **Auth** | — (localStorage only for now) |
| **DB** | — (localStorage only for now) |
| **UI Polish** | Framer Motion (page transitions, card animations) |
| **Icons** | Lucide React |
| **Notifications** | Sonner (toast) |
| **Deployment** | PM2 on VPS (port 3002), Nginx reverse-proxy-ready |

> The app is deliberately client-only (data never leaves the browser). No database, no API routes. All state lives in localStorage.

## Architecture & Data Model

### Types (TypeScript-first)

```ts
export type Frequency = 'daily' | 'weekdays' | 'weekends';

export interface Habit {
  id: string;        // UUID
  name: string;      // "Read 30 min"
  emoji: string;     // "📚"
  color: string;     // "#1D9E75" (hex)
  freq: Frequency;   // scheduling rule
  createdAt: string; // ISO date
}

// Nested logs: { "2026-05-01": { "habitId1": true, "habitId2": true } }
export type Logs = Record<string, Record<string, boolean>>;
```

Data is stored under two keys in localStorage:
- `ht_habits` — array of Habit objects
- `ht_logs` — nested logs object keyed by date

### Custom Hook: `useStorage`

I built a reusable hook that wraps localStorage with automatic JSON serialization + cross-tab sync via `CustomEvent`:

```ts
export function useStorage<T>(key: string, defaultValue: T) {
  const [val, setVal] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      window.dispatchEvent(
        new CustomEvent('ht-storage-update', { detail: { key, val } })
      );
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }, [key, val]);

  // Listen to updates from other tabs/windows
  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      if (e.detail.key === key) setVal(e.detail.val);
    };
    window.addEventListener('ht-storage-update', handleUpdate as EventListener);
    return () => window.removeEventListener('ht-storage-update', handleUpdate as EventListener);
  }, [key]);

  return [val, setVal] as const;
}
```

This means if you open the app in two browser tabs, checking a habit in one instantly reflects in the other. No React Query needed for this — localStorage events are enough.

## Features

### 1. Streak Calculation (Server-side Friendly)
The `getStreak()` utility walks backwards from today through the logs to count consecutive days. It respects the habit's frequency (`daily | weekdays | weekends`) so a "weekdays" habit only counts Monday–Friday.

### 2. Daily Dashboard (`/today`)
All habits for today in one scrollable list. Each card shows:
- Emoji icon with custom background (tinted from habit.color)
- Habit name + frequency badge
- Current streak badge (🔥 12)
- Animated checkmark button (Framer Motion)
- Notes modal (incomplete — TODO)
- Edit / Delete via dropdown (shadcn/ui DropdownMenu)

Check off a habit → instant localStorage write + streak recalc + toast notification.

### 3. Weekly Overview (`/history`)
Calendar-style grid (7 columns × N weeks). Green squares = completed, gray = missed. Built with:
- Tailwind grid + `date-fns` for date math
- Each cell is a clickable pill that opens the `/today` view for that date

### 4. Habits Management (`/habits`)
CRUD for habits via `HabitModal` (Dialog + Form). Features:
- Color picker (circular swatches, 8 preset colors)
- Emoji picker (uses `emoji-picker-react`)
- Frequency selector (RadioGroup)
- ZOD validation on save

### 5. Settings (`/settings`)
- Export data → downloads JSON backup
- Import data → replaces current state
- Clear all data (with confirmation)

## UI/UX Details

### shadcn/ui Everywhere
Instead of hand-rolling dialogs, dropdowns, toasts — I used Radix-based shadcn primitives:
- `Dialog`, `AlertDialog` for modals
- `DropdownMenu` for habit actions
- `Button`, `Textarea`, `Label` for forms
- `Sonner` for toasts (positioned top-right)

All components are unstyled by default, styled via Tailwind utility classes. This keeps bundle size low and theming consistent.

### Framer Motion Polish
- Cards animate on mount (slide + fade in)
- Checked habits get a subtle gradient shine sweep (`.animate-shine`)
- Modal open/close transitions (scale + fade)
- Staggered list animations (cascade effect)

### Dark Mode via `next-themes`
Switches between light/dark system preference. All colors use Tailwind's `dark:` variants (grays, zinc, slate).

## Lessons Learned (Technical)

### 1. Turbopack Panic on Build (Next.js 16)
After upgrading to Next.js 16.0.10, `next build` crashed with:
```
Turbopack Error: Dependency tracking is disabled so invalidation is not allowed
```
Root cause: Turbopack's new default behavior in Next.js 16 conflicted with the workspace root detection (multiple `package-lock.json` files). Fix:
- Upgraded to Next.js 16.2.4 (patch includes Turbopack stability fixes)
- Deleted conflicting route folder (`app/sitemap.xml/`) that collided with `app/sitemap.ts`
- Cleared `.next` cache before rebuild

### 2. SSR `localStorage` is not defined
During static generation, any direct `localStorage` access throws. Solutions:
- Wrap all localStorage calls in `useEffect` or `useStorage` (which initializes lazily via `useState` getter)
- Add `'use client'` directives to all components using localStorage
- Home page uses `mounted` flag to avoid hydration mismatch

### 3. Next.js 16 Strict Route + Metadata Conflicts
Having both `app/sitemap.ts` (route) and `app/sitemap.xml/` (folder) simultaneously triggers:
```
Conflicting route and metadata at /sitemap.xml
```
Removed the folder, kept the file route.

### 4. Feature-based Folder Structure
```
app/
  habits/       → CRUD + list
  today/        → daily check-in
  history/      → weekly grid
  settings/     → import/export
  layout.tsx    → Providers, metadata
  page.tsx      → redirect to /today if habits exist, else onboarding
components/
  habit-card.tsx
  habit-modal.tsx
  delete-modal.tsx
  streak-badge.tsx
  check-mark.tsx
  onboarding.tsx
lib/
  storage.ts     ← localStorage hook (cross-tab sync)
  streaks.ts     ← getStreak() math
  types.ts       ← TypeScript interfaces
  utils.ts       ← cn() helper
```
This keeps concerns separated: UI components, business logic, and data storage don't mix.

### 5. Why Not Use React Query for LocalStorage?
I initially thought about using React Query to cache localStorage reads. But:
- localStorage is synchronous and instant — no need for loading states
- Cross-tab sync via `CustomEvent` is lighter than Query's cache invalidation
- Simpler to just use a custom hook — fewer dependencies, no query keys to manage

If I ever add a backend sync layer, I'll reintroduce React Query as a caching layer between localStorage and the network.

## What's Next (Roadmap)

1. **Data Export/Import** — Already in settings (JSON blob). Could add iCal/CSV export.
2. **Widget / PWA** — Manifest + service worker for installability on home screen.
3. **Reminders** — Since localStorage has no push, I'd need a background service worker (complex).
4. **Backend Sync** — Supabase or a simple Next.js API route to sync across devices. Would let me keep React Query.
5. **Gamification** — Add XP per completion, level-ups, maybe a leaderboard (local only).
6. **Chrome Extension** — Quick-check from toolbar.

## Deployment Notes

Production build runs on PM2 as a fork process:
```bash
pm2 start ecosystem.config.js
# → habit-tracker | port 3002 | NODE_ENV=production
```

Nginx reverse-proxy on my VPS routes:
- `habittracker.example.com` → `localhost:3002`

SSL: Let's Encrypt via DNS-01 challenge (domain uses Cloudflare with Basic Auth protection on subdomains).

## Source Code

The repo is open (private by choice) but the architecture serves as a template for other client-only apps. Key takeaway: **You don't need a backend to build something useful.** localStorage is surprisingly powerful when paired with good UX.

The best productivity app is the one you actually use. This one, I use daily.
