# Contact: the session desk

The 16-pad performance controller is unchanged (its GSAP coupling, its audio
indices and its sweep order are untouched). Everything around it is rebuilt as
the rest of one desk, in the About devices' materials (cream glass shell, dark
rim, near-black LCD, dark pads that light orange).

## What changed

| Before | After |
| --- | --- |
| Header + paragraph | Same heading, plus a **status strip**: channel open, reply time, live Jakarta clock |
| FAQ accordion (4 questions) | **Recall console**: five mixer channel strips driving an LCD monitor that types the answer out |
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
