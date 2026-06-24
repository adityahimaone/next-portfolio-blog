'use client'

import React, { useState, useEffect } from 'react'
import { motion, useMotionValue } from 'motion/react'
import {
  Sliders,
  PhoneCall,
  Radio,
  Send,
  ArrowRight,
  Music,
  Mail,
  Linkedin,
  Github,
  Instagram,
} from 'lucide-react'
import { Screw } from '@/components/screw'

// ----------------------------------------------------
// 1. DjBoothContact (Turntable Crossfader Form)
// ----------------------------------------------------
export function DjBoothContact() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitted'>('idle')

  const x = useMotionValue(0)
  const [statusText, setStatusText] = useState('LEFT: MONITOR')

  useEffect(() => {
    return x.on('change', (latest) => {
      setStatusText(latest > 100 ? 'RIGHT: BROADCAST' : 'LEFT: MONITOR')
    })
  }, [x])

  const handleDragEnd = () => {
    if (x.get() > 100) {
      // Trigger submission
      if (email && message) {
        setStatus('submitted')
      } else {
        alert('Please fill out your Email and Message first!')
        x.set(0)
      }
    } else {
      x.set(0)
    }
  }

  return (
    <div className="flex w-full flex-col items-center px-4 py-16">
      <div className="relative w-full max-w-3xl rounded-3xl border-4 border-zinc-700 bg-zinc-800 p-6 shadow-2xl">
        <h3 className="mb-6 text-center font-mono text-xs font-bold tracking-widest text-zinc-400 uppercase">
          DJ BOOTH COLLABORATION DESK
        </h3>

        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          {/* Left Deck: Info */}
          <div className="border-zinc-850 flex flex-col gap-4 rounded-2xl border bg-zinc-950 p-5 text-left font-mono text-xs">
            <span className="border-zinc-855 border-b pb-2 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              DECK A: TALENT
            </span>
            <div className="space-y-2 text-zinc-300">
              <div>
                <span className="font-bold text-zinc-500">ARTIST:</span> Aditya
                Himawan
              </div>
              <div>
                <span className="font-bold text-zinc-500">EMAIL :</span>{' '}
                adityahimaone@gmail.com
              </div>
              <div>
                <span className="font-bold text-zinc-500">STATUS:</span>{' '}
                ACCEPTING OFFERS
              </div>
            </div>
            {/* Spinning Vinyl plate decoration */}
            <div className="flex justify-center py-4">
              <div className="flex h-28 w-28 animate-spin items-center justify-center rounded-full border-4 border-zinc-800 bg-zinc-900">
                <div className="h-10 w-10 rounded-full border border-zinc-700 bg-zinc-800" />
              </div>
            </div>
          </div>

          {/* Right Deck: Contact Form */}
          <div className="border-zinc-855 flex flex-col gap-4 rounded-2xl border bg-zinc-950 p-5 text-left font-mono text-xs">
            <span className="border-zinc-855 border-b pb-2 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              DECK B: YOUR BRIEF
            </span>

            {status === 'submitted' ? (
              <div className="space-y-2 py-10 text-center">
                <span className="block text-sm font-bold text-emerald-400">
                  MESSAGE DISPATCHED!
                </span>
                <span className="text-zinc-500">
                  Crossfader engaged. We are live.
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500">EMAIL:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded border border-zinc-800 bg-zinc-900 p-2 text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="you@domain.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500">BRIEF NOTE:</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-none rounded border border-zinc-800 bg-zinc-900 p-2 text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="Hello Aditya, let's mix a project..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Crossfader control console */}
        {status !== 'submitted' && (
          <div className="mt-8 flex flex-col items-center gap-3 border-t border-zinc-700 pt-6">
            <span className="font-mono text-[9px] font-black tracking-widest text-zinc-500 uppercase">
              DRAG CROSSFADER TO THE RIGHT TO TRANSMIT BRIEF
            </span>

            <div className="border-zinc-855 relative flex h-8 w-44 items-center rounded-full border bg-zinc-950 px-1 shadow-inner">
              <div className="text-zinc-650 pointer-events-none absolute inset-0 flex items-center justify-between px-4 text-[9px]">
                <span>A</span>
                <span>B</span>
              </div>
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 120 }}
                dragElastic={0}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="relative z-10 flex h-6 w-10 cursor-grab items-center justify-center rounded-lg border border-zinc-400 bg-zinc-200 shadow-md active:cursor-grabbing"
              >
                <div className="bg-zinc-550 h-4 w-0.5" />
              </motion.div>
            </div>

            <div className="font-mono text-[9px] tracking-wider text-amber-500">
              {statusText}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ----------------------------------------------------
// 2. RadioCallInContact (Transmitter Panel)
// ----------------------------------------------------
export function RadioCallInContact() {
  const [callerName, setCallerName] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const triggerBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(800, ctx.currentTime) // 800Hz beep tone
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5) // fade out
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.5)
      }
    } catch (e) {
      console.warn('Synth beep unavailable:', e)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (callerName && message) {
      triggerBeep()
      setSubmitted(true)
    }
  }

  return (
    <div className="flex w-full flex-col items-center px-4 py-16">
      <div className="relative w-full max-w-md rounded-2xl border-4 border-zinc-950 bg-zinc-900 p-6 text-left shadow-2xl">
        {/* LCD monitor */}
        <div className="mb-6 space-y-1 rounded border border-zinc-800 bg-black p-4 font-mono text-xs text-amber-500 shadow-inner">
          <div className="flex justify-between border-b border-zinc-900 pb-1 text-[8px] font-black tracking-widest text-zinc-500 uppercase">
            <span>TRANSMITTER STATS</span>
            <span className="animate-pulse font-black text-red-500">
              LIVE TRANSMIT
            </span>
          </div>
          <div>FREQ: 88.5 FM // ANTENNA: SAT_LINK</div>
          <div>
            CALLER STATUS: {submitted ? 'DISPATCHED' : 'WAITING FOR TONE'}
          </div>
        </div>

        {submitted ? (
          <div className="space-y-2 py-8 text-center font-mono text-xs text-zinc-300">
            <span className="block text-sm font-bold tracking-widest text-amber-500 uppercase">
              BEEEEP... MESSAGE SENT!
            </span>
            <span className="text-[10px] text-zinc-500">
              Your message is now on the frequency path. Aditya will call you
              back.
            </span>
            <button
              onClick={() => {
                setSubmitted(false)
                setCallerName('')
                setMessage('')
              }}
              className="hover:bg-zinc-750 mt-4 cursor-pointer rounded bg-zinc-800 px-4 py-1.5 font-bold text-zinc-400 uppercase"
            >
              Reset Transmitter
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 font-mono text-xs text-zinc-300"
          >
            <div className="space-y-1">
              <label className="font-bold text-zinc-500 uppercase">
                CALLER ID (NAME):
              </label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="border-zinc-850 w-full rounded border bg-zinc-950 p-2.5 text-zinc-100 outline-none focus:border-zinc-700"
                placeholder="Caller name..."
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-zinc-500 uppercase">
                TRANSMIT BRIEF (MESSAGE):
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border-zinc-850 w-full resize-none rounded border bg-zinc-950 p-2.5 text-zinc-100 outline-none focus:border-zinc-700"
                placeholder="Leave your message after the tone..."
                required
              />
            </div>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-amber-500 py-3 font-black tracking-widest text-black uppercase transition-all hover:brightness-110 active:translate-y-px"
            >
              <Send size={12} /> ENGAGE TRANSMITTER
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ----------------------------------------------------
// 3. MixingBoardContact (Tactile Slider Channels)
// ----------------------------------------------------
export function MixingBoardContact() {
  const channels = [
    {
      label: 'EMAIL',
      icon: Mail,
      url: 'mailto:adityahimaone@gmail.com',
      desc: 'Direct Inbox',
    },
    {
      label: 'LINKEDIN',
      icon: Linkedin,
      url: 'https://linkedin.com/in/adityahimaone',
      desc: 'Professional Mix',
    },
    {
      label: 'GITHUB',
      icon: Github,
      url: 'https://github.com/adityahimaone',
      desc: 'Code Output',
    },
    {
      label: 'INSTAGRAM',
      icon: Instagram,
      url: 'https://instagram.com/adityahimaone',
      desc: 'Frequency Social',
    },
  ]

  const [activeChannel, setActiveChannel] = useState<string | null>(null)

  // Track slider travel
  // In Framer Motion, dragging up reduces y (negative). Max travel is -120px
  const handleDrag = (label: string, yVal: number, url: string) => {
    // If pulled close to top (less than -100px)
    if (yVal < -100) {
      if (activeChannel !== label) {
        setActiveChannel(label)
        // Delay slightly for LED blink before redirecting
        setTimeout(() => {
          window.open(url, '_blank')
        }, 300)
      }
    } else {
      if (activeChannel === label) {
        setActiveChannel(null)
      }
    }
  }

  return (
    <div className="flex w-full flex-col items-center px-4 py-16">
      <div className="relative w-full max-w-3xl rounded-3xl border-4 border-zinc-700 bg-zinc-800 p-6 shadow-2xl">
        {/* Frame screws */}
        <div className="absolute top-2 left-2">
          <Screw />
        </div>
        <div className="absolute top-2 right-2">
          <Screw />
        </div>
        <div className="absolute bottom-2 left-2">
          <Screw />
        </div>
        <div className="absolute right-2 bottom-2">
          <Screw />
        </div>

        <h3 className="mb-10 text-center font-mono text-xs font-bold tracking-widest text-zinc-400 uppercase">
          MIXER CONNECT CHANNELS
        </h3>

        <div className="grid grid-cols-2 gap-6 pb-6 md:grid-cols-4">
          {channels.map((chan) => {
            return (
              <div
                key={chan.label}
                className="relative flex flex-col items-center gap-6 rounded-xl border border-zinc-900 bg-zinc-950 p-4"
              >
                {/* Active Indicator LED */}
                <div
                  className={`h-2.5 w-2.5 rounded-full border border-black/40 ${activeChannel === chan.label ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-zinc-800'}`}
                />

                {/* Tactile Fader Track */}
                <div className="relative flex h-36 w-8 items-center justify-center rounded-full border border-zinc-800/80 bg-zinc-900 py-4">
                  {/* Slider middle slot */}
                  <div className="absolute top-4 bottom-4 w-1 rounded-full bg-black/60" />

                  {/* Sliding Handle knob */}
                  <motion.div
                    drag="y"
                    dragConstraints={{ top: -110, bottom: 0 }}
                    dragElastic={0}
                    dragMomentum={false}
                    onDrag={(e, info) =>
                      handleDrag(chan.label, info.offset.y, chan.url)
                    } // Local coordinate calculation
                    className="absolute bottom-4 z-10 flex h-8 w-6 cursor-grab flex-col justify-between rounded border-t border-zinc-400 bg-linear-to-b from-zinc-200 to-zinc-400 px-0.5 py-1 shadow-md active:cursor-grabbing active:bg-zinc-300"
                  >
                    <div className="bg-zinc-650 h-0.5 w-full" />
                    <div className="bg-zinc-650 h-0.5 w-full" />
                  </motion.div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                    {chan.label}
                  </span>
                  <span className="text-zinc-650 font-mono text-[8px] uppercase">
                    {chan.desc}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 text-center font-mono text-[9px] tracking-widest text-zinc-500 uppercase">
          DRAG FADER UP TO ACTIVATE CHANNEL LOG & REDIRECT
        </div>
      </div>
    </div>
  )
}
