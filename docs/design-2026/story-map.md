# Story Map — Section Narrative RETRO CONSOLE 2026

> Per-section copy direction, voice, story beats.
> Companion: `design.md` (visual layout), `requirements.md` (acceptance).

---

## 1. The Game Concept

Treat the landing page as a **single-player retro console game** the user is booting up. From boot screen to stage clear, ada continuous game-flow narrative. User = player, Adit = the game protagonist + game designer.

- **Game title** (internal): "PORTFOLIO 2026"
- **Genre**: Career RPG / Visual Novel hybrid
- **Console**: imaginary "FIRSTPARTY" hardware (Adit's own brand label)
- **Runtime**: ~2-3 minute scroll playthrough

---

## 2. The Player Journey

```
[BOOT]      Boot Screen   — "Powering on console"        (1.6s, skip after first visit)
            ↓
[TITLE]     Hero          — "PRESS START to begin"       (2-3s engaged)
            ↓
[STAGE 02]  About         — "CHARACTER SELECT"            (15-20s engaged)
            ↓
[STAGE 03]  Skills        — "Inventory check"             (15-25s engaged, interactive)
            ↓
[STAGE 04]  Experience    — "Stage select map"            (25-30s engaged)
            ↓
[STAGE 05]  Projects      — "Game library cartridges"     (40-60s engaged)
            ↓
[STAGE 06]  Contact       — "Save your progress"          (interactive)
            ↓
[CLEAR]     Footer        — "Stage clear, end credits"    (5s scan)
```

Goal: 2-3 menit playthrough untuk engaged user. Bonus loop: replay boot sequence via Header button.

---

## 3. Voice & Tone

### 3.1 Persona Voice

Adit's voice in copy = **Quietly confident game master / arcade announcer / NES manual writer**.

Karakter:
- Direct, command-style: `> PRESS A TO COPY EMAIL`, `> READY TO COLLAB?`
- Specific, factual: `BISADAYA · FAST 8 · USED BY THOUSANDS`
- Cheeky tapi profesional: `RANK : S` (otomatis kasih S, tongue-in-cheek)
- Mixed Indo-English diizinkan di personal copy (footer, easter egg lines), TIDAK di marketing copy utama

### 3.2 Voice Don't

- ❌ "I'm passionate about..." (basic)
- ❌ "Cutting-edge solutions" (corporate)
- ❌ "Innovative" (cliche)
- ❌ "Spearheaded" (LinkedIn-speak)
- ❌ "Welcome to my portfolio" (boring)
- ❌ "Hi I'm Adit, a Frontend Developer based in..." (generic)
- ❌ Music metaphor (DAW dead, don't revive)

### 3.3 Voice Do

- ✅ `> PRESS START`
- ✅ `STAGE-04 // CAREER`
- ✅ `INSERT COIN ↻`
- ✅ `★ CURRENT JOB`
- ✅ `Building Bisadaya at Fast 8 — used by thousands`
- ✅ `Six cartridges in the library. Pick one.`
- ✅ `> READY PLAYER ONE`
- ✅ `Currently spinning: bisadaya v2`

---

## 4. Per-Section Copy Direction

### 4.1 Boot Screen (1.6s opening)

**Story role**: Console power-on. Establish brand world.

**Sequence**:
```
0.0s  ─ [black screen]
0.1s  ─ ◉ POWER LED ON           (red dot top-right)
0.3s  ─ FIRSTPARTY                (display font, white, fade in)
0.6s  ─ [scanline sweep]
0.8s  ─ PRESS ANY KEY  PRESS ANY KEY     (blink x2)
1.6s  ─ [transition to TITLE]
```

**Copy elements**:
- "FIRSTPARTY" (Adit's imaginary console brand — keep mystery, don't explain)
- "PRESS ANY KEY" (no localization)

### 4.2 Hero — "TITLE SCREEN" (STAGE-01)

**Story role**: Game title screen. Identity in 2 seconds, decide to scroll.

**Eyebrow** (top HUD):
- `◉ POWER · STAGE-01 // TITLE · v2026.05`

**Headline** (center, VT323 ~144px):
- `ADIT HIMAONE`

**Sub-headline** (Space Grotesk 14px uppercase):
- `FRONTEND ENGINEER · v26`

**3D mascot**: floating cartridge slowly rotating

**CTA primary**:
- `▶ PRESS  START`  (blink, click scrolls to STAGE-02)

**CTA secondary** (smaller, mono):
- `> SAVE PROGRESS  →  STAGE-06`  (scrolls to Contact directly)

**Bottom HUD**:
- `© FIRSTPARTY · MADE IN JAKARTA      P1: ADIT [READY]`

**Hover easter egg** (optional): hover the cartridge → tooltip "v2026.05.14 build"

### 4.3 About — "CHARACTER SELECT" (STAGE-02)

**Story role**: Verse 1 — establish protagonist identity.

**Stage label**: `STAGE-02 // CHARACTER`

**Headline** (display 64px):
- `CHARACTER  SELECT`

**Sub** (mono):
- `> AVAILABLE FIGHTER : 1`

**Bio NES textbox**:
```
▼

I'm ADIT. Frontend Engineer at FAST 8.
> Currently building BISADAYA, used by
  thousands of jobseekers.

Specialty: interaction design, motion,
performance. Lately exploring 3D web,
shaders, and quiet UI.
```

**Stats panel**:
```
NAME    : ADITYA HIMAWAN
CLASS   : FRONTEND ENGINEER
BASE    : JAKARTA SOUTH
EXP     : 4 YEARS
LOADOUT : REACT · NEXT.JS · MOTION

STATS
─────
REACT       ████████░░  85
NEXT.JS     █████████░  92
TYPESCRIPT  ████████░░  80
MOTION      ██████░░░░  62
SHIPPING    █████████░  90
```

**Footer line**:
- `> CURRENTLY EQUIPPED : BISADAYA (v2)`

### 4.4 Skills — "INVENTORY" (STAGE-03)

**Story role**: Verse 2 — what abilities does this character have?

**Stage label**: `STAGE-03 // INVENTORY`

**Headline**:
- `INVENTORY`

**Sub**:
- `> ITEMS COLLECTED : 24`

**Grid**: 6×N square cells, 1 icon per skill

**Detail panel** (selected cell):
```
> SELECTED : REACT
─────────────────
YEARS      : 4
PROJECTS   : 12
MASTERY    : ★ ★ ★ ★ ☆
USED IN    : BISADAYA, [redacted side projects]
```

**Empty selection state**:
- `> HOVER TO INSPECT`

### 4.5 Experience — "STAGE SELECT" (STAGE-04)

**Story role**: Bridge — career context (proof of work).

**Stage label**: `STAGE-04 // CAREER`

**Headline**:
- `STAGE  SELECT`

**Sub**:
- `> 4 STAGES UNLOCKED · 1 IN PROGRESS`

**Per-tile copy**:
```
STAGE 1                    STAGE 2
┌──────────┐              ┌──────────┐
│ FAST 8   │              │ 80&CO    │
│ '22-NOW  │              │ '21-'22  │
│ ★ CURRENT│              │ COMPLETE │
└──────────┘              └──────────┘
```

**NES textbox detail panel** (per selected tile):
```
▼

> NOW PLAYING : STAGE 1
  FAST 8 · FRONTEND ENGINEER
  OCT 2022 — PRESENT (3y 7m)
  JAKARTA, ID

ACHIEVEMENTS
─ Building Bisadaya, jobseekers platform
─ Led FE rewrite 2024 (Next.js 13 → 15)
─ Owns design system tokens + a11y review

ITEMS USED : REACT · NEXT.JS · TANSTACK · MOTION
```

### 4.6 Projects — "GAME LIBRARY" (STAGE-05)

**Story role**: Chorus — the released games (showcase).

**Stage label**: `STAGE-05 // RELEASES`

**Headline**:
- `GAME  LIBRARY`

**Sub**:
- `> 06 CARTRIDGES IN COLLECTION`

**Filter chips**: `[ALL] [WEB3] [CORP] [PROD] [DEFI] [BIO] [EDU]`

**Per-card copy**:
- Title (display 24px)
- Genre tag (mono, RED)
- Year (mono, GRAY-DIM)
- Metric (1 line: `> 10K+ VISITS` or `> USED BY 3 ENTERPRISES` or `> FEATURED ON [X]`)

**Hover state copy**:
- `▲ EJECT TO INSPECT`

**Modal copy** (on click):
```
LOADING CARTRIDGE...
████████████████████  100%

[BOOT SCREEN REVEAL]

> NOW PLAYING : <PROJECT TITLE>
  GENRE : <GENRE>
  YEAR  : <YEAR>

[Description — 2 sentences max]

PRODUCTION CREDITS
─────────────────
ROLE  : Solo dev  (or "FE Lead of 4")
STACK : <TECH ARRAY>
LAUNCHED : <YEAR>

> [▶ PLAY DEMO]   [⌥ VIEW SOURCE]
```

### 4.7 Contact — "SAVE POINT" (STAGE-06)

**Story role**: Outro — invitation to engage. Rewards scroll-to-bottom.

**Stage label**: `STAGE-06 // SAVE`

**Headline**:
- `SAVE  POINT`

**Sub**:
- `> READY TO COLLAB ?`

**3D Save Crystal**: octahedron pulsing red

**DAT lines**:
```
> SAVE PROGRESS

CONTACT.DAT  : ADITYAHIMAONE@GMAIL.COM
SOCIAL.DAT   : @ADITYAHIMAONE
LINK.DAT     : LINKEDIN.COM/IN/ADITYAHIMAONE
CV.DAT       : ADIT_CV_2026.PDF
```

**Action prompt**:
```
> CHOOSE ACTION :

[A] COPY EMAIL
[B] OPEN LINKEDIN
[X] OPEN GITHUB
[Y] DOWNLOAD CV
```

**Confirm state copy** (on click):
- After Copy Email: `> EMAIL COPIED · 2026-05-14T22:31`
- After other actions: `> OPENING IN NEW TAB...`

**Footer prompt**:
- `> NO FORMS. NO "LET'S CONNECT". JUST A KEY PRESS.`

### 4.8 Footer — "STAGE CLEAR"

**Story role**: B-side — game ending stats screen.

**Stage label**: `STAGE-CLEAR`

**Headline** (VT323 64px, blink, RED):
- `★  STAGE  CLEAR  ★`

**Stats**:
```
PLAYER     : ADIT
TIME       : 00:02:43
SCROLL     : 100%
SECTIONS   : 6/6
RANK       : S
```

**Last commit badge**:
- `> LAST SHIPPED : 2 DAYS AGO · feat: redesign 2026`

**Action chips**:
- `[HOME]  [BLOG]  [GITHUB]  [LINKEDIN]`

**Copyright line**:
- `© 2026 · ADIT · MADE IN JAKARTA · INSERT COIN ↻`

**Easter egg** (hover "INSERT COIN"):
- Plays `coin.wav`
- Triggers boot screen replay

---

## 5. Cross-Section Vocabulary

Konsistensi istilah lintas section biar dunia-nya nyambung:

| Concept | Term to use | Term to avoid |
|---------|-------------|---------------|
| Section / page | "Stage" / "Screen" | "Section" / "Page" |
| Project | "Cartridge" / "Release" / "Game" | "Project" |
| Job / role | "Stage in career" / "Run" | "Position" / "Role" |
| Skill | "Item" / "Loadout entry" | "Skill" |
| Tech | "Items used" / "Loadout" | "Stack" / "Technologies" |
| Contact | "Save point" / "Save progress" | "Form" / "Inquiry" |
| Now | "Currently equipped" / "Now playing" | "At the moment" |
| Past | "Completed stages" / "Cleared" | "History" |
| Future | "On rotation" / "Next stage" | "Upcoming" |
| About | "Character profile" / "Liner notes" | "About me" |
| Years experience | "EXP : 4 years" | "Experience: 4 years" |
| Click | "Press" | "Click" / "Tap" (mobile boleh "tap") |

---

## 6. Tone Calibration by Section

| Section | Tone | Energy |
|---------|------|--------|
| Boot | Mysterious, hardware | Low (suspense build) |
| Hero | Confident, anticipatory | High |
| About | Direct, factual | Medium |
| Skills | Playful, technical | Medium-high |
| Experience | Professional, historical | Medium |
| Projects | Proud, factual | Medium-high |
| Contact | Inviting, command-style | High (interactive) |
| Footer | Quiet, complete | Low (closure) |

---

## 7. Microcopy Audit

### 7.1 Status Indicators

✅ `◉ POWER`
✅ `[READY]`
✅ `[STANDBY]`
✅ `★ CURRENT`
✅ `STAGE-NN`
✅ `LOADING...`
✅ `INSERT COIN`
✅ `LIVE SESSION`
✅ `OPERATIONAL`

### 7.2 CTAs

✅ `▶ PRESS START`
✅ `> READY TO COLLAB?`
✅ `[A] COPY EMAIL`
✅ `▲ EJECT TO INSPECT`
✅ `▶ PLAY DEMO`
✅ `⌥ VIEW SOURCE`
✅ `↓ DROP THE NEEDLE` ← ❌ DELETED, music metaphor

❌ `Click here`
❌ `Submit`
❌ `Learn more`
❌ `Get in touch`
❌ `Contact me`

### 7.3 Empty / Loading States

When 3D loading:
✅ `LOADING ASSETS...`
✅ `RENDERING GEOMETRY...`

When API fails (last commit, Spotify):
✅ `> SIGNAL LOST · TRY AGAIN`
✅ `> CONNECTION TIMEOUT`
✅ `> CARTRIDGE NOT FOUND`

When no data (e.g. nothing playing):
✅ `> STANDBY`
✅ `> OFF AIR`

### 7.4 Error States

- 404 page: title screen with `> CARTRIDGE NOT FOUND · STAGE NOT LOADED`
- 500 error: `> SYSTEM ERROR · RESET CONSOLE ?`
- Form validation: `> INVALID INPUT · TRY AGAIN`

---

## 8. Copy Checklist Per Section

When updating any section, run through:

- [ ] Stage label `STAGE-NN // <NAME>` present
- [ ] Eyebrow uses mono font + RED prefix dot
- [ ] Headline uses display font (VT323 ≥ 32px)
- [ ] Subtitle ≤ 1 sentence dengan command-style `> ...`
- [ ] No music metaphor (mixer, vinyl, DAW, track, B-side)
- [ ] Game/console metaphor present but natural
- [ ] CTA action-verb led (Press, Open, Save, Eject)
- [ ] Empty/error states in retro voice

---

## 9. Localization Note

Spec written in English. Indonesian voice may surface in:
- Footer copyright easter egg (e.g. `MADE IN JAKARTA`)
- Personal blog post titles (existing)
- Casual blurbs in About bio

Do **NOT** translate hero copy, project descriptions, experience entries. Marketing copy stays English (international audience: recruiters, devs, freelance clients).

Bahasa Indonesia full version is **out of scope** for redesign 2026.

---

## 10. Easter Eggs (optional polish)

Untuk diehard scrollers:

1. Konami code (↑↑↓↓←→←→BA): unlock secret achievement on Footer with toast `> KONAMI CODE ACCEPTED · +1 LIFE`
2. Hover "INSERT COIN" 5x: plays `coin.wav`, blinks footer rank to "SS"
3. Type "boot" anywhere: replay boot sequence
4. Hover Adit's name in hero 3 seconds: cartridge does barrel roll
5. Refresh button (Header replay): increments visit counter shown in hero subtitle: `· v26 · visit #N`

Implementation prioritas: P3 (post-launch nice-to-have).

---

> Visual + Story alignment locked. Implementation copy lifted directly from this doc into components.
