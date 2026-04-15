
# File Structure — Current vs Proposed

## Current Structure (Problems)

```
next-portfolio-2025/
├── app/
│   ├── api/
│   │   ├── callback/route.ts          # Spotify callback
│   │   ├── layout.tsx                 # API layout (unusual)
│   │   ├── now-playing/route.ts       # Spotify now playing
│   │   ├── spotify-auth/route.ts      # Spotify auth
│   │   └── spotify-setup/callback/route.ts
│   ├── data.ts                        # ALL data in one file (projects, experience, blog, social)
│   ├── globals.css                     # Huge, mixed concerns
│   ├── layout.tsx                      # Root layout (OK)
│   ├── page.tsx                        # Homepage — MASSIVE, imports everything
│   ├── robots.ts
│   ├── spotify-setup/page.tsx
│   ├── spotify/page.tsx
│   └── v2/page.tsx                    # ?? What is this
├── components/
│   ├── footer-2025-v2.tsx             # Versioned names
│   ├── footer-2025.tsx                # Dead code
│   ├── footer.tsx                     # Dead code
│   ├── header-2025.tsx                # Dead code
│   ├── header-knob.tsx                # Active
│   ├── header.tsx                     # Dead code
│   ├── now-playing.tsx
│   ├── sections/
│   │   ├── about-2.tsx                # Dead
│   │   ├── about-2025-v2.tsx          # Active
│   │   ├── about-2025.tsx             # Dead
│   │   ├── about.tsx                  # Dead
│   │   ├── contact-2.tsx              # Dead
│   │   ├── contact-2025.tsx           # Dead
│   │   ├── contact-launchpad.tsx      # Active
│   │   ├── contact.tsx                # Dead
│   │   ├── experience-2.tsx           # Dead
│   │   ├── experience-2025.tsx        # Active
│   │   ├── experience.tsx             # Dead
│   │   ├── hero-2025-v2.tsx           # Active
│   │   ├── hero-2025.tsx              # Dead
│   │   ├── hero.tsx                   # Dead
│   │   ├── projects-2025.tsx          # Active
│   │   ├── projects.tsx               # Dead
│   │   ├── skills-2025.tsx            # Dead?
│   │   ├── skills-mixer.tsx           # Active
│   │   └── skills.tsx                 # Dead
│   └── ui/
│       ├── animated-background.tsx
│       ├── animated-card.tsx
│       ├── aurora-background.tsx
│       ├── beams-background.tsx        # Unused?
│       ├── circular-equalizer-background.tsx  # Unused?
│       ├── custom-cursor.tsx
│       ├── equalizer-background.tsx    # Unused?
│       ├── flip-link.tsx
│       ├── flowing-lines-background.tsx
│       ├── grid-distortion-background.tsx  # Unused?
│       ├── hexagon-wave-background.tsx     # Unused?
│       ├── keyboard-illustration.tsx
│       ├── launchpad-illustration.tsx
│       ├── magnetic.tsx
│       ├── morphing-dialog.tsx
│       ├── music-background.tsx
│       ├── music-marquee.tsx
│       ├── music-player.tsx
│       ├── oscilloscope-background.tsx     # Unused?
│       ├── preloader.tsx
│       ├── retro-grid-background.tsx
│       ├── rhythm-background.tsx
│       ├── scroll-progress.tsx
│       ├── section-divider.tsx
│       ├── slider.tsx
│       ├── spotlight.tsx
│       ├── text-effect.tsx
│       ├── text-loop.tsx
│       ├── text-morph.tsx
│       ├── timeline.tsx
│       └── waveform-background.tsx         # Unused?
├── hooks/
│   ├── useAudioEngine.tsx
│   └── useClickOutside.tsx
├── lib/
│   ├── audio-context.tsx
│   ├── constants.ts
│   ├── spotify.ts
│   ├── types.ts
│   └── utils.ts
├── public/
│   ├── assets/
│   │   ├── frontend-resources.png
│   │   ├── primarindo.png
│   │   └── quick-chat-wa.png
│   ├── music/
│   │   ├── attention.mp3
│   │   └── edge-of-desire-sunrise-mix.weba
│   ├── cover.jpg
│   ├── grid.svg
│   ├── memoji-1.png
│   ├── nwjns.jpeg
│   ├── next.svg
│   └── vercel.svg
├── tailwind.config.js                  # v3-era config (should be removed)
├── postcss.config.mjs
├── components.json
├── eslint.config.mjs
├── mdx-components.tsx
├── next.config.mjs
├── package.json
├── tsconfig.json
├── INSTALLATION.md
├── SPOTIFY_SETUP.md
└── README.md
```

### Problems
1. **~15 dead component files** — old versions never deleted
2. **No clear separation** — layout vs feature vs section components mixed
3. **data.ts is a catch-all** — projects, experience, blog, social all in one file
4. **Spotify stuff scattered** — API routes + page + components not organized
5. **No content layer** — blog posts are hardcoded arrays, not markdown
6. **UI components bloated** — 10+ background variants, many unused

