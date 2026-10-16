# Two transitions: the spectrum curtain and the fold

## Experience → Work: the spectrum curtain

**Replaces** the 180° turn of the radio. A turn is a move *of the object*; this
is a move *of the room*, so it cannot read as the old rotation.

The radio is an audio object and Work is a music player, so the seam is made of
the one thing both draw: a level meter.

1. **Lights down.** The heading leaves, the dark wash comes up, and the radio is
   pushed back (scale 1 → 0.9, lifted, faded) like a speaker cone taking a hit.
2. **The wall rises.** 24 full-height equaliser columns climb from the bottom,
   dancing (`sin(i·1.7 + g·11)`, a function of scroll, so it dances backwards
   too), each with an orange cap and glow. The dance gives way to a solid climb
   so every column lands on exactly 1.
3. **Closed.** A plateau (p 0.50–0.56) where the screen is one dark meter and a
   label reads *Signal locked / Selected work*. The Experience section is
   hidden and the player shown **inside this plateau**, so the swap is never
   seen. A test pins that every column covers the screen across it.
4. **The drop.** Columns fall from the centre outward onto a finished player,
   which settles from 1.05 → 1 while its chrome, banner, columns and transport
   bar come in staggered.

Files: `rack-01/seam-frame.ts` (pure, tested), `seam-spectrum.tsx` + `.module.css`
(fixed overlay, inert, desktop with motion only), seam block in
`use-rack-animations.ts`. The seam is still `SEAM_SVH` (120svh) long. Phones and
reduced motion get the plain section boundary, as before.

Removed: the fake player back face (`deckBack*`), the 3D flip CSS, `FLIP_DEGREES`.

Tuning: `SEAM_COLUMNS`, `SEAM_PHASES` in `seam-frame.ts`.

## Hero → About: no dead scroll, and the stack folds

Finding: the hero camera's last 28% was dead. The dive lands at 0.72, the clip
becomes the page by 0.82, and from there to 1 nothing moved (~550px at 1440×900)
before the handoff's exits began. That was the unsmooth beat.

1. **Retime.** `ARRANGEMENT_SCROLL_SVH` 340 → 292 with every phase rescaled, so
   settle, walk and dive cover **exactly the scroll they did** (pinned by test);
   only the stretch of nothing is gone. A ~13svh beat remains so the clip
   becoming the page is seen to land.
2. **Fold.** New `fold` (0→1, window 0.70–0.90) in `arrangementFrame`. The
   supporting lanes slide to the profile lane's centre and flatten, passing
   *behind* it: the window minimising into its title bar, the dive's focus being
   the title bar. Each lane's distance (`--lane-dy`) is measured once per
   refresh; `--arr-fold` is written per tick. At fold 0 the CSS resolves to the
   old transform.

The handoff's exits (rail, mixer, toolbar, ruler, ground) are unchanged and now
start right as the fold ends.
