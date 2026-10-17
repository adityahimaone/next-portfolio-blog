# Contact: the session desk

The 16-pad performance controller is unchanged (its GSAP coupling, its audio
indices and its sweep order are untouched). Everything around it is rebuilt as
the rest of one desk, in the About devices' materials (cream glass shell, dark
rim, near-black LCD, dark pads that light orange).

## What changed

| Before | After |
| --- | --- |
| Heading "Bring me the difficult part." | **"Got a hard one? / Let's roll tape."** in slit type, rising letter by letter as the section arrives |
| FAQ accordion (4 questions) | **Slit-type FAQ band** (below): eight tracks, search, topic chips, deep links |
| nothing | **Signal path**: how a project flows (brief, scope, build, hand off) as patched stages with animated cables |
| nothing | **Brief builder**: pick the kind of work and timing, add a line, and it composes the email (`mailto:` link, plus copy) |

## Decisions

- **Accessible by construction.** The console is a real tabs pattern (tablist,
  tabpanel, arrow keys, Home/End, roving tabindex). The full answer is real text
  in the panel; the typed copy is `aria-hidden`, so a screen reader never hears
  half a sentence. The path is an ordered list. Reduced motion prints the answer
  whole and stills the meters and cables.
- **Works without JavaScript.** Server markup is fully visible (`data-reveal="idle"`);
  elements only hide once a script has armed them. The brief builder's link is a
  working `mailto:` on first paint.
- **Nothing is sent anywhere.** No form endpoint, no stored text.
- **The mailto is capped by its encoded length** (1900), not the typed length:
  a note of 480 non-ASCII characters encodes to ~4000 and Outlook-class clients
  refuse past ~2000. The tests caught this.
- **Copy** is deliberately modest and checkable: no rate, no dated availability,
  no client list; the honest "no" on native mobile is kept. Edit
  `contact-desk/contact-content.ts` to change any of it.
- The desk sits between `.contactDeck` and the footer, because the rack's scroll
  animation addresses children of `.contactDeck` by class.

The old `.contactBrief*` rules in `rack-01.module.css` are no longer used and can
be deleted.

## The title and the FAQ: slit type

Both headlines use one treatment (`slit-title.tsx`): capitals in the display
face, each line clipping its own overflow, each letter sitting a share of its
height below the baseline until the section arrives, then rising through the
slit a few milliseconds behind the letter before it. Hovering lifts the letters
clear. Each is a single real `h2` with the whole text as its name and the
letters `aria-hidden`.

The FAQ closes the section as a full-bleed dark band in the hero's ground:

- **Opening a row is a playhead sweep.** The row floods with signal orange from
  the left, led by a bright playhead line; the question inverts exactly where
  the line has passed (a dark copy of the row is clipped in step with the
  flood); the answer is printed in the dark, so the flood is what reveals it,
  and its words settle in behind the line. Closing wipes the orange out to the
  right with the line trailing the edge. The three layers share one duration and
  one curve, so the line is always exactly on the edge.
- A DAW ruler under the headline, with the playhead's single sweep on arrival.
- A per-track level meter that plays while its row is open; a scrub line that
  follows the pointer over a closed row.
- The band arrives mid-performance: once the headline lands, the first track
  opens by itself, unless the visitor has already acted or came in on a `#hash`.
- Real FAQ behaviour: `aria-expanded`/`aria-controls`, arrow keys, Home/End, a
  `#hash` deep link and copy-link per question, search with highlights and an
  excerpt under each closed match, topic chips with live counts, an empty state.
  With no JavaScript every answer is shown open.
- Reduced motion is a complete alternative: headline set whole, first row
  simply open, no wipe, no sweep, a still moving line.

The old recall console (`contact-console.tsx`, tabs + typewriter monitor) is
removed.
