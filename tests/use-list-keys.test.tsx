import { act, render } from '@testing-library/react'
import { createElement } from 'react'
import { useListKeys } from '@/features/bookmarks/hooks/use-list-keys'

/**
 * `active` is an index into whatever list is currently rendered, so it has to
 * be dropped when the list is *replaced* — not merely resized. These cover the
 * two ways that used to leave a stale row lit: a category switch that happened
 * to keep the same row count, and the first-render default.
 *
 * Written with `createElement` rather than JSX: this suite runs under
 * ts-jest with `extensionsToTreatAsEsm`, which skips the transform for a .tsx
 * entry point, so the JSX would never compile.
 */
function Harness(props: {
  count: number
  listKey: string
  onOpen?: (index: number) => void
  onRender: (active: number | null) => void
}) {
  const { active } = useListKeys(
    props.count,
    props.onOpen ?? (() => {}),
    props.listKey,
  )
  props.onRender(active)
  return null
}

function press(key: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  })
}

function setup(
  count: number,
  listKey: string,
  onOpen?: (index: number) => void,
) {
  // One array for the whole test, so a rerender that mounts a fresh callback
  // still records into the same history.
  const seen: (number | null)[] = []
  const record = (active: number | null) => {
    seen.push(active)
  }

  const utils = render(
    createElement(Harness, { count, listKey, onOpen, onRender: record }),
  )

  // What the component currently holds, as opposed to every value it has ever
  // rendered — the difference matters for the re-render assertions.
  const current = () => {
    const value = seen[seen.length - 1]
    return value === null ? 'none' : String(value)
  }

  const change = (nextCount: number, nextKey: string) =>
    utils.rerender(
      createElement(Harness, {
        count: nextCount,
        listKey: nextKey,
        onOpen,
        onRender: record,
      }),
    )

  return { ...utils, current, change }
}

describe('useListKeys', () => {
  it('lights nothing on first render', () => {
    const { current } = setup(5, 'All::')
    expect(current()).toBe('none')
  })

  it('moves down with j and lands on row one first', () => {
    const { current } = setup(5, 'All::')
    press('j')
    expect(current()).toBe('0')
    press('j')
    expect(current()).toBe('1')
  })

  it('moves down with ArrowDown and up with ArrowUp', () => {
    const { current } = setup(5, 'All::')
    press('ArrowDown')
    press('ArrowDown')
    expect(current()).toBe('1')
    press('ArrowUp')
    expect(current()).toBe('0')
  })

  it('does nothing on k with nothing selected', () => {
    const { current } = setup(5, 'All::')
    press('k')
    expect(current()).toBe('none')
  })

  it('clamps at the first row rather than going past it', () => {
    const { current } = setup(5, 'All::')
    press('j')
    expect(current()).toBe('0')
    press('k')
    // Row one is the top: there is nothing above it to select.
    expect(current()).toBe('0')
  })

  it('stops at the bottom of the list', () => {
    const { current } = setup(2, 'All::')
    press('j')
    press('j')
    press('j')
    expect(current()).toBe('1')
  })

  it('drops the selection when the list is replaced at the same length', () => {
    const { current, change } = setup(5, 'All::')
    press('j')
    press('j')
    expect(current()).toBe('1')

    // A different category that happens to contain the same number of rows.
    // The length effect cannot see this one; only the listKey can.
    change(5, 'Dev::')
    expect(current()).toBe('none')
  })

  it('drops the selection when the search query changes', () => {
    const { current, change } = setup(5, 'All::')
    press('j')
    expect(current()).toBe('0')

    change(5, 'All::react')
    expect(current()).toBe('none')
  })

  it('clamps rather than drops when the same list just gets shorter', () => {
    const { current, change } = setup(5, 'All::')
    press('j')
    press('j')
    press('j')
    expect(current()).toBe('2')

    change(2, 'All::')
    expect(current()).toBe('1')
  })

  it('does not open anything while nothing is selected', () => {
    const onOpen = jest.fn()
    setup(3, 'All::', onOpen)
    press('Enter')
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('opens the selected row on Enter', () => {
    const onOpen = jest.fn()
    setup(3, 'All::', onOpen)
    press('j')
    press('j')
    press('Enter')
    expect(onOpen).toHaveBeenCalledWith(1)
  })
})
