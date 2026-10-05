import { parseContributions } from '@/features/projects/lib/github'

/**
 * The contribution grid is scraped, not fetched from a documented API, so this
 * guards the one thing that can fail silently: if the pairing stops working the
 * feed is empty and the page quietly renders a generated sample year that looks
 * exactly like real data. These cases are the shapes seen in GitHub's actual
 * markup (verified against a live response), so a change in that markup fails
 * here rather than in production.
 */

/** A single cell plus its tooltip, as GitHub emits them back to back. */
const cell = (date: string, tip: string) =>
  `<td tabindex="0" role="gridcell" data-date="${date}" data-level="0" ` +
  `class="ContributionCalendar-day"></td>\n  <tool-tip for="contribution-day-component-0-1" ` +
  `popover="manual" class="sr-only">${tip}</tool-tip>`

describe('parseContributions', () => {
  it('reads the count out of a cell', () => {
    expect(
      parseContributions(cell('2026-04-26', '4 contributions on April 26th.')),
    ).toEqual([{ date: '2026-04-26', count: 4 }])
  })

  it('reads the singular "1 contribution"', () => {
    expect(
      parseContributions(cell('2026-08-03', '1 contribution on August 3rd.')),
    ).toEqual([{ date: '2026-08-03', count: 1 }])
  })

  it('treats a day with none as zero rather than dropping it', () => {
    expect(
      parseContributions(
        cell('2026-01-04', 'No contributions on January 4th.'),
      ),
    ).toEqual([{ date: '2026-01-04', count: 0 }])
  })

  it('keeps counts of any size, including the freak days', () => {
    expect(
      parseContributions(
        cell('2026-08-30', '108 contributions on August 30th.'),
      ),
    ).toEqual([{ date: '2026-08-30', count: 108 }])
  })

  it('strips the nested markup GitHub puts inside the tooltip', () => {
    const tip = '<strong>4 contributions</strong> on <span>April 26th</span>.'
    expect(parseContributions(cell('2026-04-26', tip))).toEqual([
      { date: '2026-04-26', count: 4 },
    ])
  })

  it('pairs each cell with its own tooltip across a run of days', () => {
    const html = [
      cell('2026-01-04', 'No contributions on January 4th.'),
      cell('2026-01-11', 'No contributions on January 11th.'),
      cell('2026-01-18', '2 contributions on January 18th.'),
    ].join('\n')

    expect(parseContributions(html)).toEqual([
      { date: '2026-01-04', count: 0 },
      { date: '2026-01-11', count: 0 },
      { date: '2026-01-18', count: 2 },
    ])
  })

  it('returns nothing for markup it does not recognise', () => {
    // The failure mode this guards: an empty parse must be empty, not guessed.
    expect(
      parseContributions('<html><body>nothing here</body></html>'),
    ).toEqual([])
    expect(parseContributions('')).toEqual([])
  })

  it('ignores a tooltip that is not attached to a cell', () => {
    expect(
      parseContributions(
        '<tool-tip for="contribution-graph-legend-level-0">Less</tool-tip>',
      ),
    ).toEqual([])
  })
})
