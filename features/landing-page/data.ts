export type WorkExperience = {
  company: string
  title: string
  start: string
  end: string
  link: string
  id: string
}

export type SocialLink = {
  label: string
  link: string
}

export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    company: 'Reglazed Studio',
    title: 'CEO',
    start: '2024',
    end: 'Present',
    link: 'https://ibelick.com',
    id: 'work1',
  },
  {
    company: 'Freelance',
    title: 'Design Engineer',
    start: '2022',
    end: '2024',
    link: 'https://ibelick.com',
    id: 'work2',
  },
  {
    company: 'Freelance',
    title: 'Front-end Developer',
    start: '2017',
    end: 'Present',
    link: 'https://ibelick.com',
    id: 'work3',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'Github',
    link: 'https://github.com/adityahimaone',
  },
  {
    label: 'Twitter',
    link: 'https://twitter.com/adityahimaone',
  },
  {
    label: 'LinkedIn',
    link: 'https://www.linkedin.com/in/adityahimaone',
  },
  {
    label: 'Instagram',
    link: 'https://www.instagram.com/adityahimaone',
  },
]

export const EMAIL = 'adityahimaone@gmail.com'
