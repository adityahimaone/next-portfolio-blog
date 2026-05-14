# Quick Start Guide — Day 1 Execution

> 30-minute pre-flight buat memulai redesign 2026.
> Run ini sebelum nyentuh kode apa pun.

---

## Day 1 Checklist (30 minutes total)

### Step 1: Branching (3 min)

```bash
cd ~/Development/next-portfolio-blog

# Make sure on main and clean
git status
git checkout main
git pull origin main

# Create backup branch
git checkout -b backup/pre-redesign-2026
git push -u origin backup/pre-redesign-2026

# Return to main
git checkout main

# Create foundation branch (Sprint 1 base)
git checkout -b design-2026/foundation
git push -u origin design-2026/foundation
```

### Step 2: Capture Baseline (10 min)

```bash
# Bundle baseline
ANALYZE=true pnpm build
# This generates analyze/*.html — save copies:
mkdir -p docs/design-2026/baseline
cp analyze/*.html docs/design-2026/baseline/

# Lighthouse baseline (need site running)
pnpm dev &
sleep 8

# Run lighthouse — desktop
npx lighthouse http://localhost:3000 \
  --preset=desktop \
  --output=html,json \
  --output-path=docs/design-2026/baseline/lighthouse-desktop \
  --chrome-flags="--headless"

# Run lighthouse — mobile (default preset)
npx lighthouse http://localhost:3000 \
  --output=html,json \
  --output-path=docs/design-2026/baseline/lighthouse-mobile \
  --chrome-flags="--headless"

# Stop dev server
kill %1 2>/dev/null || true
```

### Step 3: Visual Baseline (5 min)

Open production URL or local in browser. Take screenshot per section:

```bash
mkdir -p docs/design-2026/baseline/screenshots
# Open https://adityahimaone.tech (or wherever production is)
# Use browser screenshot tool or:
# - Cmd+Shift+5 on Mac (region capture)
# Save as:
#   01-hero.png
#   02-marquee.png
#   03-about.png
#   04-skills.png
#   05-experience.png
#   06-projects.png
#   07-contact.png
#   08-footer.png
# Save all to docs/design-2026/baseline/screenshots/
```

### Step 4: Verify Build & Tests (5 min)

```bash
# Type check clean
pnpm dlx tsc --noEmit

# Tests pass
pnpm test

# Lint clean
pnpm lint

# Build succeeds
pnpm build
```

If anything fails, **stop here** — fix before redesign.

### Step 5: Read & Confirm (7 min)

```bash
# Open docs in editor
code docs/design-2026/

# Read in this order:
# 1. README.md — overview
# 2. requirements.md — what we're committing to
# 3. plan.md — how we'll execute
# 4. tasks.md — first 5 tasks of Sprint 1
```

Confirm:
- [ ] Goals make sense
- [ ] Constraints are agreeable
- [ ] No conflicting commitments this 4-week window
- [ ] Acceptance criteria realistic

If not — pause and revise spec before starting.

---

## First Task to Execute

After Day 1 done, start with **T-100** (LCP fix) — biggest impact.

**File**: `features/landing-page/components/hero-section.tsx`
**Spec**: `tasks.md` T-100 + `performance.md` Section 3.1

```bash
git checkout -b feat/perf-lcp-fix design-2026/foundation
# ... do work ...
git add -A
git commit -m "perf(hero): replace motion-wrapped LCP with CSS animation (T-100, R-H1)"
git push -u origin feat/perf-lcp-fix
# Open PR to design-2026/foundation
```

---

## Daily Workflow

### Morning standup (with self)
1. Open `tasks.md`
2. Look at top of current sprint section
3. Pick first ☐ task that doesn't have ⏳ predecessor blocking
4. Update status: ☐ → ⏳

### During work
- Commit small + frequent
- Reference task ID in commit: `feat(skills): add preset buttons (T-210)`
- Update `bugfix.md` if discover issue

### End of work
- Update task status: ⏳ → ✅ (or ❌ if blocked)
- Note any new bugs in `bugfix.md`
- Push branch
- Stop

### End of sprint
- Run sprint report template (`reports/TEMPLATE.md` → `reports/sprint-N.md`)
- Merge sprint branch to next
- Tag: `git tag v2026-sprint-N`

---

## Help / Escape Hatches

### Stuck on a task
1. Re-read the task in `tasks.md` — full context
2. Check requirements (R-id) in `requirements.md`
3. Check design intent in `design.md` or `story-map.md`
4. If still stuck, ask Hermes: "stuck on T-XXX, here's what I tried..."

### Visual reference
- See `design.md` Section 7 (per-section direction)
- See `story-map.md` for copy guidance
- Reference projects: vercel.com, ableton.com, splice.com

### Performance regression
1. Re-run Lighthouse local
2. Compare to `docs/design-2026/baseline/lighthouse-*.json`
3. If regress > 5 points → revert last commit, investigate
4. If <5 points but still bad → continue, optimize at end of sprint

### Want to change spec
Specs are living docs. If learn something during dev:
1. Update relevant doc (requirements/design/plan)
2. Note in `plan.md` Section 11 Decision Log
3. Commit doc change separately from code

---

## Emergency Contacts

If everything breaks:
- Rollback: `migration.md` Section 6
- Restore from backup: `git reset --hard backup/pre-redesign-2026`
- Production hot-fix: revert PR via GitHub UI, deploy

---

## Estimated Total Time

- Sprint 0 (this doc): 0.5 day
- Sprint 1: 1 week (5 days × 2-4h evenings = 15-20h)
- Sprint 2: 1 week
- Sprint 3: 1 week
- Sprint 4: 1 week (less dev, more testing)

**Total**: ~80-100 hours over 4 calendar weeks

If working evenings/weekends only, allow 5-6 weeks elapsed.

---

## When You Finish

After T-431 (production deploy) green:

1. Tag: `git tag v2026.0.0`
2. Write final blog post: "Why I redesigned (again) for 2026"
3. Update LinkedIn / X with new portfolio link
4. Save spec set to portfolio archive
5. Pat yourself on the back. You did it. 🎚

Then start backlog (`plan.md` Section 12).
