/**
 * The footer's outbound links.
 *
 * Kept separate from the dock's `NAV_ITEMS` because these are destinations
 * off-site, not routes — there is no icon, no active state and no
 * `isActiveNavItem` check. The mail link is `mailto:` rather than a plain
 * address so it is a real link and gets keyboard focus.
 */
export const SOCIAL_LINKS = [
  { name: 'GitHub', href: 'https://github.com/adityahimaone' },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/adityahimaone' },
  {
    name: 'Spotify',
    href: 'https://open.spotify.com/user/212nmrqpklzmvpntgorzpavgq',
  },
  { name: 'Email', href: 'mailto:adityahimaone@gmail.com' },
] as const
