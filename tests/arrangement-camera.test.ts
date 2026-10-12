import {
  ARRANGEMENT_PHASES,
  ARRANGEMENT_SCROLL_SVH,
  ARRANGEMENT_SEAM_OPEN,
  arrangementFrame,
  arrangementPhase,
  OPEN_OVERSHOOT,
  OPEN_SCALE,
  type ArrangementGeometry,
} from '@/features/landing-page/components/arrangement/arrangement-camera'
import {
  ABOUT_TRACKS,
  ARRANGEMENT_CLIPS,
  ARRANGEMENT_MODE,
  CAREER_CLIPS,
  CAREER_LANES,
  MAKING_CLIPS,
  RULER_LABELS,
  YEAR_MAX,
  YEAR_MIN,
} from '@/features/landing-page/components/arrangement/arrangement-data'

/**
 * A written-out fixture at 1440×900, measured off the running page.
 *
 * The stage is 900 tall: 42 of chrome, 792 of track area, 66 of proof. The seam
 * overlays the whole stage, so its window is measured from the stage's edges —
 * hence `chromeHeight` and `proofHeight` alongside the track area's own box.
 *
 * `viewportHeight` is the **track area's full height**, not the lane band. The
 * two are 38px apart — one ruler — and an earlier build subtracted the ruler
 * here while `clipBottom` assumed it had not been, which landed the profile clip
 * 19px above the band's centre. The fixture now states the measured numbers so
 * the two can never disagree again.
 *
 * `readOverflow` is the **card rail's** overflow, not the panel's: the rail is
 * 904px tall against an 801px deck, so 103px of it hangs below the window and
 * the read has to travel exactly that. The timeline panel beside it is 553px and
 * does not move at all — this is the page section's own animation, where the
 * panel was `position: sticky` and held still beside a scrolling card column.
 */
const GEO: ArrangementGeometry = {
  worldWidth: 1344,
  worldHeight: 432,
  gutter: 96,
  profileStart: 0.42 * 1344,
  profileEnd: 0.92 * 1344,
  profileLaneTop: 134,
  laneHeight: 58,
  rulerHeight: 38,
  viewportWidth: 1440,
  viewportHeight: 792,
  chromeHeight: 42,
  proofHeight: 66,
  readOverflow: 103,
}

/**
 * Probes are derived from the phase table, never written out by hand. The dive
 * is what the seam and the rail reveal are measured against, so a retime must
 * not be able to leave a fixture asserting last week's numbers.
 */
const ZOOM_MID = (ARRANGEMENT_PHASES.zoom + ARRANGEMENT_PHASES.rail) / 2

describe('arrangementPhase', () => {
  it('maps every phase boundary to the phase that starts there', () => {
    expect(arrangementPhase(0)).toBe('open')
    expect(arrangementPhase(ARRANGEMENT_PHASES.settle - 0.001)).toBe('open')
    expect(arrangementPhase(ARRANGEMENT_PHASES.settle)).toBe('settle')
    expect(arrangementPhase(ARRANGEMENT_PHASES.travel)).toBe('travel')
    expect(arrangementPhase(ARRANGEMENT_PHASES.zoom)).toBe('zoom')
    expect(arrangementPhase(ARRANGEMENT_PHASES.rail)).toBe('rail')
    expect(arrangementPhase(1)).toBe('rail')
  })

  it('clamps progress outside 0..1', () => {
    expect(arrangementPhase(-4)).toBe('open')
    expect(arrangementPhase(9)).toBe('rail')
  })
})

describe('arrangementFrame', () => {
  it('overshoots the open by 4% so the camera has somewhere to travel from', () => {
    expect(arrangementFrame(0, GEO).scale).toBeCloseTo(
      OPEN_SCALE * OPEN_OVERSHOOT,
      6,
    )
  })

  it('settles to scale 1 with the world anchored to the frame, so the CSS fallbacks are the settled frame', () => {
    const frame = arrangementFrame(0.5, GEO)
    expect(frame.scale).toBe(1)
    expect(frame.cameraX).toBe(0)
    expect(frame.cameraY).toBe(0)
  })

  it('derives the zoom scale from the profile clip width, not from a constant', () => {
    const frame = arrangementFrame(1, GEO)
    const expected = GEO.worldWidth / (GEO.profileEnd - GEO.profileStart)
    expect(frame.scale).toBeCloseTo(expected, 6)
    // The threshold the sharpness fallback guards is never reached at this
    // geometry, which is why the "blurry title" failure mode does not arise.
    expect(frame.scale).toBeLessThan(2.5)
  })

  it('walks the playhead from the axis start to the profile centre and parks it there', () => {
    expect(arrangementFrame(0, GEO).playheadFraction).toBe(0)
    expect(arrangementFrame(0.4, GEO).playheadFraction).toBeGreaterThan(0)
    expect(
      arrangementFrame(ARRANGEMENT_PHASES.rail, GEO).playheadFraction,
    ).toBe(1)
    expect(arrangementFrame(1, GEO).playheadFraction).toBe(1)
  })

  it('holds the playhead fraction monotonic through the whole window', () => {
    let previous = -1
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const current = arrangementFrame(p, GEO).playheadFraction
      expect(current).toBeGreaterThanOrEqual(previous)
      previous = current
    }
  })

  it('parks the playhead on the profile clip centre, which is the lane area centre', () => {
    const parked = arrangementFrame(1, GEO)
    const centre = (GEO.profileStart + GEO.profileEnd) / 2
    const screenX = GEO.gutter + parked.cameraX + centre * parked.scale
    expect(parked.playheadX).toBeCloseTo(screenX, 6)
    expect(parked.playheadX).toBeCloseTo(
      GEO.gutter + (GEO.viewportWidth - GEO.gutter) / 2,
      6,
    )
  })

  it('lands the profile clip on the lane area, not under the rail, at full zoom', () => {
    const parked = arrangementFrame(1, GEO)
    const left = GEO.gutter + parked.cameraX + GEO.profileStart * parked.scale
    const right = GEO.gutter + parked.cameraX + GEO.profileEnd * parked.scale
    expect(left).toBeCloseTo(GEO.gutter, 6)
    expect(right).toBeCloseTo(GEO.viewportWidth, 6)
  })

  it('hides the rail through the dive and slides it fully in at the end', () => {
    expect(arrangementFrame(ARRANGEMENT_PHASES.zoom, GEO).railReveal).toBe(0)
    expect(arrangementFrame(ARRANGEMENT_PHASES.rail, GEO).railReveal).toBe(0)
    expect(arrangementFrame(1, GEO).railReveal).toBe(1)
    expect(arrangementFrame(1, GEO).clipInterior).toBe(1)
  })

  it('closes the seam from the clip rect to the frame across the rail', () => {
    const diving = arrangementFrame(ZOOM_MID, GEO)
    const clipLeft =
      GEO.gutter + diving.cameraX + GEO.profileStart * diving.scale
    // Measured from the *stage's* edges, because that is what the seam overlays
    // — so the chrome above and the proof below are added back in.
    const clipTop =
      GEO.rulerHeight +
      diving.cameraY +
      GEO.profileLaneTop * diving.scale +
      GEO.chromeHeight
    expect(diving.seamInset.left).toBeCloseTo(clipLeft, 6)
    expect(diving.seamInset.top).toBeCloseTo(clipTop, 6)
    expect(diving.seamInset.right).toBeGreaterThan(0)
    expect(diving.seamInset.bottom).toBeGreaterThan(0)
    const revealed = arrangementFrame(1, GEO).seamInset
    expect(revealed).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
  })

  it('starts the reveal inside the track area, so the chrome and the proof are still visible when the window begins to open', () => {
    const atRail = arrangementFrame(ARRANGEMENT_PHASES.rail, GEO).seamInset
    expect(atRail.top).toBeGreaterThanOrEqual(GEO.chromeHeight)
    expect(atRail.bottom).toBeGreaterThanOrEqual(GEO.proofHeight)
  })

  it('grows the window monotonically until it covers the stage, so the chrome is uncovered rather than flickering', () => {
    let previousTop = Infinity
    let previousBottom = Infinity
    for (let p = ARRANGEMENT_PHASES.rail; p <= 1.0001; p += 0.01) {
      const inset = arrangementFrame(p, GEO).seamInset
      expect(inset.top).toBeLessThanOrEqual(previousTop + 1e-9)
      expect(inset.bottom).toBeLessThanOrEqual(previousBottom + 1e-9)
      previousTop = inset.top
      previousBottom = inset.bottom
    }
    // Ends exactly on the stage's edges — which is what covers the furniture.
    expect(previousTop).toBe(0)
    expect(previousBottom).toBe(0)
  })

  it('covers the whole stage once open, which is what lets the panel hide the chrome and the proof', () => {
    const open = arrangementFrame(1, GEO)
    expect(open.seamInset).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
    // Not merely close — exactly zero, or the panel would leave a hairline of
    // the arrangement showing along the edge it is meant to close.
    expect(open.seamInset.top).toBe(0)
    expect(open.seamInset.bottom).toBe(0)
  })

  it('centres the profile clip in the lane band, not in the track area', () => {
    // The 38px ruler is the whole difference, and getting it wrong lands the
    // clip 19px above the band's centre — which is what happened while
    // `viewportHeight` was the band and `clipBottom` assumed it was the track
    // area. Both now mean the track area, and this pins that.
    const parked = arrangementFrame(1, GEO)
    const bandHeight = GEO.viewportHeight - GEO.rulerHeight
    const clipCentreY =
      GEO.rulerHeight +
      parked.cameraY +
      (GEO.profileLaneTop + GEO.laneHeight / 2) * parked.scale
    expect(clipCentreY).toBeCloseTo(GEO.rulerHeight + bandHeight / 2, 6)
  })

  it('starts the seam as the untouched clip rect so the dive has something to open from', () => {
    const atZoom = arrangementFrame(ARRANGEMENT_PHASES.zoom, GEO)
    const clipLeft =
      GEO.gutter + atZoom.cameraX + GEO.profileStart * atZoom.scale
    expect(atZoom.seamInset.left).toBeCloseTo(clipLeft, 6)
    expect(atZoom.seamOpacity).toBe(0)
  })

  it('holds the camera still from the rail to the end, so the reveal has room to finish', () => {
    const atRail = arrangementFrame(ARRANGEMENT_PHASES.rail, GEO)
    const atEnd = arrangementFrame(1, GEO)
    expect(atEnd.scale).toBeCloseTo(atRail.scale, 6)
    expect(atEnd.cameraX).toBeCloseTo(atRail.cameraX, 6)
    expect(atEnd.cameraY).toBeCloseTo(atRail.cameraY, 6)
    expect(atEnd.playheadX).toBeCloseTo(atRail.playheadX, 6)
  })

  it('keeps the window opening and the read on separate stretches, so the column never slides while the panel is half clipped', () => {
    // Still opening — nothing has been read yet.
    expect(arrangementFrame(ARRANGEMENT_PHASES.rail, GEO).readTravel).toBe(0)
    expect(
      arrangementFrame(ARRANGEMENT_SEAM_OPEN - 0.001, GEO).readTravel,
    ).toBe(0)
    // Fully open and untouched: the read starts from a whole panel.
    const opened = arrangementFrame(ARRANGEMENT_SEAM_OPEN, GEO)
    expect(opened.railReveal).toBe(1)
    expect(opened.readTravel).toBe(0)
    // And from there it is only the read that moves.
    expect(arrangementFrame(1, GEO).readTravel).toBeCloseTo(GEO.readOverflow, 6)
  })

  it('reads exactly the measured overflow, so the last card lands flush and no scroll is wasted past it', () => {
    const fits: ArrangementGeometry = { ...GEO, readOverflow: 0 }
    expect(arrangementFrame(1, fits).readTravel).toBe(0)
    expect(arrangementFrame(0.9, fits).readTravel).toBe(0)

    const tall = { ...GEO, readOverflow: 304 }
    expect(arrangementFrame(1, tall).readTravel).toBeCloseTo(304, 6)
    // Never past the end, and never negative.
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const read = arrangementFrame(p, tall).readTravel
      expect(read).toBeGreaterThanOrEqual(0)
      expect(read).toBeLessThanOrEqual(304.000001)
    }
  })

  it('spends at least a quarter of the window on the hold, and enough scroll to make it worth watching', () => {
    expect(1 - ARRANGEMENT_PHASES.rail).toBeGreaterThanOrEqual(0.25)
    expect(ARRANGEMENT_SCROLL_SVH).toBeGreaterThanOrEqual(400)
  })

  it('opens the window after the rail and finishes before the end, so the read owns its own stretch', () => {
    // Below the rail the reveal would fire before the dive had landed; at 1 the
    // read would have no scroll left and the last card would stay clipped.
    expect(ARRANGEMENT_SEAM_OPEN).toBeGreaterThan(ARRANGEMENT_PHASES.rail)
    expect(ARRANGEMENT_SEAM_OPEN).toBeLessThan(1)
    // `#about` resolves to this offset, so the window must be open by then.
    expect(arrangementFrame(ARRANGEMENT_SEAM_OPEN, GEO).railReveal).toBe(1)
  })

  it('is a pure function of progress — the same progress renders the same frame', () => {
    expect(arrangementFrame(0.73, GEO)).toEqual(arrangementFrame(0.73, GEO))
  })

  it('clamps out-of-range progress instead of extrapolating', () => {
    expect(arrangementFrame(-1, GEO)).toEqual(arrangementFrame(0, GEO))
    expect(arrangementFrame(2, GEO)).toEqual(arrangementFrame(1, GEO))
  })
})

describe('arrangement data', () => {
  it('defaults to the making timeline', () => {
    expect(ARRANGEMENT_MODE).toBe('making')
    expect(ARRANGEMENT_CLIPS).toBe(MAKING_CLIPS)
  })

  it('keeps employers and schools out of the default timeline', () => {
    const labels = MAKING_CLIPS.map((clip) => clip.label).join(' ')
    expect(labels).not.toMatch(
      /FATIHA|80&COMPANY|UNZYP|AMIKOM|BINAR|ALTERRA|BANGKIT/,
    )
  })

  it('keeps the career record whole behind the switch', () => {
    const labels = CAREER_CLIPS.map((clip) => clip.label).join(' ')
    expect(labels).toMatch(/FATIHA|80&COMPANY|UNZYP/)
    expect(labels).toMatch(/AMIKOM|BINAR|ALTERRA|BANGKIT/)
    expect(CAREER_LANES.map((lane) => lane.id)).toContain('education')
  })

  it('derives the career axis from the periods the Experience section prints', () => {
    const roles = CAREER_CLIPS.filter((clip) => clip.laneId === 'work')
    roles.forEach((clip) => {
      expect(clip.start).toBeGreaterThanOrEqual(0)
      expect(clip.end).toBeLessThanOrEqual(1)
      expect(clip.end).toBeGreaterThan(clip.start)
    })
    expect(YEAR_MIN).toBe(2018)
    expect(YEAR_MAX).toBeCloseTo(2026.75, 2)
  })

  it('gives the making ruler named stages and the career ruler years', () => {
    expect(RULER_LABELS).toEqual([
      'DISCOVER',
      'DEFINE',
      'COMPOSE',
      'CONNECT',
      'SHIP',
    ])
  })

  it('spans the About clips across the full width without overlap', () => {
    expect(ABOUT_TRACKS[0].start).toBe(0)
    expect(ABOUT_TRACKS[ABOUT_TRACKS.length - 1].end).toBeCloseTo(1, 6)
    ABOUT_TRACKS.forEach((track, index) => {
      if (index > 0)
        expect(track.start).toBeCloseTo(ABOUT_TRACKS[index - 1].end, 6)
      expect(track.bars.length).toBeGreaterThan(0)
    })
  })

  it('stacks overlapping clips in rows instead of painting them on top of each other', () => {
    const work = CAREER_CLIPS.filter((clip) => clip.laneId === 'work')
    const overlapping = work.filter((clip) =>
      work.some(
        (other) =>
          other.id !== clip.id &&
          other.start < clip.end &&
          clip.start < other.end,
      ),
    )
    expect(overlapping.length).toBeGreaterThan(0)
    // Overlapping clips must be in different rows, and every row must fill the
    // lane — a clip given the row count as it stood mid-pass leaves a gap.
    const rows = new Set(overlapping.map((clip) => clip.top))
    expect(rows.size).toBe(overlapping.length)
    CAREER_CLIPS.forEach((clip) => {
      expect(clip.height).toBeGreaterThan(0)
      expect(clip.top).toBeGreaterThanOrEqual(0)
      expect((clip.top ?? 0) + (clip.height ?? 1)).toBeLessThanOrEqual(1.000001)
    })
  })

  it('has exactly one name clip and exactly one profile clip per dataset', () => {
    ;[MAKING_CLIPS, CAREER_CLIPS].forEach((clips) => {
      expect(clips.filter((clip) => clip.kind === 'name')).toHaveLength(1)
      expect(clips.filter((clip) => clip.kind === 'profile')).toHaveLength(1)
    })
  })
})
