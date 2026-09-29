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
