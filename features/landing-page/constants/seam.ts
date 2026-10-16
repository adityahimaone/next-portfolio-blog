/**
 * Experience → Work seam length, in viewport heights.
 *
 * Both stages are pinned for exactly this long: the Experience stage is
 * sticky for it and the Work section is pulled up by it (see `.work` and
 * `.experience` in the stylesheets), so the spectrum curtain in `seam-frame.ts`
 * has a window in which both sections are on screen and neither is scrolling.
 */
export const SEAM_SVH = 120
