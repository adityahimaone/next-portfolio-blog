export const COLORS = {
  red:       '#E10600',
  redDim:    '#8A0400',
  white:     '#F5F5F2',
  whiteDim:  '#C8C8C4',
  gray:      '#2A2A2D',
  grayLight: '#4A4A4D',
  grayDeep:  '#1A1A1C',
  black:     '#0A0A0A',
} as const;

export const TYPE = {
  display: 'var(--font-display)',
  heading: 'var(--font-heading)',
  body:    'var(--font-body)',
  mono:    'var(--font-mono)',
} as const;

export const SPACE = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24,
  8: 32, 10: 40, 12: 48, 16: 64, 20: 80, 24: 96,
  32: 128, 48: 192,
} as const;

export const DURATION = {
  instant: 60,
  fast:    120,
  base:    200,
  slow:    400,
  stage:   800,
} as const;

export const EASE = {
  step:     'steps(8, end)',
  stepFast: 'steps(4, end)',
  pixel:    [0.36, 0, 0.66, -0.56] as const,
  decel:    [0, 0, 0.2, 1] as const,
  accel:    [0.4, 0, 1, 1] as const,
} as const;

export const Z = {
  canvasBg: 0,
  content:  10,
  hud:      50,
  modal:    100,
  crt:      9999,
} as const;

/** Pre-baked common style props for use with motion / inline */
export const STYLE_TOKENS = {
  ledPulse: {
    boxShadow: `0 0 6px ${COLORS.red}, 0 0 12px ${COLORS.redDim}`,
  },
  bracketBorder: {
    border: `2px solid ${COLORS.white}`,
  },
  chunkyButtonShadow: `4px 4px 0 0 ${COLORS.red}`,
} as const;