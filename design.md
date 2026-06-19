# Design — Aditya Himaone Portfolio (DAP System V3)

A locked design system for this app supporting both light and dark modes. Every page and component redesign reads this file before emitting code.

## Genre
playful (Teenage Engineering minimalist audio gear & Braun/Rams high-fidelity console hybrid).

## Macrostructure family
- Marketing / Landing Sections: Interactive full-width console grid layouts resembling rackmount studio units or portable player consoles.
- Component voice: Tactical, physical-feel controls (rotary dials, mechanical buttons, slotted cartridges, LED indicators).

## Theme (Dual-Mode Design Tokens)

### Light Mode (Silver/Aluminum Plate)
- `--color-paper`   oklch(96% 0.005 240)   /* Silver aluminum background */
- `--color-paper-2` oklch(92% 0.008 240)   /* Console deck panels */
- `--color-paper-3` oklch(86% 0.01 240)    /* Highlighted dials / sliders */
- `--color-ink`     oklch(15% 0.01 240)    /* Dark charcoal text */
- `--color-ink-2`   oklch(45% 0.015 240)   /* Muted technical readouts */
- `--color-accent`  oklch(62% 0.17 48)     /* Ocher/Amber status (light-contrast optimized) */
- `--color-success` oklch(58% 0.16 140)    /* Forest/Phosphor Green LEDs */
- `--color-rule`    oklch(82% 0.01 240)    /* Engraved dial lines / borders */

### Dark Mode (Anodized Steel)
- `--color-paper`   oklch(12% 0.01 240)    /* Dark zinc background */
- `--color-paper-2` oklch(18% 0.015 240)   /* Card/Console deck panels */
- `--color-paper-3` oklch(24% 0.02 240)    /* Highlighted dials / fader caps */
- `--color-ink`     oklch(95% 0.005 240)   /* Off-white text */
- `--color-ink-2`   oklch(70% 0.01 240)    /* Light-grey labels */
- `--color-accent`  oklch(76% 0.17 48)     /* Neon Amber/Gold glowing LED */
- `--color-success` oklch(82% 0.19 130)    /* Phosphor Green glowing screen */
- `--color-rule`    oklch(22% 0.01 240)    /* Dark metal seam/grid borders */

## Typography
- Display: Syne, weight 800, style normal (roman)
- Body:    Geist Sans, weight 400
- Mono:    Geist Mono, weight 500 (technical labels, status, readout parameters)

## Spacing
4-point grid. Standard layout gaps should use Tailwind classes corresponding to `var(--space-md)` (1.5rem) etc.

## Motion
- Snappy, responsive transitions with spring physics for hardware rotations/taps.
- Constant, gentle looping CSS/SVG visualizer animations when music is playing.

## CTA Voice
- Primary CTA: High-contrast ocher/amber button, uppercase, technical font.
- Secondary CTA: Tactile bordered dial-toggle flat button.

## What components MUST share
- Tactile, mechanical detailing: 4 corner screws on rack panels.
- Status screens with phosphor green/amber LCD glowing style.
- All technical text labeled in `Geist Mono` with uppercase tracking.
- Zero gradient texts on headers (keep typography clean and solid).
