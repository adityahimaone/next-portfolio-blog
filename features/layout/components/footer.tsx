import Link from 'next/link'
import { FOOTER_NAVIGATION, SOCIAL_LINKS } from '../constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-border bg-background text-foreground border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)] lg:items-end">
          <section aria-labelledby="footer-contact-title">
            <p className="text-primary-dark dark:text-primary mb-4 font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold tracking-[0.12em] uppercase">
              Open channel
            </p>
            <h2
              id="footer-contact-title"
              className="max-w-3xl font-[family-name:var(--font-space-grotesk)] text-[clamp(2rem,5vw,4.5rem)] leading-[0.98] font-semibold tracking-[-0.055em] text-balance"
            >
              Have a project or role in mind?
            </h2>
            <a
              href="mailto:adityahimaone@gmail.com"
              className="border-primary text-foreground hover:text-primary-dark dark:hover:text-primary mt-6 inline-flex min-h-11 max-w-full items-center border-b pb-1 text-base font-medium break-all transition-colors sm:text-xl"
            >
              adityahimaone@gmail.com
            </a>
          </section>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            <nav
              className="flex flex-wrap gap-x-5 gap-y-1"
              aria-label="Footer navigation"
            >
              {FOOTER_NAVIGATION.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <nav
              className="flex flex-wrap gap-x-5 gap-y-1"
              aria-label="Social links"
            >
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={
                    link.href.startsWith('mailto:') ? undefined : '_blank'
                  }
                  rel={
                    link.href.startsWith('mailto:')
                      ? undefined
                      : 'noopener noreferrer'
                  }
                  className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center text-sm font-medium transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-border text-muted-foreground mt-14 flex flex-col gap-4 border-t pt-5 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.08em] uppercase sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>© {currentYear} Aditya Himawan</span>
            <span>Frontend engineer, Jakarta</span>
          </div>
          <a
            href="#top"
            className="text-foreground hover:text-primary-dark dark:hover:text-primary inline-flex min-h-11 w-fit items-center font-semibold transition-colors"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  )
}
