require('@testing-library/jest-dom')

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock motion
jest.mock('motion/react', () => ({
  m: {
    div: 'div',
    p: 'p',
    h1: 'h1',
    span: 'span',
  },
  useScroll: () => ({
    scrollYProgress: { current: 0 },
  }),
  useTransform: () => 0,
  AnimatePresence: ({ children }) => children,
}))

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})
