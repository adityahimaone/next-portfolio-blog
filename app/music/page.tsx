import { MusicPageView } from '@/features/mixtape/views/music-page'

export const metadata = {
  title: 'Mixtape',
  description:
    'An interactive archive of coding playlists and audio experiments.',
  alternates: { canonical: '/music' },
}

export default function MusicPage() {
  return <MusicPageView />
}
