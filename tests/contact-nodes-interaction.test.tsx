/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'

import { ContactDesk } from '@/features/landing-page/rack-01/contact-desk/contact-desk'

/**
 * The inline contract: a question is a disclosure, not a modal trigger. The
 * answer mounts inside the same card, a second question replaces the first,
 * and Escape closes the open card.
 */
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
})

describe('the magnetic FAQ, in the browser', () => {
  it('expands a pill in place and collapses it again', () => {
    render(<ContactDesk />)
    const trigger = screen.getByRole('button', {
      name: /What kind of work do you take on\?/,
    })

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    const panelId = trigger.getAttribute('aria-controls')
    const panel = panelId ? document.getElementById(panelId) : null
    expect(panel).not.toBeNull()
    expect(panel).toHaveAttribute('role', 'region')
    expect(panel).toHaveTextContent(
      'Frontend work where the hard part is the state or the edge cases',
    )
    expect(document.querySelector('[role="dialog"]')).toBeNull()

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(panelId ? document.getElementById(panelId) : null).toBeNull()
  })

  it('keeps exactly one answer open', () => {
    render(<ContactDesk />)
    const first = screen.getByRole('button', {
      name: /What kind of work do you take on\?/,
    })
    const second = screen.getByRole('button', {
      name: /How do we start\?/,
    })

    fireEvent.click(first)
    expect(first).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(second)
    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(second).toHaveAttribute('aria-expanded', 'true')
    expect(
      document.querySelectorAll('button[aria-expanded="true"]'),
    ).toHaveLength(1)
  })

  it('closes the open pill with Escape', () => {
    render(<ContactDesk />)
    const trigger = screen.getByRole('button', {
      name: /How do we start\?/,
    })

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('resets the spotlight when a question outside it is opened', () => {
    render(<ContactDesk />)
    const scopeFilter = screen.getByRole('button', { name: 'Scope' })
    fireEvent.click(scopeFilter)
    expect(scopeFilter).toHaveAttribute('aria-pressed', 'true')
    expect(document.querySelectorAll('[data-muted="true"]')).toHaveLength(6)

    const processQuestion = screen.getByRole('button', {
      name: /How do we start\?/,
    })
    fireEvent.click(processQuestion)

    expect(processQuestion).toHaveAttribute('aria-expanded', 'true')
    expect(scopeFilter).toHaveAttribute('aria-pressed', 'false')
    expect(document.querySelectorAll('[data-muted="true"]')).toHaveLength(0)
  })
})
