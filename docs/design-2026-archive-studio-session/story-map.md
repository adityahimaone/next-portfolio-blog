# Story Map — Section Narrative 2026

> Per-section story direction, voice, copy guidance.

---

## 1. The Album Concept

Treat the landing page as a **single album with 7 tracks** (sections). The user is the listener pressing play. Each track has its own mood but shares the same producer (Adit) and shares one continuous narrative thread.

**Album title** (internal): "Side A — Studio Session 2026"
**Genre**: Studio Pop / Engineering R&B / Frontend Soul
**Runtime**: ~3 minutes scroll-through (target)

---

## 2. The Listener Journey

```
[ENTRY]    Hero       — "Who's playing?"            (2-3s)
           ↓
           Marquee    — "What's the channel?"        (transit)
           ↓
[VERSE 1]  About      — "Tell me about yourself"     (15s engaged)
           ↓
[VERSE 2]  Skills     — "What can you do?"           (20s engaged, interactive)
           ↓
[BRIDGE]   Experience — "Where have you been?"        (30s engaged)
           ↓
[CHORUS]   Projects   — "Show me the work"            (40s engaged)
           ↓
[OUTRO]    Contact    — "How do I reach you?"         (interactive, optional jam)
           ↓
[B-SIDE]   Footer     — "Where else can I find you?"  (5s scan)
```

Goal: ~2 minutes total scroll time for engaged user, with potential for extended Contact-section play (interactive launchpad).

---

## 3. Voice & Tone

### 3.1 Persona Voice

Adit's voice in copy = **Confident producer at a major label dropping their first album under their own name.**

Characteristics:
- Direct, not aggrandizing ("Built X for Y" not "Spearheaded enterprise-grade solutions")
- Specific, not generic ("Bisadaya for thousands of jobseekers" not "innovative platform")
- Playful, but professional (use music metaphor naturally, never forced)
- Mixed Indonesian-English allowed in personal copy (footer, casual blurbs) but NOT in main marketing copy (hero subtitle, project descriptions)

### 3.2 Voice Don't

❌ "I'm passionate about..." (everyone says this)
❌ "Cutting-edge solutions" (corporate-speak)
❌ "Bridging the gap between X and Y" (cliche)
❌ "Innovative" (overused, meaningless)
❌ "Spearheaded" (LinkedIn-speak)

### 3.3 Voice Do

✅ "Building Bisadaya at Fast 8 — used by thousands"
✅ "Six records out. Pick one."
✅ "Tap a pad. Make a beat. Send a message."
✅ "Currently spinning: Edge of Desire (Sunrise Mix)"
✅ "Frontend Engineer / Audio enthusiast / Side project addict"

---

## 4. Per-Section Copy Direction

### 4.1 Hero — "The Album Cover"

**Story role**: Establish identity in 2 seconds. User decides to scroll or bounce.

**Eyebrow**: `◉ LIVE SESSION · v2026.05`

**Headline**: `Aditya Himaone` (his real handle)

**Subtitle**: `Frontend Engineer at Fast 8 — building Bisadaya for thousands of jobseekers.`
- *Why*: specific company + specific impact = credibility in 1 sentence
- *Alt versions to A/B*:
  - "Frontend Engineer · Building tools that thousands rely on daily."
  - "Frontend Engineer at Fast 8. I make web apps people actually use."

**LCD Ticker**: `NOW PLAYING: <real-spotify-track>` (live)

**CTA primary**: `▶ PLAY` (existing, keep)
**CTA secondary**: `Or jam with me →` (new, scroll to #contact)
**Scroll cue**: `↓ drop the needle`

### 4.2 Marquee — "FM 96.0"

**Story role**: Transit; gives screen breath between cover and content.

**Content** (rotating phrases — keep ~10):
Update from generic phrases ("WHERE CODE MEETS RHYTHM") to **personal/topical**:
- `🎧 Currently looping: clean architecture`
- `📻 Recently shipped: redesign 2026`
- `🎚 Now mixing: bisadaya v2`
- `📡 On rotation: deep work, indie tracks, terminal vibes`
- `🎙 Recording from: Jakarta Selatan`
- `💿 New release every quarter`
- `⚡ Pushing pixels since 2017`
- `🎛 Specialty: react, next, motion`
- `📀 B-side available: blog, github, linkedin`

### 4.3 About — "The Workflow"

**Story role**: Verse 1 — establish who Adit is in human terms.

**Eyebrow**: `◉ ARRANGEMENT VIEW`
**Headline**: `The Workflow`
**Subtitle**: (none, DAW interface speaks for itself)

**Track 1 — IDENTITY** (clip: `profile.tsx`)
- Spec sheet: Role / Location / Experience / Focus / Architecture / Status
- About paragraph: 2 short sentences max, voice-direct
  - Para 1: `I'm Adit. Frontend Engineer at Fast 8 — currently building Bisadaya, a job-seeking platform used by thousands.`
  - Para 2: `Specialized in interaction design, animation, and performance. Lately exploring the intersection of audio, code, and quiet UI.`
- Signal Flow timeline: 3 entries — keep concise

**Track 2 — NOW PLAYING** (clip: `now_playing.json`)
*New, replaces audio clip*
- Currently working on: Bisadaya Job Filtering Improvements (link to artifact)
- Currently learning: WebGPU shaders, MDX best practices
- Currently spinning (Spotify): live data
- "If you find me online tonight": probably here, GitHub, or my terminal

**Track 3 — METRICS** (clip: `metrics.json`)
- Big numbers: 4+ years / 20+ projects / 100% commitment
- Output history bars: yearly project count
- Currently processing list (4 items max)
- Design philosophy quote (1 quote, not multiple)

### 4.4 Skills — "Sonic Arsenal"

**Story role**: Verse 2 — answer "what can you do?" with hands-on interaction.

**Eyebrow**: `◉ AUDIO ENGINEERING`
**Headline**: `Sonic Arsenal`
**Subtitle**: (under mixer) `Each fader = years of practice. Drag to remix the role.`

**Preset Buttons** (new):
- `[FRONTEND]` — autoset for frontend role
- `[BACKEND]` — autoset for backend-leaning role  
- `[DESIGN]` — autoset for design-engineering role

**Mixer label**: `MIX-MASTER 2026 · PROFESSIONAL AUDIO/CODE INTERFACE`
**Footer label**: `DESIGNED & ENGINEERED BY ONE` (keep, lowercase last word feels intentional)

**Skill names — keep as-is** (already music-themed via Channel/EQ/FX framing):
- Channel 1: Languages (faders)
- EQ: Frameworks (knobs)
- FX: Tools (knobs)

### 4.5 Experience — "Career Discography"

**Story role**: Bridge — context for credibility.

**Eyebrow**: `◉ CAREER DISCOGRAPHY`
**Headline**: `The Collection`
**Subtitle**: (minimal) `Five tracks. One career. Hit play on each.`

**Per experience copy** (existing structure, keep):
- Role + company + period + location
- 3 bullet description points (concise, action-verb led)

**New badges**:
- `★ CURRENT` for active job (Fast 8)
- Duration: `3y 7m` displayed prominently

**Footer "Now Playing"**: dynamic — shows currently selected track
- `1/4 · NOW PLAYING: Frontend Developer · Fast 8 People Hub`

### 4.6 Projects — "Featured Releases"

**Story role**: Chorus — the hits, the reason recruiters are reading this.

**Eyebrow**: `◉ TRACKS`
**Headline**: `Featured Releases · 06 RELEASES`
**Subtitle**: `Six records out. Pick one — I'll tell you what went into the mix.`

**Filter chips**: `All · Web3 · Corporate · Productivity · DeFi · Biotech · Educational`

**Per project meta** (extended):
- Title
- Genre (existing)
- Year (existing)
- **NEW**: Metric (e.g. "10K+ visits", "Used by 3 enterprises", "Featured on Vercel")

**Modal copy enhancement**:
- Featured Track eyebrow → keep
- Title → keep
- Description → keep, but tighten if > 2 sentences
- **NEW**: "Production Credits" (= tech stack, but dynamic per project)
- **NEW**: "Studio Notes" (= role, e.g. "Solo dev", "FE Lead of 4")
- **NEW**: "Source" button if `github` field exists

**CTA**: `▶ Listen to Track (Visit Site)` (existing, keep)
**CTA alt** (new): `View Source ↗`

### 4.7 Contact — "Launch Collaboration"

**Story role**: Outro — invitation to engage. The interactive element rewards the user who scrolled this far.

**Eyebrow**: `◉ SESSION BOOKING`
**Headline**: `Launch Collaboration`
**Subtitle**: `Tap a pad. Make a beat. Send a message — or just jam.`

**Preset Chips**: `[CHILL] [TRAP] [LOFI]` (surface presets data)

**Functional pad labels** (already exist, keep):
- Email · adityahimaone@gmail.com
- LinkedIn · /in/adityahimaone
- GitHub · @adityahimaone
- Spotify · listen along
- Resume · download CV

**Transport**: keep (BPM, play/pause/stop, transport time, master volume)

**Footer message** (under launchpad):
> `No formal forms. No "let's connect" emails. Just tap a pad and pick how to talk.`

### 4.8 Footer — "End of Side A"

**Story role**: B-side — additional metadata, reassurance the artist is alive.

**Brand block**: 
- Adit name
- Tagline: `Frontend Engineer · Audio enthusiast · Currently in Jakarta`

**Nav columns** (keep): Home / Blog / Music / Contact

**Tech stack** (keep, but tighten labels if duplicating Skills section)

**Social** (keep)

**NEW — Last Commit badge**:
> `LAST SHIPPED · 2 days ago · feat: redesign 2026 · adityahimaone/next-portfolio-blog`

**NEW — Mini Now Playing strip** (very bottom):
> `🎧 Currently spinning: <track-name> · <artist>`

**Copyright**:
> `© <year> · Made with ☕ and ♫ in Jakarta · Side A complete · B-side available at /blog`

---

## 5. Cross-Section Vocabulary

Konsisten istilah lintas section biar dunia-nya nyatu:

| Concept | Term to use | Term to avoid |
|---------|-------------|---------------|
| Section/Page | "Track" / "Side" | "Section" / "Page" |
| Project | "Release" / "Record" | "Project" (boleh fallback) |
| Job/role | "Track in discography" | "Position" / "Role" (boleh fallback) |
| Skill | "Channel" / "Module" | "Skill" (boleh fallback) |
| Tech | "Production Credits" / "Stack" | "Technologies" |
| Contact | "Session" / "Jam" | "Form" / "Inquiry" |
| Now | "Live" / "Currently spinning" | "At the moment" |
| Past | "Discography" / "Releases" | "History" / "Past work" |
| Future | "On rotation" / "Up next" | "Upcoming" / "Future plans" |
| About | "Liner notes" / "Producer bio" | "About me" |

---

## 6. Tone Calibration by Section

| Section | Tone | Energy |
|---------|------|--------|
| Hero | Confident, mysterious | High |
| Marquee | Casual, observational | Low (transit) |
| About | Personable, specific | Medium |
| Skills | Playful, technical | Medium-high |
| Experience | Professional, structured | Medium |
| Projects | Proud, factual | Medium-high |
| Contact | Inviting, playful | High (interactive) |
| Footer | Quiet, complete | Low (closure) |

---

## 7. Microcopy Audit

Saat write/refactor, follow guidelines ini buat tiap microcopy:

### 7.1 Status Indicators

✅ `LIVE SESSION` (existing)
✅ `STANDBY` 
✅ `PLAYING` 
✅ `RECORDING`
✅ `SYSTEM OPERATIONAL`
✅ `AVAILABLE FOR PROJECTS`
✅ `★ CURRENT`

### 7.2 CTAs

✅ `▶ Play Session`
✅ `View Tracks ↗`
✅ `Or jam with me →`
✅ `Listen to Track`
✅ `Visit Site ↗`
✅ `View Source ↗`
✅ `Tap to Connect`

❌ `Click here`
❌ `Submit`
❌ `Learn more`
❌ `Get in touch`

### 7.3 Empty States

When no data (e.g. Spotify not playing):
✅ `Standby — currently silent`
✅ `Off air right now`
✅ `Mic muted, signal clear`

### 7.4 Error States

API fail, image fail:
✅ `Signal lost — try again`
✅ `Track unavailable, but the show goes on`

---

## 8. Copy Checklist Per Section

When updating any section, run through:

- [ ] Eyebrow follows pattern: `◉ <UPPERCASE LABEL>` (mono font)
- [ ] Headline uses display font, italic where appropriate
- [ ] Subtitle is ≤ 2 sentences and section-specific
- [ ] No generic phrases ("orchestrating code", "innovative", "passionate")
- [ ] Music metaphor present but natural
- [ ] CTA is action-verb led
- [ ] Empty/error states defined

---

## 9. Localization Note

Spec written in English. Indonesian voice may surface in:
- Footer copyright
- Personal blog post titles (existing)
- Casual blurbs

Do **NOT** translate hero copy, project descriptions, or experience entries. Keep main marketing English (recruiters/international audience).

Bahasa Indonesia full version is **out of scope** for 2026 redesign (see `requirements.md` Section 8).
