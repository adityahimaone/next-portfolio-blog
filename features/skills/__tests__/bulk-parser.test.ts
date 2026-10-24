import { parseBulkSkills } from '../utils/bulk-parser'

describe('parseBulkSkills', () => {
  it('returns empty array on empty input', () => {
    expect(parseBulkSkills('')).toEqual([])
    expect(parseBulkSkills('   \n  \n')).toEqual([])
  })

  it('parses valid JSON array input', () => {
    const json = JSON.stringify([
      {
        name: 'test-skill',
        repo: 'owner/repo',
        description: 'Test description',
        installs: '50K',
        category: 'Design & motion',
        installed: true,
      },
    ])
    const res = parseBulkSkills(json)
    expect(res).toHaveLength(1)
    expect(res[0]).toEqual({
      name: 'test-skill',
      repo: 'owner/repo',
      description: 'Test description',
      installs: '50K',
      category: 'Design & motion',
      installed: true,
    })
  })

  it('parses pipe-delimited 3-part lines', () => {
    const input = 'my-skill | user/repo | A useful skill'
    const res = parseBulkSkills(input, 'Engineering workflow')
    expect(res).toHaveLength(1)
    expect(res[0]).toEqual({
      name: 'my-skill',
      repo: 'user/repo',
      category: 'Engineering workflow',
      description: 'A useful skill',
      installs: '1.0K',
      installed: false,
    })
  })

  it('parses pipe-delimited 4-part lines with custom category', () => {
    const input = 'my-skill | user/repo | Mobile | A useful mobile skill'
    const res = parseBulkSkills(input)
    expect(res).toHaveLength(1)
    expect(res[0]).toEqual({
      name: 'my-skill',
      repo: 'user/repo',
      category: 'Mobile',
      description: 'A useful mobile skill',
      installs: '1.0K',
      installed: false,
    })
  })

  it('parses pipe-delimited 5-part lines with installs count', () => {
    const input = 'my-skill | user/repo | Mobile | A useful mobile skill | 120.5K'
    const res = parseBulkSkills(input)
    expect(res).toHaveLength(1)
    expect(res[0]).toEqual({
      name: 'my-skill',
      repo: 'user/repo',
      category: 'Mobile',
      description: 'A useful mobile skill',
      installs: '120.5K',
      installed: false,
    })
  })

  it('parses skills.sh URL lines', () => {
    const input = 'https://www.skills.sh/vercel-labs/skills/next-cache'
    const res = parseBulkSkills(input, 'Agents & tooling')
    expect(res).toHaveLength(1)
    expect(res[0].name).toBe('next-cache')
    expect(res[0].repo).toBe('vercel-labs/skills')
    expect(res[0].category).toBe('Agents & tooling')
  })
})
