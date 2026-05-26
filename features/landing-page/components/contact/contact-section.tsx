'use client'

/**
 * Track 06 — Encore & Backstage Pass.
 *
 * Show concludes; user is invited backstage. UI narrows into a VIP
 * lanyard / access badge. Submit triggers a brief stage-flash + a
 * "see you on the next tour" confirmation. Plain mailto for now.
 */
import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Mail, Github, Linkedin, ArrowUpRight } from 'lucide-react'
import { TrackSection } from '@/components/track-section'
import { SOCIAL_LINKS } from '@/features/layout/constants'

export function ContactSection() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [flash, setFlash] = useState(false)
  const prefersReduced = useReducedMotion()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !message) return
    setFlash(true)
    setTimeout(() => setFlash(false), 600)
    // Plain mailto — no backend setup required
    const subject = `Backstage Pass — ${name || 'Anonymous'}`
    const body = `${message}\n\n— ${name || 'Anonymous'} (${email})`
    window.location.href = `mailto:adityahimaone@gmail.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <TrackSection
      trackNumber="06"
      id="contact"
      title="Encore"
      subtitle="The lights stay on a moment longer. Want to talk shop, or book the next gig?"
    >
      {/* Stage flash overlay */}
      <AnimatePresence>
        {flash && !prefersReduced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none fixed inset-0 z-50 bg-white"
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Backstage Pass Lanyard */}
        <aside className="lg:col-span-5">
          <div className="console-card relative mx-auto max-w-sm overflow-hidden">
            {/* Lanyard cord */}
            <div className="mx-auto h-16 w-2 -mb-2 bg-gradient-to-b from-accent/60 to-accent" />
            <div className="mx-auto h-3 w-8 rounded-sm bg-elevated border border-edge" />

            {/* Pass body */}
            <div className="m-3 border-2 border-accent/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="meta-label text-accent">VIP // ALL ACCESS</span>
                <span className="led-dot led-dot--green" aria-hidden="true" />
              </div>
              <div className="display-heading text-3xl">BACKSTAGE</div>
              <div className="display-heading text-3xl text-accent">PASS</div>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex items-baseline justify-between border-b border-dashed border-edge pb-2">
                  <dt className="meta-label">Holder</dt>
                  <dd className="font-mono text-text-main">Aditya Himaone</dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-dashed border-edge pb-2">
                  <dt className="meta-label">Crew</dt>
                  <dd className="font-mono text-text-main">Frontend</dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-dashed border-edge pb-2">
                  <dt className="meta-label">Venue</dt>
                  <dd className="font-mono text-text-main">Jakarta, ID</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="meta-label">Status</dt>
                  <dd className="font-mono text-accent-alt">OPEN</dd>
                </div>
              </dl>

              {/* Barcode strip */}
              <div className="mt-6 flex items-end gap-px">
                {Array.from({ length: 32 }).map((_, i) => (
                  <span
                    key={i}
                    className="bg-text-main"
                    style={{
                      width: '2px',
                      height: `${10 + ((i * 7) % 20)}px`,
                      opacity: 0.5 + ((i * 11) % 5) / 10,
                    }}
                  />
                ))}
              </div>
              <div className="meta-label mt-2 text-text-dim">
                ID 042 · TOUR &lsquo;26
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-6 grid grid-cols-2 gap-2">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-sm border border-edge px-3 py-2.5 text-sm transition-all hover:border-accent hover:bg-elevated/40"
              >
                <span className="font-mono text-xs tracking-widest text-text-muted group-hover:text-accent">
                  {link.name.toUpperCase()}
                </span>
                <ArrowUpRight
                  size={14}
                  className="text-text-dim group-hover:text-accent"
                />
              </a>
            ))}
          </div>
        </aside>

        {/* Access Request form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="console-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-edge px-5 py-3">
              <span className="meta-label">ACCESS REQUEST FORM</span>
              <span className="led-dot" aria-hidden="true" />
            </div>

            <div className="space-y-5 p-5 md:p-6">
              <Field
                label="Name"
                name="name"
                value={name}
                onChange={setName}
                placeholder="What should I call you?"
              />
              <Field
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@somewhere.cool"
                required
              />
              <Field
                label="Message"
                name="message"
                multiline
                value={message}
                onChange={setMessage}
                placeholder="What&rsquo;s the gig?"
                required
              />

              <div className="flex flex-col gap-3 border-t border-edge pt-5 md:flex-row md:items-center md:justify-between">
                <p className="meta-label">
                  This opens your mail client. No tracking.
                </p>
                <button
                  type="submit"
                  className="group flex items-center justify-center gap-2 rounded-sm border border-accent bg-accent/10 px-6 py-2.5 font-mono text-sm tracking-widest text-accent transition-all hover:bg-accent hover:text-white focus-visible:bg-accent focus-visible:text-white"
                >
                  <Mail size={14} />
                  REQUEST ENCORE
                </button>
              </div>

              {sent && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-sm border border-accent-alt/40 bg-accent-alt/10 px-3 py-2 text-sm text-accent-alt"
                >
                  Mail client launched. See you on the next tour.
                </motion.p>
              )}
            </div>
          </form>
        </div>
      </div>
    </TrackSection>
  )
}

interface FieldProps {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  multiline?: boolean
  required?: boolean
}

function Field({ label, name, value, onChange, placeholder, type, multiline, required }: FieldProps) {
  const baseClass =
    'mt-1.5 w-full rounded-sm border border-edge bg-base/60 px-3 py-2.5 font-mono text-sm text-text-main placeholder:text-text-dim transition-colors focus:border-accent focus:outline-none'
  return (
    <label className="block">
      <span className="meta-label flex items-center gap-2">
        <span className="text-accent">›</span> {label}
        {required && <span className="text-accent">*</span>}
      </span>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={4}
          className={`${baseClass} resize-y`}
        />
      ) : (
        <input
          type={type ?? 'text'}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={baseClass}
        />
      )}
    </label>
  )
}
