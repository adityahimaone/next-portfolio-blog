import type { Note } from '../types'

/**
 * Side A of the liner notes: seven entries, curated rather than chronological.
 * Dates run backwards and forwards on purpose — this is a tracklist, and a
 * tracklist is sequenced for listening.
 */
export const NOTES: Note[] = [
  {
    id: 'note-thirty-dead-components',
    slug: 'thirty-dead-components',
    order: 1,
    title: 'Thirty dead components and the rebuild that fixed it',
    excerpt:
      'A hero-2025-v2.tsx, one data.ts holding the whole site together, and thirty components nothing imported. The rebuild was less about looks and more about paying off debt.',
    publishedAt: '2026-04-15',
    duration: '8:12',
    readingMinutes: 8,
    tags: ['Architecture', 'Tailwind'],
    lead: true,
    updatedAt: '2026-10-01',
    body: [
      {
        type: 'paragraph',
        text: 'The old portfolio had thirty components that nothing imported. Not abandoned experiments in a branch — files sitting in the same directory as the hero, compiled by the same build, type-checked on every commit, referenced by no one. I found them by asking the bundler instead of my memory: a small script that walked every module graph and printed the leaves nothing pointed at.',
      },
      {
        type: 'paragraph',
        text: 'That number is not unusual. What made it a problem was that six of those components still looked current. The site had three generations of the same idea living side by side, all plausible, one of them actually mounted. Every change meant first working out which generation I was in.',
      },
      { type: 'heading', text: 'The problem' },
      {
        type: 'paragraph',
        text: 'A portfolio is not a museum. If a component does not earn its place, it is weight — and the interest on that weight is paid every time you open the folder. The rebuild had two rules. One: the content layer is typed and the UI cannot invent fields. Two: if a screen cannot be rendered from that content layer alone, the content layer is wrong.',
      },
      {
        type: 'list',
        items: [
          'Every route renders from a single typed source, with no local constants in components.',
          'Motion is a layer over a static, correct page — not a precondition for seeing anything.',
          'Anything interactive is keyboard-reachable and works with JavaScript still loading.',
        ],
      },
      { type: 'heading', text: 'What changed' },
      {
        type: 'paragraph',
        text: 'The content layer went first, because it was the only part that could be wrong without looking wrong. Projects, notes and tracks became three interfaces and one mock adapter — the same shape a CMS would hand back. Components stopped importing data files and started receiving props, which made the dead ones obvious: a component with no caller in a prop-typed tree is a compile error waiting to be noticed, not a mystery.',
      },
      {
        type: 'code',
        language: 'tsx',
        code: `export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const note = await cms.getNote(slug)
  if (!note) notFound()

  return <NoteReader note={note} />
}`,
      },
      {
        type: 'paragraph',
        text: 'Then the home page. Three movements instead of nine sections: an instrument, a shelf, a tracklist. The audio player moved into the root layout so that navigating between them does not cut the sound — which sounds like a detail until you try the other version and the site stutters every time you click a link.',
      },
      {
        type: 'quote',
        text: 'The test I kept applying: can I delete this and lose nothing a visitor would notice? Most of the time the answer was yes, and the site got faster.',
      },
      { type: 'heading', text: 'What it cost' },
      {
        type: 'paragraph',
        text: 'Two weekends, and about four hundred lines of CSS that had been load-bearing for years. Deleting a component is easy; deleting the rule that makes the rest of the page line up is the part that takes nerve. The trick was moving the shared behaviour into tokens first — spacing, radii, the glass material — and only then removing the per-component overrides that duplicated them.',
      },
      {
        type: 'paragraph',
        text: 'The measurable result: the client bundle lost a third of its JavaScript, the largest contentful paint came down from 2.4s to 1.1s on a throttled phone, and the number of files I have to open to change a headline went from seven to two.',
      },
      { type: 'heading', text: 'Side notes' },
      {
        type: 'list',
        items: [
          'A design system is a promise about what you will not re-decide. If you re-decide it per component, it is a palette, not a system.',
          'Keep the motion library out of the critical path. A page that cannot render without GSAP is a page that cannot render.',
          'Write the copy before the layout. Layout invented around placeholder text is layout invented for the wrong thing.',
        ],
      },
    ],
  },
  {
    id: 'note-9router',
    slug: '9router',
    order: 2,
    title: '9Router: One Gateway to 60+ AI Providers',
    excerpt:
      'One compatible endpoint, sixty providers, three-tier fallback. What was actually hard about routing model traffic.',
    publishedAt: '2026-05-05',
    duration: '11:40',
    readingMinutes: 11,
    tags: ['Devtools'],
    body: [
      {
        type: 'paragraph',
        text: 'Every provider ships an OpenAI-compatible endpoint now, which means the protocol translation part of a gateway is a solved problem and takes an afternoon. The part that takes a month is deciding what to do when a provider is technically up and practically useless.',
      },
      { type: 'heading', text: 'Fallback is a product decision' },
      {
        type: 'paragraph',
        text: 'The first version retried on error. That is the obvious behaviour and it is wrong about half the time: a stream that dies at token 300 has already been read by a human, and silently restarting it on another provider produces a paragraph that repeats itself. So the rule became tier-based — retry within the provider while nothing has been emitted, then move to a peer model, then queue.',
      },
      {
        type: 'list',
        items: [
          'Tier one: transient failure before the first token. Retry in place, invisible to the client.',
          'Tier two: failure after output. Switch models, keep the stream open, and mark the seam.',
          'Tier three: every candidate is degraded. Accept the request, queue it, return a ticket.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Preserving one continuous stream across a model switch is the detail that made this worth building. The client sees a single response; the server knows it was two models; the log says which and why. Nobody has to guess later.',
      },
      {
        type: 'quote',
        text: 'A fallback that cannot explain itself is indistinguishable from a bug that keeps working.',
      },
      { type: 'heading', text: 'Cost ceilings in the routing table' },
      {
        type: 'paragraph',
        text: 'Routing rules are data, not code: a key, a model pattern, a provider allowlist and a ceiling. Editing them is a form submission rather than a deploy, which is the difference between responding to a provider outage in a minute and responding to it tomorrow.',
      },
    ],
  },
  {
    id: 'note-frontend-2026',
    slug: 'frontend-2026',
    order: 3,
    title: 'Frontend Development in 2026 — What Changed',
    excerpt:
      'RSC won, the bundler wars cooled, AI moved into the editor, and the interesting work moved to the boundaries.',
    publishedAt: '2026-01-10',
    duration: '7:24',
    readingMinutes: 7,
    tags: ['React', 'Trends'],
    body: [
      {
        type: 'paragraph',
        text: 'Three years ago the question was which framework. This year the question is where the boundary sits in the one you already have. React Server Components stopped being a novelty and became the default mental model, which moved the hard part of the job from "how do I manage state" to "which side of this line does this decision belong on".',
      },
      { type: 'heading', text: 'The boundary became the craft' },
      {
        type: 'paragraph',
        text: 'A server component cannot hold an event handler, so anything interactive defines a client island. Done carelessly you get a page that ships half its tree twice and hydrates a wrapper for no reason. Done well you get a page whose JavaScript is a handful of genuinely interactive leaves — a player, a filter, a menu.',
      },
      {
        type: 'list',
        items: [
          'Data fetching moved up; interaction moved down. The middle layer got thinner.',
          'Streaming made skeletons optional for content and mandatory for chrome.',
          'The bundler wars cooled into one default per framework, which is fine — it was never the interesting decision.',
        ],
      },
      {
        type: 'paragraph',
        text: 'AI in the editor is the change I have the most mixed feelings about. It is genuinely good at the mechanical parts: renames, type errors, a hundred lines of CSS that follow a pattern I just established. It is consistently bad at the decision that makes an interface feel considered, because that decision is a matter of taste and taste is budgeted attention.',
      },
      {
        type: 'quote',
        text: 'The models got good at writing the component. Nobody got out of deciding whether the component should exist.',
      },
    ],
  },
  {
    id: 'note-vps-deploy',
    slug: 'vps-deploy-nextjs',
    order: 4,
    title: 'Deploying Next.js to a VPS with Nginx, PM2 & TLS',
    excerpt:
      'From a bare droplet to a paid domain that actually serves. The parts of the guide that are usually missing.',
    publishedAt: '2025-12-02',
    duration: '14:06',
    readingMinutes: 14,
    tags: ['Infra', 'Devops'],
    body: [
      {
        type: 'paragraph',
        text: 'Platform deploys are cheap until the bill is not, and a VPS with 1.9GB of memory will happily run this entire site for the price of a coffee. What follows is the configuration that survived a year of it, including the two places where the standard advice is wrong.',
      },
      { type: 'heading', text: 'Build on the machine, carefully' },
      {
        type: 'paragraph',
        text: 'The first thing that breaks on a small host is not traffic — it is the build. Next fans static generation across workers by default, which peaks resident memory well above what a 1.9GB box has, and the kernel answers with a swap death spiral. Pinning the worker count and the generation concurrency trades a little build time for a build that fits.',
      },
      {
        type: 'code',
        language: 'js',
        code: `experimental: {
  cpus: 1,
  staticGenerationMaxConcurrency: 2,
}`,
      },
      { type: 'heading', text: 'PM2 or the standalone bundle' },
      {
        type: 'paragraph',
        text: 'Here is the trap: `next start` and `output: "standalone"` are mutually incompatible. Setting standalone and keeping a PM2 config pointed at `npm start` produces a crash loop that looks like a memory problem and is a configuration problem. Either point PM2 at `.next/standalone/server.js`, or leave standalone off.',
      },
      {
        type: 'list',
        items: [
          'Nginx terminates TLS and proxies to the loopback port; the app never sees the internet.',
          'Certbot renews with a deploy hook that reloads Nginx, not the app.',
          'Health checks belong on a route that is not cached.',
        ],
      },
      {
        type: 'quote',
        text: 'The failure mode of a self-hosted site is almost never traffic. It is memory, disk, or a certificate that silently expired in March.',
      },
      {
        type: 'paragraph',
        text: 'Everything else — the reverse proxy block, the gzip settings, the cache headers for the immutable asset directory — is copywork. The decisions above are the ones that cost an evening each if you get them wrong, so they are the ones worth writing down.',
      },
    ],
  },
  {
    id: 'note-obsidian-syncthing',
    slug: 'obsidian-syncthing',
    order: 5,
    title: 'Most Powerful Free Notes: Obsidian + Syncthing',
    excerpt:
      'A notes system that syncs itself and never asks for a subscription. Plain files, one mesh, no lock-in.',
    publishedAt: '2026-02-18',
    duration: '6:18',
    readingMinutes: 6,
    tags: ['Tools', 'PKM'],
    body: [
      {
        type: 'paragraph',
        text: 'My notes are markdown files in a folder. That is the entire architecture, and it is the reason the system has outlived every app I have tried. Obsidian is the editor on top; Syncthing is the transport underneath; neither one owns the files.',
      },
      { type: 'heading', text: 'Why a mesh instead of a cloud' },
      {
        type: 'paragraph',
        text: 'Syncthing syncs directly between devices, which means a laptop and a phone converge without a server in the middle. On a local network it is instant. On mobile it is the one part you have to be deliberate about — background sync is the price of not paying a subscription, so the phone syncs on the charger, on wifi, overnight.',
      },
      {
        type: 'list',
        items: [
          'One folder, versioned by git, mirrored to a VPS for the offsite copy.',
          'Conflicts are files, not dialogs — a sync conflict produces a duplicate you can diff.',
          'The search index is local, so typing never waits for a network.',
        ],
      },
      {
        type: 'paragraph',
        text: 'The habit that makes it work is a daily note that is allowed to be ugly. Structure added later is structure that gets used; structure added up front is a form to fill in, and forms get abandoned by the second week.',
      },
    ],
  },
  {
    id: 'note-tailscale',
    slug: 'tailscale',
    order: 6,
    title: 'Tailscale: Access Any Device, Anywhere',
    excerpt:
      'A flat network across laptops, phones and servers in four commands. What it replaces, and when it is the wrong tool.',
    publishedAt: '2026-03-09',
    duration: '5:44',
    readingMinutes: 5,
    tags: ['Network'],
    body: [
      {
        type: 'paragraph',
        text: 'The problem it solves is mundane and constant: the database on the VPS is bound to loopback for good reasons, and I want to query it from a café. The old answers were an SSH tunnel remembered by nobody, or opening a port and hoping. Tailscale makes every device a peer on one flat network and then gets out of the way.',
      },
      {
        type: 'code',
        language: 'bash',
        code: `curl -fsSL https://tailscale.com/install.sh | sh
tailscale up --ssh
tailscale status
tailscale ip -4`,
      },
      { type: 'heading', text: 'Where it is genuinely better than a VPN' },
      {
        type: 'paragraph',
        text: 'NAT traversal means it works from hotel wifi and mobile networks without a public ingress. MagicDNS means I type `vps` instead of an address. Access rules are expressed per user and per tag in one policy file, which is auditably better than a shared WireGuard config passed around in a chat.',
      },
      {
        type: 'paragraph',
        text: 'Where it is the wrong tool: anything public. Do not put a marketing site on a tailnet and call it deployed. It is for the surfaces that should never have been on the internet in the first place — dashboards, databases, the admin half of an app.',
      },
      {
        type: 'quote',
        text: 'The best security change I made last year was deleting four open ports and replacing them with one private network.',
      },
    ],
  },
  {
    id: 'note-vps-monitoring',
    slug: 'vps-monitoring',
    order: 7,
    title: 'VPS Monitoring with Grafana, Prometheus & Blackbox',
    excerpt:
      'Dashboards, probes and alerts that page you before users do. A small stack that fits next to the app.',
    publishedAt: '2026-04-27',
    duration: '12:31',
    readingMinutes: 12,
    tags: ['Observability'],
    body: [
      {
        type: 'paragraph',
        text: 'Monitoring a single VPS with a full observability stack is overkill until the first time the site is down and you find out from a stranger. The version below runs in about 300MB next to the app, which is affordable on the same box it watches — as long as you accept the obvious caveat: a monitor on the machine it monitors cannot tell you the machine is gone.',
      },
      { type: 'heading', text: 'Three layers, in order of usefulness' },
      {
        type: 'list',
        items: [
          'Blackbox exporter: is the public URL answering with a 200 and a valid certificate? This catches almost everything users notice.',
          'Node exporter: memory, disk, load. On a small host, disk and memory are 90% of incidents.',
          'Application metrics: request rate, error rate, p95 latency — the numbers that explain a slow page rather than a dead one.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Alerts go out from Alertmanager to a webhook, and the rule that keeps them useful is the same as anywhere else: every alert must have an action attached. If the correct response to a page is "wait", it is not an alert, it is a graph.',
      },
      {
        type: 'code',
        language: 'yaml',
        code: `groups:
  - name: public
    rules:
      - alert: SiteDown
        expr: probe_success{job="blackbox"} == 0
        for: 2m
        labels: { severity: page }
        annotations:
          summary: "Public endpoint failing for 2 minutes"`,
      },
      {
        type: 'paragraph',
        text: 'The last piece is the certificate. It expires whether or not anyone is watching, and a blackbox probe with a TLS check turns a silent March outage into a two-week warning. That single probe has paid for the entire stack twice.',
      },
      {
        type: 'quote',
        text: 'Dashboards are for understanding. Alerts are for interrupting. Mixing them produces a channel everyone mutes.',
      },
    ],
  },
]
