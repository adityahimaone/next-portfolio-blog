'use client'

import { useState } from 'react'
import { StageLabel } from '@/components/ui'
import { Mail, Github, Linkedin, Twitter } from 'lucide-react'

const SOCIAL_LINKS = [
  { label: 'EMAIL', icon: Mail, href: 'mailto:adityahimawan@example.com', value: 'adit@example.com' },
  { label: 'GITHUB', icon: Github, href: 'https://github.com/adityahimawan', value: '@adityahimawan' },
  { label: 'LINKEDIN', icon: Linkedin, href: 'https://linkedin.com/in/adityahimawan', value: 'adityahimawan' },
  { label: 'TWITTER', icon: Twitter, href: 'https://twitter.com/adityahimawan', value: '@adityahimawan' },
]

export function ContactSection() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 1500)
  }

  return (
    <section
      id="contact"
      className="relative py-32 bg-black-true"
      data-stage-num="06"
      data-stage-name="SAVE"
    >
      <div className="container mx-auto max-w-4xl px-4">
        <StageLabel num="06" name="SAVE POINT" glowing />

        <div className="mt-8 grid gap-12 md:grid-cols-2">
          {/* Left: SAVE button */}
          <div className="flex flex-col items-center justify-center">
            <div className="mb-6 text-center">
              <h2 className="t-heading-l mb-4 text-white-bone">SAVE POINT</h2>
              <p className="t-body-m text-white-dim">
                Want to work together? Press SAVE to start the conversation.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="group relative flex h-32 w-32 items-center justify-center border-4 border-red bg-black-true transition-all hover:bg-red/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {/* Pulsing dot */}
              <div
                className="absolute inset-0 m-auto h-4 w-4 animate-pulse rounded-full bg-red"
                style={{ boxShadow: '0 0 12px #E10600, 0 0 24px #8A0400' }}
              />
              <span className="t-heading-m relative z-10 text-white-bone group-hover:text-red">
                {saving ? 'SAVING...' : saved ? 'SAVED!' : 'SAVE'}
              </span>
            </button>

            {saved && (
              <p className="t-hud-xs mt-4 animate-pulse text-green-400">
                ✓ GAME SAVED · CHECK YOUR EMAIL
              </p>
            )}
          </div>

          {/* Right: Social links */}
          <div>
            <h3 className="t-heading-s mb-4 text-white-dim">CONTACT METHODS</h3>
            <div className="space-y-3">
              {SOCIAL_LINKS.map(({ label, icon: Icon, href, value }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 border-2 border-gray bg-gray-deep p-4 transition-all hover:border-red"
                >
                  <Icon size={20} className="text-white-dim group-hover:text-red" />
                  <div className="flex-1">
                    <div className="t-hud-xs text-white-dim">{label}</div>
                    <div className="t-body-m text-white-bone group-hover:text-red">
                      {value}
                    </div>
                  </div>
                  <span className="t-hud-xs text-white-dim group-hover:text-red">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: GAME OVER credits */}
        <div className="mt-24 text-center">
          <p className="t-hud-xs text-white-dim">
            ─── GAME OVER ───
          </p>
          <p className="t-hud-xs mt-2 text-white-dim">
            © 2026 ADIT HIMAONE · MADE WITH ♥ IN JAKARTA
          </p>
        </div>
      </div>
    </section>
  )
}
