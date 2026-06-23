'use client'

import React, { useState, useEffect } from 'react'
import { motion, useMotionValue } from 'motion/react'
import { Sliders, PhoneCall, Radio, Send, ArrowRight, Music, Mail, Linkedin, Github, Instagram } from 'lucide-react'
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
    <div className="w-full py-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl rounded-3xl border-4 border-zinc-700 bg-zinc-800 p-6 shadow-2xl relative">
        <h3 className="font-mono text-xs font-bold text-zinc-400 tracking-widest text-center mb-6 uppercase">
          DJ BOOTH COLLABORATION DESK
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Deck: Info */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-5 flex flex-col gap-4 text-left font-mono text-xs">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest border-b border-zinc-855 pb-2">DECK A: TALENT</span>
            <div className="space-y-2 text-zinc-300">
              <div><span className="text-zinc-500 font-bold">ARTIST:</span> Aditya Himawan</div>
              <div><span className="text-zinc-500 font-bold">EMAIL :</span> adityahimaone@gmail.com</div>
              <div><span className="text-zinc-500 font-bold">STATUS:</span> ACCEPTING OFFERS</div>
            </div>
            {/* Spinning Vinyl plate decoration */}
            <div className="flex justify-center py-4">
              <div className="h-28 w-28 rounded-full bg-zinc-900 border-4 border-zinc-800 flex items-center justify-center animate-spin">
                <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700" />
              </div>
            </div>
          </div>

          {/* Right Deck: Contact Form */}
          <div className="bg-zinc-950 border border-zinc-855 rounded-2xl p-5 flex flex-col gap-4 text-left font-mono text-xs">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest border-b border-zinc-855 pb-2">DECK B: YOUR BRIEF</span>
            
            {status === 'submitted' ? (
              <div className="py-10 text-center space-y-2">
                <span className="text-emerald-400 font-bold text-sm block">MESSAGE DISPATCHED!</span>
                <span className="text-zinc-500">Crossfader engaged. We are live.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold">EMAIL:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="you@domain.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold">BRIEF NOTE:</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-100 outline-none focus:border-zinc-700 resize-none"
                    placeholder="Hello Aditya, let's mix a project..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Crossfader control console */}
        {status !== 'submitted' && (
          <div className="mt-8 pt-6 border-t border-zinc-700 flex flex-col items-center gap-3">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">
              DRAG CROSSFADER TO THE RIGHT TO TRANSMIT BRIEF
            </span>

            <div className="relative w-44 h-8 bg-zinc-950 rounded-full flex items-center px-1 shadow-inner border border-zinc-855">
              <div className="absolute inset-0 flex justify-between px-4 items-center text-[9px] text-zinc-650 pointer-events-none">
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
                className="h-6 w-10 rounded-lg bg-zinc-200 border border-zinc-400 cursor-grab active:cursor-grabbing flex items-center justify-center shadow-md relative z-10"
              >
                <div className="h-4 w-0.5 bg-zinc-550" />
              </motion.div>
            </div>

            <div className="text-[9px] font-mono text-amber-500 tracking-wider">
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
    <div className="w-full py-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-md rounded-2xl border-4 border-zinc-950 bg-zinc-900 p-6 shadow-2xl relative text-left">
        
        {/* LCD monitor */}
        <div className="rounded bg-black border border-zinc-800 p-4 text-amber-500 font-mono text-xs mb-6 shadow-inner space-y-1">
          <div className="flex justify-between border-b border-zinc-900 pb-1 text-[8px] text-zinc-500 uppercase tracking-widest font-black">
            <span>TRANSMITTER STATS</span>
            <span className="animate-pulse text-red-500 font-black">LIVE TRANSMIT</span>
          </div>
          <div>FREQ: 88.5 FM // ANTENNA: SAT_LINK</div>
          <div>CALLER STATUS: {submitted ? 'DISPATCHED' : 'WAITING FOR TONE'}</div>
        </div>

        {submitted ? (
          <div className="py-8 text-center font-mono text-xs space-y-2 text-zinc-300">
            <span className="text-amber-500 font-bold text-sm block uppercase tracking-widest">BEEEEP... MESSAGE SENT!</span>
            <span className="text-zinc-500 text-[10px]">Your message is now on the frequency path. Aditya will call you back.</span>
            <button
              onClick={() => { setSubmitted(false); setCallerName(''); setMessage('') }}
              className="mt-4 px-4 py-1.5 rounded bg-zinc-800 text-zinc-400 font-bold hover:bg-zinc-750 uppercase cursor-pointer"
            >
              Reset Transmitter
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs text-zinc-300">
            <div className="space-y-1">
              <label className="text-zinc-500 font-bold uppercase">CALLER ID (NAME):</label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded p-2.5 text-zinc-100 outline-none focus:border-zinc-700"
                placeholder="Caller name..."
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-500 font-bold uppercase">TRANSMIT BRIEF (MESSAGE):</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded p-2.5 text-zinc-100 outline-none focus:border-zinc-700 resize-none"
                placeholder="Leave your message after the tone..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 text-black py-3 rounded font-black tracking-widest hover:brightness-110 active:translate-y-px transition-all uppercase flex items-center justify-center gap-2 cursor-pointer"
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
    { label: 'EMAIL', icon: Mail, url: 'mailto:adityahimaone@gmail.com', desc: 'Direct Inbox' },
    { label: 'LINKEDIN', icon: Linkedin, url: 'https://linkedin.com/in/adityahimaone', desc: 'Professional Mix' },
    { label: 'GITHUB', icon: Github, url: 'https://github.com/adityahimaone', desc: 'Code Output' },
    { label: 'INSTAGRAM', icon: Instagram, url: 'https://instagram.com/adityahimaone', desc: 'Frequency Social' },
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
    <div className="w-full py-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl rounded-3xl border-4 border-zinc-700 bg-zinc-800 p-6 shadow-2xl relative">
        {/* Frame screws */}
        <div className="absolute top-2 left-2"><Screw /></div>
        <div className="absolute top-2 right-2"><Screw /></div>
        <div className="absolute bottom-2 left-2"><Screw /></div>
        <div className="absolute bottom-2 right-2"><Screw /></div>

        <h3 className="font-mono text-xs font-bold text-zinc-400 tracking-widest text-center mb-10 uppercase">
          MIXER CONNECT CHANNELS
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-6">
          {channels.map((chan) => {
            return (
              <div
                key={chan.label}
                className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 flex flex-col items-center gap-6 relative"
              >
                {/* Active Indicator LED */}
                <div
                  className={`h-2.5 w-2.5 rounded-full border border-black/40 ${activeChannel === chan.label ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-zinc-800'}`}
                />

                {/* Tactile Fader Track */}
                <div className="relative h-36 w-8 bg-zinc-900 rounded-full border border-zinc-800/80 flex items-center justify-center py-4">
                  {/* Slider middle slot */}
                  <div className="absolute top-4 bottom-4 w-1 bg-black/60 rounded-full" />
                  
                  {/* Sliding Handle knob */}
                  <motion.div
                    drag="y"
                    dragConstraints={{ top: -110, bottom: 0 }}
                    dragElastic={0}
                    dragMomentum={false}
                    onDrag={(e, info) => handleDrag(chan.label, info.offset.y, chan.url)} // Local coordinate calculation
                    className="absolute bottom-4 h-8 w-6 rounded border-t border-zinc-400 bg-linear-to-b from-zinc-200 to-zinc-400 shadow-md cursor-grab active:cursor-grabbing flex flex-col justify-between py-1 px-0.5 active:bg-zinc-300 z-10"
                  >
                    <div className="h-0.5 w-full bg-zinc-650" />
                    <div className="h-0.5 w-full bg-zinc-650" />
                  </motion.div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono text-[10px] font-black text-zinc-400 uppercase tracking-widest">{chan.label}</span>
                  <span className="text-[8px] text-zinc-650 uppercase font-mono">{chan.desc}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 text-[9px] font-mono text-zinc-500 text-center uppercase tracking-widest">
          DRAG FADER UP TO ACTIVATE CHANNEL LOG & REDIRECT
        </div>
      </div>
    </div>
  )
}
