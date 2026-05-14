# Design — Visual Direction 2026

> Theme: **RETRO CONSOLE** — Famicom × PS1 × Arcade Cabinet
> Palette: red / gray / black / white (no other accents)
> Companion docs: `tokens.md` (values), `3d-and-animation.md` (motion + WebGL)
> Scope of this doc: **visual identity only**. Story copy / requirements / tasks akan disusun ulang setelah visual direction approved.

---

## 0. TL;DR

Bayangin lu nyalain Famicom / Sega Saturn taun 1996. Layar CRT bulging. Power LED merah nyala. Logo console muncul, lalu title screen pixel-perfect dengan tulisan **PRESS START**. Behind the title, low-poly 3D character muter pelan — ada vertex jitter, ada texture warping khas hardware tahun itu. Sound efek "blip" pas hover. Itu portfolio Adit v2026.

Ga ada music metaphor. Ga ada DAW. Ga ada amber. Bersih dari studio session.

---

## 1. Theme Identity: "Player One"

### 1.1 The Mood

Nostalgia hardware tapi rendering modern. Pakai **referensi era 1990-2001** sebagai kosakata visual, eksekusi pakai stack 2026 (R3F, WebGL, CSS modern). Bukan ironic / kitsch — serius dan crafted. Think: **Yoshitomo Nara × Kojima × Persona menu screen**.

Tiga pilar:

**Pilar 1 — Console Hardware Identity**
- Power LED merah single point of focus
- Plastic gray housing texture (subtle)
- Pixel grid base 2px/4px snap
- CRT screen vibe (curvature subtle, scanlines optional)

**Pilar 2 — Arcade UI Chrome**
- Bold all-caps pixel/condensed sans
- Score-counter mono digits
- "PRESS START" / "INSERT COIN" / "1P/2P" framing
- HUD layouts dengan corner brackets `[ ]`

**Pilar 3 — Early 3D Era**
- Low-poly meshes (50–500 tris max)
- Affine texture mapping look (no perspective correction)
- Vertex jitter (PS1-era wobble)
- Flat shading / single light source
- No anti-aliasing on 3D edges (intentional aliasing)

### 1.2 Visual References

**Game / Console references**:
- Famicom box art (Japanese region, 1985–1989)
- Virtua Fighter 1 character select (Saturn, 1994)
- Tekken 3 splash screen (PS1, 1997)
- Ridge Racer Type 4 menus (PS1, 1999)
- Ape Escape title (PS1, 1999) — for 3D character mood
- Persona 1 / Persona 2 IS UI (PSX) — for grid + portrait composition
- Marvel vs Capcom 2 character select grid (Dreamcast, 2000)

**Web references** (modern execution of retro):
- bruno-simon.com (3D in browser, but we go aliased not smooth)
- enabel.be (low-poly hero)
- ondrejhruby.cz (CRT + monospace pixel feel)
- sariska.io (red/black brutalist + 3D)
- t3.gg redesign 2024 (pixel grid + bold red)
- bennettfeely.com (CSS 3D experiments)

**Product / industrial references**:
- Famicom red+white plastic housing
- Sega Saturn dark gray
- Game Boy Pocket black plastic
- Arcade cabinet marquee art
- VHS slipcover late 80s

### 1.3 Anti-References (jangan ke arah ini)

- ❌ Glassmorphism / Aqua / iOS glass — tidak retro
- ❌ Cyberpunk neon (purple/cyan) — overused
- ❌ Vaporwave aesthetic (pink/cyan grid) — meme tier
- ❌ Pixel art portrait (8-bit Mario style) — too literal, juvenile
- ❌ Skeumorphic console (real photo of PS1) — kitsch
- ❌ Smooth modern 3D (Octane render shiny) — kontradiksi era
- ❌ Music / DAW / studio metaphor — eksplisit dibuang

---

## 2. Palette (Strict)

Hanya 4 warna chrome boleh dipakai. Apapun di luar 4 ini = REJECT.

```
RED      #E10600   →  brand, active state, power LED, hover, danger glyph
WHITE    #F5F5F2   →  primary text dark mode, pixel grid highlight
GRAY     #2A2A2D   →  console plastic, surface elevated, secondary text
BLACK    #0A0A0A   →  page background dark mode, deep shadow
```

Plus 4 derivatif (tints/shades) untuk depth — tetap dalam family yang sama:

```
RED-DIM        #8A0400   →  red text on light, depressed button state
GRAY-LIGHT     #4A4A4D   →  border, divider, secondary surface
GRAY-DEEP      #1A1A1C   →  card surface dark mode
WHITE-DIM      #C8C8C4   →  body text dim, disabled
```

**Light mode** (alt theme — opsional, lower priority):
- BG: `#F5F5F2` (off-white CRT bezel)
- TEXT: `#0A0A0A`
- ACCENT: `#E10600` (sama)
- SURFACE: `#E0E0DC`

**Constraint**: NO gradient kecuali untuk CRT scanline / phosphor glow. NO transparency overlay yang campur warna baru. NO blue / green / purple / amber / orange.

### 2.1 Where Red Goes

Red itu ekspensif — pakai sparingly biar punya power:
- Power LED dot (always on, pulsing)
- Active nav item underline
- Hover state on primary CTA
- Currently selected stage / project
- "PRESS START" blink
- Recording / live indicator
- Error state

### 2.2 Where Red DOESN'T Go

- Body paragraph text (gunakan WHITE atau WHITE-DIM)
- Section background
- Decorative line / divider (gunakan GRAY-LIGHT)
- Icon outline (kecuali active)

---

## 3. Typography

### 3.1 Font Stack

```
/* Display — title screens, hero, section heading */
--font-display: 'VT323', 'Press Start 2P', 'Pixelify Sans', monospace;
   - Pixel font, large only (≥ 32px)
   - Crisp at integer multiples (16/32/48/64/96/144)

/* Heading — sub-heading, card title */
--font-heading: 'Space Grotesk', 'Archivo', system-ui, sans-serif;
   - Condensed bold geometric, all-caps friendly
   - Used at 14–32px

/* Body — paragraph, description */
--font-body: 'Inter', -apple-system, system-ui, sans-serif;
   - Workhorse, 400/500/600
   - Used at 13–18px

/* Mono — HUD, stats, score, code */
--font-mono: 'JetBrains Mono', 'IBM Plex Mono', monospace;
   - HUD digits, score counter, terminal flavor
   - Used at 10–14px
```

**Free combo (Google Fonts)** — semua MVP-friendly:
- VT323 (display pixel)
- Space Grotesk (heading condensed)
- Inter (body)
- JetBrains Mono (HUD)

### 3.2 Type Scale

| Style | Size | Font | Weight | Tracking | Use Case |
|-------|------|------|--------|----------|----------|
| Title XL | clamp(72px, 14vw, 192px) | display | 400 | 0 | Hero "ADIT" title screen |
| Title L | clamp(48px, 9vw, 96px) | display | 400 | 0 | Section heading |
| Heading L | clamp(28px, 4vw, 40px) | heading | 700 | 0.02em | Card title, modal title |
| Heading M | 18-20px | heading | 700 | 0.04em uppercase | Sub-section |
| Heading S | 14px | heading | 700 | 0.08em uppercase | Eyebrow |
| Body L | 16-18px | body | 400 | 0 | Paragraph hero |
| Body M | 14px | body | 400 | 0 | Paragraph |
| Body S | 13px | body | 400 | 0 | Caption, footnote |
| HUD | 12px | mono | 600 | 0.1em | Stats, meta, timestamp |
| HUD-XS | 10px | mono | 700 | 0.16em uppercase | Status pill, badge |

### 3.3 Pixel Font Rendering Rules

VT323 hanya crisp pada size kelipatan baseline. Jangan pakai 33px / 45px / 51px:
```css
.title-xl   { font-size: 144px; line-height: 1.0; image-rendering: pixelated; }
.title-l    { font-size: 96px;  line-height: 1.0; }
.title-m    { font-size: 64px;  line-height: 1.0; }
.title-s    { font-size: 32px;  line-height: 1.0; }
```

Pada display font, **JANGAN** pakai `font-smoothing: antialiased` — biarkan default `subpixel-antialiased` agar pixel edges crisp di Retina.

---

## 4. Layout Grammar

### 4.1 Pixel Grid

Base unit **4px** (bukan 8px). Semua spacing kelipatan 4. Snap-to-grid.

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
--space-32: 128px
--space-48: 192px
```

### 4.2 Container

Max width content **1280px** (CRT 4:3 aware). Tapi hero / 3D canvas full-bleed.

```
.container { max-width: 1280px; padding-inline: clamp(16px, 4vw, 64px); }
.container-narrow { max-width: 720px; }
.full-bleed { width: 100vw; margin-left: calc(50% - 50vw); }
```

### 4.3 Composition Rules

- **Asymmetric grid**: 12 column tapi sering dilanggar untuk effect bold
- **Corner brackets**: setiap card / panel boleh punya `[ ]` di empat pojok (2px stroke, GRAY-LIGHT)
- **Hard edges**: NO border-radius kecuali pada power LED dot, status dot, dan beberapa control khusus. Default `border-radius: 0`.
- **Stacking layers**: `<header>` selalu z-50, `<canvas-3d>` z-0 sebagai backdrop, content z-10.

### 4.4 Section Anatomy

Semua section pakai struktur ini:

```
┌─ STAGE LABEL (top-left, mono HUD)
│  STAGE-02 // ABOUT
│
│
│  [hero block — title + 3D + content]
│
│
└─ STAGE FOOTER (bottom-left HUD)
   PRESS [↓] TO CONTINUE
```

Setiap section punya nomor **STAGE-01 ... STAGE-07**. Bahkan footer = STAGE-CLEAR.

### 4.5 Header / HUD Bar (Global Chrome)

Konsep: header = **console HUD bar** kayak pause-menu strip atau status bar di game. Always visible, sticky di top, jadi konteks "stage indicator" buat user tau lagi ada di section mana.

#### 4.5.1 Anatomy (Desktop ≥ 1024px)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ◉ ADIT │ STAGE-02 // CHARACTER │ HOME · ABOUT · WORK · CONTACT · BLOG │ ⚙ ☾ ⏯ │
└─────────────────────────────────────────────────────────────────────────────────┘
  ZONE 1     ZONE 2                  ZONE 3                            ZONE 4
```

| Zone | Content | Style |
|------|---------|-------|
| 1 — Brand | Power LED dot (red, pulsing) + "ADIT" | Display font 24px WHITE, dot 8px RED |
| 2 — Stage | `STAGE-NN // <NAME>` (current section) | Mono 11px uppercase, GRAY-2, RED dot kalau stage selesai di-pass |
| 3 — Nav | Home · About · Work · Contact · Blog | Mono 12px uppercase tracking 0.1em, hover RED, active underline RED 2px |
| 4 — Controls | CRT toggle / SFX toggle / Theme / Replay | Square 32×32 chunky button, icon outline 2px |

#### 4.5.2 Layout Specs

```css
.hud-bar {
  position: sticky;
  top: 0;
  z-index: var(--z-hud);            /* 50 */
  height: 56px;                      /* desktop */
  background: var(--gray-deep);      /* solid, NO blur */
  border-bottom: 2px solid var(--white);
  padding-inline: clamp(16px, 4vw, 48px);
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 32px;
}

@media (max-width: 768px) {
  .hud-bar { height: 48px; grid-template-columns: auto 1fr auto; gap: 16px; }
}
```

Background **harus solid** — backdrop-blur / transparency akan break the retro feel. Border bottom 2px white = the "screen bezel" cue.

#### 4.5.3 Stage Indicator Logic

Track scroll position pakai IntersectionObserver. Setiap section punya `data-stage` attribute. HUD bar update Zone 2 dengan stage current:

```tsx
// pseudocode
const [stage, setStage] = useState({ n: '01', name: 'TITLE' });

useEffect(() => {
  const obs = new IntersectionObserver((entries) => {
    const visible = entries.find(e => e.isIntersecting);
    if (visible) {
      const el = visible.target as HTMLElement;
      setStage({
        n: el.dataset.stageNum!,
        name: el.dataset.stageName!,
      });
    }
  }, { threshold: 0.4 });

  document.querySelectorAll('[data-stage-num]').forEach(s => obs.observe(s));
  return () => obs.disconnect();
}, []);
```

Stage labels:
- `STAGE-01 // TITLE`
- `STAGE-02 // CHARACTER`
- `STAGE-03 // INVENTORY`
- `STAGE-04 // CAREER`
- `STAGE-05 // RELEASES`
- `STAGE-06 // SAVE`
- `STAGE-CLEAR // FOOTER`

#### 4.5.4 Controls Cluster (Zone 4)

4 toggle button, semua chunky 32×32 square:

| Button | Default | Behavior |
|--------|---------|----------|
| `[CRT]` | ON | Toggle CSS scanlines + post-FX shader |
| `[SFX]` | OFF (mute) | Toggle sound effects globally |
| `[☾/☀]` | dark | Toggle theme (dark default, light alt) |
| `[⏯]` | — | "Replay boot sequence" — dev/easter egg |

Button style:

```jsx
<button
  data-on={on}
  className="
    h-8 w-8 inline-grid place-items-center
    border-2 border-white-dim
    bg-transparent text-white-dim
    data-[on=true]:border-red data-[on=true]:text-red
    hover:border-white hover:text-white
    transition-colors duration-100
  "
  aria-label="Toggle CRT effect"
  aria-pressed={on}
>
  <svg width="16" height="16" /* icon */ />
</button>
```

State persisted ke `localStorage`:
- `_crt_enabled` (default `true`)
- `_sfx_enabled` (default `false`)
- `_theme` (default `'dark'`)

#### 4.5.5 Nav Links (Zone 3)

```jsx
<nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-[0.12em]">
  {NAV_ITEMS.map(item => (
    <a
      key={item.href}
      href={item.href}
      data-active={item.href === currentSection}
      className="
        relative py-1 text-white-dim
        hover:text-white
        data-[active=true]:text-white
        data-[active=true]:after:absolute data-[active=true]:after:inset-x-0 data-[active=true]:after:bottom-0
        data-[active=true]:after:h-0.5 data-[active=true]:after:bg-red
      "
    >
      {item.label}
    </a>
  ))}
</nav>
```

Hover: text WHITE-DIM → WHITE. Active: WHITE + 2px RED underline (no transition — instant on load, fade only on hover).

#### 4.5.6 Mobile (≤ 768px) — "PAUSE MENU"

Mobile HUD bar simplified:

```
┌─────────────────────────────────────┐
│ ◉ ADIT │ STAGE-02 // CHARACTER │ ☰ │
└─────────────────────────────────────┘
```

- Brand (Zone 1) tetap
- Stage indicator (Zone 2) tetap, font ↓ 10px
- Nav + controls hidden, replaced by single hamburger (D-pad style icon)

Hamburger click → fullscreen "PAUSE MENU" overlay:

```
┌────────────────────────────────────────┐
│                                        │
│            ╔══════════╗                │
│            ║  PAUSE   ║                │
│            ╚══════════╝                │
│                                        │
│         ▸ HOME                         │
│           ABOUT                        │
│           SKILLS                       │
│           EXPERIENCE                   │
│           PROJECTS                     │
│           CONTACT                      │
│           BLOG                         │
│                                        │
│         ─────────────────              │
│                                        │
│         CRT [ON]   SFX [OFF]           │
│         THEME [DARK]                   │
│                                        │
│         ▸ PRESS [×] TO RESUME           │
│                                        │
└────────────────────────────────────────┘
```

Pause Menu specs:
- Position: fixed inset-0, z-index 100 (above HUD bar)
- Background: BLACK 95% opacity (slight transparency OK on overlay, not on HUD)
- Animation: fade 200ms `steps(4, end)` (NES-menu pop feel)
- Item active: `>` cursor prefix RED + WHITE text (others WHITE-DIM)
- Keyboard: ↑/↓ navigate, Enter select, Esc/× close
- Tap outside menu area = close
- Lock body scroll while open

#### 4.5.7 Boot Sequence Integration

Saat first load (boot sequence active), HUD bar **hidden**. Reveal pas boot complete dengan slide-down animation:

```css
@keyframes hud-drop {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(0); }
}
.hud-bar.is-revealing {
  animation: hud-drop 240ms steps(6, end) forwards;
}
```

#### 4.5.8 Reduced Motion

- Power LED dot: solid (no pulse)
- Stage indicator: instant change (no animation)
- Nav active underline: instant (no transition)
- Boot drop-in: skipped, HUD visible immediately

---

## 5. Section-Level Visual Direction

### 5.1 Hero — "TITLE SCREEN"

**Konsep**: Title screen game konsol jadul.

**Layout** (full viewport):
```
┌──────────────────────────────────────────────────────────┐
│ ◉ POWER  STAGE-01 // TITLE                  ⚡ 2026.05    │  ← top HUD
│                                                          │
│                                                          │
│              ╔══════════════════════════════╗            │
│              ║                              ║            │
│              ║         A D I T              ║            │
│              ║       H I M A O N E          ║            │
│              ║                              ║            │
│              ║   FRONTEND ENGINEER  v26     ║            │
│              ║                              ║            │
│              ╚══════════════════════════════╝            │
│                                                          │
│            [LOW-POLY 3D MASCOT ROTATING]                 │
│                                                          │
│                  ▶ PRESS  START                          │
│                  (blinking, click to scroll)             │
│                                                          │
│ © FIRSTPARTY · MADE IN JAKARTA      P1: ADIT [READY]     │  ← bottom HUD
└──────────────────────────────────────────────────────────┘
```

**Elements**:
- Background: solid BLACK + faint pixel grid (4×4 GRAY-LIGHT 4% opacity)
- Title: VT323 ~144px, WHITE
- Subtitle: Space Grotesk 14px uppercase, WHITE-DIM
- 3D: low-poly bust / character rotating (see `3d-and-animation.md` §2.1)
- "PRESS START": Space Grotesk 18px, blink 1s on/off, RED on hover
- HUD top: power LED red dot (blinking), stage label mono
- HUD bottom: "P1: ADIT [READY]" mono, "© FIRSTPARTY"
- CRT scanline overlay: optional toggle (default ON, see §7.3)

**Removed from old**: vinyl needle, Now Playing ticker, music notes, transport bar.

### 5.2 About — "CHARACTER SELECT"

**Konsep**: Game character stats screen / fighter select.

**Layout** (split):
```
┌──────────────────────────────────────────────────────────┐
│ STAGE-02 // CHARACTER                                    │
│                                                          │
│  ┌────────────┐  ┌─────────────────────────────────┐    │
│  │            │  │ NAME : ADITYA HIMAWAN           │    │
│  │            │  │ CLASS: FRONTEND ENGINEER         │    │
│  │   3D       │  │ AGE  : 27                       │    │
│  │   PORTRAIT │  │ BASE : JAKARTA SOUTH            │    │
│  │   (low-    │  ├─────────────────────────────────┤    │
│  │    poly)   │  │ STATS                            │    │
│  │            │  │ ──────────────                   │    │
│  │            │  │ REACT       ████████░░  85       │    │
│  │            │  │ NEXT.JS     █████████░  92       │    │
│  │            │  │ TYPESCRIPT  ████████░░  80       │    │
│  └────────────┘  │ MOTION      ██████░░░░  62       │    │
│                  │ SHIPPING    █████████░  90       │    │
│                  └─────────────────────────────────┘    │
│                                                          │
│  CURRENTLY EQUIPPED: BISADAYA · FAST 8                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Elements**:
- 3D portrait: low-poly head/bust, slow rotation, idle bob
- Stats panel: pixel-style ASCII bars (full block U+2588, light shade U+2591)
- "CURRENTLY EQUIPPED" footer: mono, RED dot before label
- DAW timeline / clips / playhead → DELETED

### 5.3 Skills — "INVENTORY / SKILL TREE"

**Konsep**: Game inventory grid OR skill tree node graph.

**Pilihan A — Inventory Grid** (default, simpler):
```
┌─ STAGE-03 // SKILLS ────────────────────────────────────┐
│                                                          │
│   INVENTORY                                              │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                    │
│  │ R │ │ N │ │ TS│ │TLW│ │MOT│ │ ✦ │                    │
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                    │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                    │
│  │ JS│ │ HT│ │CSS│ │ Q │ │tan│ │ ✦ │                    │
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                    │
│                                                          │
│  > SELECTED: REACT                                       │
│    YEARS: 4  ·  PROJECTS: 12  ·  MASTERY: ★★★★☆          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Elements**:
- Grid 6×N square cells, 80×80px masing-masing
- Cell border GRAY-LIGHT, hover RED, selected RED filled
- Icon rendering: tech logo monochrome (white) within cell
- Cell hover: zoom 1.05 + RED glow
- Detail panel below grid: nama tech, years, projects count, mastery stars

Mixer / fader / knob → DELETED.

### 5.4 Experience — "STAGE SELECT"

**Konsep**: Stage select map kayak Mega Man / Street Fighter II.

**Layout**:
```
┌─ STAGE-04 // CAREER ────────────────────────────────────┐
│                                                          │
│   STAGE SELECT                                           │
│                                                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│   │  STAGE 1 │  │  STAGE 2 │  │  STAGE 3 │  │  STAGE 4 ││
│   │          │  │          │  │          │  │          ││
│   │  [thumb] │  │  [thumb] │  │  [thumb] │  │  [thumb] ││
│   │          │  │          │  │          │  │ ◉ CURRENT││
│   │ FAST 8   │  │ 80&CO    │  │ UNZYPSOFT│  │ VOC.SCH  ││
│   │ '22-NOW  │  │ '21-'22  │  │ '20-'21  │  │ '17-'19  ││
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│                                                          │
│   > NOW PLAYING: STAGE 1 — FAST 8 (FRONTEND ENG)         │
│                                                          │
│   ────────────────────────────────────────               │
│   [details panel: role bullets, tech, achievements]      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Elements**:
- 4 stage tile grid (or horizontal scroll on mobile)
- Each tile: 240×240px, GRAY-DEEP background, GRAY-LIGHT border 2px
- Current job tile: RED border thick + corner brackets glowing
- Hover: tile lifts via box-shadow (no transform translate to avoid CLS)
- Click: tile zooms ke detail panel below
- Detail panel: NES-style text box (GRAY-DEEP bg, WHITE border 2px, mono content)

### 5.5 Projects — "TROPHY / GAME COLLECTION"

**Konsep**: Cartridge / game case shelf. Tiap project = 1 game cartridge.

**Layout**:
```
┌─ STAGE-05 // RELEASES ──────────────────────────────────┐
│                                                          │
│   GAME LIBRARY · 06 CARTRIDGES                           │
│                                                          │
│  [ALL] [WEB3] [CORP] [PROD] [DEFI] [BIO]   ← filter      │
│                                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐                           │
│  │ ╔══╗ │  │ ╔══╗ │  │ ╔══╗ │                           │
│  │ ║3D║ │  │ ║3D║ │  │ ║3D║ │   ← low-poly cartridges    │
│  │ ╚══╝ │  │ ╚══╝ │  │ ╚══╝ │                           │
│  │ TITLE│  │ TITLE│  │ TITLE│                           │
│  └──────┘  └──────┘  └──────┘                           │
│                                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐                           │
│  │ ...  │  │ ...  │  │ ...  │                           │
│  └──────┘  └──────┘  └──────┘                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Elements**:
- 3 col desktop, 2 col tablet, 1 col mobile
- Card: 320×400px
- Top half: low-poly 3D cartridge (canvas, see `3d-and-animation.md` §2.3) — tiap project warna body cartridge beda (variation grayscale + sticker color), idle floating + slow rotation
- Bottom half: title (heading L), genre tag, year, metric line
- Hover: cartridge eject animation (3D translate Y +20px), card border RED
- Click: full-screen modal — cartridge inserted into "console" + boot screen reveals project detail
- Filter chip: NES-style button GRAY-DEEP bg, RED active fill

Vinyl record / sleeve metaphor → DELETED.

### 5.6 Contact — "SAVE POINT / PASSWORD INPUT"

**Konsep**: Save point dari JRPG (Final Fantasy save crystal) atau password input screen.

**Pilihan A — Save Point** (cleaner):
```
┌─ STAGE-06 // SAVE ──────────────────────────────────────┐
│                                                          │
│             [ 3D SAVE CRYSTAL — pulsing red ]            │
│                                                          │
│   > SAVE PROGRESS                                        │
│     CONTACT.DAT : ADITYAHIMAONE@GMAIL.COM                │
│     SOCIAL.DAT  : @ADITYAHIMAONE                         │
│     LINK.DAT    : LINKEDIN.COM/IN/ADITYAHIMAONE          │
│     CV.DAT      : /CV.PDF                                │
│                                                          │
│   ┌─────────────────────────────────────┐               │
│   │  PRESS [A] TO COPY EMAIL             │               │
│   │  PRESS [B] TO OPEN LINKEDIN          │               │
│   │  PRESS [X] TO OPEN GITHUB            │               │
│   │  PRESS [Y] TO DOWNLOAD CV            │               │
│   └─────────────────────────────────────┘               │
│                                                          │
│             > READY TO COLLAB ?                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Elements**:
- 3D save crystal: octahedron, RED emissive material, pulsing scale 1.0 → 1.05
- Each "DAT" line: hover → expand inline, click → copy / open
- Action buttons: NES-style chunky button dengan shadow offset 4px
- Sound effect on action: blip on hover, confirm chime on click (≤ 200ms WAV, see `3d-and-animation.md` §5)

Launchpad / Tone.js synth → DELETED. Tetap simpel: 4 action button.

### 5.7 Footer — "STAGE CLEAR"

**Konsep**: Game ending stats screen.

**Layout**:
```
┌─ STAGE-CLEAR ───────────────────────────────────────────┐
│                                                          │
│             ★  STAGE  CLEAR  ★                           │
│                                                          │
│   PLAYER     : ADIT                                      │
│   TIME       : 00:02:43                                  │
│   SCROLL     : 100%                                      │
│   SECTIONS   : 6/6                                       │
│   RANK       : S                                         │
│                                                          │
│   > LAST COMMIT: 2 days ago · feat: redesign 2026         │
│                                                          │
│   [HOME]  [BLOG]  [GITHUB]  [LINKEDIN]                   │
│                                                          │
│   © 2026 · ADIT · MADE IN JAKARTA · INSERT COIN ↻        │
└──────────────────────────────────────────────────────────┘
```

**Elements**:
- "STAGE CLEAR" — VT323 64px, RED, blinking
- Time = real session time (live counter)
- Scroll = scroll percentage (snapshot at footer view)
- Rank = always "S" (cheeky)
- Action chips: hard rectangle, GRAY-DEEP bg, WHITE border, hover RED

---

## 6. Component Pattern Library

### 6.1 Power LED Dot

```
.led-dot {
  width: 8px; height: 8px;
  border-radius: 50%;        /* the only round element allowed */
  background: var(--red);
  box-shadow: 0 0 6px var(--red), 0 0 12px var(--red-dim);
  animation: led-pulse 1.6s ease-in-out infinite;
}
@keyframes led-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}
```

### 6.2 Pixel Bracket Frame

Frame untuk panel / card. Empat corner brackets, no continuous border.

```jsx
<div className="relative p-6 bg-[--gray-deep]">
  {/* corners */}
  <span className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-white" />
  <span className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-white" />
  <span className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-white" />
  <span className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-white" />

  {/* content */}
  <h3 className="font-display text-3xl">CARD TITLE</h3>
</div>
```

### 6.3 NES-Style Text Box

Text box style klasik (Zelda 1, Earthbound):

```
┌─ ▼ ─────────────────────────────────────┐
│                                         │
│  Adit found a new project!              │
│  > REACT framework grants you           │
│    +85 SHIPPING ability.                │
│                                         │
└─────────────────────────────────────────┘
```

```jsx
<div className="relative bg-black border-2 border-white p-5">
  <span className="absolute -top-px left-4 px-1 bg-black font-mono text-xs">▼</span>
  <p className="font-mono text-sm leading-relaxed">
    > {'>'} Press [A] to continue
  </p>
</div>
```

### 6.4 Score Counter

HUD digit counter, mono font, leading zeros:

```jsx
<div className="font-mono text-sm tracking-widest text-white">
  SCORE <span className="text-red-500">0042815</span>
</div>
```

### 6.5 Stat Bar (ASCII Block)

```
HP  ████████░░  80
MP  ██████░░░░  60
```

Pakai unicode block: full `█` (U+2588) WHITE, light `░` (U+2591) GRAY-LIGHT. Max 10 cells.

```jsx
function StatBar({ label, value }: { label: string; value: number }) {
  const filled = Math.round(value / 10);
  return (
    <div className="font-mono text-sm flex items-center gap-3">
      <span className="w-24 uppercase">{label}</span>
      <span className="text-white">{'█'.repeat(filled)}</span>
      <span className="text-zinc-600">{'░'.repeat(10 - filled)}</span>
      <span className="w-8 text-right tabular-nums">{value}</span>
    </div>
  );
}
```

### 6.6 Chunky Button

NES-style chunky action button, shadow offset 4px (no spread, no blur):

```jsx
<button className="
  relative inline-flex items-center justify-center
  px-6 py-3
  bg-[--gray-deep] border-2 border-white
  font-mono text-sm uppercase tracking-widest text-white
  shadow-[4px_4px_0_0_var(--red)]
  transition-transform duration-100
  hover:translate-x-[2px] hover:translate-y-[2px]
  hover:shadow-[2px_2px_0_0_var(--red)]
  active:translate-x-[4px] active:translate-y-[4px]
  active:shadow-none
">
  PRESS START
</button>
```

### 6.7 Filter Chip / Tab

Toggle chip ala fighting game character filter:

```jsx
<button
  data-active={active}
  className="
    px-4 py-2
    border-2 border-white
    font-mono text-xs uppercase tracking-wider
    bg-transparent text-white
    data-[active=true]:bg-[--red] data-[active=true]:border-[--red]
  "
>
  WEB3
</button>
```

### 6.8 Loading Bar (Section Transition)

```
LOADING NEXT STAGE...
████████████████░░░░░░░░  60%
```

Used pada section divider — see `3d-and-animation.md` §4.

---

## 7. Surface Treatments

### 7.1 Pixel Grid Background

Subtle 4×4 atau 8×8 grid pada section background:

```css
.bg-grid {
  background-image:
    linear-gradient(to right,  rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 8px 8px;
}
```

### 7.2 Plastic Texture (Console Housing)

Untuk panel / card surface — efek plastic gray housing:

```css
.surface-plastic {
  background:
    radial-gradient(ellipse at top left, rgba(255,255,255,0.04), transparent 40%),
    var(--gray-deep);
  background-size: 100% 100%;
}
```

### 7.3 CRT Scanlines (Toggle, default ON)

Overlay tipis di seluruh viewport. Bisa di-disable via toggle button (footer / settings):

```css
.crt-scanlines::after {
  content: '';
  position: fixed; inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.18) 3px,
    rgba(0, 0, 0, 0.18) 4px
  );
  mix-blend-mode: multiply;
  z-index: 9999;
}
```

Detail penuh termasuk WebGL CRT shader: `3d-and-animation.md` §3.

### 7.4 Phosphor Glow (RED only)

Untuk "PRESS START" / red text yang harus glow CRT-like:

```css
.glow-red {
  color: var(--red);
  text-shadow:
    0 0 4px var(--red),
    0 0 8px var(--red-dim),
    0 0 16px rgba(225, 6, 0, 0.4);
}
```

---

## 8. Iconography

Pakai `lucide-react` tetap, tapi rendering rules baru:
- Stroke 2px (chunky)
- Square line cap (bukan round)
- No filled icon — outline only kecuali active state
- Active state: filled WHITE atau RED

Tambahan custom icon SVG (square pixel-style):
- `cartridge.svg` — game cartridge silhouette
- `dpad.svg` — D-pad shape
- `controller-buttons.svg` — A/B/X/Y button cluster
- `power-led.svg` — LED dot (versi static)
- `crt-screen.svg` — bezel + screen
- `coin.svg` — arcade coin (untuk "INSERT COIN")
- `save-crystal.svg` — RPG save point

Semua custom icon: 24×24 viewBox, 2px stroke, square cap.

---

## 9. Cursor & Pointer

Custom cursor optional (default OS cursor masih oke). Kalau implement:

```css
body {
  cursor: url('/cursor-arrow.svg') 0 0, auto;
}
button, a {
  cursor: url('/cursor-pointer.svg') 0 0, pointer;
}
```

`cursor-arrow.svg` = white pixel arrow 16×16, 2px black border (NES menu cursor look).
`cursor-pointer.svg` = white pixel hand atau RED `▶` arrow.

---

## 10. Dark / Light Mode

**Default**: dark mode (true console-on-CRT-in-dark-room mood).

**Light mode** (low priority, opsional):
- Membalikkan BLACK ↔ WHITE
- RED tetap sama (#E10600)
- GRAY tetap sama tapi switched roles
- CRT scanlines: opacity ↓ ke 0.06 (less visible on white)

Untuk MVP — fokus dark mode. Light mode = post-launch.

---

## 11. Responsive Strategy

| Breakpoint | Behavior |
|------------|----------|
| < 640 (mobile) | Single column, 3D canvas tetap render tapi resolusi ↓ 50%, scanlines tetap, HUD compact |
| 640–1024 (tablet) | 2 col layout di Skills/Projects, 3D canvas full quality |
| > 1024 (desktop) | Full grid, all visual chrome on |
| > 1536 | Container max 1280, generous side margin |

**Mobile constraint**: 3D canvas fallback ke static image (poster frame) kalau `prefers-reduced-motion: reduce` atau detect device GPU rendah (`GPUTier` library).

---

## 12. Accessibility

- Color contrast: RED #E10600 on BLACK #0A0A0A → 5.16:1 ✓ AA
- WHITE #F5F5F2 on BLACK #0A0A0A → 18.5:1 ✓ AAA
- Pixel font readability: minimum size 16px, jangan pakai VT323 untuk body
- All 3D canvas punya `aria-hidden="true"` + screen reader fallback text di parent
- Keyboard navigation: arrow keys di Stage Select / Inventory grid (WASD juga support)
- `prefers-reduced-motion`: matikan vertex jitter, matikan scanline animation, freeze 3D rotation di posisi awal
- Skip CRT toggle: button di header `[ CRT: ON / OFF ]` untuk yang motion-sensitive

---

## 13. Brand Voice (Visual)

Untuk konsistensi cross-section:

- **Title**: SELALU all-caps display font
- **HUD label**: SELALU mono uppercase tracking 0.1em+
- **Body**: title-case sentence normal
- **Eyebrow**: SELALU mono uppercase + RED dot prefix `◉ STAGE-NN`
- **Action verb**: command-style `> PRESS A TO START`, `> PUSH UP TO JUMP`

---

## 14. Component Inventory

Total komponen baru / refactored yang harus ada:

| Component | Status | Notes |
|-----------|--------|-------|
| `<HUDFrame>` | NEW | Top + bottom HUD wrapper, stage label + power LED |
| `<TitleCard>` | NEW | Hero title screen frame |
| `<PressStart>` | NEW | Blinking "PRESS START" CTA |
| `<PixelBracket>` | NEW | 4-corner bracket frame |
| `<NESTextBox>` | NEW | Classic bordered text box |
| `<StatBar>` | NEW | ASCII block stat bar |
| `<ChunkyButton>` | NEW | Shadow-offset action button |
| `<FilterChip>` | NEW | Toggle chip |
| `<LoadingBar>` | NEW | Section divider progress bar |
| `<StageSelectTile>` | NEW | Experience grid tile |
| `<CartridgeCard>` | NEW | Project card with 3D cartridge |
| `<SaveCrystal>` | NEW | Contact 3D save point |
| `<CRTOverlay>` | NEW | Scanlines + curvature |
| `<ScoreCounter>` | NEW | HUD digit display |
| `<PowerLED>` | NEW | Pulsing LED dot |

Semua komponen lama yang berhubungan dengan DAW / mixer / vinyl / launchpad → DELETE / archive.

---

## 15. Open Questions

Hal-hal yang gw butuh konfirmasi lu sebelum lanjut tasks:

1. **3D mascot character**: lu mau ada karakter low-poly representing lu (kayak avatar 3D)? atau cuma object (cartridge / console / save crystal)?
2. **CRT scanline default**: default ON atau OFF? (gw rekomen ON default, bisa toggle off)
3. **Sound effects**: setuju ada blip / chime sound? mute by default biar ga annoying?
4. **Light mode**: skip total atau MVP-later?
5. **Custom cursor**: implement atau pakai default OS cursor?
6. **Mascot color body**: kalau ada character, dia pakai outfit warna apa (default putih shirt + abu pants OK?)

Jawaban lu akan diturunin ke `requirements.md` (rewrite phase 2).

---

> Next docs to write: `tokens.md` (concrete CSS values) + `3d-and-animation.md` (WebGL + motion patterns).
