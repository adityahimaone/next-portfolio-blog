/**
 * Recommended agent skills, curated from the skills.sh directory.
 *
 * Hand-written rather than fetched at build time: the page is a recommendation,
 * not a mirror of the leaderboard, so a bad week on skills.sh cannot reorder it
 * and no route here needs a network call to render. `installed` marks the ones
 * actually running in this workspace — the list's own credibility signal.
 */
export interface RecommendedSkill {
  name: string
  /** `owner/repo` on GitHub, which is also the skills.sh path prefix. */
  repo: string
  description: string
  /** Installs as skills.sh prints them. A rough popularity signal, not a metric. */
  installs: string
  /** True when this workspace already runs the skill. */
  installed?: boolean
}

export interface SkillGroup {
  title: string
  /** LED + rail colour, the same job a bookmark channel colour does. */
  hue: string
  skills: RecommendedSkill[]
}

export const SKILLS_SOURCE = 'https://www.skills.sh/'

export function skillUrl(skill: RecommendedSkill): string {
  return `${SKILLS_SOURCE}${skill.repo}/${skill.name}`
}

export function installCommand(skill: RecommendedSkill): string {
  return `npx skills add https://github.com/${skill.repo} --skill ${skill.name}`
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Design & motion',
    hue: '#e879f9',
    skills: [
      {
        name: 'emil-design-eng',
        repo: 'emilkowalski/skills',
        description:
          "Emil Kowalski's philosophy on UI polish, component design and animation decisions — the invisible details that make software feel right.",
        installs: '350.4K',
        installed: true,
      },
      {
        name: 'animate',
        repo: 'emilkowalski/skills',
        description:
          'Build an animation from scratch, making the decisions in the order that decides whether it feels right: should it animate at all, what purpose, which tool.',
        installs: '140.2K',
        installed: true,
      },
      {
        name: 'animation-vocabulary',
        repo: 'emilkowalski/skills',
        description:
          'Reverse-lookup glossary that turns a vague description of a motion effect into its exact term.',
        installs: '208.9K',
        installed: true,
      },
      {
        name: 'find-animation-opportunities',
        repo: 'emilkowalski/skills',
        description:
          "Search a codebase or UI for places that don't animate but should — and reject everything that shouldn't.",
        installs: '178.5K',
        installed: true,
      },
      {
        name: 'improve-animations',
        repo: 'emilkowalski/skills',
        description:
          "Survey a codebase's motion code as a senior motion advisor, then produce a prioritised audit and self-contained implementation plans.",
        installs: '192.8K',
        installed: true,
      },
      {
        name: 'review-animations',
        repo: 'emilkowalski/skills',
        description:
          'Reviews animation and motion code against a high craft bar. Default to flagging; approval is earned.',
        installs: '223.6K',
        installed: true,
      },
      {
        name: 'apple-design',
        repo: 'emilkowalski/skills',
        description:
          "Apple's approach to interface design and fluid, physical motion, translated for the web.",
        installs: '209.2K',
        installed: true,
      },
      {
        name: 'break-ui',
        repo: 'emilkowalski/skills',
        description:
          'Try to break a piece of UI by feeding it worst-case data: long names, unbreakable emails, huge counts, zero items.',
        installs: '32.2K',
      },
      {
        name: 'frontend-design',
        repo: 'anthropics/skills',
        description:
          'Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one.',
        installs: '984.2K',
        installed: true,
      },
    ],
  },
  {
    title: 'Engineering workflow',
    hue: '#a5b4fc',
    skills: [
      {
        name: 'grill-me',
        repo: 'mattpocock/skills',
        description: 'A relentless interview to sharpen a plan or design.',
        installs: '1.3M',
      },
      {
        name: 'grill-with-docs',
        repo: 'mattpocock/skills',
        description:
          'The same relentless interview, but it writes the ADRs and the glossary as it goes.',
        installs: '1.2M',
      },
      {
        name: 'grilling',
        repo: 'mattpocock/skills',
        description:
          'Grill the user relentlessly about a plan, decision or idea — stress-test the thinking before any code.',
        installs: '905.4K',
      },
      {
        name: 'improve-codebase-architecture',
        repo: 'mattpocock/skills',
        description:
          'Scan a codebase for deepening opportunities, present them as a visual report, then grill through the one you pick.',
        installs: '1.1M',
      },
      {
        name: 'tdd',
        repo: 'mattpocock/skills',
        description:
          'Test-driven development: red-green-refactor, test-first features and bug fixes, integration tests.',
        installs: '1.1M',
      },
      {
        name: 'domain-modeling',
        repo: 'mattpocock/skills',
        description:
          "Build and sharpen a project's domain model — GLOSSARY.md terms and ADRs.",
        installs: '814.5K',
      },
      {
        name: 'prototype',
        repo: 'mattpocock/skills',
        description:
          'Build a throwaway prototype to answer a design question before committing to an approach.',
        installs: '932.8K',
        installed: true,
      },
      {
        name: 'handoff',
        repo: 'mattpocock/skills',
        description:
          'Compact the current conversation into a handoff document another agent can pick up.',
        installs: '977.6K',
      },
      {
        name: 'triage',
        repo: 'mattpocock/skills',
        description:
          'Move issues and external PRs through a triage state machine, then write agent-ready briefs.',
        installs: '936.9K',
      },
      {
        name: 'teach',
        repo: 'mattpocock/skills',
        description: 'Teach a new skill or concept inside the workspace.',
        installs: '806.2K',
      },
      {
        name: 'setup-matt-pocock-skills',
        repo: 'mattpocock/skills',
        description:
          'One-time repo setup for the engineering skills: issue tracker, triage label vocabulary, domain doc layout.',
        installs: '996.1K',
      },
    ],
  },
  {
    title: 'Agents & tooling',
    hue: '#f97316',
    skills: [
      {
        name: 'find-skills',
        repo: 'vercel-labs/skills',
        description:
          'Discover and install agent skills when you ask "is there a skill that can…".',
        installs: '3.8M',
      },
      {
        name: 'agent-browser',
        repo: 'vercel-labs/agent-browser',
        description:
          'Browser automation CLI for AI agents: navigate, fill forms, click, screenshot.',
        installs: '1.1M',
      },
    ],
  },
  {
    title: 'Video & motion graphics',
    hue: '#f87171',
    skills: [
      {
        name: 'hyperframes',
        repo: 'heygen-com/hyperframes',
        description:
          'Mandatory entry point for any request to make, edit, animate or render a video or motion graphic.',
        installs: '954.6K',
        installed: true,
      },
      {
        name: 'hyperframes-cli',
        repo: 'heygen-com/hyperframes',
        description:
          'The HyperFrames CLI loop: init, add, catalog, capture, lint, snapshot, preview, render.',
        installs: '997.9K',
      },
      {
        name: 'hyperframes-animation',
        repo: 'heygen-com/hyperframes',
        description:
          'Atomic motion rules, multi-phase scene blueprints and transitions for HyperFrames.',
        installs: '847.1K',
      },
      {
        name: 'media-use',
        repo: 'heygen-com/hyperframes',
        description:
          'Resolve BGM, SFX, images, icons, logos, voice and colour grades into a frozen local file or paste-ready block.',
        installs: '876.5K',
      },
    ],
  },
  {
    title: 'Mobile',
    hue: '#60a5fa',
    skills: [
      {
        name: 'design-mobile-apps',
        repo: 'designed-by-ai/skills',
        description:
          'Design mobile app screens, edit the projects, then implement the designs in React Native or HTML.',
        installs: '799.3K',
      },
    ],
  },
]

export const SKILL_COUNT = SKILL_GROUPS.reduce(
  (total, group) => total + group.skills.length,
  0,
)

export const INSTALLED_COUNT = SKILL_GROUPS.reduce(
  (total, group) =>
    total + group.skills.filter((skill) => skill.installed).length,
  0,
)
