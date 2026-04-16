import {
  Globe,
  Code,
  Zap,
  Cpu,
  Database,
  Layers,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────
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

export interface ExperienceItem {
  readonly id: number
  readonly role: string
  readonly type: string
  readonly company: string
  readonly location: string
  readonly period: string
  readonly color: string
  readonly description?: readonly string[]
  readonly isGroup?: boolean
  readonly items?: readonly {
    readonly role: string
    readonly period: string
    readonly company: string
    readonly description: string
  }[]
}

export interface MixerGroup {
  readonly id: string
  readonly label: string
  readonly type: string
  readonly channels: readonly { readonly name: string; readonly level: number }[]
}

export interface ProjectShowcaseItem {
  readonly id: number
  readonly title: string
  readonly description: string
  readonly image: string
  readonly url: string
  readonly genre?: string
  readonly year?: string
  readonly vinylColor: string
  readonly vinylIcon: LucideIcon
}

// ─── Work Experience ─────────────────────────────────────
export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    company: 'Reglazed Studio',
    title: 'CEO',
    start: '2024',
    end: 'Present',
    link: 'https://reglazedstudio.com',
    id: 'work1',
  },
  {
    company: 'Freelance',
    title: 'Design Engineer',
    start: '2022',
    end: '2024',
    link: 'https://adityahimaone.tech',
    id: 'work2',
  },
  {
    company: 'Freelance',
    title: 'Front-end Developer',
    start: '2017',
    end: 'Present',
    link: 'https://adityahimaone.tech',
    id: 'work3',
  },
]

export const SOCIAL_LINKS_LANDING: SocialLink[] = [
  { label: 'Github', link: 'https://github.com/adityahimaone' },
  { label: 'Twitter', link: 'https://twitter.com/adityahimaone' },
  { label: 'LinkedIn', link: 'https://www.linkedin.com/in/adityahimaone' },
  { label: 'Instagram', link: 'https://www.instagram.com/adityahimaone' },
]

export const EMAIL = 'adityahimaone@gmail.com'

// ─── Experience Section ──────────────────────────────────
export const EXPERIENCES: readonly ExperienceItem[] = [
  {
    id: 1,
    role: 'Frontend Developer',
    type: 'Full Time',
    company: 'Fast 8 People Hub',
    location: 'Jakarta, Indonesia',
    period: 'OCT 2022 - PRESENT',
    color: 'bg-purple-500',
    description: [
      'Led the development of "Bisadaya" job-seeking platform serving thousands of users.',
      'Architected an automated KPI tracking system with interactive dashboards.',
      'Executed critical maintenance tasks and bug fixes across legacy and modern codebases.',
    ],
  },
  {
    id: 2,
    role: 'Frontend Developer',
    type: 'Part Time',
    company: '80&Company',
    location: 'Kyoto, Japan (Remote)',
    period: 'APR 2024 - SEP 2024',
    color: 'bg-blue-500',
    description: [
      'Spearheaded the development of a innovative Workforce Management System incorporating blockchain technology.',
      'Maintained the application, resolving critical bugs to improve system reliability.',
      'Collaborated with the design team to create a user-friendly interface.',
    ],
  },
  {
    id: 3,
    role: 'Frontend Developer',
    type: 'Full Time',
    company: 'Unzypsoft',
    location: 'Jakarta, Indonesia',
    period: 'JUN 2022 - AUG 2024',
    color: 'bg-pink-500',
    description: [
      'Collaborated on BSN e-commerce platform frontend using ReactJS.',
      'Developed a dynamic NFT protocol interface with ReactJS and Tailwind CSS.',
      'Created reusable components that boosted development efficiency.',
    ],
  },
  {
    id: 4,
    role: 'Vocational Courses',
    type: 'Education',
    company: 'Various Academies',
    location: 'Online',
    period: '2021 - 2022',
    color: 'bg-orange-500',
    isGroup: true,
    items: [
      {
        role: 'Frontend Developer',
        period: 'FEB 2022 - JUL 2022',
        company: 'Binar Academy',
        description:
          'Developed a car booking frontend using NodeJS, EJS, ReactJS, and NextJS.',
      },
      {
        role: 'Fullstack Engineering',
        period: 'AUG 2021 - JAN 2022',
        company: 'Alterra Academy',
        description:
          'Built a Calories Tracker & Hospital Management System with Golang and ReactJS.',
      },
      {
        role: 'Cloud Computing',
        period: 'FEB 2021 - JUL 2021',
        company: 'Bangkit Academy',
        description:
          'Capstone project: Machine learning app for calorie estimation deployed on Google Cloud.',
      },
    ],
  },
] as const

// ─── Skills Mixer ────────────────────────────────────────
export const MIXER_DATA: readonly MixerGroup[] = [
  {
    id: 'languages',
    label: 'LANGUAGES',
    type: 'fader',
    channels: [
      { name: 'HTML', level: 95 },
      { name: 'CSS', level: 95 },
      { name: 'JS', level: 95 },
      { name: 'TS', level: 90 },
      { name: 'GO', level: 60 },
      { name: 'SWIFT', level: 50 },
    ],
  },
  {
    id: 'frameworks',
    label: 'FRAMEWORKS',
    type: 'knob',
    channels: [
      { name: 'REACT', level: 95 },
      { name: 'NEXT', level: 92 },
      { name: 'REMIX', level: 70 },
      { name: 'JQUERY', level: 85 },
    ],
  },
  {
    id: 'tools',
    label: 'TOOLS & FX',
    type: 'knob',
    channels: [
      { name: 'VS CODE', level: 99 },
      { name: 'FIGMA', level: 85 },
      { name: 'GIT', level: 90 },
      { name: 'MOTION', level: 90 },
    ],
  },
] as const

// ─── Projects Showcase (Landing Section) ─────────────────
export const PROJECTS_SHOWCASE: ProjectShowcaseItem[] = [
  {
    id: 1,
    title: 'Primarindo Asia',
    description:
      'Company profile for Primarindo Asia Infrastructure Tbk, a manufacturer specializing in shoe production. The website showcases their manufacturing capabilities, product lines, and corporate information.',
    image: '/assets/primarindo.png',
    url: 'https://primarindo.niqcode.com/',
    genre: 'Corporate / Manufacturing',
    year: '2024',
    vinylColor: 'from-blue-600 to-cyan-500',
    vinylIcon: Globe,
  },
  {
    id: 2,
    title: 'Frontend Resources',
    description:
      'A curated collection of the best frontend development tools, libraries, and inspiration sources to supercharge your web development workflow.',
    image: '/assets/frontend-resources.png',
    url: 'https://frontend-resources-rouge.vercel.app/',
    genre: 'Educational / Tools',
    year: '2023',
    vinylColor: 'from-yellow-500 to-orange-500',
    vinylIcon: Code,
  },
  {
    id: 3,
    title: 'Quick Chat Whatsapp',
    description:
      "A utility app that lets users send WhatsApp messages without saving the recipient's phone number. Simplifies communication by eliminating the need to create contacts for one-time conversations.",
    image: '/assets/quick-chat-wa.png',
    url: 'http://quick-chat-whatsapp.vercel.app/',
    genre: 'Utility / Productivity',
    year: '2023',
    vinylColor: 'from-green-500 to-emerald-500',
    vinylIcon: Zap,
  },
  {
    id: 4,
    title: 'SeaPhantom',
    description:
      'Landing page for SeaPhantom, an NFT project focusing on innovative and sustainable technologies. Explore the world of NFTs and peer-to-peer trading on the SeaPhantom platform.',
    image:
      'https://res.cloudinary.com/deselamak/image/upload/v1699777135/portofolio/y2l1g36bjudgsf6yr0eg.webp',
    url: 'https://seaphantom.com',
    genre: 'Web3 / NFT',
    year: '2022',
    vinylColor: 'from-purple-600 to-pink-600',
    vinylIcon: Cpu,
  },
  {
    id: 5,
    title: 'SeaPhantom P2P',
    description:
      'Engage in NFT trading with the P2P Rum Token Escrow Trading project. This platform facilitates secure and transparent NFT transactions.',
    image:
      'https://res.cloudinary.com/deselamak/image/upload/v1699777135/portofolio/fphb7ddemp4ixeutav1b.webp',
    url: 'https://auth.seaphantom.com/',
    genre: 'DeFi / Trading',
    year: '2022',
    vinylColor: 'from-indigo-600 to-violet-600',
    vinylIcon: Database,
  },
  {
    id: 6,
    title: 'Labgrownbeasts',
    description:
      'Explore the Labgrownbeasts Company Profile, showcasing innovation and excellence in the field. Learn about our vision, mission, and the cutting-edge work we do.',
    image:
      'https://res.cloudinary.com/deselamak/image/upload/v1699777135/portofolio/mqprcb6todunicq4cg0a.webp',
    url: 'https://labgrownbeasts.com/',
    genre: 'Biotech / Corporate',
    year: '2022',
    vinylColor: 'from-red-500 to-rose-500',
    vinylIcon: Layers,
  },
]
