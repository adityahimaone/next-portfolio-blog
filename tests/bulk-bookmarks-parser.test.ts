import { parseBulkBookmarks } from '../features/bookmarks/utils/bulk-parser'

describe('parseBulkBookmarks', () => {
  it('parses JSON format properly', () => {
    const jsonInput = JSON.stringify([
      { url: 'https://threejs.org', title: 'Three.js', category: '3D' },
      { url: 'https://nextjs.org', category: 'Dev Tools' },
    ])
    const result = parseBulkBookmarks(jsonInput)
    expect(result).toHaveLength(2)
    expect(result[0].title).toBe('Three.js')
    expect(result[0].category).toBe('3D')
    expect(result[1].title).toBe('Nextjs')
    expect(result[1].category).toBe('Dev Tools')
  })

  it('parses pipe-separated lines', () => {
    const input = `
      https://github.com | GitHub | Dev Tools | Code repository
      https://figma.com | Figma | UI & Design
    `
    const result = parseBulkBookmarks(input)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      url: 'https://github.com',
      title: 'GitHub',
      category: 'Dev Tools',
      description: 'Code repository',
    })
    expect(result[1].title).toBe('Figma')
    expect(result[1].category).toBe('UI & Design')
  })

  it('parses plain URLs and auto-generates titles', () => {
    const input = `
      https://tailwindcss.com
      react.dev
      # comment line
      // another comment
    `
    const result = parseBulkBookmarks(input, 'Development')
    expect(result).toHaveLength(2)
    expect(result[0].url).toBe('https://tailwindcss.com')
    expect(result[0].title).toBe('Tailwindcss')
    expect(result[0].category).toBe('Development')
    expect(result[1].url).toBe('https://react.dev')
    expect(result[1].title).toBe('React')
  })

  it('handles empty or malformed strings gracefully', () => {
    expect(parseBulkBookmarks('')).toEqual([])
    expect(parseBulkBookmarks('   \n\n  ')).toEqual([])
    expect(parseBulkBookmarks('not a url')).toEqual([])
  })
})
