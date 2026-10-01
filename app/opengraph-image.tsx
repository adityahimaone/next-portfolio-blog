import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

/**
 * The homepage had no generated OG image. Its metadata pointed `openGraph.images`
 * and `twitter.images` at a ucarecdn hotlink — a third-party CDN holding the
 * most-shared asset on the site, outside version control and replaceable by
 * anyone with the URL. That is a single point of failure for every link to `/`.
 *
 * /projects and /blog/[slug] already generate their own, so this brings the root
 * in line: same 1200x630, same visual language, and it is served from
 * `/opengraph-image` alongside the rest.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          backgroundImage:
            'radial-gradient(circle at 25px 25px, #27272a 2px, transparent 0), radial-gradient(circle at 75px 75px, #27272a 2px, transparent 0)',
          backgroundSize: '100px 100px',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#273281',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            A
          </div>
          <span style={{ fontSize: '20px', color: '#a1a1aa', fontWeight: 500 }}>
            adityahimaone.space
          </span>
        </div>
        <h1
          style={{
            fontSize: '68px',
            fontWeight: 'bold',
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: '900px',
            marginBottom: '20px',
          }}
        >
          Aditya Himawan
        </h1>
        <p
          style={{
            fontSize: '28px',
            color: '#a1a1aa',
            maxWidth: '820px',
            marginBottom: '28px',
          }}
        >
          Frontend Engineer — React, Next.js and TypeScript for products used by
          15K+ people.
        </p>
        <div
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}
        >
          {['React', 'Next.js', 'TypeScript', 'Tailwind CSS'].map((tech) => (
            <span
              key={tech}
              style={{
                fontSize: '18px',
                color: '#a1a1aa',
                background: '#18181b',
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid #27272a',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
