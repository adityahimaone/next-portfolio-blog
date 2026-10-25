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
        tags: ['motion', 'interaction'],
        installed: true,
      },
    ])
    const res = parseBulkSkills(json)
    expect(res).toHaveLength(1)
    expect(res[0]).toEqual({
      name: 'test-skill',
      repo: 'owner/repo',
      description: 'Test description',
      tags: ['motion', 'interaction'],
      installed: true,
    })
  })

  it('treats a three-column line as name, repo, description', () => {
    const input = 'my-skill | user/repo | A useful skill'
    const res = parseBulkSkills(input)
    expect(res).toHaveLength(1)
    expect(res[0]).toEqual({
      name: 'my-skill',
      repo: 'user/repo',
      description: 'A useful skill',
      tags: [],
      installed: false,
    })
  })

  it('reads tags from the third column when a description follows', () => {
    const input = 'my-skill | user/repo | motion,interaction | A useful skill'
    const res = parseBulkSkills(input)
    expect(res).toHaveLength(1)
    expect(res[0]).toEqual({
      name: 'my-skill',
      repo: 'user/repo',
      description: 'A useful skill',
      tags: ['motion', 'interaction'],
      installed: false,
    })
  })

  it('falls back to the supplied tags when a line declares none', () => {
    const res = parseBulkSkills('my-skill | user/repo | A useful skill', [
      'tooling',
    ])
    expect(res[0].tags).toEqual(['tooling'])
  })

  it('resolves a ui-skills URL to its owner and skill name', () => {
    const res = parseBulkSkills(
      'https://www.ui-skills.com/skills/emilkowalski/animate',
      ['motion'],
    )
    expect(res).toHaveLength(1)
    expect(res[0].name).toBe('animate')
    expect(res[0].repo).toBe('emilkowalski/skills')
    expect(res[0].tags).toEqual(['motion'])
  })

  it('resolves a skills.sh URL to its owner, repo, and skill name', () => {
    const res = parseBulkSkills(
      'https://www.skills.sh/vercel-labs/skills/next-cache',
      ['tooling'],
    )
    expect(res).toHaveLength(1)
    expect(res[0].name).toBe('next-cache')
    expect(res[0].repo).toBe('vercel-labs/skills')
    expect(res[0].tags).toEqual(['tooling'])
  })
})
