require('@testing-library/jest-dom')

// jsdom does not implement TextEncoder/TextDecoder, but next/cache pulls in
// Node's web-streams helper at import time, which constructs one at module
// scope. Any suite that transitively imports features/blog/lib/blog.ts dies on
// load without this. Same for the ReadableStream it expects to find.
const { TextEncoder, TextDecoder } = require('node:util')
const { ReadableStream, TransformStream } = require('node:stream/web')

if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder
if (typeof global.ReadableStream === 'undefined')
  global.ReadableStream = ReadableStream
if (typeof global.TransformStream === 'undefined')
  global.TransformStream = TransformStream

// next/cache is a server-only module. It transitively pulls in the fetch
// spec-extension classes, which jsdom does not provide, so any suite importing
// features/blog/lib/blog.ts dies on load. Nothing under test here exercises the
// cache, so pass the function straight through.
jest.mock('next/cache', () => ({
  unstable_cache: (fn) => fn,
  unstable_noStore: () => {},
  revalidatePath: () => {},
  revalidateTag: () => {},
}))

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
//
// The contact FAQ renders a real component tree on the server, and its
// magnetic layer calls the motion value hooks. A complete-enough mock keeps
// those hooks pure and synchronous while still letting the rest of the page's
// server-rendered markup be asserted. Motion components become their plain
// HTML tags; the spring/transform hooks return inert values, which is all a
// static-markup test needs.
const mockMotionValue = (value) => ({
  get: () => value,
  getPrevious: () => value,
  set: jest.fn(),
  jump: jest.fn(),
  on: jest.fn(() => () => {}),
  destroy: jest.fn(),
})

const mockMotionComponent = new Proxy(
  {},
  { get: (_target, tag) => String(tag) },
)

jest.mock('motion/react', () => ({
  m: mockMotionComponent,
  motion: mockMotionComponent,
  useScroll: () => ({
    scrollYProgress: { current: 0 },
  }),
  useTransform: () => 0,
  useSpring: (value) => value,
  useMotionValue: (value) => mockMotionValue(value),
  useMotionValueEvent: () => {},
  useReducedMotion: () => false,
  useAnimationFrame: () => {},
  AnimatePresence: ({ children }) => children,
  // `motion.create(Component)` wraps a component; several booth components use
  // it at module scope, so it has to exist for anything importing them.
  create: (Component) => Component,
}))

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})
